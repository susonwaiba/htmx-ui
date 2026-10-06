import { describe, expect, test } from "bun:test";
import { initTextarea } from "./textarea";

describe("textarea", () => {
  test("counts characters against maxlength", () => {
    document.body.innerHTML = `
      <div class="field">
        <textarea class="textarea" maxlength="10" data-textarea>abc</textarea>
        <span data-textarea-count></span>
      </div>`;
    initTextarea(document);
    const textarea = document.querySelector("textarea")!;
    const count = document.querySelector<HTMLElement>("[data-textarea-count]")!;
    expect(count.textContent).toBe("3/10");
    textarea.value = "abcdefghij";
    textarea.dispatchEvent(new Event("input"));
    expect(count.textContent).toBe("10/10");
    expect(count.dataset.state).toBe("limit");
  });

  test("Ctrl+Enter submits the form; with data-textarea-submit=enter, Enter does", () => {
    document.body.innerHTML = `
      <form><textarea class="textarea" data-textarea data-textarea-submit></textarea></form>
      <form><textarea class="textarea" data-textarea data-textarea-submit="enter"></textarea></form>`;
    initTextarea(document);
    const submitted: number[] = [];
    document.querySelectorAll("form").forEach((f, i) =>
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        submitted.push(i);
      }),
    );
    const [a, b] = document.querySelectorAll("textarea");
    a!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    a!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true, cancelable: true }));
    b!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true, cancelable: true }));
    b!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    expect(submitted).toEqual([0, 1]);
  });
});
