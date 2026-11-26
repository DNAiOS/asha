import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Asha, detectedIssues, needsEscalation, type AshaOptions, type MedCheck, type Verification } from "askasha";
import { z } from "zod";

export const VERSION = "0.1.0";

type ToolResult = { content: Array<{ type: "text"; text: string }>; structuredContent?: Record<string, unknown>; isError?: boolean };

const text = (t: string, structured?: Record<string, unknown>): ToolResult => ({
  content: [{ type: "text", text: t }],
  ...(structured ? { structuredContent: structured } : {}),
});

async function guarded(fn: () => Promise<ToolResult>): Promise<ToolResult> {
  try {
    return await fn();
  } catch (e) {
    const err = e as { message?: string; code?: string; requestId?: string };
    const parts = [err.code, err.message, err.requestId ? `request_id ${err.requestId}` : null].filter(Boolean);
    return { content: [{ type: "text", text: `Asha API error: ${parts.join(" | ")}` }], isError: true };
  }
}

export function formatVerification(v: Verification): string {
  const lines = [
    `Verdict: ${v.verdict}`,
    v.scope ? `Scope: ${v.scope}` : "",
    v.caveat ? `Caveat: ${v.caveat}` : "",
    `Passages for: ${v.evidence_counts?.for ?? v.evidence_for.length}, against: ${v.evidence_counts?.against ?? v.evidence_against.length}`,
  ];
  const show = (label: string, list: Verification["evidence_for"]) =>
    list.slice(0, 5).forEach((e) => lines.push(`${label}: ${e.title ?? e.snippet ?? ""} ${e.locator?.pmid ? `(PMID ${e.locator.pmid})` : ""}`.trim()));
  show("For", v.evidence_for);
  show("Against", v.evidence_against);
  if (v.retracted_related.length) lines.push(`Retracted items near the topic: ${v.retracted_related.length}`);
  return lines.filter(Boolean).join("\n");
}

export function formatMedCheck(mc: MedCheck): string {
  const lines = [mc.findings_text ?? ""];
  for (const f of mc.alerts) {
    if (f.kind === "insufficient_data") continue;
    lines.push(`- [${f.severity}] ${f.title}: ${f.medications.join(" + ")}. ${f.detail ?? ""} Source: ${f.source ?? "rule table"}.`);
  }
  for (const u of mc.unchecked) lines.push(`- Not checked: ${u.check ?? u.name ?? ""} (${u.reason ?? ""})`);
  if (mc.next_step) lines.push(`Next step: ${mc.next_step}`);
  lines.push(`Rule table ${mc.rule_table_version}; ${mc.drugs_checked} drugs against ${mc.rules_checked} rules.`);
  return lines.filter(Boolean).join("\n");
}

/** Builds the MCP server. Pass `client` to reuse an Asha client (tests pass one with a mock fetch). */
export function createServer(opts: { client?: Asha; asha?: AshaOptions } = {}): McpServer {
  let client = opts.client;
  const asha = () => (client ??= new Asha(opts.asha));
  const server = new McpServer({ name: "asha", version: VERSION });

  server.registerTool(
    "ask_asha",
    {
      title: "Ask Asha",
      description:
        "Cited medical answer from the Asha API. Returns the answer text with [n] markers, the references behind them, " +
        "any escalation message, and a receipt id. Uses one answer from the key's allowance. Send de-identified text only.",
      inputSchema: {
        question: z.string().min(1).describe("The medical question."),
        audience: z.enum(["patient", "caregiver", "clinician", "nurse", "pharmacist", "physician"]).optional(),
        model: z.string().optional().describe("Model id from GET /v1/models; default asha."),
        verbosity: z.enum(["brief", "standard", "detailed"]).optional(),
      },
    },
    async ({ question, audience, model, verbosity }) =>
      guarded(async () => {
        const out = await asha().chat.create({
          model: model ?? "asha",
          messages: [{ role: "user", content: question }],
          metadata: { ...(audience ? { audience } : {}), ...(verbosity ? { verbosity } : {}), memory: "off" },
        });
        const refs = out.asha?.references ?? [];
        const lines = [out.text, ""];
        if (needsEscalation(out.asha)) lines.unshift(`ESCALATION: ${out.asha?.safety?.escalation?.message ?? "seek care now"}`, "");
        if (refs.length) lines.push("References:", ...refs.map((r) => `${r.marker ?? ""} ${r.display ?? r.title ?? ""}${r.locator?.pmid ? ` (PMID ${r.locator.pmid})` : ""}`));
        if (out.receiptId) lines.push("", `Receipt: ${out.receiptId}`);
        return text(lines.join("\n"), {
          text: out.text,
          references: refs,
          safety: out.asha?.safety ?? null,
          receipt_id: out.receiptId,
        });
      }),
  );

  server.registerTool(
    "verify_claim",
    {
      title: "Check a claim against the corpus",
      description:
        "Tries to refute one medical claim against the committed corpus (POST /v1/verify). Verdict is supported, contradicted, " +
        "mixed or insufficient_evidence. Supported means not refuted by the passages found, which is weaker than true.",
      inputSchema: {
        claim: z.string().min(1).max(2000),
        domain: z.enum(["medical", "drug_safety", "guidelines", "literature"]).optional(),
        top_k: z.number().int().min(1).max(25).optional(),
      },
    },
    async ({ claim, domain, top_k }) =>
      guarded(async () => {
        const v = await asha().verify(claim, { ...(domain ? { domain } : {}), ...(top_k ? { top_k } : {}) });
        return text(formatVerification(v), {
          verdict: v.verdict, caveat: v.caveat ?? null, scope: v.scope ?? null,
          evidence_for: v.evidence_for, evidence_against: v.evidence_against, retracted_related: v.retracted_related,
        });
      }),
  );

  server.registerTool(
    "med_check",
    {
      title: "Medication check",
      description:
        "Deterministic medication-list screen (POST /v1/clinical/med-check): interactions, duplication, dose and renal ranges, " +
        "allergies, pregnancy and lactation, high-alert flags. Lists every drug and check it could not run. " +
        "No findings means no findings in the rules checked. Free on every plan.",
      inputSchema: {
        medications: z.array(z.string().min(1)).min(1).max(50).describe("Drug names, optionally with dose (\"warfarin 5 mg\")."),
        age: z.number().min(0).max(130).optional(),
        egfr: z.number().optional(),
        pregnancy: z.boolean().optional(),
        allergies: z.array(z.string()).optional(),
        audience: z.enum(["clinician", "consumer"]).optional(),
        fhir: z.boolean().optional().describe("Also return FHIR R4 DetectedIssue resources."),
      },
    },
    async ({ medications, age, egfr, pregnancy, allergies, audience, fhir }) =>
      guarded(async () => {
        const mc = await asha().clinical.medCheck(medications, {
          ...(age != null ? { age } : {}), ...(egfr != null ? { egfr } : {}), ...(pregnancy != null ? { pregnancy } : {}),
          ...(allergies ? { allergies } : {}), ...(audience ? { audience } : {}), format: fhir ? "fhir" : "json",
        });
        return text(formatMedCheck(mc), {
          findings_text: mc.findings_text ?? null, alerts: mc.alerts, unchecked: mc.unchecked, next_step: mc.next_step ?? null,
          rule_table_version: mc.rule_table_version ?? null, ...(fhir ? { detected_issues: detectedIssues(mc) } : {}),
        });
      }),
  );

  server.registerTool(
    "search_evidence",
    {
      title: "Search the corpus",
      description:
        "Ranked evidence passages from the committed corpus (POST /v1/search) with typed references and locators. " +
        "Information retrieval only: no answer and no recommendation. Retracted items are flagged and ranked last.",
      inputSchema: {
        query: z.string().min(1).max(2000),
        top_k: z.number().int().min(1).max(50).optional(),
        year_from: z.number().int().optional(),
        source_type: z.array(z.enum(["literature", "guideline", "drug_label", "code", "dataset"])).optional(),
      },
    },
    async ({ query, top_k, year_from, source_type }) =>
      guarded(async () => {
        const filters = { ...(year_from ? { year_from } : {}), ...(source_type ? { source_type } : {}) };
        const s = await asha().search(query, { ...(top_k ? { top_k } : {}), ...(Object.keys(filters).length ? { filters } : {}) });
        const lines = s.data.map(
          (h) => `${h.rank}. [${h.type}] ${h.title ?? ""}${h.year ? ` (${h.year})` : ""}${h.locator?.pmid ? ` PMID ${h.locator.pmid}` : ""}${h.retracted ? " RETRACTED" : ""}\n   ${h.snippet ?? ""}`,
        );
        return text(lines.length ? lines.join("\n") : "No passages matched.", { data: s.data });
      }),
  );

  return server;
}
