import { describe, expect, test } from "bun:test";
import { initPasswordInput } from "./password-input";

const group = (attrs = "") => `
  <form><div class="field">
    <div class="input-group password-input" data-password-input>
      <input class="input" type="password" name="password" value="secret" ${attrs} />
      <button type="button" data-password-toggle aria-label="Show password"></button>
    </div>
    <p data-password-caps hidden>Caps Lock is on.</p>
  </div></form>`;

function setup(html = group()) {
  document.body.innerHTML = html;
  initPasswordInput(document);
  initPasswordInput(document);
  return {
    wrapper: document.querySelector<HTMLElement>("[data-password-input]")!,
    input: document.querySelector<HTMLInputElement>("input")!,
    toggle: document.querySelector<HTMLElement>("[data-password-toggle]")!,
  };
}

describe("password-input", () => {
  test("the button shows and hides the password", () => {
    const { wrapper, input, toggle } = setup();
    let events: boolean[] = [];
    wrapper.addEventListener("password-input:toggle", (e) => events.push((e as CustomEvent).detail.visible));
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBe(input.id);
    toggle.click();
    expect(input.type).toBe("text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(wrapper.hasAttribute("data-visible")).toBe(true);
    toggle.click();
    expect(input.type).toBe("password");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(events).toEqual([true, false]);
  });

  test("keeps the caret where it was", () => {
    const { input, toggle } = setup();
    input.focus();
    input.setSelectionRange(2, 4);
    toggle.click();
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 4]);
  });

  test("hides the password again when the form is submitted", () => {
    const { input, toggle } = setup();
    const form = document.querySelector("form")!;
    form.addEventListener("submit", (e) => e.preventDefault());
    toggle.click();
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(input.type).toBe("password");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
  });

  test("a checkbox shows every marked input together", () => {
    setup(`<div data-password-input>
      <input type="password" data-password /><input type="password" data-password />
      <input type="checkbox" data-password-toggle /></div>`);
    const [a, b, box] = [...document.querySelectorAll<HTMLInputElement>("input")];
    box!.checked = true;
    box!.dispatchEvent(new Event("change"));
    expect([a!.type, b!.type]).toEqual(["text", "text"]);
    expect(box!.getAttribute("aria-controls")).toBe(`${a!.id} ${b!.id}`);
  });

  test("a disabled input disables the toggle", () => {
    const { toggle } = setup(group("disabled"));
    expect(toggle.hasAttribute("disabled")).toBe(true);
  });

  test("shows the Caps Lock hint while it is on", () => {
    const { input } = setup();
    const hint = document.querySelector<HTMLElement>("[data-password-caps]")!;
    const key = (caps: boolean) => {
      const e = new KeyboardEvent("keydown", { key: "A" });
      Object.defineProperty(e, "getModifierState", { value: (k: string) => k === "CapsLock" && caps });
      input.dispatchEvent(e);
    };
    key(true);
    expect(hint.hidden).toBe(false);
    key(false);
    expect(hint.hidden).toBe(true);
  });
});
