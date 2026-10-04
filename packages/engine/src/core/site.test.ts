import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSite } from "./site";

/** A project with a built site: dist/ is what `handle()` serves. */
async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-site-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const get = (url: string, init?: RequestInit) => new Request(`http://localhost${url}`, init);

/**
 * Run `fn` with NODE_ENV set, which is what decides whether handle() renders a page or
 * serves the build. createSite() reads it once, so a site has to be built inside.
 */
async function inEnv(env: string | undefined, fn: () => Promise<void>) {
  const was = process.env.NODE_ENV;
  if (env === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = env;
  try {
    await fn();
  } finally {
    if (was === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = was;
  }
}

const built = {
  "htmx-ui.config.ts": `export default {
    ui: false,
    globals: { site: "Acme" },
    routes: {
      "/api/users/:id": (req) => new Response("user " + req.params.id),
      "/api/*": () => new Response("rest"),
    },
    fetch: (req) => (new URL(req.url).pathname === "/from-fetch" ? new Response("fetched") : null),
  };`,
  "layout.html": "<title>{{ site }}</title>{% block content %}{% endblock %}",
  "pages/index.html": '{% extends "layout.html" %}{% block content %}<h1>{{ greeting }}</h1>{% endblock %}',
  "pages/docs/setup.html": '{% extends "layout.html" %}{% block content %}<p>{{ url }}</p>{% endblock %}',
  "partials/row.html": "<tr><td>{{ row.name }}</td></tr>",
  "app.ts": "console.log(1);",
  "dist/index.html": "<h1>built</h1>",
  "dist/docs/setup.html": "<p>built /docs/setup</p>",
  "dist/assets/app-abc123.js": "console.log(1);",
  "dist/favicon.svg": "<svg></svg>",
  "dist/404.html": "<h1>Not found</h1>",
};

describe("createSite", () => {
  test("indexes pages, and renders one per request with the site's context", async () => {
    const site = await createSite({ root: await fixture(built) });
    expect(site.pages.map((p) => p.url)).toEqual(["/", "/docs/setup"]);
    expect(site.render("/docs/setup")).toBe("<title>Acme</title><p>/docs/setup</p>");
    expect(site.render("/", { greeting: "Hello" })).toBe("<title>Acme</title><h1>Hello</h1>");
    // context from the site is merged, not replaced
    expect(site.render("/", { greeting: site.config.user.globals!.site })).toContain("Acme");
  });

  test("render() takes trailing slashes, throws on an unknown route and applies the transform", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": "export default { ui: false, transform: (html, page) => html + '<!-- ' + page.url + '-->' };",
      "pages/about.html": "<p>about</p>",
    });
    const site = await createSite({ root: dir });
    expect(site.render("/about/")).toBe("<p>about</p><!-- /about-->");
    expect(() => site.render("/nope")).toThrow("[html] no page for /nope");
  });

  test("fragment() renders any template, with no transform and no document shell", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": "export default { ui: false, transform: () => 'TRANSFORMED' };",
      "pages/index.html": "<p>page</p>",
      "partials/row.html": "<tr><td>{{ row.name }}</td></tr>",
    });
    const site = await createSite({ root: dir, context: { row: { name: "Ada" } } });
    expect(site.fragment("partials/row.html")).toBe("<tr><td>Ada</td></tr>");
    expect(site.fragment("partials/row.html", { row: { name: "Grace" } })).toBe("<tr><td>Grace</td></tr>");
    expect(site.fragment("pages/index.html")).toBe("<p>page</p>");
    expect(() => site.fragment("partials/nope.html")).toThrow('[html] fragment("partials/nope.html"): file not found');
    expect(() => site.fragment("../outside.html")).toThrow("outside");
  });

  test("asset() is root-absolute by default and replaceable", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": "export default { ui: false };",
      "pages/index.html": '<script src="{{ asset("app.ts") }}">',
      "app.ts": "console.log(1);",
    });
    const site = await createSite({ root: dir });
    expect(site.render("/")).toBe('<script src="/app.ts">');
    const custom = await createSite({ root: dir, asset: (file, page) => `/${page === file ? "same" : "other"}` });
    expect(custom.render("/")).toBe('<script src="/other">');
  });

  test("handle() serves the config's routes, most specific first", async () => {
    const site = await createSite({ root: await fixture(built) });
    expect(await (await site.handle(get("/api/users/7")))!.text()).toBe("user 7");
    expect(await (await site.handle(get("/api/other")))!.text()).toBe("rest");
  });

  test("handle() serves the built site: pages at their routes, assets, public files", async () => {
    const site = await createSite({ root: await fixture(built) });
    const page = await site.handle(get("/docs/setup"));
    expect(page!.status).toBe(200);
    expect(page!.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await page!.text()).toBe("<p>built /docs/setup</p>");
    const asset = await site.handle(get("/assets/app-abc123.js"));
    expect(asset!.headers.get("Content-Type")).toBe("text/javascript; charset=utf-8");
    expect(await (await site.handle(get("/")))!.text()).toBe("<h1>built</h1>");
    expect((await site.handle(get("/favicon.svg")))!.headers.get("Content-Type")).toBe("image/svg+xml");
  });

  test("handle() answers HEAD with headers only, then the fetch fallback, then the built 404", async () => {
    const site = await createSite({ root: await fixture(built) });
    const head = await site.handle(get("/", { method: "HEAD" }));
    expect(head!.headers.get("Content-Length")).toBe("14");
    expect(await head!.text()).toBe("");
    expect(await (await site.handle(get("/from-fetch")))!.text()).toBe("fetched");
    const missing = await site.handle(get("/nothing"));
    expect(missing!.status).toBe(404);
    expect(await missing!.text()).toBe("<h1>Not found</h1>");
  });

  test("handle() returns null when nothing matches and no 404 page was built", async () => {
    const site = await createSite({
      root: await fixture({ "htmx-ui.config.ts": "export default { ui: false };", "pages/index.html": "<p>hi</p>" }),
    });
    expect(await site.handle(get("/nothing"))).toBeNull();
  });

  test("routes and fetch get the request, and handle() serves whatever a config option says", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": `export default { ui: false, roots: ["."], pages: "src" };`,
      "src/index.html": "<p>from src/</p>",
      "dist/index.html": "<p>built</p>",
    });
    const site = await createSite({ root: dir, config: { ui: false, pages: "src", outDir: "build" } });
    expect(site.config.pagesDir).toBe(join(dir, "src"));
    expect(site.config.outDir).toBe(join(dir, "build"));
    // Production serves the build, and this outDir has none: nothing handled.
    await inEnv("production", async () => {
      const prod = await createSite({ root: dir, config: { ui: false, pages: "src", outDir: "build" } });
      expect(await prod.handle(get("/"))).toBeNull();
    });
    expect(site.render("/")).toBe("<p>from src/</p>");
  });

  test("reuses a site it was given", async () => {
    const site = await createSite({ root: await fixture(built) });
    expect(await createSite({ site })).toBe(site);
    expect(await createSite({ site: Promise.resolve(site) })).toBe(site);
  });
});

describe("development: handle() renders the pages the build has not written", () => {
  /** A project being worked on: templates, and no dist/ yet. */
  const unbuilt = {
    "htmx-ui.config.ts": `export default {
      ui: false,
      globals: { site: "Acme" },
      routes: { "/docs/:name": (req) => new Response("route " + req.params.name) },
      transform: (html, page) => html + "<!-- " + page.url + "-->",
    };`,
    "layout.html": "<title>{{ site }}</title>{% block content %}{% endblock %}",
    "pages/index.html": '{% extends "layout.html" %}{% block content %}<h1>Home</h1>{% endblock %}',
    "pages/docs/setup.html": '{% extends "layout.html" %}{% block content %}<p>{{ url }}</p>{% endblock %}',
  };

  test("a page route the build has no file for is rendered from its template", async () => {
    await inEnv(undefined, async () => {
      const site = await createSite({ root: await fixture(unbuilt), context: { greeting: "Hello" } });
      const home = await site.handle(get("/"));
      expect(home!.status).toBe(200);
      expect(home!.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
      // The site's own context, and the config's transform, as render() does it.
      expect(await home!.text()).toBe("<title>Acme</title><h1>Home</h1><!-- /-->");
      // Clean URLs, trailing slash and all.
      expect(await (await site.handle(get("/docs/setup")))!.text()).toBe("<title>Acme</title><p>/docs/setup</p>");
      // Not a page: the caller answers it, as it always did.
      expect(await site.handle(get("/nope"))).toBeNull();
    });
  });

  test("a config route still beats the page behind it", async () => {
    await inEnv(undefined, async () => {
      const site = await createSite({ root: await fixture(unbuilt) });
      expect(await (await site.handle(get("/docs/setup")))!.text()).toBe("route setup");
    });
  });

  test("the build answers first, so a built page keeps its hashed asset URLs", async () => {
    const dir = await fixture(unbuilt);
    await mkdir(join(dir, "dist"), { recursive: true });
    await writeFile(join(dir, "dist/index.html"), '<h1>built</h1><script src="/assets/app-a1b2.js">');
    await inEnv(undefined, async () => {
      const site = await createSite({ root: dir });
      expect(await (await site.handle(get("/")))!.text()).toBe('<h1>built</h1><script src="/assets/app-a1b2.js">');
    });
  });

  test("HEAD gets the rendered page's headers and no body", async () => {
    await inEnv(undefined, async () => {
      const site = await createSite({ root: await fixture(unbuilt) });
      const head = await site.handle(get("/", { method: "HEAD" }));
      expect(head!.status).toBe(200);
      expect(head!.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
      expect(head!.headers.get("Content-Length")).toBe("42");
      expect(await head!.text()).toBe("");
    });
  });

  test("production renders nothing: only the build, then fetch, then the built 404", async () => {
    const dir = await fixture(unbuilt);
    await mkdir(join(dir, "dist"), { recursive: true });
    await writeFile(join(dir, "dist/index.html"), "<h1>built</h1>");
    await inEnv("production", async () => {
      const site = await createSite({ root: dir, config: { ui: false, fetch: (req) => (req.url.endsWith("/docs/setup") ? new Response("fetched") : null) } });
      expect(await (await site.handle(get("/")))!.text()).toBe("<h1>built</h1>");
      expect(await (await site.handle(get("/docs/setup")))!.text()).toBe("fetched");
    });
  });
});

describe("render: a deployment that renders templates at runtime", () => {
  /** What a deployment ships: a built site, and the templates copied next to it. */
  const deployed = {
    "htmx-ui.config.ts": `export default {
      ui: false,
      render: true,
      outDir: "dist",
      pages: "dist/_templates/pages",
      roots: [".", "dist/_templates"],
    };`,
    "dist/index.html": "<h1>built home</h1>",
    "dist/_templates/layouts/base.html": `<body>{{ json("data/site.json").name }}{% block content %}{% endblock %}</body>`,
    "dist/_templates/pages/index.html": `{% extends "layouts/base.html" %}{% block content %}<p>Hi {{ user.name }}</p>{% endblock %}`,
    "dist/_templates/pages/dashboard.html": `{% extends "layouts/base.html" %}{% block content %}<h1>{{ user.name }}'s dashboard</h1>{% endblock %}`,
    "dist/_templates/partials/row.html": "<tr><td>{{ row.name }}</td></tr>",
    "dist/_templates/data/site.json": '{ "name": "Acme" }',
  };

  test("renders pages and fragments from the templates it was deployed with", async () => {
    const site = await createSite({ root: await fixture(deployed) });
    // Pages still come from the build: handle() serves dist/, as always.
    expect(await site.handle(get("/"))).toHaveProperty("status", 200);
    // extends, block and a copied data file all resolve out of the render root.
    expect(site.render("/dashboard", { user: { name: "Sam" } })).toBe("<body>Acme<h1>Sam's dashboard</h1></body>");
    expect(site.render("/", { user: { name: "Sam" } })).toBe("<body>Acme<p>Hi Sam</p></body>");
    expect(site.fragment("partials/row.html", { row: { name: "a" } })).toBe("<tr><td>a</td></tr>");
  });

  test("say what to copy when the templates were not deployed", async () => {
    // dist/ shipped, templates left behind: this is the mistake worth catching.
    const dir = await fixture({
      "htmx-ui.config.ts": `export default { ui: false, render: true, pages: "dist/_templates/pages", roots: [".", "dist/_templates"] };`,
      "dist/index.html": "<h1>built home</h1>",
    });
    expect(createSite({ root: dir })).rejects.toThrow(/render: no templates at .*dist\/_templates/);
    expect(createSite({ root: dir })).rejects.toThrow(/copy the templates it renders from/);
    // The advice has to fit its cause: this branch already has render: true.
    expect(createSite({ root: dir })).rejects.toThrow(/point `templates` at where you put them/);
  });

  test("say so when the pages directory is missing but the templates arrived", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": `export default { ui: false, render: true, pages: "dist/_templates/pages", roots: [".", "dist/_templates"] };`,
      "dist/_templates/partials/row.html": "<tr></tr>",
    });
    expect(createSite({ root: dir })).rejects.toThrow(/render: no pages in .*dist\/_templates\/pages/);
  });

  test("off by default, so a static-only deployment starts and finds nothing wrong", async () => {
    const dir = await fixture({
      "htmx-ui.config.ts": "export default { ui: false };",
      "dist/index.html": "<h1>built</h1>",
    });
    // Same missing templates, no render: true: starts, and simply has no pages.
    const site = await createSite({ root: dir });
    expect(site.config.render).toBe(false);
    expect(site.pages).toEqual([]);
    expect(await site.handle(get("/"))).toHaveProperty("status", 200);
  });
});