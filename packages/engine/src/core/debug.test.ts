import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { logger, TOPICS } from "./debug";
import { createSite, type Site } from "./site";

/** Collect what a Logger prints, without a terminal. Awaits async work too. */
async function capture(run: () => unknown): Promise<string[]> {
  const lines: string[] = [];
  const log = console.log;
  console.log = (...args: unknown[]) => void lines.push(args.join(" "));
  try {
    await run();
  } finally {
    console.log = log;
  }
  return lines;
}

/** A project with a built site: dist/ is what `handle()` serves. */
async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-debug-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const get = (url: string) => new Request(`http://localhost${url}`);

const built = {
  // debug comes from htmx-ui.config.ts, the way a project would set it
  "htmx-ui.config.ts": `export default {
    ui: false,
    debug: ["requests", "render", "templates"],
    routes: { "/api/users/:id": (req) => new Response("user " + req.params.id) },
  };`,
  "layout.html": "<title>Acme</title>{% block content %}{% endblock %}",
  "pages/index.html": '{% extends "layout.html" %}{% block content %}<h1>{{ greeting }}</h1>{% endblock %}',
  "partials/row.html": "<tr><td>{{ row.name }}</td></tr>",
  "dist/index.html": "<h1>built</h1>",
  "dist/404.html": "<h1>Not found</h1>",
};

describe("debug", () => {
  test("is off unless the config asks for it", () => {
    for (const debug of [undefined, false] as const) {
      const log = logger(debug);
      for (const topic of TOPICS) expect(log.on(topic)).toBe(false);
      // time() still runs the work, it just says nothing
      expect(log.time("render", "quiet", () => 42)).toBe(42);
    }
  });

  test("true turns on every topic, a list narrows it down", () => {
    const all = logger(true);
    for (const topic of TOPICS) expect(all.on(topic)).toBe(true);
    const one = logger(["requests"]);
    expect(one.on("requests")).toBe(true);
    expect(one.on("render")).toBe(false);
  });

  test("logs the topic's message with data, prefixed so it is findable in server output", async () => {
    const log = logger(["requests"]);
    const lines = await capture(() => {
      log.log("requests", "GET /docs", { cached: true });
      log.log("render", "not this topic");
    });
    expect(lines).toEqual(["[htmx-ui] GET /docs cached=true"]);
  });

  test("time() reports the duration and the output size, and returns what fn returned", async () => {
    const lines = await capture(() => logger(["render"]).time("render", "render /", () => "x".repeat(2048)));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(/^\[htmx-ui\] render \/ done 2\.0KB \d+\.\dms$/);
  });

  test("time() waits for a promise, so a request logs once it is actually answered", async () => {
    const log = logger(["render"]);
    const lines = await capture(async () => {
      await expect(log.time("render", "fragment row.html", async () => "row")).resolves.toBe("row");
      await expect(log.time("render", "fragment bad.html", () => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    });
    expect(lines[0]).toContain("fragment row.html done");
    expect(lines[1]).toContain("fragment bad.html failed Error: boom");
  });

  test("createSite() logs the warm-up, every render, and what answered each request", async () => {
    let site!: Site;
    const lines = await capture(async () => {
      // Warm-up happens in createSite(), so it has to be captured from here
      site = await createSite({ root: await fixture(built) });
      expect(site.render("/", { greeting: "Hi" })).toContain("Hi");
      expect(site.fragment("partials/row.html", { row: { name: "a" } })).toBe("<tr><td>a</td></tr>");
      expect(await site.handle(get("/api/users/7"))).toHaveProperty("status", 200);
      expect(await site.handle(get("/docs/missing"))).toHaveProperty("status", 404);
    });
    const joined = lines.join("\n");
    expect(joined).toMatch(/warm: compiled 2 of 2 templates from 1 file in \d+\.\dms/);
    expect(joined).toMatch(/\[htmx-ui\] compiled pages\/index\.html/);
    expect(joined).toMatch(/\[htmx-ui\] render \/ done \d/);
    // Not reachable from a page, so it compiles on first use instead of at warm-up
    expect(joined).toMatch(/\[htmx-ui\] compiled partials\/row\.html/);
    expect(joined).toMatch(/\[htmx-ui\] fragment partials\/row\.html done/);
    expect(joined).toContain("GET /api/users/7 200 via route /api/users/:id");
    expect(joined).toContain("GET /docs/missing 404 via 404.html");
  });

  test("a path nothing answers says so, which is how a host knows to fall through", async () => {
    const site = await createSite({
      root: await fixture({
        "htmx-ui.config.ts": `export default { ui: false, debug: ["requests"] };`,
        "pages/index.html": "<h1>hi</h1>",
        "dist/index.html": "<h1>built</h1>",
      }),
    });
    const lines = await capture(async () => {
      expect(await site.handle(get("/api/mine"))).toBeNull();
    });
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe("[htmx-ui] GET /api/mine");
    expect(lines[1]).toMatch(/^\[htmx-ui\] GET \/api\/mine not handled via nothing \d+\.\dms$/);
  });

  test("a request that never comes back leaves only its arrival line", async () => {
    const site = await createSite({
      root: await fixture({
        "htmx-ui.config.ts": `export default { ui: false, debug: ["requests"], fetch: () => new Promise(() => {}) };`,
        "pages/index.html": "<h1>hi</h1>",
        "dist/index.html": "<h1>built</h1>",
      }),
    });
    // Started, never finished: the one line with no partner is what hangs.
    const lines = await capture(() => void site.handle(get("/hang")));
    expect(lines).toEqual(["[htmx-ui] GET /hang"]);
  });
});