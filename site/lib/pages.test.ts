// The website's pages, rendered the way the engine renders them for the dev
// server and the build (site/lib/engine.ts: template roots, origin, heading anchors).
import { describe, expect, test } from "bun:test";
import { pagesOf, renderPage } from "htmx-ui-engine";
import { resolve } from "node:path";
import { engine } from "./engine";
import { PAGES } from "./paths";

const render = (path: string) => renderPage(engine, resolve(PAGES, path));
const files = pagesOf(engine).map((p) => p.path);

describe("pages", () => {
  test("renders every page into a full document with no template syntax left", async () => {
    for (const file of files) {
      const html = render(file);
      expect(html.startsWith("<!doctype html>")).toBe(true);
      expect(html).not.toMatch(/\{[%{#]/);
    }
  });

  test("no page nests a link inside a link (browsers break such markup apart)", async () => {
    for (const file of files) {
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
        .transform(render(file));
      expect(nested, file).toBe(0);
    }
  });

  test("the home page uses the site layout with header, theme toggle and pre-paint script", () => {
    const home = render("index.html");
    expect(home).toContain("<title>HTMX UI · Server-driven components for htmx</title>");
    expect(home).toContain('src="../app.ts"');
    expect(home).toContain("data-theme-toggle");
    expect(home).toContain('classList.toggle("dark"');
    expect(home).toContain("data-year");
    expect(home).not.toContain("data-sidebar");
  });

  test("docs pages get the sidebar, the active link, a section label and prev/next", () => {
    const page = render("docs/components/button.html");
    expect(page).toContain("<title>Button · HTMX UI</title>");
    expect(page).toContain('src="../../../app.ts"');
    expect(page).toMatch(/href="\/docs\/components\/button" class="sidebar-link" aria-current="page"/);
    expect(page).toContain('<p class="eyebrow">Components</p>');
    expect(page).toMatch(/Previous[\s\S]*?Badge/);
    expect(page).toMatch(/Next[\s\S]*?Button group/);
  });

  test("changelog version pages keep Changelog active in the sidebar", () => {
    const page = render("docs/changelog/0.1.0.html");
    expect(page).toMatch(/href="\/docs\/changelog" class="sidebar-link" aria-current="page"/);
  });

  test("only the closest nav entry is active, so a section can have pages of its own", () => {
    const index = render("docs/servers.html");
    expect(index).toMatch(/href="\/docs\/servers" class="sidebar-link" aria-current="page"/);
    expect(index).toContain('<p class="eyebrow">Servers</p>');

    const page = render("docs/servers/elysia.html");
    expect(page).toMatch(/href="\/docs\/servers\/elysia" class="sidebar-link" aria-current="page"/);
    expect(page).not.toMatch(/href="\/docs\/servers" class="sidebar-link" aria-current="page"/);
    expect(page).toContain('<p class="eyebrow">Servers</p>');

    // The section's pages are in prev/next order: Servers overview -> Elysia -> Express -> Hono.
    expect(page).toMatch(/Previous[\s\S]*?Server frameworks/);
    expect(page).toMatch(/Next[\s\S]*?Express/);
    expect(render("docs/servers/express.html")).toMatch(/Next[\s\S]*?Hono/);
    expect(render("docs/servers/hono.html")).toMatch(/Next[\s\S]*?Overview/);
  });

  test("code blocks highlight, escape markup and encode braces", () => {
    const page = render("docs/components/code-block.html");
    expect(page).toContain("color:var(--code-token-");
    expect(page.replace(/<[^>]+>/g, "")).toContain("&#123;% from"); // Nunjucks sample shown, not executed
    expect(page).not.toMatch(/\{[%{#]/);
  });

  test("cli() renders one synced tab per package manager", () => {
    const page = render("docs/installation.html");
    for (const cmd of ["npm install htmx-ui", "pnpm add htmx-ui", "yarn add htmx-ui", "bun add htmx-ui"]) {
      expect(page.replace(/<[^>]+>/g, "")).toContain(cmd);
    }
    expect(page).toContain('data-tabs-sync="pm"');
  });
});

describe("icon macro", () => {
  test("inlines by default, labels when asked, and links in img mode", () => {
    const html = render("docs/components/icon.html");
    expect(html).toMatch(/<svg[^>]*class="size-6"[^>]*aria-hidden="true"/);
    expect(html).toContain('<img src="../../../../packages/ui/src/icons/palette.svg"');
  });
});
