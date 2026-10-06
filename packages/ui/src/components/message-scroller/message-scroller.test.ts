import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { getMessageScroller, initMessageScroller, type MessageScroller } from "./message-scroller";

// happy-dom has no layout, so this lays the transcript out by hand: the viewport is `client` px
// tall at the top of the page, each row of the content is its data-h px tall, stacked, and the
// spacer follows. scrollTop is clamped like a browser's; scroll events are dispatched by the tests
// (for the reader's scrolls) since setting scrollTop here doesn't fire one.
const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await frame();
};

let client = 300;
const realRect = Element.prototype.getBoundingClientRect;

function layout(el: HTMLElement) {
  const viewport = el.querySelector<HTMLElement>(".message-scroller-viewport")!;
  const content = el.querySelector<HTMLElement>(".message-scroller-content")!;
  const rows = () => [...content.children] as HTMLElement[];
  const spacer = () => parseFloat(el.querySelector<HTMLElement>("[data-message-scroller-spacer]")?.style.height ?? "0") || 0;
  const contentHeight = () => rows().reduce((sum, r) => sum + Number(r.dataset.h ?? 0), 0);
  let top = 0;
  const max = () => Math.max(0, contentHeight() + spacer() - client);
  Object.defineProperty(viewport, "clientHeight", { configurable: true, get: () => client });
  Object.defineProperty(viewport, "scrollHeight", { configurable: true, get: () => contentHeight() + spacer() + 0 });
  Object.defineProperty(viewport, "scrollTop", {
    configurable: true,
    get: () => top,
    set: (v: number) => void (top = Math.min(Math.max(v, 0), max())),
  });
  viewport.scrollTo = ((options: ScrollToOptions) => void (viewport.scrollTop = options.top ?? 0)) as typeof viewport.scrollTo;

  Element.prototype.getBoundingClientRect = function (this: Element) {
    const rect = (y: number, h: number) => ({ top: y, bottom: y + h, height: h, left: 0, right: 100, width: 100, x: 0, y }) as DOMRect;
    if (this === viewport) return rect(0, client);
    if (this === content) return rect(-top, contentHeight());
    let row: Element | null = this;
    while (row && row.parentElement !== content) row = row.parentElement;
    if (!row) return rect(-top + contentHeight(), spacer());
    let y = -top;
    for (const r of rows()) {
      if (r === row) return rect(y, Number(r.dataset.h ?? 0));
      y += Number(r.dataset.h ?? 0);
    }
    return rect(0, 0);
  };
  return { viewport, content };
}

const user = (id: string, h = 100) => `<div class="message" data-align="end" id="${id}" data-h="${h}"><div class="message-content">${id}</div></div>`;
const bot = (id: string, h = 100, extra = "") =>
  `<div class="message message-plain" id="${id}" data-h="${h}"${extra}><div class="message-content">${id}</div></div>`;

function mount(rows: string, attrs = "") {
  document.body.innerHTML = `
    <div class="message-scroller" data-message-scroller aria-label="Chat" ${attrs}>
      <div class="message-scroller-viewport"><div class="message-scroller-content">${rows}</div></div>
      <button type="button" class="message-scroller-jump" data-message-scroller-jump aria-label="Jump to latest"></button>
    </div>`;
  const el = document.querySelector<HTMLElement>("[data-message-scroller]")!;
  const { viewport, content } = layout(el);
  const events: string[] = [];
  for (const name of ["follow", "unfollow", "unread", "anchor"]) {
    el.addEventListener(`message-scroller:${name}`, () => events.push(name));
  }
  initMessageScroller(document);
  const api = getMessageScroller(el) as MessageScroller;
  const jump = el.querySelector<HTMLElement>("[data-message-scroller-jump]")!;
  return { el, viewport, content, api, jump, events };
}

/** The reader scrolls the viewport to `top`. */
function userScroll(viewport: HTMLElement, top: number) {
  viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: top < viewport.scrollTop ? -100 : 100 }));
  viewport.scrollTop = top;
  viewport.dispatchEvent(new Event("scroll"));
}

const transcript = user("a") + bot("b", 400) + user("c") + bot("d", 100); // 700px

beforeEach(() => {
  client = 300;
  history.replaceState(null, "", location.pathname);
});
afterEach(() => {
  Element.prototype.getBoundingClientRect = realRect;
  document.body.innerHTML = "";
});

describe("message-scroller", () => {
  test("initialises once: spacer, status, labelled focusable viewport, API", () => {
    const { el, viewport, api } = mount(transcript);
    initMessageScroller(document);
    expect(el.hasAttribute("data-init")).toBe(true);
    expect(el.querySelectorAll("[data-message-scroller-spacer]").length).toBe(1);
    expect(el.querySelectorAll("[data-message-scroller-status]").length).toBe(1);
    expect(el.querySelector("[data-message-scroller-status]")!.getAttribute("role")).toBe("status");
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute("role")).toBe("region");
    expect(viewport.getAttribute("aria-label")).toBe("Chat");
    expect(viewport.hasAttribute("aria-live")).toBe(false);
    expect(getMessageScroller(viewport)).toBe(api);
  });

  test("opens at the last anchor turn near the top, with a spacer below it", () => {
    const { viewport, api, el } = mount(transcript);
    // c starts at 500; 48px (the default offset) of b stays above it.
    expect(viewport.scrollTop).toBe(452);
    // 452 + 300 - 700: room for d to grow into.
    expect(el.querySelector<HTMLElement>("[data-message-scroller-spacer]")!.style.height).toBe("52px");
    expect(api.following).toBe(true);
  });

  test("opens at the bottom, the top, a row, or the row in location.hash", () => {
    expect(mount(transcript, 'data-message-scroller-open="bottom"').viewport.scrollTop).toBe(400);
    expect(mount(transcript, 'data-message-scroller-open="top"').viewport.scrollTop).toBe(0);
    expect(mount(transcript, 'data-message-scroller-open="#b"').viewport.scrollTop).toBe(100 - 48);
    history.replaceState(null, "", "#c");
    const { viewport, el } = mount(transcript, 'data-message-scroller-open="top"');
    expect(viewport.scrollTop).toBe(400); // as close as it gets: no anchor spacer when opened by link
    expect(el.querySelector("#c")!.hasAttribute("data-highlighted")).toBe(true);
  });

  test("follows growing content while at the bottom", () => {
    const { viewport, api, content } = mount(transcript, 'data-message-scroller-open="bottom"');
    expect(api.following).toBe(true);
    content.querySelector<HTMLElement>("#d")!.dataset.h = "350";
    api.update(); // what the ResizeObserver does
    expect(viewport.scrollTop).toBe(650);
  });

  test("never follows with data-message-scroller-follow=false", () => {
    const { viewport, api, content } = mount(transcript, 'data-message-scroller-open="bottom" data-message-scroller-follow="false"');
    expect(api.following).toBe(false);
    content.querySelector<HTMLElement>("#d")!.dataset.h = "350";
    api.update();
    expect(viewport.scrollTop).toBe(400);
  });

  test("stops following when the reader scrolls up, and leaves them there", () => {
    const { viewport, api, content, events } = mount(transcript, 'data-message-scroller-open="bottom"');
    userScroll(viewport, 200);
    expect(api.following).toBe(false);
    expect(events).toContain("unfollow");
    content.querySelector<HTMLElement>("#d")!.dataset.h = "350";
    api.update();
    expect(viewport.scrollTop).toBe(200);
    // Back at the edge: following again.
    userScroll(viewport, 650);
    expect(api.following).toBe(true);
  });

  test("wheel, keys, links and text selection stop following", () => {
    const { viewport, api, el } = mount(transcript, 'data-message-scroller-open="bottom"');
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: -10 }));
    expect(api.following).toBe(false);

    api.scrollToBottom();
    expect(api.following).toBe(true);
    viewport.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
    expect(api.following).toBe(false);

    api.scrollToBottom();
    el.querySelector("#d .message-content")!.innerHTML = '<a href="https://example.com">link</a>';
    el.querySelector("#d a")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(api.following).toBe(false);

    api.scrollToBottom();
    const range = document.createRange();
    range.selectNodeContents(el.querySelector("#b .message-content")!);
    document.getSelection()!.removeAllRanges();
    document.getSelection()!.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
    expect(api.following).toBe(false);
    document.getSelection()!.removeAllRanges();
  });

  test("the jump button: hidden at the edge, unread and streaming away from it, and jumping resumes following", async () => {
    const { viewport, api, content, jump, events } = mount(transcript, 'data-message-scroller-open="bottom"');
    expect(jump.dataset.state).toBe("hidden");
    expect(jump.hasAttribute("inert")).toBe(true);

    userScroll(viewport, 100);
    expect(jump.dataset.state).toBe("latest");
    expect(jump.hasAttribute("inert")).toBe(false);

    content.insertAdjacentHTML("beforeend", bot("e", 100));
    await settle();
    expect(viewport.scrollTop).toBe(100); // arrived offscreen, nothing moved
    expect(api.unread).toBe(true);
    expect(events).toContain("unread");
    expect(jump.dataset.state).toBe("unread");

    content.querySelector<HTMLElement>("#e")!.setAttribute("data-streaming", "");
    await settle();
    expect(jump.dataset.state).toBe("streaming");

    jump.click();
    viewport.dispatchEvent(new Event("scroll"));
    expect(viewport.scrollTop).toBe(500);
    expect(api.following).toBe(true);
    expect(api.unread).toBe(false);
    expect(jump.dataset.state).toBe("hidden");
  });

  test("a new user turn is anchored near the top and the reply grows into the space below", async () => {
    const { viewport, api, content, el, events } = mount(transcript, 'data-message-scroller-open="bottom"');
    content.insertAdjacentHTML("beforeend", user("f", 60) + bot("g", 20, " data-streaming"));
    await settle();
    // f starts at 700: scrolled to 652, with a spacer making that the bottom.
    expect(viewport.scrollTop).toBe(652);
    const spacer = el.querySelector<HTMLElement>("[data-message-scroller-spacer]")!;
    expect(spacer.style.height).toBe(`${652 + 300 - 780}px`);
    expect(events).toContain("anchor");
    expect(api.following).toBe(true);

    // The reply streams: the spacer shrinks and f stays put…
    content.querySelector<HTMLElement>("#g")!.dataset.h = "120";
    api.update();
    expect(viewport.scrollTop).toBe(652);
    expect(spacer.style.height).toBe(`${652 + 300 - 880}px`);
    // …until the reply fills the view.
    content.querySelector<HTMLElement>("#g")!.dataset.h = "400";
    api.update();
    expect(spacer.style.height).toBe("0px");
  });

  test("an anchor that arrives while the reader is away still opens their turn (they sent it)", async () => {
    const { viewport, content } = mount(transcript, 'data-message-scroller-open="bottom"');
    userScroll(viewport, 0);
    content.insertAdjacentHTML("beforeend", user("f", 60));
    await settle();
    expect(viewport.scrollTop).toBe(652);
  });

  test("prepending older rows keeps the first visible row where it was", async () => {
    const { viewport, content } = mount(transcript, 'data-message-scroller-open="bottom"');
    userScroll(viewport, 150); // b is first visible, 50px above the top
    content.insertAdjacentHTML("afterbegin", user("old1", 120) + bot("old2", 80));
    await settle();
    expect(viewport.scrollTop).toBe(350);
    expect(content.querySelector("#old2")!.closest("[data-highlighted]")).toBeNull();
  });

  test("a row resized above the reader doesn't move what they see", () => {
    const { viewport, content, api } = mount(transcript, 'data-message-scroller-open="bottom"');
    userScroll(viewport, 300); // b is first visible, 200px above the top
    content.querySelector<HTMLElement>("#a")!.dataset.h = "180"; // an image loaded
    api.update();
    expect(viewport.scrollTop).toBe(380);
  });

  test("scrollToMessage and links to rows scroll the viewport and highlight the row", () => {
    const { viewport, api, el } = mount(transcript, 'data-message-scroller-open="bottom"');
    expect(api.scrollToMessage("b")).toBe(true);
    expect(viewport.scrollTop).toBe(52);
    expect(api.following).toBe(false);
    expect(el.querySelector("#b")!.hasAttribute("data-highlighted")).toBe(true);
    expect(api.scrollToMessage("missing")).toBe(false);

    document.body.insertAdjacentHTML("beforeend", '<a href="#c" id="link">see c</a>');
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    document.getElementById("link")!.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(viewport.scrollTop).toBe(400);
    expect(location.hash).toBe("#c");

    api.scrollToMessage("b", { align: "center", highlight: false });
    expect(viewport.scrollTop).toBe(100 - (300 - 400) / 2);
  });

  test("a smooth jump to a row stays there when the animation ends", () => {
    const { viewport, api } = mount(transcript, 'data-message-scroller-open="bottom"');
    expect(viewport.scrollTop).toBe(400);
    // A real smooth scroll moves later and fires scrollend once it lands.
    let dest = -1;
    viewport.scrollTo = ((options: ScrollToOptions) => void (dest = options.top ?? 0)) as typeof viewport.scrollTo;
    api.scrollToMessage("a", { smooth: true });
    expect(viewport.scrollTop).toBe(400);
    viewport.scrollTop = dest;
    viewport.dispatchEvent(new Event("scroll"));
    viewport.dispatchEvent(new Event("scrollend"));
    expect(viewport.scrollTop).toBe(0);
    expect(api.following).toBe(false);
  });

  test("announces new messages and finished responses politely", async () => {
    const { el, content } = mount(transcript, 'data-message-scroller-announce-new="New reply"');
    const status = el.querySelector("[data-message-scroller-status]")!;
    content.insertAdjacentHTML("beforeend", bot("e", 100));
    await settle();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(status.textContent).toBe("New reply");

    el.setAttribute("data-streaming", "");
    await settle();
    el.removeAttribute("data-streaming");
    await new Promise((resolve) => setTimeout(resolve, 1700));
    expect(status.textContent).toBe("Response complete");
  });
});
