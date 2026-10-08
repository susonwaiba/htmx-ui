# htmx-ui-plugin-docs

Docs for [htmx-ui-engine](https://www.npmjs.com/package/htmx-ui-engine) sites that people and AI agents can both read. Pages under `/docs` get:

- an `id` and a `#` link on every `h2`/`h3`, so sections can be linked and searched;
- a Markdown version at `<route>.md` (`/docs/setup.md`), with frontmatter;
- `/llms.txt`, `/llms-full.txt`, `/sitemap.xml`, `/sitemap.json` (with section text, the index [htmx-ui-plugin-search](https://www.npmjs.com/package/htmx-ui-plugin-search) reads), `/docs/sitemap.json` and `/robots.txt`;
- `docsNav(url)` in templates: the sidebar, the active entry and previous/next pages from one navigation file;
- `demo()`, `classes()` and `markdown_actions()` macros for writing pages.

In development the files are generated on request; `htmx-ui build` writes them to `dist/`. Works on Bun and Node.

## Install

```bash
npm install htmx-ui-plugin-docs
```

## Use

```ts
// htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import docs from "htmx-ui-plugin-docs";

export default defineConfig({
  url: "https://example.com", // absolute URLs in the sitemaps ($SITE_URL overrides it)
  plugins: [docs({ name: "Acme", description: "Acme's docs." })],
});
```

```css
/* styles.css */
@import "tailwindcss";
@import "htmx-ui/styles.css";
@import "htmx-ui-plugin-docs/styles.css";
```

The "Copy Markdown" button that `markdown_actions()` renders is an htmx-ui clipboard button, so it works
wherever htmx-ui's `initComponents()` runs: no browser module to import. (`htmx-ui-plugin-docs/client` still exports
`initMarkdownCopy()` for pages built with the plugin's older markup.)

A docs layout wraps the article body in `<div data-docs-content>`, inside an `<article>` whose first `h1` is the page title:

```html
{% extends "layouts/base.html" %}
{% from "docs/macros.html" import markdown_actions %}
{% set nav = docsNav(url) %}
{% block content %}
  <nav>
    {% for group in nav.sections %}
      <p>{{ group.title }}</p>
      {% for item in group.items %}
        <a href="{{ item.href }}"{% if item.href == nav.active %} aria-current="page"{% endif %}>{{ item.title }}</a>
      {% endfor %}
    {% endfor %}
  </nav>
  <article>
    <p class="eyebrow">{{ nav.section }}</p>
    <h1>{{ title }}</h1>
    {{ markdown_actions(url) }}
    <div data-docs-content>{% block docs %}{% endblock %}</div>
    {% if nav.prev %}<a href="{{ nav.prev.href }}">{{ nav.prev.title }}</a>{% endif %}
    {% if nav.next %}<a href="{{ nav.next.href }}">{{ nav.next.title }}</a>{% endif %}
  </article>
{% endblock %}
```

The navigation file, `data/docs-nav.json`:

```json
{ "sections": [{ "title": "Start", "items": [{ "title": "Introduction", "href": "/docs" }, { "title": "Setup", "href": "/docs/setup" }] }] }
```

## Options

| Option | Default | |
| --- | --- | --- |
| `prefix` | `"/docs"` | Route prefix of the docs. |
| `nav` | `"data/docs-nav.json"` | Navigation file, found like `json()`. Orders llms.txt and the sitemaps, feeds `docsNav()`. `false` for none. |
| `name`, `description` | `""` | The site, for llms.txt and sitemap.json. |
| `anchors` | `true` | Heading ids and `#` links. |
| `robots` | `true` | Publish `/robots.txt`. A `robots.txt` in `public/` is used instead. |

Mark purely visual blocks `data-md-skip` to leave them out of the Markdown and the search text.

Full guide: <https://susonwaiba.github.io/htmx-ui/docs/plugins/docs>

MIT
