// Popover: a panel of any content (text, a form...) that opens from a trigger. Markup: see popover.css.
// - The trigger toggles the panel and keeps aria-expanded / aria-controls in sync.
// - Escape closes it and returns focus to the trigger; clicking outside or tabbing out closes it.
// - A panel that would leave the viewport flips to the other side (data-flip-x / data-flip-y).
// - An [autofocus] element inside the panel is focused when it opens.
// - A [data-popover-close] element inside the panel closes it and returns focus to the trigger
//   (a Cancel button, or a form's submit button: the form still submits).
import { dismissable } from "../../utils/dismiss";
import { queryAll } from "../../utils/dom";
import { place } from "../../utils/position";
import { ensureId } from "../../utils/shared";

export function initPopover(root: ParentNode) {
  queryAll(root, "[data-popover]:not([data-init])").forEach((popover) => {
    popover.dataset.init = "";
    const trigger = popover.querySelector<HTMLElement>("[data-popover-trigger]");
    const panel = popover.querySelector<HTMLElement>("[data-popover-content]");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-controls", ensureId(panel, "popover"));
    trigger.setAttribute("aria-expanded", String(!panel.hidden));

    const dismiss = dismissable(popover, () => close(false));
    function open() {
      panel!.hidden = false;
      trigger!.setAttribute("aria-expanded", "true");
      dismiss.opened();
      place(panel!, trigger!);
      panel!.querySelector<HTMLElement>("[autofocus]")?.focus();
    }
    function close(refocus: boolean) {
      if (panel!.hidden) return;
      panel!.hidden = true;
      trigger!.setAttribute("aria-expanded", "false");
      dismiss.closed();
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
  });
}
