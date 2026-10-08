import { describe, expect, test } from "bun:test";
import { ensureId, isDisabled, nextIndex, uniqueId } from "./shared";

describe("shared helpers", () => {
  test("nextIndex: arrows wrap, Home and End jump, orientation picks the arrows, rtl swaps ← →", () => {
    expect(nextIndex("ArrowDown", 2, 3)).toBe(0);
    expect(nextIndex("ArrowUp", 0, 3)).toBe(2);
    expect(nextIndex("Home", 2, 3)).toBe(0);
    expect(nextIndex("End", 0, 3)).toBe(2);
    expect(nextIndex("ArrowDown", 0, 3, { orientation: "horizontal" })).toBeUndefined();
    expect(nextIndex("ArrowRight", 0, 3, { orientation: "vertical" })).toBeUndefined();
    expect(nextIndex("ArrowRight", 0, 3, { rtl: true })).toBe(2);
    expect(nextIndex("ArrowDown", -1, 3)).toBe(0);
    expect(nextIndex("ArrowUp", -1, 3)).toBe(2);
    expect(nextIndex("a", 0, 3)).toBeUndefined();
    expect(nextIndex("ArrowDown", 0, 0)).toBeUndefined();
  });

  test("ids count up per prefix and keep an existing id", () => {
    const a = uniqueId("t");
    const b = uniqueId("t");
    expect(a).not.toBe(b);
    const el = document.createElement("div");
    expect(ensureId(el, "x")).toBe(el.id);
    el.id = "mine";
    expect(ensureId(el, "x")).toBe("mine");
  });

  test("isDisabled: aria-disabled or the disabled attribute", () => {
    const el = document.createElement("button");
    expect(isDisabled(el)).toBe(false);
    el.setAttribute("aria-disabled", "true");
    expect(isDisabled(el)).toBe(true);
    el.removeAttribute("aria-disabled");
    el.disabled = true;
    expect(isDisabled(el)).toBe(true);
  });
});
