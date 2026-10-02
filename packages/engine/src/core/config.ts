// Project configuration: htmx-ui.config.{ts,mts,js,mjs} in the project root.
//
//   import { defineConfig } from "htmx-ui-engine";
//   export default defineConfig({ pages: "pages", outDir: "dist" });
//
// Every option is optional; a project with only pages/ needs no config file.
// Shared by both runtimes. Loading differs (Bun imports TypeScript directly; on
// Node the Vite adapter bundles the file first), so loadConfig takes an importer.

import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { render, type RenderOptions } from "./render";
import { findPages, routeFor, type Page } from "./routes";

/** Request handler for a dev route. Bun.serve's signature: a web Request in, a Response out. */
export type Handler = (req: Request & { params: Record<string, string> }) => Response | Promise<Response>;

export interface BuildContext {
  config: ResolvedConfig;
  /** Absolute output directory. */
  outDir: string;
  /** Every page that was built. */
  pages: Page[];
}

export interface UserConfig {
  /** Directory of routes, relative to the project root. Default "pages". */
  pages?: string;
  /**
   * Template roots for extends/include/import, json(), svg(), glob() and asset(),
   * relative to the project root and searched in order. Default ["."].
   */
  templates?: string[];
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
  /** Extra Nunjucks globals and filters. */
  globals?: Record<string, unknown>;
  filters?: Record<string, (...args: any[]) => unknown>;
  /** Post-process every rendered page (dev and build, both runtimes). */
  transform?: (html: string, page: { file: string; url: string }) => string;
  /**
   * Dev-only request handlers, e.g. mock endpoints returning HTML fragments for
   * hx-get/hx-post. Keys use Bun.serve route syntax: "/api/users/:id", "/files/*".
   * The production build is static, so these don't exist there.
   */
  routes?: Record<string, Handler>;
  /** Dev-only fallback for requests no page, route or public file matched. Return null for a 404. */
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
  /** Absolute project root. */
  root: string;
  /** The config file, if there was one. */
  file: string | null;
  pagesDir: string;
  templateRoots: string[];
  /** htmx-ui's src/ when it is a template root. */
  uiDir: string | null;
  outDir: string;
  publicDir: string | null;
  origin: string;
  port: number;
  user: UserConfig;
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

export function resolveConfig(user: UserConfig, root: string, file: string | null = null): ResolvedConfig {
  root = resolve(root);
  const uiDir = user.ui === false ? null : findUi(root);
  const templateRoots = (user.templates ?? ["."]).map((t) => resolve(root, t));
  if (uiDir && !templateRoots.includes(uiDir)) templateRoots.push(uiDir);
  const publicDir = user.publicDir === false ? null : resolve(root, user.publicDir ?? "public");
  return {
    root,
    file,
    pagesDir: resolve(root, user.pages ?? "pages"),
    templateRoots,
    uiDir,
    outDir: resolve(root, user.outDir ?? "dist"),
    publicDir: publicDir && existsSync(publicDir) ? publicDir : null,
    origin: (process.env.SITE_URL ?? user.url ?? "").replace(/\/$/, ""),
    port: Number(process.env.PORT ?? user.port ?? 3000),
    user,
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
export function renderOptions(config: ResolvedConfig, asset?: RenderOptions["asset"]): RenderOptions {
  const { globals, filters } = config.user;
  return { roots: config.templateRoots, pages: config.pagesDir, origin: config.origin, globals, filters, asset };
}

/** Render a page the way both runtimes do: Nunjucks, then the config's transform. */
export function renderPage(config: ResolvedConfig, file: string, asset?: RenderOptions["asset"]): string {
  const html = render(file, renderOptions(config, asset));
  const { transform } = config.user;
  if (!transform) return html;
  const rel = file.slice(config.pagesDir.length + 1).split("\\").join("/");
  return transform(html, { file, url: file.startsWith(config.pagesDir) ? routeFor(rel) : "" });
}

export const pagesOf = (config: ResolvedConfig) => findPages(config.pagesDir);
