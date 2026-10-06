---
title: "Elysia"
description: "Mount a built htmx-ui site as an Elysia plugin (the recommended adapter), and render pages and fragments from your handlers."
url: "/docs/v0.2/servers/elysia"
section: "Servers"
---

# Elysia

Mount a built htmx-ui site as an Elysia plugin (the recommended adapter), and render pages and fragments from your handlers.

`htmx-ui-engine/elysia` exports `htmxUi()`, a plugin that answers the paths your own routes don't. Start with this adapter: Elysia always prefers a specific route over the plugin's catch-all, so the order you register things in never matters. It runs on Bun and on Node.

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

## Mount it

```ts server.ts
import { Elysia } from "elysia";
import { htmxUi } from "htmx-ui-engine/elysia";

new Elysia()
  .get("/api/invoices", () => db.invoices.list())
  .post("/api/invoices", ({ body }) => db.invoices.create(body))
  .use(htmxUi()) // pages, assets, public files, the config's routes, a 404 page
  .listen(3000);
```

The plugin returns the instance it was given, so `.use(htmxUi()).listen(3000)` chains as usual. It handles every method, so the config's `routes` answer `hx-post` as well as `hx-get`. Paths nothing claims get the [404 page](/docs/v0.2/servers#not-found): your `pages/404.html`, or htmx-ui's default. Because the catch-all answers them, Elysia's own `NOT_FOUND` error never fires.

## Fragments and pages

Elysia sends a returned string as `text/plain`, so wrap rendered HTML in a `Response`. A small helper keeps routes short:

```ts server.ts
import { Elysia } from "elysia";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/elysia";

const site = await createSite();
const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

new Elysia()
  .post("/api/invoices/:id/refund", ({ params }) =>
    html(site.fragment("partials/invoice-row.html", { invoice: refund(params.id) })),
  )
  .get("/dashboard", ({ request }) => html(site.render("/dashboard", { user: currentUser(request) })))
  .use(htmxUi({ site })) // the same site: templates compiled once
  .listen(3000);
```

[Pages & fragments](/docs/v0.2/servers/rendering) covers when to use which, forms, htmx headers and error fragments.

## Options

`htmxUi(options)` takes the options of [`createSite()`](/docs/v0.2/servers/api#options): `root`, `config`, `context`, `asset`, `cache` and `site`. For example, to serve a site from another directory:

```ts server.ts
new Elysia().use(htmxUi({ root: "../marketing" })).listen(3000);
```

## Testing

`app.handle()` answers a `Request` in-process, with no port:

```ts server.test.ts
import { expect, test } from "bun:test";
import { app } from "./server";

test("serves the home page", async () => {
  const res = await app.handle(new Request("http://localhost/"));
  expect(res.status).toBe(200);
  expect(res.headers.get("Content-Type")).toContain("text/html");
});
```

## Build and run

In production the plugin serves `dist/`, so build first and set `NODE_ENV`:

```bash Terminal
htmx-ui build && NODE_ENV=production bun server.ts
```

See [Deploying](/docs/v0.2/servers/deploying) for what to ship, cache headers and Docker.
