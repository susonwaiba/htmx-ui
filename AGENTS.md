# AGENTS.md

This document serves as the single source of truth for AI agents and human contributors working in this repository. It details project architecture, coding standards, component lifecycles, and verification commands.

---

## 1. Project Overview & Tech Stack

This project is a high-performance, multi-page static and server-driven web application built with:
- **Runtime & Toolchain:** [Bun](https://bun.sh) (strictly used for execution, bundling, serving, testing, and package management)
- **Frontend Interaction:** [htmx 4.x](https://htmx.org) (`htmx.org`) for server-driven UI updates and fragment swapping
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) via `bun-plugin-tailwind`
- **Language:** TypeScript 5+ (in strict mode with `verbatimModuleSyntax`, `moduleResolution: "bundler"`, and `noEmit: true`)
- **Templating:** Plain `.html` files rendered at build time with [Nunjucks](https://mozilla.github.io/nunjucks/) (layouts, blocks, includes). **No React, JSX, Vue, or Svelte.**
- **Long-form text:** `@tailwindcss/typography` (`.prose`), mapped onto the design tokens in `src/components/text/text.css`. Wrap content in `.prose` instead of putting a class on every element; components inside it take `not-prose`.

---

## 2. Strict Tooling Rules

Agents must adhere strictly to Bun-native primitives:

- **Package & Command Management:**
  - ALWAYS use `bun`, `bun run`, `bun test`, `bunx`, and `bun install`.
  - NEVER use `npm`, `yarn`, `pnpm`, `npx`, `node`, `ts-node`, `jest`, or `vitest`.
- **Bundler & Build Tools:**
  - Bundling and dev serving rely on `Bun.build` and HTML imports in `Bun.serve()`.
  - NEVER introduce `vite`, `webpack`, `rollup`, `esbuild`, or external bundlers.
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

Three top-level areas with one rule: **`src/` is the published package and must not depend on `site/`.**

```
.
├── src/                        # THE PACKAGE (htmx-ui) — exactly what package.json "exports"
│   ├── index.ts                # "htmx-ui": initComponents(root)
│   ├── styles.css              # "htmx-ui/styles.css": tokens, dark variant, highlighting colours, component CSS
│   ├── theme.ts                # "htmx-ui/theme": initTheme(), getTheme()
│   ├── theme.test.ts
│   ├── components/             # One directory per component (bun run component:new <name>)
│   │   ├── index.ts            # initComponents(root): registers every behaviour
│   │   ├── index.test.ts       # Registry test: every component is imported in styles.css / registered here
│   │   ├── <name>/             # e.g. dropdown/
│   │   │   ├── <name>.css      #   styles (@layer components)        dropdown.css
│   │   │   ├── <name>.ts       #   optional behaviour: init<Name>()  dropdown.ts
│   │   │   ├── <name>.test.ts  #   tests for the behaviour           dropdown.test.ts
│   │   │   ├── <name>.html     #   optional Nunjucks macro           (alert, code, icon, spinner)
│   │   │   └── *.json          #   optional data the macro reads     (code/package-managers.json)
│   │   └── …                   # accordion alert badge button button-group card code dismissible dropdown field icon input
│   │                           #   input-group popover sidebar spinner table tabs text toggle toggle-group
│   ├── utils/dom.ts            # queryAll(root, selector), which includes root itself
│   └── icons/*.svg             # Icon files; inlined by icon(), copied to dist/assets/icons/
├── site/                       # THE WEBSITE — marketing pages + docs. Not published.
│   ├── app.ts                  # Client entry: htmx, styles, initComponents, site features
│   ├── pages/                  # Routes: index.html -> /, docs/theming.html -> /docs/theming
│   ├── layouts/                # base.html (shell), site.html (marketing), docs.html (sidebar docs)
│   ├── partials/               # header, footer, version-switcher, search (Ctrl/⌘K palette)
│   ├── macros/docs.html        # Docs-only helpers: demo() preview+source, classes() reference table
│   ├── data/                   # JSON read by templates with json()
│   │   ├── site.json           # Name, description, URL (sitemap origin unless $SITE_URL)
│   │   ├── docs-nav.json       # Sidebar sections, prev/next, components index, page order for agents
│   │   ├── versions.json       # Docs versions; "latest" is rendered live, others are archived
│   │   └── changelog.json      # Releases, newest first
│   ├── features/               # Site-only behaviour, run once on load: year, markdown-copy, versions
│   ├── styles/                 # app.css (Tailwind + src/styles.css + docs.css), docs.css (site-only)
│   ├── server/                 # dev.ts (dev server), api.ts (mock htmx fragment endpoints)
│   └── archive/                # Frozen builds of older docs versions (created by docs:archive)
├── bun/                        # Build tooling
│   ├── paths.ts                # Directory constants (SRC, SITE, PAGES, ARCHIVE, ...)
│   ├── render.ts               # Nunjucks environment; template roots site/ then src/; globals
│   ├── html-plugin.ts          # BunPlugin: renders .html via onLoad(loader: "html")
│   ├── highlight.ts            # Build-time Shiki highlighting (CSS-variable theme)
│   ├── markdown.ts             # Rendered docs page -> Markdown for agents; page metadata
│   ├── site.ts                 # collectPages(), sitemap.xml/json, llms.txt, robots.txt
│   ├── versions.ts             # Versioned docs: manifest, archive lookup, snapshotting
│   ├── archive.ts              # CLI: bun run docs:archive <next>
│   ├── build-lib.ts            # bun run build:lib: src/ -> lib/ (ESM + .d.ts) for publishing
│   ├── release-check.ts        # bun run release:check (also prepublishOnly)
│   ├── routes.ts               # routeFor(file): file-based routing
│   ├── dom-setup.ts            # Registers a happy-dom DOM for `bun test`
│   └── *.test.ts
├── lib/                        # Compiled package JS + types (generated by build:lib, gitignored, published)
├── .github/workflows/          # ci.yml (checks on push/PR), release.yml (publish on v* tag)
├── build.ts                    # Docs site production build -> dist/
├── bunfig.toml                 # Dev server plugins (html-plugin, then bun-plugin-tailwind); test preload
├── package.json                # exports: lib/ (JS + types) and src/ (CSS, macros, icons); files: lib, src
├── tsconfig.json               # Editor + typecheck
├── tsconfig.lib.json           # Declarations for lib/
├── README.md                   # npm-facing: install + usage
├── CHANGELOG.md                # npm-facing release notes
└── LICENSE                     # MIT
```

---

## 4. Architectural Contracts

### 4.1. File-Based HTML Page Routing
- **Location:** `site/pages/**/*.html`.
- **Route Resolution:**
  - `site/pages/index.html` $\rightarrow$ `/`
  - `site/pages/about.html` $\rightarrow$ `/about`
  - `site/pages/nested/index.html` $\rightarrow$ `/nested`
  - `site/pages/nested/page.html` $\rightarrow$ `/nested/page`
- **Layouts & Partials:** Pages are templates, not full documents. They `{% extends %}` a layout and the layout owns `<html>`/`<head>`/`<body>` plus the nav, main frame and footer. See §4.6.
- **Dev Server Startup Glob:** `site/server/dev.ts` globs pages on startup. **Creating a new `.html` page requires restarting `bun run dev`** to register the route.
- **Production Build:** `build.ts` scans `site/pages/**/*.html` as entrypoints using `root: site/pages` to compile static assets directly into `dist/`.

### 4.2. Component Architecture & Lifecycle
Components are partitioned into CSS classes and optional TypeScript behaviors.

Each component is a directory, `src/components/<name>/`, holding every file named after it: `<name>.css`, and optionally `<name>.ts`, `<name>.test.ts`, `<name>.html` (macro) and any data its macro reads. Keep component code inside its directory; shared helpers go in `src/utils/`. Scaffold with `bun run component:new <name> [--behaviour]`.

1. **Styles (`src/components/<name>/<name>.css`):**
   - Write styles under `@layer components`.
   - Use Tailwind `@apply` directives for utilities.
   - Must be `@import`ed in `src/styles.css`.
   - Use token utilities (`bg-primary`, `text-muted-foreground`, `border-border`), never raw palette colours, so theming and dark mode work. Tokens are defined in `src/styles.css`; see `/docs/theming`.
   - **Tailwind gotcha:** Tailwind's optimiser keeps only one `color-mix()` override per rule, so two opacity-modified token colours in one rule (e.g. `@apply border-info/30 bg-info/5`) leave the second one solid. Put each in a separate rule with a distinct selector; see `alert/alert.css`.
2. **Behavior (`src/components/<name>/<name>.ts`):**
   - Export an initialization function accepting an optional `root: ParentNode = document`.
   - **Idempotency Rule:** To prevent duplicate event listeners on htmx swaps, selectors must query `[data-<component>]:not([data-init])` and immediately stamp matched elements with `el.dataset.init = ""` (or `"true"`).
3. **Registration:**
   - Call the component's initializer within `initComponents(root)` in `src/components/index.ts`.
   - `src/components/index.test.ts` fails if a component's CSS isn't imported in `src/styles.css` or its behaviour isn't registered.
4. **Lifecycle Hooks in `site/app.ts`:**
   - Runs on initial load: `DOMContentLoaded` triggers `initComponents(document)`.
   - Runs on new htmx content: `document.addEventListener("htmx:after:process", (e) => initComponents(e.target ?? document))`. htmx 4 fires `htmx:after:process` on **each newly inserted element**.
   - *Do not* use `htmx:after:swap` for this: in htmx 4 it is dispatched on the element that made the request, not on the swapped content.
   - The new element is often the component itself, so initialisers must find elements with `queryAll(root, selector)` from `src/utils/dom.ts`, which includes `root`. `root.querySelectorAll` alone misses it.
   - *Note:* HTMX 4 uses colon-delimited event names (`htmx:after:process`, NOT HTMX 1/2's `htmx:afterProcessNode`).

### 4.3. Features Contract
- Site-only behaviour lives in `site/features/<feature>.ts`. **The filename must match what the module does.**
  - `year.ts` — fills `[data-year]` elements with the current year.
  - `markdown-copy.ts` — "Copy Markdown" buttons on docs pages.
  - `versions.ts` — rebuilds the version switcher from `/docs/versions.json`; shows the "old version" banner.
  - `search.ts` + `search-index.ts` — site search: a `<dialog>` command palette (Ctrl/⌘K, `/`) over the sitemap of the docs version being read (`/sitemap.json`, or an archived version's own sitemap). `search-index.ts` is the pure fuzzy matcher (pages + sections; exact > prefix > substring > in-order letters > one typo); results link to `page#section`. The index loads on first open or on hovering the search button.
- The theme switcher is part of the package: `src/theme.ts` (`initTheme`, `getTheme`). It applies `.dark` on `<html>`, persists the choice in `localStorage`, and follows `prefers-color-scheme` until the user picks.
- Intended for global, single-run behaviors (theme toggles, global analytics, copyright year injection).
- Invoked only once inside the `DOMContentLoaded` listener in `site/app.ts`. Do not hook features into `htmx:after:process` unless they explicitly manage swapped DOM nodes.
- **Do not capture browser globals at module scope** (e.g. `const mq = matchMedia(...)`) — call them inside the function so tests can stub them.
- Dark mode uses a **class-based** `dark:` variant, declared in `src/styles.css` via `@custom-variant dark (&:where(.dark, .dark *))`. To avoid a flash of the wrong theme, `site/layouts/base.html` carries a tiny inline `<script>` in `<head>` that sets the class before first paint. Keep that script in sync with `theme.ts`.

### 4.4. Tailwind CSS v4 Configuration
Tailwind is configured in two locations:
1. **Development Server:** `bunfig.toml` via `[serve.static] plugins = ["./bun/html-plugin.ts", "bun-plugin-tailwind"]`.
2. **Production Build:** `build.ts` via `Bun.build({ plugins: [htmlNunjucks, tailwind], ... })`.
3. **Content Discovery:** `site/styles/app.css` has `@source "../";` (site) and `@source "../../src";` (package macros and behaviours). Because the Nunjucks plugin runs first, Tailwind sees classes coming from layouts and partials too.

### 4.5. Mock Backend & Dev Endpoints (`site/server/api.ts`)
- Mock routes return HTML fragments using `new Response(htmlString, { headers: { "Content-Type": "text/html; charset=utf-8" } })`.
- Handlers in `apiRoutes` are only registered in `site/server/dev.ts`.
- **Static Output Warning:** The production build (`dist/`) is purely static. The mock endpoints in `api.ts` are not compiled into `dist/` and will not be available under `bun run preview`.

### 4.6. Templates (Nunjucks, `bun/`)
`bun/` holds all Bun-specific tooling. Pages are [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) templates; a Bun plugin renders them into full documents before Bun's HTML bundler runs.

- **`bun/render.ts`** — Nunjucks environment. Exports `render(path, roots = [site/, src/])`. Registers the globals and filters below.
- **`bun/html-plugin.ts`** — `BunPlugin` that runs `render()` in an `onLoad` hook with `loader: "html"`.
- **Template roots:** `site/`, then `src/`. Names are root-relative and the first match wins: `"layouts/docs.html"` comes from `site/`, `"components/icon/icon.html"` from `src/`. `json()`, `svg()`, `glob()` and `asset()` resolve the same way.
- **`site/layouts/*.html`** — document shells. Declare `{% block %}`s, `{% include %}` partials.
- **`site/partials/*.html`** — reusable fragments (header, footer, version switcher).
- **`.agents/skills/nunjucks-templates/SKILL.md`** — how to write templates here: project settings, `asset()`, macros, gotchas. Read it before editing templates.

| Syntax | Purpose |
| :--- | :--- |
| `{% extends "layouts/base.html" %}` | Wrap the page in a layout. Must be the first tag. |
| `{% block content %}…{% endblock %}` | Fill (in a page) or declare (in a layout) a block. Layout content is the fallback; `{{ super() }}` keeps it. |
| `{% include "partials/header.html" %}` | Inline a partial. Shares the caller's context. |
| `{% macro %}` / `{% import %}` | Parameterised partials (e.g. a card taking a title). |
| `{{ asset("app.ts") }}` | A `src/`-relative path rewritten relative to the page being rendered. |
| `{{ url }}` | The page's route, e.g. `/docs/components/button`. |
| `json("data/x.json")` | Parsed JSON file. Use for any repeated content instead of an API. |
| `svg("assets/x.svg", {class: "…"})` | Inline an SVG file, setting attributes on its root. |
| `glob("icons/*.svg")` | Sorted root-relative paths. |
| `\| dedent`, `\| highlight(lang)` | De-indent; syntax-highlight at build time (Shiki). |

The functions and `url` are **globals**, so they work inside macros imported without `with context`.

`base.html` declares `title`, `head` and `body`. Pages extend `site.html` (marketing) or `docs.html` (docs), which both provide `content`. Docs pages set `title` and `description` with top-level `{% set %}` instead of blocks.

**Rules:**
- Template names are resolved from the **template roots**, not from the current file: write `"layouts/base.html"`, never `"../layouts/base.html"`.
- Bun's HTML bundler resolves `<script src>` / `<link href>` relative to the *page*, so **local asset paths in layouts and partials must use `{{ asset("…") }}`** to work for nested pages. Root-absolute links (`href="/about"`) and external URLs need nothing.
- `throwOnUndefined` is on: `{{ typo }}` fails the build rather than rendering nothing. Autoescape is on; use `| safe` only for trusted markup.
- **Any package-manager command in the docs must use `cli()`** from `components/code/code.html` (npm/pnpm/yarn/bun tabs, choice remembered). Never hard-code `bun add …` in user-facing docs. Bun-only commands (e.g. `bun --hot server.ts`) are fine in a plain `code()` block.
- **Icons:** `icon(name)` inlines `src/icons/<name>.svg`. Don't paste SVG markup into templates; add a file instead. `mode="img"` emits an `<img>` that Bun copies and hashes. Root-absolute `<img src="/assets/...">` breaks the build (Bun resolves a leading `/` as a filesystem path), so always go through `asset()`.
- Templates are not cached, so a re-render always reads current layouts/partials. Bun's dev watcher only tracks the page file itself, though: after editing a layout or partial, save the page (or restart `dev`) to see it.
- **Load order matters:** the Nunjucks plugin must precede `bun-plugin-tailwind` in `bunfig.toml` and `build.ts` so Tailwind scans rendered markup.

### 4.7. Agent & Search Outputs (`bun/site.ts`)
Every docs page (route under `/docs`) is also published as Markdown for AI agents. Nothing is hand-written: `bun/markdown.ts` converts the rendered article body (`[data-docs-content]`).

| Output | Contents |
| :--- | :--- |
| `<route>.md` (`/docs.md`, `/docs/components/button.md`) | Frontmatter + page as Markdown. Demos become their source; tables become Markdown tables. |
| `/llms.txt`, `/llms-full.txt` | llmstxt.org index; all docs Markdown in one file. |
| `/sitemap.xml` | Every page, for search engines. |
| `/sitemap.json` | Every page (latest version): title, description, section, h2/h3 outline, **section text** (`sections[]`, for site search) and Markdown URL, plus `versions[]` pointing at each version's sitemap. Basis for site search and a future MCP server. |
| `/docs/sitemap.json`, `/docs/v<id>/sitemap.json` | Per-version docs sitemaps, same format. Archived ones are written by `docs:archive`. |
| `/robots.txt` | Points at the sitemap. |

- `build.ts` writes them to `dist/`; `site/server/dev.ts` serves them on request.
- Absolute URLs come from `$SITE_URL`, falling back to `url` in `site/data/site.json`. **Set `SITE_URL` for production builds.**
- Order follows `site/data/docs-nav.json`.
- Mark purely visual blocks `data-md-skip` (left out of Markdown and search text). Write examples so the source alone is a complete spec.
- **Heading anchors:** `renderPage()` (`bun/anchors.ts`) gives every h2/h3 in `[data-docs-content]` an id (slug of its text unless set explicitly) and a `.heading-anchor` `#` link. Headings that aren't document sections are skipped: inside links (card titles in `a.card`; an anchor there would nest `<a>` in `<a>` and the browser breaks the card apart), `.not-prose` component markup, `.demo` and `[data-md-skip]`. `render.test.ts` fails if any page nests links. Explicit `id`s are kept, so set one when a heading's wording may change but its links must not. Always render site pages with `renderPage()`, not `render()`, so HTML, Markdown and sitemaps share ids.
- The `origin` template global is the public site URL (`$SITE_URL`); use it for absolute URLs in docs (e.g. the prompts on the AI agents page).

### 4.8. Versioned Docs (`bun/versions.ts`)
- The **latest** docs version is rendered live from `site/pages/docs` at `/docs/...`.
- **Older** versions are frozen *built* snapshots (HTML, Markdown, CSS/JS chunks) in `site/archive/v<id>/`, served at `/docs/v<id>/...`. Freezing the build means later component or layout changes can never break old docs.
- `site/data/versions.json` lists versions; `build.ts` publishes `/docs/versions.json` (each version's path and page list). The sidebar switcher (`site/partials/version-switcher.html` + `site/features/versions.ts`) reads it at runtime, so old snapshots also list newer versions and show a banner linking to the latest.
- **Never edit `site/archive/` by hand.** Create a snapshot with `bun run docs:archive <next>`. It builds, snapshots the current latest (rewriting `/docs` links to `/docs/v<id>`, moving assets to `_assets/`, adding `noindex`), and makes `<next>` the latest.
- Links that must point across versions (the switcher, links to `/docs/versions.json`) carry `data-version-link`, which the archiver leaves alone.
- Docs are versioned per minor before 1.0 and per major after. Patch releases update the current docs in place.

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
Run `bun run component:new <name>` (add `--behaviour` for a TypeScript behaviour). It does steps 1–5 below with stubs; then fill in the TODOs. By hand:

1. Create `src/components/<name>/<name>.css`:
   ```css
   @layer components {
     .<name> {
       @apply ...;
     }
   }
   ```
2. Import it in `src/styles.css` (keep the list sorted):
   ```css
   @import "./components/<name>/<name>.css";
   ```
3. If behavioral JavaScript is required, create `src/components/<name>/<name>.ts` (and `<name>.test.ts` next to it):
   ```typescript
   import { queryAll } from "../../utils/dom";

   export function initName(root: ParentNode = document) {
     queryAll(root, "[data-name]:not([data-init])").forEach((el) => {
       el.dataset.init = "";
       // attach events or logic
     });
   }
   ```
4. Register `initName` in `src/components/index.ts`: `import { initName } from "./<name>/<name>";` and call it in `initComponents(root)`.
5. Document it: create `site/pages/docs/components/<name>.html` (extend `layouts/docs.html`; use `demo()` and `classes()` from `macros/docs.html`) and add an entry with `component: true` to `site/data/docs-nav.json`. The sidebar, prev/next and components index pick it up from there.

### Releasing a Version
1. Bump `version` in `package.json`; set `released` for it in `site/data/versions.json`.
2. Add a `## <version> — <date>` section to `CHANGELOG.md` (what npm users see).
3. Add the release to the top of `releases` in `site/data/changelog.json`, and create `site/pages/docs/changelog/<version>.html` (copy the previous one) with the Added / Changed / Fixed notes.
4. Run `bun run release:check`: typecheck, tests, both builds, repo rules, tarball contents, and a smoke test that installs the packed tarball into a fresh project.
5. Commit, then `git tag v<version> && git push --tags`. `.github/workflows/release.yml` checks the tag matches `package.json`, reruns the release check and runs `bun publish` (needs the `NPM_TOKEN` secret).
6. When work starts on docs for the next minor (or major) version, freeze the current docs first: `bun run docs:archive <next>`, then commit `site/archive/` and `site/data/versions.json`.

### Adding a Dev API Fragment Route
1. Open `site/server/api.ts`.
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

---

## 6. Verification & Quality Commands

When making changes, agents must verify code integrity using the following commands:

| Command | Purpose | When to Run |
| :--- | :--- | :--- |
| `bun run typecheck` | Validates TypeScript types (`tsc --noEmit`) | After modifying any `.ts` or configuration file |
| `bun run build` | Builds production bundle into `dist/` | After modifying pages, CSS, components, or build script |
| `bun test` | Runs unit/integration tests with Bun test runner | After adding or updating tests |
| `bun run dev` | Runs local dev server at `http://localhost:3000` | During manual verification / interactive testing |
| `bun run preview` | Serves compiled `dist/` statically via `bunx serve` | Verifying production artifact behavior |

### Testing Guidelines
- Use the built-in test runner: `bun test`.
- A DOM is available in tests — `bun/dom-setup.ts` registers happy-dom via `bunfig.toml`'s `[test] preload`. So `document`, `matchMedia`, and `localStorage` work directly.
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
7. Verify nothing in `src/` imports from `site/` or `bun/` (`grep -rnE "(from|import|@import) +['\"](\.\./)+(site|bun)/" src` prints nothing). `src/` is the published package.
