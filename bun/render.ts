// Renders .html pages through Nunjucks before Bun's HTML bundler sees them.
//
// Templates are resolved from the template roots (site/, then src/), so pages write:
//   {% extends "layouts/base.html" %}
//   {% block content %} ... {% endblock %}
//   {% include "partials/nav.html" %}
//
// Every render gets an `asset(path)` global that turns a root-relative path into
// one relative to the page being rendered, e.g. {{ asset("app.ts") }} -> "../app.ts"
// from site/pages/index.html and "../../app.ts" from site/pages/blog/post.html.
// Bun's HTML bundler resolves <script src>/<link href> relative to the page, so
// layouts and partials must use it for local files.
//
// Every render also gets a `url` global: the page's route (e.g. "/docs/button"), or ""
// for templates outside <root>/pages. Layouts use it to mark the active nav link.
//
// Globals (usable everywhere, including imported macros; paths are relative to a
// template root, first match wins):
//   json("data/changelog.json")    parsed JSON file
//   svg("icons/sun.svg", {class})  inline an SVG file, setting/overriding root attributes
//   glob("icons/*.svg")            sorted list of matching root-relative paths
//   origin                         public site URL: $SITE_URL, else "url" in data/site.json
//
// Filters added on top of the Nunjucks builtins:
//   dedent     strip common leading indentation and surrounding blank lines
//   highlight  syntax-highlight code at build time (bun/highlight.ts)
//
// Files are read synchronously because Nunjucks renders synchronously.

import nunjucks from "nunjucks";
import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { addHeadingAnchors } from "./anchors";
import { highlight } from "./highlight";
import { TEMPLATE_ROOTS } from "./paths";
import { routeFor } from "./routes";

type Roots = string | string[];
const list = (roots: Roots) => (Array.isArray(roots) ? roots : [roots]);

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

function env(roots: string[]): nunjucks.Environment {
  const key = roots.join("\0");
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
      const found = roots.flatMap((cwd) => [...new Bun.Glob(pattern).scanSync({ cwd })]);
      return [...new Set(found.map((p) => p.split(sep).join("/")))].sort();
    });
    const siteJson = roots.map((r) => resolve(r, "data/site.json")).find(existsSync);
    const siteUrl = process.env.SITE_URL ?? (siteJson ? JSON.parse(readFileSync(siteJson, "utf8")).url : "");
    e.addGlobal("origin", String(siteUrl ?? "").replace(/\/$/, ""));
    envs.set(key, e);
  }
  return e;
}

/** Render the template at `path`; template names resolve against `roots`, in order. */
export function render(path: string, roots: Roots = TEMPLATE_ROOTS): string {
  const all = list(roots);
  const file = resolve(path);
  const root = all.find((r) => !relative(r, file).startsWith(".."));
  if (!root) throw new Error(`[html] ${file} is outside the template root(s) ${all.join(", ")}`);
  const name = relative(root, file).split(sep).join("/");

  const pageDir = dirname(file);
  const asset = (p: string) => {
    const rel = relative(pageDir, locate(all, p, "asset")).split(sep).join("/");
    return rel.startsWith(".") ? rel : `./${rel}`;
  };

  const pages = relative(resolve(root, "pages"), file).split(sep).join("/");
  const url = pages.startsWith("../") ? "" : routeFor(pages);

  // Page-specific values are globals rather than context so that macros imported
  // without `with context` (icon, code, ...) can use them. Safe because Nunjucks
  // renders synchronously: nothing else renders between these lines.
  const e = env(all);
  e.addGlobal("asset", asset);
  e.addGlobal("url", url);
  return e.render(name);
}

/** Render a site page: render() plus linkable docs headings (bun/anchors.ts). */
export function renderPage(path: string, roots: Roots = TEMPLATE_ROOTS): string {
  return addHeadingAnchors(render(path, roots));
}
