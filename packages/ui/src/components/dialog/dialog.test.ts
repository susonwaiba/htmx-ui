import { describe, expect, test } from "bun:test";
import { initDialog } from "./dialog";

const click = (el: Element, x = 0, y = 0) => {
  el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y }));
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y }));
};

describe("dialog", () => {
  const setup = (attrs = "") => {
    document.body.innerHTML = `
      <button id="open" commandfor="d" command="show-modal">Open</button>
      <dialog id="d" class="dialog" data-dialog ${attrs}>
        <p>Body</p>
        <form><button id="save" type="button" data-dialog-close="save">Save</button></form>
        <button id="x" commandfor="d" command="close" value="x">×</button>
      </dialog>`;
    initDialog(document);
    initDialog(document);
    // happy-dom has no layout: give the dialog a box so clicks can land outside it.
    const dialog = document.querySelector<HTMLDialogElement>("dialog")!;
    dialog.getBoundingClientRect = () => ({ left: 100, right: 300, top: 100, bottom: 300 }) as DOMRect;
    return dialog;
  };

  test("initialises once", () => {
    setup();
    expect(document.querySelector("[data-dialog]")!.hasAttribute("data-init")).toBe(true);
  });

  test("command buttons open and close it", () => {
    const dialog = setup();
    document.getElementById("open")!.click();
    expect(dialog.open).toBe(true);
    document.getElementById("x")!.click();
    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("x");
  });

  test("[data-dialog-close] closes with its value as returnValue", () => {
    const dialog = setup();
    dialog.showModal();
    document.getElementById("save")!.click();
    expect(dialog.open).toBe(false);
    expect(dialog.returnValue).toBe("save");
  });

  test("a click on the backdrop closes it, a click inside doesn't", () => {
    const dialog = setup();
    dialog.showModal();
    click(dialog, 200, 200);
    expect(dialog.open).toBe(true);
    click(dialog.querySelector("p")!, 200, 200);
    expect(dialog.open).toBe(true);
    click(dialog, 20, 20);
    expect(dialog.open).toBe(false);
  });

  test("an alert dialog ignores clicks outside", () => {
    const dialog = setup('role="alertdialog"');
    dialog.showModal();
    click(dialog, 20, 20);
    expect(dialog.open).toBe(true);
  });

  test("a dialog:close event from inside closes it", () => {
    const dialog = setup();
    dialog.showModal();
    dialog.querySelector("p")!.dispatchEvent(new CustomEvent("dialog:close", { bubbles: true }));
    expect(dialog.open).toBe(false);
  });

  test("data-dialog-show opens it on init and data-dialog-remove removes it after closing", async () => {
    const dialog = setup("data-dialog-show data-dialog-remove");
    expect(dialog.open).toBe(true);
    dialog.close();
    await Bun.sleep(250);
    expect(dialog.isConnected).toBe(false);
  });
});
