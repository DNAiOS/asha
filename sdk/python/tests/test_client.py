from __future__ import annotations

import json

import pytest

from askasha import (
    Asha,
    AshaError,
    AuthenticationError,
    NotFoundError,
    RateLimitError,
    RegionNotSupportedError,
    idempotency_key,
)
from askasha.types import Medication, SearchFilters

from .conftest import MockAPI, err


def _body(api: MockAPI, i: int = -1) -> dict:
    return json.loads(api.requests[i].content)


def test_requires_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("ASHA_API_KEY", raising=False)
    monkeypatch.delenv("DNAI_API_KEY", raising=False)
    with pytest.raises(AshaError, match="ASHA_API_KEY"):
        Asha()


def test_chat_create_parses_asha_object(client: Asha, api: MockAPI) -> None:
    out = client.chat.create(
        messages=[{"role": "user", "content": "First-line drug for hypertension?"}],
        model="asha-base", metadata={"audience": "clinician", "persona": {"name": "CareBot"}},
        instructions="Answer for a primary care physician.",
    )
    req = api.requests[-1]
    assert req.url.path == "/v1/chat/completions"
    assert req.headers["authorization"] == "Bearer dnai_a2a_test"
    assert req.headers["idempotency-key"]
    body = _body(api)
    assert body["metadata"]["persona"] == {"name": "CareBot"}
    assert body["instructions"].startswith("Answer for")
    assert out.text.startswith("**Uncomplicated")
    assert out.asha is not None
    assert out.asha.references[0].marker == "[1]"
    assert out.asha.grounding and out.asha.grounding.corpus_commitment
    assert out.asha.grounding.corpus_commitment.algorithm == "sha512"
    assert out.asha.safety and out.asha.safety.needs_escalation is False
    assert out.receipt_id and out.receipt_id.startswith("rcpt_")
    assert out.meta.request_id == "req_test_1"
    assert out.meta.ratelimit_remaining == 19
    assert out.meta.snapshot == "asha-base-2026-12-01"


def test_chat_explicit_idempotency_key(client: Asha, api: MockAPI) -> None:
    key = idempotency_key()
    client.chat.create(messages=[{"role": "user", "content": "q"}], idempotency_key=key)
    assert api.requests[-1].headers["idempotency-key"] == key


def test_chat_json_schema(client: Asha, api: MockAPI) -> None:
    fmt = {"type": "json_schema", "json_schema": {"name": "x", "schema": {"type": "object"}, "strict": True}}
    client.chat.create(messages=[{"role": "user", "content": "q"}], response_format=fmt)
    assert _body(api)["response_format"] == fmt


def test_chat_stream_surfaces_final_asha(client: Asha, api: MockAPI) -> None:
    with client.chat.stream(messages=[{"role": "user", "content": "q"}]) as stream:
        parts = list(stream)
    assert parts == ["Thiazides ", "are first-line [1]."]
    assert stream.text == "Thiazides are first-line [1]."
    assert stream.finish_reason == "stop"
    assert stream.asha is not None and stream.asha.receipt_id
    assert stream.usage.total_tokens == 12
    body = _body(api)
    assert body["stream"] is True and body["stream_options"] == {"include_usage": True}


def test_messages_create(client: Asha, api: MockAPI) -> None:
    out = client.messages.create(messages=[{"role": "user", "content": "q"}], system="Be brief.")
    req = api.requests[-1]
    assert req.url.path == "/v1/messages"
    assert req.headers["x-api-key"] == "dnai_a2a_test"
    assert req.headers["idempotency-key"]
    assert out.text == "Thiazides are first-line [1]."
    assert out.asha is not None and out.asha.references
    assert out.message.content[0].citations[0].encrypted_index == "r1"


def test_messages_stream(client: Asha) -> None:
    stream = client.messages.stream(messages=[{"role": "user", "content": "q"}]).until_done()
    assert stream.text == "Thiazides are first-line [1]."
    assert stream.stop_reason == "end_turn"
    assert stream.asha is not None and stream.asha.safety is not None


def test_verify(client: Asha, api: MockAPI) -> None:
    v = client.verify("Metformin is first-line therapy for most adults with type 2 diabetes.", top_k=3)
    assert _body(api) == {"claim": "Metformin is first-line therapy for most adults with type 2 diabetes.", "top_k": 3}
    assert api.requests[-1].headers["idempotency-key"]
    assert v.verdict == "supported"
    assert v.caveat and "weaker than true" in v.caveat
    assert v.evidence_counts and v.evidence_counts.for_ == 1
    assert v.evidence_for[0].locator is not None
    assert v.usage and v.usage.unit == "claim"
    assert v.meta and v.meta.request_id == "req_test_1"


def test_med_check_fhir(client: Asha, api: MockAPI) -> None:
    mc = client.clinical.med_check(
        [Medication(name="warfarin", dose="5 mg", route="oral"), "fluconazole"], age=67, format="fhir",
    )
    body = _body(api)
    assert body["medications"] == [{"name": "warfarin", "dose": "5 mg", "route": "oral"}, "fluconazole"]
    assert body["format"] == "fhir" and body["age"] == 67
    assert mc.interactions[0].severity == "major"
    assert mc.summary["major"] == 1
    assert mc.unchecked
    assert mc.detected_issues[0]["resourceType"] == "DetectedIssue"
    assert mc.usage and mc.usage.billable_units == 0


def test_search_and_rerank(client: Asha, api: MockAPI) -> None:
    s = client.search("anticoagulation in AF with CKD", top_k=2, filters=SearchFilters(year_from=2020))
    assert _body(api)["filters"] == {"year_from": 2020}
    assert s.data[0].locator and s.data[0].locator.pmid
    r = client.rerank("first-line therapy", [h.snippet or "" for h in s.data], top_n=1, return_documents=True)
    assert _body(api)["top_n"] == 1
    assert r.results[0].relevance_score > r.results[1].relevance_score


def test_receipts_models_corpus(client: Asha, api: MockAPI) -> None:
    rc = client.receipts.get("rcpt_abc")
    assert api.requests[-1].url.path == "/v1/receipts/rcpt_abc"
    assert rc.answer_sha256 and rc.receipt["corpus_commitment"]["algorithm"] == "sha512"
    models = client.models.list(include_all=True)
    assert api.requests[-1].url.params["include"] == "all"
    assert {m.id for m in models} >= {"asha", "asha-base", "asha-verify", "asha-med-check"}
    base = client.models.retrieve("asha-base")
    assert base.model_class == "grounded_answer" and "asha-base-2026-12-01" in base.snapshots
    with pytest.raises(NotFoundError) as ei:
        client.models.retrieve("asha-nope")
    assert ei.value.code == "model_not_found"
    assert client.corpus_state().algorithm == "sha512"


def test_retry_honors_retry_after_and_keeps_idempotency_key(client: Asha, api: MockAPI) -> None:
    api.queue = [err(429, "rate_limited", retry_after="3"), err(503, "verification_unavailable", retry_after="1")]
    v = client.verify("claim")
    assert v.verdict == "supported"
    posts = [r for r in api.requests if r.method == "POST"]
    sleeps = [str(r.url) for r in api.requests if r.method == "SLEEP"]
    assert len(posts) == 3
    assert sleeps == ["https://sleep/3.0", "https://sleep/1.0"]
    assert len({r.headers["idempotency-key"] for r in posts}) == 1


def test_no_retry_on_quota_with_long_retry_after(client: Asha, api: MockAPI) -> None:
    api.queue = [err(429, "daily_quota_exceeded", retry_after="40000")]
    with pytest.raises(RateLimitError) as ei:
        client.search("q")
    assert ei.value.code == "daily_quota_exceeded"
    assert ei.value.retry_after == 40000
    assert ei.value.request_id == "req_err"
    assert len(api.requests) == 1


def test_retries_exhausted(client: Asha, api: MockAPI) -> None:
    api.queue = [err(503, "x", retry_after="0")] * 3
    with pytest.raises(AshaError):
        client.rerank("q", ["a"])
    assert len([r for r in api.requests if r.method == "POST"]) == 3


def test_chat_errors_are_typed_and_retried(client: Asha, api: MockAPI) -> None:
    api.queue = [err(429, "rate_limited", retry_after="2")]
    out = client.chat.create(messages=[{"role": "user", "content": "q"}])
    assert out.asha is not None
    posts = [r for r in api.requests if r.method == "POST"]
    assert len(posts) == 2 and posts[0].headers["idempotency-key"] == posts[1].headers["idempotency-key"]
    api.queue = [err(401, "invalid_api_key")]
    with pytest.raises(AuthenticationError) as ei:
        client.chat.create(messages=[{"role": "user", "content": "q"}])
    assert ei.value.code == "invalid_api_key"


def test_messages_region_error(client: Asha, api: MockAPI) -> None:
    api.queue = [err(451, "region_not_supported", anthropic=True)]
    with pytest.raises(RegionNotSupportedError) as ei:
        client.messages.create(messages=[{"role": "user", "content": "q"}])
    assert ei.value.code == "region_not_supported"


def test_auto_idempotency_off(api: MockAPI) -> None:
    import httpx

    c = Asha(api_key="k", base_url="https://mock.askasha.test", auto_idempotency=False,
             http_client=httpx.Client(transport=httpx.MockTransport(api)))
    c.verify("claim")
    assert "idempotency-key" not in api.requests[-1].headers
