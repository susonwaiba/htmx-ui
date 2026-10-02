// Site search: a command palette over the sitemap (site/partials/search.html).
//
// - Opens with Ctrl/⌘K, "/" (when not typing), or any [data-search-open] button.
// - Searches the sitemap of the docs version being read: /sitemap.json for the
//   latest docs and marketing pages, or an archived version's own sitemap
//   (listed in /sitemap.json "versions") when reading old docs.
// - Results are pages and sections; choosing one opens the page or `page#section`.
// - Keyboard: ↑/↓ move, Enter opens, Esc closes (native <dialog>). Ctrl/⌘+Enter or
//   middle-click opens in a new tab (results are real links).
// The index is fetched once, on first open (or earlier, on hovering the button).

import { buildIndex, search, type SearchRecord, type SearchResult, type Sitemap } from "./search-index";

type Index = { records: SearchRecord[]; label: string };

let index: Promise<Index> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

function loadIndex(): Promise<Index> {
  index ??= (async () => {
    const root = await fetchJson<Sitemap>("/sitemap.json");
    // Docs pages carry their version on the version switcher; other pages use the latest.
    const current = document.querySelector<HTMLElement>("[data-version-switcher]")?.dataset.version;
    const version = root.versions?.find((v) => v.id === current);
    if (version && !version.latest) {
      return { records: buildIndex(await fetchJson<Sitemap>(version.sitemap)), label: `${version.label} docs` };
    }
    const latest = root.versions?.find((v) => v.latest);
    return { records: buildIndex(root), label: latest ? `${latest.label} docs` : "" };
  })().catch((e) => {
    index = null; // allow a retry on the next open
    throw e;
  });
  return index;
}

/** Keep a page's hits together, pages ordered by their best hit. */
function groupByPage(results: SearchResult[]): [string, SearchResult[]][] {
  const groups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const key = r.href.split("#")[0]!;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()].map((hits) => [hits[0]!.page + (hits[0]!.group ? ` · ${hits[0]!.group}` : ""), hits]);
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text = ""): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function initSearch() {
  const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
  const input = dialog?.querySelector<HTMLInputElement>("[data-search-input]");
  const list = dialog?.querySelector<HTMLElement>("[data-search-results]");
  const message = dialog?.querySelector<HTMLElement>("[data-search-message]");
  if (!dialog || !input || !list || !message || dialog.dataset.init !== undefined) return;
  dialog.dataset.init = "";

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll("[data-search-shortcut]").forEach((k) => (k.textContent = isMac ? "⌘ K" : "Ctrl K"));

  let options: HTMLAnchorElement[] = [];
  let active = -1;

  function setActive(i: number, scroll = true) {
    options[active]?.setAttribute("aria-selected", "false");
    active = options.length ? (i + options.length) % options.length : -1;
    const option = options[active];
    if (option) {
      option.setAttribute("aria-selected", "true");
      input!.setAttribute("aria-activedescendant", option.id);
      if (scroll) option.scrollIntoView({ block: "nearest" });
    } else {
      input!.removeAttribute("aria-activedescendant");
    }
  }

  function showMessage(text: string) {
    message!.textContent = text;
    message!.hidden = !text;
  }

  async function update() {
    const query = input!.value.trim();
    list!.replaceChildren();
    options = [];
    active = -1;
    input!.setAttribute("aria-expanded", "false");
    input!.removeAttribute("aria-activedescendant");
    if (!query) return showMessage("Type to search pages and sections.");

    let data: Index;
    try {
      showMessage("Loading…");
      data = await loadIndex();
    } catch {
      return showMessage("Search is unavailable right now.");
    }
    if (input!.value.trim() !== query) return; // a newer keystroke is already rendering

    const groups = groupByPage(search(data.records, query, 30));
    if (!groups.length) return showMessage(`No results for “${query}”.`);
    showMessage("");

    let n = 0;
    for (const [title, hits] of groups) {
      const header = el("li", "search-group", title);
      header.setAttribute("role", "presentation");
      list!.append(header);
      for (const hit of hits) {
        const li = el("li");
        li.setAttribute("role", "presentation");
        const a = el("a", "search-option");
        a.href = hit.href;
        a.id = `search-option-${n++}`;
        a.tabIndex = -1;
        a.setAttribute("role", "option");
        a.setAttribute("aria-selected", "false");
        const heading = el("span", "search-option-title");
        heading.textContent = hit.heading ? `# ${hit.heading}` : hit.page;
        a.append(heading);
        if (hit.snippet.length) {
          const snippet = el("span", "search-option-snippet");
          for (const part of hit.snippet) snippet.append(part.match ? el("mark", "", part.text) : part.text);
          a.append(snippet);
        }
        a.addEventListener("mousemove", () => {
          const i = options.indexOf(a);
          if (i !== active) setActive(i, false);
        });
        a.addEventListener("click", (e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab/window: leave the palette open
          dialog!.close();
        });
        li.append(a);
        list!.append(li);
        options.push(a);
      }
    }
    input!.setAttribute("aria-expanded", "true");
    setActive(0);
  }

  function open() {
    if (dialog!.open) return;
    dialog!.showModal();
    input!.select();
    void loadIndex()
      .then((data) => {
        const label = dialog!.querySelector("[data-search-version]");
        if (label && data.label) label.textContent = `Searching ${data.label}`;
      })
      .catch(() => {});
    if (input!.value.trim()) void update();
  }

  function go(option: HTMLAnchorElement, newTab: boolean) {
    if (newTab) return void window.open(option.href, "_blank", "noopener");
    dialog!.close();
    location.assign(option.href); // same-page #section links scroll without reloading
  }

  input.addEventListener("input", () => void update());
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(active + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter" && options[active]) {
      e.preventDefault();
      go(options[active]!, e.metaKey || e.ctrlKey);
    }
  });
  // Clicking the backdrop (outside the panel) closes
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  document.querySelectorAll<HTMLElement>("[data-search-open]").forEach((button) => {
    button.addEventListener("click", open);
    // Warm the index before the click lands
    button.addEventListener("pointerenter", () => void loadIndex().catch(() => {}), { once: true });
    button.addEventListener("focus", () => void loadIndex().catch(() => {}), { once: true });
  });

  document.addEventListener("keydown", (e) => {
    const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      dialog.open ? dialog.close() : open();
    } else if (e.key === "/" && !typing && !dialog.open) {
      e.preventDefault();
      open();
    }
  });

}
