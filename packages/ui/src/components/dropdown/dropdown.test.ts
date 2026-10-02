import { describe, expect, test } from "bun:test";
import { initDropdown } from "./dropdown";

describe("dropdown", () => {
  const setup = () => {
    document.body.innerHTML = `
      <div data-dropdown>
        <button data-dropdown-trigger aria-expanded="false">Open</button>
        <div role="menu" hidden>
          <a role="menuitem" href="#a">A</a><a role="menuitem" href="#b" aria-disabled="true">B</a><a role="menuitem" href="#c">C</a>
        </div>
      </div><p id="outside">x</p>`;
    initDropdown(document);
    return {
      trigger: document.querySelector<HTMLElement>("[data-dropdown-trigger]")!,
      menu: document.querySelector<HTMLElement>('[role="menu"]')!,
      items: [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')],
    };
  };
  const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));

  test("trigger toggles the menu and aria-expanded", () => {
    const { trigger, menu } = setup();
    trigger.click();
    expect(menu.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    trigger.click();
    expect(menu.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("arrow keys open and move focus, skipping disabled items; Escape closes and refocuses", () => {
    const { trigger, menu, items } = setup();
    key(trigger, "ArrowDown");
    expect(document.activeElement).toBe(items[0]!);
    key(menu, "ArrowDown");
    expect(document.activeElement).toBe(items[2]!); // B is aria-disabled
    key(menu, "ArrowDown");
    expect(document.activeElement).toBe(items[0]!); // wraps
    key(menu, "Escape");
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  test("clicking outside or choosing an item closes it", () => {
    const { trigger, menu, items } = setup();
    trigger.click();
    document.getElementById("outside")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(menu.hidden).toBe(true);
    trigger.click();
    items[0]!.click();
    expect(menu.hidden).toBe(true);
  });
});
