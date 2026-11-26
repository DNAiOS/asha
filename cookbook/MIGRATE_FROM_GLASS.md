# Migrate from Glass

A field-by-field map from the Glass Health developer API to the Asha API. Glass fields are as glass.health documented them when we captured its developer pages on 2026-09-12; check their current docs before you rely on a row. A runnable translation is in [`09_migrate_from_glass.py`](09_migrate_from_glass.py).

Asha has no Glass-path shim today. The shortest path is the Anthropic wire (`/v1/messages`), whose request shape is closest to Glass's `messages` endpoint; the OpenAI wire (`/v1/chat/completions`) works the same way.

## Connection

| Glass | Asha |
|---|---|
| `POST https://glass.health/api/external/v2/messages` | `POST https://api.askasha.org/v1/messages` (Anthropic wire) or `POST https://api.askasha.org/v1/chat/completions` (OpenAI wire) |
| `X-Api-Key: sk-gla-api01-...` | `x-api-key: dnai_a2a_...` or `Authorization: Bearer dnai_a2a_...` |
| Key from a sales or settings page | Free key from `POST /api/a2a/signup` or [askasha.org/developers](https://askasha.org/developers) |

## Request

| Glass | Asha | Notes |
|---|---|---|
| `messages: [{role, content}]` | `messages: [{role, content}]` | The last message must be a user turn. |
| `version: "5.5-2026-03-31"` | `model: "asha-base-2026-12-01"` (dated snapshot) or `"asha-base"` (floating) | `GET /v1/models` lists ids, snapshots, plans and intended users. |
| `stream: true` | `stream: true` | Anthropic or OpenAI SSE events; the final event carries the `asha` object. |
| `metadata: {...}` | `metadata: {audience, session_id, verbosity, persona, memory}` | `audience`: `patient`, `caregiver`, `clinician`, `nurse`, `pharmacist`, `physician`. |
| Documentation templates (SOAP, A&P, HPI, ...) | `system` (Anthropic) or `instructions` (OpenAI), up to 50,000 characters | Applied as caller context below Asha's safety layer. See [`02_clinician_ap_template.py`](02_clinician_ap_template.py). |
| `json_object` output | `response_format: {type: "json_schema", json_schema: {name, schema, strict}}` on `/v1/chat/completions` | Validated server-side; one repair pass, else 422 `schema_unsatisfied` with the raw text. |
| (none) | `Idempotency-Key` header | Same key and body within 24 h replays the stored response and is not billed again. |

## Response

| Glass | Asha | Notes |
|---|---|---|
| `id` | `id` (`msg_...` or `chatcmpl-...`) | |
| `text` with inline citation markers | `content[0].text` or `choices[0].message.content`, with `[n]` markers | `asha.references[n-1]` is the source behind `[n]`. |
| `references[]` (literature, guidelines, FDA labels) | `asha.references[]`: `id`, `marker`, `n`, `type` (`literature`, `drug_label`, `guideline`, `corpus`), `title`, `display`, `locator` {`pmid`, `doi`, `pmcid`, `url`, `page`}, `retrieved_at` | On `/v1/messages` they also ride `content[].citations` as `web_search_result_location` (`encrypted_index` is the Asha reference id). |
| `progress` events (`retrievalQueryGeneration`, `retrieval`, ...) | SSE comment lines `: phase <name> <ms>` | SDK parsers skip comments; read them from the raw stream if you show progress. |
| `usage {inputTokens, outputTokens}` | `usage {input_tokens, output_tokens}` and `asha.usage` (`tier_requested`, `tier_served`, `estimated`) | |
| (none) | `asha.safety`: `emergency`, `escalation` {`level`, `message`, `action`, `timeframe`}, `refusal`, `insufficient_evidence`, `requires_clinician_review`, `audience_served` | Show `escalation.message` above the answer when `level` is not `none`. |
| (none) | `asha.grounding`: `evidence_count`, `cited_count`, `coverage`, `corpus_commitment` {`hash`, `algorithm`, `as_of`, `verify_url`} | The commitment is public at `GET /v1/corpus-state`. |
| (none) | `asha.basis`: `inputs`, `missing_data`, `limitations`, `model` {`id`, `snapshot`, `depth_served`} | |
| (none) | `asha.receipt` {`id`, `answer_sha256`, `url`} | `GET /v1/receipts/{id}` with the same key. |

## Errors

| Glass | Asha |
|---|---|
| HTTP status with a message | `/v1/messages`: `{type: "error", error: {type, message, code}}`; `/v1/chat/completions`: `{error: {message, type, code}}`. Branch on `code`. 429 and retryable 503 send `Retry-After`. 451 `region_not_supported` for the EU, EEA and UK. |

## Data

PHI mode is closed on the Asha API: send de-identified or synthetic data only. Sandbox keys get 422 `phi_not_allowed` when identifiers are detected. The BAA is self-serve and versioned (`GET /api/a2a/baa`); its text is a draft pending counsel review.
