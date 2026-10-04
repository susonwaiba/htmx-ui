// The Bun adapter end to end: a project in a temp directory built with build(),
// and the bunfig that `htmx-ui dev` generates.
import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveConfig } from "../core/config";
import { readdirSync } from "node:fs";
import { build } from "./build";
import { forwardTarget, staticImports } from "./chunks";
import { bunfig } from "./dev";

async function project(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-bun-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const layout = `<!doctype html><html><head><link rel="icon" href="/favicon.svg"><script type="module" src="{{ asset('app.ts') }}"></script></head><body>{% block content %}{% endblock %}</body></html>`;

describe("bun adapter", () => {
  test("build renders pages at their routes, bundles scripts, keeps public links and runs the done hook", async () => {
    const dir = await project({
      "layout.html": layout,
      "app.ts": "console.log('app');",
      "pages/index.html": '{% extends "layout.html" %}{% block content %}home {{ url }}{% endblock %}',
      "pages/docs/intro.html": '{% extends "layout.html" %}{% block content %}intro {{ url }}{% endblock %}',
      "public/favicon.svg": "<svg/>",
    });
    let done: string[] = [];
    const config = resolveConfig({ ui: false, build: { done: ({ pages }) => void (done = pages.map((p) => p.url)) } }, dir);
    const log = console.log;
    console.log = () => {};
    const warn = console.warn;
    console.warn = () => {};
    try {
      expect(await build(config)).toBe(true);
    } finally {
      console.log = log;
      console.warn = warn;
    }
    const home = await Bun.file(join(dir, "dist/index.html")).text();
    const intro = await Bun.file(join(dir, "dist/docs/intro.html")).text();
    expect(home).toContain("home /");
    expect(intro).toContain("intro /docs/intro");
    expect(home).toContain('href="/favicon.svg"');
    expect(home).not.toContain("htmx-ui.public");
    expect(home).not.toMatch(/\{[%{]/);
    expect(await Bun.file(join(dir, "dist/favicon.svg")).exists()).toBe(true);
    expect(done).toEqual(["/", "/docs/intro"]);
  }, 30_000);

  test("pages share one script and stylesheet in assets/; a page's own script imports the shared code with a modulepreload", async () => {
    const dir = await project({
      "layout.html": `<!doctype html><html><head><script type="module" src="{{ asset('app.ts') }}"></script>{% block head %}{% endblock %}</head><body>{% block content %}{% endblock %}</body></html>`,
      "app.ts": "import { shared } from './shared'; shared();",
      "shared.ts": "export const shared = () => console.log('shared ' + Math.random());",
      "chart.ts": "import { shared } from './shared'; shared(); console.log('chart');",
      "pages/index.html": '{% extends "layout.html" %}{% block content %}a{% endblock %}',
      "pages/about.html": '{% extends "layout.html" %}{% block content %}b{% endblock %}',
      "pages/docs/deep.html": '{% extends "layout.html" %}{% block content %}c{% endblock %}',
      "pages/chart.html": `{% extends "layout.html" %}{% block head %}<script type="module" src="{{ asset('chart.ts') }}"></script>{% endblock %}{% block content %}d{% endblock %}`,
    });
    const log = console.log;
    console.log = () => {};
    try {
      expect(await build(resolveConfig({ ui: false }, dir))).toBe(true);
    } finally {
      console.log = log;
    }
    const read = (page: string) => Bun.file(join(dir, "dist", page)).text();
    const srcs = async (page: string) => [...(await read(page)).matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => m[1]!);

    const home = await srcs("index.html");
    const about = await srcs("about.html");
    const deep = await srcs("docs/deep.html");
    expect(home).toHaveLength(1);
    expect(home[0]).toMatch(/^\.\/assets\/[\w-]+\.js$/);
    expect(about).toEqual(home); // the same file, not a per-page stub
    expect(deep).toEqual([home[0]!.replace("./", "../")]);

    const js = readdirSync(join(dir, "dist/assets")).filter((f) => f.endsWith(".js"));
    for (const f of js) expect(forwardTarget(await Bun.file(join(dir, "dist/assets", f)).text()), f).toBeNull(); // no stubs left
    expect(readdirSync(join(dir, "dist")).filter((f) => f.endsWith(".js"))).toEqual([]); // nothing at the root

    // chart.html: its own entry, which imports shared code, preloaded instead of discovered late
    const chart = await read("chart.html");
    const preloads = [...chart.matchAll(/rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    expect(preloads.length).toBeGreaterThan(0);
    for (const href of preloads) expect(await Bun.file(join(dir, "dist", href!)).exists()).toBe(true);
  }, 30_000);

test("assetVer()'s ?ver= never breaks the build, and lands on the tags Bun passes through", async () => {
    const dir = await project({
      "package.json": '{"name":"fixture","version":"1.2.3"}',
      "layout.html": `<!doctype html><html><head><link rel="stylesheet" href="{{ assetVer('app.css') }}"><script type="module" src="{{ assetVer('app.ts') }}"></script></head><body><img src="{{ assetVer('logo.svg') }}">{% block content %}{% endblock %}</body></html>`,
      "app.ts": "console.log('app');",
      "app.css": "body{color:red}",
      "logo.svg": "<svg/>",
      "pages/index.html": '{% extends "layout.html" %}{% block content %}home{% endblock %}',
    });
    const log = console.log;
    console.log = () => {};
    try {
      expect(await build(resolveConfig({ ui: false }, dir))).toBe(true);
    } finally {
      console.log = log;
    }
    const html = await Bun.file(join(dir, "dist/index.html")).text();
    expect(html).not.toContain("data-ver"); // Bun re-serializes the tags it bundles, marker and all
    expect(html).not.toContain("ver=1.2.3&amp;"); // and the query is gone from the ones it resolved
    expect([...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1])).toEqual([expect.stringMatching(/^\.\/assets\/logo-[\w-]+\.svg\?ver=1\.2\.3$/)]);
    // link and script get no query, because Bun re-serializes those tags; their content-hashed
    // filenames change with the content, so a build never loads a stale copy either.
    expect(html).toMatch(/<link[^>]*href="\.\/assets\/[\w-]+\.css"/);
    expect(html).toMatch(/<script[^>]*src="\.\/assets\/[\w-]+\.js"/);
  }, 30_000);

  test("chunk parsing: forwarders and static imports", () => {
    expect(forwardTarget('import"./index-1a2b.js";\n\n//# debugId=X\n//# sourceMappingURL=a.js.map\n')).toBe("./index-1a2b.js");
    expect(forwardTarget('import"./a.js";console.log(1)')).toBeNull();
    expect(forwardTarget('import"./a.js";import"./b.js";')).toBeNull();
    expect(staticImports('import{a as b}from"./x-1.js";import"./y.js";const z=import("./lazy.js");')).toEqual(["./x-1.js", "./y.js"]);
  });

  test("the generated bunfig loads the htmx-ui plugin first, then Tailwind and the project's own plugins", async () => {
    const dir = await project({ "bunfig.toml": '[serve.static]\nplugins = ["./my-plugin.ts", "bun-plugin-tailwind"]\nenv = "PUBLIC_*"\n' });
    const toml = Bun.TOML.parse(bunfig(resolveConfig({ ui: false }, dir))) as { serve: { static: { plugins: string[]; env: string } } };
    const plugins = toml.serve.static.plugins;
    expect(plugins[0]).toMatch(/serve-plugin\.ts$/);
    expect(plugins.at(-1)).toBe(join(dir, "my-plugin.ts"));
    expect(toml.serve.static.env).toBe("PUBLIC_*");
  });
});
