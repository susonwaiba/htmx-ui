// Fills every [data-year] element with the current year. Used by the footer partial.
export function initYear() {
  document.querySelectorAll<HTMLElement>("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}
