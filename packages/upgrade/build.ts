// Compiles htmx-ui-upgrade for Node: src/index.ts (the API) and src/cli.ts (the command,
// run by bin/htmx-ui-upgrade.js) -> lib/*.js (ES modules) + lib/*.d.ts. Bun runs src/
// directly (the launcher, and the "bun" export condition).
import { $ } from "bun";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const dir = import.meta.dir;
const src = resolve(dir, "src");
const out = resolve(dir, "lib");
await rm(out, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [resolve(src, "index.ts"), resolve(src, "cli.ts")],
  root: src,
  outdir: out,
  target: "node",
  format: "esm",
  splitting: true,
  sourcemap: "linked",
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await $`bunx tsc -p tsconfig.lib.json`.cwd(dir);

for (const file of new Bun.Glob("**/*").scanSync(out)) console.log(` -> packages/upgrade/lib/${file}`);
