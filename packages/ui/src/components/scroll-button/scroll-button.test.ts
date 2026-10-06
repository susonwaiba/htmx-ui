import { afterEach, describe, expect, mock, test } from "bun:test";
import { distanceFromEdge, initScrollButton, scrollTargetOf, scrollToEdge } from "./scroll-button";

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Gives an element fixed scroll metrics; scrollTop stays writable. */
function metrics(el: HTMLElement, scrollHeight: number, clientHeight: number, scrollTop = 0) {
  let top = scrollTop;
  Object.defineProperty(el, "scrollHeight", { configurable: true, get: () => scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, get: () => clientHeight });
  Object.defineProperty(el, "scrollTop", { configurable: true, get: () => top, set: (v: number) => void (top = v) });
}

function chat(button = 'data-scroll-button aria-label="Scroll to bottom"') {
  document.body.innerHTML = `
    <div class="relative">
      <div id="log" data-scroll-container tabindex="0"><p>a</p><p>b</p></div>
      <button type="button" class="scroll-button" ${button}></button>
    </div>`;
  return {
    log: document.getElementById("log")!,
    button: document.querySelector<HTMLButtonElement>("[data-scroll-button]")!,
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("scroll-button", () => {
  test("initialises once", () => {
    const { button, log } = chat();
    metrics(log, 1000, 200, 800);
    initScrollButton(document);
    initScrollButton(document);
    expect(button.hasAttribute("data-init")).toBe(true);
    const click = mock();
    log.scrollTo = click as typeof log.scrollTo;
    button.click();
    expect(click).toHaveBeenCalledTimes(1);
  });

  test("finds its target: a selector, an ancestor or sibling container, an overflowing ancestor, else the page", () => {
    document.body.innerHTML = `
      <div id="a" data-scroll-container><button data-scroll-button id="b1"></button></div>
      <div><div data-scroll-container id="c"></div><button data-scroll-button id="b2"></button></div>
      <div id="d" style="overflow-y: auto"><div><button data-scroll-button id="b3"></button></div></div>
      <button data-scroll-button data-scroll-target="#c" id="b4"></button>
      <button data-scroll-button id="b5"></button>`;
    const target = (id: string) => scrollTargetOf(document.getElementById(id)!)?.id ?? null;
    expect(target("b1")).toBe("a");
    expect(target("b2")).toBe("c");
    expect(target("b3")).toBe("d");
    expect(target("b4")).toBe("c");
    expect(target("b5")).toBeNull();
  });

  test("hidden and inert near the bottom, visible when scrolled away", async () => {
    const { button, log } = chat();
    metrics(log, 1000, 200, 750); // 50px from the bottom
    initScrollButton(document);
    expect(button.dataset.state).toBe("hidden");
    expect(button.hasAttribute("inert")).toBe(true);

    log.scrollTop = 100; // 700px from the bottom
    log.dispatchEvent(new Event("scroll"));
    await frame();
    expect(button.dataset.state).toBe("visible");
    expect(button.hasAttribute("inert")).toBe(false);
  });

  test("a top button shows once scrolled past the threshold", async () => {
    const { button, log } = chat('data-scroll-button="top" data-scroll-threshold="300"');
    metrics(log, 1000, 200, 250);
    initScrollButton(document);
    expect(button.dataset.state).toBe("hidden");
    log.scrollTop = 301;
    log.dispatchEvent(new Event("scroll"));
    await frame();
    expect(button.dataset.state).toBe("visible");
  });

  test("click scrolls the target to its edge, instantly when asked", () => {
    const { button, log } = chat('data-scroll-button data-scroll-behavior="instant"');
    metrics(log, 1000, 200, 0);
    const scrollTo = mock();
    log.scrollTo = scrollTo as typeof log.scrollTo;
    initScrollButton(document);
    button.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "instant" });
  });

  test("hiding the focused button hands focus to the container", async () => {
    const { button, log } = chat();
    metrics(log, 1000, 200, 0);
    initScrollButton(document);
    expect(button.dataset.state).toBe("visible");
    button.focus();
    log.scrollTop = 800;
    log.dispatchEvent(new Event("scroll"));
    await frame();
    expect(button.dataset.state).toBe("hidden");
    expect(document.activeElement).toBe(log);
  });

  test("updates when content is added", async () => {
    const { button, log } = chat();
    let height = 200;
    metrics(log, 0, 200, 0);
    Object.defineProperty(log, "scrollHeight", { configurable: true, get: () => height });
    initScrollButton(document);
    expect(button.dataset.state).toBe("hidden");
    height = 1000;
    log.append(document.createElement("p"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await frame();
    expect(button.dataset.state).toBe("visible");
  });

  test("helpers: distanceFromEdge and scrollToEdge", () => {
    const el = document.createElement("div");
    metrics(el, 1000, 200, 300);
    expect(distanceFromEdge(el, "top")).toBe(300);
    expect(distanceFromEdge(el, "bottom")).toBe(500);
    const scrollTo = mock();
    el.scrollTo = scrollTo as typeof el.scrollTo;
    scrollToEdge(el, "top", "smooth");
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
