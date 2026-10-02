// Accordion: open/close and "one at a time" are native <details name> behaviour. Markup: see accordion.css.
// The only behaviour is locking disabled items: CSS stops pointer clicks, but keyboard users,
// screen readers and scripts can still activate a <summary>. With data-accordion on the
// wrapper, activating a summary marked aria-disabled="true" does nothing.
import { queryAll } from "../../utils/dom";

export function initAccordion(root: ParentNode) {
  queryAll(root, "[data-accordion]:not([data-init])").forEach((accordion) => {
    accordion.dataset.init = "";
    accordion.addEventListener("click", (e) => {
      const summary = (e.target as Element).closest("summary");
      if (summary?.getAttribute("aria-disabled") === "true" && accordion.contains(summary)) e.preventDefault();
    });
  });
}
