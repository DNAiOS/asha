import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts", "src/cli.ts"],
  format: ["esm"],
  dts: { entry: ["src/server.ts"] },
  clean: true,
  target: "es2022",
  external: ["askasha", "@modelcontextprotocol/sdk", "zod"],
});
