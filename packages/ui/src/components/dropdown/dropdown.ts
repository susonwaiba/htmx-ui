// Dropdown menu. Markup: see dropdown.css.
// - The trigger toggles the menu and keeps aria-expanded in sync.
// - ↓/↑ on the trigger open the menu on the first/last item; ↓ ↑ Home End move
//   between items; Escape closes and returns focus to the trigger.
// - Clicking outside, tabbing away, or choosing an item closes it.
// Items are looked up on every keypress, so menus whose items change (e.g. filled
// in from fetched data) keep working.
import { queryAll } from "../../utils/dom";

export function initDropdown(root: ParentNode) {
  queryAll(root, "[data-dropdown]:not([data-init])").forEach((dropdown) => {
    dropdown.dataset.init = "";
    const trigger = dropdown.querySelector<HTMLElement>("[data-dropdown-trigger]");
    const menu = dropdown.querySelector<HTMLElement>('[role="menu"]');
    if (!trigger || !menu) return;

    const items = () => [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')];
    const isOpen = () => !menu.hidden;

    const onOutside = (e: PointerEvent) => {
      if (!dropdown.contains(e.target as Node)) close(false);
    };
    function open(focus?: "first" | "last") {
      menu!.hidden = false;
      trigger!.setAttribute("aria-expanded", "true");
      document.addEventListener("pointerdown", onOutside);
      if (focus) (focus === "first" ? items()[0] : items().at(-1))?.focus();
    }
    function close(refocus: boolean) {
      if (!isOpen()) return;
      menu!.hidden = true;
      trigger!.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", onOutside);
      if (refocus) trigger!.focus();
    }

    trigger.addEventListener("click", () => (isOpen() ? close(false) : open()));
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open(e.key === "ArrowDown" ? "first" : "last");
      }
    });

    menu.addEventListener("keydown", (e) => {
      const list = items();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: list.length - 1 }[e.key];
      if (next !== undefined) {
        e.preventDefault();
        list[(next + list.length) % list.length]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        close(true);
      } else if (e.key === "Tab") {
        close(false);
      }
    });
    menu.addEventListener("click", (e) => {
      if ((e.target as Element).closest('[role="menuitem"]')) close(false);
    });
  });
}
