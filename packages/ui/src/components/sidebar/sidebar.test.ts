import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { initSidebar, setSidebarExpanded } from "./sidebar";

// Mobile mode comes from CSS (--sidebar-mobile: 1 below the breakpoint); happy-dom doesn't
// apply the stylesheet, so tests set the property inline to stand in for a narrow screen.
const html = (attrs = "", mobile = false) => `
  <button id="trigger" data-sidebar-trigger aria-controls="nav">Toggle</button>
  <div class="sidebar-layout" id="layout">
    <aside id="nav" class="sidebar" data-sidebar ${attrs}${mobile ? ' style="--sidebar-mobile: 1"' : ""}>
      <nav class="sidebar-content">
        <a id="first" href="#a" class="sidebar-menu-button">A</a>
        <a id="current" href="#b" class="sidebar-menu-button" aria-current="page">B</a>
        <button id="last" type="button" data-sidebar-close>Close</button>
      </nav>
      <button id="rail" type="button" class="sidebar-rail" data-sidebar-rail tabindex="-1"></button>
    </aside>
    <main id="main" class="sidebar-inset">
      <button id="inner-trigger" data-sidebar-trigger>Inner</button>
      <input id="field" />
    </main>
  </div>`;

const $ = (id: string) => document.getElementById(id)!;
const key = (k: string, init: KeyboardEventInit = {}, target: EventTarget = document) =>
  target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init }));

function setup(attrs = "", mobile = false) {
  document.body.innerHTML = html(attrs, mobile);
  initSidebar(document);
  initSidebar(document); // idempotent
  return { nav: $("nav"), trigger: $("trigger") };
}

// A minimal cookie jar: the test document has no URL, so happy-dom keeps no cookies.
let jar = new Map<string, string>();
Object.defineProperty(document, "cookie", {
  configurable: true,
  get: () => [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
  set: (value: string) => {
    const [pair = "", ...attrs] = value.split(";");
    const [k = "", v = ""] = pair.split("=");
    if (attrs.some((a) => a.trim() === "max-age=0")) jar.delete(k.trim());
    else jar.set(k.trim(), v.trim());
  },
});

beforeEach(() => {
  jar = new Map();
});
afterAll(() => {
  delete (document as { cookie?: string }).cookie; // back to happy-dom's own
});

describe("sidebar (desktop)", () => {
  test("starts expanded, and a trigger toggles data-state and aria-expanded", () => {
    const { nav, trigger } = setup();
    expect(nav.dataset.state).toBe("expanded");
    expect(nav.hasAttribute("data-mobile")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    trigger.click();
    expect(nav.dataset.state).toBe("collapsed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.click(); // listeners attached once despite two inits
    expect(nav.dataset.state).toBe("expanded");
  });

  test("a trigger without aria-controls finds its layout's sidebar, and gets aria-controls", () => {
    const { nav } = setup();
    const inner = $("inner-trigger");
    expect(inner.getAttribute("aria-controls")).toBe("nav");
    inner.click();
    expect(nav.dataset.state).toBe("collapsed");
    expect($("trigger").getAttribute("aria-expanded")).toBe("false");
  });

  test("the rail toggles; data-sidebar-close collapses", () => {
    const { nav } = setup();
    $("rail").click();
    expect(nav.dataset.state).toBe("collapsed");
    $("rail").click();
    $("last").click();
    expect(nav.dataset.state).toBe("collapsed");
  });

  test('data-collapsible="none" never collapses on desktop', () => {
    const { nav, trigger } = setup('data-collapsible="none"');
    trigger.click();
    expect(nav.dataset.state).toBe("expanded");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(key("b", { ctrlKey: true })).toBe(true); // not prevented: nothing to do
  });

  test("Ctrl/⌘+B toggles, except while typing; data-shortcut changes or disables it", () => {
    const { nav } = setup();
    expect(key("b", { ctrlKey: true })).toBe(false); // default prevented
    expect(nav.dataset.state).toBe("collapsed");
    key("b", { metaKey: true });
    expect(nav.dataset.state).toBe("expanded");
    key("b", { ctrlKey: true }, $("field"));
    expect(nav.dataset.state).toBe("expanded");
    key("b", { ctrlKey: true, shiftKey: true });
    expect(nav.dataset.state).toBe("expanded");

    setup('data-shortcut="j"');
    key("b", { ctrlKey: true });
    expect($("nav").dataset.state).toBe("expanded");
    key("j", { ctrlKey: true });
    expect($("nav").dataset.state).toBe("collapsed");

    setup('data-shortcut="none"');
    expect(key("b", { ctrlKey: true })).toBe(true);
    expect($("nav").dataset.state).toBe("expanded");
  });

  test("fires sidebar:toggle with the new state", () => {
    const { nav, trigger } = setup();
    const events: unknown[] = [];
    document.addEventListener("sidebar:toggle", (e) => events.push((e as CustomEvent).detail), { once: true });
    trigger.click();
    expect(events).toEqual([{ expanded: false, open: false, mobile: false }]);
    expect(nav.dataset.state).toBe("collapsed");
  });
});

describe("sidebar persistence", () => {
  test("data-cookie stores the state, and a stored state is restored on init", () => {
    const { trigger } = setup('data-cookie="nav_state"');
    trigger.click();
    expect(document.cookie).toContain("nav_state=false");
    setup('data-cookie="nav_state"');
    expect($("nav").dataset.state).toBe("collapsed");
    $("trigger").click();
    expect(document.cookie).toContain("nav_state=true");
  });

  test("without data-cookie nothing is stored or restored", () => {
    document.cookie = "sidebar_state=false; path=/";
    const { nav, trigger } = setup();
    expect(nav.dataset.state).toBe("expanded");
    trigger.click();
    expect(document.cookie).toContain("sidebar_state=false"); // untouched, not rewritten to true
  });

  test("a server-rendered collapsed state is kept", () => {
    const { nav, trigger } = setup('data-state="collapsed"');
    expect(nav.dataset.state).toBe("collapsed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    setSidebarExpanded(nav, true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("sidebar (mobile)", () => {
  test("the trigger opens the panel: focus moves in, the rest of the layout is inert; Escape closes and refocuses", () => {
    const { nav, trigger } = setup('data-state="collapsed"', true);
    expect(nav.hasAttribute("data-mobile")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.focus();
    trigger.click();
    expect(nav.hasAttribute("data-open")).toBe(true);
    expect(nav.dataset.state).toBe("collapsed"); // the desktop state is untouched
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe($("current"));
    expect($("main").hasAttribute("inert")).toBe(true);
    key("Escape");
    expect(nav.hasAttribute("data-open")).toBe(false);
    expect($("main").hasAttribute("inert")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  test("a click on the backdrop (the layout itself) or on a link closes it", () => {
    const { nav, trigger } = setup("", true);
    trigger.click();
    $("layout").click();
    expect(nav.hasAttribute("data-open")).toBe(false);
    trigger.click();
    $("first").click();
    expect(nav.hasAttribute("data-open")).toBe(false);
    trigger.click();
    $("last").click(); // data-sidebar-close
    expect(nav.hasAttribute("data-open")).toBe(false);
  });

  test("Tab is kept inside the open panel", () => {
    const { trigger } = setup("", true);
    trigger.click();
    $("last").focus();
    expect(key("Tab")).toBe(false);
    expect(document.activeElement).toBe($("first"));
    expect(key("Tab", { shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe($("last"));
  });

  test("the shortcut opens the panel; leaving mobile mode closes it", () => {
    const { nav, trigger } = setup("", true);
    key("b", { ctrlKey: true });
    expect(nav.hasAttribute("data-open")).toBe(true);
    nav.style.removeProperty("--sidebar-mobile");
    setSidebarExpanded(nav, false); // any sync notices the change
    expect(nav.hasAttribute("data-mobile")).toBe(false);
    expect(nav.hasAttribute("data-open")).toBe(false);
    expect($("main").hasAttribute("inert")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("sidebar and htmx", () => {
  test("a sidebar swapped in later is initialised once, and existing triggers follow it", () => {
    const { trigger } = setup();
    const layout = $("layout");
    layout.innerHTML = `<aside id="nav" class="sidebar" data-sidebar data-state="collapsed"><a href="#x">x</a></aside>`;
    const fresh = $("nav");
    initSidebar(fresh);
    initSidebar(fresh);
    expect(fresh.hasAttribute("data-init")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    trigger.click();
    expect(fresh.dataset.state).toBe("expanded");
  });

  test("Escape dismisses a hovered or focused icon-mode tooltip until focus moves", () => {
    document.body.innerHTML = `
      <aside class="sidebar" data-sidebar data-collapsible="icon" data-state="collapsed">
        <ul class="sidebar-menu">
          <li class="sidebar-menu-item tooltip"><a id="home" href="#h" class="sidebar-menu-button">Home</a>
            <span class="tooltip-content tooltip-content-right" aria-hidden="true">Home</span></li>
        </ul>
      </aside><button id="elsewhere">x</button>`;
    initSidebar(document);
    const item = document.querySelector<HTMLElement>(".sidebar-menu-item")!;
    $("home").focus();
    key("Escape");
    expect(item.hasAttribute("data-dismissed")).toBe(true);
    $("elsewhere").focus();
    expect(item.hasAttribute("data-dismissed")).toBe(false);
  });
});
