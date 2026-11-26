import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import type { Message, MessageCreateParamsNonStreaming, RawMessageStreamEvent } from "@anthropic-ai/sdk/resources/messages";

import {
  APIConnectionError,
  APIStatusError,
  APITimeoutError,
  AshaError,
  errorFromParts,
  fromSdkError,
  header,
} from "./errors";
import type {
  AshaAnswer,
  CorpusCommitment,
  MedCheck,
  MedCheckParams,
  Model,
  Receipt,
  Rerank,
  RerankParams,
  ResponseMeta,
  SearchParams,
  SearchResults,
  Verification,
  VerifyParams,
} from "./types";

export const VERSION = "0.1.0";
export const DEFAULT_BASE_URL = "https://api.askasha.org";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface AshaOptions {
  /** Defaults to `process.env.ASHA_API_KEY`. */
  apiKey?: string;
  /** Defaults to `process.env.ASHA_BASE_URL` or `https://api.askasha.org`. */
  baseURL?: string;
  /** Per-request timeout in milliseconds. Default 300000. */
  timeout?: number;
  /** Retries after the first attempt. Default 2. */
  maxRetries?: number;
  /** Longest `Retry-After` (seconds) the client waits out on 409/429/503. Default 60. */
  maxRetryWait?: number;
  /** Send a fresh Idempotency-Key on every POST unless one is given. Default true. */
  autoIdempotency?: boolean;
  defaultHeaders?: Record<string, string>;
  /** Custom fetch, shared by the typed calls and the wrapped `openai` and `anthropic` clients. */
  fetch?: FetchLike;
}

export interface RequestOptions {
  /** Reused across retries so a retry never runs or bills twice. */
  idempotencyKey?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** A fresh Idempotency-Key (UUID v4). Never put personal data in a key. */
export function idempotencyKey(): string {
  return globalThis.crypto.randomUUID();
}

function env(name: string): string | undefined {
  const p = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return p?.env?.[name];
}

export function metaFromHeaders(h: Headers | null | undefined): ResponseMeta {
  const int = (n: string) => {
    const v = header(h, n);
    const x = v == null ? NaN : Number.parseInt(v, 10);
    return Number.isFinite(x) ? x : null;
  };
  return {
    requestId: header(h, "x-request-id"),
    model: header(h, "asha-model"),
    snapshot: header(h, "asha-snapshot"),
    intendedUser: header(h, "x-dnai-intended-user"),
    idempotentReplayed: (header(h, "idempotent-replayed") ?? "").toLowerCase() === "true",
    rateLimit: { limit: int("x-ratelimit-limit"), remaining: int("x-ratelimit-remaining"), reset: int("x-ratelimit-reset") },
  };
}

function ashaOf(obj: unknown): AshaAnswer | null {
  const a = (obj as { asha?: unknown } | null)?.asha;
  return a && typeof a === "object" ? (a as AshaAnswer) : null;
}

/** True when the answer carries an emergency flag or an escalation level other than `none`. */
export function needsEscalation(asha: AshaAnswer | null | undefined): boolean {
  const s = asha?.safety;
  if (!s) return false;
  return Boolean(s.emergency) || (s.escalation?.level ?? "none") !== "none";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Client for the Asha API.
 *
 * `chat` speaks the OpenAI wire through the official `openai` package and
 * `messages` the Anthropic wire through `@anthropic-ai/sdk`; both return the
 * `asha` object. `verify`, `clinical.medCheck`, `search`, `rerank`,
 * `receipts` and `models` are typed calls.
 *
 * Retries: connection errors, 408, 502, 503, 504, and 409/429 responses with
 * `Retry-After` at most `maxRetryWait` seconds, waiting `Retry-After` when sent.
 */
export class Asha {
  readonly apiKey: string;
  readonly baseURL: string;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly maxRetryWait: number;
  readonly autoIdempotency: boolean;
  private readonly defaultHeaders: Record<string, string>;
  private readonly fetchImpl: FetchLike;
  private _openai?: OpenAI;
  private _anthropic?: Anthropic;
  /** @internal replaced in tests */
  _sleep: (ms: number) => Promise<unknown> = sleep;

  readonly chat: Chat;
  readonly messages: Messages;
  readonly clinical: Clinical;
  readonly receipts: Receipts;
  readonly models: Models;

  constructor(opts: AshaOptions = {}) {
    const key = opts.apiKey ?? env("ASHA_API_KEY") ?? env("DNAI_API_KEY");
    if (!key) throw new AshaError("No API key: pass apiKey or set ASHA_API_KEY. Free key: https://askasha.org/developers");
    this.apiKey = key;
    this.baseURL = (opts.baseURL ?? env("ASHA_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeout = opts.timeout ?? 300_000;
    this.maxRetries = Math.max(0, opts.maxRetries ?? 2);
    this.maxRetryWait = opts.maxRetryWait ?? 60;
    this.autoIdempotency = opts.autoIdempotency ?? true;
    this.defaultHeaders = { "User-Agent": `askasha-typescript/${VERSION}`, ...(opts.defaultHeaders ?? {}) };
    this.fetchImpl = opts.fetch ?? ((input, init) => globalThis.fetch(input, init));
    this.chat = new Chat(this);
    this.messages = new Messages(this);
    this.clinical = new Clinical(this);
    this.receipts = new Receipts(this);
    this.models = new Models(this);
  }

  /** An `openai` client pointed at `{baseURL}/v1` with this key. */
  get openai(): OpenAI {
    this._openai ??= new OpenAI({
      apiKey: this.apiKey,
      baseURL: `${this.baseURL}/v1`,
      timeout: this.timeout,
      maxRetries: 0,
      defaultHeaders: this.defaultHeaders,
      fetch: this.fetchImpl,
    });
    return this._openai;
  }

  /** An `@anthropic-ai/sdk` client pointed at `baseURL` with this key. */
  get anthropic(): Anthropic {
    this._anthropic ??= new Anthropic({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      timeout: this.timeout,
      maxRetries: 0,
      defaultHeaders: this.defaultHeaders,
      fetch: this.fetchImpl,
    });
    return this._anthropic;
  }

  /** @internal */
  idem(key?: string): string | undefined {
    return key ?? (this.autoIdempotency ? idempotencyKey() : undefined);
  }

  private retryDelayMs(err: unknown, attempt: number): number | null {
    if (attempt >= this.maxRetries) return null;
    const backoff = Math.min(8, 0.5 * 2 ** attempt) * (0.75 + Math.random() * 0.5) * 1000;
    if (err instanceof APIConnectionError) return backoff;
    if (!(err instanceof APIStatusError)) return null;
    if (err.retryAfter != null) {
      return [409, 429, 503].includes(err.status) && err.retryAfter <= this.maxRetryWait ? err.retryAfter * 1000 : null;
    }
    return [408, 502, 503, 504].includes(err.status) ? backoff : null;
  }

  /** @internal */
  async withRetries<T>(fn: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fn();
      } catch (e) {
        const err = fromSdkError(e);
        const wait = this.retryDelayMs(err, attempt);
        if (wait == null) throw err;
        await this._sleep(wait);
      }
    }
  }

  /** @internal */
  async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
    opts: RequestOptions & { query?: Record<string, string> } = {},
  ): Promise<{ data: T; meta: ResponseMeta }> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      ...(opts.headers ?? {}),
    };
    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      const key = this.idem(opts.idempotencyKey);
      if (key) headers["Idempotency-Key"] = key;
    }
    const url = new URL(`${this.baseURL}${path}`);
    for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, v);

    return this.withRetries(async () => {
      const timeout = AbortSignal.timeout(this.timeout);
      const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;
      let res: Response;
      try {
        res = await this.fetchImpl(url.toString(), {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
          signal,
        });
      } catch (e) {
        if (timeout.aborted) throw new APITimeoutError("timed out");
        if (opts.signal?.aborted) throw e;
        throw new APIConnectionError((e as Error)?.message || "connection error");
      }
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* non-JSON bodies are reported below */
      }
      if (res.status >= 400) throw errorFromParts(res.status, parsed, res.headers);
      if (typeof parsed !== "object" || parsed === null) {
        throw new APIStatusError("Response was not JSON", { status: res.status, body: text, requestId: res.headers.get("x-request-id") });
      }
      return { data: parsed as T, meta: metaFromHeaders(res.headers) };
    });
  }

  /** `POST /v1/verify`: try to refute one claim against the committed corpus. */
  async verify(claim: string, params: Omit<VerifyParams, "claim"> = {}, opts?: RequestOptions): Promise<Verification> {
    const { data, meta } = await this.request<Omit<Verification, "meta">>("POST", "/v1/verify", { claim, ...params }, opts);
    return { ...data, meta };
  }

  /** `POST /v1/search`: ranked, typed evidence passages from the committed corpus. */
  async search(query: string, params: Omit<SearchParams, "query"> = {}, opts?: RequestOptions): Promise<SearchResults> {
    const { data, meta } = await this.request<Omit<SearchResults, "meta">>("POST", "/v1/search", { query, ...params }, opts);
    return { ...data, meta };
  }

  /** `POST /v1/rerank`: cross-encoder relevance scores for up to 1,000 documents. */
  async rerank(
    query: string,
    documents: RerankParams["documents"],
    params: Omit<RerankParams, "query" | "documents"> = {},
    opts?: RequestOptions,
  ): Promise<Rerank> {
    const { data, meta } = await this.request<Omit<Rerank, "meta">>("POST", "/v1/rerank", { query, documents, ...params }, opts);
    return { ...data, meta };
  }

  /** `GET /v1/corpus-state`: the commitment answers cite in `grounding.corpus_commitment`. */
  async corpusState(): Promise<CorpusCommitment> {
    return (await this.request<CorpusCommitment>("GET", "/v1/corpus-state")).data;
  }
}

// ---------------------------------------------------------------- chat (OpenAI wire)

export type ChatParams = Omit<ChatCompletionCreateParamsNonStreaming, "model" | "metadata" | "stream"> & {
  model?: string;
  /** Asha options: session_id, audience, persona, verbosity, emoji, memory. */
  metadata?: Record<string, unknown>;
  /** Developer instructions, applied as caller context below Asha's safety layer. */
  instructions?: string;
};

export interface ChatResponse {
  completion: ChatCompletion;
  asha: AshaAnswer | null;
  meta: ResponseMeta;
  text: string;
  receiptId: string | null;
}

/** Async-iterate for text deltas; `asha`, `usage` and `text` are set when the stream ends. */
export class ChatStream implements AsyncIterable<string> {
  text = "";
  asha: AshaAnswer | null = null;
  usage: ChatCompletionChunk["usage"] | null = null;
  id: string | null = null;
  finishReason: string | null = null;
  private done = false;

  constructor(private readonly stream: AsyncIterable<ChatCompletionChunk> & { controller?: AbortController }, readonly meta: ResponseMeta) {}

  async *[Symbol.asyncIterator](): AsyncIterator<string> {
    if (this.done) return;
    for await (const chunk of this.stream) {
      this.id ??= chunk.id;
      const a = ashaOf(chunk);
      if (a) this.asha = a;
      if (chunk.usage) this.usage = chunk.usage;
      for (const choice of chunk.choices ?? []) {
        if (choice.finish_reason) this.finishReason = choice.finish_reason;
        const delta = choice.delta?.content;
        if (delta) {
          this.text += delta;
          yield delta;
        }
      }
    }
    this.done = true;
  }

  /** Reads the stream to the end and returns this object. */
  async finalize(): Promise<this> {
    for await (const _ of this) void _;
    return this;
  }

  abort(): void {
    this.stream.controller?.abort();
  }
}

function chatBody(params: ChatParams): Record<string, unknown> {
  const { model = "asha", ...rest } = params;
  return { model, ...rest };
}

export class Chat {
  constructor(private readonly client: Asha) {}

  private reqOpts(opts?: RequestOptions) {
    const headers: Record<string, string> = { ...(opts?.headers ?? {}) };
    const key = this.client.idem(opts?.idempotencyKey);
    if (key) headers["Idempotency-Key"] = key;
    return { headers, signal: opts?.signal };
  }

  /** `POST /v1/chat/completions` (non-streaming). */
  async create(params: ChatParams, opts?: RequestOptions): Promise<ChatResponse> {
    const o = this.reqOpts(opts);
    const body = chatBody(params) as unknown as ChatCompletionCreateParamsNonStreaming;
    const { data, response } = await this.client.withRetries(() =>
      this.client.openai.chat.completions.create(body, o).withResponse(),
    );
    const asha = ashaOf(data);
    return {
      completion: data,
      asha,
      meta: metaFromHeaders(response.headers),
      text: data.choices?.[0]?.message?.content ?? "",
      receiptId: asha?.receipt_id ?? null,
    };
  }

  /** `POST /v1/chat/completions` with `stream: true`; the final chunk's `asha` object lands on `.asha`. */
  async stream(params: ChatParams & { includeUsage?: boolean }, opts?: RequestOptions): Promise<ChatStream> {
    const { includeUsage = true, ...rest } = params;
    const o = this.reqOpts(opts);
    const body = {
      ...chatBody(rest),
      stream: true as const,
      ...(includeUsage ? { stream_options: { include_usage: true } } : {}),
    } as unknown as Parameters<OpenAI["chat"]["completions"]["create"]>[0] & { stream: true };
    const { data, response } = await this.client.withRetries(() =>
      this.client.openai.chat.completions.create(body, o).withResponse(),
    );
    return new ChatStream(data as unknown as AsyncIterable<ChatCompletionChunk>, metaFromHeaders(response.headers));
  }
}

// ---------------------------------------------------------------- messages (Anthropic wire)

export type MessageParams = Omit<MessageCreateParamsNonStreaming, "model" | "max_tokens" | "metadata" | "stream"> & {
  model?: string;
  /** Accepted and ignored by Asha. Default 1024. */
  max_tokens?: number;
  /** `user_id` plus Asha options (audience, session_id, memory, verbosity, persona). */
  metadata?: Record<string, unknown>;
};

export interface MessageResponse {
  message: Message;
  asha: AshaAnswer | null;
  meta: ResponseMeta;
  text: string;
  receiptId: string | null;
}

/** Async-iterate for text deltas; `message_delta` delivers `asha` and `usage`. */
export class MessageStream implements AsyncIterable<string> {
  text = "";
  asha: AshaAnswer | null = null;
  usage: unknown = null;
  id: string | null = null;
  stopReason: string | null = null;
  citations: unknown[] = [];
  private done = false;

  constructor(private readonly stream: AsyncIterable<RawMessageStreamEvent> & { controller?: AbortController }, readonly meta: ResponseMeta) {}

  async *[Symbol.asyncIterator](): AsyncIterator<string> {
    if (this.done) return;
    for await (const event of this.stream) {
      if (event.type === "message_start") this.id = event.message.id;
      else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          this.text += event.delta.text;
          yield event.delta.text;
        } else if (event.delta.type === "citations_delta") this.citations.push(event.delta.citation);
      } else if (event.type === "message_delta") {
        const a = ashaOf(event);
        if (a) this.asha = a;
        this.usage = event.usage;
        this.stopReason = event.delta.stop_reason ?? null;
      }
    }
    this.done = true;
  }

  async finalize(): Promise<this> {
    for await (const _ of this) void _;
    return this;
  }

  abort(): void {
    this.stream.controller?.abort();
  }
}

function messageBody(params: MessageParams): Record<string, unknown> {
  const { model = "asha", max_tokens = 1024, ...rest } = params;
  return { model, max_tokens, ...rest };
}

export class Messages {
  constructor(private readonly client: Asha) {}

  private reqOpts(opts?: RequestOptions) {
    const headers: Record<string, string> = { ...(opts?.headers ?? {}) };
    const key = this.client.idem(opts?.idempotencyKey);
    if (key) headers["Idempotency-Key"] = key;
    return { headers, signal: opts?.signal };
  }

  /** `POST /v1/messages` (non-streaming). */
  async create(params: MessageParams, opts?: RequestOptions): Promise<MessageResponse> {
    const o = this.reqOpts(opts);
    const body = messageBody(params) as unknown as MessageCreateParamsNonStreaming;
    const { data, response } = await this.client.withRetries(() =>
      this.client.anthropic.messages.create(body, o).withResponse(),
    );
    const asha = ashaOf(data);
    const text = data.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    return { message: data, asha, meta: metaFromHeaders(response.headers), text, receiptId: asha?.receipt_id ?? null };
  }

  /** `POST /v1/messages` with `stream: true`. */
  async stream(params: MessageParams, opts?: RequestOptions): Promise<MessageStream> {
    const o = this.reqOpts(opts);
    const body = { ...messageBody(params), stream: true as const } as unknown as Parameters<Anthropic["messages"]["create"]>[0] & {
      stream: true;
    };
    const { data, response } = await this.client.withRetries(() =>
      this.client.anthropic.messages.create(body, o).withResponse(),
    );
    return new MessageStream(data as unknown as AsyncIterable<RawMessageStreamEvent>, metaFromHeaders(response.headers));
  }
}

// ---------------------------------------------------------------- namespaces

export class Clinical {
  constructor(private readonly client: Asha) {}

  /** `POST /v1/clinical/med-check`: deterministic screen; `format: "fhir"` adds DetectedIssue resources. */
  async medCheck(
    medications: MedCheckParams["medications"],
    params: Omit<MedCheckParams, "medications"> = {},
    opts?: RequestOptions,
  ): Promise<MedCheck> {
    const { data, meta } = await this.client.request<Omit<MedCheck, "meta">>(
      "POST", "/v1/clinical/med-check", { medications, ...params }, opts,
    );
    return { ...data, meta };
  }
}

export class Receipts {
  constructor(private readonly client: Asha) {}

  /** `GET /v1/receipts/{id}`: readable only with the key that received the answer. */
  async get(receiptId: string): Promise<Receipt> {
    const { data, meta } = await this.client.request<Omit<Receipt, "meta">>("GET", `/v1/receipts/${encodeURIComponent(receiptId)}`);
    return { ...data, meta };
  }
}

export class Models {
  constructor(private readonly client: Asha) {}

  /** `GET /v1/models`. `includeAll` also lists planned and blocked models with the reason. */
  async list(opts: { includeAll?: boolean } = {}): Promise<Model[]> {
    const { data } = await this.client.request<{ data: Model[] }>("GET", "/v1/models", undefined, {
      query: opts.includeAll ? { include: "all" } : undefined,
    });
    return data.data ?? [];
  }

  async retrieve(modelId: string): Promise<Model> {
    return (await this.client.request<Model>("GET", `/v1/models/${encodeURIComponent(modelId)}`)).data;
  }
}

/** Lists the FHIR R4 DetectedIssue resources from a med-check run with `format: "fhir"`. */
export function detectedIssues(mc: MedCheck) {
  return (mc.fhir?.entry ?? []).map((e) => e.resource);
}
