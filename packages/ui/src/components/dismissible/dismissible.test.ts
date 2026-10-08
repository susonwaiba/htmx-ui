import { describe, expect, test } from "bun:test";
import { initDismissible } from "./dismissible";

describe("dismissible", () => {
  test("any [data-dismiss] inside removes it, including buttons added later", () => {
    document.body.innerHTML = `<div id="a" data-dismissible><button id="one" data-dismiss></button></div>
      <div id="b" data-dismissible><p>x</p></div>`;
    initDismissible(document);
    initDismissible(document);
    document.getElementById("one")!.click();
    expect(document.getElementById("a")).toBeNull();
    const b = document.getElementById("b")!;
    b.insertAdjacentHTML("beforeend", `<button id="late" data-dismiss></button>`);
    document.getElementById("late")!.click();
    expect(document.getElementById("b")).toBeNull();
  });

  test("fires a cancelable dismissible:dismiss first", () => {
    document.body.innerHTML = `<div id="a" data-dismissible><button data-dismiss></button></div>`;
    initDismissible(document);
    const el = document.getElementById("a")!;
    let fired = 0;
    el.addEventListener("dismissible:dismiss", (e) => {
      fired++;
      e.preventDefault();
    });
    el.querySelector("button")!.click();
    expect(fired).toBe(1);
    expect(el.isConnected).toBe(true);
    expect(el.dataset.state).toBeUndefined();
  });

  test("a nested dismissible's button removes only the nested one", () => {
    document.body.innerHTML = `<div id="outer" data-dismissible><div id="inner" data-dismissible><button data-dismiss></button></div></div>`;
    initDismissible(document);
    document.querySelector<HTMLElement>("#inner button")!.click();
    expect(document.getElementById("inner")).toBeNull();
    expect(document.getElementById("outer")).not.toBeNull();
  });
});
