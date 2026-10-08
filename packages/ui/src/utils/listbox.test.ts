import { describe, expect, test } from "bun:test";
import { activeDescendant, filterOptions, reachable } from "./listbox";

const list = () => {
  document.body.innerHTML = `<input id="q" /><div id="l" role="listbox">
    <div role="group"><span role="option" id="a">Zürich</span><span role="option" id="b" data-keywords="capital">Bern</span></div>
    <div role="separator"></div>
    <div role="group"><span role="option" id="c">Lyon</span><span role="option" id="d" aria-disabled="true">Nice</span></div>
  </div>`;
  return { input: document.getElementById("q")!, popup: document.getElementById("l")! };
};

describe("listbox helpers", () => {
  test("filterOptions folds accents, matches keywords, hides emptied groups and stray separators", () => {
    const { popup } = list();
    const sep = popup.querySelector<HTMLElement>('[role="separator"]')!;
    const [g1, g2] = popup.querySelectorAll<HTMLElement>('[role="group"]');
    expect(filterOptions(popup, "zurich")).toBe(1);
    expect([g1!.hidden, g2!.hidden, sep.hidden]).toEqual([false, true, true]);
    expect(filterOptions(popup, "capital")).toBe(1);
    expect(filterOptions(popup, "")).toBe(4);
    expect(sep.hidden).toBe(false);
    expect(filterOptions(popup, "zzz", { match: false })).toBe(4);
    expect(filterOptions(popup, "ly", { matches: (t, q) => t.startsWith(q) })).toBe(1);
  });

  test("reachable skips hidden, disabled and hidden-group options", () => {
    const { popup } = list();
    expect(reachable(popup).map((o) => o.id)).toEqual(["a", "b", "c"]);
    filterOptions(popup, "lyon");
    expect(reachable(popup).map((o) => o.id)).toEqual(["c"]);
  });

  test("activeDescendant moves the highlight and points the owner at it", () => {
    const { input, popup } = list();
    const all = () => [...popup.querySelectorAll<HTMLElement>('[role="option"]')];
    const hl = activeDescendant(input, { all, options: () => reachable(popup) });
    hl.move(1);
    expect(hl.active?.id).toBe("a");
    expect(input.getAttribute("aria-activedescendant")).toBe("a");
    expect(document.getElementById("a")!.hasAttribute("data-highlighted")).toBe(true);
    hl.move(-1);
    expect(hl.active?.id).toBe("c");
    hl.move("first");
    expect(hl.active?.id).toBe("a");
    hl.highlight(null);
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    expect(all().some((o) => o.hasAttribute("data-highlighted"))).toBe(false);
  });

  test("with select, the highlighted option is the aria-selected one", () => {
    const { input, popup } = list();
    const all = () => [...popup.querySelectorAll<HTMLElement>('[role="option"]')];
    const hl = activeDescendant(input, { all, options: () => reachable(popup), select: true });
    hl.move("last");
    expect(all().map((o) => o.getAttribute("aria-selected"))).toEqual(["false", "false", "true", "false"]);
  });
});
