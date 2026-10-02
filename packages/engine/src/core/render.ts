// Renders .html pages through Nunjucks. Shared by both runtimes: the Bun plugin
// (src/bun/) and the Vite plugin (src/node/) call render() on each page before
// their bundler sees it. Uses only node: APIs so it runs on Bun and Node alike.
//
// Templates are resolved from the template roots (the project, then htmx-ui's src/),
// so pages write:
//   {% extends "layouts/base.html" %}
//   {% block content %} ... {% endblock %}
//   {% include "partials/nav.html" %}
//
// Every render gets an `asset(path)` global that turns a root-relative path into
// one relative to the page being rendered, e.g. {{ asset("app.ts") }} -> "../app.ts"
// from pages/index.html and "../../app.ts" from pages/blog/post.html.
// Bundlers resolve <script src>/<link href> relative to the page, so layouts and
// partials must use it for local files.
//
// Every render also gets a `url` global: the page's route (e.g. "/docs/button"), or ""
// for templates outside the pages directory. Layouts use it to mark the active nav link.
//
// Globals (usable everywhere, including imported macros; paths are relative to a
// template root, first match wins):
//   json("data/changelog.json")    parsed JSON file
//   svg("icons/sun.svg", {class})  inline an SVG file, setting/overriding root attributes
//   glob("icons/*.svg")            sorted list of matching root-relative paths
//   origin                         public site URL (config `url`, or $SITE_URL)
//
// Filters added on top of the Nunjucks builtins:
//   dedent     strip common leading indentation and surrounding blank lines
//   highlight  syntax-highlight code at build time (./highlight.ts)
//
// Files are read synchronously because Nunjucks renders synchronously.

import nunjucks from "nunjucks";
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { highlight } from "./highlight";
import { routeFor } from "./routes";

export interface RenderOptions {
  /** Template roots, searched in order. */
  roots: string[];
  /** Directory of routes; `url` is the page's route relative to it. Default: <root>/pages. */
  pages?: string;
  /** Value of the `origin` global. Default: $SITE_URL, else "". */
  origin?: string;
  /** Extra globals and filters. */
  globals?: Record<string, unknown>;
  filters?: Record<string, (...args: any[]) => unknown>;
  /** URL for asset(): `file` is the absolute file, `page` the page being rendered. Default: relative to the page. */
  asset?: (file: string, page: string) => string;
}

type Roots = string | string[] | RenderOptions;
const options = (roots: Roots): RenderOptions =>
  typeof roots === "string" ? { roots: [roots] } : Array.isArray(roots) ? { roots } : roots;

const toPosix = (p: string) => p.split(sep).join("/");

/** Default asset(): the file relative to the page, "./"-prefixed when it sits beside it. */
export function relativeAsset(file: string, page: string): string {
  const rel = toPosix(relative(dirname(page), file));
  return rel.startsWith(".") ? rel : `./${rel}`;
}

/** Remove the indentation shared by every non-blank line, and blank lines at either end. */
export function dedent(text: unknown): string {
  const lines = String(text ?? "").replace(/\t/g, "  ").split("\n");
  while (lines.length && !lines[0]!.trim()) lines.shift();
  while (lines.length && !lines.at(-1)!.trim()) lines.pop();
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(indent).trimEnd()).join("\n");
}

/** Absolute path of `path` in the first root that has it. */
function locate(roots: string[], path: string, what: string): string {
  for (const root of roots) {
    const file = resolve(root, path);
    if (relative(root, file).startsWith("..")) throw new Error(`[html] ${what}("${path}") is outside ${root}`);
    if (existsSync(file)) return file;
  }
  throw new Error(`[html] ${what}("${path}"): file not found in ${roots.join(", ")}`);
}

const read = (roots: string[], path: string, what: string) => readFileSync(locate(roots, path, what), "utf8");

const escapeAttr = (v: unknown) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Inline an SVG file, replacing or adding attributes on its root <svg> tag. */
export function inlineSvg(source: string, attrs: Record<string, unknown> = {}): string {
  const svg = source.replace(/<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->/g, "").trim();
  const open = /<svg\b[^>]*>/i.exec(svg);
  if (!open) throw new Error("[html] svg(): not an SVG file");
  let tag = open[0];
  for (const [name, value] of Object.entries(attrs)) {
    if (name === "__keywords" || value === undefined || value === null || value === false) continue;
    tag = tag.replace(new RegExp(`\\s${name}\\s*=\\s*("[^"]*"|'[^']*')`, "i"), "");
    tag = tag.replace(/\s*\/?>$/, (end) => ` ${name}="${escapeAttr(value === true ? "" : value)}"${end.trim()}`);
  }
  return svg.slice(0, open.index) + tag + svg.slice(open.index + open[0].length);
}

const envs = new Map<string, nunjucks.Environment>();

function env(roots: string[], origin: string): nunjucks.Environment {
  const key = [...roots, origin].join("\0");
  let e = envs.get(key);
  if (!e) {
    // noCache: the dev server re-renders on change, so partial edits must be re-read.
    e = new nunjucks.Environment(new nunjucks.FileSystemLoader(roots, { noCache: true }), {
      autoescape: true,
      throwOnUndefined: true,
      trimBlocks: true,
      lstripBlocks: true,
    });
    e.addFilter("dedent", dedent);
    e.addFilter("highlight", (code: unknown, lang?: string) => new nunjucks.runtime.SafeString(highlight(String(code ?? ""), lang)));
    e.addGlobal("json", (path: string) => JSON.parse(read(roots, path, "json")));
    e.addGlobal("svg", (path: string, attrs?: Record<string, unknown>) =>
      new nunjucks.runtime.SafeString(inlineSvg(read(roots, path, "svg"), attrs)),
    );
    e.addGlobal("glob", (pattern: string) => {
      const found = roots.flatMap((cwd) => (existsSync(cwd) ? globSync(pattern, { cwd }) : []));
      return [...new Set(found.map(toPosix))].sort();
    });
    e.addGlobal("origin", origin.replace(/\/$/, ""));
    envs.set(key, e);
  }
  return e;
}

/** Render the template at `path`; template names resolve against the roots, in order. */
export function render(path: string, roots: Roots): string {
  const opts = options(roots);
  const all = opts.roots.map((r) => resolve(r));
  const file = resolve(path);
  const root = all.find((r) => !relative(r, file).startsWith(".."));
  if (!root) throw new Error(`[html] ${file} is outside the template root(s) ${all.join(", ")}`);
  const name = toPosix(relative(root, file));

  const toUrl = opts.asset ?? relativeAsset;
  const asset = (p: string) => toUrl(locate(all, p, "asset"), file);

  const pages = toPosix(relative(resolve(opts.pages ?? resolve(root, "pages")), file));
  const url = pages.startsWith("../") ? "" : routeFor(pages);

  // Page-specific values are globals rather than context so that macros imported
  // without `with context` (icon, code, ...) can use them. Safe because Nunjucks
  // renders synchronously: nothing else renders between these lines.
  const e = env(all, opts.origin ?? process.env.SITE_URL ?? "");
  for (const [k, v] of Object.entries(opts.filters ?? {})) e.addFilter(k, v);
  for (const [k, v] of Object.entries(opts.globals ?? {})) e.addGlobal(k, v);
  e.addGlobal("asset", asset);
  e.addGlobal("url", url);
  return e.render(name);
}
