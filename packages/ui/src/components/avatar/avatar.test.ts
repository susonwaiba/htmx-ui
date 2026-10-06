import { describe, expect, test } from "bun:test";
import { initAvatar } from "./avatar";

// happy-dom never loads images: every <img> is complete with no size, as if it had failed.
const avatar = (loading: boolean) => {
  document.body.innerHTML = `<span class="avatar"><span class="avatar-fallback">AB</span></span>`;
  const img = document.createElement("img");
  img.className = "avatar-image";
  img.src = "x.png";
  if (loading) Object.defineProperty(img, "complete", { value: false });
  document.querySelector(".avatar")!.prepend(img);
  return img;
};

describe("avatar", () => {
  test("hides an image when it fails to load, and shows it again when a new one loads", () => {
    const img = avatar(true);
    initAvatar(document);
    initAvatar(document);
    expect(img.hasAttribute("data-init")).toBe(true);
    expect(img.hidden).toBe(false);
    img.dispatchEvent(new Event("error"));
    expect(img.hidden).toBe(true);
    img.dispatchEvent(new Event("load"));
    expect(img.hidden).toBe(false);
  });

  test("hides an image that had already failed before init", () => {
    const img = avatar(false);
    initAvatar(document);
    expect(img.hidden).toBe(true);
  });

  test("initialises an image that is itself the root", () => {
    const img = avatar(true);
    initAvatar(img);
    expect(img.hasAttribute("data-init")).toBe(true);
  });
});
