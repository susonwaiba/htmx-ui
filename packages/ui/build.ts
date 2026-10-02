// Compiles the package's TypeScript for publishing: src/index.ts and src/theme.ts
// -> lib/*.js (ES modules) + lib/*.d.ts. CSS, macros and icons ship from src/ as-is
// (the consumer's Tailwind compiles the CSS). Bun consumers import src/ directly
// through the "bun" export condition.
import { $ } from "bun";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const dir = import.meta.dir;
const src = resolve(dir, "src");
const out = resolve(dir, "lib");
await rm(out, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [resolve(src, "index.ts"), resolve(src, "theme.ts")],
  root: src,
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

await $`bunx tsc -p tsconfig.lib.json`.cwd(dir);

for (const file of new Bun.Glob("**/*").scanSync(out)) console.log(` -> packages/ui/lib/${file}`);
