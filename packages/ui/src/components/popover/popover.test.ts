import { describe, expect, test } from "bun:test";
import { initPopover } from "./popover";

describe("popover", () => {
  const setup = () => {
    document.body.innerHTML = `
      <div data-popover>
        <button data-popover-trigger>Open</button>
        <div data-popover-content hidden><input id="name" autofocus /></div>
      </div><button id="outside">x</button>`;
    initPopover(document);
    initPopover(document);
    return {
      trigger: document.querySelector<HTMLElement>("[data-popover-trigger]")!,
      panel: document.querySelector<HTMLElement>("[data-popover-content]")!,
    };
  };

  test("toggles, links the trigger to the panel and focuses [autofocus]", () => {
    const { trigger, panel } = setup();
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    trigger.click();
    expect(panel.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.id).toBe("name");
    trigger.click();
    expect(panel.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("Escape closes and refocuses the trigger", () => {
    const { trigger, panel } = setup();
    trigger.click();
    panel.querySelector("input")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  test("a click outside closes", () => {
    const { trigger, panel } = setup();
    trigger.click();
    document.getElementById("outside")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(panel.hidden).toBe(true);
  });
});

describe("popover close buttons", () => {
  test("[data-popover-close] closes and refocuses the trigger", () => {
    document.body.innerHTML = `
      <div data-popover>
        <button data-popover-trigger>Open</button>
        <div data-popover-content hidden><button data-popover-close>Cancel</button></div>
      </div>`;
    initPopover(document);
    const trigger = document.querySelector<HTMLElement>("[data-popover-trigger]")!;
    const panel = document.querySelector<HTMLElement>("[data-popover-content]")!;
    trigger.click();
    panel.querySelector<HTMLElement>("[data-popover-close]")!.click();
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });
});
