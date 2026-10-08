// Source links in pages rendered at runtime, and the build manifest that maps them
// to the bundles a build wrote.
import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { builtTags, manifestTags, pageSources, readManifest, swapAssets, writeManifest, type Manifest } from "./assets";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = realpathSync(await mkdtemp(join(tmpdir(), "htmx-ui-assets-")));
  for (const [name, body] of Object.entries(files)) {
    await mkdir(join(dir, name, ".."), { recursive: true });
    await writeFile(join(dir, name), body);
  }
  return dir;
}

describe("assets", () => {
  test("swapAssets replaces a page's source scripts and stylesheets, and nothing else", () => {
    const html =
      '<head><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/styles.css"><script type="module" src="/app.ts"></script>' +
      '<script src="https://cdn.example/x.js"></script><script>inline()</script></head><body><script type="module" src="/page.ts"></script></body>';
    let seen: string[] = [];
    const out = swapAssets(html, () => true, (sources) => ((seen = sources), "<BUNDLES>"));
    expect(seen).toEqual(["styles.css", "app.ts", "page.ts"]);
    expect(out).toBe(
      '<head><link rel="icon" href="/favicon.svg"><BUNDLES><script src="https://cdn.example/x.js"></script><script>inline()</script></head><body></body>',
    );
    // Not accepted, no sources, or no answer: unchanged.
    expect(swapAssets(html, () => false, () => "x")).toBe(html);
    expect(swapAssets(html, () => true, () => null)).toBe(html);
    expect(swapAssets("<p>hi</p>", () => true, () => "x")).toBe("<p>hi</p>");
  });

  test("pageSources reads the page as the bundler sees it: relative or root-absolute, never public or remote", async () => {
    const root = await fixture({});
    const html =
      '<script type="module" src="../../app.ts?ver=1"></script><link rel="stylesheet" href="/styles.css">' +
      '<link rel="stylesheet" href="/print.css"><script src="https://cdn.example/x.js"></script><img src="../../logo.png">';
    expect(pageSources(html, join(root, "pages/docs/intro.html"), root, null)).toEqual(["app.ts", "styles.css", "print.css"]);
    // /print.css is in public/: copied as-is, not bundled.
    await mkdir(join(root, "public"));
    await writeFile(join(root, "public/print.css"), "");
    expect(pageSources(html, join(root, "pages/docs/intro.html"), root, join(root, "public"))).toEqual(["app.ts", "styles.css"]);
  });

  test("the manifest maps a page's sources to its built tags, root-absolute", async () => {
    const out = await fixture({
      "docs/intro.html":
        '<link rel="stylesheet" crossorigin href="../assets/index-a.css"><script type="module" crossorigin src="../assets/index-b.js"></script>' +
        '<link rel="modulepreload" crossorigin href="../assets/chunk-c.js"><link rel="icon" href="/favicon.svg"><script src="https://cdn.example/x.js"></script>',
      "favicon.svg": "<svg/>",
    });
    expect(builtTags(join(out, "docs/intro.html"), out, null)).toBe(
      '<link rel="stylesheet" crossorigin href="/assets/index-a.css"><script type="module" crossorigin src="/assets/index-b.js"></script>' +
        '<link rel="modulepreload" crossorigin href="/assets/chunk-c.js">',
    );
    writeManifest(out, null, [
      { sources: ["app.ts"], built: join(out, "docs/intro.html") },
      { sources: [], built: join(out, "docs/intro.html") },
    ]);
    const manifest = readManifest(out)!;
    expect(Object.keys(manifest.pages)).toEqual(["app.ts"]);
    expect(readManifest(join(out, "nope"))).toBeNull();
  });

  test("manifestTags: the exact sources, else each source's own page, else nothing", () => {
    const manifest: Manifest = {
      version: 1,
      pages: {
        "app.ts": '<script type="module" crossorigin src="/assets/app.js"></script><link rel="modulepreload" crossorigin href="/assets/shared.js">',
        "admin.ts": '<script type="module" crossorigin src="/assets/admin.js"></script><link rel="modulepreload" crossorigin href="/assets/shared.js">',
        "app.ts|page.ts": '<script type="module" crossorigin src="/assets/page.js"></script>',
      },
    };
    expect(manifestTags(manifest, ["app.ts", "page.ts"])).toBe('<script type="module" crossorigin src="/assets/page.js"></script>');
    // A combination no built page had: each source's own tags, a shared chunk once.
    expect(manifestTags(manifest, ["app.ts", "admin.ts"])).toBe(
      '<script type="module" crossorigin src="/assets/app.js"></script><link rel="modulepreload" crossorigin href="/assets/shared.js">' +
        '<script type="module" crossorigin src="/assets/admin.js"></script>',
    );
    expect(manifestTags(manifest, ["app.ts", "unbuilt.ts"])).toBeNull();
  });
});
