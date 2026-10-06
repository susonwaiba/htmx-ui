// Navigation menu: the WAI-ARIA disclosure navigation pattern (buttons with aria-expanded that show
// panels of links; no menu roles). Markup: see navigation-menu.css.
// - Each .navigation-menu-trigger controls the .navigation-menu-content after it: aria-controls and
//   aria-expanded are kept in sync, and CSS shows the panel of an expanded trigger. One panel at a time.
// - Click toggles. A mouse resting on a trigger opens its panel after --navigation-menu-open-delay
//   (200ms); once one is open, moving onto another trigger switches at once. A panel opened by hover
//   closes --navigation-menu-close-delay (300ms) after the pointer leaves its item; clicking the trigger
//   of a hover-opened panel keeps it open instead of closing it.
// - Escape closes the open panel (and returns focus to its trigger if focus was in the menu); so do a
//   click outside, focus leaving the menu or moving to another top-level item, and following a link
//   in the panel.
// - Keys on the top level: ←/→ move between triggers and links, Home/End go to the first/last, ↓ on a
//   trigger opens its panel on the first link. In a panel ↓/↑ move between its links (↑ from the
//   first goes back to the trigger). A vertical menu (.navigation-menu-vertical) uses ↓/↑ for all of
//   this, through the top level and every open panel, and doesn't open on hover.
// - The panel fires bubbling "navigation-menu:open" / "navigation-menu:close" events, so htmx can load
//   it on first open: hx-trigger="navigation-menu:open once".
import { queryAll } from "../../utils/dom";

const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex='-1'])";

type Menu = { nav: HTMLElement; close: (refocus: boolean) => void };
const openMenus = new Set<Menu>();
let listening = false;
let ids = 0;

/** A CSS time ("200ms", "0.3s") from a custom property, or the fallback in ms. */
function delay(el: Element, name: string, fallback: number) {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(value);
  if (!value || Number.isNaN(n)) return fallback;
  return value.endsWith("ms") ? n : value.endsWith("s") ? n * 1000 : n;
}

function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !openMenus.size) return;
    for (const menu of [...openMenus]) menu.close(menu.nav.contains(document.activeElement));
  });
  document.addEventListener("pointerdown", (e) => {
    for (const menu of [...openMenus]) if (!menu.nav.contains(e.target as Node)) menu.close(false);
  });
}

export function initNavigationMenu(root: ParentNode = document) {
  listen();

  queryAll(root, "[data-navigation-menu]:not([data-init])").forEach((nav) => {
    nav.dataset.init = "";
    const list = nav.querySelector<HTMLElement>(".navigation-menu-list") ?? nav.querySelector<HTMLElement>("ul");
    if (!list) return;

    const vertical = () => nav.classList.contains("navigation-menu-vertical");
    const items = () => [...list.children].filter((el): el is HTMLElement => el instanceof HTMLElement);
    const triggerOf = (item: HTMLElement) => item.querySelector<HTMLElement>(":scope > .navigation-menu-trigger");
    const panelOf = (item: HTMLElement) => item.querySelector<HTMLElement>(":scope > .navigation-menu-content");
    // The top-level control of an item: its trigger, or its link.
    const controlOf = (item: HTMLElement) =>
      triggerOf(item) ?? item.querySelector<HTMLElement>(`:scope > :is(${FOCUSABLE})`);
    const controls = () => items().map(controlOf).filter((el): el is HTMLElement => !!el);
    const linksIn = (panel: HTMLElement) => [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];

    for (const item of items()) {
      const trigger = triggerOf(item);
      const panel = panelOf(item);
      if (!trigger || !panel) continue;
      panel.id ||= `navigation-menu-${++ids}`;
      trigger.setAttribute("aria-controls", panel.id);
      trigger.setAttribute("aria-expanded", "false");
      if (trigger instanceof HTMLButtonElement && !trigger.hasAttribute("type")) trigger.type = "button";
    }

    let current: HTMLElement | null = null; // the open item
    let openedBy: "hover" | "click" = "click";
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const menu: Menu = { nav, close: (refocus) => close(refocus) };
    const clear = () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };

    function open(item: HTMLElement, by: "hover" | "click") {
      clear();
      openedBy = by;
      if (current === item) return;
      if (current) close(false);
      const trigger = triggerOf(item);
      const panel = panelOf(item);
      if (!trigger || !panel) return;
      current = item;
      trigger.setAttribute("aria-expanded", "true");
      openMenus.add(menu);
      panel.dispatchEvent(new CustomEvent("navigation-menu:open", { bubbles: true }));
    }
    function close(refocus: boolean) {
      clear();
      const item = current;
      if (!item) return;
      current = null;
      openMenus.delete(menu);
      const trigger = triggerOf(item);
      trigger?.setAttribute("aria-expanded", "false");
      if (refocus) trigger?.focus();
      panelOf(item)?.dispatchEvent(new CustomEvent("navigation-menu:close", { bubbles: true }));
    }

    // Pointer: hover opens after a delay, switches at once while one is open, closes after leaving.
    list.addEventListener("pointerover", (e) => {
      if (e.pointerType === "touch" || vertical()) return;
      const item = items().find((i) => i.contains(e.target as Node));
      if (!item) return;
      if (item === current) {
        clearTimeout(closeTimer);
        return;
      }
      if (!triggerOf(item)) {
        clearTimeout(openTimer); // a plain link: a pending close carries on
        return;
      }
      if (!triggerOf(item)!.contains(e.target as Node)) return; // only the trigger opens, not its gap
      clearTimeout(openTimer);
      if (current) open(item, "hover");
      else openTimer = setTimeout(() => open(item, "hover"), delay(nav, "--navigation-menu-open-delay", 200));
    });
    list.addEventListener("pointerout", (e) => {
      if (e.pointerType === "touch" || vertical()) return;
      const to = e.relatedTarget as Node | null;
      const from = items().find((i) => i.contains(e.target as Node));
      if (!from || (to && from.contains(to))) return; // still inside the same item
      clearTimeout(openTimer);
      if (from === current && openedBy === "hover") {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => close(false), delay(nav, "--navigation-menu-close-delay", 300));
      }
    });

    nav.addEventListener("click", (e) => {
      const target = e.target as Element;
      const item = items().find((i) => triggerOf(i)?.contains(target));
      if (item) {
        if (current === item && openedBy === "hover") openedBy = "click";
        else if (current === item) close(false);
        else open(item, "click");
        return;
      }
      // Following a link in a panel (with hx-boost the page may not reload)
      if (current && target.closest("a[href]") && panelOf(current)?.contains(target)) close(false);
    });

    // Focus moving out of the menu, or to another top-level item, closes the open panel.
    nav.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && !nav.contains(next)) close(false);
    });
    nav.addEventListener("focusin", (e) => {
      if (current && !current.contains(e.target as Node)) close(false);
    });

    nav.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      const item = items().find((i) => i.contains(active));
      if (!item) return;
      const top = controls();
      const panel = panelOf(item);
      const inPanel = !!panel && panel.contains(active);
      const focus = (el: HTMLElement | undefined) => {
        if (!el) return;
        e.preventDefault();
        el.focus();
      };

      if (e.key === "Escape") {
        if (current) {
          e.preventDefault();
          e.stopPropagation();
          close(true);
        }
        return;
      }

      if (vertical()) {
        // One list: top-level controls, and the links of an open panel under its trigger.
        const all = items().flatMap((i) => {
          const c = controlOf(i);
          const p = panelOf(i);
          return [...(c ? [c] : []), ...(i === current && p ? linksIn(p) : [])];
        });
        const i = all.indexOf(active);
        const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key];
        if (next !== undefined && i !== -1) focus(all[(next + all.length) % all.length]);
        return;
      }

      if (inPanel) {
        const links = linksIn(panel!);
        const i = links.indexOf(active);
        if (e.key === "ArrowDown") focus(links[(i + 1) % links.length]);
        else if (e.key === "ArrowUp") focus(i <= 0 ? (triggerOf(item) ?? undefined) : links[i - 1]);
        else if (e.key === "Home") focus(links[0]);
        else if (e.key === "End") focus(links.at(-1));
        return;
      }

      const i = top.indexOf(active);
      if (i === -1) return;
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: top.length - 1 }[e.key];
      if (next !== undefined) {
        focus(top[(next + top.length) % top.length]);
      } else if (e.key === "ArrowDown" && panel && triggerOf(item) === active) {
        e.preventDefault();
        open(item, "click");
        linksIn(panel)[0]?.focus();
      }
    });
  });
}
