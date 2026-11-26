# askasha (TypeScript)

TypeScript client for the [Asha API](https://askasha.org/developers), made by DNAi Systems. Cited medical answers on the OpenAI and Anthropic wire formats, plus typed calls for claim checks, medication checks, evidence search, rerank, receipts and the model catalog. ESM and CommonJS, Node 18+.

```bash
npm install askasha
```

Get a free key at [askasha.org/developers](https://askasha.org/developers) and export it as `ASHA_API_KEY`. Keep the key on your server: the API refuses cross-origin browser calls.

## Quickstart

```ts
import { Asha, needsEscalation } from "askasha";

const asha = new Asha(); // reads ASHA_API_KEY; baseURL defaults to https://api.askasha.org

const answer = await asha.chat.create({
  model: "asha-base",
  messages: [{ role: "user", content: "What is first-line drug therapy for uncomplicated hypertension?" }],
  metadata: { audience: "clinician" },
});
console.log(answer.text);
for (const ref of answer.asha?.references ?? []) console.log(ref.marker, ref.type, ref.display);
if (needsEscalation(answer.asha)) console.log(answer.asha?.safety?.escalation?.message);
console.log(answer.receiptId, answer.meta.requestId, answer.meta.rateLimit.remaining);
```

`asha.chat` runs on the official `openai` package (`asha.openai` is the configured client) and `asha.messages` on `@anthropic-ai/sdk` (`asha.anthropic`). `answer.completion` and `answer.message` are the untouched SDK objects.

## Surface

| Call | Endpoint | Returns |
|---|---|---|
| `asha.chat.create(params, { idempotencyKey })` | `POST /v1/chat/completions` | `{ completion, asha, meta, text, receiptId }` |
| `asha.chat.stream(params)` | same, `stream: true` | `ChatStream`: `for await` text; `.asha`, `.usage`, `.text` at the end |
| `asha.messages.create(params)` / `.stream(params)` | `POST /v1/messages` | `{ message, asha, meta, text, receiptId }` / `MessageStream` |
| `asha.verify(claim, { context, domain, top_k })` | `POST /v1/verify` | `Verification` |
| `asha.clinical.medCheck(medications, { age, egfr, allergies, pregnancy, format })` | `POST /v1/clinical/med-check` | `MedCheck` (`detectedIssues(mc)` for FHIR) |
| `asha.search(query, { top_k, filters })` | `POST /v1/search` | `SearchResults` |
| `asha.rerank(query, documents, { top_n, return_documents })` | `POST /v1/rerank` | `Rerank` |
| `asha.receipts.get(id)` | `GET /v1/receipts/{id}` | `Receipt` |
| `asha.models.list({ includeAll })`, `asha.models.retrieve(id)` | `GET /v1/models` | `Model[]`, `Model` |
| `asha.corpusState()` | `GET /v1/corpus-state` | `CorpusCommitment` |

Request types for the tools are generated from the OpenAPI document with `openapi-typescript` (`npm run gen:types`). Response types are written from the live shapes; fields without an engine signal are `null`, and new fields can appear.

## Reading results honestly

- `verify`: `supported` means the corpus did not refute the claim, which is weaker than true. Show `caveat` and `scope` with the verdict; `insufficient_evidence` means not checked.
- `medCheck`: an empty result means no findings in the rules checked. `unchecked` lists what the rule table could not run. Consumer audiences get a `next_step` that routes to the prescriber or pharmacist.

## Streaming

```ts
const stream = await asha.chat.stream({ messages: [{ role: "user", content: "Red flags for a headache?" }] });
for await (const text of stream) process.stdout.write(text);
console.log("\n", stream.asha?.references.map((r) => r.display), stream.asha?.receipt_id);
```

## Retries and idempotency

Every POST carries an `Idempotency-Key` (a UUID v4 per call unless you pass `{ idempotencyKey }`), reused across retries. The client retries connection errors, 408, 502, 503 and 504, and 409/429 responses whose `Retry-After` is at most `maxRetryWait` seconds (default 60), waiting exactly `Retry-After`. Allowance errors (`daily_quota_exceeded`) raise at once with `retryAfter` set.

Errors: `AuthenticationError`, `PermissionDeniedError`, `NotFoundError`, `ConflictError`, `GoneError`, `UnprocessableEntityError`, `RateLimitError`, `RegionNotSupportedError` (451: EU, EEA and UK are not served), `InternalServerError`. Each has `status`, `type`, `code`, `message`, `requestId`, `retryAfter`.

## Data you may send

PHI mode is closed: send de-identified or synthetic data only. Sandbox keys get 422 `phi_not_allowed` when identifiers are detected.

## Develop

```bash
npm install
npm run gen:types   # regenerate src/openapi.d.ts from https://api.askasha.org/openapi.json (JSDoc stripped)
npm run typecheck && npm test && npm run build
```

Apache-2.0. Source: [github.com/DNAiOS/asha](https://github.com/DNAiOS/asha/tree/main/sdk/typescript).
