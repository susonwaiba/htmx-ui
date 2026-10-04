// Project configuration: htmx-ui.config.{ts,mts,js,mjs} in the project root.
//
//   import { defineConfig } from "htmx-ui-engine";
//   export default defineConfig({ pages: "pages", outDir: "dist" });
//
// Every option is optional; a project with only pages/ needs no config file.
// Shared by both runtimes. Loading differs (Bun imports TypeScript directly; on
// Node the Vite adapter bundles the file first), so loadConfig takes an importer.

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { logger, type Debug, type Logger } from "./debug";
import { normalizeRoots, render, type RenderOptions, type TemplateRoot } from "./render";
import { findPages, routeFor, type Page } from "./routes";
import { verToken } from "./ver";

/** Request handler for a dev route. Bun.serve's signature: a web Request in, a Response out. */
export type Handler = (req: Request & { params: Record<string, string> }) => Response | Promise<Response>;

export interface BuildContext {
  config: ResolvedConfig;
  /** Absolute output directory. */
  outDir: string;
  /** Every page that was built. */
  pages: Page[];
}

/**
 * One search root: a directory, or a directory with the name templates reach it
 * by. Relative to the project root unless absolute.
 *
 * Give a root a name when the directory is likely to move and you don't want the
 * move to reach every template: `{ name: "layouts", dir: "new-layouts-2026" }`
 * keeps `{% extends "layouts/base.html" %}` working. A name must be a single
 * directory name, unique across the roots, and is not a path.
 */
export type RootSpec = string | { name?: string; dir: string };

export interface UserConfig {
  /**
   * Directories templates, data, icons and assets are found in, searched in order.
   *
   * The first entry is the project root: `pages`, `outDir`, `publicDir` and
   * `asset()` URLs are relative to it, and it is the Vite root and Bun's cwd. Every
   * entry is also a template root, so a template reaches a directory either by its
   * path or by its name.
   *
   * The dev server watches these and nothing else, so naming the directories a
   * project renders from keeps it off `node_modules`, `public/` and the build
   * output. That is the other half of the point: moving a directory between dev and
   * production is a change to this list, not to the templates.
   *
   * Default `["."]`.
   */
  roots?: RootSpec[];
  /** Directory of routes, relative to the first root. Default "pages". */
  pages?: string;
  /**
   * Add the installed htmx-ui package's src/ as the last template root, so its
   * macros ({% from "components/icon/icon.html" import icon %}) and icons resolve.
   * Default true (skipped when htmx-ui isn't installed).
   */
  ui?: boolean;
  /** Build output directory, relative to the project root. Default "dist". */
  outDir?: string;
  /** Files served at / in dev and copied to outDir as-is. Default "public"; false to disable. */
  publicDir?: string | false;
  /** Public site URL, the `origin` template global. $SITE_URL overrides it. */
  url?: string;
  /** Dev server port. $PORT overrides it. Default 3000. */
  port?: number;
  /**
   * This deployment renders templates at runtime, so `site.render()` and
   * `site.fragment()` are load-bearing rather than incidental. Set it in a
   * deployment whose config sits next to the built site instead of the source
   * tree — the site it serves has already been rendered to `outDir`, and only
   * fragments are rendered per request. Where the templates are comes from
   * `roots` and `pages`; `htmx-ui build` does not copy them.
   *
   * It changes one thing: `createSite()` checks at startup that the roots and the
   * pages it is about to render from are really there, and says what to copy if
   * they are not. Without it a deployment missing its templates starts happily,
   * finds no pages, and only fails on the first fragment request.
   */
  render?: boolean;
  /**
   * Log what the engine is doing: requests, renders, template compiles and
   * builds. `true` for everything, or a list of topics to narrow it down.
   * Off by default.
   */
  debug?: Debug;
  /** Extra Nunjucks globals and filters. */
  globals?: Record<string, unknown>;
  filters?: Record<string, (...args: any[]) => unknown>;
  /** Post-process every rendered page (dev and build, both runtimes). */
  transform?: (html: string, page: { file: string; url: string }) => string;
  /**
   * Request handlers, e.g. mock endpoints returning HTML fragments for
   * hx-get/hx-post. Keys use Bun.serve route syntax: "/api/users/:id", "/files/*".
   * Served by the dev servers, and by your own server when you mount htmx-ui on it
   * (createSite()), but never by the static build itself.
   */
  routes?: Record<string, Handler>;
  /** Fallback for requests no page, route or file matched. Return null for a 404. */
  fetch?: (req: Request) => Response | null | undefined | Promise<Response | null | undefined>;
  build?: {
    /** Default true. */
    minify?: boolean;
    /** Default "linked". */
    sourcemap?: "none" | "linked" | "external" | "inline";
    /** Compile-time replacements, e.g. { "process.env.API": '"https://…"' }. */
    define?: Record<string, string>;
    /** Runs after a production build, e.g. to write extra files into outDir. */
    done?: (ctx: BuildContext) => void | Promise<void>;
  };
  /** Node runtime only: extra Vite config, merged over the engine's. */
  vite?: Record<string, unknown>;
}

export interface ResolvedConfig {
  /** Absolute project root: the first entry of `roots`. */
  root: string;
  /** The config file, if there was one. */
  file: string | null;
  pagesDir: string;
  /** Every root, in search order, with the names templates reach them by. */
  roots: TemplateRoot[];
  /** htmx-ui's src/ when it is a template root. */
  uiDir: string | null;
  outDir: string;
  publicDir: string | null;
  origin: string;
  port: number;
  /** The project's own version from package.json, "" when it declares none. */
  version: string;
  /** The `?ver=` token assetVer() appends. The version in a build; a dev server adds a random suffix. */
  ver: string;
  user: UserConfig;
  /** Built from `user.debug`; what core/, the dev servers and build log through. */
  debug: Logger;
  /** `user.render`: this deployment renders templates at runtime. */
  render: boolean;
}

export function defineConfig(config: UserConfig): UserConfig {
  return config;
}

export const CONFIG_FILES = ["htmx-ui.config.ts", "htmx-ui.config.mts", "htmx-ui.config.js", "htmx-ui.config.mjs"];

export function findConfigFile(root: string): string | null {
  for (const name of CONFIG_FILES) {
    const file = resolve(root, name);
    if (existsSync(file)) return file;
  }
  return null;
}

/** htmx-ui's src/ as installed for `root`, or null. */
export function findUi(root: string): string | null {
  try {
    const require = createRequire(resolve(root, "package.json"));
    const src = resolve(dirname(require.resolve("htmx-ui/package.json")), "src");
    return existsSync(src) ? src : null;
  } catch {
    return null;
  }
}

/** The project's own version from <root>/package.json, "" when it declares none. */
export function projectVersion(root: string): string {
  try {
    const { version } = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    return typeof version === "string" ? version : "";
  } catch {
    return "";
  }
}

export function resolveConfig(user: UserConfig, root: string, file: string | null = null): ResolvedConfig {
  root = resolve(root);
  // The first root is the project root: it decides where pages, outDir, publicDir and
  // asset() URLs are measured from, and the rest are extra places to look.
  const specs = user.roots ?? ["."];
  if (!specs.length) throw new Error("[htmx-ui] roots is empty: name at least the project directory");
  const roots = normalizeRoots(
    specs.map((s) => (typeof s === "string" ? resolve(root, s) : { ...s, dir: resolve(root, s.dir) })),
  );
  const primary = roots[0]!.dir;

  const uiDir = user.ui === false ? null : findUi(primary);
  if (uiDir && !roots.some((r) => r.dir === uiDir)) roots.push({ dir: uiDir });
  const publicDir = user.publicDir === false ? null : resolve(primary, user.publicDir ?? "public");
  const version = projectVersion(primary);
  return {
    root: primary,
    file,
    pagesDir: resolve(primary, user.pages ?? "pages"),
    roots,
    uiDir,
    outDir: resolve(primary, user.outDir ?? "dist"),
    publicDir: publicDir && existsSync(publicDir) ? publicDir : null,
    origin: (process.env.SITE_URL ?? user.url ?? "").replace(/\/$/, ""),
    port: Number(process.env.PORT ?? user.port ?? 3000),
    version,
    ver: verToken(version),
    user,
    debug: logger(user.debug),
    render: user.render === true,
  };
}

export type Importer = (file: string) => Promise<unknown>;

const nativeImport: Importer = async (file) => ((await import(pathToFileURL(file).href)) as { default?: unknown }).default;

/** Find, import and resolve the project's config. */
export async function loadConfig(root = process.cwd(), importer: Importer = nativeImport): Promise<ResolvedConfig> {
  const file = findConfigFile(root);
  let user: UserConfig = {};
  if (file) {
    const loaded = await importer(file);
    user = (typeof loaded === "function" ? await loaded() : loaded) ?? {};
  }
  return resolveConfig(user, root, file);
}

/** Render options for the project's pages. `asset` lets an adapter change asset() URLs. */
export function renderOptions(
  config: ResolvedConfig,
  asset?: RenderOptions["asset"],
  context?: RenderOptions["context"],
  cache?: boolean,
): RenderOptions {
  const { globals, filters } = config.user;
  return { roots: config.roots, pages: config.pagesDir, origin: config.origin, globals, filters, asset, ver: config.ver, cache, context, debug: config.debug };
}

/** Render a page the way both runtimes do: Nunjucks, then the config's transform. */
export function renderPage(
  config: ResolvedConfig,
  file: string,
  asset?: RenderOptions["asset"],
  context?: RenderOptions["context"],
  cache?: boolean,
): string {
  const html = render(file, renderOptions(config, asset, context, cache));
  const { transform } = config.user;
  if (!transform) return html;
  const rel = file.slice(config.pagesDir.length + 1).split("\\").join("/");
  return transform(html, { file, url: file.startsWith(config.pagesDir) ? routeFor(rel) : "" });
}

export const pagesOf = (config: ResolvedConfig) => findPages(config.pagesDir);
