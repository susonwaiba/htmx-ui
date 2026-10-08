// Tabs. Usage: see tabs.css.
// - Buttons with [data-tab] switch to the [data-tab-panel] with the same value.
// - Arrow keys, Home and End move between tabs (roving tabindex): Left/Right, or Up/Down when
//   the group has data-orientation="vertical" (set as aria-orientation on the tablist).
//   Disabled tabs are skipped and can't be selected.
// - data-tabs-sync="key": every tab group on the page with the same key switches
//   together, the choice is saved to localStorage ("tabs:key"), restored on load,
//   and followed across browser tabs.
import { queryAll } from "../../utils/dom";
import { isDisabled, isRtl, nextIndex, uniqueId } from "../../utils/shared";

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
  if (![...tabs].some((t) => t.dataset.tab === value && !disabled(t))) return false;
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

const disabled = isDisabled;

export function initTabs(root: ParentNode) {
  queryAll(root, "[data-tabs]:not([data-tabs-init])").forEach((group) => {
    group.dataset.tabsInit = "";
    const sync = group.dataset.tabsSync;
    const tabs = [...group.querySelectorAll<HTMLElement>("[data-tab]")];
    const id = group.id || uniqueId("tabs");
    const vertical = group.dataset.orientation === "vertical";
    const list = group.querySelector<HTMLElement>('[role="tablist"]');
    if (list && vertical) list.setAttribute("aria-orientation", "vertical");

    tabs.forEach((tab) => {
      const panel = group.querySelector<HTMLElement>(`[data-tab-panel="${tab.dataset.tab}"]`);
      tab.id ||= `${id}-tab-${tab.dataset.tab}`;
      if (panel) {
        panel.id ||= `${id}-panel-${tab.dataset.tab}`;
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
      }

      tab.addEventListener("click", () => {
        if (disabled(tab)) return;
        const value = tab.dataset.tab!;
        if (!sync) return void select(group, value);
        selectSynced(sync, value);
        try {
          localStorage.setItem(storageKey(sync), value);
        } catch {}
      });

      tab.addEventListener("keydown", (e) => {
        const enabled = tabs.filter((t) => !disabled(t));
        const orientation = vertical ? "vertical" : "horizontal";
        const next = nextIndex(e.key, enabled.indexOf(tab), enabled.length, { orientation, rtl: isRtl(group) });
        if (next === undefined) return;
        e.preventDefault();
        const target = enabled[next]!;
        target.focus();
        target.click();
      });
    });

    const first = tabs.find((t) => !disabled(t))?.dataset.tab;
    const initial = (sync && read(sync)) || tabs.find((t) => t.getAttribute("aria-selected") === "true")?.dataset.tab || first;
    if (initial && !select(group, initial) && first) select(group, first);
  });

  if (!listening) {
    listening = true;
    // Another browser tab changed a synced choice
    window.addEventListener("storage", (e) => {
      if (e.key?.startsWith("tabs:") && e.newValue) selectSynced(e.key.slice(5), e.newValue);
    });
  }
}
