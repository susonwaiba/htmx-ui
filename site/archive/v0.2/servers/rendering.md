---
title: "Pages & fragments"
description: "Render the per-user part of a page as an htmx fragment from your server, render whole pages per request, and handle forms, htmx headers and errors."
url: "/docs/v0.2/servers/rendering"
section: "Servers"
---

# Pages & fragments

Render the per-user part of a page as an htmx fragment from your server, render whole pages per request, and handle forms, htmx headers and errors.

A page in `pages/` is rendered once, by `htmx-ui build`, and served as a file. Every visitor gets the same bytes, which any cache can keep. Anything that depends on _who is asking_ can't be in that file. It belongs in a **fragment**: a small piece of HTML your server renders per request, and htmx swaps into the page.

Fragments are templates, like pages, so they use the same macros, components and data. Create one site and use it both to render fragments and to serve the build:

```ts Elysia
import { Elysia } from "elysia";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/elysia";

const site = await createSite();
const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

const app = new Elysia()
  // your routes, returning html(site.fragment(...))
  .use(htmxUi({ site }))
  .listen(3000);
```

```ts Fastify
import Fastify from "fastify";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/fastify";

const site = await createSite();
const app = Fastify();
// your routes, replying with reply.type("text/html").send(site.fragment(...))
app.register(htmxUi({ site }));
await app.listen({ port: 3000 });
```

```ts Koa
import Koa from "koa";
import Router from "@koa/router";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/koa";

const site = await createSite();
const app = new Koa();
const router = new Router();
// your routes, setting ctx.type = "html" and ctx.body = site.fragment(...)
app.use(htmxUi({ site }));
app.use(router.routes());
app.listen(3000);
```

```ts Express
import express from "express";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/express";

const site = await createSite();
const app = express();
// your routes, sending res.type("html").send(site.fragment(...))
app.use(htmxUi({ site })); // last
app.listen(3000);
```

```ts Hono
import { Hono } from "hono";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/hono";

const site = await createSite();
const app = new Hono();
// your routes, returning c.html(site.fragment(...))
app.use(htmxUi({ site })); // last

export default app;
```

`htmxUi({ site })` serves that same instance, so its templates are read and compiled once. Without `site`, the adapter creates a second site.

## When the HTML depends on who is asking

At build time there is no request, so there is no user. Here is the piece that usually needs one: a sign-in link for a visitor, a name and a sign-out button for a member.

```jinja partials/user-menu.html
{% if user %}
  <span class="text-sm">{{ user.name }}</span>
  <form method="post" action="/logout"><button class="btn btn-sm">Sign out</button></form>
{% else %}
  <a class="btn btn-sm" href="/login">Sign in</a>
{% endif %}
```

The built page keeps a placeholder where the menu goes and asks for it as soon as it loads. Without `hx-trigger="load"`, a `<div>` only sends its request when clicked:

```html layouts/base.html
<div hx-get="/api/user-menu" hx-trigger="load" hx-swap="outerHTML">
  <a class="btn btn-sm" href="/login">Sign in</a>
</div>
```

Your server renders the partial for the current request:

```ts Elysia
app.get("/api/user-menu", ({ request }) =>
  html(site.fragment("partials/user-menu.html", { user: currentUser(request) })),
);
```

```ts Fastify
app.get("/api/user-menu", async (request, reply) =>
  reply.type("text/html").send(site.fragment("partials/user-menu.html", { user: currentUser(request) })),
);
```

```ts Koa
router.get("/api/user-menu", (ctx) => {
  ctx.type = "html";
  ctx.body = site.fragment("partials/user-menu.html", { user: currentUser(ctx) });
});
```

```ts Express
app.get("/api/user-menu", (req, res) => {
  res.type("html").send(site.fragment("partials/user-menu.html", { user: currentUser(req) }));
});
```

```ts Hono
app.get("/api/user-menu", (c) => c.html(site.fragment("partials/user-menu.html", { user: currentUser(c) })));
```

The page stays a static file anyone can cache, the fragment is small, and the markup lives in one template. Use this pattern for a header, a nav, a sidebar, or any list of the visitor's own rows.

> **Only the render needs the user** Your framework's middleware sees the request first, so `currentUser()` can use a cookie, a session or a token, whatever you already have. Templates get the user as a context value. They never read the request themselves.

## Fragments

`site.fragment(path, context)` renders any template (a partial, a macro wrapper, a whole page you want in a modal) with the config's globals plus `context`. It adds no document shell and doesn't run the config's `transform()`. It returns a string, so send it with an HTML content type. Elysia, for one, sends a bare string as `text/plain`.

```jinja partials/invoice-row.html
<tr id="invoice-{{ invoice.id }}">
  <td>{{ invoice.number }}</td>
  <td>{{ invoice.total }}</td>
  <td>
    <button class="btn btn-sm" hx-post="/api/invoices/{{ invoice.id }}/refund" hx-target="#invoice-{{ invoice.id }}" hx-swap="outerHTML">
      Refund
    </button>
  </td>
</tr>
```

```ts Elysia
app.post("/api/invoices/:id/refund", ({ params }) => {
  const invoice = refund(params.id);
  return html(site.fragment("partials/invoice-row.html", { invoice }));
});
```

```ts Fastify
app.post<{ Params: { id: string } }>("/api/invoices/:id/refund", async (request, reply) => {
  const invoice = refund(request.params.id);
  return reply.type("text/html").send(site.fragment("partials/invoice-row.html", { invoice }));
});
```

```ts Koa
router.post("/api/invoices/:id/refund", (ctx) => {
  const invoice = refund(ctx.params.id);
  ctx.type = "html";
  ctx.body = site.fragment("partials/invoice-row.html", { invoice });
});
```

```ts Express
app.post("/api/invoices/:id/refund", (req, res) => {
  const invoice = refund(req.params.id);
  res.type("html").send(site.fragment("partials/invoice-row.html", { invoice }));
});
```

```ts Hono
app.post("/api/invoices/:id/refund", (c) => {
  const invoice = refund(c.req.param("id"));
  return c.html(site.fragment("partials/invoice-row.html", { invoice }));
});
```

## Render a page per request

`site.render(url, context)` renders the page at a route, with its layout and the config's `transform()`, just as the build does but with your context added. Use it when most of the page depends on the request. When only a corner does, a static page plus a [fragment](#per-user) is cheaper and caches better.

```ts server.ts (Elysia)
app.get("/dashboard", ({ request }) => html(site.render("/dashboard", { user: currentUser(request) })));
```

Register the route yourself: a page in `dist/` is only served when no route of yours claims the path. `render()` throws for a route with no page. Pass values in the context, not in config globals, so one visitor's data never reaches another's render.

## One route, fragment or page

htmx marks its requests with `HX-Request: true`. A route can use that to answer htmx with a fragment and a direct visit (a bookmark, a reload, a link opened in a new tab) with the whole page:

```ts server.ts (Elysia)
app.get("/invoices", ({ request }) => {
  const invoices = listInvoices(new URL(request.url).searchParams);
  return request.headers.get("HX-Request")
    ? html(site.fragment("partials/invoice-table.html", { invoices }))
    : html(site.render("/invoices", { invoices }));
});
```

If you also cache that route, send `Vary: HX-Request`, so the fragment and the page are cached separately. Response headers steer htmx from the server:

| Header | Effect |
| --- | --- |
| `HX-Redirect` | Full navigation to a URL, e.g. after sign-in. |
| `HX-Refresh` | `true` reloads the page. |
| `HX-Trigger` | Fires events on the client, e.g. to refresh a list elsewhere on the page. |
| `HX-Retarget`, `HX-Reswap` | Swap somewhere else, or another way, than the element asked for. |
| `HX-Push-Url`, `HX-Replace-Url` | Update the address bar. |

## Forms

A form with `hx-post` sends its fields as `application/x-www-form-urlencoded`, the same as without htmx. Read them however your framework does: a body parser, `request.formData()`, `c.req.parseBody()`. Answer with the fragment to swap in. When validation fails, re-render the form with its errors and a `422`. htmx 4 swaps error responses too, so the errors appear where the form was:

```jinja partials/invite-form.html
<form hx-post="/api/invites" hx-swap="outerHTML" class="space-y-4">
  <div class="field">
    <label class="field-label" for="email">Email</label>
    <input class="input" id="email" name="email" type="email" value="{{ values.email }}" required
      {% if errors.email %}aria-invalid="true" aria-describedby="email-error"{% endif %}>
    {% if errors.email %}<div class="field-error" id="email-error">{{ errors.email }}</div>{% endif %}
  </div>
  <button class="btn btn-primary">Send invite</button>
</form>
```

```ts server.ts (Elysia)
app.post("/api/invites", async ({ request }) => {
  const values = Object.fromEntries(await request.formData());
  const errors = validateInvite(values);
  if (errors) return html(site.fragment("partials/invite-form.html", { values, errors }), 422);
  await sendInvite(values.email);
  return html(site.fragment("partials/invite-sent.html", { email: values.email }));
});
```

The config's `routes` take a web `Request`, so they call `request.formData()` on every adapter. When a body parser (`express.urlencoded()`, Fastify's JSON parser, `@koa/bodyparser`) has already read the body, the adapter rebuilds it from what was parsed.

## Errors

`render()` and `fragment()` throw when a template is missing or fails to render. The error reaches your framework's error handling like any other: Express's error middleware (the adapter calls `next(error)`), a `try`/`catch` middleware in Koa, Fastify's `setErrorHandler()`, Elysia's `onError` and Hono's `app.onError`. To answer htmx with something it can swap, render an error fragment there:

```ts server.ts (Elysia)
app.onError(({ error, request }) => {
  console.error(error);
  if (request.headers.get("HX-Request")) {
    return html(site.fragment("partials/error.html", { message: "Something went wrong. Try again." }), 500);
  }
});
```

Set `debug: ["render"]` in `htmx-ui.config.ts` to log every render with its duration; see [Debugging](/docs/v0.2/engine#debug).

## Asset URLs in fragments

A fragment rarely needs a URL. `svg()` and the `icon()` macro inline their markup, so there is no file to fetch. When one does link a project file, `asset()` returns a path from the project root (`/images/logo.png`), which your server only serves if that file is in `dist/`. Put it in `public/`, which the build copies as-is, or map URLs yourself with [`options.asset`](/docs/v0.2/servers/api#options). Built pages already carry hashed URLs, so this only affects `render()` and `fragment()`.
