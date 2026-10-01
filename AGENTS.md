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
├── src/
│   ├── app.ts                  # Shared client entrypoint (loads htmx, CSS, initializes modules)
│   ├── components/             # Reusable UI component library (styles + idempotent JS behaviors)
│   │   ├── index.ts            # Component coordinator: exports initComponents(root)
│   │   ├── dismissible.ts      # Component behavior script (e.g., [data-dismissible])
│   │   ├── button.css          # Component styling (@layer components with @apply)
│   │   └── card.css            # Component styling (@layer components with @apply)
│   ├── features/               # Page/app feature modules (executed once on DOMContentLoaded)
│   │   └── theme.ts            # Feature implementations (e.g., dynamic copyright year)
│   ├── pages/                  # Hand-crafted HTML pages defining routes
│   │   ├── index.html          # Route: /
│   │   └── about.html          # Route: /about
│   ├── server/                 # Local dev server & mock API fragments
│   │   ├── dev.ts              # Bun.serve() dev server with HMR, static HTML routes, & API routing
│   │   └── api.ts              # Mock fragment endpoints returning HTML for hx-get/hx-post
│   └── styles/
│       └── app.css             # Root Tailwind stylesheet; imports component CSS & sets indicators
├── build.ts                    # Production build script (globs src/pages/**/*.html -> dist/)
├── bunfig.toml                 # Bun dev server configuration (bun-plugin-tailwind)
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
- **Shared Script Injection:** Every page must include the client entrypoint script tag in its `<head>`:
  ```html
  <script type="module" src="../app.ts"></script>
  ```
  *(Adjust the relative path according to folder depth, e.g., `../../app.ts` for nested subdirectories).*
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
- Located in `src/features/<feature>.ts`.
- Intended for global, single-run behaviors (theme toggles, global analytics, copyright year injection).
- Invoked only once inside the `DOMContentLoaded` listener in `src/app.ts`. Do not hook features into `htmx:after:swap` unless they explicitly manage swapped DOM nodes.

### 4.4. Tailwind CSS v4 Configuration
Tailwind is configured in two locations:
1. **Development Server:** `bunfig.toml` via `[serve.static] plugins = ["bun-plugin-tailwind"]`.
2. **Production Build:** `build.ts` via `Bun.build({ plugins: [tailwind], ... })`.
3. **Content Discovery:** Handled by `@source "../";` inside `src/styles/app.css` to scan HTML and TS files.

### 4.5. Mock Backend & Dev Endpoints (`src/server/api.ts`)
- Mock routes return HTML fragments using `new Response(htmlString, { headers: { "Content-Type": "text/html; charset=utf-8" } })`.
- Handlers in `apiRoutes` are only registered in `src/server/dev.ts`.
- **Static Output Warning:** The production build (`dist/`) is purely static. The mock endpoints in `api.ts` are not compiled into `dist/` and will not be available under `bun run preview`.

---

## 5. Development Recipes & Code Conventions

### Creating a New Page
1. Create `src/pages/<name>.html`.
2. Ensure the `<head>` contains `<script type="module" src="<relative-path>/app.ts"></script>`.
3. Restart `bun run dev` if running in development mode.
4. Verify by navigating to `/<name>` or building with `bun run build`.

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
5. Ensure relative paths to `app.ts` in newly created pages match directory nesting.
