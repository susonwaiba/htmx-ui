import { describe, expect, test } from "bun:test";
import { queryAll } from "./dom";

describe("queryAll", () => {
  test("includes the root when it matches", () => {
    const root = document.createElement("div");
    root.setAttribute("data-x", "");
    root.innerHTML = "<span data-x></span><span></span>";
    expect(queryAll(root, "[data-x]")).toHaveLength(2);
  });
});
