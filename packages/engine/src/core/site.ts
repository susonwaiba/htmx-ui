// Serving an htmx-ui site from your own server, whatever framework it uses.
//
//   import { createSite } from "htmx-ui-engine";
//   const site = await createSite();
//   new Elysia().get("/api/hello", ...).use(htmxUi({ site })).listen(3000);
//
// The dev servers and the builds already do this for you; createSite() is the same
// thing as one function, so a site can live next to a real backend. It serves the
// output of `htmx-ui build` (pages at their routes, hashed assets, public/ files),
// the config's `routes` and `fetch`, and leaves everything else to your framework.
//
// While NODE_ENV is not "production" it renders the page templates themselves, so a
// server you start yourself answers page requests before anything has been built.
//
// `site.render(url)` renders a page per request (server-rendered data), and
// `site.fragment(path)` renders any template as an HTML fragment for hx-get/hx-post.
// Both go through Nunjucks and the config's globals, filters and asset().
//
// A server renders the same templates over and over, so this compiles them once:
// `createSite()` reads and compiles every template the pages reach before it
// returns, and each later render reuses the compiled result. See SiteOptions.cache.

import { existsSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { loadConfig, pagesOf, renderOptions, renderPage, resolveConfig, type ResolvedConfig, type UserConfig } from "./config";
import { locate, render, warm } from "./render";
import { matchRoute, sortRoutes, type Page } from "./routes";
import { staticFile } from "./static";

/** Content types for the built site. Anything unknown is served as a byte stream. */
const TYPES: Record<string, string> = {
  avif: "image/avif",
  css: "text/css; charset=utf-8",
  gif: "image/gif",
  html: "text/html; charset=utf-8",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  mp4: "video/mp4",
  otf: "font/otf",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain; charset=utf-8",
  ttf: "font/ttf",
  wasm: "application/wasm",
  webmanifest: "application/manifest+json",
  webm: "video/webm",
  webp: "image/webp",
  woff: "font/woff",
  woff2: "font/woff2",
  xml: "application/xml",
};

export interface SiteOptions {
  /** Project root, where htmx-ui.config.ts and pages/ live. Default: process.cwd(). */
  root?: string;
  /** The config to use instead of loading the project's htmx-ui.config.ts. */
  config?: UserConfig | ResolvedConfig;
  /** Values for every render, on top of the config's globals. */
  context?: Record<string, unknown>;
  /**
   * URL for asset() in `render()` and `fragment()`: `file` is the absolute file,
   * `page` the template being rendered. Default: root-absolute from the project
   * root, which is what a server bundling assets needs. Built pages already carry
   * their own URLs, so `handle()` never calls it.
   */
  asset?: (file: string, page: string) => string;
  /**
   * Keep compiled templates between renders, so each one is read and compiled
   * once instead of on every request. Default true, and `createSite()` also
   * compiles everything the pages reach, so no request waits for a compile.
   * Set false in a long-lived dev server that edits templates without
   * restarting: the templates are then re-read on every render, and one that was
   * removed stays cached until it isn't.
   */
  cache?: boolean;
  /** An existing site to serve, instead of creating one. See `createSite()`. */
  site?: Promise<Site> | Site;
}

export interface Site {
  readonly config: ResolvedConfig;
  /** Every page, with its file and route. Found once, when the site is created. */
  readonly pages: Page[];
  /**
   * Render the page at a route ("/", "/docs/button") with the site's context plus
   * `context`. Throws when there is no page for that route.
   */
  render(url: string, context?: Record<string, unknown>): string;
  /**
   * Render any template — a page, partial or macro — as an HTML fragment, with the
   * site's context plus `context`. No transform() and no document shell: this is for
   * hx-get/hx-post targets.
   */
  fragment(path: string, context?: Record<string, unknown>): string;
  /**
   * Answer a request from the config's routes, then from the built site (pages,
   * assets, public/), then from the config's `fetch`, then from the built 404 page.
   * While NODE_ENV is not "production", a route the build has no answer for is
   * rendered from its page template, in between. Returns null when nothing matched,
   * so the caller can fall through to its own routes.
   */
  handle(request: Request, context?: Record<string, unknown>): Promise<Response | null>;
}

const isResolved = (c: UserConfig | ResolvedConfig): c is ResolvedConfig => "roots" in c;

/** "/docs/button/" -> "/docs/button", so URLs match routes however they're written. */
const route = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname);

const posix = (p: string) => p.split(sep).join("/");

/** A built file as a Response, with its content type. HEAD gets the headers only. */
function fileResponse(file: string, head = false): Response {
  const type = TYPES[file.split(".").pop()?.toLowerCase() ?? ""];
  const body = readFileSync(file);
  const headers: Record<string, string> = { "Content-Type": type ?? "application/octet-stream" };
  // Only when there is no body to measure: a server sets its own otherwise, and two
  // Content-Length headers in one response are a protocol error.
  if (head) headers["Content-Length"] = String(body.byteLength);
  return new Response(head ? null : body, { headers });
}

/** A page rendered at request time, as a Response. HEAD gets the headers only. */
function htmlResponse(html: string, head = false): Response {
  const headers: Record<string, string> = { "Content-Type": TYPES.html! };
  if (head) headers["Content-Length"] = String(Buffer.byteLength(html));
  return new Response(head ? null : html, { headers });
}

/**
 * Fail at startup when a deployment that renders at runtime cannot render: the
 * templates are not where its config says. `htmx-ui build` writes built pages and
 * assets, never the Nunjucks source, so a deployment that ships only dist/ has to
 * copy the templates it renders from. Finding that out on the first htmx request
 * means a 500 in production with a "file not found" naming a path nobody
 * deployed; finding it here means the process says what to copy and exits.
 */
function assertRenderable(config: ResolvedConfig, pages: Page[]): void {
  // render: true means this deployment reads templates off disk at request time, so
  // the roots and the page tree have to be there now rather than at the first request.
  const copy =
    "`htmx-ui build` writes built pages and assets only, never the Nunjucks source, so the " +
    "deployment has to copy the templates it renders from (layouts, partials, macros, " +
    "components/, data/ and whatever json()/svg() reads).";
  const missing = config.roots.filter((r) => !existsSync(r.dir) || !statSync(r.dir).isDirectory());
  if (missing.length) {
    throw new Error(
      `[htmx-ui] render: no templates at ${missing.map((r) => r.dir).join(", ")}. ${copy} ` +
        "Then point `templates` at where you put them.",
    );
  }
  if (!pages.length) {
    throw new Error(
      `[htmx-ui] render: no pages in ${config.pagesDir}. ${copy} ` +
        "Then point `pages` at where you put them.",
    );
  }
}

/** Load the project's config and index its pages. Every adapter starts here. */
export async function createSite(options: SiteOptions = {}): Promise<Site> {
  if (options.site) return await options.site;
  const { config } = options;
  const resolved = config
    ? isResolved(config)
      ? config
      : resolveConfig(config, options.root ?? process.cwd())
    : await loadConfig(options.root);
  const pages = pagesOf(resolved);
  const byUrl = new Map(pages.map((p) => [p.url, p]));
  if (resolved.render) assertRenderable(resolved, pages);

  const asset =
    options.asset ?? ((file: string) => "/" + posix(relative(resolved.root, file)).replace(/^\.\//, ""));
  const values = (context?: Record<string, unknown>) => ({ ...options.context, ...context });
  const cache = options.cache !== false;
  const templates = renderOptions(resolved, asset, undefined, cache);

  // Compile now, not on the first request. Nunjucks otherwise reads and compiles a
  // page with its layouts and macros while the caller is waiting for it.
  if (cache) warm(pages.map((p) => p.file), templates);

  const { debug } = resolved;
  // A server started against a project that has not been built yet has no dist/ to
  // read, so it renders the pages it is asked for instead of 404ing them. NODE_ENV,
  // not a config option: it is the same environment the deploy already sets, and a
  // build is still what production serves — dist/ answers before this can.
  const developing = process.env.NODE_ENV !== "production";
  // Name the config and the directories. A site rooted somewhere other than where
  // htmx-ui build ran looks fine and then serves nothing, and the roots are the only
  // way to tell that apart from a missing page.
  debug.log(
    "render",
    `${pages.length} pages from ${resolved.pagesDir}, ${
      developing ? "rendering them per request (development)" : resolved.render ? "rendering at runtime" : "serving the built site"
    }`,
    { config: resolved.file ?? "none", root: resolved.root, outDir: resolved.outDir, cache },
  );

  // The route table is fixed by the config, so rank it once instead of per request.
  const table = resolved.user.routes ?? {};
  const patterns = sortRoutes(Object.keys(table));
  const isHead = (request: Request) => request.method === "HEAD";

  return {
    config: resolved,
    pages,

    render(url, context) {
      const page = byUrl.get(route(url));
      if (!page) throw new Error(`[html] no page for ${url} (pages: ${[...byUrl.keys()].join(", ")})`);
      return debug.time("render", `render ${page.url}`, () => renderPage(resolved, page.file, asset, values(context), cache), {
        cached: cache,
      });
    },

    fragment(path, context) {
      // No transform(): a fragment is not a document.
      return debug.time("render", `fragment ${path}`, () =>
        render(locate(resolved.roots, path, "fragment"), { ...templates, context: values(context) }),
      );
    },

    async handle(request) {
      const { pathname } = new URL(request.url);
      const start = performance.now();
      // Logged before anything is tried, so a request with no line after it is the
      // one still in flight: which is what a page that never finishes loading is.
      debug.log("requests", `${request.method} ${pathname}`);
      const answer = (how: string, response: Response | null) => {
        const took = performance.now() - start;
        const status = response ? `${response.status}` : "not handled";
        debug.log("requests", `${request.method} ${pathname} ${status} via ${how} ${took.toFixed(1)}ms`);
        return response;
      };

      for (const pattern of patterns) {
        const params = matchRoute(pattern, pathname);
        if (params) return answer(`route ${pattern}`, await table[pattern]!(Object.assign(request, { params })));
      }
      const path = route(pathname);
      const file = staticFile(resolved.outDir, path);
      if (file) return answer("dist", fileResponse(file, isHead(request)));
      // No dist/ answer: the build hasn't run, so render the page template the route
      // is written as. After dist/, never before it — a built page carries hashed asset
      // URLs and is the same bytes for everyone.
      const page = developing ? byUrl.get(path) : undefined;
      if (page) {
        const html = debug.time("render", `render ${page.url}`, () => renderPage(resolved, page.file, asset, values(), cache), {
          cached: cache,
        });
        return answer("page", htmlResponse(html, isHead(request)));
      }
      const fallback = await resolved.user.fetch?.(request);
      if (fallback) return answer("fetch", fallback);
      const notFound = resolve(resolved.outDir, "404.html");
      if (!existsSync(notFound)) return answer("nothing", null);
      const res = fileResponse(notFound, isHead(request));
      return answer("404.html", new Response(res.body, { status: 404, headers: res.headers }));
    },
  };
}