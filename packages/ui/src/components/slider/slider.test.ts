import { describe, expect, test } from "bun:test";
import { initSlider } from "./slider";

describe("slider", () => {
  const range = (values: number[], extra = "") => `
    <div class="slider" data-slider ${extra}>
      <div class="slider-track"><div class="slider-range"></div></div>
      ${values.map((v, i) => `<input type="range" id="s${i}" min="0" max="200" value="${v}" />`).join("")}
    </div>
    <output for="s0 s1"></output>`;

  test("paints a single value from the start", () => {
    document.body.innerHTML = range([50]);
    initSlider(document);
    const slider = document.querySelector<HTMLElement>("[data-slider]")!;
    expect(slider.style.getPropertyValue("--slider-start")).toBe("0%");
    expect(slider.style.getPropertyValue("--slider-end")).toBe("25%");
  });

  test("paints a range, fills outputs and keeps thumbs from crossing", () => {
    document.body.innerHTML = range([40, 120], 'data-slider-gap="10"');
    initSlider(document);
    const slider = document.querySelector<HTMLElement>("[data-slider]")!;
    expect(slider.style.getPropertyValue("--slider-start")).toBe("20%");
    expect(slider.style.getPropertyValue("--slider-end")).toBe("60%");
    expect(document.querySelector("output")!.textContent).toBe("40 – 120");

    const [low] = document.querySelectorAll<HTMLInputElement>("input");
    low!.value = "150";
    low!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(low!.value).toBe("110");
    expect(document.querySelector("output")!.textContent).toBe("110 – 120");
  });

  test("marks vertical thumbs and initialises once", () => {
    document.body.innerHTML = range([10, 20], 'data-orientation="vertical"');
    initSlider(document);
    initSlider(document);
    expect(document.querySelector("input")!.getAttribute("aria-orientation")).toBe("vertical");
    expect(document.querySelector("[data-slider]")!.hasAttribute("data-init")).toBe(true);
  });
});
