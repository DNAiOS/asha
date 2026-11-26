export class AshaError extends Error {
  override name = "AshaError";
}

/** The request never produced an HTTP response (DNS, TLS, reset). */
export class APIConnectionError extends AshaError {
  override name = "APIConnectionError";
}

export class APITimeoutError extends APIConnectionError {
  override name = "APITimeoutError";
}

export interface APIErrorFields {
  status: number;
  type?: string | null;
  code?: string | null;
  param?: string | null;
  requestId?: string | null;
  retryAfter?: number | null;
  body?: unknown;
}

/**
 * The API answered with a 4xx or 5xx status. Branch on `code` and `type`:
 * both are stable per cause. `message` is readable text and may change.
 */
export class APIStatusError extends AshaError {
  override name = "APIStatusError";
  readonly status: number;
  readonly type: string | null;
  readonly code: string | null;
  readonly param: string | null;
  readonly requestId: string | null;
  readonly retryAfter: number | null;
  readonly body: unknown;

  constructor(message: string, f: APIErrorFields) {
    super(message);
    this.status = f.status;
    this.type = f.type ?? null;
    this.code = f.code ?? null;
    this.param = f.param ?? null;
    this.requestId = f.requestId ?? null;
    this.retryAfter = f.retryAfter ?? null;
    this.body = f.body;
  }
}

export class BadRequestError extends APIStatusError { override name = "BadRequestError"; }
export class AuthenticationError extends APIStatusError { override name = "AuthenticationError"; }
export class PermissionDeniedError extends APIStatusError { override name = "PermissionDeniedError"; }
export class NotFoundError extends APIStatusError { override name = "NotFoundError"; }
export class ConflictError extends APIStatusError { override name = "ConflictError"; }
export class GoneError extends APIStatusError { override name = "GoneError"; }
export class UnprocessableEntityError extends APIStatusError { override name = "UnprocessableEntityError"; }
export class RateLimitError extends APIStatusError { override name = "RateLimitError"; }
/** HTTP 451: the API does not serve the EU, EEA or UK. */
export class RegionNotSupportedError extends APIStatusError { override name = "RegionNotSupportedError"; }
export class InternalServerError extends APIStatusError { override name = "InternalServerError"; }

const BY_STATUS: Record<number, typeof APIStatusError> = {
  400: BadRequestError,
  401: AuthenticationError,
  403: PermissionDeniedError,
  404: NotFoundError,
  409: ConflictError,
  410: GoneError,
  422: UnprocessableEntityError,
  429: RateLimitError,
  451: RegionNotSupportedError,
};

type HeaderSource = Headers | Record<string, string | null | undefined> | undefined | null;

export function header(h: HeaderSource, name: string): string | null {
  if (!h) return null;
  if (typeof (h as Headers).get === "function") return (h as Headers).get(name);
  const rec = h as Record<string, string | null | undefined>;
  const hit = Object.keys(rec).find((k) => k.toLowerCase() === name.toLowerCase());
  return hit ? (rec[hit] ?? null) : null;
}

export function parseRetryAfter(h: HeaderSource): number | null {
  const v = header(h, "retry-after");
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : null;
}

/** Builds the typed error from the OpenAI, Anthropic or A2A error envelope. */
export function errorFromParts(status: number, body: unknown, headers: HeaderSource): APIStatusError {
  let err: Record<string, unknown> = {};
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (b.error && typeof b.error === "object") err = b.error as Record<string, unknown>;
    else if (typeof b.message === "string" || typeof b.code === "string") err = b;
    else if (typeof b.detail === "string") err = { message: b.detail };
  }
  let retryAfter = parseRetryAfter(headers);
  if (retryAfter == null && typeof err.retry_after === "number") retryAfter = err.retry_after;
  const Cls = BY_STATUS[status] ?? (status >= 500 ? InternalServerError : APIStatusError);
  return new Cls(String(err.message ?? `HTTP ${status}`), {
    status,
    type: (err.type as string) ?? null,
    code: err.code != null ? String(err.code) : null,
    param: (err.param as string) ?? null,
    requestId: (err.request_id as string) ?? header(headers, "x-request-id"),
    retryAfter,
    body,
  });
}

/** Maps an error thrown by the `openai` or `@anthropic-ai/sdk` package onto these types. */
export function fromSdkError(e: unknown): unknown {
  if (e instanceof AshaError) return e;
  const err = e as { status?: unknown; error?: unknown; headers?: HeaderSource; name?: string; message?: string };
  if (typeof err?.status === "number" && err.status >= 400) {
    const raw = err.error;
    const body = raw && typeof raw === "object" && !("error" in (raw as object)) ? { error: raw } : raw;
    return errorFromParts(err.status, body, err.headers);
  }
  const name = err?.name ?? "";
  if (name.includes("Timeout")) return new APITimeoutError(err.message || "timed out");
  if (name.includes("Connection")) return new APIConnectionError(err.message || "connection error");
  return e;
}
