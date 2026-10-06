import { describe, expect, test } from "bun:test";
import { initMenubar } from "./menubar";

const MARKUP = (orientation = "horizontal") => `
  <div class="menubar" data-menubar aria-label="App" aria-orientation="${orientation}">
    <div class="menubar-menu">
      <button type="button" id="file" role="menuitem" aria-haspopup="menu" aria-expanded="false">File</button>
      <div role="menu" id="file-menu" hidden>
        <span role="menuitem" id="new">New tab</span>
        <div class="dropdown-sub">
          <span role="menuitem" id="share" aria-haspopup="menu" aria-expanded="false">Share</span>
          <div role="menu" id="share-menu" hidden><span role="menuitem" id="email">Email link</span></div>
        </div>
        <span role="menuitem" id="print">Print</span>
      </div>
    </div>
    <div class="menubar-menu">
      <button type="button" id="edit" role="menuitem" aria-haspopup="menu" aria-expanded="false">Edit</button>
      <div role="menu" id="edit-menu" hidden>
        <span role="menuitem" id="undo">Undo</span><span role="menuitem" id="redo" aria-disabled="true">Redo</span><span role="menuitem" id="cut">Cut</span>
      </div>
    </div>
    <div class="menubar-menu">
      <button type="button" id="view" role="menuitem" aria-haspopup="menu" aria-expanded="false">View</button>
      <div role="menu" id="view-menu" hidden>
        <span role="menuitemcheckbox" id="bookmarks" aria-checked="false">Always show bookmarks bar</span>
        <div role="group" aria-label="Profiles" data-keep-open>
          <span role="menuitemradio" id="andy" aria-checked="true">Andy</span>
          <span role="menuitemradio" id="luis" aria-checked="false">Luis</span>
        </div>
      </div>
    </div>
  </div><p id="outside">x</p>`;

const setup = (orientation?: string) => {
  document.body.innerHTML = MARKUP(orientation);
  initMenubar(document);
  return (id: string) => document.getElementById(id)!;
};
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
const over = (el: Element) => el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
const focused = () => document.activeElement?.id;

describe("menubar", () => {
  test("roving tabindex: one top-level item is tabbable, menu items are not", () => {
    const $ = setup();
    expect($("file").tabIndex).toBe(0);
    expect($("edit").tabIndex).toBe(-1);
    expect($("view").tabIndex).toBe(-1);
    expect(document.querySelector("[data-menubar]")!.getAttribute("role")).toBe("menubar");
    $("file").focus();
    key($("file"), "ArrowRight");
    expect(focused()).toBe("edit");
    expect($("edit").tabIndex).toBe(0);
    expect($("file").tabIndex).toBe(-1);
    key($("edit"), "ArrowLeft");
    key($("file"), "ArrowLeft");
    expect(focused()).toBe("view"); // wraps
    key($("view"), "Home");
    expect(focused()).toBe("file");
    key($("file"), "End");
    expect(focused()).toBe("view");
    key($("view"), "e");
    expect(focused()).toBe("edit"); // typeahead
  });

  test("ArrowDown / Enter / Space open on the first item, ArrowUp on the last; Escape closes", () => {
    const $ = setup();
    for (const k of ["ArrowDown", "Enter", " "]) {
      $("file").focus();
      key($("file"), k);
      expect($("file-menu").hidden).toBe(false);
      expect($("file").getAttribute("aria-expanded")).toBe("true");
      expect(focused()).toBe("new");
      expect($("new").tabIndex).toBe(-1);
      key($("new"), "Escape");
      expect($("file-menu").hidden).toBe(true);
      expect($("file").getAttribute("aria-expanded")).toBe("false");
      expect(focused()).toBe("file");
    }
    key($("file"), "ArrowUp");
    expect(focused()).toBe("print");
  });

  test("inside a menu: arrows skip disabled items; Right / Left move to the adjacent menu", () => {
    const $ = setup();
    key($("edit"), "ArrowDown");
    expect(focused()).toBe("undo");
    key($("undo"), "ArrowDown");
    expect(focused()).toBe("cut");
    key($("cut"), "ArrowRight");
    expect($("edit-menu").hidden).toBe(true);
    expect($("view-menu").hidden).toBe(false);
    expect(focused()).toBe("bookmarks");
    expect($("view").tabIndex).toBe(0);
    key($("bookmarks"), "ArrowLeft");
    expect($("view-menu").hidden).toBe(true);
    expect(focused()).toBe("undo");
    key($("undo"), "ArrowLeft");
    key($("new"), "ArrowLeft");
    expect(focused()).toBe("bookmarks"); // wraps
  });

  test("arrows on a top-level item open the adjacent menu when one is open", () => {
    const $ = setup();
    $("file").click(); // mouse-like: opens, focus stays
    $("file").focus();
    key($("file"), "ArrowRight");
    expect($("file-menu").hidden).toBe(true);
    expect($("edit-menu").hidden).toBe(false);
    expect(focused()).toBe("undo");
  });

  test("submenus: Right opens, Left closes, Right on an item without one moves on", () => {
    const $ = setup();
    key($("file"), "ArrowDown");
    key($("new"), "ArrowDown");
    expect(focused()).toBe("share");
    key($("share"), "ArrowRight");
    expect($("share-menu").hidden).toBe(false);
    expect(focused()).toBe("email");
    key($("email"), "ArrowLeft");
    expect($("share-menu").hidden).toBe(true);
    expect(focused()).toBe("share");
    key($("share"), "ArrowRight");
    key($("email"), "ArrowRight");
    expect($("file-menu").hidden).toBe(true);
    expect($("share-menu").hidden).toBe(true);
    expect(focused()).toBe("undo");
  });

  test("click toggles; hovering another trigger switches while open; click outside closes", () => {
    const $ = setup();
    over($("edit"));
    expect($("edit-menu").hidden).toBe(true); // nothing open: hover does nothing
    $("file").click();
    expect($("file-menu").hidden).toBe(false);
    over($("edit"));
    expect($("file-menu").hidden).toBe(true);
    expect($("edit-menu").hidden).toBe(false);
    expect(focused()).toBe("edit");
    $("edit").click();
    expect($("edit-menu").hidden).toBe(true);
    $("view").click();
    $("outside").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect($("view-menu").hidden).toBe(true);
  });

  test("choosing an item closes the menu; checkbox and radio items toggle and fire menu:change", () => {
    const $ = setup();
    const changes: unknown[] = [];
    document.addEventListener("menu:change", (e) => changes.push((e as CustomEvent).detail));
    $("file").click();
    $("print").click();
    expect($("file-menu").hidden).toBe(true);
    $("view").click();
    $("bookmarks").click();
    expect($("bookmarks").getAttribute("aria-checked")).toBe("true");
    expect($("view-menu").hidden).toBe(true);
    $("view").click();
    $("luis").click(); // the group has data-keep-open
    expect($("luis").getAttribute("aria-checked")).toBe("true");
    expect($("andy").getAttribute("aria-checked")).toBe("false");
    expect($("view-menu").hidden).toBe(false);
    expect(changes).toEqual([
      { checked: true, name: null, value: null },
      { checked: true, name: null, value: null },
    ]);
  });

  test("Tab closes the menu and returns focus to its trigger", () => {
    const $ = setup();
    key($("file"), "ArrowDown");
    key($("new"), "Tab");
    expect($("file-menu").hidden).toBe(true);
    expect(focused()).toBe("file");
  });

  test("vertical: Up / Down move, Right opens, Left closes", () => {
    const $ = setup("vertical");
    $("file").focus();
    key($("file"), "ArrowDown");
    expect(focused()).toBe("edit");
    expect($("edit-menu").hidden).toBe(true);
    key($("edit"), "ArrowRight");
    expect($("edit-menu").hidden).toBe(false);
    expect(focused()).toBe("undo");
    key($("undo"), "ArrowDown");
    expect(focused()).toBe("cut"); // arrows stay inside the menu
    key($("cut"), "ArrowLeft");
    expect($("edit-menu").hidden).toBe(true);
    expect(focused()).toBe("edit");
  });

  test("initialises once", () => {
    const $ = setup();
    initMenubar(document);
    initMenubar(document.querySelector<HTMLElement>("[data-menubar]")!);
    $("view").click();
    $("bookmarks").click();
    expect($("bookmarks").getAttribute("aria-checked")).toBe("true"); // toggled once
    $("file").click();
    expect($("file-menu").hidden).toBe(false); // one click handler: not opened and closed again
  });
});
