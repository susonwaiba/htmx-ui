---
title: "Other JavaScript servers"
description: "Serve a built htmx-ui site from Deno.serve, node:http, h3 and Nitro, or NestJS, with createSite() or an existing adapter."
url: "/docs/v0.2/servers/other"
section: "Servers"
---

# Other JavaScript servers

Serve a built htmx-ui site from Deno.serve, node:http, h3 and Nitro, or NestJS, with createSite() or an existing adapter.

Anything that can hand over a web `Request` can call `site.handle(request)` and send back the `Response`. Anything built on `node:http` can use the [Express adapter](/docs/v0.2/servers/express), which is plain `(req, res, next)` middleware. Between the two, most JavaScript servers are covered. Below are the common ones.

## Deno

`Deno.serve` takes a function from `Request` to `Response`, which is exactly what `site.handle` is. Deno reads `htmx-ui.config.ts` and `node_modules` as they are:

```ts server.ts
import { createSite } from "htmx-ui-engine";

const site = await createSite();

Deno.serve({ port: 3000 }, (req) => {
  const { pathname } = new URL(req.url);
  if (pathname === "/api/ping") return Response.json({ ok: true });
  return site.handle(req);
});
```

```bash Terminal
htmx-ui build && NODE_ENV=production deno run -A server.ts
```

[Hono](/docs/v0.2/servers/hono) runs on Deno too, if you want a router.

## node:http

The Express adapter's middleware works on a bare Node server. Call it for the requests your code doesn't answer:

```ts server.ts
import { createServer } from "node:http";
import { htmxUi } from "htmx-ui-engine/express";

const site = htmxUi();

createServer((req, res) => {
  if (req.url === "/api/ping") {
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: true }));
  }
  site(req, res, (error) => {
    res.statusCode = 500;
    res.end(String(error));
  });
}).listen(3000);
```

The same goes for Connect and other `(req, res, next)` stacks: mount it last.

## h3 and Nitro

h3 2 handlers get a web `Request` as `event.req` and can return a `Response`. A catch-all route hands the rest to the site. h3's router prefers specific routes, so the order doesn't matter:

```ts server.ts
import { H3, serve } from "h3";
import { createSite } from "htmx-ui-engine";

const site = await createSite();
const app = new H3();

app.get("/api/ping", () => ({ ok: true }));
app.all("/**", (event) => site.handle(event.req)); // everything else is the built site

serve(app, { port: 3000 });
```

In Nitro, the same handler goes in a catch-all route, `routes/[...].ts`. Nitro 2 is built on h3 1, where `event.req` is Node's request, so convert it first: `site.handle(toWebRequest(event))`.

## NestJS

On Nest's default Express platform, the [Express adapter](/docs/v0.2/servers/express) does the serving. Don't use `app.use()` for it: Nest runs global middleware before its controllers, so the site would answer every request. When no route matches, Nest throws a `NotFoundException` with the message `Cannot <METHOD> <path>`. An exception filter can catch exactly those and hand them to the site, and leave the `NotFoundException`s your controllers throw alone:

```ts src/htmx-ui.filter.ts
import { Catch, NotFoundException, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";
import { htmxUi } from "htmx-ui-engine/express";

const site = htmxUi();

@Catch(NotFoundException)
export class HtmxUiFilter implements ExceptionFilter {
  catch(error: NotFoundException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();
    // Not "no route matched": a controller's own 404, so answer it as Nest would.
    if (error.message !== `Cannot ${req.method} ${req.originalUrl}`) {
      return res.status(404).json(error.getResponse());
    }
    site(req, res, (e) => res.status(500).end(String(e)));
  }
}
```

```ts src/main.ts
const app = await NestFactory.create(AppModule);
app.useGlobalFilters(new HtmxUiFilter());
await app.listen(3000);
```

To render fragments from controllers, create a site with `createSite()`, pass it to the filter's adapter as `htmxUi({ site })`, and return `site.fragment(...)` from handlers decorated with `@Header("Content-Type", "text/html; charset=utf-8")`.

## Anything else

What any integration needs:

- Create the site once, at startup: `const site = await createSite()`.
- Pass the requests your own code doesn't answer to `site.handle()` as a web `Request`, and send back the `Response` it resolves to: status, headers (including several `Set-Cookie`), body.
- Use `site.fragment()` and `site.render()` for HTML, with an HTML content type.

The adapters' source in `htmx-ui-engine/src/` is the reference: each is a few dozen lines. See [`createSite()` API](/docs/v0.2/servers/api) for every option.
