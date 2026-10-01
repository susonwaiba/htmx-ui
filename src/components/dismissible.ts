// Usage: <div data-dismissible> ... <button data-dismiss>×</button></div>
export function initDismissible(root: ParentNode) {
  root.querySelectorAll<HTMLElement>("[data-dismissible]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    el.querySelector("[data-dismiss]")?.addEventListener("click", () => el.remove());
  });
}
