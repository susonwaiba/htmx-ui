// Dropdown menu. Markup: see dropdown.css.
// - The trigger toggles the menu and keeps aria-expanded / aria-controls in sync. A keyboard
//   click (Enter / Space) opens it on the first item; ↓ / ↑ on the trigger on the first / last.
// - Inside the menu (shared with the menubar, utils/menu.ts): ↓ ↑ Home End and typeahead move
//   between items; Enter / Space / click choose one and close the menu; Escape closes it and
//   returns focus to the trigger; clicking outside, Tab or focus leaving close it.
// - Checkbox and radio items (role="menuitemcheckbox" / "menuitemradio") toggle aria-checked,
//   fire a bubbling "menu:change" with detail { checked, name, value }, and with a `name`
//   attribute keep a hidden input in sync for a surrounding form. data-keep-open on an item,
//   group or menu keeps the menu open when choosing.
// - Submenus (.dropdown-sub: an item with aria-haspopup="menu" + a nested [role="menu"]) open on
//   hover, → / Enter / Space or click, and close on ← / Escape; they flip when near the edge.
// Items are looked up on every event, so menus whose items change (e.g. filled in from fetched
// data) keep working.
import { queryAll } from "../../utils/dom";
import { bindMenus, closeSubs, focusItem, menuClosed, menuOpened, prepareMenu, type MenuHost } from "../../utils/menu";

export function initDropdown(root: ParentNode = document) {
  queryAll(root, "[data-dropdown]:not([data-init])").forEach((dropdown) => {
    dropdown.dataset.init = "";
    const trigger = dropdown.querySelector<HTMLElement>("[data-dropdown-trigger]");
    const menu = dropdown.querySelector<HTMLElement>('[role="menu"]');
    if (!trigger || !menu) return;

    const host: MenuHost = {
      root: dropdown,
      isOpen: () => !menu.hidden,
      close(refocus) {
        if (menu.hidden) return;
        closeSubs(menu);
        menu.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        menuClosed(host);
        if (refocus) trigger.focus();
      },
    };
    function open(focus?: "first" | "last") {
      prepareMenu(menu!, trigger!);
      menu!.hidden = false;
      trigger!.setAttribute("aria-expanded", "true");
      menuOpened(host);
      if (focus) focusItem(menu!, focus);
    }

    trigger.setAttribute("aria-expanded", String(!menu.hidden));
    bindMenus(host);
    // detail is 0 for a click from the keyboard (Enter / Space on a button).
    trigger.addEventListener("click", (e) => (host.isOpen() ? host.close(false) : open(e.detail === 0 ? "first" : undefined)));
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        open(e.key === "ArrowDown" ? "first" : "last");
      } else if (e.key === "Escape" && host.isOpen()) {
        e.preventDefault();
        host.close(true);
      }
    });
  });
}
