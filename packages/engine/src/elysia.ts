// Serve an htmx-ui site from Elysia.
//
//   import { Elysia } from "elysia";
//   import { htmxUi } from "htmx-ui-engine/elysia";
//
//   const app = new Elysia()
//     .get("/api/hello", () => "<p>Hi</p>")
//     .use(htmxUi())              // everything else is the built site
//     .listen(3000);
//
// Elysia's router prefers static and parameter paths over wildcards, so your own
// routes win over the catch-all htmx-ui registers. Build the site first
// (`htmx-ui build`); it serves dist/, not the templates.

import { createSite, type SiteOptions } from "./core/site";

/** Elysia's Context, structurally: htmx-ui only needs the request it carries. */
export interface Context {
  request: Request;
}

/**
 * The part of an Elysia instance this plugin uses. The handler's context is `any`
 * so Elysia's own (much richer, generic) Context stays assignable to it.
 */
export interface ElysiaLike {
  all(path: string, handler: (ctx: any) => unknown): unknown;
}

/** Elysia plugin serving the built site, the config's routes and its `fetch` fallback. */
export function htmxUi(options: SiteOptions = {}) {
  const site = createSite(options);
  // Generic, so the plugin returns the instance it was given and callers can keep
  // chaining: new Elysia().use(htmxUi()).listen(3000).
  return <T extends ElysiaLike>(app: T): T => {
    // all("*"), not get("*"): the config's routes answer hx-post too. Head requests
    // are left to Elysia, which strips their bodies.
    app.all("*", async (ctx: Context) => {
      return (await (await site).handle(ctx.request)) ?? new Response("Not found", { status: 404 });
    });
    return app;
  };
}

export { createSite, type Site, type SiteOptions } from "./core/site";