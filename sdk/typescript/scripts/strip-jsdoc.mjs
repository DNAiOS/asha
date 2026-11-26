// Removes JSDoc blocks from the generated OpenAPI types so the package ships
// field names and enums only; the prose lives in the OpenAPI document itself.
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
const src = readFileSync(file, "utf8");
const out = src
  .replace(/\/\*\*[\s\S]*?\*\//g, "")
  .split("\n")
  .filter((line) => line.trim() !== "")
  .join("\n");
writeFileSync(file, `${out}\n`, "utf8");
