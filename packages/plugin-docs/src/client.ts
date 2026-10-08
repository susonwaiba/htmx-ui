// htmx-ui-plugin-docs/client: the browser side of the docs plugin.
//
// Deprecated: markdown_actions() now renders an htmx-ui clipboard button (data-clipboard
// data-clipboard-url="….md"), which initComponents() from htmx-ui handles, so new pages need
// nothing from here. initMarkdownCopy() stays for pages built with the plugin's older markup:
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
