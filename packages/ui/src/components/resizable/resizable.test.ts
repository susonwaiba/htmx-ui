import { beforeEach, describe, expect, test } from "bun:test";
import { initResizable } from "./resizable";

const flex = (id: string) => document.getElementById(id)!.style.flex;
const grow = (id: string) => Number.parseFloat(flex(id));
const group = () => document.querySelector<HTMLElement>("[data-resizable]")!;
const handle = (i = 0) => document.querySelectorAll<HTMLElement>("[data-resizable-handle]")[i]!;
const key = (el: HTMLElement, k: string, shiftKey = false) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, shiftKey, bubbles: true }));

/** happy-dom lays nothing out; give the group (and its handles) a size for drags. */
function sized(width = 1000) {
  const g = group();
  g.getBoundingClientRect = () => ({ width, height: 400, top: 0, left: 0, right: width, bottom: 400, x: 0, y: 0, toJSON() {} }) as DOMRect;
  document.querySelectorAll<HTMLElement>("[data-resizable-handle]").forEach((h) => {
    h.getBoundingClientRect = () => ({ width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {} }) as DOMRect;
    h.setPointerCapture = () => {};
  });
}

function drag(h: HTMLElement, from: number, to: number) {
  h.dispatchEvent(new PointerEvent("pointerdown", { button: 0, clientX: from, pointerId: 1, bubbles: true }));
  h.dispatchEvent(new PointerEvent("pointermove", { clientX: to, pointerId: 1, bubbles: true }));
  h.dispatchEvent(new PointerEvent("pointerup", { clientX: to, pointerId: 1, bubbles: true }));
}

const THREE = `
  <div class="resizable" data-resizable>
    <div data-resizable-panel id="a" data-size="20" data-min="10" data-max="40" data-collapsible></div>
    <div data-resizable-handle></div>
    <div data-resizable-panel id="b"></div>
    <div data-resizable-handle></div>
    <div data-resizable-panel id="c" data-size="30" data-min="20"></div>
  </div>
  <button data-resizable-toggle="a">Files</button>`;

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

describe("resizable", () => {
  test("initialises once and shares the unsized space", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    initResizable(document);
    expect(group().hasAttribute("data-init")).toBe(true);
    expect([grow("a"), grow("b"), grow("c")]).toEqual([20, 50, 30]);
  });

  test("handles are separators describing the panel before them", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    const h = handle(0);
    expect(h.getAttribute("role")).toBe("separator");
    expect(h.getAttribute("aria-orientation")).toBe("vertical");
    expect(h.getAttribute("aria-valuenow")).toBe("20");
    expect(h.getAttribute("aria-valuemin")).toBe("10");
    expect(h.getAttribute("aria-valuemax")).toBe("40");
    expect(h.getAttribute("aria-controls")).toBe("a");
    expect(h.tabIndex).toBe(0);
  });

  test("arrow keys resize within the panels' limits", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    key(handle(0), "ArrowRight");
    expect([grow("a"), grow("b")]).toEqual([25, 45]);
    key(handle(0), "ArrowLeft", true);
    expect(grow("a")).toBe(24);
    key(handle(0), "End");
    expect(grow("a")).toBe(40); // a's max
    key(handle(1), "End");
    expect([grow("b"), grow("c")]).toEqual([40, 20]); // c can't go under its min
    key(handle(0), "Home");
    expect(grow("a")).toBe(10);
  });

  test("dragging moves the boundary by the pointer's share of the group", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    sized(1000);
    drag(handle(0), 200, 300); // +100px of 1000 = +10%
    expect([grow("a"), grow("b"), grow("c")]).toEqual([30, 40, 30]);
    expect(group().hasAttribute("data-resizing")).toBe(false);
  });

  test("dragging a collapsible panel under half its minimum collapses it", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    sized(1000);
    drag(handle(0), 200, 160); // a would be 16%: stays open, clamps at min 10
    expect(grow("a")).toBe(16);
    drag(handle(0), 160, 0); // a would be 0% < 5%
    expect(document.getElementById("a")!.hasAttribute("data-collapsed")).toBe(true);
    expect(grow("b")).toBe(70);
    expect(handle(0).hidden).toBe(true);
  });

  test("toggle buttons collapse and reopen a panel, giving its space to the neighbour", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    const btn = document.querySelector<HTMLButtonElement>("[data-resizable-toggle]")!;
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(btn.getAttribute("aria-controls")).toBe("a");

    btn.click();
    expect(document.getElementById("a")!.hasAttribute("data-collapsed")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect([grow("b"), grow("c")]).toEqual([70, 30]); // c didn't move

    btn.click();
    expect([grow("a"), grow("b"), grow("c")]).toEqual([20, 50, 30]);
  });

  test("Enter on a handle collapses its collapsible neighbour", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    key(handle(0), "Enter");
    expect(document.getElementById("a")!.hasAttribute("data-collapsed")).toBe(true);
  });

  test("a collapsed middle panel leaves one handle between its neighbours", () => {
    document.body.innerHTML = `
      <div data-resizable>
        <div data-resizable-panel id="x"></div><div data-resizable-handle></div>
        <div data-resizable-panel id="y" data-collapsible></div><div data-resizable-handle></div>
        <div data-resizable-panel id="z"></div>
      </div><button data-resizable-toggle="y"></button>`;
    initResizable(document);
    document.querySelector<HTMLButtonElement>("button")!.click();
    expect([handle(0).hidden, handle(1).hidden]).toEqual([true, false]);
    // y's third went to z (its next neighbour); the remaining handle moves x / z.
    expect(grow("z")).toBeCloseTo(66.67, 1);
    key(handle(1), "ArrowRight");
    expect(grow("x")).toBeCloseTo(38.33, 1);
    expect(grow("z")).toBeCloseTo(61.67, 1);
  });

  test("data-resizable-id remembers sizes and collapsed panels", () => {
    const markup = THREE.replace("data-resizable>", 'data-resizable data-resizable-id="t">');
    document.body.innerHTML = markup;
    initResizable(document);
    key(handle(0), "ArrowRight");
    document.querySelector<HTMLButtonElement>("[data-resizable-toggle]")!.click();

    document.body.innerHTML = markup;
    initResizable(document);
    expect(document.getElementById("a")!.hasAttribute("data-collapsed")).toBe(true);
    document.querySelector<HTMLButtonElement>("[data-resizable-toggle]")!.click();
    expect(grow("a")).toBe(25);
  });

  test("double-click restores the starting layout", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    key(handle(0), "End");
    handle(0).dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    expect([grow("a"), grow("b"), grow("c")]).toEqual([20, 50, 30]);
  });

  test("fires resizable:change with sizes and collapsed panels", () => {
    document.body.innerHTML = THREE;
    initResizable(document);
    let detail: { sizes: number[]; collapsed: (string | number)[] } | null = null;
    group().addEventListener("resizable:change", (e) => (detail = (e as CustomEvent).detail));
    key(handle(0), "Enter");
    expect(detail!).toEqual({ sizes: [0, 70, 30], collapsed: ["a"] });
  });

  test("nested groups resize independently; vertical handles use the vertical axis", () => {
    document.body.innerHTML = `
      <div data-resizable id="outer">
        <div data-resizable-panel id="left"></div><div data-resizable-handle></div>
        <div data-resizable-panel id="right">
          <div data-resizable data-orientation="vertical">
            <div data-resizable-panel id="top"></div><div data-resizable-handle id="vh"></div>
            <div data-resizable-panel id="bottom"></div>
          </div>
        </div>
      </div>`;
    initResizable(document);
    const vh = document.getElementById("vh")!;
    expect(vh.getAttribute("aria-orientation")).toBe("horizontal");
    key(vh, "ArrowDown");
    expect([grow("top"), grow("bottom")]).toEqual([55, 45]);
    expect([grow("left"), grow("right")]).toEqual([50, 50]);
  });
});
