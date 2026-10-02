import { describe, expect, test } from "bun:test";
import { initYear } from "./year";

describe("initYear", () => {
  test("fills every [data-year] element with the current year", () => {
    document.body.innerHTML = "<span data-year></span><span data-year></span>";
    initYear();
    const years = [...document.querySelectorAll("[data-year]")].map((el) => el.textContent);
    expect(years).toEqual([String(new Date().getFullYear()), String(new Date().getFullYear())]);
  });
});
