// Scripts and stylesheets for pages a server renders itself while developing:
// createSite() (./site.ts) while NODE_ENV is not "production", which is every
// framework adapter. Nothing is built into dist/, which is the production build's.
//
// A rendered page's source tags (./assets.ts) become links to bundles made from
// those sources on request, in memory:
//   <script type="module" src="/app.ts">
//     -> <link rel="stylesheet" href="/__htmx-ui/dev/<sources>/bundle.css">
//        <script type="module" src="/__htmx-ui/dev/<sources>/app.js">
// The URL carries the page's sources, so it means the same thing to any process and
// survives a restart. A bundle is made on its first request and kept until a file
// under the template roots or a linked package changes; then open pages reload
// (a server-sent event on RELOAD_PATH, which every dev page listens to), so the
// next request bundles again from source. Bun bundles with Bun.build, Node with
// Vite (../bun/dev-bundler.ts, ../node/dev-bundler.ts), Tailwind included.
import { existsSync, readdirSync, statSync, watch, type FSWatcher } from "node:fs";
import { resolve, sep } from "node:path";
import type { ResolvedConfig } from "./config";
import { linkedPackages } from "./workspace";

/** Server-sent events stream dev pages reload on. Shared with `htmx-ui dev` (../bun/dev-server.ts). */
export const RELOAD_PATH = "/__htmx-ui/reload";
// Reloads on a message, and when the stream comes back after the server went away
// (restarted, by hand or by `htmx-ui dev`): the page may be stale by then.
export const RELOAD_SCRIPT = `<script id="script:htmx-ui-reload">{const s=new EventSource("${RELOAD_PATH}");let lost=false;s.onerror=()=>{lost=true};s.onopen=()=>{if(lost)location.reload()};s.onmessage=()=>location.reload()}</script>`;
/** Where dev bundles are served. */
export const DEV_PATH = "/__htmx-ui/dev/";

/** A page document with the reload listener, once. */
export function withReload(html: string): string {
  if (html.includes(RELOAD_PATH)) return html;
  if (html.includes("</head>")) return html.replace("</head>", `${RELOAD_SCRIPT}</head>`);
  return /<html[\s>]|<\/body>/i.test(html) ? html + RELOAD_SCRIPT : html;
}

/** One output of a dev bundle: its path inside the bundle (posix, no leading ./), content and type. */
export interface BundleFile {
  body: string | Uint8Array<ArrayBuffer>;
  type: string;
}

/**
 * Bundles `sources` (absolute files, bundled together like one page's scripts and
 * stylesheets) for the browser. Entries keep their path from the project root with
 * a .js or .css extension ("app.ts" -> "app.js"); `base` is the URL the bundle is
 * served from, for the URLs it writes into its own files. Throws when the bundle
 * fails; the message is shown in the browser console.
 */
export type Bundler = (config: ResolvedConfig, sources: string[], base: string) => Promise<Map<string, BundleFile>>;

const SCRIPT = /\.(?:[cm]?[jt]sx?)$/;
const STYLE = /\.css$/;
const NEVER_WATCHED = new Set(["node_modules", ".git", ".cache"]);

/** "app.ts|styles.css" <-> a URL-safe segment. */
const encode = (sources: string[]) => Buffer.from(sources.join("|")).toString("base64url");
const decode = (segment: string) => Buffer.from(segment, "base64url").toString().split("|");

async function loadBundler(): Promise<Bundler> {
  // Bun runs the engine from src/; Node from lib/, which has no Bun adapter. The Bun
  // path is a variable so the Node build leaves it alone.
  if ("Bun" in globalThis) {
    const bun = "../bun/dev-bundler.ts";
    return ((await import(bun)) as { bundle: Bundler }).bundle;
  }
  return (await import("../node/dev-bundler")).bundle;
}

const noStore = { "Cache-Control": "no-store" };

export class DevAssets {
  private bundles = new Map<string, Promise<Map<string, BundleFile> | Error>>();
  private clients = new Set<ReadableStreamDefaultController>();
  private watchers: FSWatcher[] = [];
  private ping: ReturnType<typeof setInterval> | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private bundler: Promise<Bundler> | undefined;

  constructor(public config: ResolvedConfig) {}

  /** A root-relative path names a script or stylesheet in the project that dev bundles can be made from. */
  isSource(path: string): boolean {
    if (!SCRIPT.test(path) && !STYLE.test(path)) return false;
    const { root, publicDir, outDir } = this.config;
    const file = resolve(root, path);
    const inside = (dir: string | null) => !!dir && (file === dir || file.startsWith(dir + sep));
    if (!inside(root) || inside(publicDir) || inside(outDir)) return false;
    return existsSync(file) && statSync(file).isFile();
  }

  /** The dev tags for a page's sources: its bundle's stylesheet, then a script per script source. */
  tags(sources: string[]): string {
    const base = DEV_PATH + encode(sources) + "/";
    const scripts = sources.filter((s) => SCRIPT.test(s)).map((s) => `<script type="module" src="${base}${s.replace(SCRIPT, ".js")}"></script>`);
    return `<link rel="stylesheet" href="${base}bundle.css">${scripts.join("")}`;
  }

  /** Start over with a new config (the server reloaded its code): drop the bundles and reload open pages. */
  update(config: ResolvedConfig): void {
    this.config = config;
    this.bundles.clear();
    this.reload();
  }

  /** Tell open pages to reload. */
  reload(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      for (const c of this.clients) {
        try {
          c.enqueue(new TextEncoder().encode("data: reload\n\n"));
        } catch {
          this.clients.delete(c);
        }
      }
    }, 60);
  }

  /** The reload stream and the dev bundles; null for any other request. */
  async handle(request: Request): Promise<Response | null> {
    const { pathname } = new URL(request.url);
    if (pathname !== RELOAD_PATH && !pathname.startsWith(DEV_PATH)) return null;
    // Only once a browser asks: a script that just renders pages must be able to exit,
    // and Node's recursive watchers keep a process alive even when unref'd.
    this.watch();
    if (pathname === RELOAD_PATH) return this.stream();
    const [segment = "", ...rest] = pathname.slice(DEV_PATH.length).split("/");
    const sources = decode(segment);
    if (!sources.length || !sources.every((s) => this.isSource(s))) return new Response("Not a dev bundle", { status: 404 });

    let bundle = this.bundles.get(segment);
    if (!bundle) {
      const files = sources.map((s) => resolve(this.config.root, s));
      const start = performance.now();
      bundle = (this.bundler ??= loadBundler())
        .then((bundler) => bundler(this.config, files, DEV_PATH + segment + "/"))
        .then(
          (out) => (this.config.debug.log("build", `dev bundle ${sources.join(", ")} in ${(performance.now() - start).toFixed(0)}ms`), out),
          (e: unknown) => (console.error(`htmx-ui: bundling ${sources.join(", ")} failed:`, e), e instanceof Error ? e : new Error(String(e))),
        );
      this.bundles.set(segment, bundle);
    }
    const built = await bundle;
    const path = rest.join("/");
    if (built instanceof Error) {
      // Into the browser console, where the page's missing behaviour is noticed.
      const message = `htmx-ui: bundling ${sources.join(", ")} failed:\n${built.message}`;
      return path.endsWith(".css")
        ? new Response(`/* ${message.replace(/\*\//g, "* /")} */`, { headers: { "Content-Type": "text/css; charset=utf-8", ...noStore } })
        : new Response(`console.error(${JSON.stringify(message)});`, { headers: { "Content-Type": "text/javascript; charset=utf-8", ...noStore } });
    }
    if (path === "bundle.css") {
      const css = [...built].filter(([p]) => p.endsWith(".css")).map(([, f]) => (typeof f.body === "string" ? f.body : new TextDecoder().decode(f.body)));
      return new Response(css.join("\n"), { headers: { "Content-Type": "text/css; charset=utf-8", ...noStore } });
    }
    const file = built.get(path);
    return file ? new Response(file.body, { headers: { "Content-Type": file.type, ...noStore } }) : new Response("Not found", { status: 404 });
  }

  private stream(): Response {
    let self: ReadableStreamDefaultController;
    const clients = this.clients;
    const body = new ReadableStream({
      start(c) {
        self = c;
        clients.add(c);
        c.enqueue(new TextEncoder().encode(": connected\n\n"));
      },
      cancel() {
        clients.delete(self);
      },
    });
    this.ping ??= setInterval(() => {
      for (const c of this.clients) {
        try {
          c.enqueue(new TextEncoder().encode(": ping\n\n"));
        } catch {
          this.clients.delete(c);
        }
      }
    }, 15_000);
    (this.ping as { unref?: () => void }).unref?.();
    return new Response(body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  }

  /** Watch the template roots and linked packages, once: any change drops the bundles and reloads open pages. */
  private watch(): void {
    if (this.watchers.length) return;
    const changed = () => {
      this.bundles.clear();
      this.reload();
    };
    const out = this.config.outDir;
    const add = (dir: string, recursive: boolean) => {
      try {
        const w = watch(dir, { recursive }, (_, name) => {
          if (name && !resolve(dir, String(name)).startsWith(out + sep)) changed();
        });
        (w as { unref?: () => void }).unref?.();
        this.watchers.push(w);
      } catch {
        // A directory that went away, or a platform limit: that tree just doesn't reload.
      }
    };
    const dirs = [...new Set([...this.config.roots.map((r) => r.dir), ...linkedPackages(this.config.root)])].filter((d) => existsSync(d));
    const inside = (dir: string, other: string) => dir !== other && dir.startsWith(other + sep);
    for (const dir of dirs) {
      if (dirs.some((other) => inside(dir, other))) continue;
      add(dir, false);
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const sub = resolve(dir, entry.name);
        if (entry.isDirectory() && !NEVER_WATCHED.has(entry.name) && sub !== out) add(sub, true);
      }
    }
  }
}

// One per project root, kept on globalThis: a server restarted in place (bun --hot)
// creates its site again, and must keep the open pages' reload streams and watchers.
const shared = ((globalThis as { __htmxUiDevAssets?: Map<string, DevAssets> }).__htmxUiDevAssets ??= new Map());

/** The dev assets for a project. Asking again (a server reloading its code) reloads open pages. */
export function devAssets(config: ResolvedConfig): DevAssets {
  const existing = shared.get(config.root);
  if (existing) {
    existing.update(config);
    return existing;
  }
  const created = new DevAssets(config);
  shared.set(config.root, created);
  return created;
}
