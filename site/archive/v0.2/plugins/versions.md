---
title: "Versions plugin"
description: "htmx-ui-plugin-versions: keep every release's docs online as a frozen build, with a version switcher, an old-version banner and commands to name and archive versions."
url: "/docs/v0.2/plugins/versions"
section: "Plugins"
---

# Versions plugin

htmx-ui-plugin-versions: keep every release's docs online as a frozen build, with a version switcher, an old-version banner and commands to name and archive versions.

`htmx-ui-plugin-versions` keeps the docs of every release online. The version being written renders live at `/docs`, as usual. Each older one is a **frozen build** in `archive/v<id>/`, served at `/docs/v<id>/`: its pages, scripts and styles exactly as they were released, so later changes to components or layouts can never break them. This website's [versions](/docs/versions) work this way.

## Install

```bash bun
bun add htmx-ui-plugin-versions
```

```bash npm
npm install htmx-ui-plugin-versions
```

```bash pnpm
pnpm add htmx-ui-plugin-versions
```

```bash yarn
yarn add htmx-ui-plugin-versions
```

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import versions from "htmx-ui-plugin-versions";

export default defineConfig({
  plugins: [docs(), versions()],
});
```

List the versions. The one being written has no number yet; it is `next` until it is released:

```json data/versions.json
{
  "latest": "next",
  "versions": [{ "id": "next", "label": "next" }]
}
```

```css styles.css
@import "tailwindcss";
@import "htmx-ui/styles.css";
@import "htmx-ui-plugin-versions/styles.css";
```

```ts app.ts
import { initVersions } from "htmx-ui-plugin-versions/client";

document.addEventListener("DOMContentLoaded", () => initVersions());
```

It works without the docs plugin, but with it each archived version also keeps its Markdown and its own sitemap, the sitemaps list every version, and [search](/docs/v0.2/plugins/search) follows the version being read.

## The switcher and the banner

```jinja layouts/docs.html
{% from "versions/macros.html" import version_switcher, version_banner %}

<aside>
  {{ version_switcher(class="mb-6 w-full", links=[{ title: "Changelog", href: "/docs/changelog" }]) }}
</aside>
<article>
  {{ version_banner() }}
  <h1>{{ title }}</h1>
</article>
```

| Template | Description |
| --- | --- |
| `version_switcher(class, links)` | A Dropdown listing every version. links are extra entries under a separator: [{ title, href }]. At runtime the client points each version at the same page when it exists there, and adds versions released after the page was built. |
| `version_banner()` | Where an archived page's "you're viewing an old version" notice goes, linking to the same page in the latest version. Empty on the latest docs. |
| `docsVersions()` | The versions file as templates see it: latest, current, label, manifest and versions (id, label, released, path, latest). |

Archiving bakes the banner into every frozen page, so it shows without JavaScript. The client only refreshes it, so an old version learns about releases that came after it.

## Releasing a version

The plugin adds two CLI commands. Give them scripts, so they run on the runtime you build with:

```json package.json
{
  "scripts": {
    "docs:name": "htmx-ui versions:name",
    "docs:archive": "htmx-ui versions:archive"
  }
}
```

```bash bun
bun run docs:name 1.2.0
bun run docs:archive
```

```bash npm
npm run docs:name 1.2.0
npm run docs:archive
```

```bash pnpm
pnpm run docs:name 1.2.0
pnpm run docs:archive
```

```bash yarn
yarn run docs:name 1.2.0
yarn run docs:archive
```

1. **`versions:name <x.y.z>`** numbers `next` and dates it today. Docs are versioned per minor before 1.0 (`0.2.0` becomes `0.2`) and per major after (`1.2.0` becomes `1`); pass `0.2` or `1` to choose yourself. It refuses when the latest version already has a number.
2. **`versions:archive`** builds the site, freezes the latest version's built docs into `archive/v<id>/` and opens a new `next`. Links between docs pages are rewritten into the snapshot, assets move to `_assets/`, and pages get `noindex` so old versions don't compete with the latest in search results. `--skip-build` archives the `dist/` you already have.

Commit `archive/` and `data/versions.json`.

> **Never edit the archive by hand** Snapshots are built output. Fix an old version by rebuilding it from its release and archiving it again. Patch releases update the current docs in place rather than getting a version of their own.

## URLs

| URL | Description |
| --- | --- |
| `/docs/...` | The latest version, rendered from pages/docs. |
| `/docs/v<id>/...` | An archived version, from archive/v<id>/. Also /docs/v<id>.md and each page's .md with the docs plugin. |
| `/docs/versions.json` | The manifest: every version with its path, release date, sitemap and the pages it has. |

The version in development never reaches a URL: it is always served at `/docs`, and only archived versions get a `/v<id>` prefix. Links that must point across versions carry `data-version-link`, which archiving leaves alone.

## Options

| Option | Description |
| --- | --- |
| `prefix` | Route prefix of the docs, the same as the docs plugin's. Default "/docs". |
| `file` | The versions file, relative to the project root. Default "data/versions.json". |
| `archive` | Where frozen versions are kept, relative to the project root. Default "archive". |

The functions behind the commands are exported for release scripts of your own: `nameVersion`, `startNext`, `archiveDocs`, `versionId`, `readVersionsFile` and `writeVersionsFile`. This repository's `bun run version:set` uses them to name the docs version and set its package versions in one step.
