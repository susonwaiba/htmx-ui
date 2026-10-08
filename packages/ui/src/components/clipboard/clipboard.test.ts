import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { initClipboard } from "./clipboard";

let written: string[] = [];
let fail = false;
const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");

beforeEach(() => {
  written = [];
  fail = false;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        if (fail) throw new Error("denied");
        written.push(text);
      },
    },
  });
});
afterEach(() => {
  if (original) Object.defineProperty(navigator, "clipboard", original);
});

const flush = () => new Promise((r) => setTimeout(r, 0));

function setup(html: string) {
  document.body.innerHTML = html;
  initClipboard(document);
  initClipboard(document);
  return document.querySelector<HTMLElement>("[data-clipboard]")!;
}

describe("clipboard", () => {
  test("copies data-clipboard-text once per click and marks the button copied", async () => {
    const button = setup(`<button data-clipboard data-clipboard-text="npm i htmx-ui" data-clipboard-timeout="20"></button>`);
    let detail: { text: string } | undefined;
    button.addEventListener("clipboard:copy", (e) => (detail = (e as CustomEvent).detail));
    button.click();
    await flush();
    expect(written).toEqual(["npm i htmx-ui"]);
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(detail).toEqual({ text: "npm i htmx-ui" });
    await new Promise((r) => setTimeout(r, 40));
    expect(button.hasAttribute("data-copied")).toBe(false);
  });

  test("copies an input's current value from data-clipboard-target", async () => {
    const button = setup(`<input id="key" value="old" /><button data-clipboard data-clipboard-target="#key"></button>`);
    document.querySelector<HTMLInputElement>("#key")!.value = "typed";
    button.click();
    await flush();
    expect(written).toEqual(["typed"]);
  });

  test("copies an element's text, and a tag's [data-clipboard-content]", async () => {
    const button = setup(`<p id="addr">  12 Analytical Way </p><button data-clipboard data-clipboard-target="#addr"></button>
      <button class="tag" data-clipboard><code data-clipboard-content>bun add htmx-ui</code><span>icons</span></button>`);
    button.click();
    await flush();
    document.querySelector<HTMLElement>(".tag")!.click();
    await flush();
    expect(written).toEqual(["12 Analytical Way", "bun add htmx-ui"]);
  });

  test("data-clipboard-target finds the nearest match, from the button outward", async () => {
    setup(`<div class="block"><pre hidden><code>a</code></pre><pre><code>first</code></pre><button data-clipboard data-clipboard-target="pre:not([hidden]) code"></button></div>
      <div class="block"><pre><code>second</code></pre><div><button id="b2" data-clipboard data-clipboard-target="pre:not([hidden]) code"></button></div></div>`);
    document.querySelector<HTMLElement>("[data-clipboard]")!.click();
    await flush();
    document.querySelector<HTMLElement>("#b2")!.click();
    await flush();
    expect(written).toEqual(["first", "second"]);
  });

  test("data-clipboard-url copies the fetched text", async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string) => new Response(url === "/x.md" ? "# X" : "", { status: url === "/x.md" ? 200 : 404 })) as typeof fetch;
    try {
      const button = setup(`<button data-clipboard data-clipboard-url="/x.md"></button><button id="missing" data-clipboard data-clipboard-url="/nope.md"></button>`);
      let detail: { text: string } | undefined;
      button.addEventListener("clipboard:copy", (e) => (detail = (e as CustomEvent).detail));
      button.click();
      await new Promise((r) => setTimeout(r, 20));
      expect(written).toEqual(["# X"]);
      expect(detail).toEqual({ text: "# X" });
      const missing = document.querySelector<HTMLElement>("#missing")!;
      const exec = document.execCommand;
      document.execCommand = (() => false) as typeof document.execCommand;
      missing.click();
      await new Promise((r) => setTimeout(r, 20));
      document.execCommand = exec;
      expect(missing.hasAttribute("data-copy-failed")).toBe(true);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  test("announces the copy in a polite live region", async () => {
    const button = setup(`<button data-clipboard data-clipboard-text="x" data-clipboard-announce="Link copied"></button>`);
    button.click();
    await new Promise((r) => setTimeout(r, 80));
    const status = document.querySelector("[data-clipboard-status]")!;
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("Link copied");
  });

  test("falls back to execCommand when the Clipboard API is refused", async () => {
    fail = true;
    const button = setup(`<button data-clipboard data-clipboard-text="fallback"></button>`);
    let copied = "";
    const exec = document.execCommand;
    document.execCommand = ((cmd: string) => {
      copied = cmd === "copy" ? (document.activeElement as HTMLTextAreaElement)?.value ?? "?" : "";
      return true;
    }) as typeof document.execCommand;
    try {
      button.click();
      await flush();
    } finally {
      document.execCommand = exec;
    }
    expect(button.hasAttribute("data-copied")).toBe(true);
    expect(document.querySelector("textarea")).toBeNull();
    expect(copied).toBe("fallback");
  });

  test("marks a failed copy and fires clipboard:error", async () => {
    fail = true;
    const button = setup(`<button data-clipboard data-clipboard-text="nope"></button>`);
    let errors = 0;
    button.addEventListener("clipboard:error", () => errors++);
    const exec = document.execCommand;
    document.execCommand = (() => false) as typeof document.execCommand;
    try {
      button.click();
      await flush();
    } finally {
      document.execCommand = exec;
    }
    expect(button.hasAttribute("data-copy-failed")).toBe(true);
    expect(button.hasAttribute("data-copied")).toBe(false);
    expect(errors).toBe(1);
  });
});
