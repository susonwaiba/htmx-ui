// Off-canvas sidebar for small screens.
// Usage: <button data-sidebar-toggle aria-controls="nav" aria-expanded="false">Menu</button>
//        <aside id="nav" class="sidebar" data-sidebar>…</aside>
//        <div class="sidebar-backdrop" data-sidebar-close></div>
// Closes on backdrop click, Escape, or following a link inside the sidebar.

import { queryAll } from "../../utils/dom";

function setOpen(sidebar: HTMLElement, open: boolean) {
  sidebar.toggleAttribute("data-open", open);
  document.querySelectorAll(`[data-sidebar-toggle][aria-controls="${sidebar.id}"]`).forEach((t) => {
    t.setAttribute("aria-expanded", String(open));
  });
}

export function initSidebar(root: ParentNode) {
  queryAll(root, "[data-sidebar-toggle]:not([data-init])").forEach((toggle) => {
    toggle.dataset.init = "";
    toggle.addEventListener("click", () => {
      const sidebar = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
      if (sidebar) setOpen(sidebar, !sidebar.hasAttribute("data-open"));
    });
  });

  queryAll(root, "[data-sidebar]:not([data-init])").forEach((sidebar) => {
    sidebar.dataset.init = "";
    const close = () => setOpen(sidebar, false);
    sidebar.addEventListener("click", (e) => {
      if ((e.target as Element).closest("a")) close();
    });
    sidebar.parentElement?.querySelectorAll("[data-sidebar-close]").forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.hasAttribute("data-open")) close();
    });
  });
}
