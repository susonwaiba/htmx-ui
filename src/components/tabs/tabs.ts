// Tabs. Usage: see tabs.css.
// - Buttons with [data-tab] switch to the [data-tab-panel] with the same value.
// - Arrow keys, Home and End move between tabs (roving tabindex).
// - data-tabs-sync="key": every tab group on the page with the same key switches
//   together, the choice is saved to localStorage ("tabs:key"), restored on load,
//   and followed across browser tabs.
import { queryAll } from "../../utils/dom";

const storageKey = (sync: string) => `tabs:${sync}`;

function read(sync: string): string | null {
  try {
    return localStorage.getItem(storageKey(sync));
  } catch {
    return null;
  }
}

function select(group: HTMLElement, value: string): boolean {
  const tabs = group.querySelectorAll<HTMLElement>("[data-tab]");
  if (![...tabs].some((t) => t.dataset.tab === value)) return false;
  tabs.forEach((t) => {
    const on = t.dataset.tab === value;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
  });
  group.querySelectorAll<HTMLElement>("[data-tab-panel]").forEach((p) => {
    p.hidden = p.dataset.tabPanel !== value;
  });
  return true;
}

/** Select `value` in every group synced on `sync`. */
function selectSynced(sync: string, value: string) {
  document.querySelectorAll<HTMLElement>(`[data-tabs][data-tabs-sync="${sync}"]`).forEach((g) => select(g, value));
}

let listening = false;

export function initTabs(root: ParentNode) {
  queryAll(root, "[data-tabs]:not([data-tabs-init])").forEach((group, n) => {
    group.dataset.tabsInit = "";
    const sync = group.dataset.tabsSync;
    const tabs = [...group.querySelectorAll<HTMLElement>("[data-tab]")];
    const id = group.id || `tabs-${Math.random().toString(36).slice(2, 8)}-${n}`;

    tabs.forEach((tab) => {
      const panel = group.querySelector<HTMLElement>(`[data-tab-panel="${tab.dataset.tab}"]`);
      tab.id ||= `${id}-tab-${tab.dataset.tab}`;
      if (panel) {
        panel.id ||= `${id}-panel-${tab.dataset.tab}`;
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
      }

      tab.addEventListener("click", () => {
        const value = tab.dataset.tab!;
        if (!sync) return void select(group, value);
        selectSynced(sync, value);
        try {
          localStorage.setItem(storageKey(sync), value);
        } catch {}
      });

      tab.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(tab);
        const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        const target = tabs[(next + tabs.length) % tabs.length]!;
        target.focus();
        target.click();
      });
    });

    const initial = (sync && read(sync)) || tabs.find((t) => t.getAttribute("aria-selected") === "true")?.dataset.tab || tabs[0]?.dataset.tab;
    if (initial && !select(group, initial) && tabs[0]) select(group, tabs[0].dataset.tab!);
  });

  if (!listening) {
    listening = true;
    // Another browser tab changed a synced choice
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("tabs:") && e.newValue) selectSynced(e.key.slice(5), e.newValue);
    });
  }
}
