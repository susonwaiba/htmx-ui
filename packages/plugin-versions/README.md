# htmx-ui-plugin-versions

Versioned docs for [htmx-ui-engine](https://www.npmjs.com/package/htmx-ui-engine) sites. The latest docs render live at `/docs`; every older release stays online as a frozen build at `/docs/v<id>/`, so later changes to components or layouts can never break old docs.

- a version switcher that keeps the reader on the same page in each version;
- an "old version" banner on archived pages, baked in so it needs no JavaScript;
- `/docs/versions.json`, the manifest the switcher reads, so old snapshots also list newer releases;
- two CLI commands: `htmx-ui versions:name <x.y.z>` and `htmx-ui versions:archive`.

Use it with [htmx-ui-plugin-docs](https://www.npmjs.com/package/htmx-ui-plugin-docs) and each version also keeps its Markdown and its own sitemap, which [htmx-ui-plugin-search](https://www.npmjs.com/package/htmx-ui-plugin-search) follows. Works on Bun and Node.

## Install

```bash
npm install htmx-ui-plugin-versions
```

## Use

```ts
// htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import versions from "htmx-ui-plugin-versions";

export default defineConfig({ plugins: [docs(), versions()] });
```

```json
// data/versions.json: the version being written has no number yet
{ "latest": "next", "versions": [{ "id": "next", "label": "next" }] }
```

```css
/* styles.css, after htmx-ui/styles.css */
@import "htmx-ui-plugin-versions/styles.css";
```

```ts
// app.ts
import { initVersions } from "htmx-ui-plugin-versions/client";
document.addEventListener("DOMContentLoaded", () => initVersions());
```

```html
<!-- the docs layout -->
{% from "versions/macros.html" import version_switcher, version_banner %}
{{ version_switcher(class="w-full", links=[{ title: "Changelog", href: "/docs/changelog" }]) }}
<article>
  {{ version_banner() }}
  ...
</article>
```

## Releasing

```bash
npx htmx-ui versions:name 1.2.0   # "next" becomes "1" (per minor before 1.0, per major after), dated today
npx htmx-ui versions:archive      # build, freeze it into archive/v1/, start a new "next"
```

Commit `archive/` and `data/versions.json`. Never edit the archive by hand. `--skip-build` archives the existing `dist/`.

## Options

| Option | Default | |
| --- | --- | --- |
| `prefix` | `"/docs"` | Route prefix of the docs (the same as the docs plugin's). |
| `file` | `"data/versions.json"` | The list of versions, relative to the project root. |
| `archive` | `"archive"` | Where frozen versions are kept. |

Full guide: <https://susonwaiba.github.io/htmx-ui/docs/plugins/versions>

MIT
