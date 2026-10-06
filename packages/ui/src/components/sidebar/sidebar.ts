// Sidebar. Markup, options and states: see sidebar.css.
// - [data-sidebar-trigger] (aria-controls = the sidebar's id; without it, the sidebar of the
//   trigger's .sidebar-layout) and [data-sidebar-rail] toggle it. On desktop that flips
//   data-state between "expanded" and "collapsed" (nothing for data-collapsible="none"); in
//   mobile mode it opens or closes the off-canvas panel (data-open). Triggers' aria-expanded
//   follows whichever applies.
// - [data-sidebar-close] closes the mobile panel (or collapses the sidebar on desktop).
// - Ctrl/⌘+B toggles; data-shortcut="k" picks another letter, data-shortcut="none" turns it
//   off. Ignored while typing in a field.
// - data-cookie="name" remembers the desktop state in that cookie ("true" = expanded), so a
//   server can render it, and restores it on load.
// - Mobile mode is decided by CSS (--sidebar-mobile: 1 below the breakpoint), so the
//   behaviour always agrees with the styles; data-mobile mirrors it for CSS.
// - The open mobile panel: focus moves into it and is kept there, the rest of the layout is
//   inert, and Escape, a click on the backdrop or following a link closes it (focus goes back
//   to the trigger for Escape and the backdrop).
// - Every change fires a bubbling "sidebar:toggle" with detail { expanded, open, mobile }.
import { queryAll } from "../../utils/dom";

export type SidebarDetail = { expanded: boolean; open: boolean; mobile: boolean };

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
let ids = 0;
let listening = false;
let resizeQueued = false;
const openers = new WeakMap<HTMLElement, HTMLElement | null>();

const sidebars = () => queryAll(document, "[data-sidebar][data-init]");
const isExpanded = (s: HTMLElement) => s.dataset.state !== "collapsed";
const isOpen = (s: HTMLElement) => s.hasAttribute("data-open");
const off = (v: string | undefined) => v === "none" || v === "false";

function isMobile(s: HTMLElement) {
  return getComputedStyle(s).getPropertyValue("--sidebar-mobile").trim() === "1";
}

/** The sidebar a trigger, rail or close button acts on. */
function targetOf(el: HTMLElement): HTMLElement | null {
  const id = el.getAttribute("aria-controls");
  if (id) return document.getElementById(id);
  return (
    el.closest<HTMLElement>("[data-sidebar]") ??
    el.closest(".sidebar-layout, [data-sidebar-layout]")?.querySelector<HTMLElement>("[data-sidebar]") ??
    null
  );
}

function cookieName(s: HTMLElement) {
  const name = s.dataset.cookie;
  return name && !off(name) ? name : null;
}

function readCookie(name: string) {
  for (const part of document.cookie.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

/** Turn transitions off for a frame, so a restored state doesn't animate in. */
function instant(s: HTMLElement) {
  s.setAttribute("data-instant", "");
  const clear = () => s.removeAttribute("data-instant");
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => requestAnimationFrame(clear));
  else setTimeout(clear, 0);
}

/** Bring data-mobile and every trigger's aria-expanded in line with the sidebar. */
function sync(s: HTMLElement) {
  const mobile = isMobile(s);
  s.toggleAttribute("data-mobile", mobile);
  if (!mobile && isOpen(s)) close(s, false, false);
  const expanded = mobile ? isOpen(s) : s.dataset.collapsible === "none" || isExpanded(s);
  for (const t of queryAll(document, "[data-sidebar-trigger]")) {
    if (targetOf(t) === s) t.setAttribute("aria-expanded", String(expanded));
  }
  return mobile;
}

function emit(s: HTMLElement) {
  const detail: SidebarDetail = { expanded: isExpanded(s), open: isOpen(s), mobile: s.hasAttribute("data-mobile") };
  s.dispatchEvent(new CustomEvent("sidebar:toggle", { bubbles: true, detail }));
}

/** Expand or collapse the sidebar (its desktop state), remembering it in the cookie if it has one. */
export function setSidebarExpanded(s: HTMLElement, expanded: boolean) {
  if (isExpanded(s) === expanded && s.dataset.state) return;
  s.dataset.state = expanded ? "expanded" : "collapsed";
  const name = cookieName(s);
  if (name) document.cookie = `${name}=${expanded}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  sync(s);
  emit(s);
}

function open(s: HTMLElement, from: HTMLElement | null) {
  if (isOpen(s)) return;
  openers.set(s, from ?? (document.activeElement as HTMLElement | null));
  s.setAttribute("data-open", "");
  for (const el of s.parentElement?.children ?? []) {
    if (el !== s && !el.hasAttribute("inert")) {
      el.setAttribute("inert", "");
      el.setAttribute("data-sidebar-inert", "");
    }
  }
  sync(s);
  const current = s.querySelector<HTMLElement>('[aria-current="page"]');
  (current ?? focusables(s)[0] ?? s).focus();
  emit(s);
}

function close(s: HTMLElement, refocus: boolean, notify = true) {
  if (!isOpen(s)) return;
  s.removeAttribute("data-open");
  for (const el of s.parentElement?.querySelectorAll(":scope > [data-sidebar-inert]") ?? []) {
    el.removeAttribute("inert");
    el.removeAttribute("data-sidebar-inert");
  }
  if (notify) sync(s);
  if (refocus) {
    const back = openers.get(s);
    const trigger = queryAll(document, "[data-sidebar-trigger]").find((t) => targetOf(t) === s);
    (back?.isConnected ? back : trigger)?.focus();
  }
  openers.delete(s);
  if (notify) emit(s);
}

/** Toggle the sidebar: the mobile panel in mobile mode, else the desktop state. Returns false
 *  when there is nothing to toggle (data-collapsible="none" on desktop). */
export function toggleSidebar(s: HTMLElement, from: HTMLElement | null = null): boolean {
  if (sync(s)) {
    if (isOpen(s)) close(s, true);
    else open(s, from);
    return true;
  }
  if (s.dataset.collapsible === "none") return false;
  setSidebarExpanded(s, !isExpanded(s));
  return true;
}

function focusables(s: HTMLElement) {
  return [...s.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.closest("[hidden], [inert], .sidebar-rail, details:not([open]) > :not(summary)"),
  );
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

function listen() {
  if (listening) return;
  listening = true;

  document.addEventListener("keydown", (e) => {
    const openSidebar = sidebars().find(isOpen);
    if (e.key === "Escape" && !e.defaultPrevented) {
      if (openSidebar) {
        e.preventDefault();
        close(openSidebar, true);
        return;
      }
      // Hide an icon-mode tooltip without moving the pointer or focus (WCAG 1.4.13).
      for (const item of queryAll(document, "[data-sidebar] .sidebar-menu-item.tooltip")) {
        if (item.matches(":hover") || item.contains(document.activeElement)) item.dataset.dismissed = "";
      }
      return;
    }
    if (e.key === "Tab" && openSidebar) {
      // Keep focus inside the open panel.
      const list = focusables(openSidebar);
      const first = list[0];
      const last = list.at(-1);
      const active = document.activeElement as HTMLElement | null;
      if (!first || !last) return;
      if (e.shiftKey && (active === first || !openSidebar.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !openSidebar.contains(active))) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || isTyping(e.target)) return;
    let handled = false;
    for (const s of sidebars()) {
      const key = s.dataset.shortcut ?? "b";
      if (off(key) || e.key.toLowerCase() !== key.toLowerCase()) continue;
      if (toggleSidebar(s)) handled = true;
    }
    if (handled) e.preventDefault();
  });

  // The backdrop is the layout's ::after, so a click on it lands on the layout itself.
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    for (const s of sidebars()) {
      if (isOpen(s) && target === s.parentElement) close(s, true);
    }
  });

  // A dismissed tooltip comes back once the pointer or focus moves elsewhere.
  const undismiss = (e: Event) => {
    for (const item of queryAll(document, "[data-sidebar] .sidebar-menu-item[data-dismissed]")) {
      if (!item.contains(e.target as Node)) delete item.dataset.dismissed;
    }
  };
  document.addEventListener("pointerover", undismiss);
  document.addEventListener("focusin", undismiss);

  // Crossing the breakpoint switches between the panel and the column.
  window.addEventListener("resize", () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      for (const s of sidebars()) sync(s);
    });
  });
}

export function initSidebar(root: ParentNode = document) {
  listen();

  queryAll(root, "[data-sidebar]:not([data-init])").forEach((s) => {
    s.dataset.init = "";
    s.id ||= `sidebar-${++ids}`;
    if (s.dataset.state !== "collapsed") s.dataset.state = "expanded";
    const name = cookieName(s);
    const saved = name ? readCookie(name) : null;
    if ((saved === "true" || saved === "false") && String(isExpanded(s)) !== saved) {
      instant(s);
      s.dataset.state = saved === "true" ? "expanded" : "collapsed";
    }
    // Following a link closes the mobile panel.
    s.addEventListener("click", (e) => {
      if (isOpen(s) && (e.target as Element).closest("a[href]")) close(s, false);
    });
    sync(s);
  });

  queryAll(root, "[data-sidebar-trigger]:not([data-init])").forEach((trigger) => {
    trigger.dataset.init = "";
    const s = targetOf(trigger);
    if (s) {
      if (!trigger.hasAttribute("aria-controls")) trigger.setAttribute("aria-controls", s.id);
      if (s.hasAttribute("data-init")) sync(s);
    }
    trigger.addEventListener("click", () => {
      const target = targetOf(trigger);
      if (target) toggleSidebar(target, trigger);
    });
  });

  queryAll(root, "[data-sidebar-rail]:not([data-init])").forEach((rail) => {
    rail.dataset.init = "";
    rail.addEventListener("click", () => {
      const target = targetOf(rail);
      if (target) toggleSidebar(target, rail);
    });
  });

  queryAll(root, "[data-sidebar-close]:not([data-init])").forEach((button) => {
    button.dataset.init = "";
    button.addEventListener("click", () => {
      const target = targetOf(button);
      if (!target) return;
      if (isOpen(target)) close(target, true);
      else if (!sync(target) && target.dataset.collapsible !== "none") setSidebarExpanded(target, false);
    });
  });
}
