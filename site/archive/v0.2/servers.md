---
title: "Server frameworks"
description: "Serve a built htmx-ui site from your own backend: Elysia, Fastify, Koa, Express, Hono, Bun.serve, Deno, or a backend in another language."
url: "/docs/v0.2/servers"
section: "Servers"
---

# Server frameworks

Serve a built htmx-ui site from your own backend: Elysia, Fastify, Koa, Express, Hono, Bun.serve, Deno, or a backend in another language.

A built htmx-ui site is just files: pages at their routes, hashed scripts and styles, and whatever you put in `public/`. Any server can host them. `htmx-ui-engine` adds adapters that put those files and your own API in **one process**: your routes answer what they claim, and htmx-ui answers the rest with the built site. The same templates also render the HTML fragments your API returns to htmx.

## Pick your server

| Server | Use | Order | Runs on |
| --- | --- | --- | --- |
| [Elysia](/docs/v0.2/servers/elysia) (recommended) | `htmx-ui-engine/elysia` | Any | Bun, Node |
| [Fastify](/docs/v0.2/servers/fastify) | `htmx-ui-engine/fastify` | Any | Node, Bun |
| [Koa](/docs/v0.2/servers/koa) | `htmx-ui-engine/koa` | Any | Node, Bun |
| [Express](/docs/v0.2/servers/express) | `htmx-ui-engine/express` | Last | Node, Bun |
| [Hono](/docs/v0.2/servers/hono) | `htmx-ui-engine/hono` | Last | Node, Bun, Deno |
| [Bun.serve](/docs/v0.2/servers/bun) | `createSite()` | — | Bun |
| [Deno, node:http, h3, NestJS](/docs/v0.2/servers/other) | `createSite()` or an adapter | — | Deno, Node, Bun |
| [Django, Rails, Laravel, Go…](/docs/v0.2/servers/any-backend) | The built files | — | Any |

**Order** is where the adapter has to go relative to your own routes. "Any" means it only answers what no route of yours matched, wherever you register it. "Last" means it is ordinary middleware that answers every request it sees, so it has to come after your routes. The adapters use files on disk, so edge runtimes without a filesystem (Cloudflare Workers and the like) are not supported.

## Quick start

Add the engine and your framework as **dependencies**. Your server imports the engine at runtime, so a production install that skips dev dependencies would leave it out.

```bash bun
bun add htmx-ui-engine elysia
```

```bash npm
npm install htmx-ui-engine elysia
```

```bash pnpm
pnpm add htmx-ui-engine elysia
```

```bash yarn
yarn add htmx-ui-engine elysia
```

Mount the adapter next to your own routes:

```ts Elysia
import { Elysia } from "elysia";
import { htmxUi } from "htmx-ui-engine/elysia";

new Elysia()
  .get("/api/ping", () => ({ ok: true }))
  .use(htmxUi()) // everything else is the built site
  .listen(3000);
```

```ts Fastify
import Fastify from "fastify";
import { htmxUi } from "htmx-ui-engine/fastify";

const app = Fastify();
app.get("/api/ping", async () => ({ ok: true }));
app.register(htmxUi()); // everything else is the built site
await app.listen({ port: 3000 });
```

```ts Koa
import Koa from "koa";
import { htmxUi } from "htmx-ui-engine/koa";

const app = new Koa();
app.use(htmxUi()); // answers only what nothing else did
app.use(async (ctx, next) => {
  if (ctx.path === "/api/ping") ctx.body = { ok: true };
  else await next();
});
app.listen(3000);
```

```ts Express
import express from "express";
import { htmxUi } from "htmx-ui-engine/express";

const app = express();
app.get("/api/ping", (req, res) => res.json({ ok: true }));
app.use(htmxUi()); // last: everything else is the built site
app.listen(3000);
```

```ts Hono
import { Hono } from "hono";
import { htmxUi } from "htmx-ui-engine/hono";

const app = new Hono();
app.get("/api/ping", (c) => c.json({ ok: true }));
app.use(htmxUi()); // last: everything else is the built site

export default app;
```

```ts Bun.serve
import { createSite } from "htmx-ui-engine";

const site = await createSite();

Bun.serve({
  port: 3000,
  routes: { "/api/ping": () => Response.json({ ok: true }) },
  fetch: (request) => site.handle(request), // everything else is the built site
});
```

Then build the site and start your server:

```json package.json
{
  "scripts": {
    "dev": "htmx-ui dev",
    "build": "htmx-ui build",
    "start": "NODE_ENV=production bun server.ts"
  }
}
```

On Node, `start` is `NODE_ENV=production node server.ts` (Node 22.18 and later run TypeScript directly), or your compiled `server.js`. While you work on pages, `htmx-ui dev` is still the quicker loop, with hot reload and your mock endpoints. Your server is for the API, and for production.

## How a request is answered

Your framework sees each request first, so its routes and middleware keep the paths they claim. Whatever is left goes to the adapter, which tries in this order:

1. The config's `routes`, the same ones `htmx-ui dev` serves (see [Mock htmx endpoints](/docs/v0.2/engine#mock-endpoints)). They answer in production too, so [keep mocks out of production](/docs/v0.2/servers/deploying#mock-routes).
2. `dist/`: a page at its route, a hashed asset, or a `public/` file.
3. **Development only:** the page template for that route, rendered on the spot. See [Development and production](#dev-prod).
4. The config's `fetch` fallback.
5. A [404 page](#not-found).

`debug: ["requests"]` in `htmx-ui.config.ts` logs which step answered each request and how long it took. See [Debugging](/docs/v0.2/engine#debug).

### The 404 page

Every path ends with an answer, so a request never falls through to your framework's own 404. What it gets, in order:

1. `dist/404.html`, built from your `pages/404.html`, with your layout and styles.
2. In development, before anything is built: `pages/404.html`, rendered on the spot.
3. htmx-ui's default: a small, self-contained page that follows the visitor's light or dark preference.

To use your own, add `pages/404.html`. It is an ordinary page that extends your layout, and it is served with a `404` status. A build with no `pages/404.html` writes the default to `dist/404.html`, so a static host serves the same page. `htmx-ui dev` and `htmx-ui preview` answer the same way.

```jinja pages/404.html
{% extends "layouts/base.html" %}

{% block content %}
  <h1 class="h1">Page not found</h1>
  <p class="muted">Try the <a class="link" href="/">home page</a>.</p>
{% endblock %}
```

> **htmx swaps error responses** htmx 4 swaps a `404` response like any other. If an `hx-get` asks for a path nothing answers, the whole 404 page lands in its target. Fix the path, or tell that element not to swap a 404: `hx-status:404="swap:none"`.

### Where to mount it

**Elysia** registers a catch-all route, and Elysia's router always prefers a specific route. **Fastify** becomes the not-found handler. **Koa** runs the rest of the stack first and only answers when nothing else did. For these three, registration order doesn't matter.

**Express** and **Hono** run middleware in order, and the adapter answers everything it sees. Register it **after** your own routes and middleware, or they will never be reached.

## Development and production

`NODE_ENV` decides one thing: whether pages may be rendered from their templates.

- **Not `production`**: a route `dist/` has no file for is rendered from its template, so a server you start before building still shows every page. `dist/` still answers first, so an old build hides your template edits. Rebuild, or delete `dist/` while you work.
- **`production`**: pages come only from `dist/`, so run `htmx-ui build` first. Fragments and `site.render()` still render at request time; see [Deploying](/docs/v0.2/servers/deploying) for what that needs on the server.

## Loading htmx-ui.config.ts

The adapters read `htmx-ui.config.ts` from the working directory at startup. Bun and Deno import TypeScript directly, and so does Node from 22.18. On an older Node, name the file `htmx-ui.config.js` (or `.mjs`), or pass the config yourself: `htmxUi({ config: { routes } })`.

## Next

- [Pages & fragments](/docs/v0.2/servers/rendering): render the per-user part of a page with `site.fragment()` and `site.render()`, handle forms and errors.
- [Deploying](/docs/v0.2/servers/deploying): what to ship, cache headers, Docker and reverse proxies.
- [`createSite()` API](/docs/v0.2/servers/api): every option and method.
