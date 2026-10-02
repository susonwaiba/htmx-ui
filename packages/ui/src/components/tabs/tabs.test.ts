import { describe, expect, test } from "bun:test";
import { initTabs } from "./tabs";

describe("tabs", () => {
  const group = (sync = "") => `
    <div data-tabs ${sync && `data-tabs-sync="${sync}"`}>
      <button data-tab="a" aria-selected="true">A</button><button data-tab="b" aria-selected="false">B</button>
      <div data-tab-panel="a">A</div><div data-tab-panel="b" hidden>B</div>
    </div>`;

  test("clicking a tab shows its panel and wires up ARIA", () => {
    document.body.innerHTML = group();
    initTabs(document);
    const [a, b] = document.querySelectorAll<HTMLElement>("[data-tab]");
    b!.click();
    expect(b!.getAttribute("aria-selected")).toBe("true");
    expect(a!.getAttribute("aria-selected")).toBe("false");
    expect(document.querySelector<HTMLElement>('[data-tab-panel="b"]')!.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>('[data-tab-panel="a"]')!.hidden).toBe(true);
    expect(b!.getAttribute("aria-controls")).toBe(document.querySelector('[data-tab-panel="b"]')!.id);
  });

  test("synced groups switch together, remember the choice, and restore it", () => {
    localStorage.clear();
    document.body.innerHTML = group("pm") + group("pm");
    initTabs(document);
    document.querySelectorAll<HTMLElement>('[data-tab="b"]')[0]!.click();
    expect([...document.querySelectorAll('[data-tab-panel="b"]')].map((p) => (p as HTMLElement).hidden)).toEqual([false, false]);
    expect(localStorage.getItem("tabs:pm")).toBe("b");

    document.body.innerHTML = group("pm");
    initTabs(document);
    expect(document.querySelector<HTMLElement>('[data-tab-panel="b"]')!.hidden).toBe(false);
  });

  test("arrow keys move to the next tab", () => {
    document.body.innerHTML = group();
    initTabs(document);
    const [a, b] = document.querySelectorAll<HTMLElement>("[data-tab]");
    a!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(b!.getAttribute("aria-selected")).toBe("true");
  });
});
