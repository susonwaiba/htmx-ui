---
title: "Installation"
description: "Start a new HTMX UI site with one command, or add the components to an app that already uses Tailwind CSS v4 and htmx."
url: "/docs/v0.2/installation"
section: "Getting started"
---

# Installation

Start a new HTMX UI site with one command, or add the components to an app that already uses Tailwind CSS v4 and htmx.

Commands are shown for bun, npm, pnpm and yarn. Pick yours once; every command block on the site remembers the choice.

## Packages

| Package | What it is |
| --- | --- |
| `htmx-ui` | The components: CSS classes, design tokens, dark mode and small behaviours. Works with any bundler. |
| `htmx-ui-engine` | Builds a site from Nunjucks pages: `htmx-ui dev`, `build` and `preview`, on Bun or Node. See [Engine](/docs/v0.2/engine). |
| `create-htmx-ui` | Scaffolds a new site that uses both. |

## Requirements

| Dependency | Version | Why |
| --- | --- | --- |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Component styles use `@apply` and `@theme`. |
| [htmx](https://htmx.org) | 4.x | Fragment swaps; components initialise inside new content. |
| [Bun](https://bun.sh) or [Node](https://nodejs.org) | Bun 1.2.3+ / Node 22.12+ | For the engine. With your own bundler, any that handles TypeScript and CSS imports works. |

## New project

Create a site, install it and start the dev server:

```bash bun
bun create htmx-ui my-site
cd my-site
bun install
bun run dev
```

```bash npm
npm create htmx-ui my-site
cd my-site
npm install
npm run dev
```

```bash pnpm
pnpm create htmx-ui my-site
cd my-site
pnpm install
pnpm run dev
```

```bash yarn
yarn create htmx-ui my-site
cd my-site
yarn install
yarn run dev
```

You get `pages/` (one file per route), a layout with a theme toggle, Tailwind with the library's styles, an htmx button talking to a mock endpoint, and `dev`, `build` and `preview` scripts. A site created with bun runs on Bun; with npm, pnpm or yarn it runs on Node, with Vite. Open `http://localhost:3000` and edit `pages/index.html`.

## Add the engine to a project

### 1. Install

```bash bun
bun add htmx-ui htmx.org
bun add -d htmx-ui-engine tailwindcss
```

```bash npm
npm install htmx-ui htmx.org
npm install -D htmx-ui-engine tailwindcss
```

```bash pnpm
pnpm add htmx-ui htmx.org
pnpm add -D htmx-ui-engine tailwindcss
```

```bash yarn
yarn add htmx-ui htmx.org
yarn add -D htmx-ui-engine tailwindcss
```

Then the Tailwind integration for the runtime you'll build with. On Bun:

```bash Terminal
bun add -d bun-plugin-tailwind
```

On Node (npm, pnpm or yarn), Vite and its Tailwind plugin:

```bash bun
bun add -d vite @tailwindcss/vite
```

```bash npm
npm install -D vite @tailwindcss/vite
```

```bash pnpm
pnpm add -D vite @tailwindcss/vite
```

```bash yarn
yarn add -D vite @tailwindcss/vite
```

### 2. Add the scripts

```json package.json
{
  "scripts": {
    "dev": "htmx-ui dev",
    "build": "htmx-ui build",
    "preview": "htmx-ui preview"
  }
}
```

### 3. Import the styles

Import Tailwind first, then the library. The `@source` line tells Tailwind where your own markup lives.

```css styles.css
@import "tailwindcss";
@import "htmx-ui/styles.css";

@source "./";
```

### 4. Initialise components

```ts app.ts
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

### 5. Add a layout and a page

`asset()` makes the script path relative to whichever page is rendering, so the bundler finds it from any depth.

```jinja layouts/base.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{% block title %}My site{% endblock %}</title>
    <script type="module" src="{{ asset('app.ts') }}"></script>
  </head>
  <body class="bg-background text-foreground">
    {% block content %}{% endblock %}
  </body>
</html>
```

```jinja pages/index.html
{% extends "layouts/base.html" %}
{% block content %}<button class="btn btn-primary">It works</button>{% endblock %}
```

```bash bun
bun run dev
```

```bash npm
npm run dev
```

```bash pnpm
pnpm run dev
```

```bash yarn
yarn run dev
```

## Existing project

If the app already has Tailwind v4, htmx and a bundler, it only needs the components:

```bash bun
bun add htmx-ui
```

```bash npm
npm install htmx-ui
```

```bash pnpm
pnpm add htmx-ui
```

```bash yarn
yarn add htmx-ui
```

1. Add `@import "htmx-ui/styles.css";` directly after `@import "tailwindcss";`.
2. Call `initComponents()` on load and on `htmx:after:process`, as in step 4 above.

> **Clashing variable names** The library defines CSS variables such as `--primary`, `--border` and `--radius` on `:root`, and Tailwind colours with the same names. If your app already defines these, the definition loaded last wins. Rename yours, or set them to the values you want (see [Theming](/docs/v0.2/theming)).

### Already using the dark: variant?

The library switches Tailwind's `dark:` variant from the OS media query to a `.dark` class on `<html>`. If your app relies on the media-query behaviour, read [Dark mode](/docs/v0.2/dark-mode) before upgrading.

## What the package exports

JavaScript ships as ES modules with TypeScript types. `htmx.org` and `tailwindcss` are peer dependencies, so your app controls their versions.

| Import | Contents |
| --- | --- |
| `htmx-ui` | `initComponents(root)`: wires up every component's behaviour under `root`. |
| `htmx-ui/styles.css` | Design tokens, the dark variant, `.prose` (Tailwind Typography, installed with the package), syntax-highlighting colours and every component's styles. |
| `htmx-ui/theme` | `initTheme()` and `getTheme()` for the light/dark switcher. |
| `htmx-ui/icons/<name>.svg` | The SVG icons, for your own templates or `<img>` tags. |
| `htmx-ui/components/<name>/<name>.html` | Nunjucks macros (icon, code, alert, spinner). The engine resolves them by name: `{% from "components/icon/icon.html" import icon %}`. |
