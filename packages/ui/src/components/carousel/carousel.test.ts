import { describe, expect, test } from "bun:test";
import { getCarousel, initCarousel, registerCarouselPlugin } from "./carousel";

const markup = (attrs = "") => `
  <div class="carousel" data-carousel ${attrs}>
    <div class="carousel-viewport"><div class="carousel-container">
      <div class="carousel-item">1</div><div class="carousel-item">2</div><div class="carousel-item">3</div>
    </div></div>
    <button data-carousel-prev></button><button data-carousel-next></button>
    <div data-carousel-dots></div>
  </div>`;

const ready = (el: HTMLElement) => new Promise<void>((resolve) => el.addEventListener("carousel:init", () => resolve(), { once: true }));

describe("carousel", () => {
  test("loads Embla, labels the slides and wires buttons and dots", async () => {
    document.body.innerHTML = markup();
    const el = document.querySelector<HTMLElement>("[data-carousel]")!;
    const done = ready(el);
    initCarousel(document);
    initCarousel(document);
    await done;
    expect(getCarousel(el)).toBeDefined();
    expect(el.getAttribute("aria-roledescription")).toBe("carousel");
    const slides = el.querySelectorAll(".carousel-item");
    expect(slides[0]!.getAttribute("aria-roledescription")).toBe("slide");
    expect(slides[1]!.getAttribute("aria-label")).toBe("2 of 3");
    expect(el.querySelector<HTMLButtonElement>("[data-carousel-prev]")!.disabled).toBe(true);
  });

  test("passes options and registered plugins", async () => {
    let received: unknown;
    registerCarouselPlugin("spy", (options) => {
      received = options;
      return { name: "spy", options: {}, init() {}, destroy() {} };
    });
    document.body.innerHTML = markup(`data-carousel-options='{"loop": true}' data-carousel-plugins='{"spy": {"delay": 5}}'`);
    const el = document.querySelector<HTMLElement>("[data-carousel]")!;
    const done = ready(el);
    initCarousel(document);
    await done;
    expect(received).toEqual({ delay: 5 });
    expect(getCarousel(el)!.internalEngine().options.loop).toBe(true);
  });
});
