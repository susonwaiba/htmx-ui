---
title: "Writing a plugin"
description: "Build an htmx-ui plugin: the hooks, templates, page edits with editHtml(), routes and build output, CLI commands, browser code, testing and publishing."
url: "/docs/v0.2/plugins/writing"
section: "Plugins"
---

# Writing a plugin

Build an htmx-ui plugin: the hooks, templates, page edits with editHtml(), routes and build output, CLI commands, browser code, testing and publishing.

A plugin is an object with a `name` and the hooks it needs. Most hooks are config options you already know (`globals`, `transform`, `routes`, `fetch`, `build.done`), so anything a config can do, a plugin can package up. The engine merges every plugin into the config once, when it loads, and every runtime and adapter reads that merged config: a plugin never needs to know whether it is running under `htmx-ui dev`, a build, Vite or a server.

Start in your own project. A plugin can live in a file next to `htmx-ui.config.ts` and be imported like any module; publish it once another site wants it.

## A complete example

This plugin publishes an Atom feed of the pages under `/blog`. It uses most hooks: a template with a `<link>` macro, a global, a transform, a route for development, a file for the build, and a command.

```ts plugins/feed/index.ts
import { definePlugin, editHtml, pagesOf, renderPage, type ResolvedConfig } from "htmx-ui-engine";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export interface FeedOptions {
  /** Pages under this prefix are posts. */
  prefix?: string;
  title: string;
}

export function feed({ prefix = "/blog", title }: FeedOptions) {
  let config: ResolvedConfig;

  /** Every post, newest first, from its <meta name="date"> and <h1>. */
  function posts() {
    return pagesOf(config)
      .filter((p) => p.url.startsWith(prefix + "/"))
      .map((p) => {
        let date = "";
        let heading = "";
        let inH1 = false;
        editHtml(renderPage(config, p.file), {
          element(el) {
            if (el.matches('meta[name="date"]')) date = el.getAttribute("content") ?? "";
            if (el.tagName === "h1") {
              inH1 = true;
              el.onEndTag(() => void (inH1 = false));
            }
          },
          text(chunk) {
            if (inH1) heading += chunk;
          },
        });
        return { url: config.origin + p.url, title: heading.trim(), date };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function xml() {
    const items = posts().map((p) => `<entry><title>${p.title}</title><link href="${p.url}"/><updated>${p.date}</updated></entry>`);
    return `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>${title}</title>${items.join("")}</feed>\n`;
  }

  return definePlugin({
    name: "feed",
    // templates/feed/link.html, reached as "feed/link.html"
    roots: [fileURLToPath(new URL("./templates", import.meta.url))],
    configResolved(c) {
      config = c;
    },
    globals: { feedUrl: "/feed.xml" },
    // Posts get an id on their <article>, so other pages can link to them
    transform(html, page) {
      if (!page.url.startsWith(prefix + "/")) return html;
      return editHtml(html, {
        element(el) {
          if (el.tagName === "article" && !el.hasAttribute("id")) el.setAttribute("id", "post");
        },
      });
    },
    // dev and server adapters: generated on request
    routes: {
      "/feed.xml": () => new Response(xml(), { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } }),
    },
    // htmx-ui build: written next to the pages
    build: {
      async done({ outDir }) {
        await writeFile(join(outDir, "feed.xml"), xml());
      },
    },
    commands: {
      "feed:list": {
        description: "list the posts in the feed",
        run() {
          for (const p of posts()) console.log(p.date, p.title);
        },
      },
    },
  });
}

export default feed;
```

```jinja plugins/feed/templates/feed/link.html
{% macro feed_link() %}<link rel="alternate" type="application/atom+xml" href="{{ feedUrl }}" />{% endmacro %}
```

Use it like any other plugin:

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import feed from "./plugins/feed";

export default defineConfig({
  url: "https://example.com",
  plugins: [feed({ title: "My blog" })],
});
```

```jinja layouts/post.html
{% from "feed/link.html" import feed_link %}
<head>
  {{ feed_link() }}
  <meta name="date" content="{{ date }}" />
</head>
```

## Hooks

Every hook is optional except `name`.

| Hook | Description |
| --- | --- |
| `name` | Unique. Other plugins find this one by it, and a config listing two plugins with one name refuses to load. |
| `roots` | Template roots, searched after the project's own and before htmx-ui's. Absolute, or relative to the project root. |
| `globals, filters` | Nunjucks globals and filters. The project's own of the same name win. |
| `transform(html, page)` | Post-process every rendered page, in dev, builds and servers. page is { file, url }. Runs before the project's own transform. |
| `routes` | Request handlers in Bun.serve route syntax ("/feed.xml", "/api/:id", "/files/*"), served by htmx-ui dev and by server adapters. Not part of a static build. |
| `fetch(req)` | Fallback for requests nothing else answered; return null to pass. Runs after the project's own fetch. |
| `build.done(ctx)` | After a production build, with { config, outDir, pages }: write files the static site needs. Runs before the project's own. |
| `commands` | CLI commands by name: { "feed:list": { description, usage, run(ctx) } }. |
| `configResolved(config)` | Called once the config is resolved, before anything renders, serves or builds. Keep the config for the other hooks. |
| `api` | Anything the plugin offers other plugins. |

> **A route serves, a build writes** `routes` answer only where a server runs. For a file the static site needs too, like the feed above, generate it in a route for development and write the same thing in `build.done`. Both are cheap to keep in sync when one function makes the content.

## Runs on Bun and Node

Plugin code runs inside the config, and on Node the config is loaded by Vite. So a plugin uses `node:` APIs (`node:fs`, `node:path`) rather than `Bun.file` or `Bun.write`, and never `HTMLRewriter`, which Node does not have.

- Read the config in `configResolved`, not at module scope: the same module may be loaded for several configs.
- Globals and filters are synchronous, like Nunjucks itself: read files with `readFileSync` there.
- Routes, fetch, build.done and commands may be `async`.
- Find your own files from `import.meta.url` (`new URL("./templates", import.meta.url)`), never from the working directory.

## Editing pages: editHtml()

`editHtml(html, handlers)` from `htmx-ui-engine` is a small streaming HTML editor for transforms. It behaves like Bun's `HTMLRewriter` where they overlap (text and attribute values arrive as written, entities not decoded; `setAttribute` escapes only `"`), and it leaves every tag you don't touch byte for byte, so an edit never reformats a page.

```ts
import { editHtml } from "htmx-ui-engine";

const html = editHtml(page, {
  element(el) {
    if (el.matches("a[href^='http']") && !el.closest("nav")) el.setAttribute("rel", "noopener");
    if (el.matches("h2") && el.closest("[data-docs-content]")) el.append(' <a href="#top">↑</a>');
  },
  text(chunk, parents) {
    // each run of text, with the elements open around it
  },
});
```

| Element | Description |
| --- | --- |
| `tagName, parents` | The lowercased tag name; the open ancestors, outermost first. |
| `getAttribute, hasAttribute, setAttribute, removeAttribute` | Attributes, as written. |
| `matches(selector), closest(selector)` | Tag, #id, .class and [attr] tests (=, ~=, ^=, $=, *=), comma-separated. No combinators: closest() walks the ancestors. |
| `before, prepend, append, after (html)` | Insert markup around or inside the element. |
| `replace(html), remove()` | Replace or drop the whole element. |
| `onEndTag(fn)` | Run when the element closes: its text has been seen by then. |

## Templates

Keep a plugin's templates in a directory named after it (`templates/feed/link.html`, reached as `feed/link.html`), so they can't collide with a project's own or another plugin's. Prefer macros to partials: a macro takes arguments, and a project calls it where it wants. Plugin templates can use htmx-ui's components (`{% from "components/icon/icon.html" import icon %}`), since htmx-ui's `src/` is searched after them.

A project overrides a template by having a file with the same name, so treat the names as your public API, and document the `data-*` attributes your browser code relies on.

## Commands

`run` gets a context and returns an exit code (nothing means 0). Throw to fail with a message.

| Context | Description |
| --- | --- |
| `config` | The resolved config, plugins included. |
| `args` | Positional arguments after the command: htmx-ui versions:name 0.2.0 gives ["0.2.0"]. |
| `options` | Options as parsed: --force gives { force: true }, --to=x gives { to: "x" }. |
| `build()` | Build the site the way htmx-ui build does, on the runtime the CLI is running on. Resolves to whether it succeeded. |

Name commands `<plugin>:<verb>`. A plugin can't replace `dev`, `build` or `preview`, and two plugins can't share a command.

## Working with other plugins

A plugin finds another by name in `config.plugins` and uses its `api`. Look it up when you need it, not in `configResolved`: the other plugin may come later in the list. Treat it as optional and do something sensible without it, as the official plugins do with each other:

```ts
const docs = config.plugins.find((p) => p.name === "docs")?.api as { pages(): { url: string; title: string }[] } | undefined;
const titles = docs ? docs.pages().map((p) => p.title) : [];
```

## Browser code and styles

The config side of a plugin never reaches the browser. Ship browser code as a separate entry (`your-plugin/client`) that the project imports in its `app.ts`, and styles as a stylesheet it imports after htmx-ui's:

```ts src/client.ts
import { queryAll } from "htmx-ui";

export function initFeedLinks(root: ParentNode = document) {
  queryAll(root, "[data-feed-link]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    // ...
  });
}
```

```css src/styles.css
/* Tailwind must see the utilities in the templates: Vite skips node_modules */
@source "./";

@layer components {
  .feed-link {
    @apply inline-flex items-center gap-1 text-muted-foreground;
  }
}
```

Follow htmx-ui's component contract: take a `root`, find elements with `queryAll` (it includes `root`), and mark each with `data-init`, so the function can also run on content htmx swaps in. Build styles from htmx-ui's tokens (`bg-primary`, `text-muted-foreground`) so they follow the theme and dark mode.

## Testing

Resolve a config with your plugin over a temporary project, then render pages with `renderPage` and send requests through `createSite`, which answers like every adapter does:

```ts index.test.ts
import { expect, test } from "bun:test";
import { createSite, renderPage, resolveConfig } from "htmx-ui-engine";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import feed from "./index";

test("publishes the feed", async () => {
  const root = await mkdtemp(join(tmpdir(), "feed-"));
  await mkdir(join(root, "pages/blog"), { recursive: true });
  await writeFile(join(root, "pages/blog/hello.html"), '<head><meta name="date" content="2026-01-02"></head><article><h1>Hello</h1></article>');

  const config = resolveConfig({ url: "https://x.test", plugins: [feed({ title: "Blog" })] }, root);
  expect(renderPage(config, join(root, "pages/blog/hello.html"))).toContain('<article id="post">');

  const site = await createSite({ config });
  const res = await site.handle(new Request("http://localhost/feed.xml"));
  expect(await res.text()).toContain("<title>Hello</title>");
});
```

`config.user.build.done({ config, outDir, pages })` runs the build hooks without a build, and `config.plugins.find(...).commands` holds the commands to call directly.

## Publishing

- Name it `htmx-ui-plugin-<name>` and add the keyword `htmx-ui-plugin`, so it can be found.
- Default-export a function that returns the plugin, taking an options object.
- Make `htmx-ui-engine` (and `htmx-ui`, when you use its components) peer dependencies.
- Ship compiled JavaScript for Node and for browser bundlers, which don't use the `bun` condition, and the TypeScript source for Bun. Templates and CSS ship as they are.

```json package.json
{
  "name": "htmx-ui-plugin-feed",
  "type": "module",
  "keywords": ["htmx-ui", "htmx-ui-plugin"],
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": { "bun": "./src/index.ts", "types": "./lib/index.d.ts", "default": "./lib/index.js" },
    "./client": { "bun": "./src/client.ts", "types": "./lib/client.d.ts", "default": "./lib/client.js" },
    "./styles.css": "./src/styles.css"
  },
  "files": ["lib", "src"],
  "peerDependencies": { "htmx-ui": "^0.2.0", "htmx-ui-engine": "^0.2.0" }
}
```

A compiled `lib/index.js` sits beside `src/`, so point at templates through the package root and both find them: `new URL("../src/templates", import.meta.url)`. The official plugins in [the repository](https://github.com/susonwaiba/htmx-ui/tree/main/packages) are complete examples: `plugin-search` is the smallest, templates and a browser module; `plugin-versions` has commands.
