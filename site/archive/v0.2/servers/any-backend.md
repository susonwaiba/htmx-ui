---
title: "Django, Rails, Go and others"
description: "Use htmx-ui with a backend in any language: serve the built site as static files and render fragments with your own templates, or run htmx-ui next to it."
url: "/docs/v0.2/servers/any-backend"
section: "Servers"
---

# Django, Rails, Go and others

Use htmx-ui with a backend in any language: serve the built site as static files and render fragments with your own templates, or run htmx-ui next to it.

htmx works with any server that returns HTML, and many htmx apps are written in Python, Ruby, PHP, Go or Elixir. The adapters are JavaScript, but your backend doesn't have to be. There are two ways to combine them. Pick one by asking who renders the per-request HTML.

## Your backend renders the fragments

Build the site with `htmx-ui build` as part of your release, and serve `dist/` as static files. htmx in those pages calls your backend, and your backend answers with fragments written in its own templates, using htmx-ui's classes. The components are CSS classes plus small behaviours that initialise on every swap, so markup from Django, ERB, Blade or Go's `html/template` works the same as markup from Nunjucks.

```html templates/invoices/_row.html (Django)
<tr id="invoice-{{ invoice.id }}">
  <td>{{ invoice.number }}</td>
  <td><span class="badge badge-success">{{ invoice.status }}</span></td>
  <td>
    <button class="btn btn-sm btn-outline" hx-post="/api/invoices/{{ invoice.id }}/refund"
            hx-target="#invoice-{{ invoice.id }}" hx-swap="outerHTML">Refund</button>
  </td>
</tr>
```

Copy the markup for each component from its page in these docs. The classes are the API, and they are the same in any template language.

The front server (nginx here) serves the pages with clean URLs and passes the API to your backend:

```nginx nginx.conf
server {
  listen 80;
  root /srv/site/dist;

  # Your backend: Django, Rails, Laravel, Go...
  location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
  }

  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  # /about -> about.html, /docs -> docs/index.html
  location / {
    try_files $uri $uri.html $uri/index.html =404;
  }

  error_page 404 /404.html;
}
```

```txt Caddyfile
example.com {
  root * /srv/site/dist
  encode gzip

  handle /api/* {
    reverse_proxy 127.0.0.1:8000
  }
  handle {
    try_files {path} {path}.html {path}/index.html
    file_server
  }
  handle_errors 404 {
    rewrite * /404.html
    file_server
  }
}
```

Your framework's static file serving works as well as nginx, as long as it maps `/about` to `about.html`. `dist/404.html` is your `pages/404.html`, or htmx-ui's default.

> **Nunjucks is close to Jinja, not the same** Nunjucks borrows Jinja's syntax, so Django and Flask templates read alike, and moving a partial between them is mostly mechanical. But filters, tests and macro `caller()` differ, and htmx-ui's `json()`, `svg()`, `icon()` and `asset()` exist only in the engine. Treat the two as separate template sets.

## htmx-ui renders, next to your backend

To keep one set of templates, run a small htmx-ui server (any [adapter](/docs/v0.2/servers)) next to your backend. It serves the pages and renders the fragments. Your backend stays the source of the data, which the htmx-ui server reads over HTTP, as JSON:

```ts server.ts
import { Elysia } from "elysia";
import { createSite } from "htmx-ui-engine";
import { htmxUi } from "htmx-ui-engine/elysia";

const site = await createSite();
const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";
const html = (body: string) => new Response(body, { headers: { "Content-Type": "text/html; charset=utf-8" } });

new Elysia()
  .get("/invoices/table", async ({ request }) => {
    // Pass the session cookie along, so the backend knows who is asking.
    const res = await fetch(`${backend}/api/invoices`, { headers: { cookie: request.headers.get("cookie") ?? "" } });
    return html(site.fragment("partials/invoice-table.html", { invoices: await res.json() }));
  })
  .use(htmxUi({ site }))
  .listen(3000);
```

Put both behind one host, with the proxy sending `/api/` to your backend and everything else to the htmx-ui server. Pages and API then share an origin, cookies and all. This adds a process to deploy. In exchange, every piece of HTML comes from one place.

## Which one?

- **Your backend renders the fragments** when most of the HTML is per-request and your team already writes it in your backend's templates. htmx-ui provides the pages, the design system and the components.
- **htmx-ui renders next to your backend** when the front end is its own project, or the backend is meant to stay a JSON API.

Either way, [mock endpoints](/docs/v0.2/servers/deploying#mock-routes) in `htmx-ui.config.ts` let you build the pages before the backend has the routes.
