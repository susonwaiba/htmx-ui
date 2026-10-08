<div align="center">

# htmx-ui

**Tailwind CSS v4 components for [htmx](https://htmx.org) apps — plus the engine that builds sites with them.**

No React, no JSX, no client framework. Plain HTML, themeable with CSS variables, dark mode built in.

[![npm](https://img.shields.io/npm/v/htmx-ui?label=htmx--ui)](https://www.npmjs.com/package/htmx-ui)
[![license](https://img.shields.io/badge/license-MIT-blue)](#license)

[Components](packages/ui/README.md) · [Docs](site/pages/docs/installation.html) · [Releases](CHANGELOG.md)

</div>

---

## Start a site

Scaffold a project, install it, start the dev server at <http://localhost:3000>.

<details open>
<summary><b>bun</b></summary>

```bash
bun create htmx-ui my-site
cd my-site
bun install
bun run dev
```

</details>

<details>
<summary><b>npm</b></summary>

```bash
npm create htmx-ui@latest my-site
cd my-site
npm install
npm run dev
```

</details>

<details>
<summary><b>pnpm</b></summary>

```bash
pnpm create htmx-ui my-site
cd my-site
pnpm install
pnpm run dev
```

</details>

<details>
<summary><b>yarn</b></summary>

```bash
yarn create htmx-ui my-site
cd my-site
yarn install
yarn run dev
```

</details>

You get `pages/` (one file per route), a layout plus a header with a theme toggle, Tailwind wired to the
library, an htmx button talking to a mock endpoint, and `dev` / `build` / `preview` scripts. Bun-created sites
run on [Bun](https://bun.sh); the others run on Node with Vite.

```html
<!-- pages/index.html — pages/blog/post.html becomes /blog/post -->
{% extends "layouts/base.html" %}

{% block content %}
  <button class="btn btn-primary" hx-get="/api/hello" hx-target="#reply">Say hello</button>
  <div id="reply"></div>
{% endblock %}
```

`/api/hello` is a mock route in `htmx-ui.config.ts`, so the button returns a real HTML fragment in dev —
swap it for your own endpoints.

## Just the components

Already have Tailwind v4, htmx and a bundler? Add the library and two imports.

```bash
bun add htmx-ui htmx.org        # or: npm install htmx-ui htmx.org
```

```css
/* styles.css */
@import "tailwindcss";
@import "htmx-ui/styles.css";

@source "./";
```

```ts
// app.ts
import "htmx.org";
import "./styles.css";
import { initComponents } from "htmx-ui";
import { initTheme } from "htmx-ui/theme";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initComponents(document);
});

// htmx 4 fires htmx:after:process on each newly inserted element
document.addEventListener("htmx:after:process", (e) => {
  initComponents((e.target as ParentNode) ?? document);
});
```

```html
<button class="btn btn-primary" hx-post="/save" hx-target="#result">Save</button>
<div class="alert alert-success" role="status">
  <div class="alert-title">Saved</div>
</div>
```

Behaviours are idempotent: components stamp themselves on init, so swapping the same fragment in twice never
attaches a listener twice. Add the engine later with `bun add -d htmx-ui-engine tailwindcss` — see
[the install docs](site/pages/docs/installation.html).

## Theming

Override the tokens; every component follows.

```css
:root      { --primary: oklch(0.6 0.2 30); --radius: 0.75rem; }
:root.dark { --primary: oklch(0.7 0.17 30); }
```

## Packages

All of them release together, one version.

| Package | |
| :--- | :--- |
| [`htmx-ui`](https://www.npmjs.com/package/htmx-ui) ([source](packages/ui)) | The component library: CSS classes, design tokens, dark mode, and small behaviours that work inside htmx swaps |
| [`htmx-ui-engine`](https://www.npmjs.com/package/htmx-ui-engine) ([source](packages/engine)) | `htmx-ui dev` / `build` / `preview`: Nunjucks pages, file-based routing, Tailwind, HMR, mock htmx endpoints. Runs on Bun or Node (Vite) |
| [`htmx-ui-plugin-docs`](https://www.npmjs.com/package/htmx-ui-plugin-docs) ([source](packages/plugin-docs)) | Optional engine plugin: heading anchors, Markdown for every docs page, llms.txt, sitemaps, docs navigation |
| [`htmx-ui-plugin-versions`](https://www.npmjs.com/package/htmx-ui-plugin-versions) ([source](packages/plugin-versions)) | Optional engine plugin: older releases' docs as frozen builds, a version switcher, `versions:name` / `versions:archive` |
| [`htmx-ui-plugin-search`](https://www.npmjs.com/package/htmx-ui-plugin-search) ([source](packages/plugin-search)) | Optional engine plugin: a Ctrl/⌘K command palette over every page and section |
| [`create-htmx-ui`](https://www.npmjs.com/package/create-htmx-ui) ([source](packages/create-htmx-ui)) | The scaffolder behind `create htmx-ui` |
| [`htmx-ui-upgrade`](https://www.npmjs.com/package/htmx-ui-upgrade) ([source](packages/upgrade)) | `npx htmx-ui-upgrade@latest`: moves a project's code to a newer htmx-ui (renames, markup changes), and lists what to finish by hand |

Plugins are listed in `htmx-ui.config.ts` (`plugins: [docs(), search()]`); a site that doesn't need one doesn't
install it. The docs site (`/docs/plugins`) covers using them and writing your own.

## Components

`accordion` · `alert` · `attachment` · `avatar` · `badge` · `breadcrumb` · `button` · `button-group` · `card` ·
`carousel` · `checkbox` · `code` · `collapsible` · `combobox` · `command` · `dialog` · `dismissible` ·
`drawer` · `dropdown` · `empty` · `field` · `hover-card` · `icon` · `input` · `input-group` · `input-otp` ·
`item` · `kbd` · `label` · `menubar` · `message` · `navigation-menu` · `pagination` · `popover` · `progress` ·
`radio-group` · `select` · `separator` · `sheet` · `sidebar` · `skeleton` · `slider` · `spinner` · `switch` ·
`table` · `tabs` · `text` · `textarea` · `toast` · `toggle` · `toggle-group` · `tooltip`

Each one is a directory in [`packages/ui/src/components`](packages/ui/src/components): a `.css` file, an
optional `.ts` behaviour and a Nunjucks macro. Documented with live examples on the docs site — and every page
is published as Markdown for agents (`/docs/<page>.md`, `/llms.txt`).

## Development

A [Bun](https://bun.sh) workspace: the packages in `packages/`, the docs site in `site/` (built with the
engine, like any user site), and repo scripts in `scripts/`.

```bash
bun install
bun run dev            # docs site with hot reload at http://localhost:3000
bun test
bun run typecheck
bun run build
bun run release:check  # everything that must pass before publishing
```

Architecture and conventions live in [AGENTS.md](AGENTS.md).

## License

[MIT](LICENSE)
