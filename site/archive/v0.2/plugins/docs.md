---
title: "Docs plugin"
description: "htmx-ui-plugin-docs: a docs section people and AI agents can both read. Heading anchors, Markdown for every page, llms.txt, sitemaps, navigation and page macros."
url: "/docs/v0.2/plugins/docs"
section: "Plugins"
---

# Docs plugin

htmx-ui-plugin-docs: a docs section people and AI agents can both read. Heading anchors, Markdown for every page, llms.txt, sitemaps, navigation and page macros.

`htmx-ui-plugin-docs` turns the pages under `/docs` into documentation: every section linkable, every page also published as Markdown, and indexes for search engines, site search and AI agents. One navigation file drives the sidebar, previous/next links and the order of everything it publishes. This website's docs are built with it; see [AI agents](/docs/v0.2/ai-agents) for what the output looks like.

## Install

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
  url: "https://example.com", // absolute URLs in the sitemaps; $SITE_URL overrides it
  plugins: [docs({ name: "Acme", description: "Acme's docs." })],
});
```

```css styles.css
@import "tailwindcss";
@import "htmx-ui/styles.css";
@import "htmx-ui-plugin-docs/styles.css";
```

```ts app.ts
import { initMarkdownCopy } from "htmx-ui-plugin-docs/client";

document.addEventListener("DOMContentLoaded", () => initMarkdownCopy());
```

## The docs layout

The plugin reads pages the way they are rendered, so it needs three things from your docs layout: an `<article>` whose first `h1` is the page title, the page body inside `<div data-docs-content>`, and a `<meta name="description">`. An `.eyebrow` in the article names the page's section.

```jinja layouts/docs.html
{% extends "layouts/base.html" %}
{% from "docs/macros.html" import markdown_actions %}
{% set nav = docsNav(url) %}

{% block content %}
  <aside>
    {% for group in nav.sections %}
      <p>{{ group.title }}</p>
      {% for item in group.items %}
        <a href="{{ item.href }}"{% if item.href == nav.active %} aria-current="page"{% endif %}>{{ item.title }}</a>
      {% endfor %}
    {% endfor %}
  </aside>
  <article>
    <p class="eyebrow">{{ nav.section }}</p>
    <h1>{{ title }}</h1>
    {{ markdown_actions(url) }}
    <div data-docs-content class="prose">{% block docs %}{% endblock %}</div>
    {% if nav.prev %}<a href="{{ nav.prev.href }}">{{ nav.prev.title }}</a>{% endif %}
    {% if nav.next %}<a href="{{ nav.next.href }}">{{ nav.next.title }}</a>{% endif %}
  </article>
{% endblock %}
```

## Navigation

One file lists the docs in order, in sections. It is found through the template roots, like `json()`:

```json data/docs-nav.json
{
  "sections": [
    {
      "title": "Getting started",
      "items": [
        { "title": "Introduction", "href": "/docs" },
        { "title": "Installation", "href": "/docs/installation", "description": "Set it up." }
      ]
    }
  ]
}
```

`docsNav(url)` returns where a page sits in it:

| Field | Description |
| --- | --- |
| `sections` | The file's sections, for the sidebar. |
| `pages` | Every entry, in order. |
| `current` | The page's own entry, or null when it is not listed. |
| `active` | href of the closest entry: the page's own, or the longest one its URL starts with. /docs/servers/express marks /docs/servers active when it has no entry of its own, so a section can have pages of its own. |
| `section` | Title of the active entry's section ("Docs" when none), for the eyebrow. |
| `prev, next` | The entries before and after the page's own, or null. |

Entries can carry anything else you need (this site marks components with `"component": true` to list them on the components page). Pages missing from the file still get Markdown, and sort with their closest listed parent.

## Heading anchors

Every `h2` and `h3` in `[data-docs-content]` gets an `id` from its text and a `#` link, styled by htmx-ui's `.heading-anchor`. An explicit `id` is kept, so give one to a heading whose wording may change while links to it must not. Headings inside links, `.not-prose` component markup, `.demo` previews and `[data-md-skip]` are not sections and are left alone. The HTML, the Markdown and the sitemap all see the same ids.

## What it publishes

| URL | Description |
| --- | --- |
| `<route>.md` | Each docs page as Markdown with frontmatter: /docs.md, /docs/setup.md. Demos become their source, tables Markdown tables, alerts blockquotes. |
| `/llms.txt` | llmstxt.org index: every docs page as a Markdown link with its description, grouped by section. |
| `/llms-full.txt` | Every docs page's Markdown in one file. |
| `/sitemap.json` | Every page with title, description, section, outline and section text. The index site search reads. |
| `/docs/sitemap.json` | The same for the docs only. |
| `/sitemap.xml` | For search engines. The 404 page is left out of both sitemaps. |
| `/robots.txt` | Points crawlers at the sitemap. A robots.txt in public/ is used instead. |

`htmx-ui dev` and the [server adapters](/docs/v0.2/servers) generate them on request; `htmx-ui build` writes them to `dist/`. Mark purely visual blocks `data-md-skip` to leave them out of the Markdown and the search text.

## Macros

```jinja
{% from "docs/macros.html" import demo, classes, markdown_actions %}

{% call demo() %}<button class="btn btn-primary">Save</button>{% endcall %}
{{ classes([["btn", "The base class."], ["btn-primary", "The main action."]]) }}
{{ markdown_actions(url) }}
```

| Macro | Description |
| --- | --- |
| `demo(class, source, isolate)` | A live preview of the call body with its source underneath. In Markdown it becomes just the source. |
| `classes(rows, heading)` | A two-column reference table of [name, description] rows. |
| `markdown_actions(page_url)` | "Copy Markdown" and "View .md" buttons for the page. Copying needs htmx-ui-plugin-docs/client. |

## Options

| Option | Description |
| --- | --- |
| `prefix` | Route prefix of the docs. Default "/docs". |
| `nav` | The navigation file. Default "data/docs-nav.json"; false for none. |
| `name, description` | The site, for llms.txt and sitemap.json. |
| `anchors` | Heading ids and # links. Default true. |
| `robots` | Publish /robots.txt. Default true. |

> **Set the site URL for production builds** Sitemaps and llms.txt carry absolute URLs from `url` in the config, or `$SITE_URL`. The build warns when neither is set.

## For other plugins

Its `api` renders and converts pages for plugins that build on it:

```ts
const docs = config.plugins.find((p) => p.name === "docs")?.api as DocsApi | undefined;
for (const page of docs?.pages() ?? []) console.log(page.url, page.title, page.sections.length);
```

`pages()` renders every page (with `title`, `description`, `section`, `headings` and `sections`), `markdown(page)` converts one, and `isDocs(url)` tells docs pages from the rest. The converters and generators are exported too: `pageMarkdown`, `pageMeta`, `addHeadingAnchors`, `sitemapJson`, `llmsTxt`.
