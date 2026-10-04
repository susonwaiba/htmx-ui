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
import { Hono } from "hono";
import { htmxUi as elysiaUi } from "./elysia";
import { htmxUi as expressUi } from "./express";
import { htmxUi as honoUi } from "./hono";

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
    routes: { "/api/site": () => new Response("from the config") },
  };`,
  "pages/index.html": "<h1>home</h1>",
  "pages/docs/setup.html": "<p>setup</p>",
  "dist/index.html": "<h1>built home</h1>",
  "dist/docs/setup.html": "<p>built setup</p>",
  "dist/404.html": "<h1>nope</h1>",
});

/** The global fetch is happy-dom's, so ask a listening server with node:http instead. */
type Page = { status: number; type: string | undefined; body: string };

const get = (port: number, path: string): Promise<Page> =>
  new Promise((resolve, reject) => {
    request({ host: "localhost", port, path, agent: false }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode!, type: res.headers["content-type"], body }));
    })
      .on("error", reject)
      .end();
  });

/** What every adapter must do, given a way to ask its server for a path. */
async function behaves(get: (path: string) => Promise<Page>, own: string) {
  expect(await get("/")).toMatchObject({ status: 200, body: "<h1>built home</h1>", type: expect.stringContaining("text/html") });
  expect((await get("/docs/setup")).body).toBe("<p>built setup</p>");
  expect((await get("/api/site")).body).toBe("from the config");
  expect(await get("/api/own")).toMatchObject({ status: 200, body: own });
  expect(await get("/missing")).toMatchObject({ status: 404, body: "<h1>nope</h1>" });
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
      await behaves((path) => get(port, path), "from elysia");
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
      await behaves((path) => get(port, path), "from express");
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
