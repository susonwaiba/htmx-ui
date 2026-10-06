---
title: "Fastify"
description: "Serve a built htmx-ui site as Fastify's not-found handler, and render pages and fragments from your routes."
url: "/docs/v0.2/servers/fastify"
section: "Servers"
---

# Fastify

Serve a built htmx-ui site as Fastify's not-found handler, and render pages and fragments from your routes.

`htmx-ui-engine/fastify` exports `htmxUi()`, a plugin that makes htmx-ui Fastify's not-found handler. It only sees requests no route of yours matched, so it can be registered anywhere. It is tested with Fastify 5, on Node and Bun.

```bash bun
bun add htmx-ui-engine fastify
```

```bash npm
npm install htmx-ui-engine fastify
```

```bash pnpm
pnpm add htmx-ui-engine fastify
```

```bash yarn
yarn add htmx-ui-engine fastify
```

## Mount it

```ts server.ts
import Fastify from "fastify";
import { htmxUi } from "htmx-ui-engine/fastify";

const app = Fastify();

app.register(htmxUi()); // pages, assets, public files, the config's routes, a 404 page

app.get("/api/invoices", async () => db.invoices.list());
app.post("/api/invoices", async (request) => db.invoices.create(request.body));

await app.listen({ port: 3000 });
```

Paths nothing claims get the [404 page](/docs/v0.2/servers#not-found): your `pages/404.html`, or htmx-ui's default. Every method reaches the not-found handler, so the config's `routes` answer `hx-post` as well as `hx-get`.

> **One not-found handler** Fastify allows one not-found handler per instance, so the plugin conflicts with your own `setNotFoundHandler()` on the same instance, and registering it twice fails. Register it on the root instance, not inside a prefixed plugin.

## Fragments and pages

`reply.type("text/html")` sends rendered HTML with the right content type:

```ts server.ts
import Fastify from "fastify";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/fastify";

const site = await createSite();
const app = Fastify();

app.post<{ Params: { id: string } }>("/api/invoices/:id/refund", async (request, reply) =>
  reply.type("text/html").send(site.fragment("partials/invoice-row.html", { invoice: refund(request.params.id) })),
);
app.get("/dashboard", async (request, reply) =>
  reply.type("text/html").send(site.render("/dashboard", { user: currentUser(request) })),
);

app.register(htmxUi({ site })); // the same site: templates compiled once
await app.listen({ port: 3000 });
```

Fastify parses JSON bodies itself, but not HTML forms. Add `@fastify/formbody` to read `hx-post` forms in your own routes. The config's `routes` get the request body either way. See [Pages & fragments](/docs/v0.2/servers/rendering) for forms, htmx headers and error fragments.

## Options

`htmxUi(options)` takes the options of [`createSite()`](/docs/v0.2/servers/api#options): `root`, `config`, `context`, `asset`, `cache` and `site`. For example, to serve a site from another directory:

```ts server.ts
app.register(htmxUi({ root: "../marketing" }));
```

## Testing

`app.inject()` answers in-process, with no port:

```ts server.test.ts
import { expect, test } from "bun:test";
import { app } from "./server";

test("serves the home page", async () => {
  const res = await app.inject({ method: "GET", url: "/" });
  expect(res.statusCode).toBe(200);
});
```

## Build and run

In production the plugin serves `dist/`, so build first and set `NODE_ENV`:

```bash Terminal
htmx-ui build && NODE_ENV=production node server.ts
```

Node runs `server.ts` directly from 22.18. See [Deploying](/docs/v0.2/servers/deploying) for what to ship, cache headers and Docker.
