// Menubar: a row (or column) of menus, as in desktop applications. Markup: see menubar.css.
// Follows the WAI-ARIA menubar pattern:
// - Roving tabindex: only one top-level item is in the tab order (the last one used).
// - ← / → (↑ / ↓ when aria-orientation="vertical") move between top-level items, Home / End
//   to the first / last; typing jumps to an item by its first letters. If a menu is open, the
//   adjacent item's menu opens instead.
// - ↓ / Enter / Space (→ when vertical) open an item's menu on its first item, ↑ on its last.
//   Clicking toggles it; once one is open, hovering another top-level item switches to it.
// - Inside a menu everything works as in the dropdown (utils/menu.ts): ↓ ↑ Home End and
//   typeahead, submenus, checkbox and radio items ("menu:change"), data-keep-open. → on an item
//   without a submenu opens the next top-level menu, ← in a top-level menu the previous one
//   (when vertical, ← closes the menu instead).
// - Escape closes the menu and returns focus to its trigger; clicking outside, Tab, or focus
//   leaving the menubar close it; choosing an item closes it.
import { queryAll } from "../../utils/dom";
import { place } from "../../utils/position";
import {
  ITEM,
  bindMenus,
  closeSubs,
  focusItem,
  isDisabled,
  menuClosed,
  menuOpened,
  prepareMenu,
  subMenuOf,
  typeahead,
  type MenuHost,
} from "../../utils/menu";

export function initMenubar(root: ParentNode = document) {
  queryAll(root, "[data-menubar]:not([data-init])").forEach((bar) => {
    bar.dataset.init = "";
    if (!bar.hasAttribute("role")) bar.setAttribute("role", "menubar");

    const vertical = () => bar.getAttribute("aria-orientation") === "vertical";
    const triggers = () =>
      [...bar.querySelectorAll<HTMLElement>(ITEM)].filter(
        (el) => !el.closest('[role="menu"]') && el.closest('[role="menubar"]') === bar && !isDisabled(el),
      );
    const expanded = () => triggers().find((t) => t.getAttribute("aria-expanded") === "true");
    const isTrigger = (el: EventTarget | null) => {
      const item = el instanceof Element ? el.closest<HTMLElement>(ITEM) : null;
      return item && triggers().includes(item) ? item : null;
    };
    const tabbable = (current: HTMLElement) => {
      for (const t of triggers()) t.tabIndex = t === current ? 0 : -1;
    };

    const host: MenuHost = {
      root: bar,
      isOpen: () => !!expanded(),
      close(refocus) {
        const t = expanded();
        if (!t) return;
        const menu = subMenuOf(t);
        if (menu) {
          closeSubs(menu);
          menu.hidden = true;
        }
        t.setAttribute("aria-expanded", "false");
        menuClosed(host);
        if (refocus) t.focus();
      },
      sideways(dir) {
        if (vertical()) {
          if (dir === 1) return false;
          host.close(true);
          return true;
        }
        const current = expanded();
        const list = triggers();
        if (current) go(list[(list.indexOf(current) + dir + list.length) % list.length]!, true);
        return true;
      },
    };

    function open(t: HTMLElement, focus?: "first" | "last") {
      const menu = subMenuOf(t);
      if (!menu) return;
      if (expanded() !== t) {
        host.close(false);
        prepareMenu(menu, t);
        menu.hidden = false;
        t.setAttribute("aria-expanded", "true");
        place(menu, t);
        menuOpened(host);
      }
      tabbable(t);
      if (focus) focusItem(menu, focus);
    }
    /** Move to top-level item `t`; with `opening`, open its menu (focus in it) if it has one. */
    function go(t: HTMLElement, opening: boolean) {
      tabbable(t);
      if (opening && subMenuOf(t)) return open(t, "first");
      host.close(false);
      t.focus();
    }

    const list = triggers();
    tabbable(list.find((t) => t.getAttribute("tabindex") === "0") ?? list[0]!);
    bindMenus(host);

    bar.addEventListener("focusin", (e) => {
      const t = isTrigger(e.target);
      if (t) tabbable(t);
    });
    bar.addEventListener("click", (e) => {
      const t = isTrigger(e.target);
      if (!t) return;
      if (!subMenuOf(t)) host.close(false);
      else if (expanded() === t) host.close(false);
      else open(t, e.detail === 0 ? "first" : undefined);
    });
    bar.addEventListener("pointerover", (e) => {
      const t = isTrigger(e.target);
      const current = expanded();
      if (t && current && current !== t && subMenuOf(t)) {
        open(t);
        t.focus({ preventScroll: true });
      }
    });

    bar.addEventListener("keydown", (e) => {
      const t = isTrigger(e.target);
      if (!t) return;
      const v = vertical();
      const items = triggers();
      const i = items.indexOf(t);
      const keys: Record<string, number> = { Home: 0, End: items.length - 1 };
      keys[v ? "ArrowDown" : "ArrowRight"] = i + 1;
      keys[v ? "ArrowUp" : "ArrowLeft"] = i - 1;
      const to = keys[e.key];
      const menu = subMenuOf(t);

      if (to !== undefined) {
        e.preventDefault();
        go(items[(to + items.length) % items.length]!, !!expanded());
      } else if (menu && (e.key === (v ? "ArrowRight" : "ArrowDown") || e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        open(t, "first");
      } else if (menu && !v && e.key === "ArrowUp") {
        e.preventDefault();
        open(t, "last");
      } else if (e.key === "Escape" && expanded()) {
        e.preventDefault();
        host.close(true);
      } else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const match = typeahead(bar, items, e.key, t);
        if (match) go(match, false);
      }
    });
  });
}
