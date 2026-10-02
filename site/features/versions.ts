// Docs version switcher and "old version" banner.
//
// Reads /docs/versions.json (bun/versions.ts) and rebuilds the switcher's links so
// each points at the same page in that version, when it exists there. Because this
// runs at view time, frozen snapshots of older versions also list versions that
// were released after them, and show a banner pointing to the latest docs.

type Manifest = {
  latest: string;
  versions: { id: string; label: string; path: string; latest: boolean; pages: string[] }[];
};

function link(href: string, label: string, current: boolean, latest: boolean): HTMLAnchorElement {
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
    badge.textContent = "Latest";
    a.append(badge);
  }
  return a;
}

function banner(el: HTMLElement, current: string, latestLabel: string, href: string) {
  el.className = "alert alert-warning mb-8";
  el.setAttribute("role", "status");
  const title = document.createElement("div");
  title.className = "alert-title";
  title.textContent = `You're viewing the docs for ${current}.`;
  const body = document.createElement("div");
  body.className = "alert-description";
  const a = document.createElement("a");
  a.className = "link";
  a.href = href;
  a.textContent = `Go to this page in ${latestLabel}`;
  body.append(`The latest version is ${latestLabel}. `, a, ".");
  el.replaceChildren(title, body);
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
  // This page's path inside its version: "/docs/v0.1/components/button" -> "/components/button"
  const sub = location.pathname.startsWith(current.path) ? location.pathname.slice(current.path.length).replace(/\/$/, "") : "";
  const hrefIn = (v: Manifest["versions"][number]) => v.path + (v.pages.includes(sub) ? sub : "");

  switcher
    .querySelector("[data-version-items]")
    ?.replaceChildren(...manifest.versions.map((v) => link(hrefIn(v), v.label, v === current, v.latest)));

  const latest = manifest.versions.find((v) => v.latest);
  const slot = document.querySelector<HTMLElement>("[data-version-banner]");
  if (latest && !current.latest && slot) banner(slot, current.label, latest.label, hrefIn(latest));
}
