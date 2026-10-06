// Serve an htmx-ui site from Hono (which is web-standard, so this is also how the
// other web-standard adapters work).
//
//   import { Hono } from "hono";
//   import { htmxUi } from "htmx-ui-engine/hono";
//
//   const app = new Hono();
//   app.get("/api/hello", (c) => c.html("<p>Hi</p>"));
//   app.use(htmxUi());            // last: everything else is the built site
//
// Hono runs middleware in registration order and stops at the first handler that
// answers, so registering htmx-ui last makes it the fallback. It answers everything
// it sees, with a 404 page when nothing matched. In production it serves dist/, so
// build the site first (`htmx-ui build`).

import { createSite, type SiteOptions } from "./core/site";

/** Hono's Context, structurally: htmx-ui only needs the request it carries. */
export interface Context {
  /** Hono's own request wrapper; `raw` is the web Request. */
  req?: { raw: Request };
  /** Hono used to expose the Request directly here. */
  request?: Request;
  /** Setting it is Hono's documented way to answer from middleware. */
  res?: Response;
}

type Next = () => Promise<void>;

/**
 * Hono middleware serving the built site, the config's routes and its `fetch` fallback,
 * and a 404 page for anything else. It answers every request it sees, so register it last.
 */
export function htmxUi(options: SiteOptions = {}): (c: Context, next: Next) => Promise<void> {
  const site = createSite(options);
  return async (c) => {
    c.res = await (await site).handle(c.request ?? c.req!.raw);
  };
}

export { createSite, type Site, type SiteOptions } from "./core/site";