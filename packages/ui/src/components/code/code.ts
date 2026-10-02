// Copy-to-clipboard for code blocks.
// Usage: <div class="code-block" data-code><button class="code-copy" data-copy>Copy</button><pre><code>…</code></pre></div>
// With tabs (several <pre data-tab-panel>), the visible panel is copied.
import { queryAll } from "../../utils/dom";

export function initCode(root: ParentNode) {
  queryAll(root, "[data-code]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    const button = el.querySelector<HTMLElement>("[data-copy]");
    const label = button?.querySelector("[data-copy-label]");
    button?.addEventListener("click", async () => {
      const code = el.querySelector("pre:not([hidden]) code") ?? el.querySelector("code");
      await navigator.clipboard.writeText(code?.textContent ?? "");
      button.dataset.copied = "";
      if (label) label.textContent = "Copied";
      setTimeout(() => {
        delete button.dataset.copied;
        if (label) label.textContent = "Copy";
      }, 1500);
    });
  });
}
