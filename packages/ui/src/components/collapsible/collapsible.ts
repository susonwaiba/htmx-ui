// Collapsible: a button that shows and hides a panel. Markup: see collapsible.css.
// - Every [data-collapsible-trigger] of this collapsible (not of one nested inside it) toggles its
//   [data-collapsible-content], with aria-expanded and aria-controls kept in sync.
// - The wrapper carries data-open while open, and fires a bubbling "collapsible:toggle" with
//   detail { open } on every change.
// - hidden="until-found" content opens when find-in-page matches text inside it, and goes back to
//   until-found when closed.
import { queryAll } from "../../utils/dom";
import { ensureId } from "../../utils/shared";

export function initCollapsible(root: ParentNode) {
  queryAll(root, "[data-collapsible]:not([data-init])").forEach((collapsible) => {
    collapsible.dataset.init = "";
    // Only this collapsible's parts: a nested one owns its own trigger and content.
    const own = (selector: string) =>
      [...collapsible.querySelectorAll<HTMLElement>(selector)].filter((el) => el.closest("[data-collapsible]") === collapsible);
    const content = own("[data-collapsible-content]")[0];
    const triggers = own("[data-collapsible-trigger]");
    if (!content) return;

    const closedAs = content.getAttribute("hidden") === "until-found" ? "until-found" : "";
    ensureId(content, "collapsible");
    for (const t of triggers) t.setAttribute("aria-controls", content.id);

    function sync(open: boolean) {
      for (const t of triggers) t.setAttribute("aria-expanded", String(open));
      collapsible.toggleAttribute("data-open", open);
    }
    function set(open: boolean) {
      if (open === !content!.hasAttribute("hidden")) return;
      if (open) content!.removeAttribute("hidden");
      else content!.setAttribute("hidden", closedAs);
      sync(open);
      collapsible.dispatchEvent(new CustomEvent("collapsible:toggle", { bubbles: true, detail: { open } }));
    }

    sync(!content.hasAttribute("hidden"));
    for (const t of triggers) t.addEventListener("click", () => set(content.hasAttribute("hidden")));
    // The browser has already revealed the content; only the state needs to follow.
    content.addEventListener("beforematch", () => {
      sync(true);
      collapsible.dispatchEvent(new CustomEvent("collapsible:toggle", { bubbles: true, detail: { open: true } }));
    });
  });
}
