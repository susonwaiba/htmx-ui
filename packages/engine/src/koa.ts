// Serve an htmx-ui site from Koa.
//
//   import Koa from "koa";
//   import { htmxUi } from "htmx-ui-engine/koa";
//
//   const app = new Koa();
//   app.use(htmxUi());            // anywhere: it answers after everything else
//   app.use(router.routes());
//   app.listen(3000);
//
// The middleware lets the rest of the stack run first and only answers when nothing
// did (Koa's status is still the default 404 and there is no body), so its place in
// the stack doesn't matter. Paths nothing claims get the project's 404 page, or
// htmx-ui's default. In production it serves dist/, so build the site first
// (`htmx-ui build`).

import type { IncomingMessage } from "node:http";
import { toRequest } from "./core/http";
import { createSite, type SiteOptions } from "./core/site";

/** Koa's Context, structurally: the parts of it htmx-ui reads and writes. */
export interface Context {
  req: IncomingMessage;
  /** Koa's request; its `body` is set when a body parser (@koa/bodyparser, koa-body) ran first. */
  request: object;
  status: number;
  body: unknown;
  set(field: string, value: string | string[]): void;
}

type Next = () => Promise<unknown>;

/** Koa middleware serving the built site, the config's routes and its `fetch` fallback. */
export function htmxUi(options: SiteOptions = {}): (ctx: Context, next: Next) => Promise<void> {
  const site = createSite(options);
  return async (ctx, next) => {
    await next();
    // Something downstream answered: a body, or a status it chose.
    if (ctx.body != null || ctx.status !== 404) return;
    const response = await (await site).handle(await toRequest(ctx.req, (ctx.request as { body?: unknown }).body));
    ctx.status = response.status;
    // The body first: Koa derives Content-Type and Content-Length from it, and the
    // Response's own headers (a HEAD response's length among them) win after.
    ctx.body = Buffer.from(await response.arrayBuffer());
    response.headers.forEach((value, key) => {
      if (key !== "set-cookie") ctx.set(key, value);
    });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) ctx.set("set-cookie", cookies);
  };
}

export { createSite, type Site, type SiteOptions } from "./core/site";
