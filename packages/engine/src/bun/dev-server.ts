// Dev server process, started by `htmx-ui dev` (./dev.ts) as
//   bun --config=<generated bunfig.toml> --hot dev-server.ts
// so Bun.serve bundles pages with the htmx-ui plugin and Tailwind, with HMR.
//
// Serves every pages/**/*.html as a route, the config's dev routes (mock htmx
// endpoints), the public directory, then the config's fetch fallback.
//
// Bun's HMR covers scripts, styles and the page files themselves, but not the
// templates a page is rendered from (layouts, partials, macros, data): they aren't
// in the bundle graph. So this watches the template roots, re-imports the pages
// (a new query string makes Bun bundle them afresh), swaps them in with
// server.reload(), and tells open pages to reload over server-sent events
// (the plugin adds the listener to every page in dev; see RELOAD_PATH).
import { existsSync, readdirSync, watch, type FSWatcher } from "node:fs";
import { basename, resolve, sep } from "node:path";
import { loadConfig, pagesOf } from "../core/config";
import { RELOAD_PATH } from "./plugin";

const config = await loadConfig();
const pages = pagesOf(config);
const notFound = () => new Response("Not found", { status: 404 });

// Open reload streams. Kept on globalThis so they survive --hot re-evaluation.
const g = globalThis as typeof globalThis & { __htmxUi?: { clients: Set<ReadableStreamDefaultController>; watchers: FSWatcher[]; version: number } };
const state = (g.__htmxUi ??= { clients: new Set(), watchers: [], version: 0 });
for (const w of state.watchers.splice(0)) w.close();

const encoder = new TextEncoder();
const broadcast = (data: string) => {
  for (const c of state.clients) {
    try {
      c.enqueue(encoder.encode(data));
    } catch {
      state.clients.delete(c);
    }
  }
};

async function routes() {
  const table: Record<string, any> = { ...config.user.routes };
  const v = state.version ? `?v=${state.version}` : "";
  for (const page of pages) table[page.url] = (await import(page.file + v)).default;
  table[RELOAD_PATH] = () => {
    let self: ReadableStreamDefaultController;
    const stream = new ReadableStream({
      start(c) {
        self = c;
        state.clients.add(c);
        c.enqueue(encoder.encode(": connected\n\n"));
      },
      cancel() {
        state.clients.delete(self);
      },
    });
    return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  };
  return table;
}

/** Anything no route matched: the public directory, then the config's fetch fallback. */
async function fallback(req: Request): Promise<Response> {
  const { pathname } = new URL(req.url);
  if (config.publicDir) {
    const file = resolve(config.publicDir, "." + decodeURIComponent(pathname));
    const f = Bun.file(file);
    if (file.startsWith(config.publicDir + sep) && (await f.exists())) return new Response(f);
  }
  return (await config.user.fetch?.(req)) ?? notFound();
}

const server = Bun.serve({
  port: config.port,
  routes: await routes(),
  development: { hmr: true, console: true },
  idleTimeout: 0, // keep reload streams open
  fetch: fallback,
});

// Template changes: anything under a template root that Bun doesn't already track.
// Watch each root's own files plus its subdirectories one by one, skipping
// node_modules, .git and the output directory: a recursive watch of a project root
// would add a watcher for every directory in node_modules.
const SKIP = new Set(["node_modules", ".git", ".cache"]);
const skipped = (dir: string) => SKIP.has(basename(dir)) || dir === config.outDir;
const isTemplate = (file: string) => !/\.(ts|tsx|js|mjs|css|map)$/.test(file);
let timer: ReturnType<typeof setTimeout> | undefined;
const changed = () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    state.version++;
    try {
      server.reload({ routes: await routes(), fetch: fallback });
      broadcast("data: reload\n\n");
    } catch (e) {
      console.error(e);
    }
  }, 60);
};
const onEvent = (_: string, name: string | Buffer | null) => {
  if (name && isTemplate(String(name))) changed();
};
for (const root of config.templateRoots) {
  if (!existsSync(root)) continue;
  state.watchers.push(watch(root, onEvent));
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const dir = resolve(root, entry.name);
    if (entry.isDirectory() && !skipped(dir)) state.watchers.push(watch(dir, { recursive: true }, onEvent));
  }
}
setInterval(() => broadcast(": ping\n\n"), 15_000).unref();

console.log(`htmx-ui dev server: ${server.url}`);
for (const p of pages) console.log("  ", p.url);
for (const r of Object.keys(config.user.routes ?? {})) console.log("  ", r);
