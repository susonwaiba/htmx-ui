import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findPages, matchRoute, routeFor, sortRoutes } from "./routes";
import { staticFile } from "./static";

async function fixture(files: string[]): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-routes-"));
  for (const f of files) {
    await mkdir(join(dir, f, ".."), { recursive: true });
    await writeFile(join(dir, f), f);
  }
  return dir;
}

describe("routes", () => {
  test("routeFor maps page files to routes", () => {
    expect(routeFor("index.html")).toBe("/");
    expect(routeFor("about.html")).toBe("/about");
    expect(routeFor("docs/index.html")).toBe("/docs");
    expect(routeFor("docs/components/button.html")).toBe("/docs/components/button");
  });

  test("findPages lists every page with its route, sorted", async () => {
    const dir = await fixture(["index.html", "docs/index.html", "about.html", "docs/a/b.html", "notes.txt"]);
    expect(findPages(dir).map((p) => [p.path, p.url])).toEqual([
      ["index.html", "/"],
      ["about.html", "/about"],
      ["docs/index.html", "/docs"],
      ["docs/a/b.html", "/docs/a/b"],
    ]);
  });

  test("matchRoute follows Bun.serve's syntax: exact, :params and a trailing *", () => {
    expect(matchRoute("/api/hello", "/api/hello")).toEqual({});
    expect(matchRoute("/api/hello", "/api/hello/x")).toBeNull();
    expect(matchRoute("/api/users/:id", "/api/users/42")).toEqual({ id: "42" });
    expect(matchRoute("/api/users/:id", "/api/users")).toBeNull();
    expect(matchRoute("/files/*", "/files/a/b.svg")).toEqual({});
    expect(matchRoute("/a/:x/b/:y", "/a/1/b/hello%20there")).toEqual({ x: "1", y: "hello there" });
  });

  test("sortRoutes puts static paths before params before wildcards", () => {
    expect(sortRoutes(["/files/*", "/api/:id", "/api/me"])).toEqual(["/api/me", "/api/:id", "/files/*"]);
  });
});

describe("staticFile", () => {
  test("serves clean URLs from a built directory and never leaves it", async () => {
    const dir = await fixture(["index.html", "about.html", "docs/index.html", "app.js"]);
    expect(staticFile(dir, "/")).toBe(join(dir, "index.html"));
    expect(staticFile(dir, "/about")).toBe(join(dir, "about.html"));
    expect(staticFile(dir, "/docs")).toBe(join(dir, "docs/index.html"));
    expect(staticFile(dir, "/app.js")).toBe(join(dir, "app.js"));
    expect(staticFile(dir, "/nope")).toBeNull();
    expect(staticFile(dir, "/../../etc/passwd")).toBeNull();
  });
});
