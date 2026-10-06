// The pagination() macro (htmx-ui/components/pagination/pagination.html), rendered by the engine with the package's src/ as a root.
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { render } from "htmx-ui-engine";
import { UI } from "./paths";

const SRC = UI;

async function macro(call: string): Promise<HTMLElement> {
  const dir = await mkdtemp(join(tmpdir(), "pagination-macro-"));
  await writeFile(join(dir, "t.html"), `{% from "components/pagination/pagination.html" import pagination %}${call}`);
  const host = document.createElement("div");
  host.innerHTML = render(join(dir, "t.html"), { roots: [dir, SRC] });
  return host;
}

/** The page items as text: numbers, "…", and the current page in brackets. */
const pages = (host: HTMLElement) =>
  [...host.querySelectorAll(".pagination-content > li > :not(.pagination-previous, .pagination-next, .pagination-first, .pagination-last)")]
    .map((el) => (el.matches(".pagination-ellipsis") ? "…" : el.getAttribute("aria-current") ? `[${el.textContent}]` : el.textContent))
    .join(" ");

describe("pagination() range", () => {
  test.each([
    [1, 10, "[1] 2 3 4 5 … 10"],
    [4, 10, "1 2 3 [4] 5 … 10"],
    [5, 10, "1 … 4 [5] 6 … 10"],
    [6, 10, "1 … 5 [6] 7 … 10"],
    [7, 10, "1 … 6 [7] 8 9 10"],
    [10, 10, "1 … 6 7 8 9 [10]"],
    [3, 7, "1 2 [3] 4 5 6 7"],
    [1, 1, "[1]"],
  ])("page %i of %i: %s", async (page, total, expected) => {
    expect(pages(await macro(`{{ pagination(${page}, ${total}) }}`))).toBe(expected);
  });

  test("siblings and boundaries widen the range", async () => {
    expect(pages(await macro(`{{ pagination(10, 20, siblings=2, boundaries=2) }}`))).toBe("1 2 … 8 9 [10] 11 12 … 19 20");
    expect(pages(await macro(`{{ pagination(10, 20, boundaries=0) }}`))).toBe("… 9 [10] 11 …");
  });

  test("clamps the page into 1…total", async () => {
    expect(pages(await macro(`{{ pagination(99, 5) }}`))).toBe("1 2 3 4 [5]");
    expect(pages(await macro(`{{ pagination(0, 5) }}`))).toBe("[1] 2 3 4 5");
  });
});

describe("pagination() links", () => {
  test("hrefs, labels, rel and the current page", async () => {
    const host = await macro(`{{ pagination(2, 3, href="/invoices?page={page}") }}`);
    const nav = host.querySelector("nav")!;
    expect(nav.className).toBe("pagination");
    expect(nav.getAttribute("aria-label")).toBe("Pagination");
    const prev = nav.querySelector(".pagination-previous")!;
    expect(prev.getAttribute("href")).toBe("/invoices?page=1");
    expect(prev.getAttribute("rel")).toBe("prev");
    expect(prev.textContent!.trim()).toBe("Previous");
    expect(nav.querySelector(".pagination-next")!.getAttribute("href")).toBe("/invoices?page=3");
    const current = nav.querySelector('[aria-current="page"]')!;
    expect(current.getAttribute("href")).toBe("/invoices?page=2");
    expect(current.getAttribute("aria-label")).toBe("Page 2");
  });

  test("previous and first are disabled on the first page, next and last on the last", async () => {
    const first = await macro(`{{ pagination(1, 3, first=true, last=true) }}`);
    for (const cls of ["first", "previous"]) {
      const a = first.querySelector(`.pagination-${cls}`)!;
      expect(a.getAttribute("aria-disabled")).toBe("true");
      expect(a.hasAttribute("href")).toBe(false);
    }
    expect(first.querySelector(".pagination-last")!.getAttribute("href")).toBe("?page=3");
    expect(first.querySelector(".pagination-last")!.getAttribute("aria-label")).toBe("Last page");
    const last = await macro(`{{ pagination(3, 3, first=true, last=true) }}`);
    expect(last.querySelector(".pagination-next")!.getAttribute("aria-disabled")).toBe("true");
    expect(last.querySelector(".pagination-last")!.getAttribute("aria-disabled")).toBe("true");
    expect(last.querySelector(".pagination-first")!.getAttribute("href")).toBe("?page=1");
  });

  test("icons-only previous / next without numbers, and custom labels", async () => {
    const host = await macro(`{{ pagination(2, 10, numbers=false, icons=true, previous="Newer", next="Older") }}`);
    expect(host.querySelectorAll(".pagination-content > li")).toHaveLength(2);
    expect(host.querySelector(".pagination-previous")!.getAttribute("aria-label")).toBe("Newer");
    expect(host.querySelector(".pagination-next")!.getAttribute("aria-label")).toBe("Older");
    expect(host.querySelector(".pagination-label")).toBeNull();
    const none = await macro(`{{ pagination(2, 3, previous=false, next=false) }}`);
    expect(none.querySelector(".pagination-previous, .pagination-next")).toBeNull();
  });

  test("attrs go on every enabled link, with {page} replaced", async () => {
    const host = await macro(
      `{{ pagination(1, 3, attrs={"hx-get": "/api/rows?page={page}", "hx-target": "#rows", "hx-push-url": "true"}) }}`,
    );
    expect(host.querySelector(".pagination-previous")!.hasAttribute("hx-get")).toBe(false);
    expect(host.querySelector('[aria-current="page"]')!.getAttribute("hx-get")).toBe("/api/rows?page=1");
    const next = host.querySelector(".pagination-next")!;
    expect(next.getAttribute("hx-get")).toBe("/api/rows?page=2");
    expect(next.getAttribute("hx-target")).toBe("#rows");
    expect(next.getAttribute("hx-push-url")).toBe("true");
  });

  test("modifier classes on the nav", async () => {
    const host = await macro(`{{ pagination(1, 3, size="sm", outline=true, responsive=true, label="Invoices pages", class="mt-4") }}`);
    const nav = host.querySelector("nav")!;
    expect(nav.className).toBe("pagination pagination-sm pagination-outline pagination-responsive mt-4");
    expect(nav.getAttribute("aria-label")).toBe("Invoices pages");
  });
});
