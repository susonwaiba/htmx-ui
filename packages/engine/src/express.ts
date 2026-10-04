// Serve an htmx-ui site from Express (or anything else built on node:http, like
// Connect, Fastify's raw middleware or a plain http server).
//
//   import express from "express";
//   import { htmxUi } from "htmx-ui-engine/express";
//
//   const app = express();
//   app.get("/api/hello", (req, res) => res.send("<p>Hi</p>"));
//   app.use(htmxUi());            // last: everything else is the built site
//   app.listen(3000);
//
// Mount it after your own routes, so it only sees the paths they don't. Build the
// site first (`htmx-ui build`); it serves dist/, not the templates.

import type { IncomingMessage, ServerResponse } from "node:http";
import { send, toRequest } from "./core/http";
import { createSite, type SiteOptions } from "./core/site";

/** Connect-style middleware. Assignable to Express's RequestHandler. */
export type Middleware = (req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => void | Promise<void>;

/** Middleware serving the built site, the config's routes and its `fetch` fallback. */
export function htmxUi(options: SiteOptions = {}): Middleware {
  const site = createSite(options);
  return async (req, res, next) => {
    try {
      const response = await (await site).handle(await toRequest(req));
      if (!response) return next();
      await send(res, response);
    } catch (error) {
      next(error);
    }
  };
}

export { createSite, type Site, type SiteOptions } from "./core/site";