import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Asha } from "askasha";
import { describe, expect, it } from "vitest";

import { createServer } from "../src/server";

const FX = JSON.parse(readFileSync(new URL("../../../sdk/python/tests/fixtures.json", import.meta.url), "utf8"));

function mockFetch(seen: string[]) {
  return async (input: string | URL | Request, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const path = new URL(req.url).pathname;
    seen.push(path);
    const body: Record<string, unknown> = {
      "/v1/chat/completions": FX.chat, "/v1/verify": FX.verify, "/v1/clinical/med-check": FX.med_check, "/v1/search": FX.search,
    };
    const hit = body[path];
    return new Response(JSON.stringify(hit ?? { error: { message: "no", code: "not_found" } }), {
      status: hit ? 200 : 404, headers: { "content-type": "application/json", "x-request-id": "req_mcp" },
    });
  };
}

async function connect() {
  const seen: string[] = [];
  const server = createServer({ client: new Asha({ apiKey: "k", baseURL: "https://mock.askasha.test", fetch: mockFetch(seen) }) });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(a), client.connect(b)]);
  return { client, seen };
}

const textOf = (r: any) => r.content.map((c: any) => c.text).join("\n");

describe("@askasha/mcp", () => {
  it("lists the four tools", async () => {
    const { client } = await connect();
    const names = (await client.listTools()).tools.map((t) => t.name).sort();
    expect(names).toEqual(["ask_asha", "med_check", "search_evidence", "verify_claim"]);
  });

  it("ask_asha returns text, references and a receipt", async () => {
    const { client, seen } = await connect();
    const r: any = await client.callTool({ name: "ask_asha", arguments: { question: "First-line drug for hypertension?" } });
    expect(seen).toEqual(["/v1/chat/completions"]);
    expect(textOf(r)).toContain("References:");
    expect(textOf(r)).toMatch(/Receipt: rcpt_/);
    expect(r.structuredContent.references.length).toBeGreaterThan(0);
  });

  it("verify_claim never calls a claim true", async () => {
    const { client } = await connect();
    const r: any = await client.callTool({ name: "verify_claim", arguments: { claim: "Metformin is first-line." } });
    const t = textOf(r);
    expect(t).toContain("Verdict: supported");
    expect(t).toContain("weaker than true");
    expect(t.toLowerCase()).not.toMatch(/\bverified\b/);
  });

  it("med_check lists findings, unchecked items and FHIR resources", async () => {
    const { client } = await connect();
    const r: any = await client.callTool({ name: "med_check", arguments: { medications: ["warfarin", "fluconazole"], fhir: true } });
    const t = textOf(r);
    expect(t).toContain("[major] INR elevation");
    expect(t).toContain("Not checked:");
    expect(t.toLowerCase()).not.toMatch(/\bsafe\b/);
    expect(r.structuredContent.detected_issues[0].resourceType).toBe("DetectedIssue");
  });

  it("search_evidence and API errors", async () => {
    const { client } = await connect();
    const r: any = await client.callTool({ name: "search_evidence", arguments: { query: "AF with CKD", top_k: 2 } });
    expect(textOf(r)).toMatch(/^1\. \[literature\]/);
  });
});
