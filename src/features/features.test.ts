import { beforeEach, describe, expect, test } from "bun:test";
import { getTheme, initTheme } from "./theme";
import { initYear } from "./year";

/** Pretend the OS reports `osDark` and localStorage holds `stored` (null = no choice yet). */
function stub(stored: string | null, osDark: boolean) {
  document.documentElement.className = "";
  document.body.innerHTML = `
    <button data-theme-toggle aria-pressed="unset"><span data-theme-label>?</span></button>
    <span data-year></span>
  `;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      stored,
      getItem(this: { stored: string | null }) {
        return this.stored;
      },
      setItem(this: { stored: string | null }, _k: string, v: string) {
        this.stored = v;
      },
    },
  });
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    value: (q: string) => ({ matches: osDark, media: q, addEventListener() {}, removeEventListener() {} }),
  });
}

const toggle = () => document.querySelector<HTMLButtonElement>("[data-theme-toggle]")!;
const label = () => document.querySelector("[data-theme-label]")!.textContent;

describe("initTheme", () => {
  beforeEach(() => stub(null, false));

  test("follows the OS when no choice has been made", () => {
    stub(null, true);
    initTheme();
    expect(getTheme()).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(label()).toBe("dark");
    expect(toggle().getAttribute("aria-pressed")).toBe("true");
  });

  test("follows the OS when it reports light", () => {
    stub(null, false);
    initTheme();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(label()).toBe("light");
    expect(toggle().getAttribute("aria-pressed")).toBe("false");
  });

  test("a stored choice wins over the OS", () => {
    stub("light", true);
    initTheme();
    expect(getTheme()).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  test("clicking the toggle flips the theme and persists it", () => {
    stub(null, false);
    initTheme();

    toggle().click();
    expect(getTheme()).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(label()).toBe("dark");

    toggle().click();
    expect(getTheme()).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(label()).toBe("light");
  });

  test("is idempotent: re-initialising does not double-bind the toggle", () => {
    stub(null, false);
    initTheme();
    initTheme();
    toggle().click();
    // One click should flip exactly once.
    expect(getTheme()).toBe("dark");
  });
});

describe("initYear", () => {
  test("fills every [data-year] element with the current year", () => {
    stub(null, false);
    initYear();
    expect(document.querySelector("[data-year]")!.textContent).toBe(String(new Date().getFullYear()));
  });
});
