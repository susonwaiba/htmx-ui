// `htmx-ui dev` on Bun. Bun.serve only takes bundler plugins from bunfig.toml
// ([serve.static] plugins), so this writes one to node_modules/.cache/htmx-ui/
// with the htmx-ui plugin first and bun-plugin-tailwind second (plus any plugins
// and env setting from the project's own bunfig.toml), then runs the server with it.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, resolve } from "node:path";
import type { ResolvedConfig } from "../core/config";

const here = import.meta.dir;
const toml = (s: string) => JSON.stringify(s); // TOML basic strings share JSON's escapes

/** Absolute path of `name` as the project resolves it, or null. */
function resolveFrom(root: string, name: string): string | null {
  try {
    return Bun.resolveSync(name, root);
  } catch {
    return null;
  }
}

export function bunfig(config: ResolvedConfig): string {
  const plugins = [resolve(here, "serve-plugin.ts")];
  const tailwind = resolveFrom(config.root, "bun-plugin-tailwind");
  if (tailwind) plugins.push(tailwind);
  else console.warn("htmx-ui: bun-plugin-tailwind is not installed; serving without Tailwind (bun add -d bun-plugin-tailwind tailwindcss)");

  let env: string | undefined;
  const own = resolve(config.root, "bunfig.toml");
  if (existsSync(own)) {
    const parsed = Bun.TOML.parse(readFileSync(own, "utf8")) as { serve?: { static?: { plugins?: string[]; env?: string } } };
    const extra = parsed.serve?.static?.plugins ?? [];
    for (const p of extra) {
      if (/bun-plugin-tailwind/.test(p) || /htmx-ui-engine/.test(p)) continue;
      plugins.push(p.startsWith(".") ? resolve(config.root, p) : isAbsolute(p) ? p : (resolveFrom(config.root, p) ?? p));
    }
    env = parsed.serve?.static?.env;
  }
  return ["[serve.static]", `plugins = [${plugins.map(toml).join(", ")}]`, ...(env ? [`env = ${toml(env)}`] : []), ""].join("\n");
}

export async function dev(config: ResolvedConfig): Promise<number> {
  const modules = resolve(config.root, "node_modules");
  const cache = existsSync(modules) ? resolve(modules, ".cache/htmx-ui") : resolve(tmpdir(), "htmx-ui", Bun.hash(config.root).toString(36));
  mkdirSync(cache, { recursive: true });
  const file = resolve(cache, "bunfig.toml");
  await Bun.write(file, bunfig(config));

  const proc = Bun.spawn([process.execPath, `--config=${file}`, "--hot", resolve(here, "dev-server.ts")], {
    cwd: config.root,
    env: { ...process.env, PORT: String(config.port), HTMX_UI_DEV: "1" },
    stdio: ["inherit", "inherit", "inherit"],
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => proc.kill(signal));
  return proc.exited;
}

