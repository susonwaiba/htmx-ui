import { describe, expect, test } from "bun:test";
import { initTooltip } from "./tooltip";

describe("tooltip", () => {
  const setup = () => {
    document.body.innerHTML = `
      <span class="tooltip" data-tooltip>
        <button aria-describedby="hint">Save</button>
        <span class="tooltip-content">Save the draft</span>
      </span>`;
    initTooltip(document);
    initTooltip(document);
    return {
      tooltip: document.querySelector<HTMLElement>("[data-tooltip]")!,
      trigger: document.querySelector<HTMLElement>("button")!,
      content: document.querySelector<HTMLElement>(".tooltip-content")!,
    };
  };

  test("describes the trigger with the tooltip, keeping existing descriptions", () => {
    const { trigger, content } = setup();
    expect(content.getAttribute("role")).toBe("tooltip");
    expect(trigger.getAttribute("aria-describedby")).toBe(`hint ${content.id}`);
  });

  test("Escape dismisses until focus moves", () => {
    const { tooltip, trigger } = setup();
    trigger.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(tooltip.hasAttribute("data-dismissed")).toBe(true);
    trigger.blur();
    expect(tooltip.hasAttribute("data-dismissed")).toBe(false);
  });
});
