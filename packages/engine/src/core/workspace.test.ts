// Where `htmx-ui dev` runs the server from: the project, widened to take in the
// packages linked into it.
import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { commonAncestor, linkedPackages, serveRoot } from "./workspace";

async function tree(files: Record<string, string>, links: Record<string, string> = {}): Promise<string> {
  const dir = realpathSync(await mkdtemp(join(tmpdir(), "htmx-ui-workspace-")));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  for (const [link, target] of Object.entries(links)) {
    await mkdir(join(dir, link, ".."), { recursive: true });
    await symlink(join(dir, target), join(dir, link));
  }
  return dir;
}

const pkg = (deps: Record<string, string> = {}, dev: Record<string, string> = {}) => JSON.stringify({ dependencies: deps, devDependencies: dev });

describe("workspace", () => {
  test("linked packages: workspace links and their own links, not registry installs", async () => {
    const dir = await tree(
      {
        "site/package.json": pkg({ ui: "workspace:*", registry: "^1.0.0" }, { tool: "workspace:*" }),
        "packages/ui/package.json": pkg({ engine: "workspace:*" }, { devonly: "workspace:*" }),
        "packages/engine/package.json": pkg(),
        "packages/tool/package.json": pkg(),
        "packages/devonly/package.json": pkg(),
        // A registry install, laid out the way bun's isolated linker does it.
        "node_modules/.bun/registry@1.0.0/node_modules/registry/package.json": pkg(),
      },
      {
        "site/node_modules/ui": "packages/ui",
        "site/node_modules/tool": "packages/tool",
        "site/node_modules/registry": "node_modules/.bun/registry@1.0.0/node_modules/registry",
        // Hoisted to the workspace root, found by walking up from packages/ui.
        "node_modules/engine": "packages/engine",
        "node_modules/devonly": "packages/devonly",
      },
    );
    const site = join(dir, "site");
    // A linked package's devDependencies are its own tooling, not the project's code.
    expect(linkedPackages(site)).toEqual([join(dir, "packages/engine"), join(dir, "packages/tool"), join(dir, "packages/ui")]);
    expect(serveRoot(site)).toBe(dir);
  });

  test("a project root with no package.json of its own uses the nearest one above", async () => {
    const dir = await tree(
      { "package.json": pkg({ ui: "workspace:*" }), "web/htmx-ui.config.ts": "", "packages/ui/package.json": pkg() },
      { "node_modules/ui": "packages/ui" },
    );
    expect(linkedPackages(join(dir, "web"))).toEqual([join(dir, "packages/ui")]);
    expect(serveRoot(join(dir, "web"))).toBe(dir);
  });

  test("a project with nothing linked is served from its own root", async () => {
    const dir = await tree({ "package.json": pkg({ registry: "^1.0.0" }), "node_modules/registry/package.json": pkg() });
    expect(linkedPackages(dir)).toEqual([]);
    expect(serveRoot(dir)).toBe(dir);
  });

  test("common ancestor", () => {
    expect(commonAncestor(["/a/b/c", "/a/b/d/e", "/a/b"])).toBe("/a/b");
    expect(commonAncestor(["/a/b", "/a/bc"])).toBe("/a");
    expect(commonAncestor(["/a", "/b"])).toBe("/");
    // Packages linked from across the disk keep the project as the root.
    expect(serveRoot("/a/site", ["/b/pkg"])).toBe("/a/site");
  });
});
