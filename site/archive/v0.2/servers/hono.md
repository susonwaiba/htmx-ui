---
title: "Hono"
description: "Mount a built htmx-ui site as Hono middleware, and render pages and fragments from your handlers."
url: "/docs/v0.2/servers/hono"
section: "Servers"
---

# Hono

Mount a built htmx-ui site as Hono middleware, and render pages and fragments from your handlers.

`htmx-ui-engine/hono` exports `htmxUi()`, middleware that serves the built site. It runs wherever Hono has a filesystem: Bun, Node (with `@hono/node-server`) and Deno. Edge runtimes with no filesystem, such as Cloudflare Workers, can't read `dist/`, so the adapter doesn't work there.

```bash bun
bun add htmx-ui-engine hono
```

```bash npm
npm install htmx-ui-engine hono
```

```bash pnpm
pnpm add htmx-ui-engine hono
```

```bash yarn
yarn add htmx-ui-engine hono
```

## Mount it last

Hono runs middleware in registration order, and htmx-ui answers every request it sees, with a 404 page when nothing matches. Register it **after** your own handlers:

```ts server.ts
import { Hono } from "hono";
import { htmxUi } from "htmx-ui-engine/hono";

const app = new Hono();

app.get("/api/invoices", (c) => c.json(invoices.list()));
app.post("/api/invoices", async (c) => c.json(await invoices.create(await c.req.json()), 201));

app.use(htmxUi()); // last: pages, assets, public files, the config's routes, a 404 page

export default app; // Bun and Deno serve the default export's fetch
```

Paths nothing claims get the [404 page](/docs/v0.2/servers#not-found): your `pages/404.html`, or htmx-ui's default. Because the middleware answers them, Hono's `app.notFound()` never runs.

## Fragments and pages

`c.html()` sends rendered HTML with the right content type:

```ts server.ts
import { Hono } from "hono";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/hono";

const site = await createSite();
const app = new Hono();

app.post("/api/invoices/:id/refund", (c) =>
  c.html(site.fragment("partials/invoice-row.html", { invoice: refund(c.req.param("id")) })),
);
app.get("/dashboard", (c) => c.html(site.render("/dashboard", { user: currentUser(c) })));

app.use(htmxUi({ site })); // the same site: templates compiled once

export default app;
```

See [Pages & fragments](/docs/v0.2/servers/rendering) for forms (`c.req.parseBody()`), htmx headers and error fragments.

## Options

`htmxUi(options)` takes the options of [`createSite()`](/docs/v0.2/servers/api#options): `root`, `config`, `context`, `asset`, `cache` and `site`. For example, to serve a site from another directory:

```ts server.ts
app.use(htmxUi({ root: "../marketing" }));
```

## Testing

`app.request()` answers in-process, with no port:

```ts server.test.ts
import { expect, test } from "bun:test";
import app from "./server";

test("serves the home page", async () => {
  const res = await app.request("/");
  expect(res.status).toBe(200);
});
```

## Build and run

In production the middleware serves `dist/`, so build first and set `NODE_ENV`:

```bash Terminal
htmx-ui build && NODE_ENV=production bun server.ts
```

On Node, serve the app with `@hono/node-server`'s `serve(app)`. See [Deploying](/docs/v0.2/servers/deploying) for what to ship, cache headers and Docker.
