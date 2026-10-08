// Clipboard: a button (or tag) that copies text and shows a tick for a moment. Markup: see clipboard.css.
// What it copies, first match wins:
// - data-clipboard-text="…"
// - data-clipboard-target="selector": the nearest match, looking outward from the button (so
//   "pre:not([hidden]) code" finds the visible code in the button's own code block): its value
//   (input, textarea, select) or its text
// - data-clipboard-url="/page.md": the text of that URL, fetched when clicked
// - the text of a [data-clipboard-content] element inside it (a copy tag: the text it shows)
// Copying uses the Clipboard API, falling back to execCommand("copy") over plain http and in older
// browsers (utils/clipboard.ts). On success the element gets data-copied for data-clipboard-timeout
// ms (2000), which swaps .clipboard-idle for .clipboard-done, "Copied" is announced to screen readers
// (data-clipboard-announce to change it), and a bubbling "clipboard:copy" fires with detail { text }.
// On failure: data-copy-failed for the same time, "Copy failed" is announced, and "clipboard:error" fires.
import { copyText } from "../../utils/clipboard";
import { queryAll } from "../../utils/dom";

/** The closest element matching `selector`, searching each ancestor of `el` in turn. */
function nearest(el: Element, selector: string): Element | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const match = p.querySelector(selector);
    if (match) return match;
  }
  return null;
}

function source(el: HTMLElement): string | Promise<string> {
  if (el.dataset.clipboardText !== undefined) return el.dataset.clipboardText;
  const url = el.dataset.clipboardUrl;
  if (url)
    return fetch(url).then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return res.text();
    });
  const selector = el.dataset.clipboardTarget;
  const target = selector ? nearest(el, selector) : el.querySelector("[data-clipboard-content]");
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)
    return target.value;
  return target?.textContent?.trim() ?? "";
}

let status: HTMLElement | undefined;
// One shared polite live region: a button's changed text is not read out by itself.
function announce(message: string) {
  if (!status?.isConnected) {
    status = document.createElement("div");
    status.className = "sr-only";
    status.setAttribute("aria-live", "polite");
    status.dataset.clipboardStatus = "";
    document.body.append(status);
  }
  const region = status;
  region.textContent = "";
  // Cleared first and set on the next frame, so copying twice announces twice.
  setTimeout(() => (region.textContent = message), 50);
}

export function initClipboard(root: ParentNode) {
  queryAll(root, "[data-clipboard]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    let timer: ReturnType<typeof setTimeout> | undefined;

    el.addEventListener("click", async (e) => {
      if (el.getAttribute("aria-disabled") === "true") return;
      if (el instanceof HTMLAnchorElement) e.preventDefault();
      const from = source(el);
      const ok = from !== "" && (await copyText(from));
      const text = typeof from === "string" ? from : await from.catch(() => "");
      clearTimeout(timer);
      el.toggleAttribute("data-copied", ok);
      el.toggleAttribute("data-copy-failed", !ok);
      announce(ok ? (el.dataset.clipboardAnnounce ?? "Copied") : "Copy failed");
      el.dispatchEvent(new CustomEvent(ok ? "clipboard:copy" : "clipboard:error", { bubbles: true, detail: { text } }));
      timer = setTimeout(() => {
        el.removeAttribute("data-copied");
        el.removeAttribute("data-copy-failed");
      }, Number(el.dataset.clipboardTimeout) || 2000);
    });
  });
}
