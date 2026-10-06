---
title: "Plugins"
description: "Optional features on top of htmx-ui-engine: install a plugin, list it in your config, and its templates, routes, build output and commands join your site."
url: "/docs/v0.2/plugins"
section: "Plugins"
---

# Plugins

Optional features on top of htmx-ui-engine: install a plugin, list it in your config, and its templates, routes, build output and commands join your site.

Most sites are a handful of pages, and the engine keeps them small. Features only some sites need, such as a docs section, versioned docs or site search, are **plugins**: separate packages you install and list in `htmx-ui.config.ts`. A site that doesn't use one doesn't install it or load it, and nothing in its build changes.

A plugin can add everything a config can: templates and macros, template globals and filters, a transform over every page, request handlers, files written by the build, and CLI commands. They work the same in `htmx-ui dev`, `htmx-ui build`, on Bun and on Node, and behind every [server adapter](/docs/v0.2/servers).

## Official plugins

| Plugin | Package | Adds |
| --- | --- | --- |
| [Docs](/docs/v0.2/plugins/docs) | `htmx-ui-plugin-docs` | Heading anchors, Markdown for every docs page, llms.txt, JSON and XML sitemaps, navigation and page macros. |
| [Versions](/docs/v0.2/plugins/versions) | `htmx-ui-plugin-versions` | Older releases' docs kept online as frozen builds, a version switcher, an old-version banner, and commands to name and archive versions. |
| [Search](/docs/v0.2/plugins/search) | `htmx-ui-plugin-search` | A Ctrl/⌘K command palette that fuzzy-searches pages and sections. |

They work alone and better together: search reads the sitemap the docs plugin publishes, and with the versions plugin, readers of old docs search that version and the sitemaps describe every version. This website uses all three.

## Using a plugin

Install it, then list it under `plugins`:

```bash bun
bun add htmx-ui-plugin-docs
```

```bash npm
npm install htmx-ui-plugin-docs
```

```bash pnpm
pnpm add htmx-ui-plugin-docs
```

```bash yarn
yarn add htmx-ui-plugin-docs
```

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";

export default defineConfig({
  url: "https://example.com",
  plugins: [docs({ name: "Acme", description: "Acme's docs." })],
});
```

Each plugin is a function: call it, with options if it takes any, and the result goes in the list. Restart `htmx-ui dev` after changing the list. A plugin that has a browser side or styles says so in its docs; those are two lines you add yourself, so you decide where they go:

```ts app.ts
import { initMarkdownCopy } from "htmx-ui-plugin-docs/client";

document.addEventListener("DOMContentLoaded", () => {
  initMarkdownCopy();
});
```

```css styles.css
@import "tailwindcss";
@import "htmx-ui/styles.css";
@import "htmx-ui-plugin-docs/styles.css";
```

A plugin's stylesheet also tells Tailwind to scan the plugin's templates, so the utilities they use are generated on Node too, where Vite doesn't look inside `node_modules`.

### Only in some environments

`plugins` skips `false`, `null` and `undefined`, and flattens nested lists, so a plugin can be switched on by a condition:

```ts htmx-ui.config.ts
const preview = process.env.PREVIEW === "1";

export default defineConfig({
  plugins: [docs(), preview && search()],
});
```

## Who wins

Your own config always has the last word. Between plugins, the order of the list decides.

| Hook | Description |
| --- | --- |
| `routes` | Merged. Your route on the same pattern replaces a plugin's; a later plugin's replaces an earlier one's. |
| `globals, filters` | Merged the same way: yours win, then later plugins. |
| `fetch` | Yours runs first; then each plugin's in order, until one answers. |
| `transform` | Each plugin's in order, then yours, so yours sees their output. |
| `build.done` | Each plugin's in order, then yours. |
| `Templates` | Your project's roots first, then each plugin's, then htmx-ui's. A file of yours with the same name as a plugin's template replaces it. |
| `Commands` | A plugin can't replace dev, build or preview, and two plugins can't add the same command: the config refuses to load. |

## Overriding a plugin's templates

Plugins keep their templates in a directory named after themselves, such as `search/macros.html`, and their template root is searched after yours. To change one, copy it into your project under the same name and edit it: your copy wins, everywhere it is used.

```text my-site/
search/macros.html      your own search() replaces the plugin's
pages/  layouts/        ...
```

> **Keep the data attributes** A plugin's browser code finds its markup by `data-*` attributes (`data-search-dialog`, `data-version-switcher`, ...). Change the classes and the layout as you like; keep the attributes its docs list.

## Plugin commands

A plugin can add commands to the CLI. `htmx-ui --help` lists the ones your plugins add:

```txt htmx-ui --help
...
Plugin commands:
  versions:name <x.y.z>            name the docs version in development (versions)
  versions:archive [--skip-build]  build, freeze the latest docs version, start a new next (versions)
```

They run on the same runtime as the rest of the CLI, so add them to `package.json` scripts like any other:

```json package.json
{
  "scripts": {
    "docs:archive": "htmx-ui versions:archive"
  }
}
```

## Writing your own

A plugin is an object with a name and the hooks it needs, so a project can keep one in its own repository before it is worth publishing. See [Writing a plugin](/docs/v0.2/plugins/writing).
