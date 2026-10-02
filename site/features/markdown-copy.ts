// "Copy page as Markdown" buttons on docs pages.
// Usage: <button data-markdown-copy="/docs/components/button.md"><span data-markdown-copy-label>Copy Markdown</span></button>
export function initMarkdownCopy() {
  document.querySelectorAll<HTMLElement>("[data-markdown-copy]:not([data-init])").forEach((el) => {
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
