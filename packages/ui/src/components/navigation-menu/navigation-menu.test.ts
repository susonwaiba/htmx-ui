import { describe, expect, test } from "bun:test";
import { initNavigationMenu } from "./navigation-menu";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
const over = (el: Element, from: Element | null = null) => {
  if (from) from.dispatchEvent(new PointerEvent("pointerout", { pointerType: "mouse", bubbles: true, relatedTarget: el }));
  el.dispatchEvent(new PointerEvent("pointerover", { pointerType: "mouse", bubbles: true, relatedTarget: from }));
};
const out = (el: Element, to: Element = document.body) =>
  el.dispatchEvent(new PointerEvent("pointerout", { pointerType: "mouse", bubbles: true, relatedTarget: to }));

describe("navigation-menu", () => {
  const setup = (cls = "") => {
    document.body.innerHTML = `
      <nav class="navigation-menu ${cls}" aria-label="Main" data-navigation-menu
           style="--navigation-menu-open-delay: 20ms; --navigation-menu-close-delay: 10ms">
        <ul class="navigation-menu-list">
          <li class="navigation-menu-item">
            <button class="navigation-menu-trigger" id="t1">Getting started</button>
            <div class="navigation-menu-content"><a href="#a1" id="a1">One</a><a href="#a2" id="a2">Two</a></div>
          </li>
          <li class="navigation-menu-item">
            <button class="navigation-menu-trigger" id="t2">Components</button>
            <div class="navigation-menu-content"><a href="#b1" id="b1">Alert</a></div>
          </li>
          <li class="navigation-menu-item"><a class="navigation-menu-link" href="#docs" id="docs">Docs</a></li>
        </ul>
      </nav>
      <button id="outside">Outside</button>`;
    initNavigationMenu(document);
    initNavigationMenu(document);
    const $ = (id: string) => document.getElementById(id)!;
    return { nav: document.querySelector<HTMLElement>("nav")!, $ };
  };
  const expanded = (el: Element) => el.getAttribute("aria-expanded");

  test("wires triggers to their panels, once", () => {
    const { nav, $ } = setup();
    expect(nav.hasAttribute("data-init")).toBe(true);
    const panel = $("t1").nextElementSibling!;
    expect($("t1").getAttribute("aria-controls")).toBe(panel.id);
    expect(expanded($("t1"))).toBe("false");
    expect($("t1").getAttribute("type")).toBe("button");
  });

  test("click toggles, one panel at a time, with events", () => {
    const { $ } = setup();
    const seen: string[] = [];
    document.addEventListener("navigation-menu:open", (e) => seen.push(`open ${(e.target as Element).id}`));
    $("t1").click();
    expect(expanded($("t1"))).toBe("true");
    $("t2").click();
    expect(expanded($("t1"))).toBe("false");
    expect(expanded($("t2"))).toBe("true");
    $("t2").click();
    expect(expanded($("t2"))).toBe("false");
    expect(seen).toEqual([`open ${$("t1").getAttribute("aria-controls")}`, `open ${$("t2").getAttribute("aria-controls")}`]);
  });

  test("hover opens after the delay, switches at once, closes after leaving", async () => {
    const { $ } = setup();
    over($("t1"));
    expect(expanded($("t1"))).toBe("false");
    await wait(40);
    expect(expanded($("t1"))).toBe("true");
    over($("t2"), $("t1"));
    expect(expanded($("t2"))).toBe("true");
    expect(expanded($("t1"))).toBe("false");
    out($("t2"));
    await wait(30);
    expect(expanded($("t2"))).toBe("false");
  });

  test("clicking a hover-opened trigger keeps it open, and leaving no longer closes it", async () => {
    const { $ } = setup();
    over($("t1"));
    await wait(40);
    $("t1").click();
    expect(expanded($("t1"))).toBe("true");
    out($("t1"));
    await wait(30);
    expect(expanded($("t1"))).toBe("true");
  });

  test("Escape closes and refocuses the trigger; outside clicks and following a link close", () => {
    const { $ } = setup();
    $("t1").click();
    $("a1").focus();
    key($("a1"), "Escape");
    expect(expanded($("t1"))).toBe("false");
    expect(document.activeElement).toBe($("t1"));

    $("t1").click();
    $("outside").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(expanded($("t1"))).toBe("false");

    $("t1").click();
    $("a2").click();
    expect(expanded($("t1"))).toBe("false");
  });

  test("focus leaving the menu or moving to another item closes the panel", () => {
    const { $ } = setup();
    $("t1").click();
    $("t1").focus();
    $("docs").focus();
    expect(expanded($("t1"))).toBe("false");
    $("t1").click();
    $("t1").focus();
    $("outside").focus();
    expect(expanded($("t1"))).toBe("false");
  });

  test("arrow keys move along the top level; ArrowDown opens on the first link", () => {
    const { $ } = setup();
    $("t1").focus();
    key($("t1"), "ArrowRight");
    expect(document.activeElement).toBe($("t2"));
    key($("t2"), "End");
    expect(document.activeElement).toBe($("docs"));
    key($("docs"), "ArrowRight");
    expect(document.activeElement).toBe($("t1"));
    key($("t1"), "ArrowLeft");
    expect(document.activeElement).toBe($("docs"));
    key($("docs"), "Home");
    expect(document.activeElement).toBe($("t1"));

    key($("t1"), "ArrowDown");
    expect(expanded($("t1"))).toBe("true");
    expect(document.activeElement).toBe($("a1"));
    key($("a1"), "ArrowDown");
    expect(document.activeElement).toBe($("a2"));
    key($("a2"), "ArrowUp");
    key($("a1"), "ArrowUp");
    expect(document.activeElement).toBe($("t1"));
  });

  test("vertical: no hover, ArrowDown/Up run through open panels", async () => {
    const { $ } = setup("navigation-menu-vertical");
    over($("t1"));
    await wait(40);
    expect(expanded($("t1"))).toBe("false");
    $("t1").click();
    $("t1").focus();
    key($("t1"), "ArrowDown");
    expect(document.activeElement).toBe($("a1"));
    key($("a1"), "ArrowDown");
    key($("a2"), "ArrowDown");
    expect(document.activeElement).toBe($("t2"));
  });
});
