import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { revealActive } from "./sidebar-active-scroll";

// happy-dom has no XPathEvaluator, which htmx uses only to find hx-on attributes.
(globalThis as Record<string, unknown>).XPathEvaluator ??= class {
  createExpression() {
    return { evaluate: () => ({ iterateNext: () => null }) };
  }
};
// The ESM build (htmx.org's main entry has no default export under Bun); untyped, hence the cast.
const esm: string = "htmx.org/dist/htmx.esm.js";
const htmx = (await import(esm)).default as { swap(ctx: object): Promise<void>; registerExtension(name: string, ext: object): void };

// happy-dom has no layout: a fake one where a sidebar is 100px tall (or 0 with data-hidden)
// and each link in it is 20px, stacked from the top and moved by the sidebar's scrollTop.
const ITEM = 20;
const VIEW = 100;
// (happy-dom defines getBoundingClientRect on Element and clientHeight on HTMLElement.)
const proto = Element.prototype;
const originalRect = proto.getBoundingClientRect;
const originalHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight")!;
const sidebarOf = (el: Element) => el.closest("[hx-sidebar-active-scroll]");
beforeAll(() => {
  proto.getBoundingClientRect = function (this: Element) {
    const sidebar = sidebarOf(this);
    if (sidebar === this) return { top: 0, height: VIEW } as DOMRect;
    if (sidebar && this.tagName === "A") {
      const index = [...sidebar.querySelectorAll("a")].indexOf(this as HTMLAnchorElement);
      return { top: index * ITEM - sidebar.scrollTop, height: ITEM } as DOMRect;
    }
    return originalRect.call(this);
  };
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get(this: Element) {
      if (this.matches("[hx-sidebar-active-scroll]")) return this.hasAttribute("data-hidden") ? 0 : VIEW;
      return originalHeight.get!.call(this);
    },
  });
});
afterAll(() => {
  proto.getBoundingClientRect = originalRect;
  Object.defineProperty(HTMLElement.prototype, "clientHeight", originalHeight);
});

/** A sidebar of 50 links with link `active` (1-based) as the current page. */
const sidebar = (active: number, attrs = 'hx-sidebar-active-scroll="nav"') =>
  `<nav ${attrs}>${Array.from({ length: 50 }, (_, i) => `<a href="/p${i + 1}"${i + 1 === active ? ' aria-current="page"' : ""}>Page ${i + 1}</a>`).join("")}</nav>`;
const nav = () => document.querySelector<HTMLElement>("[hx-sidebar-active-scroll]")!;

function swap(target: string, text: string, style = "innerHTML") {
  const el = document.querySelector(target)!;
  return htmx.swap({ text, target: el, swap: style, sourceElement: el });
}

describe("revealActive", () => {
  test("centre puts the active item in the middle of the sidebar", () => {
    document.body.innerHTML = sidebar(41); // top at 800px
    expect(revealActive(nav(), "center")).toBe(true);
    expect(nav().scrollTop).toBe(800 - (VIEW - ITEM) / 2);
  });

  test("nearest leaves an item in view alone", () => {
    document.body.innerHTML = sidebar(3);
    expect(revealActive(nav(), "nearest")).toBe(false);
    expect(nav().scrollTop).toBe(0);
  });

  test("nearest scrolls just enough, with a neighbour's height to spare", () => {
    document.body.innerHTML = sidebar(41);
    revealActive(nav(), "nearest");
    expect(nav().scrollTop).toBe(800 + ITEM - VIEW + ITEM); // the item ends one item above the bottom
    nav().scrollTop = 900;
    revealActive(nav(), "nearest");
    expect(nav().scrollTop).toBe(800 - ITEM); // one item below the top
  });

  test("hx-sidebar-active-item picks another active item", () => {
    document.body.innerHTML = sidebar(0, 'hx-sidebar-active-scroll="nav" hx-sidebar-active-item=".here"');
    nav().querySelectorAll("a")[30]!.className = "here";
    revealActive(nav(), "center");
    expect(nav().scrollTop).toBe(600 - (VIEW - ITEM) / 2);
  });

  test("does nothing without an active item or before the sidebar has a height", () => {
    document.body.innerHTML = sidebar(0);
    expect(revealActive(nav(), "center")).toBe(false);
    document.body.innerHTML = sidebar(41, 'hx-sidebar-active-scroll="nav" data-hidden');
    expect(revealActive(nav(), "center")).toBe(false);
    expect(nav().scrollTop).toBe(0);
  });
});

describe("sidebar-active-scroll extension", () => {
  beforeAll(async () => {
    document.body.innerHTML = `<main id="page">${sidebar(41)}</main>`;
    const { registerSidebarActiveScroll } = await import("./sidebar-active-scroll");
    registerSidebarActiveScroll(htmx);
    registerSidebarActiveScroll(htmx); // a second registration is ignored
  });

  test("centres the active item when registered (a fresh page load)", () => {
    expect(nav().scrollTop).toBe(800 - (VIEW - ITEM) / 2);
  });

  test("keeps the old position when the new active item is in view", async () => {
    document.body.innerHTML = `<main id="page">${sidebar(10)}</main>`;
    nav().scrollTop = 150; // page 10 is at 180px: in view
    await swap("#page", sidebar(11)); // page 11 at 200px: in view with a neighbour to spare
    expect(nav().scrollTop).toBe(150);
  });

  test("scrolls the new active item into view when the old position hides it", async () => {
    document.body.innerHTML = `<main id="page">${sidebar(2)}</main>`;
    await swap("#page", sidebar(41)); // a link in the page led far down the list
    expect(nav().scrollTop).toBe(800 + ITEM - VIEW + ITEM);
  });

  test("centres a sidebar that is new to the page", async () => {
    document.body.innerHTML = `<main id="page"></main>`;
    await swap("#page", sidebar(41));
    expect(nav().scrollTop).toBe(800 - (VIEW - ITEM) / 2);
  });

  test("leaves a sidebar outside the swap alone", async () => {
    document.body.innerHTML = `${sidebar(41)}<main id="page"></main>`;
    nav().scrollTop = 0;
    await swap("#page", "<p>content</p>");
    expect(nav().scrollTop).toBe(0);
  });
});
