// The server adapters, against the real frameworks. Each one mounts the same built
// site and must answer a page, a config route and a 404 while its own routes win.
// Servers are started inside their tests: a server left listening at module scope
// outlives the test that owns it.
import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Elysia } from "elysia";
import express, { type RequestHandler } from "express";
import Fastify, { type FastifyPluginAsync } from "fastify";
import { Hono } from "hono";
import Koa, { type Middleware } from "koa";
import { htmxUi as elysiaUi } from "./elysia";
import { htmxUi as expressUi } from "./express";
import { htmxUi as fastifyUi } from "./fastify";
import { htmxUi as honoUi } from "./hono";
import { htmxUi as koaUi } from "./koa";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-server-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const root = await fixture({
  "htmx-ui.config.ts": `export default {
    ui: false,
    routes: {
      "/api/site": () => new Response("from the config"),
      "/api/echo": async (req) => new Response(req.headers.get("content-type") + " " + (await req.text())),
      // Never ends, like the dev server's reload events.
      "/api/stream": () => new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode("first")); } })),
    },
  };`,
  "pages/index.html": "<h1>home</h1>",
  "pages/docs/setup.html": "<p>setup</p>",
  "dist/index.html": "<h1>built home</h1>",
  "dist/docs/setup.html": "<p>built setup</p>",
  "dist/404.html": "<h1>nope</h1>",
});

/** The global fetch is happy-dom's, so ask a listening server with node:http instead. */
type Page = { status: number; type: string | undefined; body: string };

const get = (port: number, path: string, method = "GET", type?: string, body?: string): Promise<Page> =>
  new Promise((resolve, reject) => {
    const headers = type ? { "content-type": type } : {};
    request({ host: "localhost", port, path, method, headers, agent: false }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode!, type: res.headers["content-type"], body }));
    })
      .on("error", reject)
      .end(body);
  });

const post = (port: number, path: string, type: string, body: string) => get(port, path, "POST", type, body);

/** The first chunk of a response that may never end, then hang up. */
const firstChunk = (port: number, path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const req = request({ host: "localhost", port, path, agent: false }, (res) => {
      res.setEncoding("utf8");
      res.once("data", (chunk: string) => {
        resolve(chunk);
        req.destroy();
      });
    }).on("error", reject);
    req.end();
  });

/** What every adapter must do, given a way to ask its server for a path. */
async function behaves(get: (path: string) => Promise<Page>, own: string, first?: (path: string) => Promise<string>) {
  expect(await get("/")).toMatchObject({ status: 200, body: "<h1>built home</h1>", type: expect.stringContaining("text/html") });
  expect((await get("/docs/setup")).body).toBe("<p>built setup</p>");
  expect((await get("/api/site")).body).toBe("from the config");
  expect(await get("/api/own")).toMatchObject({ status: 200, body: own });
  expect(await get("/missing")).toMatchObject({ status: 404, body: "<h1>nope</h1>" });
  // Streamed, not read whole first: a response that never ends still arrives.
  if (first) expect(await first("/api/stream")).toBe("first");
}

describe("elysia", () => {
  test("serves the built site, the config's routes and the built 404", async () => {
    // Elysia's router is built when the server starts; app.handle() on an
    // uncompiled instance does not rank static routes above the plugin's wildcard,
    // so ask a real server, like the other two adapters.
    const app = new Elysia()
      .get("/api/own", () => "from elysia")
      .get("/api/other", () => "other")
      .post("/api/own", () => "posted")
      .use(elysiaUi({ root }))
      .listen(0);
    try {
      const port = (app.server as { port: number }).port;
      await behaves((path) => get(port, path), "from elysia", (path) => firstChunk(port, path));
      expect((await get(port, "/api/other")).body).toBe("other");
      const posted = await new Promise<Page>((resolve, reject) => {
        request({ host: "localhost", port, path: "/api/own", method: "POST", agent: false }, (res) => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve({ status: res.statusCode!, type: undefined, body }));
        })
          .on("error", reject)
          .end();
      });
      expect(posted.body).toBe("posted");
    } finally {
      app.stop();
    }
  });
});

describe("express", () => {
  // The adapters are written without importing their frameworks, so this is the only
  // thing that checks they still fit: Express's own handler type must accept ours.
  const asExpressMiddleware: RequestHandler = expressUi();
  expect(typeof asExpressMiddleware).toBe("function");

  test("serves the built site, the config's routes and the built 404", async () => {
    const app = express();
    app.get("/api/own", (_req, res) => void res.send("from express"));
    app.use(expressUi({ root }));
    const server = app.listen(0);
    try {
      await new Promise((r) => server.once("listening", r));
      const port = (server.address() as { port: number }).port;
      await behaves((path) => get(port, path), "from express", (path) => firstChunk(port, path));
    } finally {
      server.close();
    }
  });
});

describe("fastify", () => {
  // Fastify's own plugin type must accept ours, without the adapter importing Fastify.
  const asFastifyPlugin: FastifyPluginAsync = fastifyUi();
  expect(typeof asFastifyPlugin).toBe("function");

  test("serves the built site, the config's routes and the built 404, registered before its routes", async () => {
    // forceCloseConnections: the never-ending stream below is a happy-dom ReadableStream
    // here (the test preload), and cancelling one never settles, so close() would wait
    // for it. A real server's streams stop when the client goes.
    const app = Fastify({ forceCloseConnections: true });
    // First, on purpose: it is the not-found handler, so registration order doesn't matter.
    await app.register(fastifyUi({ root }));
    app.get("/api/own", async () => "from fastify");
    await app.listen({ port: 0 });
    try {
      const port = (app.server.address() as { port: number }).port;
      await behaves((path) => get(port, path), "from fastify", (path) => firstChunk(port, path));
      const head = await get(port, "/", "HEAD");
      expect(head).toMatchObject({ status: 200, body: "" });
    } finally {
      await app.close();
    }
  });
});

describe("koa", () => {
  const asKoaMiddleware: Middleware = koaUi();
  expect(typeof asKoaMiddleware).toBe("function");

  test("serves the built site, the config's routes and the built 404, from anywhere in the stack", async () => {
    const app = new Koa();
    // First, on purpose: it answers after the rest of the stack, and only what nothing did.
    app.use(koaUi({ root }));
    app.use(async (ctx, next) => {
      if (ctx.path === "/api/own") ctx.body = "from koa";
      else await next();
    });
    const server = app.listen(0);
    try {
      await new Promise((r) => server.once("listening", r));
      const port = (server.address() as { port: number }).port;
      await behaves((path) => get(port, path), "from koa", (path) => firstChunk(port, path));
      expect(await get(port, "/", "HEAD")).toMatchObject({ status: 200, body: "" });
    } finally {
      server.close();
    }
  });
});

describe("hono", () => {
  test("serves the built site, the config's routes and the built 404", async () => {
    const app = new Hono();
    app.get("/api/own", (c) => c.text("from hono"));
    app.use(honoUi({ root }));
    const page = async (path: string): Promise<Page> => {
      const res = await app.request(`http://localhost${path}`);
      return { status: res.status, type: res.headers.get("content-type") ?? undefined, body: await res.text() };
    };
    await behaves(page, "from hono");
  });
});

describe("request bodies", () => {
  // A body parser that ran first has emptied the stream; the config's routes must still
  // read what the client sent, so the adapters rebuild it from what was parsed.
  const form = "application/x-www-form-urlencoded";
  const json = "application/json";

  test("express: after express.urlencoded() and express.json()", async () => {
    const app = express();
    app.use(express.urlencoded({ extended: false }), express.json());
    app.use(expressUi({ root }));
    const server = app.listen(0);
    try {
      await new Promise((r) => server.once("listening", r));
      const port = (server.address() as { port: number }).port;
      expect((await post(port, "/api/echo", form, "name=Sam&tag=a&tag=b")).body).toBe(`${form} name=Sam&tag=a&tag=b`);
      expect((await post(port, "/api/echo", json, '{"name":"Sam"}')).body).toBe(`${json} {"name":"Sam"}`);
    } finally {
      server.close();
    }
  });

  test("fastify: a body it parsed (JSON) and one it didn't (a form)", async () => {
    const app = Fastify();
    await app.register(fastifyUi({ root }));
    await app.listen({ port: 0 });
    try {
      const port = (app.server.address() as { port: number }).port;
      expect((await post(port, "/api/echo", form, "name=Sam")).body).toBe(`${form} name=Sam`);
      expect((await post(port, "/api/echo", json, '{"name":"Sam"}')).body).toBe(`${json} {"name":"Sam"}`);
    } finally {
      await app.close();
    }
  });

  test("koa: after a body parser", async () => {
    const app = new Koa();
    app.use(koaUi({ root }));
    // What @koa/bodyparser does: read the stream, leave the result on ctx.request.body.
    app.use(async (ctx, next) => {
      let raw = "";
      for await (const chunk of ctx.req) raw += chunk;
      (ctx.request as { body?: unknown }).body = Object.fromEntries(new URLSearchParams(raw));
      await next();
    });
    const server = app.listen(0);
    try {
      await new Promise((r) => server.once("listening", r));
      const port = (server.address() as { port: number }).port;
      expect((await post(port, "/api/echo", form, "name=Sam")).body).toBe(`${form} name=Sam`);
    } finally {
      server.close();
    }
  });
});

describe("the default 404", () => {
  test("a project without a 404 page gets htmx-ui's", async () => {
    const bare = await fixture({ "htmx-ui.config.ts": "export default { ui: false };", "dist/index.html": "<h1>home</h1>" });
    const app = new Hono();
    app.use(honoUi({ root: bare }));
    const res = await app.request("http://localhost/missing");
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await res.text()).toContain("Page not found");
  });
});
