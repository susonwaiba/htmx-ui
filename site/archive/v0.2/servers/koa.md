---
title: "Koa"
description: "Serve a built htmx-ui site as Koa middleware that answers only what nothing else did, and render pages and fragments from your routes."
url: "/docs/v0.2/servers/koa"
section: "Servers"
---

# Koa

Serve a built htmx-ui site as Koa middleware that answers only what nothing else did, and render pages and fragments from your routes.

`htmx-ui-engine/koa` exports `htmxUi()`, middleware that lets the rest of your stack run first and answers only when nothing else did. Its place in the stack doesn't matter. It is tested with Koa 3, on Node and Bun.

```bash bun
bun add htmx-ui-engine koa
```

```bash npm
npm install htmx-ui-engine koa
```

```bash pnpm
pnpm add htmx-ui-engine koa
```

```bash yarn
yarn add htmx-ui-engine koa
```

## Mount it

```ts server.ts
import Koa from "koa";
import Router from "@koa/router";
import { htmxUi } from "htmx-ui-engine/koa";

const app = new Koa();
const router = new Router();

router.get("/api/invoices", async (ctx) => {
  ctx.body = await db.invoices.list();
});

app.use(htmxUi()); // pages, assets, public files, the config's routes, a 404 page
app.use(router.routes());

app.listen(3000);
```

The middleware calls `await next()` first. Afterwards, it answers only if the response still has Koa's default `404` status and no body. A route that sets a body, or a status of its own, keeps its response. Paths nothing claims get the [404 page](/docs/v0.2/servers#not-found): your `pages/404.html`, or htmx-ui's default.

## Fragments and pages

Set `ctx.type = "html"` and put the rendered HTML in `ctx.body`:

```ts server.ts
import Koa from "koa";
import Router from "@koa/router";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/koa";

const site = await createSite();
const app = new Koa();
const router = new Router();

router.post("/api/invoices/:id/refund", (ctx) => {
  ctx.type = "html";
  ctx.body = site.fragment("partials/invoice-row.html", { invoice: refund(ctx.params.id) });
});
router.get("/dashboard", (ctx) => {
  ctx.type = "html";
  ctx.body = site.render("/dashboard", { user: currentUser(ctx) });
});

app.use(htmxUi({ site })); // the same site: templates compiled once
app.use(router.routes());
app.listen(3000);
```

A body parser such as `@koa/bodyparser` works alongside it: the adapter rebuilds the body it read for the config's `routes`. Errors thrown in the adapter propagate like any other, so a `try` / `catch` middleware at the top of the stack sees them. See [Pages & fragments](/docs/v0.2/servers/rendering) for forms, htmx headers and error fragments.

## Options

`htmxUi(options)` takes the options of [`createSite()`](/docs/v0.2/servers/api#options): `root`, `config`, `context`, `asset`, `cache` and `site`. For example, to serve a site from another directory:

```ts server.ts
app.use(htmxUi({ root: "../marketing" }));
```

## Testing

Listen on port 0 to get a free port, and close the server when the test ends:

```ts server.test.ts
import { expect, test } from "bun:test";
import { app } from "./server";

test("serves the home page", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const { port } = server.address() as { port: number };
    const res = await fetch(`http://localhost:${port}/`);
    expect(res.status).toBe(200);
  } finally {
    server.close();
  }
});
```

## Build and run

In production the middleware serves `dist/`, so build first and set `NODE_ENV`:

```bash Terminal
htmx-ui build && NODE_ENV=production node server.ts
```

Node runs `server.ts` directly from 22.18. See [Deploying](/docs/v0.2/servers/deploying) for what to ship, cache headers and Docker.
