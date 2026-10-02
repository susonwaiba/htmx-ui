import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { archiveDocs, archiveFile, rewriteMarkdown, rewriteUrl, versionsManifest } from "./versions";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "versions-"));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

describe("rewriteUrl", () => {
  const assets = new Set(["chunk-a.js", "logo-b.svg"]);
  const fix = (url: string, dir = "docs/components") => rewriteUrl(url, "0.1", dir, assets);

  test("keeps docs links inside the snapshot", () => {
    expect(fix("/docs")).toBe("/docs/v0.1");
    expect(fix("/docs.md")).toBe("/docs/v0.1.md");
    expect(fix("/docs/components/button")).toBe("/docs/v0.1/components/button");
    expect(fix("/docs/theming#tokens")).toBe("/docs/v0.1/theming#tokens");
  });

  test("leaves other versions, the manifest, other routes and external URLs alone", () => {
    for (const url of ["/docs/v0.0/x", "/docs/versions.json", "/docsearch", "/about", "/api/hello", "https://x.dev/docs", "#top", ""]) {
      expect(fix(url)).toBe(url);
    }
  });

  test("points relative asset references at the snapshot's _assets", () => {
    expect(fix("../../chunk-a.js")).toBe("/docs/v0.1/_assets/chunk-a.js");
    expect(fix("../chunk-a.js?x=1", "docs")).toBe("/docs/v0.1/_assets/chunk-a.js?x=1");
    expect(fix("./not-an-asset.png")).toBe("./not-an-asset.png");
  });
});

test("rewriteMarkdown fixes links and frontmatter but not code", () => {
  const md = '---\nurl: "/docs/tabs"\n---\n\nSee [card](/docs/components/card).\n\n```\nfetch("/docs/x")\n```\n';
  expect(rewriteMarkdown(md, "0.1")).toBe(
    '---\nurl: "/docs/v0.1/tabs"\n---\n\nSee [card](/docs/v0.1/components/card).\n\n```\nfetch("/docs/x")\n```\n',
  );
});

describe("archiveDocs", () => {
  async function build() {
    return fixture({
      "chunk-a.js": "js",
      "chunk-b.css": "css",
      "assets/app-c.js": "app",
      "assets/icons/sun.svg": "<svg/>",
      "index.html": "<html><head></head><body>home</body></html>",
      "sitemap.json": "{}",
      "docs.md": '---\nurl: "/docs"\n---\n[x](/docs/x)\n',
      "docs/index.html":
        '<html><head><link rel="stylesheet" href="../chunk-b.css"></head><body>' +
        '<a href="/docs/x">x</a><a href="/docs/versions" data-version-link>v</a><script src="../chunk-a.js"></script></body></html>',
      "docs/x.html":
        '<html><head><link rel="modulepreload" href="../assets/app-c.js"></head><body><button data-markdown-copy="/docs/x.md"></button>' +
        '<script type="module" src="../assets/app-c.js"></script></body></html>',
      "docs/x.md": "[home](/docs)\n",
      "docs/versions.json": "{}",
      "docs/sitemap.json": JSON.stringify({ url: "https://x.dev", version: "0.1", pages: [{ url: "/docs/x", absoluteUrl: "https://x.dev/docs/x", markdown: "/docs/x.md", sections: [] }] }),
      "docs/v0.0/index.html": "older snapshot",
    });
  }

  test("snapshots pages, Markdown and assets with rewritten links", async () => {
    const dist = await build();
    const archive = await fixture({});
    const pages = await archiveDocs({ dist, id: "0.1", archive });

    expect(pages).toEqual(["", "/x"]);
    expect(await Bun.file(join(archive, "v0.1/pages.json")).json()).toEqual(["", "/x"]);

    const index = await Bun.file(join(archive, "v0.1/index.html")).text();
    expect(index).toContain('href="/docs/v0.1/_assets/chunk-b.css"');
    expect(index).toContain('src="/docs/v0.1/_assets/chunk-a.js"');
    expect(index).toContain('href="/docs/v0.1/x"');
    expect(index).toContain('href="/docs/versions" data-version-link'); // switcher links untouched
    expect(index).toContain('<meta name="robots" content="noindex" />');

    const x = await Bun.file(join(archive, "v0.1/x.html")).text();
    expect(x).toContain('data-markdown-copy="/docs/v0.1/x.md"');
    // The engine's assets/ directory flattens into _assets/; its icons/ copy stays out
    expect(x).toContain('src="/docs/v0.1/_assets/app-c.js"');
    expect(x).toContain('<link rel="modulepreload" href="/docs/v0.1/_assets/app-c.js">');
    expect(await Bun.file(join(archive, "v0.1/_assets/app-c.js")).text()).toBe("app");
    expect(await Bun.file(join(archive, "v0.1/_assets/sun.svg")).exists()).toBe(false);
    expect(await Bun.file(join(archive, "v0.1/x.md")).text()).toBe("[home](/docs/v0.1)\n");
    expect(await Bun.file(join(archive, "v0.1.md")).text()).toContain('url: "/docs/v0.1"');
    expect(await Bun.file(join(archive, "v0.1/_assets/chunk-a.js")).text()).toBe("js");

    // The version's own sitemap, with URLs moved under /docs/v0.1
    const map = await Bun.file(join(archive, "v0.1/sitemap.json")).json();
    expect(map.version).toBe("0.1");
    expect(map.pages[0]).toMatchObject({ url: "/docs/v0.1/x", absoluteUrl: "https://x.dev/docs/v0.1/x", markdown: "/docs/v0.1/x.md" });

    // Older snapshots, the manifest and non-docs pages aren't copied in
    expect(await Bun.file(join(archive, "v0.1/v0.0/index.html")).exists()).toBe(false);
    expect(await Bun.file(join(archive, "v0.1/versions.json")).exists()).toBe(false);
    expect(await Bun.file(join(archive, "v0.1/_assets/sitemap.json")).exists()).toBe(false);
  });

  test("refuses to overwrite an existing snapshot", async () => {
    const dist = await build();
    const archive = await fixture({ "v0.1/index.html": "x" });
    await expect(archiveDocs({ dist, id: "0.1", archive })).rejects.toThrow(/already exists/);
  });
});

describe("archiveFile", () => {
  test("maps /docs/v<id>/ URLs to snapshot files", async () => {
    const archive = await fixture({ "v0.1/index.html": "", "v0.1/x.html": "", "v0.1/x.md": "", "v0.1.md": "", "v0.1/_assets/a.js": "" });
    expect(await archiveFile("/docs/v0.1", archive)).toBe(join(archive, "v0.1/index.html"));
    expect(await archiveFile("/docs/v0.1/", archive)).toBe(join(archive, "v0.1/index.html"));
    expect(await archiveFile("/docs/v0.1/x", archive)).toBe(join(archive, "v0.1/x.html"));
    expect(await archiveFile("/docs/v0.1/x.md", archive)).toBe(join(archive, "v0.1/x.md"));
    expect(await archiveFile("/docs/v0.1.md", archive)).toBe(join(archive, "v0.1.md"));
    expect(await archiveFile("/docs/v0.1/_assets/a.js", archive)).toBe(join(archive, "v0.1/_assets/a.js"));
    expect(await archiveFile("/docs/v0.1/missing", archive)).toBeNull();
    expect(await archiveFile("/docs/v0.1/../../etc/passwd", archive)).toBeNull();
    expect(await archiveFile("/docs/components", archive)).toBeNull();
  });
});

test("versionsManifest lists versions with paths and pages", async () => {
  const dir = await fixture({
    "versions.json": JSON.stringify({ latest: "0.2", versions: [{ id: "0.2", label: "v0.2" }, { id: "0.1", label: "v0.1", released: "2026-01-01", archived: true }] }),
    "archive/v0.1/pages.json": '["", "/old"]',
  });
  const manifest = await versionsManifest(["/docs", "/docs/new"], join(dir, "archive"), join(dir, "versions.json"));
  expect(manifest).toEqual({
    latest: "0.2",
    versions: [
      { id: "0.2", label: "v0.2", released: null, path: "/docs", latest: true, sitemap: "/docs/sitemap.json", pages: ["", "/new"] },
      { id: "0.1", label: "v0.1", released: "2026-01-01", path: "/docs/v0.1", latest: false, sitemap: "/docs/v0.1/sitemap.json", pages: ["", "/old"] },
    ],
  });
});
