import { describe, expect, test } from "bun:test";
import { buildIndex, search, snippet, type Sitemap } from "./search-index";

const sitemap: Sitemap = {
  pages: [
    {
      url: "/docs/components/dropdown",
      title: "Dropdown",
      section: "Components",
      description: "A menu of links or actions that opens from a button.",
      sections: [
        { id: "", title: "", text: "Intro text" },
        { id: "keyboard", title: "Keyboard", text: "Arrow keys move between items. Escape closes the menu." },
        { id: "alignment", title: "Alignment", text: "Add .dropdown-menu-end to align it to the right edge." },
      ],
    },
    {
      url: "/docs/components/button",
      title: "Button",
      section: "Components",
      description: "Triggers an action.",
      sections: [
        { id: "variants", title: "Variants", text: "Use btn btn-secondary for secondary actions." },
        { id: "keyboard-focus", title: "Focus", text: "Buttons show a focus ring for keyboard users." },
      ],
    },
    {
      url: "/docs/dark-mode",
      title: "Dark mode",
      section: "Customization",
      sections: [{ id: "switcher", title: "Theme switcher", text: "Toggle between light and dark mode with a button." }],
    },
  ],
};
const records = buildIndex(sitemap);
const hrefs = (q: string) => search(records, q).map((r) => r.href);

describe("buildIndex", () => {
  test("one record per page plus one per anchored section", () => {
    expect(records.map((r) => r.href)).toEqual([
      "/docs/components/dropdown",
      "/docs/components/dropdown#keyboard",
      "/docs/components/dropdown#alignment",
      "/docs/components/button",
      "/docs/components/button#variants",
      "/docs/components/button#keyboard-focus",
      "/docs/dark-mode",
      "/docs/dark-mode#switcher",
    ]);
    expect(records[0]!.text).toBe("A menu of links or actions that opens from a button. Intro text");
  });
});

describe("search", () => {
  test("a page title match ranks the page first", () => {
    expect(hrefs("dropdown")[0]).toBe("/docs/components/dropdown");
  });

  test("a heading match ranks that section above body-text mentions", () => {
    expect(hrefs("keyboard")[0]).toBe("/docs/components/dropdown#keyboard");
    expect(hrefs("keyboard")).toContain("/docs/components/button#keyboard-focus");
  });

  test("tolerates a missing letter, a swapped pair and a prefix", () => {
    expect(hrefs("dropdwn")[0]).toBe("/docs/components/dropdown");
    expect(hrefs("dorpdown")[0]).toBe("/docs/components/dropdown");
    expect(hrefs("drop")[0]).toBe("/docs/components/dropdown");
  });

  test("every word must match; adjacent words and phrases rank higher", () => {
    expect(hrefs("dropdown banana")).toEqual([]);
    expect(hrefs("btn-secondary")[0]).toBe("/docs/components/button#variants");
    expect(hrefs("dark mode")[0]).toBe("/docs/dark-mode");
  });

  test("empty and whitespace queries return nothing", () => {
    expect(search(records, "")).toEqual([]);
    expect(search(records, "   ")).toEqual([]);
  });

  test("respects the limit", () => {
    expect(search(records, "button", 2)).toHaveLength(2);
  });
});

describe("snippet", () => {
  test("marks every match around the first one", () => {
    expect(snippet("Toggle between light and dark mode.", ["dark"])).toEqual([
      { text: "Toggle between light and ", match: false },
      { text: "dark", match: true },
      { text: " mode.", match: false },
    ]);
  });

  test("trims long text with ellipses around the match", () => {
    const long = `${"a ".repeat(100)}needle${" b".repeat(100)}`;
    const parts = snippet(long, ["needle"], 10);
    expect(parts[0]).toEqual({ text: "…", match: false });
    expect(parts.at(-1)).toEqual({ text: "…", match: false });
    expect(parts.some((p) => p.match && p.text === "needle")).toBe(true);
  });

  test("returns text as data, never markup", () => {
    const parts = snippet('<img src=x onerror="alert(1)"> dark', ["dark"]);
    expect(parts[0]!.text).toBe('<img src=x onerror="alert(1)"> ');
  });
});
