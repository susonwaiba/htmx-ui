import { describe, expect, test } from "bun:test";
import { initAccordion } from "./accordion";

describe("accordion", () => {
  test("a disabled summary can't open its item; others still can", () => {
    document.body.innerHTML = `
      <div data-accordion>
        <details id="a"><summary>A</summary><p>a</p></details>
        <details id="b"><summary aria-disabled="true">B</summary><p>b</p></details>
      </div>`;
    initAccordion(document);
    initAccordion(document);
    const clicked = (id: string) => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      document.querySelector(`#${id} summary`)!.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(clicked("b")).toBe(true);
    expect(clicked("a")).toBe(false);
  });
});
