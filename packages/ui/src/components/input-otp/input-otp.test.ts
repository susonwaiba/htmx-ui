import { describe, expect, test } from "bun:test";
import { initInputOtp } from "./input-otp";

const slots = (n: number) => `<div class="input-otp-slot"></div>`.repeat(n);

describe("input-otp", () => {
  const setup = (attrs = "", n = 6, value = "") => {
    document.body.innerHTML = `
      <form><div class="input-otp" data-input-otp ${attrs}>
        <input class="input-otp-input" data-input-otp-input name="code" value="${value}" />
        <div class="input-otp-group">${slots(n / 2)}</div>
        <div class="input-otp-separator"></div>
        <div class="input-otp-group">${slots(n / 2)}</div>
      </div></form>`;
    initInputOtp(document);
    initInputOtp(document);
    const input = document.querySelector<HTMLInputElement>("[data-input-otp-input]")!;
    const type = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const shown = () => [...document.querySelectorAll(".input-otp-slot")].map((s) => s.textContent).join("");
    return { input, type, shown, otp: document.querySelector<HTMLElement>("[data-input-otp]")! };
  };

  test("sets up the input for one-time codes", () => {
    const { input } = setup();
    expect(input.maxLength).toBe(6);
    expect(input.getAttribute("inputmode")).toBe("numeric");
    expect(input.getAttribute("autocomplete")).toBe("one-time-code");
    expect(input.getAttribute("pattern")).toBe("[0-9]{6}");
  });

  test("keeps digits only and paints the slots", () => {
    const { input, type, shown } = setup();
    type("12a-3 4");
    expect(input.value).toBe("1234");
    expect(shown()).toBe("1234");
    expect(document.querySelectorAll(".input-otp-slot[data-filled]")).toHaveLength(4);
  });

  test("alphanumeric with upper case", () => {
    const { input, type } = setup('data-pattern="alphanumeric" data-case="upper"', 8);
    type("ab-12 cd!34");
    expect(input.value).toBe("AB12CD34");
    expect(input.getAttribute("inputmode")).toBe("text");
  });

  test("a custom character class", () => {
    const { input, type } = setup('data-pattern="[0-9a-f]"');
    type("0xbeefzz");
    expect(input.value).toBe("0beef");
  });

  test("masks characters", () => {
    const { type, shown } = setup("data-mask");
    type("1234");
    expect(shown()).toBe("••••");
  });

  test("pasting a code replaces the value, even when full", () => {
    const { input, otp } = setup();
    input.value = "111111";
    const paste = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, "clipboardData", { value: { getData: () => " 987-654 " } });
    let done = "";
    otp.addEventListener("input-otp:complete", (e) => (done = (e as CustomEvent).detail.value));
    input.dispatchEvent(paste);
    expect(paste.defaultPrevented).toBe(true);
    expect(input.value).toBe("987654");
    expect(done).toBe("987654");
  });

  test("fires input-otp:complete once, and submits with data-submit", () => {
    const { type, otp } = setup("data-submit");
    const form = document.querySelector("form")!;
    let submits = 0;
    let completes = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submits++;
    });
    otp.addEventListener("input-otp:complete", () => completes++);
    type("12345");
    expect(completes).toBe(0);
    type("123456");
    type("123456");
    expect(completes).toBe(1);
    expect(submits).toBe(1);
  });

  test("arrow keys select a slot; typing over it moves on to the next", () => {
    const { input, shown } = setup();
    input.focus();
    input.value = "12345";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.setSelectionRange(5, 5);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true }));
    expect([input.selectionStart, input.selectionEnd]).toEqual([3, 4]);
    // What the browser does when "9" is typed over the selection
    input.value = "12395";
    input.setSelectionRange(4, 4);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: "9" }));
    expect(shown()).toBe("12395");
    expect([input.selectionStart, input.selectionEnd]).toEqual([4, 5]);
  });

  test("fills the slots from a server-rendered value", () => {
    const { shown } = setup("", 6, "42");
    expect(shown()).toBe("42");
  });
});
