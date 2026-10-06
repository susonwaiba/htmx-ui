// Compiles an official plugin package for Node, run from its directory by its
// "build" script (bun run build:lib builds the engine and htmx-ui first):
//   src/index.ts  (the engine plugin, loaded by the config) -> lib/index.js
//   src/client.ts (the browser module)                      -> lib/client.js
// plus lib/*.d.ts. Dependencies stay external. Templates and CSS ship from src/ as-is;
// the plugins find their templates through ../src/templates from either directory.
// Bun runs src/ directly (the "bun" export condition).
import { $ } from "bun";
import { rm } from "node:fs/promises";
import { basename, resolve } from "node:path";

const dir = process.cwd();
const src = resolve(dir, "src");
const out = resolve(dir, "lib");
const name = basename(dir);
await rm(out, { recursive: true, force: true });

for (const [entry, target] of [["index.ts", "node"], ["client.ts", "browser"]] as const) {
  const result = await Bun.build({
    entrypoints: [resolve(src, entry)],
    root: src,
    outdir: out,
    target,
    format: "esm",
    packages: "external",
    sourcemap: "linked",
  });
  if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
  }
}

await $`bunx tsc -p tsconfig.lib.json`.cwd(dir);

for (const file of new Bun.Glob("**/*.{js,d.ts}").scanSync(out)) console.log(` -> packages/${name}/lib/${file}`);
