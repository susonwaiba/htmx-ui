// Serve an htmx-ui site from Fastify.
//
//   import Fastify from "fastify";
//   import { htmxUi } from "htmx-ui-engine/fastify";
//
//   const app = Fastify();
//   app.get("/api/hello", async (req, reply) => reply.type("text/html").send("<p>Hi</p>"));
//   app.register(htmxUi());       // everything else is the built site
//   await app.listen({ port: 3000 });
//
// It is Fastify's not-found handler, so it only sees the paths no route of yours
// matched, whatever order they are registered in. Paths nothing claims get the
// project's 404 page, or htmx-ui's default. In production it serves dist/, so build
// the site first (`htmx-ui build`).

import type { IncomingMessage } from "node:http";
import { nodeBody, toRequest } from "./core/http";
import { createSite, type SiteOptions } from "./core/site";

/** Fastify's request, structurally: the Node request, and the body Fastify parsed off it. */
export interface Request {
  raw: IncomingMessage;
  body?: unknown;
}

/** The part of Fastify's reply this plugin uses. */
export interface Reply {
  code(status: number): Reply;
  header(name: string, value: string | string[]): Reply;
  send(payload?: unknown): Reply;
}

/**
 * The part of a Fastify instance this plugin uses. The handler's arguments are `any`
 * so Fastify's own (much richer, generic) request and reply stay assignable to it.
 */
export interface FastifyLike {
  setNotFoundHandler(handler: (request: any, reply: any) => unknown): unknown;
}

/** Fastify plugin serving the built site, the config's routes and its `fetch` fallback. */
export function htmxUi(options: SiteOptions = {}) {
  const site = createSite(options);
  const plugin = async (app: FastifyLike) => {
    app.setNotFoundHandler(async (request: Request, reply: Reply) => {
      // Fastify parses JSON and text bodies before any handler runs, which empties the
      // stream; toRequest() rebuilds the body from what it parsed.
      const response = await (await site).handle(await toRequest(request.raw, request.body));
      reply.code(response.status);
      response.headers.forEach((value, key) => {
        if (key !== "set-cookie") reply.header(key, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) reply.header("set-cookie", cookies);
      // Streamed: the dev server's reload events are a response that never ends, so it
      // also has to stop when the client goes, or Fastify waits for it on close().
      const body = nodeBody(response);
      if (!Buffer.isBuffer(body)) request.raw.once("close", () => body.destroy());
      return reply.send(body);
    });
  };
  // Fastify scopes what a plugin registers to the plugin itself, so on its own this
  // not-found handler would answer nothing. "skip-override" is the marker the
  // fastify-plugin package sets to register into the parent instead.
  return Object.assign(plugin, { [Symbol.for("skip-override")]: true });
}

export { createSite, type Site, type SiteOptions } from "./core/site";
