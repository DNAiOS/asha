import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  Asha,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  RegionNotSupportedError,
  detectedIssues,
  idempotencyKey,
  needsEscalation,
} from "../src/index";

const FX = JSON.parse(readFileSync(new URL("../../python/tests/fixtures.json", import.meta.url), "utf8"));
const HEADERS = {
  "x-request-id": "req_test_1",
  "asha-model": "asha-base",
  "asha-snapshot": "asha-base-2026-12-01",
  "x-dnai-intended-user": "sandbox",
  "x-ratelimit-limit": "20",
  "x-ratelimit-remaining": "19",
  "x-ratelimit-reset": "60",
};

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { ...HEADERS, "content-type": "application/json", ...headers } });

const sseResponse = (frames: string[]) =>
  new Response(frames.join(""), { status: 200, headers: { ...HEADERS, "content-type": "text/event-stream" } });

function chatStream() {
  const base = { id: "chatcmpl-1", object: "chat.completion.chunk", created: 1, model: "dnai/asha-base" };
  const chunks = [
    { ...base, choices: [{ index: 0, delta: { role: "assistant", content: "Thiazides " }, finish_reason: null }] },
    { ...base, choices: [{ index: 0, delta: { content: "are first-line [1]." }, finish_reason: null }] },
    { ...base, choices: [{ index: 0, delta: {}, finish_reason: "stop" }], asha: FX.chat.asha },
    { ...base, choices: [], usage: { prompt_tokens: 5, completion_tokens: 7, total_tokens: 12 } },
  ];
  return sseResponse([": phase retrieval_start 10ms\n\n", ...chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`), "data: [DONE]\n\n"]);
}

const message = {
  id: "msg_1", type: "message", role: "assistant", model: "asha-base",
  content: [{ type: "text", text: "Thiazides are first-line [1].", citations: [
    { type: "web_search_result_location", cited_text: "Thiazides", url: null, title: "Hypertension in adults", encrypted_index: "r1" }] }],
  stop_reason: "end_turn", stop_sequence: null, usage: { input_tokens: 5, output_tokens: 7 }, asha: FX.chat.asha,
};

function messageStream() {
  const events: Array<[string, unknown]> = [
    ["message_start", { type: "message_start", message: { ...message, content: [], stop_reason: null, asha: undefined } }],
    ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
    ["ping", { type: "ping" }],
    ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Thiazides are first-line [1]." } }],
    ["content_block_stop", { type: "content_block_stop", index: 0 }],
    ["message_delta", { type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 7 }, asha: FX.chat.asha }],
    ["message_stop", { type: "message_stop" }],
  ];
  return sseResponse(events.map(([n, d]) => `event: ${n}\ndata: ${JSON.stringify(d)}\n\n`));
}

interface Seen { url: URL; method: string; headers: Headers; body: any }

function mock() {
  const seen: Seen[] = [];
  const queue: Response[] = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const req = input instanceof Request ? input : new Request(input, init);
    const url = new URL(req.url);
    const text = req.method === "POST" ? await req.text() : "";
    const body = text ? JSON.parse(text) : undefined;
    seen.push({ url, method: req.method, headers: req.headers, body });
    if (queue.length) return queue.shift()!;
    const p = url.pathname;
    if (p === "/v1/chat/completions") return body?.stream ? chatStream() : json(FX.chat);
    if (p === "/v1/messages") return body?.stream ? messageStream() : json(message);
    const routes: Record<string, unknown> = {
      "/v1/verify": FX.verify, "/v1/clinical/med-check": FX.med_check, "/v1/search": FX.search,
      "/v1/rerank": FX.rerank, "/v1/models": FX.models, "/v1/corpus-state": FX.corpus_state,
    };
    if (p in routes) return json(routes[p]);
    if (p.startsWith("/v1/receipts/")) return json(FX.receipt);
    if (p.startsWith("/v1/models/")) {
      const m = FX.models.data.find((x: { id: string }) => x.id === p.split("/").pop());
      return m ? json(m) : json({ error: { message: "no such model", type: "invalid_request_error", code: "model_not_found" } }, 404);
    }
    return json({ error: { message: "not found", code: "not_found" } }, 404);
  };
  const sleeps: number[] = [];
  const client = new Asha({ apiKey: "dnai_a2a_test", baseURL: "https://mock.askasha.test", fetch });
  client._sleep = async (ms) => { sleeps.push(ms); };
  return { client, seen, queue, sleeps, last: () => seen[seen.length - 1] };
}

const err = (status: number, code: string, retryAfter?: string, anthropic = false) => {
  const inner = { message: `${code} happened`, type: status === 429 ? "rate_limit_error" : "api_error", code };
  return json(anthropic ? { type: "error", error: inner } : { error: inner }, status,
    { "x-request-id": "req_err", ...(retryAfter ? { "retry-after": retryAfter } : {}) });
};

describe("chat", () => {
  it("creates a completion and parses the asha object", async () => {
    const m = mock();
    const out = await m.client.chat.create({
      model: "asha-base",
      messages: [{ role: "user", content: "First-line drug for hypertension?" }],
      metadata: { audience: "clinician", persona: { name: "CareBot" } },
      instructions: "Answer for a primary care physician.",
    });
    const req = m.last();
    expect(req.url.pathname).toBe("/v1/chat/completions");
    expect(req.headers.get("authorization")).toBe("Bearer dnai_a2a_test");
    expect(req.headers.get("idempotency-key")).toBeTruthy();
    expect(req.body.metadata.persona).toEqual({ name: "CareBot" });
    expect(req.body.instructions).toMatch(/^Answer for/);
    expect(out.text).toMatch(/^\*\*Uncomplicated/);
    expect(out.asha?.references[0].marker).toBe("[1]");
    expect(out.asha?.grounding?.corpus_commitment?.algorithm).toBe("sha512");
    expect(needsEscalation(out.asha)).toBe(false);
    expect(out.receiptId).toMatch(/^rcpt_/);
    expect(out.meta).toMatchObject({ requestId: "req_test_1", snapshot: "asha-base-2026-12-01", rateLimit: { remaining: 19 } });
  });

  it("uses a given idempotency key and json_schema", async () => {
    const m = mock();
    const key = idempotencyKey();
    const fmt = { type: "json_schema" as const, json_schema: { name: "x", schema: { type: "object" }, strict: true } };
    await m.client.chat.create({ messages: [{ role: "user", content: "q" }], response_format: fmt }, { idempotencyKey: key });
    expect(m.last().headers.get("idempotency-key")).toBe(key);
    expect(m.last().body.response_format).toEqual(fmt);
    expect(m.last().body.model).toBe("asha");
  });

  it("streams text and surfaces the final asha object", async () => {
    const m = mock();
    const stream = await m.client.chat.stream({ messages: [{ role: "user", content: "q" }] });
    const parts: string[] = [];
    for await (const t of stream) parts.push(t);
    expect(parts).toEqual(["Thiazides ", "are first-line [1]."]);
    expect(stream.finishReason).toBe("stop");
    expect(stream.asha?.receipt_id).toBeTruthy();
    expect(stream.usage?.total_tokens).toBe(12);
    expect(m.last().body).toMatchObject({ stream: true, stream_options: { include_usage: true } });
  });

  it("retries 429 with Retry-After using the same idempotency key", async () => {
    const m = mock();
    m.queue.push(err(429, "rate_limited", "2"));
    const out = await m.client.chat.create({ messages: [{ role: "user", content: "q" }] });
    expect(out.asha).not.toBeNull();
    const posts = m.seen.filter((s) => s.method === "POST");
    expect(posts).toHaveLength(2);
    expect(posts[0].headers.get("idempotency-key")).toBe(posts[1].headers.get("idempotency-key"));
    expect(m.sleeps).toEqual([2000]);
  });

  it("maps errors to typed classes", async () => {
    const m = mock();
    m.queue.push(err(401, "invalid_api_key"));
    const e = await m.client.chat.create({ messages: [{ role: "user", content: "q" }] }).catch((x) => x);
    expect(e).toBeInstanceOf(AuthenticationError);
    expect(e.code).toBe("invalid_api_key");
    expect(e.requestId).toBe("req_err");
  });
});

describe("messages", () => {
  it("creates a message over the Anthropic wire", async () => {
    const m = mock();
    const out = await m.client.messages.create({ messages: [{ role: "user", content: "q" }], system: "Be brief." });
    expect(m.last().url.pathname).toBe("/v1/messages");
    const h = m.last().headers;
    expect(h.get("x-api-key") ?? h.get("authorization")?.replace(/^Bearer /, "")).toBe("dnai_a2a_test");
    expect(m.last().headers.get("idempotency-key")).toBeTruthy();
    expect(out.text).toBe("Thiazides are first-line [1].");
    expect(out.asha?.references.length).toBeGreaterThan(0);
  });

  it("streams and reads asha from message_delta", async () => {
    const m = mock();
    const s = await (await m.client.messages.stream({ messages: [{ role: "user", content: "q" }] })).finalize();
    expect(s.text).toBe("Thiazides are first-line [1].");
    expect(s.stopReason).toBe("end_turn");
    expect(s.asha?.safety).toBeTruthy();
  });

  it("maps 451 to RegionNotSupportedError", async () => {
    const m = mock();
    m.queue.push(err(451, "region_not_supported", undefined, true));
    const e = await m.client.messages.create({ messages: [{ role: "user", content: "q" }] }).catch((x) => x);
    expect(e).toBeInstanceOf(RegionNotSupportedError);
    expect(e.code).toBe("region_not_supported");
  });
});

describe("tools", () => {
  it("verify", async () => {
    const m = mock();
    const v = await m.client.verify("Metformin is first-line therapy for most adults with type 2 diabetes.", { top_k: 3 });
    expect(m.last().body).toEqual({ claim: "Metformin is first-line therapy for most adults with type 2 diabetes.", top_k: 3 });
    expect(m.last().headers.get("idempotency-key")).toBeTruthy();
    expect(v.verdict).toBe("supported");
    expect(v.caveat).toMatch(/weaker than true/);
    expect(v.evidence_counts?.for).toBe(1);
    expect(v.meta.requestId).toBe("req_test_1");
  });

  it("med-check with FHIR output", async () => {
    const m = mock();
    const mc = await m.client.clinical.medCheck([{ name: "warfarin", dose: "5 mg" }, "fluconazole"], { age: 67, format: "fhir" });
    expect(m.last().body).toEqual({ medications: [{ name: "warfarin", dose: "5 mg" }, "fluconazole"], age: 67, format: "fhir" });
    expect(mc.interactions[0].severity).toBe("major");
    expect(mc.unchecked.length).toBeGreaterThan(0);
    expect(detectedIssues(mc)[0].resourceType).toBe("DetectedIssue");
  });

  it("search, rerank, receipts, models, corpus state", async () => {
    const m = mock();
    const s = await m.client.search("anticoagulation in AF with CKD", { top_k: 2, filters: { year_from: 2020 } });
    expect(m.last().body.filters).toEqual({ year_from: 2020 });
    expect(s.data[0].locator?.pmid).toBeTruthy();
    const r = await m.client.rerank("first-line therapy", s.data.map((h) => h.snippet ?? ""), { top_n: 1 });
    expect(r.results[0].relevance_score).toBeGreaterThan(r.results[1].relevance_score);
    const rc = await m.client.receipts.get("rcpt_abc");
    expect(m.last().url.pathname).toBe("/v1/receipts/rcpt_abc");
    expect(rc.answer_sha256).toBeTruthy();
    const models = await m.client.models.list({ includeAll: true });
    expect(m.last().url.searchParams.get("include")).toBe("all");
    expect(models.map((x) => x.id)).toEqual(expect.arrayContaining(["asha", "asha-base", "asha-verify", "asha-med-check"]));
    expect((await m.client.models.retrieve("asha-base")).class).toBe("grounded_answer");
    await expect(m.client.models.retrieve("asha-nope")).rejects.toBeInstanceOf(NotFoundError);
    expect((await m.client.corpusState()).algorithm).toBe("sha512");
  });

  it("honors Retry-After and keeps one idempotency key across retries", async () => {
    const m = mock();
    m.queue.push(err(429, "rate_limited", "3"), err(503, "verification_unavailable", "1"));
    const v = await m.client.verify("claim");
    expect(v.verdict).toBe("supported");
    const posts = m.seen.filter((s) => s.method === "POST");
    expect(posts).toHaveLength(3);
    expect(new Set(posts.map((p) => p.headers.get("idempotency-key"))).size).toBe(1);
    expect(m.sleeps).toEqual([3000, 1000]);
  });

  it("does not retry an allowance error with a long Retry-After", async () => {
    const m = mock();
    m.queue.push(err(429, "daily_quota_exceeded", "40000"));
    const e = await m.client.search("q").catch((x) => x);
    expect(e).toBeInstanceOf(RateLimitError);
    expect(e.retryAfter).toBe(40000);
    expect(m.seen).toHaveLength(1);
  });

  it("requires a key", () => {
    const saved = { a: process.env.ASHA_API_KEY, d: process.env.DNAI_API_KEY };
    delete process.env.ASHA_API_KEY;
    delete process.env.DNAI_API_KEY;
    expect(() => new Asha()).toThrow(/ASHA_API_KEY/);
    if (saved.a) process.env.ASHA_API_KEY = saved.a;
    if (saved.d) process.env.DNAI_API_KEY = saved.d;
  });
});
