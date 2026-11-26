# Asha as a tool for your coding agent (MCP)

Two Model Context Protocol servers give an agent Asha over stdio. Pick one.

| Server | Install | Tools | Best for |
|---|---|---|---|
| `@askasha/mcp` (this folder, npm) | `npx -y @askasha/mcp` with `ASHA_API_KEY` set | `ask_asha`, `verify_claim`, `med_check`, `search_evidence` | Agents that build clinical features: answers, claim checks, medication checks, evidence search |
| `asha mcp` (the `asha` CLI) | `curl -fsSL https://askasha.org/cli/install.sh \| sh` then `asha init` | `ask_asha`, `asha_usage`, `asha_preferences`, `asha_docs`, `asha_baa`, `asha_topup` | Account work: usage, saved settings, docs search, BAA status, top-ups |

## `@askasha/mcp`

```bash
export ASHA_API_KEY=dnai_a2a_...            # free key: https://askasha.org/developers
claude mcp add asha -e ASHA_API_KEY=$ASHA_API_KEY -- npx -y @askasha/mcp
codex mcp add asha --env ASHA_API_KEY=$ASHA_API_KEY -- npx -y @askasha/mcp
```

Cursor (`~/.cursor/mcp.json`) and Claude Desktop take the same block:

```json
{
  "mcpServers": {
    "asha": { "command": "npx", "args": ["-y", "@askasha/mcp"], "env": { "ASHA_API_KEY": "dnai_a2a_..." } }
  }
}
```

| Tool | Endpoint | What it returns | Billing |
|---|---|---|---|
| `ask_asha` | `POST /v1/chat/completions` | Answer text with `[n]` markers, the references behind them, any escalation message, receipt id. Memory is off for tool calls. | One answer |
| `verify_claim` | `POST /v1/verify` | Verdict (`supported`, `contradicted`, `mixed`, `insufficient_evidence`), scope, caveat, passages for and against. Supported means not refuted by the passages found, which is weaker than true. | One claim |
| `med_check` | `POST /v1/clinical/med-check` | Findings with severity, mechanism and source; every check it could not run; the next step; FHIR R4 DetectedIssue resources with `fhir: true`. No findings means no findings in the rules checked. | Free |
| `search_evidence` | `POST /v1/search` | Ranked passages with type, year, locator (PMID, DOI, URL); retracted items flagged. No answer. | One search |

Every tool returns readable text plus `structuredContent` for agents that parse JSON. Send de-identified text only: PHI mode is closed.

Develop: `npm install` at the repo root (workspaces link the local `askasha` SDK), then `npm test` and `npm run build` here.

## `asha mcp` (CLI)

`asha mcp` reads the key saved by `asha init`, so no secret goes into your agent's config.

```bash
curl -fsSL https://askasha.org/cli/install.sh | sh   # one Python file, standard library only
asha init                                           # key, saved settings, first answer
asha mcp add cursor                                 # prints the exact line for your agent
```

| Agent | Setup |
|---|---|
| Claude Code | `claude mcp add asha -- asha mcp` |
| Codex | `codex mcp add asha -- asha mcp` |
| Gemini CLI | `gemini mcp add asha asha mcp` |
| VS Code | `code --add-mcp '{"name":"asha","command":"asha","args":["mcp"]}'` |
| Cursor | [`cursor.mcp.json`](cursor.mcp.json) into `~/.cursor/mcp.json` |
| Claude Desktop | [`claude_desktop_config.json`](claude_desktop_config.json), with the full path from `which asha` |

| Tool | What it does | Uses a query |
|---|---|---|
| `ask_asha` | Cited answer, sources, task id | Yes |
| `asha_usage` | Plan, remaining queries, rate limit, balance | No |
| `asha_preferences` | Get, set or reset the key's saved settings | No |
| `asha_docs` | Searches the API docs by topic | No |
| `asha_baa` | BAA version, SHA-256, acceptance status (read-only) | No |
| `asha_topup` | Stripe Checkout link for credits or a plan | No |
