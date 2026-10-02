import { describe, expect, test } from "bun:test";
import { initSidebar } from "./sidebar";

describe("sidebar", () => {
  test("sidebar toggle opens and Escape closes", () => {
    document.body.innerHTML = `
      <button data-sidebar-toggle aria-controls="nav" aria-expanded="false"></button>
      <div><aside id="nav" data-sidebar><a href="#x">x</a></aside><div data-sidebar-close></div></div>`;
    initSidebar(document);
    const toggle = document.querySelector<HTMLElement>("[data-sidebar-toggle]")!;
    const nav = document.getElementById("nav")!;
    toggle.click();
    expect(nav.hasAttribute("data-open")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(nav.hasAttribute("data-open")).toBe(false);
    toggle.click();
    document.querySelector<HTMLElement>("[data-sidebar-close]")!.click();
    expect(nav.hasAttribute("data-open")).toBe(false);
  });
});
