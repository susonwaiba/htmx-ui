import { describe, expect, test } from "bun:test";
import { initSelect } from "./select";

describe("select", () => {
  const setup = (attrs = "") => {
    document.body.innerHTML = `
      <div data-select ${attrs}>
        <button data-select-trigger aria-expanded="false"><span class="select-value" data-placeholder="Choose"></span></button>
        <div role="listbox" hidden>
          <input data-select-search />
          <span role="option" aria-selected="false" value="nz">New Zealand</span>
          <span role="option" aria-selected="true" value="pt">Portugal</span>
          <span role="option" aria-selected="false" aria-disabled="true">Iceland</span>
          <p data-select-empty hidden>No matches.</p>
        </div>
        <input type="hidden" name="country" data-select-input />
      </div><p id="outside">x</p>`;
    initSelect(document);
    initSelect(document);
    const root = document.querySelector<HTMLElement>("[data-select]")!;
    return {
      root,
      trigger: root.querySelector<HTMLElement>("[data-select-trigger]")!,
      popup: root.querySelector<HTMLElement>('[role="listbox"]')!,
      search: root.querySelector<HTMLInputElement>("[data-select-search]")!,
      empty: root.querySelector<HTMLElement>("[data-select-empty]")!,
      field: root.querySelector<HTMLInputElement>("[data-select-input]")!,
      value: root.querySelector<HTMLElement>(".select-value")!,
      options: [...root.querySelectorAll<HTMLElement>('[role="option"]')],
      selected: () => root.querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]').length,
    };
  };
  const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
  const open = (t: { trigger: HTMLElement }) => t.trigger.click();

  test("the trigger toggles the listbox and aria-expanded", () => {
    const t = setup();
    open(t);
    expect(t.popup.hidden).toBe(false);
    expect(t.trigger.getAttribute("aria-expanded")).toBe("true");
    open(t);
    expect(t.popup.hidden).toBe(true);
    expect(t.trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("a preselected option fills the trigger and the hidden field", () => {
    const t = setup();
    expect(t.value.textContent).toBe("Portugal");
    expect(t.field.value).toBe("pt");
  });

  test("picking an option marks it, copies the label, mirrors the value and fires select:change", () => {
    const t = setup();
    let detail: { value: string; label: string; option: HTMLElement } | undefined;
    document.addEventListener("select:change", (e) => (detail = (e as CustomEvent).detail));
    open(t);
    t.options[0]!.click();
    expect(t.selected()).toBe(1);
    expect(t.options[0]!.getAttribute("aria-selected")).toBe("true");
    expect(t.value.textContent).toBe("New Zealand");
    expect(t.field.value).toBe("nz");
    expect(t.popup.hidden).toBe(true);
    expect(document.activeElement).toBe(t.trigger);
    expect(detail).toEqual({ value: "nz", label: "New Zealand", option: t.options[0]! });
  });

  test("arrow keys open on the picked option, move and skip disabled ones; Enter picks; Escape closes", () => {
    const t = setup();
    key(t.trigger, "ArrowDown");
    expect(t.popup.hidden).toBe(false);
    key(t.popup, "ArrowDown"); // from Portugal to New Zealand (Iceland is aria-disabled)
    expect(document.activeElement).toBe(t.options[0]!);
    key(t.popup, "ArrowDown"); // wraps
    expect(document.activeElement).toBe(t.options[1]!);
    key(t.popup, "End");
    expect(document.activeElement).toBe(t.options[1]!);
    key(t.popup, "Enter");
    expect(t.value.textContent).toBe("Portugal");
    expect(t.popup.hidden).toBe(true);
    key(t.popup, "Escape");
    open(t);
    key(t.popup, "Escape");
    expect(t.popup.hidden).toBe(true);
    expect(document.activeElement).toBe(t.trigger);
  });

  test("clicking outside closes it", () => {
    const t = setup();
    open(t);
    document.getElementById("outside")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(t.popup.hidden).toBe(true);
  });

  test("the filter box hides options that don't match and shows the empty message", () => {
    const t = setup();
    open(t);
    expect(document.activeElement).toBe(t.search);
    t.search.value = "zeal";
    t.search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(t.options.map((o) => o.hidden)).toEqual([false, true, true]);
    expect(t.empty.hidden).toBe(true);
    t.search.value = "iceland";
    t.search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(t.options.map((o) => o.hidden)).toEqual([true, true, false]);
    expect(t.empty.hidden).toBe(true);
    t.search.value = "zzz";
    t.search.dispatchEvent(new Event("input", { bubbles: true }));
    expect(t.options.every((o) => o.hidden)).toBe(true);
    expect(t.empty.hidden).toBe(false);
    // Closing resets the filter, so reopening starts from the full list.
    key(t.popup, "Escape");
    expect(t.search.value).toBe("");
    expect(t.options.every((o) => !o.hidden)).toBe(true);
    expect(t.empty.hidden).toBe(true);
  });

  test("opening makes the options focusable, including ones swapped in later", () => {
    const t = setup();
    // A span is not focusable until the behaviour gives it a tabindex, which is what the
    // arrow keys rely on. Lists that arrive from the server get it when the list opens.
    expect(t.options.every((o) => !o.hasAttribute("tabindex"))).toBe(true);
    open(t);
    expect(t.options.map((o) => o.getAttribute("tabindex"))).toEqual(["-1", "-1", "-1"]);
    key(t.popup, "Escape");
    t.popup.insertAdjacentHTML("beforeend", `<span role="option" aria-selected="false" value="se">Sweden</span>`);
    open(t);
    const added = t.popup.querySelector<HTMLElement>('[role="option"][value="se"]')!;
    expect(added.getAttribute("tabindex")).toBe("-1");
  });

  test("the filter ignores accents, matches data-keywords and hides emptied groups and separators", () => {
    document.body.innerHTML = `
      <div data-select>
        <button data-select-trigger><span class="select-value"></span></button>
        <div role="listbox" hidden>
          <input data-select-search />
          <div role="group"><p class="select-label">Europe</p>
            <span role="option" aria-selected="false" value="zh">Zürich</span>
          </div>
          <div class="select-separator" role="separator"></div>
          <div role="group"><p class="select-label">Oceania</p>
            <span role="option" aria-selected="false" value="akl" data-keywords="new zealand">Auckland</span>
          </div>
        </div>
      </div>`;
    initSelect(document);
    const trigger = document.querySelector<HTMLElement>("[data-select-trigger]")!;
    const search = document.querySelector<HTMLInputElement>("[data-select-search]")!;
    const [europe, oceania] = document.querySelectorAll<HTMLElement>('[role="group"]');
    const separator = document.querySelector<HTMLElement>('[role="separator"]')!;
    const type = (q: string) => {
      search.value = q;
      search.dispatchEvent(new Event("input", { bubbles: true }));
    };
    trigger.click();
    type("zurich");
    expect([europe!.hidden, oceania!.hidden, separator.hidden]).toEqual([false, true, true]);
    type("zealand");
    expect([europe!.hidden, oceania!.hidden, separator.hidden]).toEqual([true, false, true]);
    // Only the visible option is reachable with the keyboard.
    key(search, "ArrowDown");
    expect(document.activeElement?.getAttribute("value")).toBe("akl");
    type("");
    expect([europe!.hidden, oceania!.hidden, separator.hidden]).toEqual([false, false, false]);
  });

  test("without a search box, typing a letter moves to the next option starting with it", () => {
    document.body.innerHTML = `
      <div data-select>
        <button data-select-trigger><span class="select-value"></span></button>
        <div role="listbox" hidden>
          <span role="option" aria-selected="false" value="au">Australia</span>
          <span role="option" aria-selected="false" value="br">Brazil</span>
          <span role="option" aria-selected="false" value="bg">Bulgaria</span>
        </div>
      </div>`;
    initSelect(document);
    const trigger = document.querySelector<HTMLElement>("[data-select-trigger]")!;
    const popup = document.querySelector<HTMLElement>('[role="listbox"]')!;
    trigger.click();
    key(popup, "b");
    expect(document.activeElement?.getAttribute("value")).toBe("br");
    key(popup, "b");
    expect(document.activeElement?.getAttribute("value")).toBe("bg");
  });

  test("initialises a select that is itself the root, as after an htmx swap", () => {
    const root = document.createElement("div");
    root.setAttribute("data-select", "");
    root.innerHTML = `<button data-select-trigger><span class="select-value"></span></button>
      <div role="listbox" hidden><span role="option" aria-selected="false" value="de">Germany</span></div>`;
    document.body.append(root);

    initSelect(root);
    root.querySelector<HTMLElement>("[data-select-trigger]")!.click();
    expect(root.querySelector<HTMLElement>('[role="listbox"]')!.hidden).toBe(false);
  });
});
