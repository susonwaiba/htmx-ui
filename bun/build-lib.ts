// Compiles the package's TypeScript for publishing: src/index.ts and src/theme.ts
// -> lib/*.js (ES modules) + lib/*.d.ts. CSS, macros and icons ship from src/ as-is
// (the consumer's Tailwind compiles the CSS).
import { $ } from "bun";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { ROOT, SRC } from "./paths";

const out = resolve(ROOT, "lib");
await rm(out, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [resolve(SRC, "index.ts"), resolve(SRC, "theme.ts")],
  root: SRC,
  outdir: out,
  target: "browser",
  format: "esm",
  splitting: true,
  sourcemap: "linked",
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await $`bunx tsc -p tsconfig.lib.json`;

for (const file of new Bun.Glob("**/*").scanSync(out)) console.log(` -> lib/${file}`);
