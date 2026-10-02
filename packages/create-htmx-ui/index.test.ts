import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { detectManager, packageName, projectPackage, scaffold } from "./index.js";

describe("create-htmx-ui", () => {
  test("detects the package manager that ran it", () => {
    expect(detectManager("pnpm/10.1.0 npm/? node/v24.0.0 linux x64")).toBe("pnpm");
    expect(detectManager("yarn/1.22.21 npm/? node/v24.0.0")).toBe("yarn");
    expect(detectManager("bun/1.3.14 npm/? node/v24.3.0")).toBe("bun");
    expect(detectManager("")).toBe("npm");
  });

  test("Bun projects build with Bun, others with Node + Vite; --runtime adds the flag", () => {
    const bun = projectPackage("a", { pm: "bun", runtime: "bun", version: "1.2.3" });
    expect(bun.scripts.dev).toBe("htmx-ui dev");
    expect(Object.keys(bun.devDependencies)).toEqual(["bun-plugin-tailwind", "htmx-ui-engine", "tailwindcss"]);
    expect(bun.dependencies["htmx-ui"]).toBe("^1.2.3");

    const npm = projectPackage("a", { pm: "npm", runtime: "node", version: "1.2.3" });
    expect(npm.scripts.build).toBe("htmx-ui build");
    expect(Object.keys(npm.devDependencies)).toEqual(["@tailwindcss/vite", "htmx-ui-engine", "tailwindcss", "vite"]);

    expect(projectPackage("a", { pm: "pnpm", runtime: "bun" }).scripts.dev).toBe("htmx-ui dev --bun");
    expect(projectPackage("a", { pm: "bun", runtime: "node" }).scripts.dev).toBe("htmx-ui dev --node");
  });

  test("package names come from the directory", () => {
    expect(packageName("/x/My Site!")).toBe("my-site");
    expect(packageName("/x/.hidden")).toBe("hidden");
  });

  test("scaffolds the template with a .gitignore, package.json and README", async () => {
    const dir = join(await mkdtemp(join(tmpdir(), "create-htmx-ui-")), "site");
    scaffold(dir, { pm: "pnpm" });
    for (const f of [".gitignore", "package.json", "README.md", "htmx-ui.config.ts", "pages/index.html", "layouts/base.html", "public/favicon.svg"]) {
      expect(existsSync(join(dir, f)), f).toBe(true);
    }
    expect(existsSync(join(dir, "_gitignore"))).toBe(false);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name).toBe("site");
    expect(readFileSync(join(dir, "README.md"), "utf8")).toContain("pnpm dev");
  });

  test("refuses a non-empty directory unless forced", async () => {
    const dir = await mkdtemp(join(tmpdir(), "create-htmx-ui-"));
    await writeFile(join(dir, "keep.txt"), "");
    expect(() => scaffold(dir, {})).toThrow(/not empty/);
    expect(() => scaffold(dir, { force: true })).not.toThrow();
  });
});
