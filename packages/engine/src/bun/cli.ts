// The htmx-ui CLI on Bun. bin/htmx-ui.js imports this when running under Bun.
import { help, parse, runCommand } from "../core/cli";
import { loadConfig } from "../core/config";
import { build } from "./build";
import { dev } from "./dev";
import { preview } from "./preview";

export async function main(argv: string[]): Promise<number> {
  const args = parse(argv);
  // Help lists the project's plugin commands too, when there is a config to read them from.
  if (args.command === "help") return console.log(help(await loadConfig(args.root).catch(() => undefined))), 0;
  if (args.command === "version") return 0; // bin/htmx-ui.js prints it
  const config = await loadConfig(args.root);
  if (args.port) config.port = args.port;
  if (args.command === "dev") return dev(config);
  if (args.command === "build") return (await build(config)) ? 0 : 1;
  if (args.command === "preview") {
    preview(config);
    return new Promise(() => {}); // serve until killed
  }
  return runCommand(config, args, build);
}
