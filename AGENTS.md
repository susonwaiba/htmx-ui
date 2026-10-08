# AGENTS.md

This document serves as the single source of truth for AI agents and human contributors working in this repository. It details project architecture, coding standards, component lifecycles, and verification commands.

---

## 1. Project Overview & Tech Stack

This project is a high-performance, multi-page static and server-driven web application built with:
- **Runtime & Toolchain:** [Bun](https://bun.sh) (strictly used for execution, bundling, serving, testing, and package management in this repo). A Bun workspace of six published packages (the library, the engine, three official plugins, the scaffolder) plus the docs site.
- **Engine runtimes:** `htmx-ui-engine` runs users' sites on Bun (Bun.serve + Bun.build) **or Node (Vite)**. Vite exists only inside the engine's Node adapter, as an optional peer dependency; this repo's own site, scripts and tests run on Bun.
- **Frontend Interaction:** [htmx 4.x](https://htmx.org) (`htmx.org`) for server-driven UI updates and fragment swapping
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) via `bun-plugin-tailwind` (Bun) or `@tailwindcss/vite` (the engine's Node adapter)
- **Language:** TypeScript 5+ (in strict mode with `verbatimModuleSyntax`, `moduleResolution: "bundler"`, and `noEmit: true`)
- **Templating:** Plain `.html` files rendered at build time with [Nunjucks](https://mozilla.github.io/nunjucks/) (layouts, blocks, includes). **No React, JSX, Vue, or Svelte.**
- **Long-form text:** `@tailwindcss/typography` (`.prose`), mapped onto the design tokens in `packages/ui/src/components/text/text.css`. Wrap content in `.prose` instead of putting a class on every element; components inside it take `not-prose`.

---

## 2. Strict Tooling Rules

Agents must adhere strictly to Bun-native primitives:

- **Package & Command Management:**
  - ALWAYS use `bun`, `bun run`, `bun test`, `bunx`, and `bun install`.
  - NEVER use `npm`, `yarn`, `pnpm`, `npx`, `node`, `ts-node`, `jest`, or `vitest`.
- **Bundler & Build Tools:**
  - Bundling and dev serving rely on `Bun.build` and HTML imports in `Bun.serve()`.
  - NEVER introduce `vite`, `webpack`, `rollup`, `esbuild`, or external bundlers into the repo's own tooling.
  - **One exception:** `packages/engine/src/node/` is the engine's Node adapter and is built on Vite (an optional peer dependency, loaded from the user's project). Keep Vite imports there; nothing else may depend on it. Node-runtime code must use `node:` APIs only (no `Bun.*`), and `packages/engine/src/core/` must run on both runtimes.
- **Runtime APIs:**
  - Prefer Bun built-ins over external npm packages:
    - HTTP server: `Bun.serve()` (never Express, Fastify, or Koa).
    - File I/O: `Bun.file()` / `Bun.write()` over `node:fs` where applicable.
    - Process execution: `` Bun.$`cmd` `` over `execa` or `child_process`.
    - WebSockets: Native `WebSocket` (never `ws`).
    - Data persistence (if added): `bun:sqlite`, `Bun.sql`, or `Bun.redis`.
- **Environment Configuration:**
  - Bun automatically loads `.env` files. Do NOT install or configure `dotenv`.

---

## 3. Repository Structure

A Bun workspace (`package.json` `workspaces`). One rule: **`packages/ui/src/` is the published component library and must not depend on the site, the scripts or the engine.**

```
.
├── packages/
│   ├── ui/                         # htmx-ui: THE COMPONENT LIBRARY (published)
│   │   ├── package.json            # exports: lib/ (JS + types; "bun" condition -> src/) and src/ (CSS, macros, icons)
│   │   ├── build.ts                # bun run build (in build:lib): src/ -> lib/ (ESM + .d.ts)
│   │   ├── css.test.ts             # every custom property / color-mix() survives the minified build
│   │   └── src/
│   │       ├── index.ts            # "htmx-ui": initComponents(root)
│   │       ├── styles.css          # "htmx-ui/styles.css": tokens, dark variant, highlighting colours, component CSS
│   │       ├── theme.ts            # "htmx-ui/theme": initTheme(), getTheme()
│   │       ├── components/         # One directory per component (bun run component:new <name>)
│   │       │   ├── index.ts        # initComponents(root): registers every behaviour
│   │       │   ├── index.test.ts   # Registry test: every component is imported in styles.css / registered here
│   │       │   └── <name>/         # <name>.css, optional <name>.ts + .test.ts, <name>.html (macro), *.json (macro data)
│   │       ├── utilities.css       # Shared @utility building blocks (menu-item, popup-surface, focus-outline, …)
│   │       ├── utils/              # Shared behaviour helpers (see §4.2): dom.ts (queryAll, public), listbox.ts,
│   │       │                       #   dismiss.ts, position.ts, menu.ts, shared.ts, hotkey.ts (public)
│   │       └── icons/*.svg         # Icon files; inlined by icon(), copied to the site's dist/assets/icons/
│   ├── engine/                     # htmx-ui-engine: CLI + Bun plugin + Vite plugin + server adapters (published)
│   │   ├── bin/htmx-ui.js          # Launcher: picks Bun or Node, then runs that runtime's CLI
│   │   ├── build.ts                # bun run build (in build:lib): the Node side -> lib/ (ESM + .d.ts)
│   │   └── src/
│   │       ├── index.ts            # "htmx-ui-engine": the core (defineConfig, render, routes, createSite, ...)
│   │       ├── core/               # Runtime-agnostic, node: APIs only: config, render (Nunjucks), routes, highlight, site, http, cli args
│   │       ├── bun/                # "htmx-ui-engine/bun": plugin, dev server (Bun.serve), build (Bun.build), preview
│   │       ├── node/               # "htmx-ui-engine/vite": Vite plugin; index.ts = the Node CLI (dev/build/preview)
│   │       ├── core/plugin.ts      # Plugins: the Plugin type, definePlugin, merging into the config (§4.10)
│   │       ├── core/html.ts        # editHtml(): runtime-agnostic streaming HTML editor for transforms and plugins
│   │       ├── elysia.ts           # "htmx-ui-engine/elysia": plugin serving the built site (the recommended adapter)
│   │       ├── express.ts          # "htmx-ui-engine/express": middleware serving the built site
│   │       └── hono.ts             # "htmx-ui-engine/hono": middleware serving the built site
│   ├── plugin-docs/                # htmx-ui-plugin-docs (published): anchors, Markdown, llms.txt, sitemaps, docsNav(), docs/macros.html
│   ├── plugin-versions/            # htmx-ui-plugin-versions (published): archived versions, switcher, versions:name/archive commands
│   ├── plugin-search/              # htmx-ui-plugin-search (published): the Ctrl/⌘K palette over sitemap.json
│   │   └── (each)                  # src/index.ts (engine plugin), src/client.ts (browser), src/styles.css, src/templates/<name>/
│   └── create-htmx-ui/             # create-htmx-ui: the scaffolder (published; plain JS, no build)
│       ├── index.js                # bun/npm/pnpm/yarn create htmx-ui
│       └── template/               # The starter site (_gitignore becomes .gitignore)
├── site/                           # THE WEBSITE: marketing pages + docs, built with the engine. Not published.
│   ├── package.json                # htmx-ui-site: dev/build/preview = htmx-ui dev/build/preview
│   ├── htmx-ui.config.ts           # Engine config: the docs/versions/search plugins, mock API routes, icons (route + build hook)
│   ├── app.ts                      # Client entry: htmx, styles, initComponents, the plugins' clients, site features
│   ├── pages/                      # Routes: index.html -> /, docs/theming.html -> /docs/theming
│   ├── layouts/                    # base.html (shell), site.html (marketing), docs.html (sidebar docs)
│   ├── partials/                   # header (uses search()), footer
│   ├── data/                       # site.json, docs-nav.json, versions.json, changelog.json (read with json())
│   ├── features/                   # Site-only behaviour, run once on load: year
│   ├── styles/                     # app.css (Tailwind + htmx-ui/styles.css + the plugins' styles + docs.css), docs.css (site-only)
│   ├── server/api.ts               # Mock htmx fragment endpoints (config routes)
│   ├── lib/                        # paths.ts; engine.ts (the resolved site config, for tests); *.test.ts (pages, outputs)
│   └── archive/                    # Frozen builds of older docs versions (created by docs:archive = htmx-ui versions:archive)
├── scripts/                        # Repo scripts: release-check, new-component, version, build-plugin, dom-setup, paths
├── .github/workflows/              # ci.yml (checks on push/PR), release.yml (publish all six on v* tag)
├── dist/                           # The site's build output (gitignored)
├── bunfig.toml                     # Test preload only (the engine generates the dev server's bunfig)
├── package.json                    # Private workspace root: scripts proxy to site/ and packages/
├── tsconfig.json                   # Editor + typecheck; "paths" map htmx-ui to its source for the workspace
├── README.md, CHANGELOG.md         # Repo overview; release notes for every package (one shared version)
└── LICENSE                         # MIT (copied into each package)
```

---

## 4. Architectural Contracts

### 4.1. File-Based HTML Page Routing
- **Location:** `site/pages/**/*.html` (for user sites, `pages/` in the project; `pages` in `htmx-ui.config.ts`).
- **Route Resolution** (`routeFor()` in `packages/engine/src/core/routes.ts`):
  - `pages/index.html` $\rightarrow$ `/`
  - `pages/about.html` $\rightarrow$ `/about`
  - `pages/nested/index.html` $\rightarrow$ `/nested`
  - `pages/nested/page.html` $\rightarrow$ `/nested/page`
- **Layouts & Partials:** Pages are templates, not full documents. They `{% extends %}` a layout and the layout owns `<html>`/`<head>`/`<body>` plus the nav, main frame and footer. See §4.7.
- **Dev server:** `htmx-ui dev` (Bun: `packages/engine/src/bun/dev-server.ts`) globs pages on startup. **Creating a new `.html` page requires restarting `bun run dev`** to register the route. (The Node adapter rescans on its own.)
- **Production Build:** `htmx-ui build` (Bun: `packages/engine/src/bun/build.ts`) uses every page as a `Bun.build` entrypoint with `root` = the pages directory, into `dist/`. Pages keep their paths; scripts, styles and images go to `dist/assets/` with content hashes. Bun emits a one-line forwarding entry chunk per page; `packages/engine/src/bun/chunks.ts` points pages straight at the shared chunk, deletes the stubs and adds `modulepreload` for remaining static imports, so every page shares one JS and one CSS file (as Vite does on Node).

### 4.2. Component Architecture & Lifecycle
Components are partitioned into CSS classes and optional TypeScript behaviors.

Each component is a directory, `packages/ui/src/components/<name>/`, holding every file named after it: `<name>.css`, and optionally `<name>.ts`, `<name>.test.ts`, `<name>.html` (macro) and any data its macro reads. Keep component code inside its directory; shared helpers go in `packages/ui/src/utils/`. Scaffold with `bun run component:new <name> [--behaviour]`.

1. **Styles (`packages/ui/src/components/<name>/<name>.css`):**
   - Write styles under `@layer components`.
   - Use Tailwind `@apply` directives for utilities.
   - Must be `@import`ed in `packages/ui/src/styles.css`.
   - Use token utilities (`bg-primary`, `text-muted-foreground`, `border-border`), never raw palette colours, so theming and dark mode work. Tokens are defined in `packages/ui/src/styles.css`; see `/docs/theming`. Durations use the motion tokens (`duration-(--motion-duration-moderate)`, `var(--motion-duration-*)`), backdrops `bg-overlay`.
   - **Reuse before writing.** `@apply` only takes utilities, not another component's class, so shared looks live as `@utility` blocks in `packages/ui/src/utilities.css`: `menu-item` / `menu-label` / `menu-separator` / `menu-empty` (rows in popup lists), `popup-surface` (floating panels), `focus-outline`, `input-bare`, `label-text` / `description-text`, `choice-card`, `panel-title`, `chevron-mask`, `summary-trigger`, `details-animate`. Use them instead of copying their utilities; add one there when a second component needs the same look. In markup and macros, build on existing classes (`btn btn-ghost btn-icon btn-sm` for an icon button, `.input` rules for a field-like trigger, `.tabs-trigger`, `.separator`, `loader()`, `icon()`) and keep a component class only for what is its own (position, a variant).
   - **Tailwind gotcha:** Tailwind's optimiser keeps only one `color-mix()` override per rule, so two opacity-modified token colours in one rule (e.g. `@apply border-info/30 bg-info/5`) leave the second one solid. Put each in a separate rule with a distinct selector; see `alert/alert.css`.
   - **Icon sizes:** `icon()` puts a `size-4` utility on every icon, and the utilities layer beats `@layer components`, so a component rule like `[&>svg]:size-3` never applies to it. Where the component must decide its icons' size, mark the rule important (`[&>svg]:size-3!`); see `badge/badge.css`, `attachment/attachment.css`.
2. **Behavior (`packages/ui/src/components/<name>/<name>.ts`):**
   - Export an initialization function accepting an optional `root: ParentNode = document`.
   - **Idempotency Rule:** To prevent duplicate event listeners on htmx swaps, selectors must query `[data-<component>]:not([data-init])` and immediately stamp matched elements with `el.dataset.init = ""` (or `"true"`). A component whose attribute can sit on the same element as another's uses its own marker instead (`data-tabs-init`, `data-drawer-init`).
   - **Shared helpers** (`packages/ui/src/utils/`): `listbox.ts` (option filtering, `reachable()`, the `activeDescendant()` highlight for lists whose focus stays in an input), `dismiss.ts` (`dismissable()`: close on a pointer down outside or focus leaving), `position.ts` (`place()`: flip a popup that would leave the viewport), `menu.ts` (role="menu" panels: keys, typeahead, submenus, one open at a time), `shared.ts` (`ensureId`, `nextIndex` for arrow keys, `isEditable`, `isDisabled`, `cssTime`, `transitionTime`, `reducedMotion`, `responseOk`), `hotkey.ts` (`matchesHotkey`). Import icons a behaviour draws from `src/icons` as text (`import x from "../../icons/x.svg" with { type: "text" }`) rather than pasting SVG.
3. **Registration:**
   - Call the component's initializer within `initComponents(root)` in `packages/ui/src/components/index.ts`.
   - `packages/ui/src/components/index.test.ts` fails if a component's CSS isn't imported in `styles.css` or its behaviour isn't registered.
   - `packages/ui/src/index.ts` re-exports with `export *`: Bun's bundler drops *named* re-exports from a package with a `sideEffects` list, which once left `lib/index.js` empty. The release check imports `lib/` on Node to catch that.
4. **Lifecycle Hooks in `site/app.ts`:**
   - Runs on initial load: `DOMContentLoaded` triggers `initComponents(document)`.
   - Runs on new htmx content: `document.addEventListener("htmx:after:process", (e) => initComponents(e.target ?? document))`. htmx 4 fires `htmx:after:process` on **each newly inserted element**.
   - *Do not* use `htmx:after:swap` for this: in htmx 4 it is dispatched on the element that made the request, not on the swapped content.
   - The new element is often the component itself, so initialisers must find elements with `queryAll(root, selector)` from `packages/ui/src/utils/dom.ts`, which includes `root`. `root.querySelectorAll` alone misses it.
   - *Note:* HTMX 4 uses colon-delimited event names (`htmx:after:process`, NOT HTMX 1/2's `htmx:afterProcessNode`).

### 4.3. Features Contract
- Site-only behaviour lives in `site/features/<feature>.ts`. **The filename must match what the module does.**
  - `year.ts` — fills `[data-year]` elements with the current year.
  - `chat-demo.ts` — demo only: `form[data-chat-demo="#scroller"]` appends the typed turn to that message scroller and streams a canned reply (the message scroller docs).
- Behaviour a plugin provides comes from its `/client` module, imported in `site/app.ts` and called in the same `DOMContentLoaded` handler (§4.10):
  - `htmx-ui-plugin-docs/client` — `initMarkdownCopy()`: deprecated, for the plugin's older "Copy Markdown" markup only. The "Copy Markdown" button is now an htmx-ui clipboard button (icon + text) (`data-clipboard-url`), handled by `initComponents`; the site no longer calls it.
  - `htmx-ui-plugin-versions/client` — `initVersions()`: rebuilds the version switcher from `/docs/versions.json`; shows the "old version" banner.
  - `htmx-ui-plugin-search/client` — `initSearch()`: a `<dialog>` command palette (Ctrl/⌘K, `/`) over the sitemap of the docs version being read (the dialog's `data-search-src`, default `/sitemap.json`, or an archived version's own sitemap). `search-index.ts` in the plugin is the pure fuzzy matcher (pages + sections; exact > prefix > substring > in-order letters > one typo); results link to `page#section`. The index loads on first open or on hovering the search button.
- The theme switcher is part of the package: `packages/ui/src/theme.ts` (`initTheme`, `getTheme`). It applies `.dark` on `<html>`, persists the choice in `localStorage`, and follows `prefers-color-scheme` until the user picks.
- Intended for global, single-run behaviors (theme toggles, global analytics, copyright year injection).
- Invoked only once inside the `DOMContentLoaded` listener in `site/app.ts`. Do not hook features into `htmx:after:process` unless they explicitly manage swapped DOM nodes.
- **Do not capture browser globals at module scope** (e.g. `const mq = matchMedia(...)`) — call them inside the function so tests can stub them.
- Dark mode uses a **class-based** `dark:` variant, declared in `packages/ui/src/styles.css` via `@custom-variant dark (&:where(.dark, .dark *))`. To avoid a flash of the wrong theme, `site/layouts/base.html` carries a tiny inline `<script>` in `<head>` that sets the class before first paint. Keep that script in sync with `theme.ts`.

### 4.4. Tailwind CSS v4 Configuration
The engine wires Tailwind in for both runtimes; there is nothing to configure per project:
1. **Bun dev server:** `Bun.serve` only takes bundler plugins from a bunfig, so `htmx-ui dev` writes `node_modules/.cache/htmx-ui/bunfig.toml` with `[serve.static] plugins = [<engine>/src/bun/serve-plugin.ts, bun-plugin-tailwind, …the project's own]` and runs the dev server with `bun --config=<that file> --hot`.
2. **Bun build:** `Bun.build({ plugins: [htmxUiPlugin(config), tailwind] })` in `packages/engine/src/bun/build.ts`.
3. **Node:** `@tailwindcss/vite` after the htmx-ui Vite plugin (`packages/engine/src/node/index.ts`).
4. **Content Discovery:** `site/styles/app.css` has `@source "../";` (site templates). `htmx-ui/styles.css` itself has `@source "./components";`, so utilities used by the package's macros and behaviours are generated whichever bundler compiles it. On Bun the htmx-ui plugin runs before Tailwind, so Tailwind also sees classes in rendered layouts and partials.

### 4.5. Mock Backend & Request Endpoints (`site/server/api.ts`)
- Mock routes return HTML fragments using `new Response(htmlString, { headers: { "Content-Type": "text/html; charset=utf-8" } })`.
- `apiRoutes` is spread into `routes` in `site/htmx-ui.config.ts`. Engine `routes` use Bun.serve route syntax (`/api/:id`, `/files/*`) on both runtimes, and get a web `Request` (with `params`).
- **Static Output Warning:** The production build (`dist/`) is purely static. Mock endpoints are not compiled into `dist/`; they are served by `htmx-ui dev` and by the engine's own server adapters (§4.6), so they work behind any of the server adapters (§4.6), but not under `bun run preview` or on a plain static host.

### 4.6. Serving a Site from a Backend (`packages/engine/src/core/site.ts`)
`createSite(options?)` is the framework-free core of the dev servers, reusable by a real backend. Everything in `core/` must run on both runtimes (`node:` APIs only).

- **`Site`** — `config`, `pages`, `render(url, context?)` (a full page per request, through the config's `transform`), `fragment(path, context?)` (any template as an HTML fragment for htmx) and `handle(request, context?)` → `Response` (always; every path gets an answer).
- **`SiteOptions`** — `root`, `config`, `context`, `asset(file, page)`, `cache`, `site` (reuse an existing site).
- **Resolution order in `handle()`:** config `routes` → the built `dist/` (pages, hashed assets, `public/`) → outside `NODE_ENV=production`, the page template for the route → config `fetch` → a 404: built `dist/404.html`, else (dev) `pages/404.html`, else htmx-ui's default page (`core/not-found.ts`, also written to `dist/404.html` by builds without one, and served by `htmx-ui dev`/`preview`).
- **`packages/engine/src/core/http.ts`** — `toRequest(req: IncomingMessage, parsed?)` (`parsed`: a body a framework's parser already read, re-encoded by Content-Type) and `send(res: ServerResponse, response)` bridge `node:http` to web `Request`/`Response`. The Vite plugin uses them too; `send()` sets `Content-Length` only for `HEAD` (a duplicated header on `GET` breaks Bun's `http.request`).
- **Adapters** (`src/elysia.ts`, `src/fastify.ts`, `src/koa.ts`, `src/express.ts`, `src/hono.ts`) each export `htmxUi(options?: SiteOptions)` and take no framework dependency: Elysia gets a plugin that returns the instance so `.use(htmxUi()).listen()` chains, Fastify a plugin (marked `skip-override`) that sets the not-found handler, Koa middleware that answers after `await next()` only when nothing set a body or status, Express and Hono middleware. They are type-checked against the real frameworks as engine dev dependencies (`elysia`, `fastify`, `koa`, `express`, `hono`), but must keep working when those are absent, so never import them. A new adapter also goes in `build.ts` entrypoints, `tsconfig.lib.json`, the `exports` map and `scripts/release-check.ts`.
- **Elysia is the recommended adapter** (docs order, examples, `MANAGERS`/package-manager lists too): a specific route always beats its catch-all, so nothing depends on registration order. Fastify and Koa are order-independent too; Express and Hono are documented as "mount last".
- Mount adapters **last** (Express, Hono): they answer every request they see.

### 4.7. Templates (Nunjucks, `packages/engine/src/core/`)
Pages are [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates; the engine renders them into full documents before the bundler (Bun's, or Vite) runs.

- **`packages/engine/src/core/render.ts`** — Nunjucks environment, runtime-agnostic. Exports `render(path, roots | RenderOptions)`. Registers the globals and filters below.
- **`packages/engine/src/core/config.ts`** — `htmx-ui.config.ts` loading and `renderPage(config, file)`: `render()` with the config's template roots, origin, globals and filters, then its `transform`. Every adapter renders through `renderPage`.
- **`packages/engine/src/bun/plugin.ts`** — `BunPlugin` that runs `renderPage()` in an `onLoad` hook with `loader: "html"`. **`packages/engine/src/node/vite-plugin.ts`** — the same in a `transformIndexHtml` "pre" hook.
- **The site's render settings** are its config, `site/htmx-ui.config.ts`, plugins included (the docs plugin's `transform` adds heading anchors). `site/lib/engine.ts` resolves that config for tests, so they render exactly what dev and the build serve. The config's `globals`/`filters` are how a project adds its own template helpers (the site has none; its plugins add `docsNav()` and `docsVersions()`); `markup()` (`core/render.ts`, exported from the package) wraps a string so a helper can return HTML.
- **Template roots:** `site/`, then each plugin's `src/templates/`, then htmx-ui's `src/` (added automatically when the package is installed; here it resolves to `packages/ui/src` through the workspace link). Names are root-relative and the first match wins: `"layouts/docs.html"` comes from `site/`, `"docs/macros.html"`, `"versions/macros.html"` and `"search/macros.html"` from the plugins, `"components/icon/icon.html"` from the package. `json()`, `svg()`, `glob()`, `asset()` and `assetVer()` resolve the same way.
- **`site/layouts/*.html`** — document shells. Declare `{% block %}`s, `{% include %}` partials.
- **`site/partials/*.html`** — reusable fragments (header, footer). The version switcher, banner, search palette and Markdown buttons are plugin macros.
- **`.agents/skills/nunjucks-templates/SKILL.md`** — how to write templates here: project settings, `asset()`, macros, gotchas. Read it before editing templates.

| Syntax | Purpose |
| :--- | :--- |
| `{% extends "layouts/base.html" %}` | Wrap the page in a layout. Must be the first tag. |
| `{% block content %}…{% endblock %}` | Fill (in a page) or declare (in a layout) a block. Layout content is the fallback; `{{ super() }}` keeps it. |
| `{% include "partials/header.html" %}` | Inline a partial. Shares the caller's context. |
| `{% macro %}` / `{% import %}` | Parameterised partials (e.g. a card taking a title). |
| `{{ asset("app.ts") }}` | A root-relative path rewritten relative to the page being rendered. |
| `{{ assetVer("app.css") }}` | The same, plus `?ver=<package.json version>` (plus a random suffix in dev), for URLs that don't change with their content. |
| `globals`, `filters` in the config | Project helpers, registered per render like the built-ins. |
| `{{ url }}` | The page's route, e.g. `/docs/components/button`. |
| `json("data/x.json")` | Parsed JSON file. Use for any repeated content instead of an API. |
| `svg("assets/x.svg", {class: "…"})` | Inline an SVG file, setting attributes on its root. |
| `glob("icons/*.svg")` | Sorted root-relative paths. |
| `\| dedent`, `\| highlight(lang)` | De-indent; syntax-highlight at build time (Shiki). |

The functions and `url` are **globals**, so they work inside macros imported without `with context`.

`base.html` declares `title`, `head` and `body`. Pages extend `site.html` (marketing) or `docs.html` (docs), which both provide `content`. Docs pages set `title` and `description` with top-level `{% set %}` instead of blocks.

**Rules:**
- Template names are resolved from the **roots** (`roots` in the config, default `["."]`), not from the current file: write `"layouts/base.html"`, never `"../layouts/base.html"`.
- A root may be `{ name, dir }`. The name is the prefix templates reach that directory by (`{% extends "layouts/base.html" %}` resolves `name: "layouts"`), so a directory can be renamed or moved without any template changing. Names must be one directory name and unique; both are refused in `normalizeRoots()`. Resolution is `tryLocate()` in `core/render.ts`, reached through `RootsLoader`, which Nunjucks uses for every template load — so a name works in `extends`/`include`/`import`/`from` and in `json()`, `svg()`, `glob()` and `asset()` too. `roots[0]` is the project root (`pages`, `outDir`, `publicDir`, `asset()` URLs, Vite root, Bun cwd) — so a deployment that copies its templates elsewhere writes `roots: [".", "dist/_templates"]`, keeping `"."` first. `roots` is the only way to say this; there is no separate option for search paths.
- Bundlers resolve `<script src>` / `<link href>` relative to the *page*, so **local asset paths in layouts and partials must use `{{ asset("…") }}`** to work for nested pages. Root-absolute links (`href="/about"`) and external URLs need nothing.
- `throwOnUndefined` is on: `{{ typo }}` fails the build rather than rendering nothing. Autoescape is on; use `| safe` only for trusted markup.
- **Any package-manager command in the docs must use `cli()`** from `components/code/code.html` (bun/npm/pnpm/yarn tabs, choice remembered). Never hard-code `bun add …` in user-facing docs. Bun-only commands (e.g. `bun --hot server.ts`) are fine in a plain `code()` block.
- **Icons:** `icon(name)` inlines `icons/<name>.svg` (the package's, unless the project has its own). Don't paste SVG markup into templates; add a file instead. `mode="img"` emits an `<img>` that the bundler copies and hashes. Link local files with `asset()`; a root-absolute `<img src="/x.svg">` only works for files in the project's `public/` directory (the site has none).
- **Public files** (`public/`, engine sites): link them root-absolute (`href="/favicon.svg"`). Bun's HTML bundler can't leave a local URL alone, so the Bun plugin points such links at the file in dev and at a placeholder origin (`PUBLIC_ORIGIN`) in builds, which `htmx-ui build` strips again.
- Templates are not cached, so a re-render always reads current layouts/partials. In dev the engine watches the roots and reloads open pages when a layout, partial, macro or data file changes (Bun: re-imports the pages and sends a server-sent event on `/__htmx-ui/reload`; Node: Vite full reload). The Bun watcher skips `node_modules`, `dist`, `public` and `.git` whatever the roots say (`NEVER_WATCHED`), so a root of `.` does not walk dependencies.
- **Load order matters:** the htmx-ui plugin must precede the Tailwind plugin so Tailwind scans rendered markup. The engine does this; keep it that way in `bunfig()` and `build()`.
- **Never let template syntax reach the output:** write literal Nunjucks in prose as `&#123;% … %&#125;`, not `{% raw %}` (which emits `{%`). Code blocks encode braces already. `raw` resets indent to 0, so, open and close in new lines.

### 4.8. Agent & Search Outputs (`htmx-ui-plugin-docs`, `packages/plugin-docs/`)
Every docs page (route under `/docs`) is also published as Markdown for AI agents. Nothing is hand-written: `packages/plugin-docs/src/markdown.ts` converts the rendered article body (`[data-docs-content]`) with happy-dom; `outputs.ts` builds the indexes; `anchors.ts` adds heading ids. The plugin is runtime-agnostic (`node:` APIs, `editHtml()`), since Node users load it under Vite.

| Output | Contents |
| :--- | :--- |
| `<route>.md` (`/docs.md`, `/docs/components/button.md`) | Frontmatter + page as Markdown. Demos become their source; tables become Markdown tables. |
| `/llms.txt`, `/llms-full.txt` | llmstxt.org index; all docs Markdown in one file. |
| `/sitemap.xml` | Every page, for search engines. |
| `/sitemap.json` | Every page (latest version): title, description, section, h2/h3 outline, **section text** (`sections[]`, for site search) and Markdown URL, plus `versions[]` pointing at each version's sitemap. Basis for site search and a future MCP server. |
| `/docs/sitemap.json`, `/docs/v<id>/sitemap.json` | Per-version docs sitemaps, same format. Archived ones are written by `docs:archive`. The 404 page is left out of every sitemap. |
| `/robots.txt` | Points at the sitemap. |

- The plugin's `build.done` writes them to `dist/`; its `routes` and `fetch` serve them on request (dev server and server adapters). The `versions` fields come from htmx-ui-plugin-versions' `api`, when it is in `plugins`.
- Absolute URLs come from the config's `origin`: `$SITE_URL`, falling back to `url` (the site sets it from `site/data/site.json`). **Set `SITE_URL` for production builds.**
- Order follows `site/data/docs-nav.json`, which also drives the sidebar and prev/next through the plugin's `docsNav(url)` global.
- Mark purely visual blocks `data-md-skip` (left out of Markdown and search text). Write examples so the source alone is a complete spec.
- **Heading anchors:** the docs plugin's `transform` (`packages/plugin-docs/src/anchors.ts`) gives every h2/h3 in `[data-docs-content]` an id (slug of its text unless set explicitly) and a `.heading-anchor` `#` link. Headings that aren't document sections are skipped: inside links (card titles in `a.card`; an anchor there would nest `<a>` in `<a>` and the browser breaks the card apart), `.not-prose` component markup, `.demo` and `[data-md-skip]`. `site/lib/pages.test.ts` fails if any page nests links. Explicit `id`s are kept, so set one when a heading's wording may change but its links must not. Always render site pages with `renderPage(engine, file)` (`engine` from `site/lib/engine.ts`), not `render()`, so HTML, Markdown and sitemaps share ids.
- The `origin` template global is the public site URL (`$SITE_URL`); use it for absolute URLs in docs (e.g. the prompts on the AI agents page).

### 4.9. Versioned Docs (`htmx-ui-plugin-versions`, `packages/plugin-versions/`)
- The **latest** docs version is rendered live from `site/pages/docs` at `/docs/...`.
- **Older** versions are frozen *built* snapshots (HTML, Markdown, CSS/JS chunks) in `site/archive/v<id>/`, served at `/docs/v<id>/...`. Freezing the build means later component or layout changes can never break old docs.
- `site/data/versions.json` lists versions; the plugin publishes `/docs/versions.json` (each version's path and page list) and serves/copies `site/archive/`. The sidebar switcher (`version_switcher()` in `versions/macros.html` + `htmx-ui-plugin-versions/client`) reads it at runtime, so old snapshots also list newer versions and show a banner linking to the latest. Archived snapshots carry their own frozen JS, so **keep the formats of `/docs/versions.json`, `/sitemap.json` and the per-version sitemaps stable**: old snapshots read them.
- **The version in development is not numbered.** It is listed with the id (and label) `next` until you release it, so the next release may turn out to be a patch, a minor or 1.0. Its id never reaches a URL, because only *archived* versions get a `/docs/v<id>/` prefix.
- **Never edit `site/archive/` by hand.** Create a snapshot with `bun run docs:archive` (no argument; it runs the plugin's `htmx-ui versions:archive` in `site/`). It builds, snapshots the current latest (rewriting `/docs` links to `/docs/v<id>`, moving assets to `_assets/`, adding `noindex`, and baking the old-version banner into each page so it needs no JavaScript), marks it archived and starts a new `next`.
- Name the version at release time with `bun run version:set <x.y.z>` (`scripts/version.ts`: the plugin's `nameVersion()` plus the package versions): it replaces `next` in `versions.json` with the docs version (`<major>.<minor>`, or `<major>` from 1.0), dates it today and sets the same version on every package. It refuses while the latest is not `next`, and `archiveDocs` refuses to snapshot a `next` id, so an unnamed version can never be published under a URL.
- Links that must point across versions (the switcher, links to `/docs/versions.json`) carry `data-version-link`, which the archiver leaves alone.
- Docs are versioned per minor before 1.0 and per major after. Patch releases update the current docs in place.

### 4.10. Plugins (`packages/engine/src/core/plugin.ts`)
Optional features are plugins: `plugins: [docs(), versions(), search()]` in a config. A plugin is `{ name, roots?, globals?, filters?, transform?, routes?, fetch?, build?: { done? }, commands?, configResolved?, api? }`.

- **One merge, in `resolveConfig()`.** `applyPlugins()` folds the plugins into `ResolvedConfig.user`, which every runtime and adapter already reads (`config.user.routes`, `.fetch`, `.transform`, `.build.done`, `.globals`), so plugins work in Bun dev, Vite, builds and `createSite()` with no adapter knowing about them. `ResolvedConfig.plugins` is the flat list; `configResolved(config)` runs at the end of `resolveConfig()`.
- **The project wins.** Its routes/globals/filters override a plugin's of the same key; its `fetch` runs first; its `transform` and `build.done` run last. Between plugins, list order. Plugin `roots` go after the project's roots and before htmx-ui's `src/`; root names must stay unique.
- **Commands:** `commands: { "versions:archive": { description, usage?, run(ctx) } }` become `htmx-ui versions:archive` (`core/cli.ts`: `parse()` is lenient for non-built-in commands, `runCommand()`, `help()` lists them). `ctx` = `{ config, args, options, build() }`, where `build()` is the current runtime's `htmx-ui build`. Built-in names and duplicates are refused when the config resolves.
- **Plugin code runs on Node too** (the config is loaded by Vite there): `node:` APIs only, no `Bun.*`, no `HTMLRewriter`. Use `editHtml()` (`core/html.ts`, exported) to read or edit pages; it is byte-preserving for untouched tags and matches HTMLRewriter's raw-text/attribute semantics. `contentType(file)` gives a Response type.
- **Package layout** (`packages/plugin-<name>/`, package `htmx-ui-plugin-<name>`): `src/index.ts` (default export: a factory returning the plugin), `src/client.ts` (browser module, `./client` export), `src/styles.css` (`@source "./"` plus `@layer components` rules), `src/templates/<name>/macros.html` (templates in a directory named after the plugin; `TEMPLATES = new URL("../src/templates", import.meta.url)` works from `src/` and `lib/`). Peer-depend on `htmx-ui` and `htmx-ui-engine` with `workspace:^` (bun rewrites it on pack). `scripts/build-plugin.ts` compiles `lib/` (`build:lib`).
- **Cross-plugin:** find another plugin by name in `config.plugins` and use its `api`, lazily, treating it as optional: the docs plugin reads `versions`' `api.manifest()` for sitemap version fields; search reads the versions switcher's `data-version` on the page.
- **Adding an official plugin:** the package above, `PLUGINS` in `scripts/paths.ts` (version:set, release check packs and the plugin smoke test), a publish step in `.github/workflows/release.yml`, a `tsconfig.json` `paths` entry for its `/client` (browser builds don't use the `bun` condition), and a docs page under `site/pages/docs/plugins/` plus `site/data/docs-nav.json`.

### Starting a New Working Version (after a release)
1. `bun run docs:archive` — freezes the released docs (e.g. `v0.1`) and opens `next`.
2. Work in `site/pages/docs` as usual; `/docs/versions.json` shows `next` as *In development*.
3. At release time: `bun run version:set <x.y.z>`, then the steps in §5 *Releasing a Version*, then `bun run docs:archive` again to start the following version.

---

## 5. Development Recipes & Code Conventions

### Creating a New Page
1. Create `site/pages/<name>.html` extending a layout:
   ```html
   {% extends "layouts/site.html" %}

   {% block title %}My Page · HTMX UI{% endblock %}

   {% block content %}
     <h1 class="h1">My Page</h1>
   {% endblock %}
   ```
   For a docs page, extend `layouts/docs.html`, set `title`/`description`, and add the page to `site/data/docs-nav.json` (that drives the sidebar, prev/next, and page order in `llms.txt`/`sitemap.json`).
2. Restart `bun run dev` if running in development mode.
3. Verify by navigating to `/<name>` or building with `bun run build`.

### Adding a New UI Component
Run `bun run component:new <name>` (add `--behaviour` for a TypeScript behaviour, `--category <id>` for its group on the components page). It does steps 1–5 below with stubs; then fill in the TODOs. By hand:

1. Create `packages/ui/src/components/<name>/<name>.css`:
   ```css
   @layer components {
     .<name> {
       @apply ...;
     }
   }
   ```
2. Import it in `packages/ui/src/styles.css` (keep the list sorted):
   ```css
   @import "./components/<name>/<name>.css";
   ```
3. If behavioral JavaScript is required, create `packages/ui/src/components/<name>/<name>.ts` (and `<name>.test.ts` next to it):
   ```typescript
   import { queryAll } from "../../utils/dom";

   export function initName(root: ParentNode = document) {
     queryAll(root, "[data-name]:not([data-init])").forEach((el) => {
       el.dataset.init = "";
       // attach events or logic
     });
   }
   ```
4. Register `initName` in `packages/ui/src/components/index.ts`: `import { initName } from "./<name>/<name>";` and call it in `initComponents(root)`.
5. Document it: create `site/pages/docs/components/<name>.html` (extend `layouts/docs.html`; use `demo()` and `classes()` from `docs/macros.html`, the docs plugin's) and add an entry with `component: true` and a `category` (an id from `site/data/component-categories.json`: forms, actions, navigation, overlays, feedback, layout, data, content, chat) to `site/data/docs-nav.json`. Components are listed in that file grouped by category (in the categories file's order, A–Z within one), and the sidebar, prev/next, `llms.txt` and the components index all follow it, each group under its label; `site/lib/component-categories.test.ts` fails on a missing or unknown category or an entry out of order. The scaffolder inserts in the right place.

### Releasing a Version
The six packages (`htmx-ui`, `htmx-ui-engine`, `htmx-ui-plugin-docs`, `htmx-ui-plugin-versions`, `htmx-ui-plugin-search`, `create-htmx-ui`) release together with **one version**.
1. Run `bun run version:set <x.y.z>`: it names the `next` docs version (`<major>.<minor>`, or `<major>` from 1.0), dates it today, sets `version` in every `packages/*/package.json`, and refreshes `bun.lock` — it records every workspace package's version, and `bun pm pack` reads it to rewrite `workspace:` ranges, so a stale lock packs peer ranges for the previous version (npm then fails the plugin smoke test with ERESOLVE). The plugins' `workspace:^` peer ranges follow on pack. `create-htmx-ui` writes `^<its version>` for htmx-ui and the engine into new projects, so they must match.
2. Add a `## <version> — <date>` section to `CHANGELOG.md` (covers every package).
3. Add the release to the top of `releases` in `site/data/changelog.json`, and create `site/pages/docs/changelog/<version>.html` (copy the previous one) with the Added / Changed / Fixed notes.
4. Run `bun run release:check`: typecheck, tests, the site and package builds, repo rules, one version everywhere, tarball contents, and smoke tests against the packed tarballs: htmx-ui alone in a Bun.build project (and its `lib/` imported on Node), then a site scaffolded by the packed create-htmx-ui, installed, built and typechecked with bun (Bun runtime) and with npm, pnpm and yarn (Node + Vite) where they are on PATH, and the same site with the three packed plugins: built, a docs version named and archived with their commands. npm is required.
5. Commit, then `git tag v<version> && git push --tags`. `.github/workflows/release.yml` checks the tag matches the packages, reruns the release check and runs `bun publish` in `packages/ui`, `packages/engine`, the three `packages/plugin-*`, `packages/create-htmx-ui`, in that order (needs the `NPM_TOKEN` secret).
6. When work starts on the next version's docs, freeze the released ones first: `bun run docs:archive`, then commit `site/archive/` and `site/data/versions.json`.

### Adding an API Fragment Route
1. Open `site/server/api.ts` (it is spread into `routes` in `site/htmx-ui.config.ts`).
2. Add an endpoint to `apiRoutes`:
   ```typescript
   export const apiRoutes = {
     // ...
     "/api/my-fragment": () => html(`<div class="p-4 bg-blue-50">New fragment</div>`),
   };
   ```
3. In your HTML page, trigger the endpoint using htmx:
   ```html
   <button class="btn btn-primary" hx-get="/api/my-fragment" hx-target="#target">
     Fetch Fragment
     <span class="htmx-indicator">...</span>
   </button>
   <div id="target"></div>
   ```

### Documenting a Server Adapter
1. Document the framework in `site/pages/docs/servers/<framework>.html` with the same sections as the others (install via `cli()`, Mount it, Fragments and pages, Options → link to `/docs/servers/api#options`, Testing, Build and run). The framework-free pages are `servers.html` (overview: pick a server, request order, the 404 page, dev vs production), `servers/rendering.html`, `servers/deploying.html` and `servers/api.html` (the one options table); framework pages link to them instead of repeating them.
2. Add it to the `Servers` group in `site/data/docs-nav.json` and to the overview's table and `code_tabs` (`sync="server"`, so every framework tab on the site switches together). The layout marks only the **longest** matching entry active, so the overview and its pages can coexist.
3. Run every snippet against the real framework before documenting it (a scratch test with the adapter is enough).

---

## 6. Verification & Quality Commands

When making changes, agents must verify code integrity using the following commands:

| Command | Purpose | When to Run |
| :--- | :--- | :--- |
| `bun run typecheck` | Validates TypeScript types (`tsc --noEmit`) | After modifying any `.ts` or configuration file |
| `bun run build` | Builds production bundle into `dist/` | After modifying pages, CSS, components, or build script |
| `bun test` | Runs unit/integration tests with Bun test runner | After adding or updating tests |
| `bun run dev` | Runs local dev server at `http://localhost:3000` | During manual verification / interactive testing |
| `bun run preview` | Serves compiled `dist/` with clean URLs (`htmx-ui preview`) | Verifying production artifact behavior |
| `bun run build:lib` | Compiles `packages/ui/lib`, `packages/engine/lib` and the plugins' `lib/` (the engine's Node CLI and Node users' plugins run from `lib/`) | After changing package exports or the engine's Node side |
| `bun run release:check` | Everything that must pass before publishing (see Releasing) | Before tagging a release; after changing the engine or the scaffolder |
| `bun run docs:archive` | Freezes the current docs as an archived version and starts a new `next` (`htmx-ui versions:archive` in `site/`) | After a release, before writing the next version's docs |
| `bun run version:set <x.y.z>` | Names the `next` docs version, dates it and sets every package version | At release time (step 1 of Releasing) |

### Testing Guidelines
- Use the built-in test runner: `bun test`.
- A DOM is available in tests — `scripts/dom-setup.ts` registers happy-dom via `bunfig.toml`'s `[test] preload`. So `document`, `matchMedia`, and `localStorage` work directly.
- Test files must follow Bun naming conventions: `*.test.ts`, `*_test_.ts`, `*.spec.ts`, or `*_spec_.ts`.
- Run single test file: `bun test path/to/file.test.ts`.
- Run filtered tests: `bun test -t "pattern"`.
- Test assertions must use `import { test, expect, describe } from "bun:test"`.

### Pre-PR / Completion Verification Checklist
Before declaring any task or code change complete:
1. Run `bun run typecheck` and ensure 0 errors.
2. Run `bun run build` and ensure clean bundling with no missing assets or compilation errors.
3. If test files exist, run `bun test` and ensure all suites pass.
4. Verify all new components use `:not([data-init])` and set `dataset.init`.
5. Verify no Nunjucks syntax (`{%`, `{{`, `{#`) leaks into `dist/**/*.html` (`find dist -name '*.html' | xargs grep -lE '\{[%{#]'` prints nothing).
6. For docs changes, check the page's Markdown (`/docs/<page>.md` in dev) reads as a complete spec.
7. Verify nothing in `packages/ui/src/` imports the site, the scripts or the engine (the release check enforces it). It is the published component library.
8. Engine and plugin changes: keep `packages/engine/src/core/` and every plugin's config side (`packages/plugin-*/src/index.ts` and what it imports) free of `Bun.*` and `HTMLRewriter` (they run on Node too), run `bun run build:lib`, and exercise both runtimes. `bun run release:check` builds a scaffolded site, with and without the plugins, on each.
