# askasha (Python)

Python client for the [Asha API](https://askasha.org/developers), made by DNAi Systems. Cited medical answers on the OpenAI and Anthropic wire formats, plus typed calls for claim checks, medication checks, evidence search, rerank, receipts and the model catalog.

```bash
pip install askasha                 # chat, tools, receipts, models
pip install "askasha[anthropic]"    # adds client.messages (Anthropic wire)
```

Get a free key at [askasha.org/developers](https://askasha.org/developers) and export it as `ASHA_API_KEY`.

## Quickstart

```python
from askasha import Asha

client = Asha()  # reads ASHA_API_KEY; base_url defaults to https://api.askasha.org

answer = client.chat.create(
    model="asha-base",
    messages=[{"role": "user", "content": "What is first-line drug therapy for uncomplicated hypertension?"}],
    metadata={"audience": "clinician"},
)
print(answer.text)
for ref in answer.asha.references:          # 1:1 with the [n] markers in the text
    print(ref.marker, ref.type, ref.display, ref.locator.pmid if ref.locator else None)

safety = answer.asha.safety
if safety.needs_escalation:                 # emergency flag or escalation level other than "none"
    print(safety.escalation.message)

print(answer.receipt_id, answer.meta.request_id, answer.meta.ratelimit_remaining)
```

`client.chat` runs on the official `openai` package (`client.openai` is the configured `openai.OpenAI`), so every OpenAI parameter passes through. `answer.completion` is the untouched `ChatCompletion`.

## Surface

| Call | Endpoint | Returns |
|---|---|---|
| `client.chat.create(messages=..., model=, metadata=, instructions=, response_format=)` | `POST /v1/chat/completions` | `ChatResponse` (`.text`, `.asha`, `.completion`, `.meta`, `.json()`) |
| `client.chat.stream(...)` | same, `stream=true` | `ChatStream`: iterate for text; `.asha`, `.usage`, `.text` after the last chunk |
| `client.messages.create(...)` / `.stream(...)` | `POST /v1/messages` | `MessageResponse` / `MessageStream` (on the `anthropic` package) |
| `client.verify(claim, context=, domain=, top_k=)` | `POST /v1/verify` | `Verification` (`verdict`, `caveat`, `scope`, `evidence_for`, `evidence_against`, `retracted_related`) |
| `client.clinical.med_check(medications, age=, egfr=, allergies=, pregnancy=, format=)` | `POST /v1/clinical/med-check` | `MedCheck` (`interactions`, `alerts`, `unchecked`, `next_step`, `.detected_issues` for FHIR) |
| `client.search(query, top_k=, filters=)` | `POST /v1/search` | `SearchResults` (typed passages with locators) |
| `client.rerank(query, documents, top_n=, return_documents=)` | `POST /v1/rerank` | `Rerank` (`results[].index`, `relevance_score`) |
| `client.receipts.get(receipt_id)` | `GET /v1/receipts/{id}` | `Receipt` |
| `client.models.list(include_all=)`, `client.models.retrieve(id)` | `GET /v1/models` | `list[Model]`, `Model` |
| `client.corpus_state()` | `GET /v1/corpus-state` | `CorpusCommitment` |

Every model in `askasha.types` accepts fields it does not declare, so new server fields never break parsing (read them from `model_extra`). Fields without an engine signal are `None`.

## Reading results honestly

- `verify`: `supported` means the corpus did not refute the claim. That is weaker than true; show `caveat` and `scope` with the verdict, and treat `insufficient_evidence` as "not checked".
- `med_check`: an empty result means no findings in the rules checked. `unchecked` lists drugs and checks the rule table could not run. Consumer audiences get a `next_step` that routes to the prescriber or pharmacist.
- Answers are reference information for the stated audience. `asha.basis.limitations` and `asha.safety.requires_clinician_review` say what the answer is not.

## Streaming

```python
with client.chat.stream(messages=[{"role": "user", "content": "Red flags for a headache?"}]) as stream:
    for text in stream:
        print(text, end="", flush=True)
print("\n", [r.display for r in stream.asha.references], stream.asha.receipt_id)
```

## Retries and idempotency

Every POST carries an `Idempotency-Key` (a UUID v4 per call unless you pass `idempotency_key=`), reused across retries, so a retry never runs or bills the request twice. The client retries connection errors, 408, 502, 503 and 504, and 409/429 responses whose `Retry-After` is at most `max_retry_wait` (60 s), waiting exactly `Retry-After` when the API sends it. Allowance errors (`daily_quota_exceeded`, `monthly_quota_exceeded`) carry a long `Retry-After` and raise at once.

```python
from askasha import Asha, RateLimitError, idempotency_key

client = Asha(max_retries=3)
key = idempotency_key()                     # store it with your job to replay safely after a crash
try:
    v = client.verify("Metformin is first-line therapy for most adults with type 2 diabetes.", idempotency_key=key)
except RateLimitError as e:
    print(e.code, e.retry_after, e.request_id)
```

Errors: `AuthenticationError` (401), `PermissionDeniedError` (403), `NotFoundError` (404), `ConflictError` (409), `GoneError` (410), `UnprocessableEntityError` (422, for example `schema_unsatisfied` or `phi_not_allowed`), `RateLimitError` (429), `RegionNotSupportedError` (451: EU, EEA and UK are not served), `InternalServerError` (5xx). Each has `status_code`, `type`, `code`, `message`, `request_id`, `retry_after`.

## Data you may send

PHI mode is closed: send de-identified or synthetic data only. Sandbox keys get 422 `phi_not_allowed` when identifiers are detected. The BAA is self-serve and versioned (`GET /api/a2a/baa`); its text is a draft pending counsel review.

## Tests

```bash
pip install -e ".[dev]"
pytest                                   # local mock, no network
ASHA_LIVE=1 ASHA_API_KEY=... pytest tests/test_live.py   # production, uses up to 3 calls
```

Apache-2.0. Source: [github.com/DNAiOS/asha](https://github.com/DNAiOS/asha/tree/main/sdk/python).
