---
title: "AI agents"
description: "Every docs page is published as Markdown, with an llms.txt index and JSON sitemaps, so coding agents can read the docs as specs."
url: "/docs/v0.2/ai-agents"
section: "Guides"
---

# AI agents

Every docs page is published as Markdown, with an llms.txt index and JSON sitemaps, so coding agents can read the docs as specs.

## Markdown pages

Add `.md` to any docs URL to get the page as Markdown: [/docs/components/button.md](/docs/v0.2/components/button.md), [/docs.md](/docs/v0.2.md). Each file starts with frontmatter (title, description, URL, section). Live examples become their source code, and reference tables become Markdown tables. The **Copy Markdown** button at the top of every page copies it for pasting into a chat.

````md /docs/components/badge.md
---
title: "Badge"
description: "A small label for status, counts or categories."
url: "/docs/components/badge"
section: "Components"
---

# Badge

A small label for status, counts or categories.

```html
<span class="badge badge-primary">New</span>
```
````

## Indexes

Each opens in a new tab.

| URL | Contents |
| --- | --- |
| [/llms.txt](/llms.txt) | llms.txt index (llmstxt.org): every docs page as a Markdown link with its description, grouped by section. Start here. |
| [/llms-full.txt](/llms-full.txt) | Every docs page's Markdown in one file, for loading the whole library into context. |
| [/sitemap.json](/sitemap.json) | Every page with URL, Markdown URL, title, description, section, heading outline and section text, plus the list of docs versions. The index for site search. |
| [/docs/sitemap.json](/docs/v0.2/sitemap.json) | The same for the latest docs only. Each older version has its own, e.g. /docs/v0.1/sitemap.json. |
| [/docs/versions.json](/docs/versions.json) | Every docs version with its URL prefix, its sitemap and the pages it contains. |
| [/sitemap.xml](/sitemap.xml) | Standard XML sitemap for search engines. |
| [/robots.txt](/robots.txt) | Allows crawling and points at the sitemap. |

```json /sitemap.json (excerpt)
{
  "name": "HTMX UI",
  "url": "https://example.com",
  "version": "0.1",
  "versions": [
    { "id": "0.1", "label": "v0.1", "path": "/docs", "latest": true, "sitemap": "/docs/sitemap.json" }
  ],
  "pages": [
    {
      "url": "/docs/components/tabs",
      "markdown": "/docs/components/tabs.md",
      "title": "Tabs",
      "section": "Components",
      "headings": [{ "level": 2, "id": "markup", "text": "Markup" }],
      "sections": [{ "id": "markup", "title": "Markup", "text": "Each [data-tab] button shows the [data-tab-panel]…" }]
    }
  ]
}
```

Every `sections[].id` is a heading anchor, so `url + "#" + id` opens that exact section. This site's own search (`Ctrl` `K`) works this way, and an MCP server can list pages from these files and link straight to the right place.

## Prompts

These work with any agent that can fetch URLs (Claude, ChatGPT, Cursor, Copilot and others). Copy, then replace the task.

### Use the docs for one task

```text Prompt
Read http://localhost:3000/llms.txt. It indexes the htmx-ui docs; every link is a Markdown page.
Fetch the pages relevant to the task below and follow their markup and class names exactly.
Use htmx-ui's design tokens (bg-primary, text-muted-foreground, border-border) instead of raw colours.

Task: build a settings page with tabs for Profile and Billing, and a danger-zone card with a delete button.
```

### Point at specific pages

```text Prompt
Build a settings page using htmx-ui. Follow these specs exactly:
http://localhost:3000/docs/components/card.md
http://localhost:3000/docs/components/tabs.md
```

## Make it a skill

Save the lookup steps as a skill so your agent uses the docs automatically, every time you work on UI, without pasting URLs again. Ask your agent to create it:

```text Prompt
Create a skill named "htmx-ui" for this project (for Claude Code: .claude/skills/htmx-ui/SKILL.md).
It should trigger whenever I build or change UI with htmx-ui components, classes, theming or dark mode.
The skill must tell you to:
1. Fetch http://localhost:3000/llms.txt to find the relevant docs pages.
2. Fetch those pages as Markdown (http://localhost:3000/docs/<page>.md) and follow their markup exactly.
3. Check the htmx-ui version in package.json; if it's older than the latest docs, read
   http://localhost:3000/docs/versions.json and use that version's pages instead.
4. Prefer design tokens over raw Tailwind colours, and call initComponents() for new htmx content.
Keep the skill short and link to the docs rather than copying them.
```

Or create the file yourself:

```md .claude/skills/htmx-ui/SKILL.md
---
name: htmx-ui
description: Build UI with the htmx-ui component library (Tailwind CSS v4 + htmx). Use when adding or changing buttons, cards, alerts, tabs, dropdowns, tables, prose, theming or dark mode in this project.
---

# htmx-ui

The docs are written for agents. Don't guess class names; look them up.

1. Fetch the index: http://localhost:3000/llms.txt
2. Fetch the pages you need as Markdown, e.g. http://localhost:3000/docs/components/tabs.md
3. Match the docs to the installed version: read "htmx-ui" in package.json. If it's older than the
   latest docs, use the matching version from http://localhost:3000/docs/versions.json (pages live under its "path").
4. Search for a topic in http://localhost:3000/sitemap.json: `pages[].sections[]` hold the text of every section.

Rules:
- Copy markup and class names from the docs exactly.
- Use design tokens (bg-primary, text-muted-foreground, border-border), not raw palette colours.
- Wrap long-form text in .prose; give components inside it not-prose.
- After htmx inserts new content, components initialise via initComponents() on htmx:after:process.
```

> **Other agents** The same text works as a Cursor rule (`.cursor/rules/htmx-ui.mdc`), a GitHub Copilot instruction file (`.github/copilot-instructions.md`) or a section in `AGENTS.md`.

## How it's generated

Nothing is written by hand. The [docs plugin](/docs/v0.2/plugins/docs) (`htmx-ui-plugin-docs`, in the site's `site/htmx-ui.config.ts`) renders every page at build time, converts the article body to Markdown, and writes the indexes. The dev server generates the same files on request. Add it to your own site to publish the same files for your docs.

- Page order follows the docs navigation in `site/data/docs-nav.json`.
- Absolute URLs (and the URLs in the prompts above) use the `SITE_URL` environment variable, falling back to `url` in `site/data/site.json`.
- Every docs heading gets an id and a `#` link, so sections can be linked directly.
- Add `data-md-skip` to an element to leave it out of the Markdown and the search text (purely visual blocks).

```bash Terminal
SITE_URL=https://htmx-ui.example bun run build
```

> **Write for both readers** Agents read exactly what people read, so a clear page works for both. Show the full markup in every example, say what each class does in the reference table, and describe behaviour in words, not just in a live demo.
