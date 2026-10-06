// htmx-ui-plugin-docs/client: the browser side of the docs plugin.
//
//   import { initMarkdownCopy } from "htmx-ui-plugin-docs/client";
//   document.addEventListener("DOMContentLoaded", () => initMarkdownCopy());
//
// "Copy page as Markdown" buttons on docs pages (markdown_actions() in docs/macros.html):
//   <button data-markdown-copy="/docs/components/button.md"><span data-markdown-copy-label>Copy Markdown</span></button>
// Idempotent, so it can also run on content htmx swaps in.
import { queryAll } from "htmx-ui";

export function initMarkdownCopy(root: ParentNode = document) {
  queryAll(root, "[data-markdown-copy]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    const label = el.querySelector("[data-markdown-copy-label]");
    el.addEventListener("click", async () => {
      const res = await fetch(el.dataset.markdownCopy!);
      if (!res.ok) return;
      await navigator.clipboard.writeText(await res.text());
      if (!label) return;
      const before = label.textContent;
      label.textContent = "Copied";
      setTimeout(() => (label.textContent = before), 1500);
    });
  });
}
