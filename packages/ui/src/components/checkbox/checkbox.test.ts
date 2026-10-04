import { describe, expect, test } from "bun:test";
import { initCheckbox } from "./checkbox";

describe("checkbox", () => {
  test("sets the mixed state from data-indeterminate", () => {
    document.body.innerHTML = '<input class="checkbox" type="checkbox" data-indeterminate />';
    initCheckbox(document);
    const box = document.querySelector<HTMLInputElement>(".checkbox")!;
    expect(box.indeterminate).toBe(true);
    expect(box.checked).toBe(false);
  });

  test("leaves a plain checkbox alone", () => {
    document.body.innerHTML = '<input class="checkbox" type="checkbox" checked />';
    initCheckbox(document);
    const box = document.querySelector<HTMLInputElement>(".checkbox")!;
    expect(box.indeterminate).toBe(false);
    expect(box.checked).toBe(true);
    expect(box.hasAttribute("data-init")).toBe(false);
  });

  test("is idempotent, and clears the mixed state on change", () => {
    document.body.innerHTML = '<input class="checkbox" type="checkbox" data-indeterminate />';
    initCheckbox(document);
    initCheckbox(document);
    const box = document.querySelector<HTMLInputElement>(".checkbox")!;
    expect(box.hasAttribute("data-init")).toBe(true);

    box.click();
    expect(box.checked).toBe(true);
    expect(box.indeterminate).toBe(false);
  });

  test("initialises a checkbox that is itself the root, as after an htmx swap", () => {
    const box = document.createElement("input");
    box.type = "checkbox";
    box.className = "checkbox";
    box.setAttribute("data-indeterminate", "");
    document.body.append(box);

    initCheckbox(box);
    expect(box.indeterminate).toBe(true);
  });
});