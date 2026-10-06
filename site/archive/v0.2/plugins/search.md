---
title: "Search plugin"
description: "htmx-ui-plugin-search: a Ctrl/⌘K command palette that fuzzy-searches every page and section, with no server or search service."
url: "/docs/v0.2/plugins/search"
section: "Plugins"
---

# Search plugin

htmx-ui-plugin-search: a Ctrl/⌘K command palette that fuzzy-searches every page and section, with no server or search service.

`htmx-ui-plugin-search` adds a search button and a command palette. It opens with `Ctrl`/`⌘` `K` or `/`, matches pages and the sections inside them as you type, and opens the page or jumps straight to the section. There is no server and no search service: it reads one JSON index, once, the first time it opens (or as soon as the pointer reaches the button). Try it in this site's header.

## Install

The index is the `sitemap.json` the [docs plugin](/docs/v0.2/plugins/docs) publishes, so install both:

```bash bun
bun add htmx-ui-plugin-search htmx-ui-plugin-docs
```

```bash npm
npm install htmx-ui-plugin-search htmx-ui-plugin-docs
```

```bash pnpm
pnpm add htmx-ui-plugin-search htmx-ui-plugin-docs
```

```bash yarn
yarn add htmx-ui-plugin-search htmx-ui-plugin-docs
```

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";
import search from "htmx-ui-plugin-search";

export default defineConfig({
  plugins: [docs(), search()],
});
```

```css styles.css
@import "tailwindcss";
@import "htmx-ui/styles.css";
@import "htmx-ui-plugin-search/styles.css";
```

```ts app.ts
import { initSearch } from "htmx-ui-plugin-search/client";

document.addEventListener("DOMContentLoaded", () => initSearch());
```

Put the button and the palette in your header:

```jinja partials/header.html
{% from "search/macros.html" import search %}
<header>
  ...
  {{ search() }}
</header>
```

## search()

| Argument | Description |
| --- | --- |
| `src` | The index to search. Default "/sitemap.json". |
| `label` | The button's text. Default "Search docs…". |
| `placeholder` | The input's placeholder. |

It renders a wide button with the shortcut on larger screens, an icon button on small ones, and one `<dialog>`. Every element the client needs carries a `data-search-*` attribute; [override the template](/docs/v0.2/plugins#overriding) to change the markup and keep those.

## How it matches

Every page is one record and every section of a page (the text under an `h2` or `h3`) is another, so a hit can open `page#section`. Each word of the query must match somewhere in a record. A word scores by how it matches, best first: the exact word, the start of a word, anywhere in a word, its letters in order, then one typo; and by where, the title above a heading above the text. Results are grouped by page, best page first.

| Key | Description |
| --- | --- |
| `↑ ↓` | Move through the results. |
| `Enter` | Open the result. Ctrl/⌘ + Enter opens it in a new tab. |
| `Esc` | Close. So does clicking outside the palette. |

## With versioned docs

With the [versions plugin](/docs/v0.2/plugins/versions), a reader of an archived version searches that version's own sitemap, so results stay in the docs they are reading. The palette's footer says which version it is searching.

## Your own index

Any JSON in the sitemap format works, so a blog or a site without the docs plugin can generate one from its `build.done` hook and pass it as `src`:

```json /search.json
{
  "pages": [
    {
      "url": "/blog/hello",
      "title": "Hello",
      "description": "The first post.",
      "section": "Blog",
      "sections": [{ "id": "why", "title": "Why", "text": "Plain text under the heading…" }]
    }
  ]
}
```

The matcher is exported for a search UI of your own: `buildIndex(sitemap)` turns a sitemap into records, and `searchIndex(records, query, limit)` returns ranked results with a highlighted snippet.
