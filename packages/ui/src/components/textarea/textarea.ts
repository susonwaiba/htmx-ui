// Textarea extras. Markup: see textarea.css. All optional; a bare .textarea needs no script.
// - Grows with its content in browsers without CSS field-sizing (up to its max-height).
// - Fills [data-textarea-count] in the same .field (or the element data-textarea-count names by
//   id) with the length, "12/160" when it has a maxlength; data-state="near" from 90%, "limit" at it.
// - data-textarea-submit: Ctrl/⌘+Enter submits the form (requestSubmit, so htmx and validation
//   run). data-textarea-submit="enter": Enter submits and Shift+Enter starts a new line, as in chat.
import { queryAll } from "../../utils/dom";

const fieldSizing = () => typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content");

export function initTextarea(root: ParentNode) {
  queryAll<HTMLTextAreaElement>(root, "textarea[data-textarea]:not([data-init])").forEach((textarea) => {
    textarea.dataset.init = "";
    const field = textarea.closest(".field");
    const countId = textarea.dataset.textareaCount;
    const counters = countId
      ? [document.getElementById(countId)].filter((el): el is HTMLElement => !!el)
      : [...(field?.querySelectorAll<HTMLElement>("[data-textarea-count]") ?? [])];
    const autosize = !fieldSizing() && !textarea.classList.contains("textarea-fixed");

    const update = () => {
      if (autosize) {
        textarea.style.height = "auto";
        const border = textarea.offsetHeight - textarea.clientHeight;
        textarea.style.height = `${textarea.scrollHeight + border}px`;
      }
      const max = textarea.maxLength > 0 ? textarea.maxLength : 0;
      const length = textarea.value.length;
      counters.forEach((counter) => {
        counter.textContent = max ? `${length}/${max}` : String(length);
        if (!max || length < max * 0.9) delete counter.dataset.state;
        else counter.dataset.state = length >= max ? "limit" : "near";
      });
    };

    textarea.addEventListener("input", update);
    textarea.form?.addEventListener("reset", () => setTimeout(update));

    const submit = textarea.dataset.textareaSubmit;
    if (submit !== undefined) {
      textarea.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || e.isComposing) return;
        const mod = e.ctrlKey || e.metaKey;
        if (submit === "enter" ? e.shiftKey : !mod) return;
        e.preventDefault();
        textarea.form?.requestSubmit();
      });
    }
    update();
  });
}
