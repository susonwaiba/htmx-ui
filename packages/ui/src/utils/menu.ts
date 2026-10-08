// Shared behaviour for role="menu" panels: the dropdown's menu and the menubar's menus
// (and the submenus inside either). A component describes itself as a MenuHost and calls
// bindMenus(host) once; everything inside a [role="menu"] under host.root is then handled here:
// - ↓ ↑ Home End move between items (disabled and hidden ones are skipped), typing jumps to
//   the next item starting with the typed letters.
// - Enter / Space / click activate an item. A menuitemcheckbox toggles aria-checked; a
//   menuitemradio checks itself and unchecks the others in its [role="group"] (or menu).
//   Either fires a bubbling "menu:change" with detail { checked, name, value }. Items with a
//   `name` attribute keep a hidden <input> inside them in sync, so a form submits them.
//   Choosing an item closes the menu unless it (or an ancestor) has data-keep-open.
// - Submenus: an item with aria-haspopup="menu" and a sibling [role="menu"] (wrap both in a
//   .dropdown-sub). → / Enter / Space / click / hovering it opens the submenu; ← / Esc close
//   it again. A submenu that would leave the viewport flips (data-flip-x / data-flip-y).
// - Esc in a top-level menu, Tab, clicking outside or focus leaving host.root close it.
// Items are looked up on every event, so menus whose items change after an htmx swap work.

import { place } from "./position";
import { ensureId, isDisabled } from "./shared";

export { isDisabled };

export const ITEM = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';
const MENU = '[role="menu"]';
const OPEN_DELAY = 100;
const CLOSE_DELAY = 300;
const TYPEAHEAD_RESET = 500;

export interface MenuHost {
  /** Holds the trigger(s) and every menu; menu events are delegated to it. */
  root: HTMLElement;
  /** Whether one of the host's top-level menus is open. */
  isOpen(): boolean;
  /** Close the open top-level menu and its submenus; focus its trigger if `refocus`. */
  close(refocus: boolean): void;
  /** ← in a top-level menu (-1) or → on an item without a submenu (1). Returns true if handled. */
  sideways?(dir: 1 | -1, menu: HTMLElement): boolean;
}

/** Not hidden itself, nor inside a hidden element below `menu`. */
function isShown(el: HTMLElement, menu: HTMLElement) {
  for (let p: HTMLElement | null = el; p && p !== menu; p = p.parentElement) if (p.hidden) return false;
  return true;
}

/** The items of `menu` itself (not of its submenus): enabled ones, or all with `all`. */
export function menuItems(menu: HTMLElement, all = false): HTMLElement[] {
  return [...menu.querySelectorAll<HTMLElement>(ITEM)].filter(
    (el) => el.closest(MENU) === menu && isShown(el, menu) && (all || !isDisabled(el)),
  );
}

export function focusItem(menu: HTMLElement, which: "first" | "last") {
  const list = menuItems(menu);
  (which === "first" ? list[0] : list.at(-1))?.focus();
}

/** The menu an item opens (aria-controls, else a sibling [role="menu"]), if it has one. */
export function subMenuOf(item: Element): HTMLElement | null {
  const popup = item.getAttribute("aria-haspopup");
  if (popup !== "menu" && popup !== "true") return null;
  const id = item.getAttribute("aria-controls");
  const byId = id ? item.ownerDocument.getElementById(id) : null;
  return byId ?? item.parentElement?.querySelector<HTMLElement>(`:scope > ${MENU}`) ?? null;
}

/** The item that opened submenu `menu`, or null for a top-level menu. */
function parentTrigger(menu: HTMLElement): HTMLElement | null {
  if (!menu.parentElement?.closest(MENU)) return null;
  return menu.parentElement.querySelector<HTMLElement>(":scope > [aria-haspopup]");
}

/** Make a menu ready to show: focusable itself (for hover), items out of the tab order. */
export function prepareMenu(menu: HTMLElement, trigger?: HTMLElement) {
  if (!menu.hasAttribute("tabindex")) menu.tabIndex = -1;
  for (const item of menuItems(menu, true)) item.tabIndex = -1;
  if (trigger) {
    ensureId(menu, "menu");
    trigger.setAttribute("aria-controls", menu.id);
  }
}

export function openSub(trigger: HTMLElement, focus: boolean) {
  const sub = subMenuOf(trigger);
  const menu = trigger.closest<HTMLElement>(MENU);
  if (!sub || !menu) return;
  closeSubs(menu, trigger);
  if (sub.hidden) {
    prepareMenu(sub, trigger);
    sub.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    place(sub, trigger);
  }
  if (focus) focusItem(sub, "first");
}

export function closeSub(trigger: HTMLElement, refocus: boolean) {
  const sub = subMenuOf(trigger);
  if (!sub) return;
  closeSubs(sub);
  sub.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
  if (refocus) trigger.focus();
}

/** Close every open submenu of `menu` (except the one `except` opens), deepest first. */
export function closeSubs(menu: HTMLElement, except?: HTMLElement) {
  for (const item of menuItems(menu, true)) {
    if (item !== except && item.getAttribute("aria-expanded") === "true" && subMenuOf(item)) closeSub(item, false);
  }
}

const typed = new WeakMap<Element, { text: string; at: number }>();

/**
 * Typeahead: the next item in `list` whose text starts with what was typed in the last half
 * second. Repeating one letter cycles through the items starting with it.
 */
export function typeahead(scope: Element, list: HTMLElement[], key: string, current: Element | null) {
  const now = Date.now();
  const prev = typed.get(scope);
  const text = (prev && now - prev.at < TYPEAHEAD_RESET ? prev.text : "") + key.toLowerCase();
  typed.set(scope, { text, at: now });
  const same = [...text].every((c) => c === text[0]);
  const search = same ? text[0]! : text;
  const at = list.indexOf(current as HTMLElement);
  const from = same ? at + 1 : Math.max(at, 0);
  const label = (el: HTMLElement) => (el.dataset.label ?? el.textContent ?? "").trim().toLowerCase();
  for (let n = 0; n < list.length; n++) {
    const el = list[(from + n) % list.length]!;
    if (label(el).startsWith(search)) return el;
  }
  return undefined;
}

/** Mirror a named checkbox/radio item into a hidden input inside it (disabled when unchecked). */
export function syncField(item: HTMLElement) {
  const name = item.getAttribute("name");
  if (!name) return;
  let input = item.querySelector<HTMLInputElement>(":scope > input[data-menu-field]");
  if (!input) {
    input = item.ownerDocument.createElement("input");
    input.type = "hidden";
    input.dataset.menuField = "";
    item.append(input);
  }
  input.name = name;
  input.value = item.getAttribute("value") ?? "on";
  input.disabled = item.getAttribute("aria-checked") !== "true";
  const form = item.getAttribute("form");
  if (form) input.setAttribute("form", form);
}

const CHECKABLE = '[role="menuitemcheckbox"], [role="menuitemradio"]';
const GROUP = `[role="group"], ${MENU}`;

/** Toggle a checkbox item or check a radio item. Returns whether anything changed. */
export function check(item: HTMLElement): boolean {
  const role = item.getAttribute("role");
  const set = (el: HTMLElement, on: boolean) => {
    el.setAttribute("aria-checked", String(on));
    syncField(el);
  };
  if (role === "menuitemcheckbox") {
    set(item, item.getAttribute("aria-checked") !== "true");
  } else if (role === "menuitemradio") {
    if (item.getAttribute("aria-checked") === "true") return false;
    const group = item.parentElement?.closest(GROUP);
    const radios = group ? [...group.querySelectorAll<HTMLElement>('[role="menuitemradio"]')] : [item];
    for (const radio of radios) if (radio.parentElement?.closest(GROUP) === group) set(radio, radio === item);
  } else {
    return false;
  }
  const detail = {
    checked: item.getAttribute("aria-checked") === "true",
    name: item.getAttribute("name"),
    value: item.getAttribute("value"),
  };
  item.dispatchEvent(new CustomEvent("menu:change", { bubbles: true, detail }));
  return true;
}

// Open hosts, closed by a click outside them. One document listener for all of them.
const open = new Set<MenuHost>();
let listening = false;

/** Call when a host opens a menu: closes other open menus and arms the outside-click listener. */
export function menuOpened(host: MenuHost) {
  for (const other of [...open]) if (other !== host) other.close(false);
  open.add(host);
  if (listening) return;
  listening = true;
  document.addEventListener("pointerdown", (e) => {
    for (const h of [...open]) {
      if (!h.root.isConnected || !h.isOpen()) open.delete(h);
      else if (!h.root.contains(e.target as Node)) h.close(false);
    }
  });
}

export function menuClosed(host: MenuHost) {
  open.delete(host);
}

/** Wire up every menu under host.root. Call once per host. */
export function bindMenus(host: MenuHost) {
  const { root } = host;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let keyboard = false;
  // Hover delays; dropped if the menu closed meanwhile.
  const later = (menu: HTMLElement, fn: () => void, ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => host.isOpen() && isShown(menu, root) && fn(), ms);
  };
  const menuOf = (el: EventTarget | null) => {
    const menu = el instanceof Element ? el.closest<HTMLElement>(MENU) : null;
    return menu && root.contains(menu) ? menu : null;
  };

  for (const item of root.querySelectorAll<HTMLElement>(CHECKABLE)) {
    if (!item.hasAttribute("aria-checked")) item.setAttribute("aria-checked", "false");
    syncField(item);
  }

  root.addEventListener("keydown", (e) => {
    // Focus decides where we are (the event may come from the menu element itself).
    const active = root.ownerDocument.activeElement;
    const at = menuOf(e.target) && menuOf(active) ? active! : e.target;
    const menu = menuOf(at);
    if (!menu) return;
    const found = (at as Element).closest<HTMLElement>(ITEM);
    const item = found && found.closest(MENU) === menu ? found : null;
    const list = menuItems(menu);
    const i = item ? list.indexOf(item) : -1;
    const step = { ArrowDown: i + 1, ArrowUp: i < 0 ? -1 : i - 1, Home: 0, End: list.length - 1 }[e.key];
    const parent = parentTrigger(menu);

    if (step !== undefined) {
      e.preventDefault();
      list[(step + list.length) % list.length]?.focus();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const dir = e.key === "ArrowRight" ? 1 : -1;
      if (dir === 1 && item && subMenuOf(item)) openSub(item, true);
      else if (dir === -1 && parent) closeSub(parent, true);
      else if (!host.sideways?.(dir, menu)) return;
      e.preventDefault();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (parent) closeSub(parent, true);
      else host.close(true);
    } else if (e.key === "Enter" || e.key === " ") {
      if (!item) return;
      e.preventDefault();
      keyboard = true;
      item.click();
      keyboard = false;
    } else if (e.key === "Tab") {
      // Close and put focus back on the trigger, so Tab moves on from there.
      host.close(true);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      typeahead(menu, list, e.key, item)?.focus();
    }
  });
  // Space on a button clicks on keyup; keydown already handled it.
  root.addEventListener("keyup", (e) => {
    if (e.key === " " && menuOf(e.target)) e.preventDefault();
  });

  root.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>(ITEM);
    if (!item || !menuOf(item)) return;
    if (isDisabled(item)) {
      e.preventDefault();
      return;
    }
    if (subMenuOf(item)) {
      openSub(item, keyboard);
      return;
    }
    check(item);
    if (item.closest("[data-keep-open]")) return;
    const active = item.ownerDocument.activeElement;
    host.close(!active || active === item.ownerDocument.body || root.contains(active));
  });

  // Hover highlights (focuses) items and opens submenus after a short delay. Moving onto
  // another item of the same menu closes its open submenu after a longer one, so the pointer
  // can cross other items on its way into the submenu.
  root.addEventListener("pointerover", (e) => {
    const menu = menuOf(e.target);
    if (!menu || menu.hidden) return;
    clearTimeout(timer);
    const found = (e.target as Element).closest<HTMLElement>(ITEM);
    const item = found && found.closest(MENU) === menu && !isDisabled(found) ? found : null;
    const active = menu.ownerDocument.activeElement;
    if (item && active !== item) item.focus({ preventScroll: true });
    else if (!item && active?.closest(MENU) === menu && active !== menu) menu.focus({ preventScroll: true });

    const expanded = menuItems(menu, true).find((el) => el.getAttribute("aria-expanded") === "true" && subMenuOf(el));
    if (item && subMenuOf(item)) {
      if (item !== expanded) later(menu, () => openSub(item, false), OPEN_DELAY);
    } else if (expanded) {
      later(menu, () => closeSub(expanded, false), CLOSE_DELAY);
    }
  });
  // Leaving the menus altogether drops the highlight (an open submenu's trigger keeps its own).
  root.addEventListener("pointerout", (e) => {
    if (menuOf(e.relatedTarget)) return;
    const from = (e.target as Element).closest<HTMLElement>(ITEM);
    const menu = menuOf(from);
    if (menu && from && from === menu.ownerDocument.activeElement && from.getAttribute("aria-expanded") !== "true") {
      menu.focus({ preventScroll: true });
    }
  });

  root.addEventListener("focusout", (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !root.contains(next) && host.isOpen()) host.close(false);
  });
}
