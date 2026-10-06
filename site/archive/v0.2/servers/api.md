---
title: "createSite() API"
description: "Reference for createSite(), the Site it returns and the options every server adapter takes."
url: "/docs/v0.2/servers/api"
section: "Servers"
---

# createSite() API

Reference for createSite(), the Site it returns and the options every server adapter takes.

`createSite()` is what every adapter runs underneath, and what you use directly on a server without an adapter. It reads the config, finds the pages, compiles their templates, and returns a `Site` that renders templates and answers requests.

```ts server.ts
import { createSite, type Site, type SiteOptions } from "htmx-ui-engine";

const site: Site = await createSite({ context: { company: "Acme" } });

site.fragment("partials/invoice-row.html", { invoice }); // an htmx fragment, as a string
site.render("/dashboard", { user });                      // a whole page, as a string
await site.handle(request);                               // a Response for any request
```

Every adapter entry (`htmx-ui-engine/elysia`, `/fastify`, `/koa`, `/express`, `/hono`) also re-exports `createSite` and its types, so one import is enough.

## Site

| Member | Description |
| --- | --- |
| `site.config` | The resolved config: absolute root, roots, pagesDir, outDir and publicDir, plus origin, render, and the config as you wrote it (user). |
| `site.pages` | Every page as { file, path, url }, sorted by route. Found once at startup, so a new page needs a restart. |
| `site.render(url, context?)` | Render the page at a route ("/", "/docs/setup", trailing slash or not) with its layout and the config's transform(). Throws when no page has that route. |
| `site.fragment(path, context?)` | Render any template by its path from a root ("partials/row.html") as an HTML fragment: no document shell, no transform(). Throws when the template doesn't exist. |
| `site.handle(request, context?)` | Answer a web Request: the config's routes, then dist/, then (outside production) the page's template, then the config's fetch, then a 404 page. Always resolves to a Response. context reaches the templates it renders. |

Both renders see the config's `globals`, then `options.context`, then the `context` you pass, with later values winning. See [How a request is answered](/docs/v0.2/servers#request-order) for `handle()`'s order, and [The 404 page](/docs/v0.2/servers#not-found) for its last step.

## Options

`createSite(options)` and every adapter's `htmxUi(options)` take the same options:

| Option | Description |
| --- | --- |
| `root` | Project root, where htmx-ui.config.ts and pages/ live. Default: process.cwd(). |
| `config` | A config object to use instead of reading htmx-ui.config.ts: what defineConfig() takes, or a resolved config. |
| `context` | Values for every render, on top of the config's globals. |
| `asset(file, page)` | URL for asset() in render() and fragment(). file is the absolute file, page the template rendering it. Default: a path from the project root (/images/logo.png). |
| `cache` | Keep compiled templates between renders, and compile everything the pages reach at startup. Default true. false re-reads every template on every render. |
| `site` | A Site, or a promise of one, to use instead of creating one: htmxUi({ site }) serves the instance your routes render with. |

> **asset() and request-time renders** Built pages already carry hashed asset URLs, so `handle()` never calls `asset()`. It matters only for `render()` and `fragment()`. By default it returns a path from the project root, which your server only serves if the file is in `dist/`. See [Asset URLs in fragments](/docs/v0.2/servers/rendering#assets).

## Config options for servers

These settings in `htmx-ui.config.ts` matter when a server is involved (the rest are in [Configuration](/docs/v0.2/engine#config)):

| Option | Description |
| --- | --- |
| `routes` | Request handlers keyed by path ("/api/users/:id"). Served by htmx-ui dev and by the adapters, never by a static host. |
| `fetch(request)` | Fallback for requests nothing else matched. Return null to let the 404 page answer. |
| `render` | true when this deployment renders templates at runtime: createSite() checks at startup that the roots and pages are there. See Deploying. |
| `debug` | true, or a list of topics (requests, render, templates, build): log what answered each request and how long renders took. |

## Adapters

Each adapter is one function, `htmxUi(options?)`, and imports nothing from its framework.

| Entry | Description |
| --- | --- |
| `htmx-ui-engine/elysia` | An Elysia plugin: a catch-all route your own routes always beat. Returns the instance, so .use(htmxUi()).listen() chains. |
| `htmx-ui-engine/fastify` | A Fastify plugin that sets the not-found handler. Register it once, on the root instance. |
| `htmx-ui-engine/koa` | Koa middleware that answers after the rest of the stack, only when nothing set a body or a status. |
| `htmx-ui-engine/express` | Connect-style middleware for Express 4 and 5, Connect and node:http. Mount it last. |
| `htmx-ui-engine/hono` | Hono middleware. Register it last. |
