"""Typed models for Asha API responses.

Hand-written from the OpenAPI document (https://api.askasha.org/openapi.json)
and the live response shapes. Every model accepts fields it does not declare,
so a new server field never breaks parsing; read it from ``model_extra``.
Fields the engine has no signal for arrive as ``None``.
"""

from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field

__all__ = [
    "AshaModel",
    "ResponseMeta",
    "Locator",
    "Reference",
    "GroundingReference",
    "CorpusCommitment",
    "GroundingVerification",
    "Grounding",
    "Escalation",
    "Refusal",
    "Safety",
    "ModelRef",
    "Basis",
    "AnswerUsage",
    "ReceiptRef",
    "AshaAnswer",
    "ToolUsage",
    "ToolSafety",
    "ToolMeta",
    "Evidence",
    "Verification",
    "EvidenceCounts",
    "MedCheckFinding",
    "HighAlert",
    "Unchecked",
    "MedCheck",
    "SearchHit",
    "SearchResults",
    "RerankItem",
    "Rerank",
    "Receipt",
    "Model",
    "Medication",
    "Allergy",
    "SearchFilters",
    "Verdict",
    "Severity",
]

Verdict = Literal["supported", "contradicted", "mixed", "insufficient_evidence"]
Severity = Literal["contraindicated", "major", "moderate", "minor", "info"]


class AshaModel(BaseModel):
    model_config = ConfigDict(extra="allow", populate_by_name=True, protected_namespaces=())


class ResponseMeta(AshaModel):
    """Transport facts from the response headers."""

    request_id: Optional[str] = None
    model: Optional[str] = None
    snapshot: Optional[str] = None
    intended_user: Optional[str] = None
    idempotent_replayed: bool = False
    ratelimit_limit: Optional[int] = None
    ratelimit_remaining: Optional[int] = None
    ratelimit_reset: Optional[int] = None

    @classmethod
    def from_headers(cls, headers: Any) -> "ResponseMeta":
        def _int(name: str) -> Optional[int]:
            v = headers.get(name)
            try:
                return int(v) if v is not None else None
            except ValueError:
                return None

        return cls(
            request_id=headers.get("x-request-id"),
            model=headers.get("asha-model"),
            snapshot=headers.get("asha-snapshot"),
            intended_user=headers.get("x-dnai-intended-user"),
            idempotent_replayed=(headers.get("idempotent-replayed") or "").lower() == "true",
            ratelimit_limit=_int("x-ratelimit-limit"),
            ratelimit_remaining=_int("x-ratelimit-remaining"),
            ratelimit_reset=_int("x-ratelimit-reset"),
        )


# ---------------------------------------------------------------- asha object


class Locator(AshaModel):
    pmid: Optional[str] = None
    doi: Optional[str] = None
    pmcid: Optional[str] = None
    url: Optional[str] = None
    page: Optional[Union[int, str]] = None
    collection: Optional[str] = None
    point_id: Optional[str] = None


class Reference(AshaModel):
    """One source behind an ``[n]`` marker in the answer text."""

    id: str
    marker: Optional[str] = None
    n: Optional[int] = None
    type: Optional[str] = None
    title: Optional[str] = None
    display: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    pmid: Optional[str] = None
    doi: Optional[str] = None
    locator: Optional[Locator] = None
    evidence_type: Optional[str] = None
    retrieved_at: Optional[str] = None


class GroundingReference(AshaModel):
    id: str
    marker: Optional[str] = None
    type: Optional[str] = None
    display: Optional[str] = None
    locator: Optional[Locator] = None
    year: Optional[int] = None
    journal: Optional[str] = None
    organization: Optional[str] = None
    provenance: Optional[str] = None
    supports: List[Any] = Field(default_factory=list)


class CorpusCommitment(AshaModel):
    """Hash over the corpus the answer was retrieved from; check it at ``verify_url``."""

    hash: Optional[str] = None
    algorithm: Optional[str] = None
    collections: Optional[int] = None
    as_of: Optional[str] = None
    verify_url: Optional[str] = None


class GroundingVerification(AshaModel):
    status: Optional[str] = None
    method: Optional[str] = None
    flagged_claims: List[Any] = Field(default_factory=list)


class Grounding(AshaModel):
    evidence_count: Optional[int] = None
    cited_count: Optional[int] = None
    coverage: Optional[str] = None
    unmapped_markers: List[str] = Field(default_factory=list)
    corpus_commitment: Optional[CorpusCommitment] = None
    references: List[GroundingReference] = Field(default_factory=list)
    uncited_sentences: Optional[List[str]] = None
    verification: Optional[GroundingVerification] = None


class Escalation(AshaModel):
    level: Optional[str] = None
    message: Optional[str] = None
    action: Optional[str] = None
    timeframe: Optional[str] = None


class Refusal(AshaModel):
    refused: bool = False
    category: Optional[str] = None


class Safety(AshaModel):
    emergency: Optional[bool] = None
    escalation: Optional[Escalation] = None
    refusal: Optional[Refusal] = None
    insufficient_evidence: Optional[bool] = None
    uncertainty: Optional[Any] = None
    phi_detected: Optional[bool] = None
    phi_redacted: Optional[bool] = None
    phi_identifier_kinds: List[str] = Field(default_factory=list)
    intended_user: Optional[str] = None
    audience_served: Optional[str] = None
    requires_clinician_review: Optional[bool] = None

    @property
    def needs_escalation(self) -> bool:
        """True when the answer carries an emergency flag or a non-``none`` escalation level."""
        level = (self.escalation.level if self.escalation else None) or "none"
        return bool(self.emergency) or level != "none"


class ModelRef(AshaModel):
    id: Optional[str] = None
    snapshot: Optional[str] = None
    depth_served: Optional[str] = None
    status: Optional[str] = None


class Basis(AshaModel):
    inputs: Dict[str, Any] = Field(default_factory=dict)
    sources: List[Reference] = Field(default_factory=list)
    datasets_consulted: List[Any] = Field(default_factory=list)
    missing_data: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    model: Optional[ModelRef] = None
    pipeline_version: Optional[str] = None


class AnswerUsage(AshaModel):
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    estimated: Optional[bool] = None
    tier_requested: Optional[str] = None
    tier_served: Optional[str] = None


class ReceiptRef(AshaModel):
    id: str
    answer_sha256: Optional[str] = None
    url: Optional[str] = None


class AshaAnswer(AshaModel):
    """The ``asha`` object on ``/v1/chat/completions`` and ``/v1/messages`` answers."""

    object: Optional[str] = None
    version: Optional[int] = None
    references: List[Reference] = Field(default_factory=list)
    grounding: Optional[Grounding] = None
    safety: Optional[Safety] = None
    basis: Optional[Basis] = None
    usage: Optional[AnswerUsage] = None
    receipt: Optional[ReceiptRef] = None
    receipt_id: Optional[str] = None


# ---------------------------------------------------------------- tools


class ToolUsage(AshaModel):
    billable_units: Optional[float] = None
    unit: Optional[str] = None
    amount_usd: Optional[float] = None
    price_card: Optional[str] = None


class ToolSafety(AshaModel):
    phi_detected: Optional[bool] = None
    phi_redacted: Optional[bool] = None
    identifier_kinds: List[str] = Field(default_factory=list)


class ToolMeta(AshaModel):
    """The ``asha`` object on tool responses (verify, med-check, search, rerank)."""

    model: Optional[ModelRef] = None
    intended_user: Optional[str] = None
    safety: Optional[ToolSafety] = None
    basis: Optional[Basis] = None
    usage: Optional[ToolUsage] = None
    grounding: Optional[Grounding] = None


class _ToolResponse(AshaModel):
    id: str
    object: str
    created: Optional[int] = None
    model: Optional[str] = None
    latency_ms: Optional[float] = None
    usage: Optional[ToolUsage] = None
    asha: Optional[ToolMeta] = None
    meta: Optional[ResponseMeta] = Field(default=None, exclude=True)


class Evidence(AshaModel):
    id: Optional[str] = None
    rank: Optional[int] = None
    type: Optional[str] = None
    title: Optional[str] = None
    snippet: Optional[str] = None
    source: Optional[str] = None
    year: Optional[int] = None
    score: Optional[float] = None
    collection: Optional[str] = None
    retracted: bool = False
    refuted: bool = False
    locator: Optional[Locator] = None
    stance: Optional[str] = None
    nli: Optional[Dict[str, float]] = None
    contradicting_sentence: Optional[str] = None


class EvidenceCounts(AshaModel):
    for_: Optional[int] = Field(default=None, alias="for")
    against: Optional[int] = None
    related: Optional[int] = None
    retracted_related: Optional[int] = None
    list_cap: Optional[int] = None


class Verification(_ToolResponse):
    """``POST /v1/verify``. A ``supported`` verdict means the corpus did not refute the claim,
    which is weaker than true. Read ``caveat`` and ``scope`` with the verdict."""

    claim: str
    verdict: str
    caveat: Optional[str] = None
    scope: Optional[str] = None
    e_value: Optional[float] = None
    evidence_for: List[Evidence] = Field(default_factory=list)
    evidence_against: List[Evidence] = Field(default_factory=list)
    retracted_related: List[Evidence] = Field(default_factory=list)
    evidence_counts: Optional[EvidenceCounts] = None
    stance_method: Optional[str] = None
    collections_searched: List[str] = Field(default_factory=list)


class MedCheckFinding(AshaModel):
    id: Optional[str] = None
    kind: Optional[str] = None
    severity: Optional[str] = None
    title: Optional[str] = None
    medications: List[str] = Field(default_factory=list)
    management: Optional[str] = None
    mechanism: Optional[str] = None
    detail: Optional[str] = None
    source: Optional[str] = None
    rule: Optional[str] = None


class HighAlert(AshaModel):
    medication: Optional[str] = None
    basis: Optional[str] = None


class Unchecked(AshaModel):
    type: Optional[str] = None
    check: Optional[str] = None
    name: Optional[str] = None
    reason: Optional[str] = None


class MedCheck(_ToolResponse):
    """``POST /v1/clinical/med-check``: deterministic rule-table screen. An empty result means
    no findings in the rules checked; ``unchecked`` names what the table could not check."""

    display_name: Optional[str] = None
    rule_table_version: Optional[str] = None
    audience: Optional[str] = None
    findings_text: Optional[str] = None
    next_step: Optional[str] = None
    interactions: List[MedCheckFinding] = Field(default_factory=list)
    alerts: List[MedCheckFinding] = Field(default_factory=list)
    high_alert: List[HighAlert] = Field(default_factory=list)
    unchecked: List[Unchecked] = Field(default_factory=list)
    summary: Dict[str, int] = Field(default_factory=dict)
    blocking: List[MedCheckFinding] = Field(default_factory=list)
    drugs_checked: Optional[int] = None
    rules_checked: Optional[int] = None
    format: Optional[str] = None
    fhir: Optional[Dict[str, Any]] = None

    @property
    def detected_issues(self) -> List[Dict[str, Any]]:
        """FHIR R4 DetectedIssue resources (request ``format="fhir"``)."""
        entries = (self.fhir or {}).get("entry") or []
        return [e["resource"] for e in entries if isinstance(e, dict) and "resource" in e]


class SearchHit(AshaModel):
    id: Optional[str] = None
    rank: Optional[int] = None
    type: Optional[str] = None
    title: Optional[str] = None
    snippet: Optional[str] = None
    source: Optional[str] = None
    year: Optional[int] = None
    score: Optional[float] = None
    collection: Optional[str] = None
    retracted: bool = False
    refuted: bool = False
    locator: Optional[Locator] = None


class SearchResults(_ToolResponse):
    """``POST /v1/search``: ranked passages; information retrieval only, no answer."""

    query: Optional[str] = None
    data: List[SearchHit] = Field(default_factory=list)


class RerankItem(AshaModel):
    index: int
    relevance_score: float
    document: Optional[Dict[str, Any]] = None


class Rerank(_ToolResponse):
    """``POST /v1/rerank``: relevance scores only, with no claim of clinical validity."""

    results: List[RerankItem] = Field(default_factory=list)


class Receipt(AshaModel):
    """``GET /v1/receipts/{id}``: the audit record behind one answer."""

    id: str
    answer_sha256: Optional[str] = None
    receipt: Dict[str, Any] = Field(default_factory=dict)
    meta: Optional[ResponseMeta] = Field(default=None, exclude=True)


class Model(AshaModel):
    id: str
    object: str = "model"
    created: Optional[int] = None
    owned_by: Optional[str] = None
    display_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    model_class: Optional[str] = Field(default=None, alias="class")
    context_window: Optional[int] = None
    max_output_tokens: Optional[int] = None
    input_modalities: List[str] = Field(default_factory=list)
    output_modalities: List[str] = Field(default_factory=list)
    capabilities: Dict[str, Any] = Field(default_factory=dict)
    latency_band: Optional[Dict[str, Any]] = None
    pricing: Optional[Dict[str, Any]] = None
    free_allowance: Optional[Dict[str, Any]] = None
    plans: List[str] = Field(default_factory=list)
    intended_user: List[str] = Field(default_factory=list)
    snapshots: List[str] = Field(default_factory=list)
    aliases: List[str] = Field(default_factory=list)
    deprecation: Optional[Any] = None


# ---------------------------------------------------------------- request helpers


class Medication(AshaModel):
    name: str
    dose: Optional[str] = None
    route: Optional[str] = None
    frequency: Optional[str] = None
    sig: Optional[str] = None
    indication: Optional[str] = None
    id: Optional[str] = None


class Allergy(AshaModel):
    allergen: str
    reaction: Optional[str] = None


class SearchFilters(AshaModel):
    domain: Optional[Literal["general", "clinical", "guidelines", "drugs", "codes"]] = None
    year_from: Optional[int] = None
    year_to: Optional[int] = None
    source_type: Optional[List[Literal["literature", "guideline", "drug_label", "code", "dataset"]]] = None
