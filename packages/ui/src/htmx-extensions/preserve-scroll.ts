// preserve-scroll: an htmx 4 extension that keeps the scroll position of marked containers
// across swaps, including the boosted page navigations that replace the whole body.
//   <nav class="overflow-auto" hx-preserve-scroll="docs-nav">…</nav>
//   import { registerPreserveScroll } from "htmx-ui";   registerPreserveScroll();
//
// - Mark any number of scroll containers with hx-preserve-scroll="<key>" (or an id and an
//   empty attribute: the id is the key). Before every swap the positions of all marked
//   elements are recorded; when an element with the same key arrives in new content it is
//   scrolled to the recorded position, before it is painted.
// - A key may repeat: elements sharing one key are matched in document order (the 1st with
//   the 1st, and so on), so a list of horizontally scrolling rows can share
//   hx-preserve-scroll="row".
// - Elements the swap didn't replace are left alone, so a container scrolled during the
//   request keeps the reader's position. Morph swaps keep the element and its scroll.
// - Positions live only for the swap; nothing is stored. hx-preserve-scroll="false" opts an
//   element out (e.g. inside a fragment that should start at the top).
// For a sidebar that should also show its current page, see sidebar-active-scroll.
import { type Htmx, resolveHtmx, restore, type Snapshot, snapshot, swapHooks } from "./scroll-snapshot";

const ATTR = "hx-preserve-scroll";
export const PRESERVE_SCROLL_SELECTOR = `[${ATTR}]`;

/** Record the scroll position of every [hx-preserve-scroll] element under `root`. */
export function snapshotScroll(root: ParentNode = document): Snapshot {
  return snapshot(root, ATTR);
}

/**
 * Scroll [hx-preserve-scroll] elements under `root` to their positions in `saved`. Elements
 * that are the same node as when the snapshot was taken are skipped. Returns the elements it
 * scrolled.
 */
export function restoreScroll(saved: Snapshot, root: ParentNode = document): Element[] {
  return restore(saved, root, ATTR);
}

export const preserveScrollExtension = swapHooks(ATTR);

/**
 * Register the preserve-scroll extension with htmx (window.htmx by default). Safe to call
 * more than once: htmx ignores a second registration. If you set htmx.config.extensions,
 * include "preserve-scroll" in it.
 */
export function registerPreserveScroll(htmx?: Htmx) {
  resolveHtmx(htmx, "registerPreserveScroll").registerExtension("preserve-scroll", preserveScrollExtension);
}
