// Light/dark theme and the data-theme colour palette (themes/aurora.css, themes/ember.css, …).
// Follows the OS preference until the user picks a mode, then remembers the choice in
// localStorage. The mode is applied as a "dark" class on <html> (see the @custom-variant rule
// in src/styles.css); a palette is applied as data-theme on <html> and scoped from there, so
// getPalette()/setPalette() switch it site-wide while the markup can still scope one section.

import { isDisabled } from "./utils/shared";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const PALETTE_KEY = "palette";

const prefersDark = () => matchMedia("(prefers-color-scheme: dark)").matches;

function systemTheme(): Theme {
  return prefersDark() ? "dark" : "light";
}

export function getTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : systemTheme();
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/** Reflect the active theme on every [data-theme-toggle] button. */
function syncToggles(theme: Theme) {
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((el) => {
    el.setAttribute("aria-pressed", String(theme === "dark"));
    const label = el.querySelector("[data-theme-label]");
    if (label) label.textContent = theme;
  });
}

// Colour palette ---------------------------------------------------------------

/** The palette applied to <html> right now (its `data-theme`), or null when none is set. */
export function getPalette(): string | null {
  return document.documentElement.dataset.theme || null;
}

/** Apply a palette site-wide and remember it for the next load. */
export function setPalette(palette: string) {
  if (getPalette() === palette && localStorage.getItem(PALETTE_KEY) === palette) return;
  document.documentElement.dataset.theme = palette;
  localStorage.setItem(PALETTE_KEY, palette);
  syncPalettes();
}

/** Reflect the applied palette on every [data-theme-palette] option. */
function syncPalettes() {
  const current = getPalette();
  document.querySelectorAll<HTMLElement>("[data-theme-palette]").forEach((el) => {
    const on = el.dataset.themePalette === current;
    // In a menu the dropdown manages the group; standalone buttons toggle aria-pressed.
    if (el.getAttribute("role")?.startsWith("menuitem")) el.setAttribute("aria-checked", String(on));
    else el.setAttribute("aria-pressed", String(on));
  });
}

// One document listener covers the options present now and any htmx swaps in later.
let paletteClickBound = false;

function bindPaletteClicks() {
  if (paletteClickBound) return;
  paletteClickBound = true;
  document.addEventListener("click", (e) => {
    const option = (e.target as Element | null)?.closest?.<HTMLElement>("[data-theme-palette]");
    if (!option || isDisabled(option)) return;
    const palette = option.dataset.themePalette;
    if (palette) setPalette(palette);
  });
}

export function initTheme() {
  apply(getTheme());

  // A stored palette wins over the markup default; the layout's inline <head> script applies
  // the same key before first paint. Keep the two in sync.
  const palette = localStorage.getItem(PALETTE_KEY);
  if (palette) document.documentElement.dataset.theme = palette;

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    el.addEventListener("click", () => {
      const next: Theme = getTheme() === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
      syncToggles(next);
    });
  });

  bindPaletteClicks();
  syncPalettes();

  // Keep following the OS for as long as no explicit choice has been made.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const theme = systemTheme();
    apply(theme);
    syncToggles(theme);
  });

  syncToggles(getTheme());
}
