import { describe, expect, test } from "bun:test";
import { place } from "./position";

const rect = (el: HTMLElement, r: Partial<DOMRect>) =>
  (el.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, ...r, toJSON() {} }) as DOMRect);

describe("place()", () => {
  test("flips a panel that would leave the viewport towards the side with more room", () => {
    const anchor = document.createElement("button");
    const panel = document.createElement("div");
    rect(anchor, { top: innerHeight - 40, bottom: innerHeight - 10, left: innerWidth - 50, right: innerWidth - 10 });
    rect(panel, { top: innerHeight - 10, bottom: innerHeight + 200, left: innerWidth - 50, right: innerWidth + 150 });
    place(panel, anchor);
    expect(panel.hasAttribute("data-flip-x")).toBe(true);
    expect(panel.hasAttribute("data-flip-y")).toBe(true);
  });

  test("leaves a panel that fits alone, clearing an earlier flip", () => {
    const anchor = document.createElement("button");
    const panel = document.createElement("div");
    panel.dataset.flipY = "";
    rect(anchor, { top: 10, bottom: 40, left: 10, right: 50 });
    rect(panel, { top: 40, bottom: 200, left: 10, right: 200 });
    place(panel, anchor);
    expect(panel.hasAttribute("data-flip-x")).toBe(false);
    expect(panel.hasAttribute("data-flip-y")).toBe(false);
  });
});
