#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer } from "./server.js";

if (!process.env.ASHA_API_KEY && !process.env.DNAI_API_KEY) {
  console.error("askasha-mcp: set ASHA_API_KEY (free key: https://askasha.org/developers).");
  process.exit(1);
}

await createServer().connect(new StdioServerTransport());
