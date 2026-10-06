import { describe, expect, test } from "bun:test";
import { initDialog } from "../dialog/dialog";
import { initDrawer } from "./drawer";

// happy-dom has no layout: give elements a box so presses land inside them.
const box = (el: Element, r = { left: 0, top: 500, right: 400, bottom: 900, width: 400, height: 400 }) => {
  el.getBoundingClientRect = () => r as DOMRect;
};

const pointer = (el: Element, type: string, x: number, y: number, timeStamp = 0) => {
  const e = new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true });
  if (timeStamp) Object.defineProperty(e, "timeStamp", { value: timeStamp });
  el.dispatchEvent(e);
};

/** Press on `el`, drag by (dx, dy) in `steps` moves over `ms`, release. */
const drag = (el: Element, dx: number, dy: number, { steps = 5, ms = 500, x = 200, y = 600 } = {}) => {
  pointer(el, "pointerdown", x, y, 1000);
  for (let i = 1; i <= steps; i++) pointer(el, "pointermove", x + (dx * i) / steps, y + (dy * i) / steps, 1000 + (ms * i) / steps);
  pointer(el, "pointerup", x + dx, y + dy, 1000 + ms);
};

const tick = () => new Promise((r) => setTimeout(r, 0));

const setup = (attrs = "", body = "<p>Body</p>") => {
  document.body.innerHTML = `
    <dialog id="d" class="drawer" data-dialog data-drawer ${attrs}>
      <div class="drawer-handle"></div>
      ${body}
      <button id="b" type="button">Button</button>
    </dialog>`;
  initDialog(document);
  initDrawer(document);
  initDrawer(document);
  const drawer = document.querySelector<HTMLDialogElement>("dialog")!;
  box(drawer);
  drawer.showModal();
  return drawer;
};

describe("drawer", () => {
  test("initialises once, alongside the dialog behaviour", () => {
    const drawer = setup();
    expect(drawer.hasAttribute("data-drawer-init")).toBe(true);
    expect(drawer.hasAttribute("data-init")).toBe(true);
  });

  test("a long swipe towards the edge closes it, with a cancelable cancel event first", () => {
    const drawer = setup();
    let cancels = 0;
    drawer.addEventListener("cancel", () => cancels++);
    drag(drawer.querySelector("p")!, 0, 200);
    expect(cancels).toBe(1);
    expect(drawer.open).toBe(false);
  });

  test("a short, slow swipe springs back and leaves no swipe state behind", () => {
    const drawer = setup();
    pointer(drawer, "pointerdown", 200, 600, 1000);
    pointer(drawer, "pointermove", 200, 650, 1300);
    expect(drawer.hasAttribute("data-swiping")).toBe(true);
    expect(drawer.style.getPropertyValue("--drawer-swipe-movement")).toBe("50px");
    expect(drawer.style.getPropertyValue("--drawer-swipe-progress")).toBe("0.125");
    pointer(drawer, "pointerup", 200, 650, 1600);
    expect(drawer.open).toBe(true);
    expect(drawer.hasAttribute("data-swiping")).toBe(false);
    expect(drawer.style.getPropertyValue("--drawer-swipe-movement")).toBe("");
  });

  test("a short, fast flick closes it", () => {
    const drawer = setup();
    drag(drawer, 0, 60, { ms: 60 });
    expect(drawer.open).toBe(false);
  });

  test("preventing cancel keeps it open", () => {
    const drawer = setup();
    drawer.addEventListener("cancel", (e) => e.preventDefault());
    drag(drawer, 0, 300);
    expect(drawer.open).toBe(true);
  });

  test("a swipe the other way, or across, doesn't drag", () => {
    const drawer = setup();
    drag(drawer, 0, -200);
    drag(drawer, 200, 20);
    expect(drawer.open).toBe(true);
    expect(drawer.hasAttribute("data-swiping")).toBe(false);
  });

  test("data-swipe-direction sets the direction that dismisses", () => {
    const drawer = setup('data-swipe-direction="right"');
    drag(drawer, 0, 300);
    expect(drawer.open).toBe(true);
    drag(drawer, 300, 0);
    expect(drawer.open).toBe(false);

    const up = setup('data-swipe-direction="up"');
    drag(up, 0, 300);
    expect(up.open).toBe(true);
    drag(up, 0, -300, { y: 800 });
    expect(up.open).toBe(false);
  });

  test("no drag from a button, nor outside the drawer", () => {
    const drawer = setup();
    drag(document.getElementById("b")!, 0, 300);
    expect(drawer.open).toBe(true);
    drag(drawer, 0, 300, { y: 100 }); // on the backdrop, above the drawer
    expect(drawer.open).toBe(true);
  });

  test("data-drawer-handle-only: only the handle drags", () => {
    const drawer = setup("data-drawer-handle-only");
    drag(drawer.querySelector("p")!, 0, 300);
    expect(drawer.open).toBe(true);
    drag(drawer.querySelector(".drawer-handle")!, 0, 300);
    expect(drawer.open).toBe(false);
  });

  test("content scrolled away from its start scrolls back before the drawer drags", () => {
    const drawer = setup("", '<div class="list" style="overflow-y: auto"><p>Item</p></div>');
    const list = drawer.querySelector<HTMLElement>(".list")!;
    Object.defineProperty(list, "scrollTop", { value: 40, configurable: true });
    drag(list.querySelector("p")!, 0, 300);
    expect(drawer.open).toBe(true);
    Object.defineProperty(list, "scrollTop", { value: 0, configurable: true });
    drag(list.querySelector("p")!, 0, 300);
    expect(drawer.open).toBe(false);
  });

  test("the click that ends a drag is swallowed", () => {
    const drawer = setup();
    let clicks = 0;
    drawer.querySelector("p")!.addEventListener("click", () => clicks++);
    pointer(drawer, "pointerdown", 200, 600, 1000);
    pointer(drawer, "pointermove", 200, 640, 1400);
    pointer(drawer, "pointerup", 200, 640, 1800);
    drawer.querySelector("p")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(clicks).toBe(0);
    drawer.querySelector("p")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(clicks).toBe(1);
  });

  test("nested drawers: those behind the frontmost get --nested-drawers and data-nested-drawer-open", async () => {
    document.body.innerHTML = `
      <dialog id="one" class="drawer" data-dialog data-drawer>
        <dialog id="two" class="drawer" data-dialog data-drawer></dialog>
      </dialog>
      <dialog id="three" class="drawer" data-dialog data-drawer></dialog>`;
    initDialog(document);
    initDrawer(document);
    const [one, two, three] = ["one", "two", "three"].map((id) => document.getElementById(id) as HTMLDialogElement);
    one!.showModal();
    await tick();
    expect(one!.style.getPropertyValue("--nested-drawers")).toBe("0");
    expect(one!.hasAttribute("data-nested-drawer-open")).toBe(false);
    expect(one!.hasAttribute("data-drawer-nested")).toBe(false);

    two!.showModal();
    three!.showModal();
    await tick();
    expect(one!.style.getPropertyValue("--nested-drawers")).toBe("2");
    expect(two!.style.getPropertyValue("--nested-drawers")).toBe("1");
    expect(three!.style.getPropertyValue("--nested-drawers")).toBe("0");
    expect(one!.hasAttribute("data-nested-drawer-open")).toBe(true);
    expect(three!.hasAttribute("data-nested-drawer-open")).toBe(false);
    expect(two!.hasAttribute("data-drawer-nested")).toBe(true);
    expect(three!.hasAttribute("data-drawer-nested")).toBe(true);

    three!.close();
    await tick();
    expect(one!.style.getPropertyValue("--nested-drawers")).toBe("1");
    expect(two!.hasAttribute("data-nested-drawer-open")).toBe(false);
    expect(three!.style.getPropertyValue("--nested-drawers")).toBe("");

    two!.close();
    one!.close();
    await tick();
    expect(one!.hasAttribute("data-nested-drawer-open")).toBe(false);
  });

  test("a press inside a drawer nested in the markup doesn't drag the parent", async () => {
    document.body.innerHTML = `
      <dialog id="outer" class="drawer" data-dialog data-drawer>
        <dialog id="inner" class="drawer" data-dialog data-drawer><p>Inner</p></dialog>
      </dialog>`;
    initDialog(document);
    initDrawer(document);
    const outer = document.getElementById("outer") as HTMLDialogElement;
    const inner = document.getElementById("inner") as HTMLDialogElement;
    box(outer);
    box(inner);
    outer.showModal();
    inner.showModal();
    drag(inner.querySelector("p")!, 0, 300);
    expect(inner.open).toBe(false);
    expect(outer.open).toBe(true);
    inner.showModal();
    await tick();
    expect(outer.hasAttribute("data-swiping")).toBe(false);
  });

  test("a drawer that is already open when initialised (data-dialog-show) joins the stack", async () => {
    document.body.innerHTML = `<dialog class="drawer" data-dialog data-drawer data-dialog-show></dialog>`;
    initDialog(document);
    initDrawer(document);
    const drawer = document.querySelector("dialog")!;
    expect(drawer.open).toBe(true);
    expect(drawer.style.getPropertyValue("--nested-drawers")).toBe("0");
    drawer.close();
    await tick();
  });
});
