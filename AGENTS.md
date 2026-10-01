# AGENTS.md

This document serves as the single source of truth for AI agents and human contributors working in this repository. It details project architecture, coding standards, component lifecycles, and verification commands.

---

## 1. Project Overview & Tech Stack

This project is a high-performance, multi-page static and server-driven web application built with:
- **Runtime & Toolchain:** [Bun](https://bun.sh) (strictly used for execution, bundling, serving, testing, and package management)
- **Frontend Interaction:** [htmx 4.x](https://htmx.org) (`htmx.org`) for server-driven UI updates and fragment swapping
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) via `bun-plugin-tailwind`
- **Language:** TypeScript 5+ (in strict mode with `verbatimModuleSyntax`, `moduleResolution: "bundler"`, and `noEmit: true`)
- **Templating:** Pure, semantic HTML5 (plain `.html` files). **No React, JSX, Vue, or Svelte.**

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

```
.
├── .agents/                    # Custom agent personas and configurations (e.g. qa-engineer)
├── bun/                        # Bun-specific tooling
│   ├── compose.ts              # Pure HTML composition engine (layouts, slots, includes)
│   ├── compose.test.ts         # Unit tests for the composition engine
│   ├── dom-setup.ts            # Registers a happy-dom DOM for `bun test`
│   └── html-plugin.ts          # BunPlugin: composes .html via onLoad(loader: "html")
├── src/
│   ├── app.ts                  # Shared client entrypoint (loads htmx, CSS, initializes modules)
│   ├── components/             # Reusable UI component library (styles + idempotent JS behaviors)
│   │   ├── index.ts            # Component coordinator: exports initComponents(root)
│   │   ├── dismissible.ts      # Component behavior script (e.g., [data-dismissible])
│   │   ├── button.css          # Component styling (@layer components with @apply)
│   │   └── card.css            # Component styling (@layer components with @apply)
│   ├── features/               # Page/app feature modules (executed once on DOMContentLoaded)
│   │   ├── theme.ts            # Light/dark theme (.dark class on <html>, persisted)
│   │   ├── year.ts             # Fills [data-year] with the current year
│   │   └── features.test.ts    # Tests for the feature modules
│   ├── layouts/                # Document shells (own <html>/<head>/<body>, declare <slot>s)
│   │   └── base.html           # Default layout: head, nav, main frame, footer
│   ├── partials/               # Reusable markup fragments inlined by <include>
│   │   ├── nav.html
│   │   └── footer.html
│   ├── pages/                  # HTML page *fragments* defining routes
│   │   ├── index.html          # Route: /
│   │   └── about.html          # Route: /about
│   ├── server/                 # Local dev server & mock API fragments
│   │   ├── dev.ts              # Bun.serve() dev server with HMR, static HTML routes, & API routing
│   │   └── api.ts              # Mock fragment endpoints returning HTML for hx-get/hx-post
│   └── styles/
│       └── app.css             # Root Tailwind stylesheet; imports component CSS & sets indicators
├── build.ts                    # Production build script (globs src/pages/**/*.html -> dist/)
├── bunfig.toml                 # Bun dev server plugins (html-compose, then bun-plugin-tailwind)
├── bun.lock                    # Bun dependency lockfile
├── package.json                # Project metadata, scripts, and dependency declarations
├── tsconfig.json               # TypeScript compiler configuration
└── README.md                   # Project documentation
```

---

## 4. Architectural Contracts

### 4.1. File-Based HTML Page Routing
- **Location:** `src/pages/**/*.html`.
- **Route Resolution:**
  - `src/pages/index.html` $\rightarrow$ `/`
  - `src/pages/about.html` $\rightarrow$ `/about`
  - `src/pages/nested/index.html` $\rightarrow$ `/nested`
  - `src/pages/nested/page.html` $\rightarrow$ `/nested/page`
- **Layouts & Partials:** Pages are *fragments*, not full documents. They declare a layout and the layout owns `<html>`/`<head>`/`<body>` plus the nav, main frame and footer. See §4.6.
- **Dev Server Startup Glob:** `src/server/dev.ts` globs pages on startup. **Creating a new `.html` page requires restarting `bun run dev`** to register the route.
- **Production Build:** `build.ts` scans `src/pages/**/*.html` as entrypoints using `root: "./src/pages"` to compile static assets directly into `dist/`.

### 4.2. Component Architecture & Lifecycle
Components are partitioned into CSS classes and optional TypeScript behaviors.

1. **Styles (`src/components/<name>.css`):**
   - Write styles under `@layer components`.
   - Use Tailwind `@apply` directives for utilities.
   - Must be `@import`ed in `src/styles/app.css`.
2. **Behavior (`src/components/<name>.ts`):**
   - Export an initialization function accepting an optional `root: ParentNode = document`.
   - **Idempotency Rule:** To prevent duplicate event listeners on htmx swaps, selectors must query `[data-<component>]:not([data-init])` and immediately stamp matched elements with `el.dataset.init = ""` (or `"true"`).
3. **Registration:**
   - Call the component's initializer within `initComponents(root)` in `src/components/index.ts`.
4. **Lifecycle Hooks in `src/app.ts`:**
   - Runs on initial load: `DOMContentLoaded` triggers `initComponents(document)`.
   - Runs on htmx swaps: `document.addEventListener("htmx:after:swap", (e) => initComponents(e.target ?? document))` ensures freshly injected fragments are wired up.
   - *Note:* HTMX 4 uses colon-delimited event names (`htmx:after:swap`, NOT HTMX 1/2's `htmx:afterSwap`).

### 4.3. Features Contract (`src/features/`)
- Located in `src/features/<feature>.ts`. **The filename must match what the module does.**
  - `theme.ts` — light/dark theme. Applies `.dark` on `<html>`; persists the choice in `localStorage`; follows `prefers-color-scheme` until the user picks.
  - `year.ts` — fills `[data-year]` elements with the current year.
- Intended for global, single-run behaviors (theme toggles, global analytics, copyright year injection).
- Invoked only once inside the `DOMContentLoaded` listener in `src/app.ts`. Do not hook features into `htmx:after:swap` unless they explicitly manage swapped DOM nodes.
- **Do not capture browser globals at module scope** (e.g. `const mq = matchMedia(...)`) — call them inside the function so tests can stub them.
- Dark mode uses a **class-based** `dark:` variant, declared in `src/styles/app.css` via `@custom-variant dark (&:where(.dark, .dark *))`. To avoid a flash of the wrong theme, `src/layouts/base.html` carries a tiny inline `<script>` in `<head>` that sets the class before first paint. Keep that script in sync with `theme.ts`.

### 4.4. Tailwind CSS v4 Configuration
Tailwind is configured in two locations:
1. **Development Server:** `bunfig.toml` via `[serve.static] plugins = ["./bun/html-plugin.ts", "bun-plugin-tailwind"]`.
2. **Production Build:** `build.ts` via `Bun.build({ plugins: [htmlCompose, tailwind], ... })`.
3. **Content Discovery:** Handled by `@source "../";` inside `src/styles/app.css` to scan HTML and TS files. Because `htmlCompose` runs first, Tailwind sees classes coming from layouts and partials too.

### 4.5. Mock Backend & Dev Endpoints (`src/server/api.ts`)
- Mock routes return HTML fragments using `new Response(htmlString, { headers: { "Content-Type": "text/html; charset=utf-8" } })`.
- Handlers in `apiRoutes` are only registered in `src/server/dev.ts`.
- **Static Output Warning:** The production build (`dist/`) is purely static. The mock endpoints in `api.ts` are not compiled into `dist/` and will not be available under `bun run preview`.

### 4.6. Template Composition (`bun/`)
`bun/` holds all Bun-specific tooling. Pages are fragments; a Bun plugin stitches them into full documents before Bun's HTML bundler runs.

- **`bun/compose.ts`** — pure composition engine. Exports `compose(path, toDir?)`.
- **`bun/html-plugin.ts`** — `BunPlugin` that runs `compose()` in an `onLoad` hook with `loader: "html"`.
- **`src/layouts/*.html`** — document shells. Declare `<slot>`s, `<include>` partials.
- **`src/partials/*.html`** — reusable fragments (nav, footer, ...).

**Directives** (all resolved at build time, stripped from output):

| Directive | Purpose |
| :--- | :--- |
| `<layout src="../layouts/base.html">…</layout>` | Wraps a fragment in a layout. Nests innermost-first. |
| `<template slot="title">…</template>` | Fills a named slot from inside a `<layout>`. |
| `<include src="../partials/nav.html" />` | Inlines a partial. Recursive. |
| `<include src="x.html"><template slot="k">…</template></include>` | Fills the partial's own slots. |
| `<slot name="x">fallback</slot>` | Layout insertion point. Uses `fallback` when unfilled. |
| `<slot name="x" required />` | Errors at build time if no page supplies it. |

**Rules:**
- Slots are **optional** unless marked `required`. Unfilled optional slots render empty.
- Relative URLs (`src`, `href`, `action`, …) inside a layout or partial are **auto-rebased** to the including page's depth. Absolute URLs (`/`, `http:`, `data:`, `#`) are left alone.
- `<include>`/`<layout>` `src` values are build-time directives and are never rebased.
- Circular `<layout>`/`<include>` and unknown slots throw with a source path.
- **Load order matters:** `htmlCompose` must precede `bun-plugin-tailwind` in `bunfig.toml` and `build.ts` so Tailwind scans composed markup.

---

## 5. Development Recipes & Code Conventions

### Creating a New Page
1. Create `src/pages/<name>.html` as a fragment wrapped in a layout:
   ```html
   <layout src="../layouts/base.html">
     <template slot="title">My Page · HTMX UI</template>

     <h1 class="text-2xl font-bold">My Page</h1>
   </layout>
   ```
2. Restart `bun run dev` if running in development mode.
3. Verify by navigating to `/<name>` or building with `bun run build`.

### Adding a New UI Component
1. Create `src/components/<name>.css`:
   ```css
   @layer components {
     .<name> {
       @apply ...;
     }
   }
   ```
2. Import the CSS file in `src/styles/app.css`:
   ```css
   @import "../components/<name>.css";
   ```
3. If behavioral JavaScript is required, create `src/components/<name>.ts`:
   ```typescript
   export function initName(root: ParentNode = document) {
     root.querySelectorAll<HTMLElement>("[data-name]:not([data-init])").forEach((el) => {
       el.dataset.init = "";
       // attach events or logic
     });
   }
   ```
4. Register `initName` in `src/components/index.ts` within `initComponents(root)`.

### Adding a Dev API Fragment Route
1. Open `src/server/api.ts`.
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
5. Verify no `<layout>`, `<include>`, `<slot>` or `<template slot=…>` directives leak into `dist/**/*.html`.
