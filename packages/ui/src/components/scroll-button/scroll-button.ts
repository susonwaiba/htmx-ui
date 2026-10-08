// Scroll button. Markup and placement: see scroll-button.css.
// - [data-scroll-button="bottom" | "top"] ("bottom" when empty) is hidden (data-state="hidden",
//   inert) while its scroll target is within data-scroll-threshold px (200) of that edge, and
//   visible (data-state="visible") otherwise. A click scrolls the target to the edge, smoothly
//   unless data-scroll-behavior="instant" or the user prefers reduced motion.
// - The target: data-scroll-target="<selector>"; else the closest [data-scroll-container]
//   ancestor; else a [data-scroll-container] sibling (a button laid over the box it scrolls;
//   not for a button directly in <body>); else the nearest ancestor with overflow-y auto or
//   scroll; else the page.
// - Updates on scroll (passive, once per frame), when the target or the window resizes and
//   when its content grows (children added or resized), so a chat transcript's "jump to
//   bottom" appears as messages stream in. Listeners are dropped once the button leaves the document.
import { queryAll } from "../../utils/dom";
import { reducedMotion } from "../../utils/shared";

export type ScrollEdge = "top" | "bottom";
/** An element that scrolls, or null for the page. */
export type ScrollTarget = HTMLElement | null;

const DEFAULT_THRESHOLD = 200;

const pageScroller = () => (document.scrollingElement ?? document.documentElement) as HTMLElement;


function scrollsY(el: Element): boolean {
  const overflow = getComputedStyle(el).overflowY;
  return overflow === "auto" || overflow === "scroll";
}

/** The element a scroll button scrolls (null: the page). See the header for the order. */
export function scrollTargetOf(button: HTMLElement): ScrollTarget {
  const selector = button.dataset.scrollTarget;
  if (selector) return document.querySelector<HTMLElement>(selector);
  const container = button.closest<HTMLElement>("[data-scroll-container]");
  if (container) return container;
  const parent = button.parentElement;
  if (parent && parent !== document.body) {
    const sibling = parent.querySelector<HTMLElement>(":scope > [data-scroll-container]");
    if (sibling) return sibling;
  }
  for (let el = button.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (scrollsY(el)) return el;
  }
  return null;
}

/** How far, in px, the target is scrolled away from an edge. */
export function distanceFromEdge(target: ScrollTarget, edge: ScrollEdge): number {
  const el = target ?? pageScroller();
  const top = Math.max(0, el.scrollTop);
  return edge === "top" ? top : Math.max(0, el.scrollHeight - el.clientHeight - top);
}

/** Scrolls an element (or the page, for null) to its top or bottom edge. */
export function scrollToEdge(target: ScrollTarget, edge: ScrollEdge = "bottom", behavior?: ScrollBehavior) {
  const el = target ?? pageScroller();
  const options: ScrollToOptions = {
    top: edge === "top" ? 0 : el.scrollHeight,
    behavior: behavior ?? (reducedMotion() ? "instant" : "smooth"),
  };
  if (target) target.scrollTo(options);
  else window.scrollTo(options);
}

function setVisible(button: HTMLElement, visible: boolean, target: ScrollTarget) {
  const state = visible ? "visible" : "hidden";
  if (button.dataset.state === state) return;
  // Hiding the focused button would drop focus on <body>: hand it to the scroll container if
  // it takes focus (a scroll region should have tabindex="0"), else just let go.
  if (!visible && document.activeElement === button) {
    if (target && target.tabIndex >= 0) target.focus({ preventScroll: true });
    else button.blur();
  }
  button.dataset.state = state;
  button.toggleAttribute("inert", !visible);
}

export function initScrollButton(root: ParentNode = document) {
  queryAll(root, "[data-scroll-button]:not([data-init])").forEach((button) => {
    button.dataset.init = "";
    const edge: ScrollEdge = button.dataset.scrollButton === "top" ? "top" : "bottom";
    const target = scrollTargetOf(button);
    const threshold = () => {
      const n = Number.parseFloat(button.dataset.scrollThreshold ?? "");
      return Number.isFinite(n) ? n : DEFAULT_THRESHOLD;
    };
    const scroller: HTMLElement | Window = target ?? window;
    const content = target ?? document.body;

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!button.isConnected) return teardown();
      setVisible(button, distanceFromEdge(target, edge) > threshold(), target);
    };
    const schedule = () => {
      if (frame) return;
      if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(update);
      else update();
    };

    // Content that grows changes scrollHeight without a scroll event: watch the target's size,
    // its children's sizes, and children being added.
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
    const observeChildren = () => {
      if (!resize) return;
      resize.observe(content);
      for (const child of content.children) resize.observe(child);
    };
    observeChildren();
    const mutations = new MutationObserver(() => {
      observeChildren();
      schedule();
    });
    mutations.observe(content, { childList: true });

    const teardown = () => {
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize?.disconnect();
      mutations.disconnect();
    };
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    button.addEventListener("click", () => {
      const behavior = button.dataset.scrollBehavior;
      scrollToEdge(target, edge, behavior === "instant" || behavior === "auto" ? behavior : undefined);
    });

    update();
  });
}
