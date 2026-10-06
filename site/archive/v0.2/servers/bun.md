---
title: "Bun.serve"
description: "Serve a built htmx-ui site from Bun.serve with no framework: your routes in routes, the site in fetch."
url: "/docs/v0.2/servers/bun"
section: "Servers"
---

# Bun.serve

Serve a built htmx-ui site from Bun.serve with no framework: your routes in routes, the site in fetch.

Bun's own server needs no adapter. `Bun.serve` checks its `routes` first and calls `fetch` for everything else, and `site.handle()` takes a `Request` and returns a `Response`. So your routes go in `routes` and the site goes in `fetch`. There is nothing to install beyond `htmx-ui-engine`.

## Serve it

```ts server.ts
import { createSite } from "htmx-ui-engine";

const site = await createSite();

const server = Bun.serve({
  port: 3000,
  routes: {
    "/api/invoices": {
      GET: async () => Response.json(await db.invoices.list()),
      POST: async (req) => Response.json(await db.invoices.create(await req.json()), { status: 201 }),
    },
  },
  // Pages, assets, public files, the config's routes, a 404 page.
  fetch: (req) => site.handle(req),
});

console.log(`Listening on ${server.url}`);
```

`routes` always beat `fetch`, so the order of the two keys doesn't matter. Paths nothing claims get the [404 page](/docs/v0.2/servers#not-found): your `pages/404.html`, or htmx-ui's default.

## Fragments and pages

```ts server.ts
import { createSite } from "htmx-ui-engine";

const site = await createSite();
const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

Bun.serve({
  port: 3000,
  routes: {
    "/api/invoices/:id/refund": {
      POST: (req) => html(site.fragment("partials/invoice-row.html", { invoice: refund(req.params.id) })),
    },
    "/dashboard": (req) => html(site.render("/dashboard", { user: currentUser(req) })),
  },
  fetch: (req) => site.handle(req),
});
```

See [Pages & fragments](/docs/v0.2/servers/rendering) for forms (`await req.formData()`), htmx headers and error fragments. Bun.serve's `error(error)` option is the place for an error fragment.

## Testing

`site.handle()` is a function from `Request` to `Response`, so a test can call it directly. Start the server on port 0 to test your routes too:

```ts server.test.ts
import { expect, test } from "bun:test";
import { createSite } from "htmx-ui-engine";

test("serves the home page", async () => {
  const site = await createSite();
  const res = await site.handle(new Request("http://localhost/"));
  expect(res.status).toBe(200);
});
```

## Build and run

```bash Terminal
htmx-ui build && NODE_ENV=production bun server.ts
```

See [Deploying](/docs/v0.2/servers/deploying) for what to ship, cache headers and Docker. For a framework on top of Bun, [Elysia](/docs/v0.2/servers/elysia) is the closest fit.
