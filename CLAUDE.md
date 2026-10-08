# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

htmx-ui is a Tailwind v4 component library for htmx apps (plain HTML + CSS + small TypeScript behaviours), an engine that builds sites from Nunjucks pages, optional engine plugins (docs, versions, search), a scaffolder, and the website that documents them. It is a Bun workspace; the repo itself is built and served with Bun. There is no React/JSX — pages are hand-written Nunjucks `.html` templates.

| Directory | What it is |
| :--- | :--- |
| `packages/ui/` | **`htmx-ui`**, the component library: `src/` (`index.ts`, `styles.css`, `theme.ts`, `components/`, `icons/`) + `lib/` (compiled). Nothing site-specific goes here. |
| `packages/engine/` | **`htmx-ui-engine`**: the `htmx-ui` CLI (`dev`/`build`/`preview`), a Bun plugin and a Vite plugin. `src/core/` is runtime-agnostic; `src/bun/` is the Bun adapter (Bun.serve, Bun.build); `src/node/` the Node adapter (Vite). |
| `packages/plugin-docs/`, `plugin-versions/`, `plugin-search/` | **`htmx-ui-plugin-*`**, the official plugins: an engine plugin (`src/index.ts`, runs on Bun and Node), a browser module (`src/client.ts`, `./client`), `src/styles.css` and templates in `src/templates/<name>/`. Optional for users; the site uses all three. |
| `packages/create-htmx-ui/` | **`create-htmx-ui`**: `bun/npm/pnpm/yarn create htmx-ui` scaffolder (plain JS) and its `template/`. |
| `site/` | **The website** (marketing pages + docs), built with the engine and the three plugins (`site/htmx-ui.config.ts`): pages, layouts, partials, data, features, styles, mock API, `lib/` (paths, the resolved config for tests), archived docs. Not published. |
| `scripts/` | Repo scripts: release check, component scaffolding, version naming, plugin builds, test DOM setup. |

## Bun only

- Use `bun`/`bun run`/`bun test`/`bunx`/`bun install` — never node, ts-node, npm, yarn, pnpm, npx, jest, vitest.
- Bundling is `Bun.build` / HTML imports with `Bun.serve()` — don't add vite, webpack or esbuild. **Exception:** the engine's Node adapter (`packages/engine/src/node/`) is built on Vite, an optional peer dependency loaded from the user's project, so that npm/pnpm/yarn users can run sites on Node. Keep Vite there only; `packages/engine/src/core/` must stay free of `Bun.*` (it runs on both runtimes).
- Use Bun built-ins over packages: `Bun.serve()` (not express), built-in `WebSocket` (not ws), `Bun.file` (over `node:fs` read/write), `` Bun.$`cmd` `` (not execa), and `bun:sqlite` / `Bun.sql` / `Bun.redis` if a database is ever needed.
- Bun loads `.env` automatically — don't add dotenv.
- Bun API reference: `node_modules/bun-types/docs/**.mdx`.

## Commands

```bash
bun install
bun run dev        # the site via `htmx-ui dev` (Bun, --hot), http://localhost:3000 (PORT overrides)
bun run build      # the site via `htmx-ui build` -> dist/ (minified, code-split, linked sourcemaps)
bun run preview    # serve dist/ with clean URLs
bun run typecheck  # tsc --noEmit
bun test           # all tests (single file: bun test path/to/file.test.ts, single test: bun test -t "name")
bun run build:lib  # compile packages/ui/lib, packages/engine/lib and packages/plugin-*/lib (ESM + .d.ts; Node runs from lib/)
bun run release:check  # everything that must pass before publishing (incl. scaffold+install+build smoke tests with bun, npm, pnpm and yarn)
bun run component:new <name>  # scaffold packages/ui/src/components/<name>/ + docs page (--behaviour for TS, --category <id>)
bun run docs:archive  # freeze the latest docs as an archived version and start a new "next" (htmx-ui versions:archive)
bun run version:set <x.y.z>  # name the "next" docs version and set every package version
```

Tests live next to the code they cover (`*.test.ts` in `packages/*/`, `site/`). happy-dom provides a DOM (`bunfig.toml` `[test] preload`).

## Architecture

- **The site is an engine project.** `site/package.json` scripts run `htmx-ui dev|build|preview`; `site/htmx-ui.config.ts` lists the docs, versions and search plugins and adds the mock API and `/assets/icons/*` (dev `routes`, and a `build.done` hook); `site/lib/engine.ts` resolves that config for tests. Workspace packages resolve to source: tsconfig `paths` (read by Bun's bundler too) and the `bun` export condition, so no `build:lib` is needed for dev.
- **Routing is file-based from `pages/**/*.html`** (`site/pages` here). `index.html` -> `/`, `about.html` -> `/about`, `a/b.html` -> `/a/b`. The Bun dev server (`packages/engine/src/bun/dev-server.ts`) globs pages at startup and registers each as a `Bun.serve` HTML-import route, so new pages require restarting `dev`. The build uses the same files as `Bun.build` entrypoints with `root` = the pages directory.
- **Pages are Nunjucks templates** rendered by the engine (`packages/engine/src/core/render.ts` via the Bun or Vite plugin, before Tailwind). Template roots: the project (`site/`), then htmx-ui's `src/`. They extend `layouts/site.html` or `layouts/docs.html` and read repeated content from `site/data/*.json` with `json()` (no API server needed); the base layout loads the shared entry `site/app.ts` (htmx, Tailwind stylesheet, components, features) via `{{ asset('app.ts') }}`. In dev, editing a layout/partial/macro/data file reloads open pages. See the `nunjucks-templates` skill before writing templates.
- **Tailwind is wired by the engine**: on Bun, `htmx-ui dev` generates a bunfig (`[serve.static] plugins` = htmx-ui plugin, then `bun-plugin-tailwind`) and `htmx-ui build` passes both to `Bun.build`; on Node, `@tailwindcss/vite`. The htmx-ui plugin must run first.
- **Runtime choice** (`packages/engine/bin/htmx-ui.js`): `--bun`/`--node`, else `$HTMX_UI_RUNTIME`, else Bun when started by Bun (user agent `bun/…` *and* `npm_execpath` is bun), else Node. The Node CLI runs from the compiled `lib/`.
- **Component library** (`packages/ui/src/components/<name>/`, one directory per component; scaffold with `bun run component:new <name> [--behaviour] [--category <id>]`): each component is a `<name>.css` (classes in `@layer components` using `@apply`) plus optional `<name>.ts` behaviour. New CSS must be `@import`ed in `packages/ui/src/styles.css`; new behaviour must be registered in `initComponents` in `packages/ui/src/components/index.ts`.
- **Component init contract**: `initX(root)` scans `root` for `[data-<component>]:not([data-init])` and marks elements with `data-init` so it is idempotent. `app.ts` calls `init` on `DOMContentLoaded` and again on `htmx:after:process`, which htmx 4 fires on each newly inserted element, so components work inside server-returned fragments. Don't use `htmx:after:swap` for this: in htmx 4 it fires on the requesting element, not the new content. Because the new element is often the component itself, initialisers must use `queryAll(root, selector)` from `packages/ui/src/utils/dom.ts` (includes `root`), not `root.querySelectorAll`.
- **Site features** (`site/features/`): one module per file, called once from the `DOMContentLoaded` handler in `site/app.ts` (not re-run on swaps), like the plugins' `/client` modules (`initVersions`, `initSearch`). The theme switcher is part of the package (`packages/ui/src/theme.ts`).
- **Plugins** (`packages/engine/src/core/plugin.ts`): `plugins: [...]` in a config. `resolveConfig()` merges them into `ResolvedConfig.user` (routes, fetch, transform, globals, filters, build.done) and their `roots` after the project's, so every runtime and adapter gets them; the project's own options win. Plugins can add CLI commands (`htmx-ui versions:archive`). Plugin config code runs on Node too: `node:` APIs and `editHtml()` (`core/html.ts`) only, never `Bun.*` or `HTMLRewriter`. Each plugin's `/client` needs a tsconfig `paths` entry (browser builds don't use the `bun` condition). See AGENTS.md §4.10.
- **Agent-ready docs**: every `/docs` page is also published as Markdown at `<route>.md`, plus `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/sitemap.json` (with section text, for site search) and per-version `<version path>/sitemap.json`, all generated from the rendered pages by htmx-ui-plugin-docs (`packages/plugin-docs/`); the Ctrl/⌘K search (htmx-ui-plugin-search) fuzzy-matches these sitemaps (written to `dist/` by the plugin's `build.done`, served on request by its routes). Docs h2/h3 get ids and `#` links at render time (the docs plugin's `transform`). Set `SITE_URL` for production builds.
- **Docs conventions**: package-manager commands use the `cli()` macro (bun/npm/pnpm/yarn tabs), icons use `icon()` backed by `src/icons/*.svg`, `demo()`/`classes()` come from `docs/macros.html` (the docs plugin), and code is highlighted at build time by Shiki (`packages/engine/src/core/highlight.ts`). See AGENTS.md §4.6–4.7.
- **Versioned docs** (htmx-ui-plugin-versions): the latest docs render live at `/docs`. Older versions are frozen *built* snapshots in `site/archive/v<id>/`, served at `/docs/v<id>/`, listed in `site/data/versions.json` and published as `/docs/versions.json` for the sidebar version switcher. Old snapshots read those JSON formats with their own frozen JS, so keep them stable. Never edit an archive by hand; see AGENTS.md §4.9.
- **Mock backend** (`site/server/api.ts`): `apiRoutes` maps paths to handlers returning HTML fragments for `hx-get`/`hx-post` targets, passed to the engine as `routes`. These exist only in the dev server; the production build is static and `preview` will not serve them.
- **Releasing**: the six packages share one version; `bun run release:check` must pass; tagging `v<version>` publishes all of them (`.github/workflows/release.yml`). See AGENTS.md §5.
