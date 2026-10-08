// Closing a popup when the user is done with it: a pointer going down outside it, or focus
// moving out of it. Used by select, combobox, popover and prompt input. (Menus use the shared
// registry in utils/menu.ts, which also keeps only one open at a time.)

/**
 * Calls `close` when a pointer goes down outside `root` (while open) or focus leaves `root`.
 * Call `opened()` when the popup opens and `closed()` when it closes, so the document listener
 * is only there while it is needed.
 */
export function dismissable(root: HTMLElement, close: () => void) {
  const onDown = (e: PointerEvent) => {
    if (!root.contains(e.target as Node)) close();
  };
  root.addEventListener("focusout", (e) => {
    const next = e.relatedTarget as Node | null;
    if (next && !root.contains(next)) close();
  });
  return {
    opened: () => document.addEventListener("pointerdown", onDown),
    closed: () => document.removeEventListener("pointerdown", onDown),
  };
}
