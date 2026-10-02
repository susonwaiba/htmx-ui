import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dedent, inlineSvg, render, renderPage } from "./render";
import { routeFor } from "./routes";

async function fixture(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "html-render-"));
  for (const [name, body] of Object.entries(files)) {
    const path = join(dir, name);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, body);
  }
  return dir;
}

describe("templates", () => {
  test("extends a layout and fills blocks, falling back to defaults", async () => {
    const dir = await fixture({
      "layout.html": "<title>{% block title %}Default{% endblock %}</title><main>{% block content %}{% endblock %}</main>",
      "page.html": '{% extends "layout.html" %}{% block content %}<p>hi</p>{% endblock %}',
    });
    expect(render(join(dir, "page.html"), dir)).toBe("<title>Default</title><main><p>hi</p></main>");
  });

  test("resolves include and extends names from the template root, not the page", async () => {
    const dir = await fixture({
      "partials/nav.html": "<nav></nav>",
      "layouts/base.html": '<body>{% include "partials/nav.html" %}{% block content %}{% endblock %}</body>',
      "pages/blog/post.html": '{% extends "layouts/base.html" %}{% block content %}x{% endblock %}',
    });
    expect(render(join(dir, "pages/blog/post.html"), dir)).toBe("<body><nav></nav>x</body>");
  });

  test("throws on a missing template", async () => {
    const dir = await fixture({ "page.html": '{% include "missing.html" %}' });
    expect(() => render(join(dir, "page.html"), dir)).toThrow(/missing\.html/);
  });

  test("throws on undefined variables instead of rendering nothing", async () => {
    const dir = await fixture({ "page.html": "{{ typo }}" });
    expect(() => render(join(dir, "page.html"), dir)).toThrow(/undefined/);
  });

  test("rejects pages outside the template root", async () => {
    const root = await fixture({});
    const other = await fixture({ "page.html": "x" });
    expect(() => render(join(other, "page.html"), root)).toThrow(/outside the template root/);
  });

  test("searches several roots in order, first match wins", async () => {
    const site = await fixture({ "layouts/a.html": "site:{% include 'shared.html' %}", "shared.html": "from-site", "pages/p.html": "{% include 'layouts/a.html' %}|{% include 'components/c.html' %}|{{ json('d.json').v }}" });
    const lib = await fixture({ "components/c.html": "from-lib", "shared.html": "lib-shadowed", "d.json": '{"v":"lib-json"}' });
    expect(render(join(site, "pages/p.html"), [site, lib])).toBe("site:from-site|from-lib|lib-json");
  });
});

describe("asset()", () => {
  test("is relative to the page being rendered, at any depth", async () => {
    const dir = await fixture({
      "app.ts": "",
      "layout.html": "<script src=\"{{ asset('app.ts') }}\"></script>",
      "pages/index.html": '{% extends "layout.html" %}',
      "pages/blog/post.html": '{% extends "layout.html" %}',
      "root.html": '{% extends "layout.html" %}',
    });
    expect(render(join(dir, "pages/index.html"), dir)).toBe('<script src="../app.ts"></script>');
    expect(render(join(dir, "pages/blog/post.html"), dir)).toBe('<script src="../../app.ts"></script>');
    expect(render(join(dir, "root.html"), dir)).toBe('<script src="./app.ts"></script>');
  });
});

describe("url", () => {
  test("is the route of a page under pages/, and empty elsewhere", async () => {
    const dir = await fixture({
      "pages/index.html": "[{{ url }}]",
      "pages/docs/index.html": "[{{ url }}]",
      "pages/docs/changelog/0.1.0.html": "[{{ url }}]",
      "layout.html": "[{{ url }}]",
    });
    expect(render(join(dir, "pages/index.html"), dir)).toBe("[/]");
    expect(render(join(dir, "pages/docs/index.html"), dir)).toBe("[/docs]");
    expect(render(join(dir, "pages/docs/changelog/0.1.0.html"), dir)).toBe("[/docs/changelog/0.1.0]");
    expect(render(join(dir, "layout.html"), dir)).toBe("[]");
  });

  test("routeFor maps page files to routes", () => {
    expect(routeFor("index.html")).toBe("/");
    expect(routeFor("about.html")).toBe("/about");
    expect(routeFor("docs/index.html")).toBe("/docs");
    expect(routeFor("docs/components/button.html")).toBe("/docs/components/button");
  });
});

describe("dedent", () => {
  test("strips shared indentation and blank edge lines, keeps relative indent", () => {
    expect(dedent("\n    <ul>\n      <li>x</li>\n    </ul>\n  ")).toBe("<ul>\n  <li>x</li>\n</ul>");
  });

  test("is registered as a filter", async () => {
    const dir = await fixture({ "page.html": "{{ '  a\n    b' | dedent }}" });
    expect(render(join(dir, "page.html"), dir)).toBe("a\n  b");
  });
});

describe("pages", () => {
  test("renders every page into a full document with no template syntax left", async () => {
    for await (const file of new Bun.Glob("site/pages/**/*.html").scan(".")) {
      const html = render(file);
      expect(html.startsWith("<!doctype html>")).toBe(true);
      expect(html).not.toMatch(/\{[%{#]/);
    }
  });

  test("no page nests a link inside a link (browsers break such markup apart)", async () => {
    for await (const file of new Bun.Glob("site/pages/**/*.html").scan(".")) {
      let depth = 0;
      let nested = 0;
      new HTMLRewriter()
        .on("a", {
          element(el) {
            if (depth > 0) nested++;
            depth++;
            el.onEndTag(() => void depth--);
          },
        })
        .transform(renderPage(file));
      expect(nested, file).toBe(0);
    }
  });

  test("the home page uses the site layout with header, theme toggle and pre-paint script", () => {
    const home = render("site/pages/index.html");
    expect(home).toContain("<title>HTMX UI · Server-driven components for htmx</title>");
    expect(home).toContain('src="../app.ts"');
    expect(home).toContain("data-theme-toggle");
    expect(home).toContain('classList.toggle("dark"');
    expect(home).toContain("data-year");
    expect(home).not.toContain("data-sidebar");
  });

  test("docs pages get the sidebar, the active link, a section label and prev/next", () => {
    const page = render("site/pages/docs/components/button.html");
    expect(page).toContain("<title>Button · HTMX UI</title>");
    expect(page).toContain('src="../../../app.ts"');
    expect(page).toMatch(/href="\/docs\/components\/button" class="sidebar-link" aria-current="page"/);
    expect(page).toContain('<p class="eyebrow">Components</p>');
    expect(page).toMatch(/Previous[\s\S]*?Badge/);
    expect(page).toMatch(/Next[\s\S]*?Button group/);
  });

  test("changelog version pages keep Changelog active in the sidebar", () => {
    const page = render("site/pages/docs/changelog/0.1.0.html");
    expect(page).toMatch(/href="\/docs\/changelog" class="sidebar-link" aria-current="page"/);
  });

  test("code blocks highlight, escape markup and encode braces", () => {
    const page = render("site/pages/docs/components/code-block.html");
    expect(page).toContain("color:var(--code-token-");
    expect(page.replace(/<[^>]+>/g, "")).toContain("&#123;% from"); // Nunjucks sample shown, not executed
    expect(page).not.toMatch(/\{[%{#]/);
  });

  test("cli() renders one synced tab per package manager", () => {
    const page = render("site/pages/docs/installation.html");
    for (const cmd of ["npm install htmx-ui", "pnpm add htmx-ui", "yarn add htmx-ui", "bun add htmx-ui"]) {
      expect(page.replace(/<[^>]+>/g, "")).toContain(cmd);
    }
    expect(page).toContain('data-tabs-sync="pm"');
  });
});

describe("globals", () => {
  test("json() reads a src-relative JSON file", async () => {
    const dir = await fixture({ "data/x.json": '{"items":[1,2,3]}', "page.html": "{{ json('data/x.json').items | join('-') }}" });
    expect(render(join(dir, "page.html"), dir)).toBe("1-2-3");
  });

  test("json() and svg() fail clearly on a missing file", async () => {
    const dir = await fixture({ "a.html": "{{ json('nope.json') }}", "b.html": "{{ svg('nope.svg') }}" });
    expect(() => render(join(dir, "a.html"), dir)).toThrow(/json\("nope.json"\): file not found/);
    expect(() => render(join(dir, "b.html"), dir)).toThrow(/svg\("nope.svg"\): file not found/);
  });

  test("svg() inlines the file and overrides root attributes", async () => {
    const dir = await fixture({
      "i.svg": '<?xml version="1.0"?><!-- c --><svg class="old" viewBox="0 0 1 1"><path/></svg>',
      "page.html": "{{ svg('i.svg', { class: 'size-4', 'aria-hidden': 'true', role: none }) }}",
    });
    expect(render(join(dir, "page.html"), dir)).toBe('<svg viewBox="0 0 1 1" class="size-4" aria-hidden="true"><path/></svg>');
  });

  test("inlineSvg escapes attribute values", () => {
    expect(inlineSvg("<svg></svg>", { "aria-label": 'a "b" & c' })).toBe('<svg aria-label="a &quot;b&quot; &amp; c"></svg>');
  });

  test("glob() lists src-relative paths, sorted", async () => {
    const dir = await fixture({ "icons/b.svg": "", "icons/a.svg": "", "page.html": "{{ glob('icons/*.svg') | join(',') }}" });
    expect(render(join(dir, "page.html"), dir)).toBe("icons/a.svg,icons/b.svg");
  });

  test("asset() fails the build for a missing file", async () => {
    const dir = await fixture({ "page.html": "{{ asset('nope.ts') }}" });
    expect(() => render(join(dir, "page.html"), dir)).toThrow(/asset\("nope.ts"\): file not found/);
  });

  test("asset() and url work inside macros imported without context", async () => {
    const dir = await fixture({
      "app.ts": "",
      "m.html": "{% macro m() %}{{ asset('app.ts') }} {{ url }}{% endmacro %}",
      "pages/docs/p.html": "{% from 'm.html' import m %}{{ m() }}",
    });
    expect(render(join(dir, "pages/docs/p.html"), dir)).toBe("../../app.ts /docs/p");
  });

  test("highlight filter colours known languages and escapes unknown ones", async () => {
    const dir = await fixture({ "a.html": "{{ 'const a = 1' | highlight('ts') }}", "b.html": "{{ '<b>' | highlight('nope') }}" });
    expect(render(join(dir, "a.html"), dir)).toContain("var(--code-token-keyword)");
    expect(render(join(dir, "b.html"), dir)).toBe("&lt;b&gt;");
  });
});

describe("icon macro", () => {
  test("inlines by default, labels when asked, and links in img mode", () => {
    const html = render("site/pages/docs/components/icon.html");
    expect(html).toMatch(/<svg[^>]*class="size-6"[^>]*aria-hidden="true"/);
    expect(html).toContain('<img src="../../../../src/icons/palette.svg"');
  });
});
