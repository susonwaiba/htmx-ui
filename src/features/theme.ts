// Example feature module. Each feature lives in its own file and is wired up from app.ts.
export function initTheme() {
  document.querySelectorAll<HTMLElement>("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}
