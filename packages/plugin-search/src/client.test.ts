import { afterAll, beforeEach, describe, expect, test } from "bun:test";

const markup = `
  <button data-search-open>Search <kbd data-search-shortcut></kbd></button>
  <dialog data-search-dialog>
    <input data-search-input role="combobox" aria-expanded="false" />
    <ul data-search-results role="listbox"></ul>
    <p data-search-message></p>
    <span data-search-version></span>
  </dialog>`;

const root = {
  versions: [
    { id: "0.2", label: "v0.2", path: "/docs", latest: true, sitemap: "/docs/sitemap.json" },
    { id: "0.1", label: "v0.1", path: "/docs/v0.1", latest: false, sitemap: "/docs/v0.1/sitemap.json" },
  ],
  pages: [
    { url: "/docs/components/tabs", title: "Tabs", section: "Components", sections: [{ id: "sync", title: "Synced tabs", text: "Remember the choice." }] },
    { url: "/docs/theming", title: "Theming", section: "Customization", sections: [] },
  ],
};
const old = { pages: [{ url: "/docs/v0.1/components/tabs", title: "Tabs (old)", sections: [] }] };

const requested: string[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: string) => {
  requested.push(String(url));
  return new Response(JSON.stringify(String(url) === "/docs/v0.1/sitemap.json" ? old : root));
}) as typeof fetch;
afterAll(() => {
  globalThis.fetch = realFetch;
});

// Each test gets a fresh module, so the cached index doesn't leak between tests.
async function setup(extra = "") {
  document.body.innerHTML = markup + extra;
  requested.length = 0;
  const { initSearch } = await import(`./client?${Math.random()}`);
  initSearch();
  return {
    dialog: document.querySelector<HTMLDialogElement>("[data-search-dialog]")!,
    input: document.querySelector<HTMLInputElement>("[data-search-input]")!,
  };
}
const flush = () => new Promise((r) => setTimeout(r, 0));
async function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event("input"));
  for (let i = 0; i < 5; i++) await flush();
}

describe("site search", () => {
  beforeEach(() => document.querySelector<HTMLDialogElement>("dialog[open]")?.close());

  test("Ctrl+K opens the palette and typing renders grouped results", async () => {
    const { dialog, input } = await setup();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    expect(dialog.open).toBe(true);

    await type(input, "tabs");
    const options = [...document.querySelectorAll<HTMLAnchorElement>('[role="option"]')];
    expect(options.map((o) => o.getAttribute("href"))).toEqual(["/docs/components/tabs", "/docs/components/tabs#sync"]);
    expect(document.querySelector(".command-label")!.textContent).toBe("Tabs · Components");
    expect(options[0]!.getAttribute("aria-selected")).toBe("true");
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  test("arrow keys move the active option and wrap", async () => {
    const { input } = await setup();
    document.querySelector<HTMLElement>("[data-search-open]")!.click();
    await type(input, "tabs");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(input.getAttribute("aria-activedescendant")).toBe("search-option-1");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(input.getAttribute("aria-activedescendant")).toBe("search-option-0");
  });

  test("shows a message when nothing matches", async () => {
    const { input } = await setup();
    document.querySelector<HTMLElement>("[data-search-open]")!.click();
    await type(input, "zzzz");
    expect(document.querySelector("[data-search-message]")!.textContent).toBe("No results for “zzzz”.");
  });

  test("reads the index the dialog names", async () => {
    document.body.innerHTML = markup.replace("<dialog data-search-dialog>", '<dialog data-search-dialog data-search-src="/search.json">');
    requested.length = 0;
    const { initSearch } = await import(`./client?${Math.random()}`);
    initSearch();
    document.querySelector<HTMLElement>("[data-search-open]")!.click();
    await type(document.querySelector<HTMLInputElement>("[data-search-input]")!, "tabs");
    expect(requested).toEqual(["/search.json"]);
  });

  test("on archived docs it searches that version's sitemap", async () => {
    const { input } = await setup('<div data-version-switcher data-version="0.1"></div>');
    document.querySelector<HTMLElement>("[data-search-open]")!.click();
    await type(input, "tabs");
    expect(requested).toEqual(["/sitemap.json", "/docs/v0.1/sitemap.json"]);
    expect(document.querySelector('[role="option"]')!.getAttribute("href")).toBe("/docs/v0.1/components/tabs");
  });
});
