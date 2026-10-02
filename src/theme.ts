// Light/dark theme. Follows the OS preference until the user picks one, then
// remembers the choice in localStorage. The chosen theme is applied as a "dark"
// class on <html>; see the @custom-variant rule in src/styles.css.

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

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

export function initTheme() {
  apply(getTheme());

  document.querySelectorAll<HTMLElement>("[data-theme-toggle]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    el.addEventListener("click", () => {
      const next: Theme = getTheme() === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      apply(next);
      syncToggles(next);
    });
  });

  // Keep following the OS for as long as no explicit choice has been made.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const theme = systemTheme();
    apply(theme);
    syncToggles(theme);
  });

  syncToggles(getTheme());
}
