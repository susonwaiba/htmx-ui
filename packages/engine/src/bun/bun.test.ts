// The Bun adapter end to end: a project in a temp directory built with build(),
// and the bunfig that `htmx-ui dev` generates.
import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveConfig } from "../core/config";
import { build } from "./build";
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

  test("the generated bunfig loads the htmx-ui plugin first, then Tailwind and the project's own plugins", async () => {
    const dir = await project({ "bunfig.toml": '[serve.static]\nplugins = ["./my-plugin.ts", "bun-plugin-tailwind"]\nenv = "PUBLIC_*"\n' });
    const toml = Bun.TOML.parse(bunfig(resolveConfig({ ui: false }, dir))) as { serve: { static: { plugins: string[]; env: string } } };
    const plugins = toml.serve.static.plugins;
    expect(plugins[0]).toMatch(/serve-plugin\.ts$/);
    expect(plugins.at(-1)).toBe(join(dir, "my-plugin.ts"));
    expect(toml.serve.static.env).toBe("PUBLIC_*");
  });
});
