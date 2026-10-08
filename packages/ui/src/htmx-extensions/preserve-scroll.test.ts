import { beforeAll, describe, expect, test } from "bun:test";
import { registerPreserveScroll, restoreScroll, snapshotScroll } from "./preserve-scroll";

// happy-dom has no XPathEvaluator, which htmx uses only to find hx-on attributes.
(globalThis as Record<string, unknown>).XPathEvaluator ??= class {
  createExpression() {
    return { evaluate: () => ({ iterateNext: () => null }) };
  }
};
// The ESM build (htmx.org's main entry has no default export under Bun); untyped, hence the cast.
const esm: string = "htmx.org/dist/htmx.esm.js";
const htmx = (await import(esm)).default as { swap(ctx: object): Promise<void>; registerExtension(name: string, ext: object): void };

beforeAll(() => {
  registerPreserveScroll(htmx);
  registerPreserveScroll(htmx); // a second registration is ignored
});

const box = (attrs: string, label = "") => `<div ${attrs} style="height:50px;overflow:auto"><p style="height:500px">${label}</p></div>`;

function scroll(selector: string, top: number, left = 0) {
  const el = document.querySelector(selector)!;
  el.scrollTop = top;
  el.scrollLeft = left;
  return el;
}

function swap(target: string, text: string, style = "innerHTML") {
  const el = document.querySelector(target)!;
  return htmx.swap({ text, target: el, swap: style, sourceElement: el });
}

describe("preserve-scroll extension", () => {
  test("restores a container replaced by a swap", async () => {
    document.body.innerHTML = `<main id="main">${box('hx-preserve-scroll="nav"', "old")}</main>`;
    const before = scroll("[hx-preserve-scroll]", 120, 7);
    await swap("#main", box('hx-preserve-scroll="nav"', "new"));
    const after = document.querySelector("[hx-preserve-scroll]")!;
    expect(after).not.toBe(before);
    expect(after.textContent).toBe("new");
    expect(after.scrollTop).toBe(120);
    expect(after.scrollLeft).toBe(7);
  });

  test("ignores text nodes in the new content", async () => {
    document.body.innerHTML = `<main id="main">${box('id="t" hx-preserve-scroll')}</main>`;
    scroll("#t", 25);
    await swap("#main", `text before ${box('id="t" hx-preserve-scroll')} <!-- c --> after`);
    expect(document.querySelector("#t")!.scrollTop).toBe(25);
  });

  test("uses the id when the attribute is empty, and supports several keys", async () => {
    document.body.innerHTML = `<main id="main">${box('id="a" hx-preserve-scroll')}${box('id="b" hx-preserve-scroll')}</main>`;
    scroll("#a", 30);
    scroll("#b", 90);
    await swap("#main", `${box('id="b" hx-preserve-scroll')}${box('id="a" hx-preserve-scroll')}`);
    expect(document.querySelector("#a")!.scrollTop).toBe(30);
    expect(document.querySelector("#b")!.scrollTop).toBe(90);
  });

  test("matches a repeated key in document order", async () => {
    const rows = (n: number) => Array.from({ length: n }, () => box('class="row" hx-preserve-scroll="row"')).join("");
    document.body.innerHTML = `<main id="main">${rows(3)}</main>`;
    const els = document.querySelectorAll(".row");
    [10, 20, 30].forEach((top, i) => (els[i]!.scrollTop = top));
    await swap("#main", rows(3));
    expect([...document.querySelectorAll(".row")].map((el) => el.scrollTop)).toEqual([10, 20, 30]);
  });

  test("survives an outerHTML swap of the container itself", async () => {
    document.body.innerHTML = box('id="log" hx-preserve-scroll');
    scroll("#log", 200);
    await swap("#log", box('id="log" hx-preserve-scroll', "new"), "outerHTML");
    expect(document.querySelector("#log")!.textContent).toBe("new");
    expect(document.querySelector("#log")!.scrollTop).toBe(200);
  });

  test("leaves containers outside the swap alone", async () => {
    document.body.innerHTML = `${box('id="side" hx-preserve-scroll')}<main id="main"></main>`;
    const side = scroll("#side", 40);
    const listener = () => (side.scrollTop = 80); // the reader scrolls while the swap runs
    document.addEventListener("htmx:before:settle", listener, { once: true });
    await swap("#main", "<p>content</p>");
    expect(side.scrollTop).toBe(80);
  });

  test('hx-preserve-scroll="false" opts out', async () => {
    document.body.innerHTML = `<main id="main">${box('id="x" hx-preserve-scroll')}</main>`;
    scroll("#x", 60);
    await swap("#main", box('id="x" hx-preserve-scroll="false"'));
    expect(document.querySelector("#x")!.scrollTop).toBe(0);
  });
});

describe("snapshotScroll / restoreScroll", () => {
  test("can be used directly around a manual DOM replacement", () => {
    document.body.innerHTML = box('id="m" hx-preserve-scroll');
    scroll("#m", 55);
    const snapshot = snapshotScroll();
    document.body.innerHTML = box('id="m" hx-preserve-scroll');
    restoreScroll(snapshot);
    expect(document.querySelector("#m")!.scrollTop).toBe(55);
  });
});
