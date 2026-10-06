import { describe, expect, test } from "bun:test";
import { initCollapsible } from "./collapsible";

describe("collapsible", () => {
  const setup = (html: string) => {
    document.body.innerHTML = html;
    initCollapsible(document);
    initCollapsible(document);
  };

  test("toggles its content and keeps every trigger in sync", () => {
    setup(`
      <div data-collapsible>
        <button data-collapsible-trigger id="a">Toggle</button>
        <div data-collapsible-content hidden>Body</div>
        <button data-collapsible-trigger id="b">Show more</button>
      </div>`);
    const [a, b] = ["a", "b"].map((id) => document.getElementById(id)!);
    const content = document.querySelector<HTMLElement>("[data-collapsible-content]")!;
    const wrapper = document.querySelector<HTMLElement>("[data-collapsible]")!;
    const events: boolean[] = [];
    wrapper.addEventListener("collapsible:toggle", (e) => events.push((e as CustomEvent).detail.open));

    expect(a!.getAttribute("aria-controls")).toBe(content.id);
    expect(a!.getAttribute("aria-expanded")).toBe("false");
    b!.click();
    expect(content.hidden).toBe(false);
    expect(a!.getAttribute("aria-expanded")).toBe("true");
    expect(wrapper.hasAttribute("data-open")).toBe(true);
    a!.click();
    expect(content.hidden).toBe(true);
    expect(b!.getAttribute("aria-expanded")).toBe("false");
    expect(events).toEqual([true, false]);
  });

  test("starts open when the content is not hidden", () => {
    setup(`<div data-collapsible><button data-collapsible-trigger>T</button><div data-collapsible-content>Body</div></div>`);
    expect(document.querySelector("[data-collapsible-trigger]")!.getAttribute("aria-expanded")).toBe("true");
  });

  test("nested collapsibles toggle independently", () => {
    setup(`
      <div data-collapsible id="outer">
        <button data-collapsible-trigger id="outer-t">src</button>
        <div data-collapsible-content id="outer-c">
          <div data-collapsible id="inner">
            <button data-collapsible-trigger id="inner-t">components</button>
            <div data-collapsible-content id="inner-c" hidden>button.ts</div>
          </div>
        </div>
      </div>`);
    document.getElementById("inner-t")!.click();
    expect(document.getElementById("inner-c")!.hidden).toBe(false);
    expect(document.getElementById("outer-c")!.hidden).toBe(false);
    document.getElementById("outer-t")!.click();
    expect(document.getElementById("outer-c")!.hidden).toBe(true);
    expect(document.getElementById("inner-c")!.hidden).toBe(false);
    expect(document.getElementById("outer-t")!.getAttribute("aria-controls")).toBe("outer-c");
  });

  test('closes back to hidden="until-found"', () => {
    setup(`<div data-collapsible><button data-collapsible-trigger>T</button><div data-collapsible-content hidden="until-found">Body</div></div>`);
    const trigger = document.querySelector<HTMLElement>("[data-collapsible-trigger]")!;
    const content = document.querySelector<HTMLElement>("[data-collapsible-content]")!;
    trigger.click();
    expect(content.hasAttribute("hidden")).toBe(false);
    trigger.click();
    expect(content.getAttribute("hidden")).toBe("until-found");
  });
});
