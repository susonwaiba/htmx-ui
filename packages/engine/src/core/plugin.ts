// Plugins: optional features packaged on top of the engine.
//
//   import { defineConfig } from "htmx-ui-engine";
//   import docs from "htmx-ui-plugin-docs";
//   export default defineConfig({ plugins: [docs()] });
//
// A plugin is an object with a name and any of the hooks below. Most of them are the
// config's own options (globals, filters, transform, routes, fetch, build.done), so a
// plugin can do anything a config can, and resolveConfig() merges plugins into the
// config once. Every runtime and adapter reads the merged config, so a plugin works in
// `htmx-ui dev`, `htmx-ui build`, Vite and createSite() alike without knowing which.
//
// The project's own options always win: its routes, globals and filters override a
// plugin's, its fetch runs before theirs, its transform after theirs (seeing their
// output), and its build.done last. Between plugins, the order of `plugins` decides.
//
// Plugin code that runs in the config (everything here) runs on Node under the Vite
// adapter, so it uses node: APIs only; `editHtml()` (./html.ts) edits rendered pages.

import type { BuildContext, Handler, ResolvedConfig, RootSpec, UserConfig } from "./config";

export interface CommandContext {
  config: ResolvedConfig;
  /** Positional arguments after the command: `htmx-ui versions:name 0.2.0` -> ["0.2.0"]. */
  args: string[];
  /** Options after the command, as parsed: `--force` -> { force: true }, `--to=x` -> { to: "x" }. */
  options: Record<string, string | boolean | undefined>;
  /** Build the site the way `htmx-ui build` does, on the runtime the CLI is running on. */
  build(): Promise<boolean>;
}

/** A command a plugin adds to the CLI: `htmx-ui <name> [args]`. */
export interface Command {
  /** One line for `htmx-ui --help`. */
  description: string;
  /** Arguments, for the help text: "<x.y.z>". */
  usage?: string;
  /** Return (or resolve to) the exit code; nothing means 0. */
  run(ctx: CommandContext): number | void | Promise<number | void>;
}

export interface Plugin {
  /** Unique, e.g. "docs". Other plugins find this one by it (see `api`). */
  name: string;
  /**
   * Template roots, searched after the project's own and before htmx-ui's src/, so a
   * project overrides any template a plugin ships by having a file with its name.
   * Absolute, or relative to the project root. Put templates in a directory named
   * after the plugin ("search/palette.html") so they cannot collide with others.
   */
  roots?: RootSpec[];
  /** Nunjucks globals and filters, under the project's own. */
  globals?: Record<string, unknown>;
  filters?: Record<string, (...args: any[]) => unknown>;
  /** Post-process every rendered page. Runs before the project's own transform. */
  transform?: (html: string, page: { file: string; url: string }) => string;
  /** Request handlers, as in the config. The project's own routes win on the same pattern. */
  routes?: Record<string, Handler>;
  /** Fallback for requests nothing else answered. Runs after the project's own fetch. */
  fetch?: (req: Request) => Response | null | undefined | Promise<Response | null | undefined>;
  build?: {
    /** Runs after a production build, before the project's own build.done. */
    done?: (ctx: BuildContext) => void | Promise<void>;
  };
  /** CLI commands, by name: `{ "versions:archive": { ... } }` is `htmx-ui versions:archive`. */
  commands?: Record<string, Command>;
  /**
   * Called with the resolved config before anything is rendered, served or built.
   * Keep it here for hooks that need it (the pages, outDir, the other plugins).
   */
  configResolved?(config: ResolvedConfig): void;
  /** Whatever the plugin offers other plugins: `config.plugins.find((p) => p.name === "docs")?.api`. */
  api?: unknown;
}

/** What `plugins` takes: plugins, arrays of them, and falsy entries (`isProd && plugin()`). */
export type PluginOption = Plugin | false | null | undefined | PluginOption[];

/** Type a plugin. Returns it unchanged. */
export function definePlugin<T extends Plugin>(plugin: T): T {
  return plugin;
}

/** The engine's own commands, which a plugin can't replace. */
export const BUILTIN_COMMANDS = ["dev", "build", "preview", "help", "version"];

/** `plugins` as a flat list, falsy entries dropped. Refuses unnamed plugins and duplicate names. */
export function flattenPlugins(options: PluginOption[] = []): Plugin[] {
  const out: Plugin[] = [];
  const walk = (list: PluginOption[]) => {
    for (const p of list) {
      if (Array.isArray(p)) walk(p);
      else if (p) out.push(p);
    }
  };
  walk(options);
  const names = new Set<string>();
  for (const p of out) {
    if (!p.name) throw new Error("[htmx-ui] a plugin has no name");
    if (names.has(p.name)) throw new Error(`[htmx-ui] plugin "${p.name}" is listed twice`);
    names.add(p.name);
  }
  return out;
}

/** Every plugin command, by name. Two plugins claiming one name, or a built-in, is an error. */
export function commandsOf(plugins: Plugin[]): Record<string, Command & { plugin: string }> {
  const out: Record<string, Command & { plugin: string }> = {};
  for (const p of plugins) {
    for (const [name, command] of Object.entries(p.commands ?? {})) {
      if (BUILTIN_COMMANDS.includes(name)) throw new Error(`[htmx-ui] plugin "${p.name}" can't replace the built-in "${name}" command`);
      if (out[name]) throw new Error(`[htmx-ui] plugins "${out[name].plugin}" and "${p.name}" both add the "${name}" command`);
      out[name] = { ...command, plugin: p.name };
    }
  }
  return out;
}

/**
 * The project's config with its plugins merged in, as the engine reads it: everything
 * except `roots`, which resolveConfig() places itself. See the top of this file for
 * the order.
 */
export function applyPlugins(user: UserConfig, plugins: Plugin[]): UserConfig {
  if (!plugins.length) return user;
  const merged = <T>(pick: (from: Plugin | UserConfig) => Record<string, T> | undefined): Record<string, T> | undefined => {
    const all = [...plugins, user].map(pick).filter(Boolean) as Record<string, T>[];
    return all.length ? Object.assign({}, ...all) : undefined;
  };

  const transforms = [...plugins.map((p) => p.transform), user.transform].filter((t) => !!t) as NonNullable<Plugin["transform"]>[];
  const fetches = [user.fetch, ...plugins.map((p) => p.fetch)].filter((f) => !!f) as NonNullable<Plugin["fetch"]>[];
  const dones = [...plugins.map((p) => p.build?.done), user.build?.done].filter((d) => !!d) as NonNullable<Plugin["build"]>["done"][];

  return {
    ...user,
    globals: merged((c) => c.globals),
    filters: merged((c) => c.filters),
    routes: merged((c) => c.routes),
    transform: transforms.length ? (html, page) => transforms.reduce((out, t) => t(out, page), html) : undefined,
    fetch: fetches.length
      ? async (req) => {
          for (const f of fetches) {
            const res = await f(req);
            if (res) return res;
          }
          return null;
        }
      : undefined,
    build: dones.length
      ? {
          ...user.build,
          async done(ctx) {
            for (const d of dones) await d!(ctx);
          },
        }
      : user.build,
  };
}
