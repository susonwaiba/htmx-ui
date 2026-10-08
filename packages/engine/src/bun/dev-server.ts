// Dev server process, started by `htmx-ui dev` (./dev.ts) as
//   bun --config=<generated bunfig.toml> --hot dev-server.ts
// so Bun.serve bundles pages with the htmx-ui plugin and Tailwind, with HMR. It runs
// from the directory holding the project and its linked packages (../core/workspace.ts),
// with the project root in $HTMX_UI_ROOT.
//
// Serves every pages/**/*.html as a route, the config's dev routes (mock htmx
// endpoints), the public directory, then the config's fetch fallback, then a 404
// page: pages/404.html when the project has one, htmx-ui's default otherwise.
//
// What reloads what:
//   - scripts, and stylesheets a page or script links directly: Bun's HMR.
//   - templates a page is rendered from (layouts, partials, macros, data), and
//     stylesheets only Tailwind reads (the ones a stylesheet @imports): not in Bun's
//     bundle graph. So this watches the template roots and the linked packages,
//     re-imports the pages (a new query string makes Bun bundle them afresh), swaps
//     them in with server.reload(), and tells open pages to reload over server-sent
//     events (the plugin adds the listener to every page in dev; see RELOAD_PATH).
//     A page added or removed under pages/ gets or loses its route the same way.
//   - the config, its plugins, the mock API and the engine itself: --hot
//     re-evaluates this module, which hands the bundler plugin a page loader built
//     from the new code (see DevState) and reloads open pages the same way.
import { existsSync, readdirSync, watch } from "node:fs";
import { basename, resolve, sep } from "node:path";
import { createIgnore } from "./gitignore";
import { loadConfig, pagesOf } from "../core/config";
import { NOT_FOUND_HTML } from "../core/not-found";
import { devState, initDevState, pageLoader, RELOAD_PATH } from "./plugin";
import { linkedPackages } from "../core/workspace";

const config = await loadConfig(process.env.HTMX_UI_ROOT);
let pages = pagesOf(config);

/** The project's pages/404.html with a 404 status, or htmx-ui's default 404 page. */
async function notFound(): Promise<Response> {
  if (pages.some((p) => p.url === "/404")) {
    // It is a bundled route like any other page (with HMR and the reload listener),
    // so ask this server for it and change only the status.
    const page = await fetch(new URL("/404", server.url));
    return new Response(page.body, { status: 404, headers: page.headers });
  }
  return new Response(NOT_FOUND_HTML, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// Open reload streams, watchers and the page loader live on globalThis so they
// survive --hot re-evaluation. State already being there means this is one.
const reevaluated = devState() !== undefined;
const state = initDevState();
for (const w of state.watchers.splice(0)) w.close();
clearInterval(state.ping);
state.load = pageLoader(config);
if (reevaluated) state.version++; // the pages bundled so far were rendered by the old code

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
  // Nothing matched the route table: usually a typo, but the page-load symptom is a
  // request that never comes back, so say which paths got this far.
  config.debug.log("requests", `${req.method} ${pathname} unmatched`);
  return (await config.user.fetch?.(req)) ?? notFound();
}

const server = Bun.serve({
  port: config.port,
  routes: await routes(),
  development: { hmr: true, console: true },
  idleTimeout: 0, // keep reload streams open
  fetch: fallback,
});
if (reevaluated) {
  config.debug.log("build", `server code changed, reloading pages (v${state.version})`);
  broadcast("data: reload\n\n");
}

let timer: ReturnType<typeof setTimeout> | undefined;
const changed = () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    state.version++;
    try {
      pages = pagesOf(config); // a page may have been added or removed
      server.reload({ routes: await routes(), fetch: fallback });
      config.debug.log("build", `template change, reloading pages (v${state.version})`);
      broadcast("data: reload\n\n");
    } catch (e) {
      config.debug.log("build", `reload failed: ${e}`);
      console.error(e);
    }
  }, 60);
};

// What a change to a file means: scripts are Bun's (HMR in the browser, --hot
// here); a stylesheet may be one Tailwind @imports, which Bun doesn't see (one it
// does see, it also hot-swaps; telling the two apart isn't reliable); anything
// else under a template root is a template, data or an icon.
const SCRIPT = /\.([cm]?[jt]sx?|map)$/;
// Editors that save by writing a temporary file and renaming it over the original
// (x.css.tmp, x.css~, JetBrains' x.css___jb_tmp___) cause an event that, from Bun's
// fs.watch, names only the temporary file: judge it as the file it becomes.
const TEMPORARY = /(\.tmp|~|___jb_\w+___)+$/;
// Files that never become the saved one: vim's 4913 probe, swap files, Emacs locks.
const SCRATCH = /^(4913|\.#.*|.*\.sw[a-p])$/;
const inside = (dir: string, file: string) => file === dir || file.startsWith(dir + sep);
const roots = config.roots.map((r) => r.dir);
const reloads = (event: string) => {
  if (SCRATCH.test(basename(event))) return false;
  const file = event.replace(TEMPORARY, "");
  if (SCRIPT.test(file)) return false;
  return file.endsWith(".css") || roots.some((r) => inside(r, file));
};

/**
 * Directories no root watches for, whatever the roots say. A root is usually the
 * project directory, and the things under it that never change a template are the
 * bulk of the tree: dependencies, the build output, and files that are served
 * rather than rendered.
 *
 * The trade: a change under one of these no longer reloads the page, so a public
 * asset shows up on the next refresh rather than immediately. Naming the directories
 * a project actually renders from avoids needing this at all.
 */
const NEVER_WATCHED = new Set(["node_modules", "dist", "public", ".git"]);
const isIgnored = createIgnore(config.root);

/** Watch a directory's own files, and each subdirectory recursively, skipping ignored ones. */
function watchTree(root: string) {
  const watchDir = (dir: string, recursive: boolean) => {
    try {
      // Event names are relative to the watched directory.
      const w = watch(dir, { recursive }, (_, name) => {
        if (!name) return;
        const file = resolve(dir, String(name));
        if (!isIgnored(file) && reloads(file)) changed();
      });
      state.watchers.push(w);
    } catch (e) {
      console.warn(`Failed to watch ${dir}:`, e);
    }
  };
  watchDir(root, false);
  try {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      const dir = resolve(root, entry.name);
      if (entry.isDirectory() && !NEVER_WATCHED.has(entry.name) && !isIgnored(dir)) watchDir(dir, true);
    }
  } catch (e) {
    console.warn(`Failed to scan ${root}:`, e);
  }
}

// The template roots, and the linked packages for their stylesheets; a directory
// inside another one already watched is covered by it.
const trees = [...new Set([...roots, ...linkedPackages(config.root)])].filter(existsSync);
for (const dir of trees) if (!trees.some((other) => other !== dir && inside(other, dir))) watchTree(dir);

state.ping = setInterval(() => broadcast(": ping\n\n"), 15_000);
state.ping.unref();

if (!reevaluated) {
  console.log(`htmx-ui dev server: ${server.url}`);
  for (const p of pages) console.log("  ", p.url);
  for (const r of Object.keys(config.user.routes ?? {})) console.log("  ", r);
}
