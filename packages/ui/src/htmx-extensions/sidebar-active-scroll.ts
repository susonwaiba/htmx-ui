// sidebar-active-scroll: an htmx 4 extension for navigation sidebars. It keeps the sidebar's
// scroll position across swaps (as preserve-scroll does) and makes sure the current page's
// link is in view, including on a fresh page load (a link opened in a new tab, a reload).
//   <nav class="sidebar-content" hx-sidebar-active-scroll="docs-nav">… <a aria-current="page"> …</nav>
//   import { registerSidebarActiveScroll } from "htmx-ui";   registerSidebarActiveScroll();
//
// - Put hx-sidebar-active-scroll on the element that scrolls. The value is the key that
//   matches it across swaps (empty: its id), with the same rules as hx-preserve-scroll.
// - The active item is the first [aria-current="page"] or [data-active] (not "false") inside;
//   hx-sidebar-active-item="<selector>" picks another.
// - Page load, or a sidebar new to the page: the active item is centred.
// - After a swap: the old position comes back, then if the active item is out of view (a
//   link elsewhere on the page led to a page far down the list) the sidebar scrolls just
//   enough to show it, with a neighbour's height to spare. A sidebar the swap didn't replace
//   is left alone.
// - A sidebar with no height yet (an off-canvas panel that is display: none) is centred the
//   first time it gets one.
// Only the sidebar scrolls; the page never does (no scrollIntoView).
import { queryAll } from "../utils/dom";
import { type Htmx, keyOf, resolveHtmx, type Snapshot, survived, swapHooks } from "./scroll-snapshot";

const ATTR = "hx-sidebar-active-scroll";
export const SIDEBAR_ACTIVE_SCROLL_SELECTOR = `[${ATTR}]:not([${ATTR}="false"])`;
export const SIDEBAR_ACTIVE_ITEM_SELECTOR = '[aria-current="page"], [data-active]:not([data-active="false"])';

export type RevealMode = "center" | "nearest";

const waiting = new WeakSet<Element>();
const sizeObserver =
  typeof ResizeObserver === "undefined"
    ? null
    : new ResizeObserver((entries) => {
        for (const { target } of entries) {
          if (!target.isConnected) {
            sizeObserver!.unobserve(target);
            waiting.delete(target);
          } else if (target.clientHeight > 0) {
            sizeObserver!.unobserve(target);
            waiting.delete(target);
            revealActive(target, "center");
          }
        }
      });

/** The active item inside a sidebar scroll container, if any. */
export function activeItem(container: Element): Element | null {
  const selector = container.getAttribute("hx-sidebar-active-item")?.trim() || SIDEBAR_ACTIVE_ITEM_SELECTOR;
  return container.querySelector(selector);
}

/**
 * Scroll `container` (only) so its active item is in view: "center" puts it in the middle,
 * "nearest" moves only if it is out of view, keeping a neighbour's height around it. Returns
 * whether it scrolled. A container with no height yet is handled once it gets one.
 */
export function revealActive(container: Element, mode: RevealMode = "nearest"): boolean {
  const item = activeItem(container);
  if (!item) return false;
  const height = container.clientHeight;
  if (height === 0) {
    if (sizeObserver && !waiting.has(container)) {
      waiting.add(container);
      sizeObserver.observe(container);
    }
    return false;
  }
  const box = container.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  // The item's top relative to the container's visible top (inside its border)
  const top = rect.top - box.top - container.clientTop;
  let delta = 0;
  if (mode === "center") {
    delta = top - (height - rect.height) / 2;
  } else {
    const margin = Math.min(rect.height, height / 4);
    if (top < margin) delta = top - margin;
    else if (top + rect.height > height - margin) delta = top + rect.height - height + margin;
  }
  if (Math.abs(delta) < 1) return false;
  const before = container.scrollTop;
  container.scrollTop = before + delta;
  return container.scrollTop !== before;
}

/** Reveal the active item of every sidebar container under `root` (itself included). */
export function revealAllActive(root: ParentNode = document, mode: RevealMode = "nearest") {
  for (const container of queryAll(root, SIDEBAR_ACTIVE_SCROLL_SELECTOR)) revealActive(container, mode);
}

function afterSwap(saved: Snapshot) {
  for (const container of queryAll(document, SIDEBAR_ACTIVE_SCROLL_SELECTOR)) {
    if (survived(saved, container)) continue;
    const key = keyOf(container, ATTR);
    revealActive(container, key && saved.has(key) ? "nearest" : "center");
  }
}

export const sidebarActiveScrollExtension = swapHooks(ATTR, afterSwap);

// On page load: centre now (the DOM is parsed and stylesheets are in), and once more at
// window load in case web fonts or images moved the item, unless the reader has scrolled.
function onPageLoad() {
  const containers = queryAll(document, SIDEBAR_ACTIVE_SCROLL_SELECTOR);
  for (const container of containers) revealActive(container, "center");
  if (document.readyState === "complete") return;
  const positions = new Map(containers.map((el) => [el, el.scrollTop]));
  window.addEventListener(
    "load",
    () => {
      for (const [el, top] of positions) if (el.isConnected && el.scrollTop === top) revealActive(el, "center");
    },
    { once: true },
  );
}

let registered = false;

/**
 * Register the sidebar-active-scroll extension with htmx (window.htmx by default) and centre
 * the active item of sidebars already on the page. Safe to call more than once. If you set
 * htmx.config.extensions, include "sidebar-active-scroll" in it.
 */
export function registerSidebarActiveScroll(htmx?: Htmx) {
  resolveHtmx(htmx, "registerSidebarActiveScroll").registerExtension("sidebar-active-scroll", sidebarActiveScrollExtension);
  if (registered) return;
  registered = true;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onPageLoad, { once: true });
  else onPageLoad();
}
