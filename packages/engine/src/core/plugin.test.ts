import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { help, parse, runCommand } from "./cli";
import { renderPage, resolveConfig, type ResolvedConfig } from "./config";
import { definePlugin, type Plugin } from "./plugin";
import { createSite } from "./site";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-plugin-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

const text = (body: string) => new Response(body);

describe("plugins", () => {
  test("template roots go after the project's and before htmx-ui's, so the project overrides them", async () => {
    const dir = await fixture({
      "plugin/greet/hello.html": "plugin hello",
      "plugin/greet/bye.html": "plugin bye",
      "greet/bye.html": "project bye",
      "pages/index.html": '{% include "greet/hello.html" %} / {% include "greet/bye.html" %}',
    });
    // A relative plugin root is relative to the project
    const c = resolveConfig({ ui: false, roots: [".", "extra"], plugins: [{ name: "greet", roots: ["plugin"] }] }, dir);
    expect(c.roots.map((r) => r.dir)).toEqual([dir, join(dir, "extra"), join(dir, "plugin")]);
    expect(renderPage(c, join(dir, "pages/index.html"))).toBe("plugin hello / project bye");
  });

  test("root names are unique across the project and its plugins", async () => {
    const dir = await fixture({});
    const plugin = { name: "p", roots: [{ name: "layouts", dir: "a" }] };
    expect(() => resolveConfig({ ui: false, roots: [".", { name: "layouts", dir: "b" }], plugins: [plugin] }, dir)).toThrow(/both named "layouts"/);
  });

  test("the project's globals, filters and routes win; transforms run plugins first, then the project's", async () => {
    const dir = await fixture({ "pages/index.html": "{{ a }} {{ b }} {{ 'x' | f }}" });
    const p1 = definePlugin({ name: "one", globals: { a: "one-a", b: "one-b" }, filters: { f: () => "one-f" }, transform: (h) => h + " [one]" });
    const p2: Plugin = { name: "two", globals: { b: "two-b" }, transform: (h, page) => h + ` [two ${page.url}]` };
    const c = resolveConfig({ ui: false, globals: { a: "own-a" }, transform: (h) => h + " [own]", plugins: [p1, [p2]] }, dir);
    expect(renderPage(c, join(dir, "pages/index.html"))).toBe("own-a two-b one-f [one] [two /] [own]");
    expect(c.plugins.map((p) => p.name)).toEqual(["one", "two"]);
  });

  test("falsy entries are skipped; unnamed or repeated plugins are refused", async () => {
    const dir = await fixture({});
    expect(resolveConfig({ ui: false, plugins: [false, null, undefined, [false]] }, dir).plugins).toEqual([]);
    expect(() => resolveConfig({ ui: false, plugins: [{ name: "" }] }, dir)).toThrow(/no name/);
    expect(() => resolveConfig({ ui: false, plugins: [{ name: "x" }, { name: "x" }] }, dir)).toThrow(/listed twice/);
  });

  test("createSite serves plugin routes and fetch after the project's own", async () => {
    const dir = await fixture({});
    const seen: ResolvedConfig[] = [];
    const plugin: Plugin = {
      name: "feed",
      configResolved: (c) => void seen.push(c),
      routes: { "/feed.xml": () => text("plugin feed"), "/shared": () => text("plugin shared") },
      fetch: (req) => (new URL(req.url).pathname.endsWith(".md") ? text("plugin markdown") : null),
    };
    const site = await createSite({
      root: dir,
      config: {
        ui: false,
        routes: { "/shared": () => text("own shared") },
        fetch: (req) => (new URL(req.url).pathname === "/own.md" ? text("own markdown") : null),
        plugins: [plugin],
      },
    });
    const get = async (path: string) => (await site.handle(new Request(`http://x${path}`))).text();
    expect(await get("/feed.xml")).toBe("plugin feed");
    expect(await get("/shared")).toBe("own shared");
    expect(await get("/own.md")).toBe("own markdown");
    expect(await get("/other.md")).toBe("plugin markdown");
    expect((await site.handle(new Request("http://x/nothing"))).status).toBe(404);
    expect(seen).toEqual([site.config]);
  });

  test("build.done runs every plugin's hook, then the project's", async () => {
    const dir = await fixture({});
    const order: string[] = [];
    const c = resolveConfig(
      {
        ui: false,
        build: { minify: false, done: () => void order.push("own") },
        plugins: [{ name: "a", build: { done: async () => void order.push("a") } }, { name: "b", build: { done: () => void order.push("b") } }],
      },
      dir,
    );
    await c.user.build!.done!({ config: c, outDir: c.outDir, pages: [] });
    expect(order).toEqual(["a", "b", "own"]);
    expect(c.user.build!.minify).toBe(false);
  });
});

describe("plugin commands", () => {
  test("parse() takes a plugin command with its own arguments and options", () => {
    expect(parse(["versions:name", "0.2.0", "--force", "--port", "4000"])).toMatchObject({
      command: "versions:name",
      args: ["0.2.0"],
      options: { force: true, port: "4000" },
      port: 4000,
    });
    // Built-in commands keep strict options
    expect(() => parse(["build", "--prot", "1"])).toThrow();
    expect(() => parse(["../nope"])).toThrow(/Unknown command/);
  });

  test("runCommand() runs it with the config, its arguments and the runtime's build", async () => {
    const dir = await fixture({});
    const calls: unknown[] = [];
    const c = resolveConfig(
      {
        ui: false,
        plugins: [
          {
            name: "versions",
            commands: {
              "versions:name": {
                description: "Name the version in development",
                usage: "<x.y.z>",
                async run({ config, args, options, build }) {
                  calls.push(config === c, args, options.force, await build());
                  return 3;
                },
              },
            },
          },
        ],
      },
      dir,
    );
    const code = await runCommand(c, parse(["versions:name", "0.2.0", "--force"]), async () => true);
    expect(code).toBe(3);
    expect(calls).toEqual([true, ["0.2.0"], true, true]);
    expect(help(c)).toContain("Plugin commands:\n  versions:name <x.y.z>  Name the version in development (versions)");
    await expect(runCommand(c, parse(["nope:x"]), async () => true)).rejects.toThrow(/Unknown command "nope:x"/);
  });

  test("a plugin can't take a built-in command or another plugin's (refused when the config resolves)", async () => {
    const dir = await fixture({});
    const cmd = { description: "", run() {} };
    expect(() => resolveConfig({ ui: false, plugins: [{ name: "x", commands: { build: cmd } }] }, dir)).toThrow(/can't replace the built-in "build"/);
    const twice = [{ name: "a", commands: { go: cmd } }, { name: "b", commands: { go: cmd } }];
    expect(() => resolveConfig({ ui: false, plugins: twice }, dir)).toThrow(/"a" and "b" both add the "go" command/);
  });
});
