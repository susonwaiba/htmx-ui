import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { getPalette, getTheme, initTheme, setPalette } from "./theme";

// stub() replaces these globals; put the real ones back for other test files.
const real = {
  localStorage: Object.getOwnPropertyDescriptor(globalThis, "localStorage"),
  matchMedia: Object.getOwnPropertyDescriptor(globalThis, "matchMedia"),
};
afterAll(() => {
  for (const [key, descriptor] of Object.entries(real)) if (descriptor) Object.defineProperty(globalThis, key, descriptor);
});

/** Pretend the OS reports `osDark` and localStorage holds `stored` as the light/dark mode
    (null = no choice yet). Storage is per key, so palette tests can set their own. */
function stub(stored: string | null, osDark: boolean) {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.body.innerHTML = `
    <button data-theme-toggle aria-pressed="unset"><span data-theme-label>?</span></button>
    <span data-year></span>
  `;
  const store = new Map<string, string>();
  if (stored) store.set("theme", stored);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
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

describe("palette switch", () => {
  beforeEach(() => stub(null, false));

  const option = (name: string) => document.querySelector<HTMLButtonElement>(`[data-theme-palette="${name}"]`)!;

  /** A markup default of aurora plus a menu of options and one standalone button. */
  function picker() {
    document.documentElement.dataset.theme = "aurora";
    document.body.innerHTML = `
      <div role="menu">
        <button role="menuitemradio" aria-checked="true" data-theme-palette="aurora">Aurora</button>
        <button role="menuitemradio" aria-checked="false" data-theme-palette="ember">Ember</button>
      </div>
      <button data-theme-palette="jade" aria-pressed="false">Jade</button>`;
  }

  test("a stored palette wins over the markup default and checks its option", () => {
    picker();
    localStorage.setItem("palette", "ember");
    initTheme();
    expect(getPalette()).toBe("ember");
    expect(document.documentElement.dataset.theme).toBe("ember");
    expect(option("ember").getAttribute("aria-checked")).toBe("true");
    expect(option("aurora").getAttribute("aria-checked")).toBe("false");
  });

  test("clicking a menu option applies the palette and remembers it", () => {
    picker();
    initTheme();
    option("ember").click();
    expect(getPalette()).toBe("ember");
    expect(document.documentElement.dataset.theme).toBe("ember");
    expect(localStorage.getItem("palette")).toBe("ember");
    expect(option("ember").getAttribute("aria-checked")).toBe("true");
    expect(option("aurora").getAttribute("aria-checked")).toBe("false");
  });

  test("a standalone button switches too, and reports pressed state", () => {
    picker();
    initTheme();
    option("jade").click();
    expect(getPalette()).toBe("jade");
    expect(localStorage.getItem("palette")).toBe("jade");
    expect(option("jade").getAttribute("aria-pressed")).toBe("true");
    // The menu options follow the palette even though they weren't clicked.
    expect(option("aurora").getAttribute("aria-checked")).toBe("false");
    expect(option("ember").getAttribute("aria-checked")).toBe("false");
  });

  test("options swapped in after init still switch (one delegated listener)", () => {
    document.documentElement.dataset.theme = "aurora";
    initTheme();
    // Replaced wholesale after initTheme, like content an htmx swap brings in.
    document.body.innerHTML = `<button data-theme-palette="onyx">Onyx</button>`;
    (document.body.firstElementChild as HTMLButtonElement).click();
    expect(getPalette()).toBe("onyx");
    expect(localStorage.getItem("palette")).toBe("onyx");
  });

  test("setPalette applies, persists and syncs; applying twice is a no-op", () => {
    document.body.innerHTML = `<button role="menuitemradio" aria-checked="false" data-theme-palette="dusk">Dusk</button>`;
    initTheme();
    setPalette("dusk");
    expect(getPalette()).toBe("dusk");
    expect(localStorage.getItem("palette")).toBe("dusk");
    expect(option("dusk").getAttribute("aria-checked")).toBe("true");
    setPalette("dusk");
    expect(getPalette()).toBe("dusk");
  });

  test("disabled options do nothing", () => {
    document.documentElement.dataset.theme = "aurora";
    document.body.innerHTML = `<button data-theme-palette="onyx" aria-disabled="true">Onyx</button>`;
    initTheme();
    (document.body.firstElementChild as HTMLButtonElement).click();
    expect(getPalette()).toBe("aurora");
    expect(localStorage.getItem("palette")).toBe(null);
  });

  test("getPalette is null when no palette is set", () => {
    initTheme();
    expect(getPalette()).toBe(null);
  });
});
