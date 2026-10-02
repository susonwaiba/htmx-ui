import { describe, expect, test } from "bun:test";
import { initToggleGroup } from "./toggle-group";

describe("toggle group", () => {
  const setup = (attrs: string) => {
    document.body.innerHTML = `
      <div ${attrs}>
        <button aria-pressed="true" value="left">L</button>
        <button aria-pressed="false" value="center">C</button>
        <button aria-pressed="false" value="right" disabled>R</button>
      </div>`;
    initToggleGroup(document);
    initToggleGroup(document);
    const buttons = [...document.querySelectorAll<HTMLElement>("button")];
    const pressed = () => buttons.map((b) => b.getAttribute("aria-pressed"));
    return { buttons, pressed };
  };

  test("single: pressing one releases the others and reports the value", () => {
    const { buttons, pressed } = setup('data-toggle-group="single"');
    let value: string[] = [];
    document.addEventListener("toggle-group:change", (e) => (value = (e as CustomEvent).detail.value));
    buttons[1]!.click();
    expect(pressed()).toEqual(["false", "true", "false"]);
    expect(value).toEqual(["center"]);
    buttons[1]!.click();
    expect(pressed()).toEqual(["false", "false", "false"]);
  });

  test("single + required: the pressed button can't be released", () => {
    const { buttons, pressed } = setup('data-toggle-group="single" data-toggle-group-required');
    buttons[0]!.click();
    expect(pressed()).toEqual(["true", "false", "false"]);
  });

  test("multiple: buttons toggle independently; disabled ones ignore clicks", () => {
    const { buttons, pressed } = setup('data-toggle-group="multiple"');
    buttons[1]!.click();
    buttons[2]!.click();
    expect(pressed()).toEqual(["true", "true", "false"]);
  });

  test("one tab stop; arrow keys move focus and skip disabled buttons", () => {
    const { buttons } = setup('data-toggle-group="single"');
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, 0]);
    buttons[0]!.focus();
    buttons[0]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]!);
    buttons[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]!);
  });
});
