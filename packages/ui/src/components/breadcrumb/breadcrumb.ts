// Breadcrumb that collapses when it doesn't fit. Markup: see breadcrumb.css, plus
// data-breadcrumb on the <nav> and, after the first item, a hidden ellipsis item:
//   <li class="breadcrumb-item" data-breadcrumb-ellipsis hidden>
//     <div class="dropdown" data-dropdown>
//       <button class="breadcrumb-ellipsis" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Show hidden pages">…</button>
//       <div class="dropdown-menu" role="menu" hidden></div>
//     </div>
//   </li>
//   <li class="breadcrumb-separator" aria-hidden="true" hidden>…</li>
// Whenever the <nav> changes width, the middle items are hidden from the left, one at a time
// (each with the separator after it), until the list fits on one line. The first item and the
// current page always stay. The ellipsis shows when anything is hidden, and its menu lists the
// hidden pages as links.
import { queryAll } from "../../utils/dom";

const isSeparator = (el: Element | null) => !!el?.matches(".breadcrumb-separator");

function setShown(item: HTMLElement, shown: boolean) {
  item.hidden = !shown;
  const sep = item.nextElementSibling as HTMLElement | null;
  if (isSeparator(sep)) sep!.hidden = !shown;
}

function menuItem(item: Element): HTMLElement {
  const link = item.querySelector<HTMLAnchorElement>("a[href]");
  const entry = document.createElement(link ? "a" : "span");
  entry.className = "dropdown-item";
  entry.setAttribute("role", "menuitem");
  if (link) (entry as HTMLAnchorElement).href = link.getAttribute("href")!;
  else entry.setAttribute("aria-disabled", "true");
  entry.textContent = (link ?? item).textContent!.trim();
  return entry;
}

export function collapseBreadcrumb(nav: HTMLElement) {
  const list = nav.querySelector<HTMLElement>(".breadcrumb");
  const ellipsis = nav.querySelector<HTMLElement>("[data-breadcrumb-ellipsis]");
  if (!list || !ellipsis) return;
  const items = [...list.children].filter(
    (el): el is HTMLElement => el.matches(".breadcrumb-item") && el !== ellipsis,
  );
  const middle = items.slice(1, -1);

  nav.toggleAttribute("data-measuring", true);
  middle.forEach((item) => setShown(item, true));
  setShown(ellipsis, false);
  const hidden: HTMLElement[] = [];
  for (const item of middle) {
    if (list.scrollWidth <= list.clientWidth) break;
    if (!hidden.length) setShown(ellipsis, true);
    setShown(item, false);
    hidden.push(item);
  }
  nav.removeAttribute("data-measuring");

  ellipsis.querySelector('[role="menu"]')?.replaceChildren(...hidden.map(menuItem));
}

export function initBreadcrumb(root: ParentNode) {
  queryAll(root, "[data-breadcrumb]:not([data-init])").forEach((nav) => {
    nav.dataset.init = "";
    collapseBreadcrumb(nav);
    if (typeof ResizeObserver === "undefined") return;
    // Collapsing changes what's inside the nav, which must not re-trigger the observer in the
    // same frame ("ResizeObserver loop completed with undelivered notifications"): react to
    // width changes only, a frame later.
    let width = nav.clientWidth;
    let frame = 0;
    new ResizeObserver(() => {
      if (nav.clientWidth === width) return;
      width = nav.clientWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => collapseBreadcrumb(nav));
    }).observe(nav);
  });
}
