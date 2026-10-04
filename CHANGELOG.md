# Changelog

All notable changes to htmx-ui, htmx-ui-engine and create-htmx-ui are listed here. The three packages are
released together with one version. Versions follow [semantic versioning](https://semver.org); before 1.0, minor
versions may contain breaking changes, each listed with migration notes.
The docs site has a fuller page per release (`/docs/changelog`).

## 0.2.0 — Unreleased

### Breaking

- **`templates` is gone from `htmx-ui.config.ts`; use `roots`.** The two options are now one, and `roots[0]` is the
  project root, which `templates` never moved. Rename the key, and put your project directory first unless it already
  is:

  ```ts
  // before
  export default defineConfig({ templates: ["."] });
  // after
  export default defineConfig({ roots: ["."] });
  ```

  A config that still says `templates` is a TypeScript error, not a silent fallback. `ResolvedConfig.templateRoots` is
  gone with it: read `ResolvedConfig.roots` (the same list, entries as `{ name?, dir }`) and map `dir` if you needed the
  bare directories.
- **`create-htmx-ui` defaults to `--pm bun`** instead of `npm`. Pass `--pm npm` (or `pnpm`, `yarn`) for the old
  behaviour. `bun create htmx-ui` already ran Bun, so this mostly changes what the scaffolder *writes* into a new
  project's `package.json` scripts and lockfile.

### Added

- **Components:** checkbox (a native checkbox styled with tokens, sizes and every field state), radio-group (native
  radios as cards or inline rows, submitting with the form), select (a listbox in a popup opened from a button,
  searchable and keyboard driven, with a no-JS fallback to the native `<select>`), and switch (an on/off setting that
  applies immediately, drawn as a sliding track on a real checkbox).
- **`roots` in `htmx-ui.config.ts`:** an ordered list of template directories, each optionally named. The first entry is
  the project root (it decides `pages`, `outDir`, `publicDir` and `asset()` URLs); the rest are extra places to look. A
  `name` is the prefix templates reach that directory by, so a directory can move without a single template changing:

  ```ts
  export default defineConfig({
    roots: [".", { name: "layouts", dir: "new-layouts-2026" }, { name: "acme", dir: "../acme-ui" }],
  });
  ```

  Names work everywhere a template name does — `extends`, `include`, `import`, `from`, `json()`, `svg()`, `glob()` and
  `asset()` — because resolution moved into a loader Nunjucks uses for every template load. See
  [Roots](https://susonwaiba.github.io/htmx-ui/docs/engine#roots).
- **Serving a site from your own backend:** `createSite()` is the framework-free core of the dev servers, and three
  adapters wrap it, none importing its framework:
  - `htmx-ui-engine/elysia` — a plugin, so `.use(htmxUi()).listen()` chains and a specific route always beats the
    catch-all. **Recommended.**
  - `htmx-ui-engine/express` and `htmx-ui-engine/hono` — `Request`/`Response` middleware; mount last.

  `site.render()` renders a full page, `site.fragment()` renders any template as an htmx fragment, and `site.handle()`
  answers a request from config `routes`, the built `dist/`, the config's `fetch`, the built 404, then returns `null`
  so your framework can answer. See [Server frameworks](https://susonwaiba.github.io/htmx-ui/docs/servers).
- **`render: true` in the config** checks at startup that the template roots and pages directory arrived, turning a
  packaging mistake into a failed boot instead of a 500 on the first request.
- **A cached runtime renderer:** `render(path, roots, { cache: true })`, with `warm()` to compile ahead of the first
  request (`createSite()` does both). A global that returns HTML can wrap its result in `markup()`.
- **`debug` in the config** (`debug: { requests: true, build: true }`) logs requests, unmatched routes, builds and
  reloads, per topic.
- **Exports:** `queryAll` and the `Theme` type from `htmx-ui`; `createSite`, `Site`, `SiteOptions`, `normalizeRoots`,
  `tryLocate`, `locate`, `TemplateRoot`, `RootSpec`, `warm`, `markup` and `logger` from `htmx-ui-engine`.
- **Docs:** [Server frameworks](https://susonwaiba.github.io/htmx-ui/docs/servers) with a page each for Elysia, Express
  and Hono, including how to deploy templates that a server renders at runtime.

### Changed

- **The dev watcher honours `.gitignore`** and skips `node_modules`, `dist`, `public` and `.git` whatever the roots say,
  so a root of `.` no longer adds a file watcher for every directory in `node_modules`. The trade-off: a new file under
  one of those directories shows up on the next refresh rather than immediately.
- **`bun run version:set <x.y.z>`** names the docs version in development, dates it, and sets all three package versions
  at once, so a release cannot leave them out of step.

### Fixed

- **`assetVer()`'s `?ver=` can no longer break a build** or be dropped by the bundler. Neither Bun nor Vite can resolve
  an asset URL with a query string, so the version is parked in a `data-ver` attribute before the bundler sees the page
  and moved onto the finished URL after it.
- **`.select` no longer restyles the new select component's trigger** as a native dropdown (the rule is scoped to
  `select.select`).
- **A field whose label sits in `.field-content`** — what a switch or a radio group produces — now marks an invalid
  field the same way a top-level label does, instead of losing the danger colour.
- **The dev server watches template roots**, not a hardcoded list, so a template that moved is still watched.

## 0.1.0 — 2026-10-02

First release.

### Added

- **Components:** accordion, alert, badge, button, button group, card, code block, dropdown, field, icon, input,
  input group, popover, sidebar, spinner, table, tabs, text, toggle, toggle group.
- **Forms:** text inputs, textareas, selects and file inputs with disabled, error (`aria-invalid` / `:user-invalid`),
  warning and success states; fields with labels, descriptions, messages and an automatic required asterisk; inline,
  responsive and grid layouts; input groups with addons on any side.
- **Loading states:** spinners from any icon or pure CSS, in buttons, badges, button groups and input groups. An
  `.htmx-indicator` inside a button, badge or input-group addon takes no space until its request starts.
- **Behaviours** (`initComponents(root)`): accordion, code copy, dismissible, dropdown, popover, sidebar, tabs, toggle,
  toggle group. They are idempotent and initialise inside htmx-swapped content (`htmx:after:process`).
- **Theming:** every colour and the corner radius are CSS variables (`--primary`, `--border`, `--radius`, …) exposed as
  Tailwind colours (`bg-primary`, `text-muted-foreground`, …).
- **Dark mode:** class-based `dark:` variant, token swaps, and a theme switcher (`htmx-ui/theme`) that follows the OS
  until the user picks.
- **Text:** `@tailwindcss/typography` (`.prose`) mapped onto the tokens, plus helpers for single elements and
  `.heading-anchor` for "#" section links.
- **Scrollbars:** every scrollbar is thin and tinted from the theme (`--scrollbar-thumb`, `--scrollbar-thumb-hover`), in
  light and dark.
- **Syntax-highlighting colours** (`--code-token-*`) for build-time highlighters using Shiki's CSS-variables theme.
- **Icons:** SVG icons in `htmx-ui/icons/*`.
- **Macros:** Nunjucks macros for alerts, code blocks, command tabs, icons and spinners in
  `htmx-ui/components/*.html`, resolved by name in htmx-ui-engine sites.
- **htmx-ui-engine:** `htmx-ui dev`, `build` and `preview` for sites made of Nunjucks pages: file-based routing,
  Tailwind, hot reload (including layouts, partials and data), mock htmx endpoints (`routes` in
  `htmx-ui.config.ts`), and static builds. Runs on Bun (Bun.serve, Bun.build, `bun-plugin-tailwind`) or Node (Vite,
  `@tailwindcss/vite`), chosen from whatever started it, or with `--bun` / `--node`. Also usable as a Bun plugin
  (`htmx-ui-engine/bun`) or a Vite plugin (`htmx-ui-engine/vite`).
- **create-htmx-ui:** `npm create htmx-ui`, `pnpm create htmx-ui`, `yarn create htmx-ui`, `bun create htmx-ui`.

### Notes

- Macro parameters may still change in a minor release before 1.0; each change will be listed here.
