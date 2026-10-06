---
title: "Express"
description: "Mount a built htmx-ui site as Express middleware, and render pages and fragments from your routes."
url: "/docs/v0.2/servers/express"
section: "Servers"
---

# Express

Mount a built htmx-ui site as Express middleware, and render pages and fragments from your routes.

`htmx-ui-engine/express` exports `htmxUi()`, Connect-style middleware that serves the built site. It works with Express 4 and 5, and with anything else built on `node:http`: Connect, a bare `http.createServer()`, or [NestJS](/docs/v0.2/servers/other#nestjs). Use it for a Node app that already exists. For a new one, [Elysia](/docs/v0.2/servers/elysia) or [Fastify](/docs/v0.2/servers/fastify) don't care about registration order.

```bash bun
bun add htmx-ui-engine express
```

```bash npm
npm install htmx-ui-engine express
```

```bash pnpm
pnpm add htmx-ui-engine express
```

```bash yarn
yarn add htmx-ui-engine express
```

## Mount it last

Middleware runs in order, and htmx-ui answers every request it sees, with a 404 page when nothing matches. Register it **after** your own routes and middleware, or they will never be reached:

```ts server.ts
import express from "express";
import { htmxUi } from "htmx-ui-engine/express";

const app = express();

app.get("/api/invoices", async (req, res) => {
  res.json(await db.invoices.list());
});

app.use(htmxUi()); // last: pages, assets, public files, the config's routes, a 404 page

app.listen(3000);
```

Paths nothing claims get the [404 page](/docs/v0.2/servers#not-found): your `pages/404.html`, or htmx-ui's default. An error thrown while answering goes to `next(error)`, so Express's error middleware handles it as usual.

> **Mount it at the root** The adapter matches a request's full path, prefix included. Mounted with `app.use("/blog", htmxUi())`, it looks for `dist/blog/…` and finds nothing. Mount it without a path, and build the site with its pages under `pages/blog/` if that is where they belong.

## Fragments and pages

`res.type("html").send()` sends rendered HTML with the right content type:

```ts server.ts
import express from "express";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/express";

const site = await createSite();
const app = express();
app.use(express.urlencoded({ extended: false }));

app.post("/api/invoices/:id/refund", (req, res) => {
  res.type("html").send(site.fragment("partials/invoice-row.html", { invoice: refund(req.params.id) }));
});
app.get("/dashboard", (req, res) => {
  res.type("html").send(site.render("/dashboard", { user: currentUser(req) }));
});

app.use(htmxUi({ site })); // the same site: templates compiled once
app.listen(3000);
```

Body parsers are fine before the adapter: when `express.urlencoded()` or `express.json()` has read a request body, the adapter rebuilds it for the config's `routes`. See [Pages & fragments](/docs/v0.2/servers/rendering) for forms, htmx headers and error fragments.

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
