import { afterEach, describe, expect, test } from "bun:test";
import { initHoverCard } from "./hover-card";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pointer = (el: Element, type: "pointerenter" | "pointerleave", pointerType = "mouse") =>
  el.dispatchEvent(new PointerEvent(type, { pointerType }));

describe("hover-card", () => {
  const setup = (attrs = 'style="--hover-card-open-delay: 20ms; --hover-card-close-delay: 10ms"', cls = "") => {
    document.body.innerHTML = `
      <p>By <span class="hover-card" data-hover-card ${attrs}>
        <a href="/u/htmx" data-hover-card-trigger>@htmx</a>
        <span class="hover-card-content ${cls}" data-hover-card-content>
          <span class="hover-card-title">htmx</span>
          <a href="/follow">Follow</a>
        </span>
      </span></p>
      <button id="elsewhere">Elsewhere</button>`;
    initHoverCard(document);
    initHoverCard(document);
    return {
      card: document.querySelector<HTMLElement>("[data-hover-card]")!,
      trigger: document.querySelector<HTMLElement>("[data-hover-card-trigger]")!,
      content: document.querySelector<HTMLElement>("[data-hover-card-content]")!,
      inner: document.querySelector<HTMLElement>('a[href="/follow"]')!,
    };
  };
  afterEach(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));

  test("initialises once and adds no role", () => {
    const { card, content, trigger } = setup();
    expect(card.hasAttribute("data-init")).toBe(true);
    expect(content.hasAttribute("role")).toBe(false);
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  test("opens after the open delay and closes after the close delay", async () => {
    const { card } = setup();
    pointer(card, "pointerenter");
    expect(card.hasAttribute("data-open")).toBe(false);
    await wait(40);
    expect(card.hasAttribute("data-open")).toBe(true);
    pointer(card, "pointerleave");
    expect(card.hasAttribute("data-open")).toBe(true);
    await wait(30);
    expect(card.hasAttribute("data-open")).toBe(false);
  });

  test("does not open when the pointer leaves before the delay", async () => {
    const { card } = setup();
    pointer(card, "pointerenter");
    await wait(5);
    pointer(card, "pointerleave");
    await wait(40);
    expect(card.hasAttribute("data-open")).toBe(false);
  });

  test("coming back within the close delay keeps it open", async () => {
    const { card } = setup();
    pointer(card, "pointerenter");
    await wait(40);
    pointer(card, "pointerleave");
    pointer(card, "pointerenter");
    await wait(30);
    expect(card.hasAttribute("data-open")).toBe(true);
  });

  test("touch never opens it", async () => {
    const { card } = setup();
    pointer(card, "pointerenter", "touch");
    await wait(40);
    expect(card.hasAttribute("data-open")).toBe(false);
  });

  test("fires open and close events on the card", async () => {
    const { card, content } = setup();
    const seen: string[] = [];
    content.addEventListener("hover-card:open", () => seen.push("open"));
    card.addEventListener("hover-card:close", () => seen.push("close"));
    pointer(card, "pointerenter");
    await wait(40);
    pointer(card, "pointerleave");
    await wait(30);
    expect(seen).toEqual(["open", "close"]);
  });

  test("keyboard focus opens at once; it stays open while focus is inside and closes when it leaves", () => {
    const { card, trigger, inner } = setup();
    trigger.focus();
    expect(card.hasAttribute("data-open")).toBe(true);
    inner.focus();
    expect(card.hasAttribute("data-open")).toBe(true);
    document.getElementById("elsewhere")!.focus();
    expect(card.hasAttribute("data-open")).toBe(false);
  });

  test("Escape closes it and returns focus from inside the card to the trigger", () => {
    const { card, trigger, inner } = setup();
    trigger.focus();
    inner.focus();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(card.hasAttribute("data-open")).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  test("flips to the opposite side when it would overflow the viewport", () => {
    const { card, trigger, content } = setup(undefined, "hover-card-content-top");
    content.getBoundingClientRect = () =>
      (content.classList.contains("hover-card-content-top")
        ? { top: -50, bottom: 100, left: 10, right: 200 }
        : { top: 40, bottom: 190, left: 10, right: 200 }) as DOMRect;
    trigger.focus();
    expect(card.hasAttribute("data-open")).toBe(true);
    expect(content.dataset.side).toBe("bottom");
    expect(content.classList.contains("hover-card-content-bottom")).toBe(true);
    expect(content.classList.contains("hover-card-content-top")).toBe(false);
  });

  test("keeps its side when it fits", () => {
    const { trigger, content } = setup(undefined, "hover-card-content-right hover-card-content-start");
    trigger.focus();
    expect(content.dataset.side).toBe("right");
    expect(content.classList.contains("hover-card-content-start")).toBe(true);
  });
});
