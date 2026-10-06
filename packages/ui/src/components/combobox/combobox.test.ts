import { describe, expect, test } from "bun:test";
import { initCombobox } from "./combobox";

const key = (el: Element, k: string) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

describe("combobox", () => {
  const setup = (attrs = "", input = '<input data-combobox-input placeholder="Pick" />') => {
    document.body.innerHTML = `
      <form>
        <div data-combobox ${attrs}>
          ${input}
          <button type="button" data-combobox-clear hidden>×</button>
          <button type="button" data-combobox-toggle>▾</button>
          <div role="listbox" hidden>
            <div role="option" value="astro">Astro</div>
            <div role="separator" id="sep1"></div>
            <div role="group" id="meta">
              <div>Meta</div>
              <div role="option" value="next" data-keywords="react vercel">Next.js</div>
              <div role="option" value="nuxt">Nuxt</div>
            </div>
            <div role="separator" id="sep2"></div>
            <div role="group" id="other">
              <div role="option" value="svelte">SvelteKit</div>
              <div role="option" value="remix" aria-disabled="true">Remix</div>
              <div role="option" value="qwik">Qwik Cíty</div>
            </div>
            <p data-combobox-empty hidden>None</p>
          </div>
          <input type="hidden" name="fw" data-combobox-value />
        </div>
      </form>`;
    initCombobox(document);
    initCombobox(document);
    const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
    const el = {
      box: $("[data-combobox]"),
      input: $<HTMLInputElement>("[data-combobox-input]"),
      list: $("[role=listbox]"),
      clear: $("[data-combobox-clear]"),
      toggle: $("[data-combobox-toggle]"),
      option: (v: string) => $(`[role=option][value="${v}"]`),
      visible: () => [...document.querySelectorAll<HTMLElement>("[role=option]:not([hidden])")].map((o) => o.getAttribute("value")),
      type: (text: string) => {
        el.input.value = text;
        el.input.dispatchEvent(new Event("input", { bubbles: true }));
      },
      values: () => [...document.querySelectorAll<HTMLInputElement>("input[data-combobox-value]")].map((i) => i.value),
    };
    return el;
  };

  test("wires the input up as a combobox", () => {
    const { input, list } = setup();
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-controls")).toBe(list.id);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
  });

  test("typing opens and filters, ignoring case and accents, matching keywords", () => {
    const el = setup();
    el.type("CITY");
    expect(el.list.hidden).toBe(false);
    expect(el.visible()).toEqual(["qwik"]);
    el.type("react");
    expect(el.visible()).toEqual(["next"]);
    el.type("zzz");
    expect(el.visible()).toEqual([]);
    expect(document.querySelector<HTMLElement>("[data-combobox-empty]")!.hidden).toBe(false);
  });

  test("hides empty groups and the separators around them", () => {
    const el = setup();
    el.type("astro");
    expect(document.getElementById("meta")!.hidden).toBe(true);
    expect(document.getElementById("other")!.hidden).toBe(true);
    expect(document.getElementById("sep1")!.hidden).toBe(true);
    expect(document.getElementById("sep2")!.hidden).toBe(true);
    el.type("n");
    // Next.js and Nuxt: one group, nothing either side
    expect(document.getElementById("sep1")!.hidden).toBe(true);
    expect(document.getElementById("sep2")!.hidden).toBe(true);
    el.type("s");
    // Astro, Next.js, SvelteKit: content on both sides of both
    expect(document.getElementById("sep1")!.hidden).toBe(false);
    expect(document.getElementById("sep2")!.hidden).toBe(false);
  });

  test("arrow keys move the highlight, skipping disabled options; Enter picks", () => {
    const el = setup();
    key(el.input, "ArrowDown");
    expect(el.list.hidden).toBe(false);
    expect(el.input.getAttribute("aria-activedescendant")).toBe(el.option("astro").id);
    for (let i = 0; i < 4; i++) key(el.input, "ArrowDown");
    expect(el.input.getAttribute("aria-activedescendant")).toBe(el.option("qwik").id);
    key(el.input, "ArrowDown");
    expect(el.option("astro").hasAttribute("data-highlighted")).toBe(true);
    key(el.input, "ArrowUp");
    let detail: { value: string } | undefined;
    el.box.addEventListener("combobox:change", (e) => (detail = (e as CustomEvent).detail));
    key(el.input, "Enter");
    expect(el.input.value).toBe("Qwik Cíty");
    expect(el.values()).toEqual(["qwik"]);
    expect(detail?.value).toBe("qwik");
    expect(el.list.hidden).toBe(true);
    expect(el.option("qwik").getAttribute("aria-selected")).toBe("true");
  });

  test("auto highlight takes the first match", () => {
    const el = setup("data-autohighlight");
    el.type("nu");
    expect(el.option("nuxt").hasAttribute("data-highlighted")).toBe(true);
    key(el.input, "Enter");
    expect(el.values()).toEqual(["nuxt"]);
  });

  test("without auto highlight, Enter does nothing until an option is highlighted", () => {
    const el = setup();
    el.type("nu");
    expect(key(el.input, "Enter")).toBe(true);
    expect(el.values()).toEqual([""]);
  });

  test("leaving puts the label back; emptying the input clears the choice", () => {
    const el = setup();
    el.option("astro").click();
    el.type("Sv");
    key(el.input, "Escape");
    expect(el.input.value).toBe("Astro");
    el.type("");
    key(el.input, "Escape");
    expect(el.values()).toEqual([""]);
    expect(el.option("astro").getAttribute("aria-selected")).toBe("false");
  });

  test("the clear button shows with a value and clears it", () => {
    const el = setup();
    expect(el.clear.hidden).toBe(true);
    el.option("nuxt").click();
    expect(el.clear.hidden).toBe(false);
    el.clear.click();
    expect(el.input.value).toBe("");
    expect(el.values()).toEqual([""]);
    expect(el.clear.hidden).toBe(true);
  });

  test("the toggle opens and closes", () => {
    const el = setup();
    el.toggle.click();
    expect(el.list.hidden).toBe(false);
    el.toggle.click();
    expect(el.list.hidden).toBe(true);
  });

  test("a preselected option fills the input and the hidden field", () => {
    document.body.innerHTML = `
      <div data-combobox>
        <input data-combobox-input />
        <div role="listbox" hidden><div role="option" value="a">Alpha</div><div role="option" value="b" aria-selected="true">Beta</div></div>
        <input type="hidden" name="x" data-combobox-value />
      </div>`;
    initCombobox(document);
    expect(document.querySelector<HTMLInputElement>("[data-combobox-input]")!.value).toBe("Beta");
    expect(document.querySelector<HTMLInputElement>("[data-combobox-value]")!.value).toBe("b");
  });

  describe("multiple", () => {
    const multi = () =>
      setup(
        "data-multiple",
        '<div data-combobox-chips><input data-combobox-input placeholder="Pick" /></div>',
      );
    const chips = () => [...document.querySelectorAll<HTMLElement>(".combobox-chip")].map((c) => c.dataset.value);

    test("picks toggle, stay open, and render chips and one hidden field per value", () => {
      const el = multi();
      expect(el.list.getAttribute("aria-multiselectable")).toBe("true");
      el.input.click();
      el.option("next").click();
      el.option("astro").click();
      expect(el.list.hidden).toBe(false);
      expect(chips()).toEqual(["next", "astro"]);
      expect(el.values()).toEqual(["next", "astro"]);
      expect(document.querySelectorAll("input[name=fw]")).toHaveLength(2);
      expect(el.input.placeholder).toBe("");
      el.option("next").click();
      expect(chips()).toEqual(["astro"]);
    });

    test("chip remove buttons and Backspace remove picks", () => {
      const el = multi();
      el.input.click();
      el.option("next").click();
      el.option("nuxt").click();
      el.option("svelte").click();
      document.querySelector<HTMLElement>('.combobox-chip[data-value="nuxt"] .combobox-chip-remove')!.click();
      expect(chips()).toEqual(["next", "svelte"]);
      key(el.input, "Backspace");
      expect(chips()).toEqual(["next"]);
      expect(el.option("svelte").getAttribute("aria-selected")).toBe("false");
      key(el.input, "Backspace");
      expect(el.values()).toEqual([]);
      expect(el.input.placeholder).toBe("Pick");
    });

    test("picks survive the option list being replaced", async () => {
      const el = multi();
      el.input.click();
      el.option("next").click();
      el.list.innerHTML = '<div role="option" value="next">Next.js</div><div role="option" value="gatsby">Gatsby</div>';
      await new Promise((r) => setTimeout(r));
      expect(el.option("next").getAttribute("aria-selected")).toBe("true");
      el.option("gatsby").click();
      expect(el.values()).toEqual(["next", "gatsby"]);
    });
  });
});
