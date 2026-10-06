import { describe, expect, test } from "bun:test";

import { isUrlDataValue } from "./github-pages.ts";

describe("isUrlDataValue", () => {
  test("a data-* URL is rooted at the site", () => {
    expect(isUrlDataValue("/docs/components/button.md")).toBe(true);
    expect(isUrlDataValue("/docs/versions.json")).toBe(true);
    expect(isUrlDataValue("/sitemap.json?x=1#y")).toBe(true);
  });

  test("component state is not rooted", () => {
    expect(isUrlDataValue("README.md")).toBe(false); // data-value in the prompt-input demo
    expect(isUrlDataValue("docs/")).toBe(false);
    expect(isUrlDataValue("src/")).toBe(false);
    expect(isUrlDataValue("@")).toBe(false); // data-prompt-input-menu trigger
    expect(isUrlDataValue("#")).toBe(false);
    expect(isUrlDataValue("<selector>")).toBe(false);
  });

  test("the bare / is a keystroke, not a route", () => {
    expect(isUrlDataValue("/")).toBe(false);
  });

  test("//host is another origin, handled as external", () => {
    expect(isUrlDataValue("//example.com/x.png")).toBe(false);
  });
});
