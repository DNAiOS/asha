# Asha API cookbook

Runnable recipes for the [Asha API](https://askasha.org/developers). Each one is a single Python file on the [`askasha`](../sdk/python) SDK (recipe 08 uses only the official `openai` and `anthropic` packages), reads `ASHA_API_KEY` from the environment, calls production, and exits non-zero when the response is missing what the recipe needs. Every case is synthetic; PHI mode is closed, so send de-identified data only.

```bash
pip install "askasha[anthropic]"            # or, from a clone: pip install -e "sdk/python[anthropic]"
export ASHA_API_KEY=dnai_a2a_...           # free key: https://askasha.org/developers
python cookbook/01_patient_assistant.py
python cookbook/run_all.py --out results.json   # every recipe, pass or fail
```

| # | Recipe | Endpoints | What it shows |
|---|---|---|---|
| 01 | [Patient-facing assistant with escalation](01_patient_assistant.py) | `/v1/chat/completions` | Patient register; the escalation message goes above the answer; sources; when-to-seek-care guidance on every reply |
| 02 | [Clinician assistant with an A&P template](02_clinician_ap_template.py) | `/v1/chat/completions` | `instructions` carry the template; `[n]` references with locators; `requires_clinician_review` and `missing_data` |
| 03 | [Clinical subagent with JSON Schema output](03_clinical_subagent_json.py) | `/v1/chat/completions` | `response_format: json_schema` (strict), validated server-side; 422 `schema_unsatisfied` handling |
| 04 | [EHR summary for a downstream agent](04_ehr_summary_for_agent.py) | `/v1/chat/completions`, `/v1/clinical/med-check` | Note to typed summary, extracted meds through med-check, one handoff object with the receipt id |
| 05 | [Check claims before you show them](05_verify_before_show.py) | `/v1/verify` | Show only claims the corpus supports, hold the rest with the reason; the caveat travels with every shown claim |
| 06 | [Medication check with FHIR DetectedIssue](06_med_check_fhir.py) | `/v1/clinical/med-check` | Deterministic screen, renal and potassium context, unchecked items, FHIR R4 Bundle on stdout |
| 07 | [Search plus rerank for your own RAG](07_search_rerank_rag.py) | `/v1/search`, `/v1/rerank` | Typed passages with PMID/DOI locators, retracted items dropped, a cited context block for your model |
| 08 | [Switch from OpenAI or Anthropic](08_switch_base_url.py) | `/v1/chat/completions`, `/v1/messages` | Official SDKs with only `base_url` and the key changed |
| 09 | [Migrate from Glass](09_migrate_from_glass.py) | `/v1/messages` | Request and response translation; full table in [MIGRATE_FROM_GLASS.md](MIGRATE_FROM_GLASS.md) |
| 10 | [Idempotent retries and receipts](10_idempotent_retries_receipts.py) | `/v1/chat/completions`, `/v1/receipts/{id}` | Same Idempotency-Key replays without re-billing; receipt fingerprint and corpus commitment checks |

## Reading results

- An answer is reference information for the stated audience. `asha.basis.limitations` says what it is not; a licensed clinician decides.
- `verify`: `supported` means the passages found did not refute the claim, which is weaker than true.
- `med-check`: an empty result means no findings in the rules checked; `unchecked` lists what it could not run.

## Allowance

A full `run_all.py` uses about 9 answers plus a few tool calls (the Free Sandbox has 250 queries a month and 50 a day; med-check is free). Recipe 10's replay is not billed.

## Last recorded run

[`results/`](results/) holds the output of `run_all.py` against production with an internal sandbox key, one file per run.
