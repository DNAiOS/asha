# Asha as a tool for your coding agent (MCP)

`asha mcp` runs a Model Context Protocol server on stdio. It reads the key saved by `asha init`, so no secret goes into your agent's config.

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
