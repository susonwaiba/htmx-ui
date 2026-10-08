// Tooltip: showing and hiding is CSS (tooltip.css: hover and keyboard focus). Markup: see tooltip.css.
// - Links the trigger (the first focusable element, or [data-tooltip-trigger]) to the text with
//   aria-describedby, so screen readers read it after the trigger's name.
// - Escape hides any open tooltip without moving focus or the pointer (WCAG 1.4.13); it comes
//   back once the pointer leaves the trigger and returns, or focus moves.
import { queryAll } from "../../utils/dom";
import { ensureId } from "../../utils/shared";

const FOCUSABLE = "[data-tooltip-trigger], a[href], button, input, select, textarea, [tabindex]";
let listening = false;

export function initTooltip(root: ParentNode) {
  if (!listening) {
    listening = true;
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      for (const tooltip of queryAll(document, "[data-tooltip]")) {
        if (tooltip.matches(":hover") || tooltip.contains(document.activeElement)) tooltip.dataset.dismissed = "";
      }
    });
  }

  queryAll(root, "[data-tooltip]:not([data-init])").forEach((tooltip) => {
    tooltip.dataset.init = "";
    const content = tooltip.querySelector<HTMLElement>(":scope > .tooltip-content, :scope > [role='tooltip']");
    const trigger = tooltip.querySelector<HTMLElement>(FOCUSABLE);
    if (!content) return;

    ensureId(content, "tooltip");
    content.setAttribute("role", "tooltip");
    if (trigger && trigger !== content && !content.contains(trigger)) {
      const described = (trigger.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
      if (!described.includes(content.id)) trigger.setAttribute("aria-describedby", [...described, content.id].join(" "));
    }

    const reset = () => delete tooltip.dataset.dismissed;
    tooltip.addEventListener("pointerleave", reset);
    tooltip.addEventListener("focusout", reset);
  });
}
