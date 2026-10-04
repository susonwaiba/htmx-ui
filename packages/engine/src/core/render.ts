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
// An `assetVer(path)` global does the same and appends the project's version as
// `?ver=1.2.3` (plus a random suffix in dev), so a deploy never loads a stale copy
// from a browser or proxy cache. The bundlers can't resolve a query string, so the
// plugins carry it through the build in a data-ver attribute (./ver.ts).
//
// Every render also gets a `url` global: the page's route (e.g. "/docs/button"), or ""
// for templates outside the pages directory. Layouts use it to mark the active nav link.
//
// `context` values are passed to the template as variables, for rendering a page per
// request from your own server (src/core/site.ts: `site.render`, `site.fragment`).
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
//
// With `cache` off (the default) a render re-reads and re-compiles every template
// it touches, so an edited partial shows up immediately. That is what the dev
// servers want and it is far too expensive for a server: compiling a page and
// its layouts and macros costs milliseconds of blocked CPU per request. With
// `cache` on each template is compiled once and kept; `warm()` moves that work
// to startup.

import nunjucks from "nunjucks";
import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import type { Logger } from "./debug";
import { highlight } from "./highlight";
import { routeFor } from "./routes";
import { withVer } from "./ver";

/**
 * A search root: a directory, optionally addressable under a name.
 *
 * A name gives the root its own namespace in templates, so the directory can move
 * without every reference moving with it: `{ name: "layouts", dir: "new-layouts" }`
 * is still `{% extends "layouts/base.html" %}`. Unnamed roots are addressed directly,
 * relative to the directory itself, and keep working when the list is all strings.
 */
export interface TemplateRoot {
  /** The prefix templates use to reach this root, e.g. "layouts". Omitted for a plain directory. */
  name?: string;
  /** The directory, absolute once resolved. */
  dir: string;
}

export interface RenderOptions {
  /** Template roots, searched in order. A directory, or one with a name. */
  roots: (string | TemplateRoot)[];
  /** Directory of routes; `url` is the page's route relative to it. Default: <root>/pages. */
  pages?: string;
  /** Value of the `origin` global. Default: $SITE_URL, else "". */
  origin?: string;
  /** Extra globals and filters. */
  globals?: Record<string, unknown>;
  filters?: Record<string, (...args: any[]) => unknown>;
  /** URL for asset(): `file` is the absolute file, `page` the page being rendered. Default: relative to the page. */
  asset?: (file: string, page: string) => string;
  /** The `ver` token assetVer() appends. Default: none, so assetVer() == asset(). */
  ver?: string;
  /** Values for the render, e.g. request data. Available as template variables, on top of the globals. */
  context?: Record<string, unknown>;
  /**
   * Keep compiled templates between renders: each template, and everything it
   * extends or includes, is read and compiled once instead of on every render.
   * Default false, so the dev servers pick up a partial edited between two
   * renders. A server that renders the same templates per request wants this —
   * `createSite()` turns it on and calls `warm()` so nothing compiles on the
   * first request.
   */
  cache?: boolean;
  /** Where to log what was compiled and what was already cached. */
  debug?: Logger;
}

type Roots = string | (string | TemplateRoot)[] | RenderOptions;
const options = (roots: Roots): RenderOptions =>
  typeof roots === "string" ? { roots: [roots] } : Array.isArray(roots) ? { roots } : roots;

const toPosix = (p: string) => p.split(sep).join("/");

/** Absolute, name-carrying form of a root list, in the order it will be searched. */
export function normalizeRoots(roots: (string | TemplateRoot)[]): TemplateRoot[] {
  const out: TemplateRoot[] = [];
  for (const r of roots) {
    const root = typeof r === "string" ? { dir: resolve(r) } : { name: r.name, dir: resolve(r.dir) };
    if (root.name !== undefined) {
      if (!root.name || /[/\\]/.test(root.name) || root.name === "." || root.name === "..") {
        throw new Error(`[html] root name ${JSON.stringify(root.name)} must be a single directory name`);
      }
      if (out.some((o) => o.name === root.name)) {
        throw new Error(`[html] two roots are both named ${JSON.stringify(root.name)}`);
      }
    }
    out.push(root);
  }
  return out;
}

/** "dir" or `name` + " (dir)", the way a root is named in an error. */
export const describeRoot = (r: TemplateRoot) => (r.name ? `${r.name} -> ${r.dir}` : r.dir);

/**
 * `path` inside `root`, honouring the root's name, or null when it isn't there.
 *
 * A named root answers to its own prefix — "layouts/base.html" with the name
 * "layouts" means base.html inside it — and to nothing else it did not have to
 * answer to. Any path is also tried directly, which is what keeps a list of plain
 * directory strings behaving exactly as it did before names existed.
 */
function resolveIn(root: TemplateRoot, path: string): string | null {
  let rel = path;
  if (root.name) {
    if (path === root.name) rel = "";
    else if (path.startsWith(root.name + "/")) rel = path.slice(root.name.length + 1);
  }
  const file = resolve(root.dir, rel);
  // Only ever hand out what is inside the root: a path that climbs out with ".."
  // is a template reference reaching outside the tree, not a miss.
  if (relative(root.dir, file).startsWith("..")) return null;
  return existsSync(file) ? file : null;
}

/**
 * The roots as `locate` wants them. The engine passes an already-resolved list, so
 * this only allocates when a caller hands over plain directory strings.
 */
function asRoots(roots: (string | TemplateRoot)[]): TemplateRoot[] {
  return roots.some((r) => typeof r === "string") ? normalizeRoots(roots) : (roots as TemplateRoot[]);
}

/** Absolute path of `path` in the first root that has it, or null when no root does. */
export function tryLocate(roots: (string | TemplateRoot)[], path: string): string | null {
  for (const root of asRoots(roots)) {
    const file = resolveIn(root, path);
    if (file) return file;
  }
  return null;
}

/** Absolute path of `path` in the first root that has it. */
export function locate(roots: (string | TemplateRoot)[], path: string, what = "template"): string {
  const all = asRoots(roots);
  for (const root of all) {
    const file = resolveIn(root, path);
    // A reference that climbs out of a root is worth saying so about, since the
    // template that made it is otherwise invisible in the error.
    if (!file && relative(root.dir, resolve(root.dir, path)).startsWith("..")) {
      throw new Error(`[html] ${what}("${path}") is outside ${root.dir}`);
    }
    if (file) return file;
  }
  throw new Error(`[html] ${what}("${path}"): file not found in ${all.map(describeRoot).join(", ")}`);
}

/** Default asset(): the file relative to the page, "./"-prefixed when it sits beside it. */
export function relativeAsset(file: string, page: string): string {
  const rel = toPosix(relative(dirname(page), file));
  return rel.startsWith(".") ? rel : `./${rel}`;
}

/** Wrap a string so Nunjucks renders it as-is, for a custom global or filter that returns markup. */
export function markup(html: unknown): nunjucks.runtime.SafeString {
  return new nunjucks.runtime.SafeString(String(html ?? ""));
}

/** Remove the indentation shared by every non-blank line, and blank lines at either end. */
export function dedent(text: unknown): string {
  const lines = String(text ?? "").replace(/\t/g, "  ").split("\n");
  while (lines.length && !lines[0]!.trim()) lines.shift();
  while (lines.length && !lines.at(-1)!.trim()) lines.pop();
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
  return lines.map((l) => l.slice(indent).trimEnd()).join("\n");
}

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

const envs = new Map<string, Env>();

/** A Nunjucks environment for one set of roots, plus what rendering it can reuse. */
interface Env {
  env: nunjucks.Environment;
  roots: TemplateRoot[];
  /** Whether templates stay compiled between renders. */
  cache: boolean;
  /** Resolved template paths, filled in as they are looked up. See `find()`. */
  found: Map<string, string>;
  /** Parsed JSON by path, for the json() global. */
  json: Map<string, unknown>;
  /** Inlined SVG by path and attributes, for the svg() global. */
  svg: Map<string, string>;
}

/**
 * Reads templates through `tryLocate`, so `{% extends "layouts/base.html" %}` finds
 * a root named "layouts" wherever that directory currently lives. Nunjucks sends
 * every extends, include, from and import through here, so one loader covers them
 * all rather than each tag needing its own resolution.
 */
class RootsLoader extends nunjucks.Loader implements nunjucks.ILoader {
  /** Sync loader, which is what the Environment constructor expects to be handed. */
  readonly async = false;
  constructor(
    private roots: TemplateRoot[],
    private noCache: boolean,
  ) {
    super();
  }
  getSource(name: string): nunjucks.LoaderSource {
    const full = tryLocate(this.roots, name);
    // Null for a miss, which is how Nunjucks reads "not found" and reports it as
    // `template not found: <name>` with the chain of names that led here. The
    // declared type says otherwise, and Nunjucks' own FileSystemLoader lies the
    // same way, so match the runtime rather than the type.
    if (!full) return null as unknown as nunjucks.LoaderSource;
    const source = { src: readFileSync(full, "utf8"), path: full, noCache: this.noCache };
    this.emit("load", name, source);
    return source;
  }
  override resolve(from: string, to: string): string {
    // A relative reference, e.g. {% include "./row.html" %}, is relative to the
    // template naming it — by name, so it keeps working through a named root.
    const rel = dirname(nameOf(this.roots, from) ?? from);
    return this.isRelative(to) ? toPosix(join(rel, to)) : to;
  }
}

/**
 * Absolute path of `path` in the first root that has it. Memoized when templates
 * are cached, since resolving one costs an existsSync() per root and asset()
 * asks for the same handful of files on every render.
 *
 * Only hits are kept — `locate()` throws on a miss — so a template added after
 * the environment was made is still found. One that was removed is not: that is
 * what caching costs, and it is why the dev servers leave it off.
 */
function find(e: Env, path: string, what: string): string {
  if (!e.cache) return locate(e.roots, path, what);
  let file = e.found.get(path);
  if (file === undefined) e.found.set(path, (file = locate(e.roots, path, what)));
  return file;
}

const read = (e: Env, path: string, what: string) => readFileSync(find(e, path, what), "utf8");

/**
 * The json() and svg() globals, memoized when templates are cached. Both read a
 * file on every call, and a page calls svg() once per icon — dozens of reads and
 * re-parses of the same handful of files, on every render. The files are the
 * project's own: they don't change while a server runs.
 */
const jsonGlobal =
  (e: Env) =>
  (path: string): unknown => {
    if (!e.cache) return JSON.parse(read(e, path, "json"));
    let data = e.json.get(path);
    if (data === undefined) e.json.set(path, (data = JSON.parse(read(e, path, "json"))));
    return data;
  };

const svgGlobal =
  (e: Env) =>
  (path: string, attrs?: Record<string, unknown>): nunjucks.runtime.SafeString => {
    const key = `${path}\0${JSON.stringify(attrs ?? {})}`;
    if (!e.cache) return markup(inlineSvg(read(e, path, "svg"), attrs));
    let svg = e.svg.get(key);
    if (svg === undefined) e.svg.set(key, (svg = inlineSvg(read(e, path, "svg"), attrs)));
    return markup(svg);
  };

function env(roots: TemplateRoot[], origin: string, cache: boolean, debug?: Logger): Env {
  // The name is part of the key: the same directory addressed two ways is two
  // different sets of template names, and must not share an environment.
  const key = [cache ? "cache" : "fresh", ...roots.map((r) => `${r.name ?? ""}\0${r.dir}`), origin].join("\0");
  const found = envs.get(key);
  if (found) return found;
  const e: Env = { roots, cache, found: new Map(), json: new Map(), svg: new Map(), env: null! };
  // noCache is the dev behaviour: the dev server re-renders on change, so partial
  // edits must be re-read. With it off Nunjucks keeps every template it compiles.
  const loader = new RootsLoader(roots, !cache);
  // A load means Nunjucks had to read and compile the template: with the cache on
  // that is once per template, so these lines are the cache filling up.
  loader.on("load", (name: string) => debug?.log("templates", `compiled ${name}`));
  const njk = new nunjucks.Environment(loader, {
    autoescape: true,
    throwOnUndefined: true,
    trimBlocks: true,
    lstripBlocks: true,
  });
  njk.addFilter("dedent", dedent);
  njk.addFilter("highlight", (code: unknown, lang?: string) => markup(highlight(String(code ?? ""), lang)));
  njk.addGlobal("json", jsonGlobal(e));
  njk.addGlobal("svg", svgGlobal(e));
  njk.addGlobal("glob", (pattern: string) => {
    // Paths come back the way templates would have to write them, so a hit in a
    // named root is prefixed with its name.
    const hits = roots.flatMap((r) =>
      existsSync(r.dir)
        ? globSync(pattern, { cwd: r.dir }).map((hit) => (r.name ? `${r.name}/${toPosix(hit)}` : toPosix(hit)))
        : [],
    );
    return [...new Set(hits)].sort();
  });
  njk.addGlobal("origin", origin.replace(/\/$/, ""));
  e.env = njk;
  envs.set(key, e);
  return e;
}

/**
 * The template name of `file`: its path in the first root that contains it, with
 * "/" separators, prefixed with that root's name when it has one. The name
 * Nunjucks resolves it by. Null when no root contains it.
 */
function nameOf(roots: TemplateRoot[], file: string): string | null {
  for (const r of roots) {
    if (relative(r.dir, file).startsWith("..")) continue;
    const rel = toPosix(relative(r.dir, file));
    return r.name ? (rel ? `${r.name}/${rel}` : r.name) : rel;
  }
  return null;
}

// Templates named in these tags, quoted. What a warm-up follows.
const REFERRING = /\{%-?\s*(?:extends|include|from|import)\s+["']([^"']+)["']/g;

/**
 * Read and compile every template reachable from `files`, so that rendering one
 * later doesn't have to. Nunjucks reads a template the first time it is rendered,
 * so without this the first request for each page pays to compile it, its layout
 * and every macro it imports, while the caller waits.
 *
 * Follows `{% extends %}`, `{% include %}`, `{% from %}` and `{% import %}` by
 * name, so it reaches the layouts, partials and macros a project actually uses
 * and stops there. A directory nothing references is never touched — built output
 * under the project root, such as a docs archive, is not Nunjucks source and
 * would not compile.
 *
 * Best-effort by design: a template that can't be read or compiled is skipped, so
 * it fails on the request that needs it, with the usual error naming the file and
 * line. A warm-up is not the place to report a broken template.
 *
 * Returns how many templates were compiled.
 */
export function warm(files: string[], roots: Roots): number {
  const opts = options(roots);
  const all = normalizeRoots(opts.roots);
  const e = env(all, opts.origin ?? process.env.SITE_URL ?? "", true, opts.debug);

  const queue = files.map((file) => nameOf(all, resolve(file))).filter((n): n is string => !!n);
  const done = new Set<string>();
  const start = performance.now();
  let compiled = 0;
  // `queue` grows while it is read, so walk it by index rather than shifting.
  for (let i = 0; i < queue.length; i++) {
    const template = queue[i]!;
    if (done.has(template)) continue;
    done.add(template);
    try {
      for (const [, ref] of read(e, template, "template").matchAll(REFERRING)) queue.push(ref!);
      e.env.getTemplate(template, true);
      compiled++;
    } catch {
      // Not a template, or one that doesn't compile: rendering it says so.
    }
  }
  opts.debug?.log(
    "templates",
    `warm: compiled ${compiled} of ${done.size} templates from ${files.length} file${files.length === 1 ? "" : "s"} in ${(performance.now() - start).toFixed(1)}ms`,
  );
  return compiled;
}

/** Render the template at `path`; template names resolve against the roots, in order. */
export function render(path: string, roots: Roots): string {
  const opts = options(roots);
  const all = normalizeRoots(opts.roots);
  const file = resolve(path);
  const root = all.find((r) => !relative(r.dir, file).startsWith(".."));
  if (!root) throw new Error(`[html] ${file} is outside the template root(s) ${all.map(describeRoot).join(", ")}`);
  const name = nameOf(all, file)!;

  const e = env(all, opts.origin ?? process.env.SITE_URL ?? "", opts.cache === true, opts.debug);
  const toUrl = opts.asset ?? relativeAsset;
  const asset = (p: string) => toUrl(find(e, p, "asset"), file);
  const ver = opts.ver ?? "";
  const assetVer = (p: string) => withVer(asset(p), ver);

  const pages = toPosix(relative(resolve(opts.pages ?? resolve(root.dir, "pages")), file));
  const url = pages.startsWith("../") ? "" : routeFor(pages);

  // Page-specific values are globals rather than context so that macros imported
  // without `with context` (icon, code, ...) can use them. Safe because Nunjucks
  // renders synchronously: nothing else renders between these lines.
  for (const [k, v] of Object.entries(opts.filters ?? {})) e.env.addFilter(k, v);
  for (const [k, v] of Object.entries(opts.globals ?? {})) e.env.addGlobal(k, v);
  e.env.addGlobal("asset", asset);
  e.env.addGlobal("assetVer", assetVer);
  e.env.addGlobal("url", url);
  return e.env.render(name, opts.context);
}
