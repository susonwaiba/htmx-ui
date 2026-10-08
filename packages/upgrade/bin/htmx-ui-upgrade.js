#!/usr/bin/env node
// htmx-ui-upgrade launcher. Bun runs the TypeScript source (src/cli.ts) directly, so it
// works in this repo without a build; Node runs the compiled lib/cli.js.
const entry = typeof globalThis.Bun !== "undefined" ? "../src/cli.ts" : "../lib/cli.js";

try {
  const { main } = await import(entry);
  process.exit(await main(process.argv.slice(2)));
} catch (e) {
  console.error(`htmx-ui-upgrade: ${e instanceof Error ? e.message : e}`);
  if (process.env.DEBUG) console.error(e);
  process.exit(1);
}
