// Argument parsing, help and plugin commands, shared by both runtimes' CLIs
// (src/bun/cli.ts, src/node/index.ts).
import { parseArgs } from "node:util";
import type { ResolvedConfig } from "./config";
import { BUILTIN_COMMANDS, commandsOf } from "./plugin";

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
  /** A built-in command, or the name of one a plugin adds. */
  command: Command | "help" | "version" | (string & {});
  port?: number;
  root: string;
  /** Plugin commands: positional arguments after the command name. */
  args: string[];
  /** Plugin commands: every option given, as parsed. */
  options: Record<string, string | boolean | undefined>;
}

const OPTIONS = {
  port: { type: "string" },
  root: { type: "string" },
  bun: { type: "boolean" },
  node: { type: "boolean" },
  help: { type: "boolean", short: "h" },
  version: { type: "boolean", short: "v" },
} as const;

export function parse(argv: string[]): Args {
  // Lenient first, since a plugin command takes options the engine doesn't know.
  const loose = parseArgs({ args: argv, allowPositionals: true, strict: false, options: OPTIONS });
  const name = loose.positionals[0];
  const builtin = !name || BUILTIN_COMMANDS.includes(name);
  if (name && !builtin && !/^[a-z][\w:-]*$/i.test(name)) throw new Error(`Unknown command "${name}". Run htmx-ui --help.`);
  // The engine's own commands keep strict parsing, so a mistyped option is an error.
  const { values, positionals } = builtin ? parseArgs({ args: argv, allowPositionals: true, options: OPTIONS }) : loose;
  const command = values.help ? "help" : values.version ? "version" : (positionals[0] ?? "help");
  const port = values.port === undefined ? undefined : Number(values.port);
  if (port !== undefined && !Number.isInteger(port)) throw new Error(`--port must be a number, got "${values.port}"`);
  return {
    command,
    port,
    root: typeof values.root === "string" ? values.root : process.cwd(),
    args: positionals.slice(1),
    options: values as Args["options"],
  };
}

/** The help text, plus the commands the project's plugins add. */
export function help(config?: ResolvedConfig): string {
  const commands = config ? Object.entries(commandsOf(config.plugins)) : [];
  if (!commands.length) return HELP;
  const width = Math.max(...commands.map(([name, c]) => `${name} ${c.usage ?? ""}`.trim().length)) + 2;
  const lines = commands.map(([name, c]) => `  ${`${name} ${c.usage ?? ""}`.trim().padEnd(width)}${c.description} (${c.plugin})`);
  return HELP.replace("\n\nOptions:", `\n\nPlugin commands:\n${lines.join("\n")}\n\nOptions:`);
}

/** Run a command a plugin adds. `build` is the runtime's own `htmx-ui build`. */
export async function runCommand(config: ResolvedConfig, args: Args, build: (config: ResolvedConfig) => Promise<boolean>): Promise<number> {
  const command = commandsOf(config.plugins)[args.command];
  if (!command) throw new Error(`Unknown command "${args.command}". Run htmx-ui --help.`);
  const code = await command.run({ config, args: args.args, options: args.options, build: () => build(config) });
  return typeof code === "number" ? code : 0;
}
