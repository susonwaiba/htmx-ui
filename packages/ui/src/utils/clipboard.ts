// Copy text to the clipboard on every browser: the async Clipboard API where the page may use it
// (a secure context: https or localhost), else the old execCommand("copy") on a hidden textarea,
// which works over plain http, in older Safari and in iframes without the clipboard-write permission.

/**
 * Copies `text`; resolves to whether it worked. Call it from a click or key handler. A promise
 * (text still being fetched) is handed to the clipboard as is where the browser takes one, since
 * Safari drops the click's permission across an await.
 */
export async function copyText(text: string | Promise<string>): Promise<boolean> {
  if (typeof text !== "string") {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write && window.isSecureContext !== false) {
      try {
        const blob = text.then((t) => new Blob([t], { type: "text/plain" }));
        blob.catch(() => {}); // a failed fetch is handled below, not reported as unhandled
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
        return true;
      } catch {
        // No promise support, or the fetch failed: wait for the text and copy it the usual way.
      }
    }
    try {
      text = await text;
    } catch {
      return false;
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext !== false) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Denied (no permission, page not focused): fall through to the old way.
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  // Readonly stops the iOS keyboard opening; 16px stops iOS zooming; off screen but still selectable.
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;font-size:16px;";
  document.body.append(area);
  area.focus({ preventScroll: true });
  area.select();
  area.setSelectionRange(0, text.length); // iOS ignores select()
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus?.({ preventScroll: true });
  return ok;
}
