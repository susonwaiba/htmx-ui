---
title: "Deploying"
description: "Ship an htmx-ui site with your server: what to copy, NODE_ENV, keeping mock routes out of production, cache headers, Docker and reverse proxies."
url: "/docs/v0.2/servers/deploying"
section: "Servers"
---

# Deploying

Ship an htmx-ui site with your server: what to copy, NODE_ENV, keeping mock routes out of production, cache headers, Docker and reverse proxies.

The adapters serve files, so deploying is whatever your server already does: build during the release, then run the server with `NODE_ENV=production`. The one real decision is which routes your server answers. That decides what you have to ship next to `dist/`.

## Three shapes

### 1. Static only

Every page is the same for everyone and htmx talks to an API on another host. Run `htmx-ui build` and put `dist/` on a static host, a CDN or an object store. You need no server and no adapter. The config's `routes` and `fetch` are not part of the build, so a static host never answers them. `dist/404.html` is your 404 page, or htmx-ui's default.

### 2. Static pages, dynamic fragments

The usual shape. Pages come from `dist/`, and your server renders the per-visitor parts as [fragments](/docs/v0.2/servers/rendering#per-user). A fragment is a template rendered at request time, so the server needs the **Nunjucks templates** as well as `dist/`. `htmx-ui build` doesn't copy them: it writes built pages and hashed assets, nothing else.

The simplest deployment ships the project as it is, source and `dist/` together, and needs no configuration: the defaults already point at `pages/` and the project root. To ship less, copy the template directories into the deployment and point the config at the copy:

```bash Terminal
htmx-ui build
mkdir -p dist/_templates
cp -r layouts partials pages data dist/_templates/
```

Copy every directory a template reaches at render time: `macros/` and `components/` too if your templates import from them, and whatever `json()` and `svg()` read.

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";

export default defineConfig({
  // This deployment renders templates at runtime: check at startup that they arrived.
  render: true,
  // "." stays the project root; the copy is searched second.
  roots: [".", "dist/_templates"],
  pages: "dist/_templates/pages",
});
```

With `render: true`, a packaging mistake stops the server at startup instead of causing a 500 later. `createSite()` checks the template roots and the pages directory, and if they are missing the error says what to copy. Without it, a deployment that forgot its templates starts normally and fails on the first htmx request.

### 3. Everything from your server

Your server renders each page per request with `site.render()`. This is shape 2 plus your own page routes. Ship the templates, set `render`, and register a route for each page you render, since a route you don't register is still served from `dist/`. Caching is then up to you: a page rendered per visitor must not be cached as if it were the same for everyone.

```ts server.ts (Elysia)
app.get("/dashboard", ({ request }) => html(site.render("/dashboard", { user: currentUser(request) })));
```

## NODE_ENV=production

Outside production, the adapter renders a page from its template whenever `dist/` has no file for that route (see [Development and production](/docs/v0.2/servers#dev-prod)). That is convenient on your machine and wrong in production, so set `NODE_ENV=production` wherever the server runs. With it set, pages come only from the build, and a missing page gets your 404 page.

## Keep mock routes out of production

The config's `routes` are mock endpoints for `htmx-ui dev`, but the adapters serve them too, ahead of `dist/`. Where your server has the real endpoints, a mock on the same path would never be reached. On a path your server doesn't have, a mock would answer in production. Leave them out when it is not development:

```ts htmx-ui.config.ts
import { defineConfig } from "htmx-ui-engine";
import { mocks } from "./mocks";

export default defineConfig({
  routes: process.env.NODE_ENV === "production" ? {} : mocks,
});
```

## Cache headers and compression

The adapters set content types and nothing else. The usual split: hashed files in `dist/assets/` can be cached forever, because a new build gives them new names. HTML should be revalidated on every visit, so a deploy shows up at once. Add the header around the adapter:

```ts Elysia
const cacheControl = (path: string) =>
  path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache";

new Elysia()
  .onAfterHandle(({ request, response }) => {
    if (response instanceof Response) response.headers.set("Cache-Control", cacheControl(new URL(request.url).pathname));
  })
  .use(htmxUi())
  .listen(3000);
```

```ts Fastify
const cacheControl = (path: string) =>
  path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache";

app.addHook("onSend", async (request, reply) => {
  reply.header("Cache-Control", cacheControl(request.url.split("?")[0]!));
});
app.register(htmxUi());
// compression: @fastify/compress
```

```ts Koa
const cacheControl = (path: string) =>
  path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache";

app.use(async (ctx, next) => {
  await next();
  ctx.set("Cache-Control", cacheControl(ctx.path));
});
app.use(htmxUi());
// compression: koa-compress
```

```ts Express
const cacheControl = (path: string) =>
  path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache";

app.use(compression()); // the compression package
app.use((req, res, next) => {
  res.setHeader("Cache-Control", cacheControl(req.path));
  next();
});
// ...your routes
app.use(htmxUi());
```

```ts Hono
import { compress } from "hono/compress";

const cacheControl = (path: string) =>
  path.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache";

app.use(compress());
app.use(async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", cacheControl(c.req.path));
});
// ...your routes
app.use(htmxUi());
```

These set the header on every response, including your API's. Narrow the check if your API sets its own. A CDN or a reverse proxy in front of the server can do both jobs instead (see [below](#reverse-proxy)).

## Docker

Build in one stage and run in another, with production dependencies only. The engine is a regular dependency, so it is installed in the run stage:

```docker Dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --from=build /app/dist ./dist
COPY htmx-ui.config.ts server.ts ./
# Shapes 2 and 3: the templates the server renders from.
COPY layouts ./layouts
COPY partials ./partials
COPY pages ./pages
COPY data ./data
EXPOSE 3000
CMD ["bun", "server.ts"]
```

On Node, start from `node:22` (22.18 or later runs `server.ts` directly), use `npm ci` and `npm ci --omit=dev`, and `CMD ["node", "server.ts"]`. The build stage needs the dev dependencies (Tailwind, and Vite on Node); the run stage doesn't.

## Behind a reverse proxy

nginx or Caddy in front of the server can serve `dist/assets/` straight from disk, add cache headers and compression, and pass everything else to your process:

```nginx nginx.conf
server {
  listen 80;
  root /srv/app/dist;

  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
  }

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  gzip on;
  gzip_types text/css text/javascript application/javascript application/json image/svg+xml;
}
```

To skip the Node or Bun process entirely, with nginx serving the pages and your backend answering htmx, see [Django, Rails, Go and others](/docs/v0.2/servers/any-backend).

## Checklist

- `htmx-ui-engine` and your framework are in `dependencies`, not `devDependencies`.
- `htmx-ui build` runs during the release, before the server starts.
- `NODE_ENV=production` is set where the server runs.
- The templates are deployed when the server renders fragments or pages, and `render: true` is set.
- Mock `routes` are off in production.
- A `pages/404.html` if you want your own 404 page.
- Cache headers: forever for `/assets/`, revalidate for HTML.
