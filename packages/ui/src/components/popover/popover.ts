// Popover: a panel of any content (text, a form...) that opens from a trigger. Markup: see popover.css.
// - The trigger toggles the panel and keeps aria-expanded / aria-controls in sync.
// - Escape closes it and returns focus to the trigger; clicking outside or tabbing out closes it.
// - An [autofocus] element inside the panel is focused when it opens.
// - A [data-popover-close] element inside the panel closes it and returns focus to the trigger
//   (a Cancel button, or a form's submit button: the form still submits).
import { queryAll } from "../../utils/dom";

let ids = 0;

export function initPopover(root: ParentNode) {
  queryAll(root, "[data-popover]:not([data-init])").forEach((popover) => {
    popover.dataset.init = "";
    const trigger = popover.querySelector<HTMLElement>("[data-popover-trigger]");
    const panel = popover.querySelector<HTMLElement>("[data-popover-content]");
    if (!trigger || !panel) return;

    panel.id ||= `popover-${++ids}`;
    trigger.setAttribute("aria-controls", panel.id);
    trigger.setAttribute("aria-expanded", String(!panel.hidden));

    const onOutside = (e: PointerEvent) => {
      if (!popover.contains(e.target as Node)) close(false);
    };
    function open() {
      panel!.hidden = false;
      trigger!.setAttribute("aria-expanded", "true");
      document.addEventListener("pointerdown", onOutside);
      panel!.querySelector<HTMLElement>("[autofocus]")?.focus();
    }
    function close(refocus: boolean) {
      if (panel!.hidden) return;
      panel!.hidden = true;
      trigger!.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", onOutside);
      if (refocus) trigger!.focus();
    }

    trigger.addEventListener("click", () => (panel.hidden ? open() : close(false)));
    panel.addEventListener("click", (e) => {
      const closer = (e.target as Element).closest("[data-popover-close]");
      if (closer && closer.closest("[data-popover]") === popover) close(true);
    });
    popover.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) {
        e.preventDefault();
        close(true);
      }
    });
    popover.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && !popover.contains(next)) close(false);
    });
  });
}
