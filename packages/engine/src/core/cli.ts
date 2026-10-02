// Argument parsing and help shared by both runtimes' CLIs (src/bun/cli.ts, src/node/cli.ts).
import { parseArgs } from "node:util";

export const HELP = `htmx-ui: build htmx sites from Nunjucks pages, on Bun or Node.

Usage: htmx-ui <command> [options]

Commands:
  dev       start the dev server (HMR, Tailwind, dev routes)
  build     build every page to the output directory
  preview   serve the built output

Options:
  --port <n>     port for dev/preview (default 3000, or $PORT)
  --root <dir>   project root (default: the current directory)
  --bun          run on Bun (needs bun on PATH)
  --node         run on Node (needs vite, and @tailwindcss/vite for Tailwind)
  -h, --help     show this help
  -v, --version  print the version

The runtime defaults to Bun when started by Bun (bun run, bunx), otherwise Node.
Config: htmx-ui.config.{ts,mts,js,mjs} in the project root (optional).`;

export type Command = "dev" | "build" | "preview";

export interface Args {
  command: Command | "help" | "version";
  port?: number;
  root: string;
}

export function parse(argv: string[]): Args {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      port: { type: "string" },
      root: { type: "string" },
      bun: { type: "boolean" },
      node: { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  const command = values.help ? "help" : values.version ? "version" : (positionals[0] ?? "help");
  if (!["dev", "build", "preview", "help", "version"].includes(command)) {
    throw new Error(`Unknown command "${command}". Run htmx-ui --help.`);
  }
  const port = values.port === undefined ? undefined : Number(values.port);
  if (port !== undefined && !Number.isInteger(port)) throw new Error(`--port must be a number, got "${values.port}"`);
  return { command: command as Args["command"], port, root: values.root ?? process.cwd() };
}
