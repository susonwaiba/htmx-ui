import { describe, expect, test } from "bun:test";
import { initDropdown } from "./dropdown";

describe("dropdown", () => {
  const setup = () => {
    document.body.innerHTML = `
      <div data-dropdown>
        <button data-dropdown-trigger aria-expanded="false">Open</button>
        <div role="menu" hidden>
          <a role="menuitem" href="#a">A</a><a role="menuitem" href="#b" aria-disabled="true">B</a><a role="menuitem" href="#c">C</a>
        </div>
      </div><p id="outside">x</p>`;
    initDropdown(document);
    return {
      trigger: document.querySelector<HTMLElement>("[data-dropdown-trigger]")!,
      menu: document.querySelector<HTMLElement>('[role="menu"]')!,
      items: [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')],
    };
  };
  const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));

  test("trigger toggles the menu and aria-expanded", () => {
    const { trigger, menu } = setup();
    trigger.click();
    expect(menu.hidden).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    trigger.click();
    expect(menu.hidden).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("arrow keys open and move focus, skipping disabled items; Escape closes and refocuses", () => {
    const { trigger, menu, items } = setup();
    key(trigger, "ArrowDown");
    expect(document.activeElement).toBe(items[0]!);
    key(menu, "ArrowDown");
    expect(document.activeElement).toBe(items[2]!); // B is aria-disabled
    key(menu, "ArrowDown");
    expect(document.activeElement).toBe(items[0]!); // wraps
    key(menu, "Escape");
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  test("clicking outside or choosing an item closes it", () => {
    const { trigger, menu, items } = setup();
    trigger.click();
    document.getElementById("outside")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(menu.hidden).toBe(true);
    trigger.click();
    items[0]!.click();
    expect(menu.hidden).toBe(true);
  });
});

describe("dropdown item kinds", () => {
  const setup = () => {
    document.body.innerHTML = `
      <form id="f"><div data-dropdown>
        <button type="button" data-dropdown-trigger aria-expanded="false">Open</button>
        <div role="menu" hidden>
          <span role="menuitemcheckbox" id="bar" name="bar" aria-checked="true">Status bar</span>
          <span role="menuitemcheckbox" id="act" data-keep-open>Activity bar</span>
          <div role="group" aria-label="Position">
            <span role="menuitemradio" id="top" name="pos" value="top" aria-checked="true">Top</span>
            <span role="menuitemradio" id="bottom" name="pos" value="bottom" aria-checked="false">Bottom</span>
          </div>
          <div class="dropdown-sub">
            <span role="menuitem" id="share" aria-haspopup="menu" aria-expanded="false">Share</span>
            <div role="menu" id="sub" hidden>
              <span role="menuitem" id="email">Email</span><span role="menuitem" id="msg">Messages</span>
            </div>
          </div>
          <span role="menuitem" id="print">Print</span>
          <span role="menuitem" id="paste">Paste</span>
        </div>
      </div></form><p id="outside">x</p>`;
    initDropdown(document);
    const $ = (id: string) => document.getElementById(id)!;
    return { $, trigger: document.querySelector<HTMLElement>("[data-dropdown-trigger]")!, menu: $("sub").parentElement!.parentElement! };
  };
  const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
  // The values a form would submit (happy-dom's FormData skips hidden inputs).
  const fields = () => {
    const values = [...document.querySelectorAll<HTMLInputElement>("#f input[data-menu-field]:not(:disabled)")];
    return { get: (n: string) => values.find((i) => i.name === n)?.value ?? null, getAll: (n: string) => values.filter((i) => i.name === n).map((i) => i.value) };
  };

  test("checkbox items toggle aria-checked, fire menu:change and sync a hidden field", () => {
    const { $, trigger, menu } = setup();
    expect($("act").getAttribute("aria-checked")).toBe("false"); // normalised
    expect(fields().get("bar")).toBe("on");
    const events: CustomEvent[] = [];
    document.addEventListener("menu:change", (e) => events.push(e as CustomEvent), { once: true });
    trigger.click();
    $("bar").click();
    expect($("bar").getAttribute("aria-checked")).toBe("false");
    expect(fields().get("bar")).toBeNull();
    expect(events[0]!.detail).toEqual({ checked: false, name: "bar", value: null });
    expect(events[0]!.target).toBe($("bar"));
    expect(menu.hidden).toBe(true); // closes by default
  });

  test("data-keep-open keeps the menu open", () => {
    const { $, trigger, menu } = setup();
    trigger.click();
    $("act").click();
    expect($("act").getAttribute("aria-checked")).toBe("true");
    expect(menu.hidden).toBe(false);
  });

  test("radio items check one per group", () => {
    const { $, trigger } = setup();
    expect(fields().get("pos")).toBe("top");
    let fired = 0;
    document.addEventListener("menu:change", () => fired++);
    trigger.click();
    $("top").click(); // already checked: no change
    expect(fired).toBe(0);
    trigger.click();
    $("bottom").click();
    expect($("top").getAttribute("aria-checked")).toBe("false");
    expect($("bottom").getAttribute("aria-checked")).toBe("true");
    expect(fields().getAll("pos")).toEqual(["bottom"]);
    expect(fired).toBe(1);
  });

  test("Enter and Space activate the focused item", () => {
    const { $, trigger, menu } = setup();
    key(trigger, "ArrowDown");
    key($("bar"), " ");
    expect($("bar").getAttribute("aria-checked")).toBe("false");
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    key(trigger, "ArrowUp");
    expect(document.activeElement).toBe($("paste"));
    key($("paste"), "Enter");
    expect(menu.hidden).toBe(true);
  });

  test("submenus open with ArrowRight / Enter and close with ArrowLeft / Escape", () => {
    const { $, trigger, menu } = setup();
    key(trigger, "ArrowDown");
    $("share").focus();
    key($("share"), "ArrowRight");
    expect($("sub").hidden).toBe(false);
    expect($("share").getAttribute("aria-expanded")).toBe("true");
    expect($("share").getAttribute("aria-controls")).toBe("sub");
    expect(document.activeElement).toBe($("email"));
    key($("email"), "ArrowDown");
    expect(document.activeElement).toBe($("msg"));
    key($("msg"), "ArrowLeft");
    expect($("sub").hidden).toBe(true);
    expect(document.activeElement).toBe($("share"));
    key($("share"), "Enter");
    expect(document.activeElement).toBe($("email"));
    key($("email"), "Escape");
    expect($("sub").hidden).toBe(true);
    expect(menu.hidden).toBe(false); // only the submenu closed
    expect(document.activeElement).toBe($("share"));
    key($("share"), "Escape");
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  test("choosing a submenu item closes everything; closing the menu closes its submenus", () => {
    const { $, trigger, menu } = setup();
    trigger.click();
    $("share").click();
    expect($("sub").hidden).toBe(false);
    $("email").click();
    expect(menu.hidden).toBe(true);
    expect($("sub").hidden).toBe(true);
    expect($("share").getAttribute("aria-expanded")).toBe("false");
  });

  test("hovering a submenu trigger opens it, hovering another item closes it", async () => {
    const { $, trigger } = setup();
    trigger.click();
    const over = (el: Element) => el.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    over($("share"));
    expect(document.activeElement).toBe($("share"));
    await Bun.sleep(150);
    expect($("sub").hidden).toBe(false);
    over($("email")); // into the submenu: stays open
    over($("print"));
    over($("email")); // back before the delay: cancels the close
    await Bun.sleep(350);
    expect($("sub").hidden).toBe(false);
    over($("print"));
    await Bun.sleep(350);
    expect($("sub").hidden).toBe(true);
    expect(document.activeElement).toBe($("print"));
  });

  test("typeahead focuses the next item starting with the typed letters", () => {
    const { $, trigger } = setup();
    key(trigger, "ArrowDown");
    key($("bar"), "p");
    expect(document.activeElement).toBe($("print"));
    key($("print"), "p");
    expect(document.activeElement).toBe($("paste")); // repeated letter cycles
  });

  test("items leave the tab order; Tab closes and returns to the trigger", () => {
    const { $, trigger, menu } = setup();
    key(trigger, "ArrowDown");
    expect($("print").tabIndex).toBe(-1);
    key($("bar"), "Tab");
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  test("initialises once", () => {
    const { $, trigger } = setup();
    initDropdown(document);
    trigger.click();
    $("act").click();
    expect($("act").getAttribute("aria-checked")).toBe("true"); // toggled once, not twice
  });
});
