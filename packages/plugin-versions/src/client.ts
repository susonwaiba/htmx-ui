// htmx-ui-plugin-versions/client: the docs version switcher and "old version" banner.
//
//   import { initVersions } from "htmx-ui-plugin-versions/client";
//   document.addEventListener("DOMContentLoaded", () => initVersions());
//
// Archived pages are frozen HTML, so their banner is baked in when they are
// archived (./versions.ts) and is there on first paint. This module reads the
// manifest (<prefix>/versions.json, the switcher's data-versions-src) to rebuild the
// switcher's links so each points at the same page in that version, when it exists
// there, and to refresh the banner when a newer version has been released since.
// Because it runs at view time, frozen snapshots also list versions that were
// released after them. Markup: version_switcher() and version_banner() in
// versions/macros.html.

type Manifest = {
  latest: string;
  versions: { id: string; label: string; path: string; latest: boolean; released: string | null; pages: string[] }[];
};

/** The version being worked on has no release number yet; it is labelled "next". */
const IN_DEVELOPMENT = "next";

function link(href: string, label: string, current: boolean, latest: boolean, released: boolean): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = href;
  a.className = "dropdown-item";
  a.setAttribute("role", "menuitem");
  a.dataset.versionLink = "";
  if (current) a.setAttribute("aria-current", "true");
  const name = document.createElement("span");
  name.className = "font-mono";
  name.textContent = label;
  a.append(name);
  if (latest) {
    const badge = document.createElement("span");
    badge.className = "badge badge-primary";
    badge.textContent = label === IN_DEVELOPMENT || !released ? "In development" : "Latest";
    a.append(badge);
  }
  return a;
}

/**
 * Fill the banner. Archived pages ship it already built (./versions.ts), so its
 * parts are reused and only the text is refreshed: no flash when nothing has changed.
 */
function banner(el: HTMLElement, current: string, latestLabel: string, href: string) {
  el.className = "alert alert-warning mb-8";
  el.setAttribute("role", "status");
  const title = el.querySelector<HTMLElement>(".alert-title") ?? document.createElement("div");
  title.className = "alert-title";
  title.textContent = `You're viewing the docs for ${current}.`;
  const body = el.querySelector<HTMLElement>(".alert-description") ?? document.createElement("div");
  body.className = "alert-description";
  const a = body.querySelector<HTMLAnchorElement>("a") ?? document.createElement("a");
  a.className = "link";
  a.href = href;
  a.textContent = `Go to this page in ${latestLabel}`;
  body.replaceChildren(`The latest version is ${latestLabel}. `, a, ".");
  // The warning icon comes with the slot (version_banner()) or the built banner; keep it.
  const icon = el.querySelector(":scope > svg");
  el.replaceChildren(...(icon ? [icon] : []), title, body);
  el.hidden = false;
}

export async function initVersions() {
  const switcher = document.querySelector<HTMLElement>("[data-version-switcher]");
  if (!switcher?.dataset.versionsSrc) return;

  let manifest: Manifest;
  try {
    const res = await fetch(switcher.dataset.versionsSrc);
    if (!res.ok) return;
    manifest = await res.json();
  } catch {
    return; // keep the server-rendered links
  }

  const current = manifest.versions.find((v) => v.id === switcher.dataset.version);
  if (!current) return;
  // A deployed version's path may be absolute (or carry the subdirectory the site
  // is published under), so compare against its pathname, not the raw string.
  // This page's path inside its version: "/docs/v0.1/components/button" -> "/components/button"
  const path = new URL(current.path, location.href).pathname;
  const sub = location.pathname.startsWith(path) ? location.pathname.slice(path.length).replace(/\/$/, "") : "";
  const hrefIn = (v: Manifest["versions"][number]) => v.path + (v.pages.includes(sub) ? sub : "");

  switcher
    .querySelector("[data-version-items]")
    ?.replaceChildren(
      ...manifest.versions.map((v) => link(hrefIn(v), v.label, v === current, v.latest, !!v.released)),
    );

  const latest = manifest.versions.find((v) => v.latest);
  const slot = document.querySelector<HTMLElement>("[data-version-banner]");
  if (latest && !current.latest && slot) banner(slot, current.label, latest.label, hrefIn(latest));
}
