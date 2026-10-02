#!/usr/bin/env node
// htmx-ui CLI launcher. Picks the runtime, then hands over to that runtime's CLI:
//   Bun  -> src/bun/cli.ts (TypeScript, run directly; Bun.serve + Bun.build)
//   Node -> lib/node/index.js (compiled; Vite)
//
// Runtime: --bun / --node, else $HTMX_UI_RUNTIME, else Bun when Bun started us
// (bunx, or `bun run` with a node shebang, which sets npm_config_user_agent=bun/... and
// npm_execpath to bun),
// else Node. Under Node, choosing Bun re-runs this file with the `bun` on PATH.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2);
if (argv[0] === "-v" || argv[0] === "--version") {
  console.log(JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version);
  process.exit(0);
}
const flag = argv.includes("--bun") ? "bun" : argv.includes("--node") ? "node" : null;
const isBun = typeof globalThis.Bun !== "undefined";
// npm reads inherited npm_config_* variables as its own config, so a user agent of
// "bun/..." can leak into npm run from a Bun parent process; npm_execpath is the
// package manager actually running the script.
const execpath = (process.env.npm_execpath ?? "").split(/[\\/]/).pop() ?? "";
const startedByBun = (process.env.npm_config_user_agent ?? "").startsWith("bun/") && (!execpath || /^bunx?(\.exe)?$/.test(execpath));
const runtime = flag ?? process.env.HTMX_UI_RUNTIME ?? (isBun || startedByBun ? "bun" : "node");

if (runtime === "bun" && !isBun) {
  const bun = process.env.HTMX_UI_BUN ?? "bun";
  const child = spawn(bun, [fileURLToPath(import.meta.url), ...argv], { stdio: "inherit" });
  child.on("error", () => {
    console.error(`htmx-ui: could not start Bun (${bun}). Install it from https://bun.sh, or run on Node with --node.`);
    process.exit(1);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
  child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
} else {
  const entry = runtime === "bun" ? "../src/bun/cli.ts" : "../lib/node/index.js";
  try {
    const { main } = await import(entry);
    const code = await main(argv.filter((a) => a !== "--bun" && a !== "--node"));
    process.exit(code);
  } catch (e) {
    console.error(`htmx-ui: ${e instanceof Error ? e.message : e}`);
    if (process.env.DEBUG) console.error(e);
    process.exit(1);
  }
}
