import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compose } from "./compose";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "html-compose-"));
  for (const [name, body] of Object.entries(files)) {
    const path = join(dir, name);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, body);
  }
  return dir;
}

describe("layout", () => {
  test("wraps a fragment and fills the default slot", async () => {
    const dir = await fixture({
      "layout.html": "<html><body><main><slot></slot></main></body></html>",
      "page.html": "<layout src=\"layout.html\"><p>hi</p></layout>",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<html><body><main><p>hi</p></main></body></html>");
  });

  test("fills named slots and strips the template wrapper", async () => {
    const dir = await fixture({
      "layout.html": "<title><slot name=\"title\">fallback</slot></title><slot name=\"head\"></slot><slot></slot>",
      "page.html":
        "<layout src=\"layout.html\"><template slot=\"title\">Home</template><template slot=\"head\"><meta /></template><p>body</p></layout>",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<title>Home</title><meta /><p>body</p>");
  });

  test("uses fallback content when a slot is not provided", async () => {
    const dir = await fixture({
      "layout.html": "<title><slot name=\"title\">Default</slot></title><slot></slot>",
      "page.html": "<layout src=\"layout.html\"><p>x</p></layout>",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<title>Default</title><p>x</p>");
  });

  test("resolves nested layouts, innermost first", async () => {
    const dir = await fixture({
      "inner.html": "<main><slot></slot></main>",
      "outer.html": "<body><slot name=\"head\"></slot><slot></slot></body>",
      "page.html": "<layout src=\"outer.html\"><template slot=\"head\"><h1>T</h1></template><layout src=\"inner.html\"><p>b</p></layout></layout>",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<body><h1>T</h1><main><p>b</p></main></body>");
  });

  test("throws with a helpful message when a required slot is unfilled", async () => {
    const dir = await fixture({
      "layout.html": "<head><slot name=\"meta\" required /></head>",
      "page.html": "<layout src=\"layout.html\"></layout>",
    });
    await expect(compose(join(dir, "page.html"))).rejects.toThrow(/no content for layout slot\(s\): meta/);
  });

  test("unfilled optional slots render as empty", async () => {
    const dir = await fixture({
      "layout.html": "<head><slot name=\"meta\"></slot></head>",
      "page.html": "<layout src=\"layout.html\"></layout>",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<head></head>");
  });

  test("detects circular layouts", async () => {
    const dir = await fixture({
      "a.html": "<layout src=\"b.html\"><slot></slot></layout>",
      "b.html": "<layout src=\"a.html\"><slot></slot></layout>",
      "page.html": "<layout src=\"a.html\"><p>x</p></layout>",
    });
    expect(compose(join(dir, "page.html"))).rejects.toThrow(/circular <layout>/);
  });
});

describe("include", () => {
  test("inlines a partial", async () => {
    const dir = await fixture({
      "nav.html": "<nav><a href=\"/\">Home</a></nav>",
      "page.html": "<body><include src=\"nav.html\" /></body>",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<body><nav><a href=\"/\">Home</a></nav></body>");
  });

  test("inlines includes nested inside included files", async () => {
    const dir = await fixture({
      "inner.html": "<i>deep</i>",
      "outer.html": "<o><include src=\"inner.html\" /></o>",
      "page.html": "<include src=\"outer.html\" />",
    });
    expect(await compose(join(dir, "page.html"))).toBe("<o><i>deep</i></o>");
  });

  test("throws when the partial does not exist", async () => {
    const dir = await fixture({ "page.html": "<include src=\"missing.html\" />" });
    expect(compose(join(dir, "page.html"))).rejects.toThrow(/template not found/);
  });

  test("throws on a circular include", async () => {
    const dir = await fixture({ "a.html": "<include src=\"b.html\" />", "b.html": "<include src=\"a.html\" />", "page.html": "<include src=\"a.html\" />" });
    expect(compose(join(dir, "page.html"))).rejects.toThrow(/circular <include>/);
  });

  test("paired include fills the partial's own slots", async () => {
    const dir = await fixture({
      "card.html": "<div class=\"card\"><slot name=\"title\"></slot><slot></slot></div>",
      "layout.html": "<body><slot></slot></body>",
      "page.html":
        "<layout src=\"layout.html\"><include src=\"card.html\"><template slot=\"title\">T</template><p>p</p></include></layout>",
    });
    expect(await compose(join(dir, "page.html"))).toBe('<body><div class="card">T<p>p</p></div></body>');
  });

  test("errors when a paired include targets a slot the partial does not declare", async () => {
    const dir = await fixture({
      "nav.html": "<nav>n</nav>",
      "page.html": "<include src=\"nav.html\"><p>stray</p></include>",
    });
    await expect(compose(join(dir, "page.html"))).rejects.toThrow(/unknown slot\(s\): default/);
  });
});

describe("url rebasing", () => {
  test("rewrites relative urls in layouts and partials to the page's depth", async () => {
    const dir = await fixture({
      "shared/nav.html": "<a href=\"../pages/index.html\">x</a>",
      "layouts/base.html": "<script src=\"../app.ts\"></script><include src=\"../shared/nav.html\" /><slot></slot>",
      "pages/nested/page.html": "<layout src=\"../../layouts/base.html\">body</layout>",
    });
    const html = await compose(join(dir, "pages/nested/page.html"));
    // app.ts is <dir>/app.ts; the page sits two levels deeper.
    expect(html).toContain('src="../../app.ts"');
    // pages/index.html is one level up from pages/nested.
    expect(html).toContain('href="../index.html"');
  });

  test("leaves absolute urls and fragments untouched", async () => {
    const dir = await fixture({
      "layout.html": "<script src=\"/abs.ts\"></script><link href=\"https://x.dev/a.css\" /><a href=\"#top\" /><img src=\"data:,x\" /><slot></slot>",
      "pages/page.html": "<layout src=\"../layout.html\"></layout>",
    });
    const html = await compose(join(dir, "pages/page.html"));
    expect(html).toContain('src="/abs.ts"');
    expect(html).toContain('href="https://x.dev/a.css"');
    expect(html).toContain('href="#top"');
    expect(html).toContain('src="data:,x"');
  });

  test("preserves url fragments and query strings", async () => {
    const dir = await fixture({
      "target.html": "x",
      "layout.html": "<a href=\"target.html#frag\">x</a><a href=\"target.html?v=1\">y</a><slot></slot>",
      "pages/page.html": "<layout src=\"../layout.html\"></layout>",
    });
    const html = await compose(join(dir, "pages/page.html"));
    expect(html).toContain('href="../target.html#frag"');
    expect(html).toContain('href="../target.html?v=1"');
  });
});

describe("pages", () => {
  test("composes the project's real pages into full documents", async () => {
    const home = await compose("src/pages/index.html");
    expect(home.startsWith("<!doctype html>")).toBe(true);
    expect(home).toContain("<title>Home · HTMX UI</title>");
    expect(home).toContain('src="../app.ts"');
    expect(home).toContain("HTMX UI");
    expect(home).not.toContain("<layout");
    expect(home).not.toContain("<include");
    expect(home).not.toContain("<slot");
    expect(home).not.toContain("<template");

    const about = await compose("src/pages/about.html");
    expect(about).toContain("<title>About · HTMX UI</title>");
    expect(about).toContain("<h1 class=\"text-2xl font-bold\">About</h1>");
  });

  test("the layout inlines the nav, the theme toggle and the pre-paint theme script", async () => {
    const home = await compose("src/pages/index.html");
    expect(home).toContain("<nav ");
    expect(home).toContain("data-theme-toggle");
    expect(home).toContain('data-theme-label');
    expect(home).toContain('classList.toggle("dark"');
    expect(home).toContain("dark:bg-gray-950");
    expect(home).toContain("data-year");
  });
});
