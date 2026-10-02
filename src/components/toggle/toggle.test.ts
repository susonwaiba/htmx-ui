import { describe, expect, test } from "bun:test";
import { initToggle } from "./toggle";

describe("toggle", () => {
  test("flips aria-pressed and reports the new state", () => {
    document.body.innerHTML = '<button data-toggle aria-pressed="false">B</button>';
    initToggle(document);
    initToggle(document);
    const button = document.querySelector<HTMLElement>("[data-toggle]")!;
    const seen: boolean[] = [];
    document.addEventListener("toggle:change", (e) => seen.push((e as CustomEvent).detail.pressed));
    button.click();
    expect(button.getAttribute("aria-pressed")).toBe("true");
    button.click();
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(seen).toEqual([true, false]);
  });

  test("adds aria-pressed when it is missing", () => {
    document.body.innerHTML = "<button data-toggle>B</button>";
    initToggle(document);
    expect(document.querySelector("[data-toggle]")!.getAttribute("aria-pressed")).toBe("false");
  });
});
