/**
 * Asha API types. Request bodies come from the OpenAPI document
 * (`src/openapi.d.ts`, generated from the live document by `npm run gen:types`); the OpenAPI
 * document leaves `/v1` response bodies untyped, so response types are
 * written by hand from the live shapes. Fields without an engine signal
 * are `null`; new fields can appear at any time.
 */
import type { operations } from "./openapi";

type JsonBody<Op extends keyof operations> = operations[Op] extends {
  requestBody?: { content: { "application/json": infer B } };
}
  ? B
  : never;

export type VerifyParams = JsonBody<"verifyClaim">;
export type MedCheckParams = JsonBody<"checkMedications">;
export type SearchParams = JsonBody<"searchEvidence">;
export type RerankParams = JsonBody<"rerankDocuments">;
export type Medication = Exclude<MedCheckParams["medications"][number], string>;
export type SearchFilters = NonNullable<SearchParams["filters"]>;

export type Verdict = "supported" | "contradicted" | "mixed" | "insufficient_evidence";

export interface ResponseMeta {
  requestId: string | null;
  model: string | null;
  snapshot: string | null;
  intendedUser: string | null;
  idempotentReplayed: boolean;
  rateLimit: { limit: number | null; remaining: number | null; reset: number | null };
}

export interface Locator {
  pmid?: string | null;
  doi?: string | null;
  pmcid?: string | null;
  url?: string | null;
  page?: number | string | null;
  collection?: string | null;
  point_id?: string | null;
}

/** One source behind an `[n]` marker in the answer text. */
export interface Reference {
  id: string;
  marker?: string | null;
  n?: number | null;
  type?: string | null;
  title?: string | null;
  display?: string | null;
  source?: string | null;
  url?: string | null;
  pmid?: string | null;
  doi?: string | null;
  locator?: Locator | null;
  evidence_type?: string | null;
  retrieved_at?: string | null;
  [key: string]: unknown;
}

export interface CorpusCommitment {
  hash: string | null;
  algorithm: string | null;
  collections: number | null;
  as_of: string | null;
  verify_url: string | null;
}

export interface Grounding {
  evidence_count?: number | null;
  cited_count?: number | null;
  coverage?: string | null;
  unmapped_markers?: string[];
  corpus_commitment?: CorpusCommitment | null;
  references?: Array<Reference & { provenance?: string | null; organization?: string | null; year?: number | null }>;
  uncited_sentences?: string[] | null;
  verification?: { status?: string | null; method?: string | null; flagged_claims?: unknown[] } | null;
  [key: string]: unknown;
}

export interface Escalation {
  level?: "none" | "emergency" | string | null;
  message?: string | null;
  action?: string | null;
  timeframe?: string | null;
}

export interface Safety {
  emergency?: boolean | null;
  escalation?: Escalation | null;
  refusal?: { refused: boolean; category?: string | null } | null;
  insufficient_evidence?: boolean | null;
  uncertainty?: unknown;
  phi_detected?: boolean | null;
  phi_redacted?: boolean | null;
  phi_identifier_kinds?: string[];
  intended_user?: string | null;
  audience_served?: string | null;
  requires_clinician_review?: boolean | null;
  [key: string]: unknown;
}

export interface ModelRef {
  id?: string | null;
  snapshot?: string | null;
  depth_served?: string | null;
  status?: string | null;
}

export interface Basis {
  inputs?: Record<string, unknown>;
  sources?: Reference[];
  datasets_consulted?: unknown[];
  missing_data?: string[];
  limitations?: string[];
  model?: ModelRef | null;
  pipeline_version?: string | null;
  [key: string]: unknown;
}

/** The `asha` object on `/v1/chat/completions` and `/v1/messages` answers. */
export interface AshaAnswer {
  object?: string;
  version?: number;
  references: Reference[];
  grounding?: Grounding | null;
  safety?: Safety | null;
  basis?: Basis | null;
  usage?: {
    input_tokens?: number | null;
    output_tokens?: number | null;
    estimated?: boolean | null;
    tier_requested?: string | null;
    tier_served?: string | null;
  } | null;
  receipt?: { id: string; answer_sha256?: string | null; url?: string | null } | null;
  receipt_id?: string | null;
  [key: string]: unknown;
}

export interface ToolUsage {
  billable_units?: number | null;
  unit?: string | null;
  amount_usd?: number | null;
  price_card?: string | null;
}

/** The `asha` object on tool responses. */
export interface ToolMeta {
  model?: ModelRef | null;
  intended_user?: string | null;
  safety?: { phi_detected?: boolean | null; phi_redacted?: boolean | null; identifier_kinds?: string[] } | null;
  basis?: Basis | null;
  usage?: ToolUsage | null;
  grounding?: Grounding | null;
  [key: string]: unknown;
}

interface ToolResponse {
  id: string;
  object: string;
  created?: number;
  model?: string;
  latency_ms?: number | null;
  usage?: ToolUsage | null;
  asha?: ToolMeta | null;
  /** Transport facts from the response headers (not part of the JSON body). */
  meta: ResponseMeta;
}

export interface Evidence {
  id?: string | null;
  rank?: number | null;
  type?: string | null;
  title?: string | null;
  snippet?: string | null;
  source?: string | null;
  year?: number | null;
  score?: number | null;
  collection?: string | null;
  retracted?: boolean;
  refuted?: boolean;
  locator?: Locator | null;
  stance?: string | null;
  nli?: Record<string, number> | null;
  [key: string]: unknown;
}

/**
 * `POST /v1/verify`. `supported` means the corpus did not refute the claim,
 * which is weaker than true; show `caveat` and `scope` with the verdict.
 */
export interface Verification extends ToolResponse {
  claim: string;
  verdict: Verdict | string;
  caveat?: string | null;
  scope?: string | null;
  e_value?: number | null;
  evidence_for: Evidence[];
  evidence_against: Evidence[];
  retracted_related: Evidence[];
  evidence_counts?: { for?: number; against?: number; related?: number; retracted_related?: number; list_cap?: number };
  stance_method?: string | null;
  collections_searched?: string[];
}

export interface MedCheckFinding {
  id?: string;
  kind?: string;
  severity?: "contraindicated" | "major" | "moderate" | "minor" | "info" | string;
  title?: string;
  medications: string[];
  management?: string;
  mechanism?: string;
  detail?: string;
  source?: string;
  rule?: string;
  [key: string]: unknown;
}

/** A FHIR R4 DetectedIssue resource, as med-check returns it with `format: "fhir"`. */
export interface DetectedIssue {
  resourceType: "DetectedIssue";
  id?: string;
  status?: string;
  severity?: "high" | "moderate" | "low";
  code?: { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string };
  implicated?: Array<{ identifier?: { value?: string }; display?: string }>;
  detail?: string;
  evidence?: Array<{ detail?: Array<{ display?: string }> }>;
  author?: { display?: string };
  mitigation?: Array<{ action?: { text?: string } }>;
  [key: string]: unknown;
}

/**
 * `POST /v1/clinical/med-check`: deterministic rule-table screen. An empty
 * result means no findings in the rules checked; `unchecked` names what the
 * table could not check.
 */
export interface MedCheck extends ToolResponse {
  display_name?: string;
  rule_table_version?: string;
  audience?: string;
  findings_text?: string;
  next_step?: string;
  interactions: MedCheckFinding[];
  alerts: MedCheckFinding[];
  high_alert: Array<{ medication?: string; basis?: string }>;
  unchecked: Array<{ type?: string; check?: string; name?: string; reason?: string }>;
  summary: Record<string, number>;
  blocking: MedCheckFinding[];
  drugs_checked?: number;
  rules_checked?: number;
  format?: string;
  fhir?: { resourceType: "Bundle"; type?: string; entry?: Array<{ resource: DetectedIssue }> } | null;
}

export interface SearchHit {
  id?: string | null;
  rank?: number | null;
  type?: string | null;
  title?: string | null;
  snippet?: string | null;
  source?: string | null;
  year?: number | null;
  score?: number | null;
  collection?: string | null;
  retracted?: boolean;
  refuted?: boolean;
  locator?: Locator | null;
  [key: string]: unknown;
}

/** `POST /v1/search`: ranked passages; information retrieval only, no answer. */
export interface SearchResults extends ToolResponse {
  query?: string;
  data: SearchHit[];
}

/** `POST /v1/rerank`: relevance scores only, with no claim of clinical validity. */
export interface Rerank extends ToolResponse {
  results: Array<{ index: number; relevance_score: number; document?: { text: string } | null }>;
}

export interface Receipt {
  id: string;
  answer_sha256?: string | null;
  receipt: Record<string, unknown>;
  meta: ResponseMeta;
}

export interface Model {
  id: string;
  object: "model";
  created?: number;
  owned_by?: string;
  display_name?: string;
  description?: string;
  status?: "ga" | "preview" | "planned" | "blocked" | "legacy" | string;
  class?: string;
  context_window?: number | null;
  max_output_tokens?: number | null;
  input_modalities?: string[];
  output_modalities?: string[];
  capabilities?: Record<string, unknown>;
  latency_band?: Record<string, unknown> | null;
  pricing?: Record<string, unknown> | null;
  free_allowance?: Record<string, unknown> | null;
  plans?: string[];
  intended_user?: string[];
  snapshots?: string[];
  aliases?: string[];
  deprecation?: unknown;
  [key: string]: unknown;
}
