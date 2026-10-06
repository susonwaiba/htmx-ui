// Compiles the engine for Node: src/index.ts, src/node/index.ts (the CLI),
// src/node/vite-plugin.ts and the server adapters -> lib/ (ES modules + .d.ts).
// Dependencies stay external. Bun runs src/ directly (the "bun" export condition and
// bin/htmx-ui.js), so the Bun adapter (src/bun/) is not compiled.
import { $ } from "bun";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const dir = import.meta.dir;
const src = resolve(dir, "src");
const out = resolve(dir, "lib");
await rm(out, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ["index.ts", "node/index.ts", "node/vite-plugin.ts", "express.ts", "elysia.ts", "hono.ts", "fastify.ts", "koa.ts"].map((f) => resolve(src, f)),
  root: src,
  outdir: out,
  target: "node",
  format: "esm",
  splitting: true,
  packages: "external",
  sourcemap: "linked",
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await $`bunx tsc -p tsconfig.lib.json`.cwd(dir);

for (const file of new Bun.Glob("**/*.{js,d.ts}").scanSync(out)) console.log(` -> packages/engine/lib/${file}`);
