// Keeping popups on screen. A popup opens on its default side (below, aligned to the trigger's
// start edge); place() marks it to open on the other side when it would leave the viewport and
// there is more room there. The component's CSS turns the marks into positions:
//   [data-flip-x]  aligned to the trigger's other edge (submenus: opens to the left)
//   [data-flip-y]  opens upwards
// Used by the dropdown and menubar menus and their submenus, select, combobox and popover.

/** Flip `panel` (open, so it can be measured) away from the viewport edges `anchor` is near. */
export function place(panel: HTMLElement, anchor: HTMLElement) {
  delete panel.dataset.flipX;
  delete panel.dataset.flipY;
  const view = panel.ownerDocument.defaultView;
  if (!view) return;
  const r = panel.getBoundingClientRect();
  const a = anchor.getBoundingClientRect();
  if (r.right > view.innerWidth && a.left > view.innerWidth - a.right) panel.dataset.flipX = "";
  if (r.bottom > view.innerHeight && a.top > view.innerHeight - a.bottom) panel.dataset.flipY = "";
}
