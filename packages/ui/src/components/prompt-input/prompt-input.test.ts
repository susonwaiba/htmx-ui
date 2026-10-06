import { afterEach, describe, expect, test } from "bun:test";
import { initPromptInput } from "./prompt-input";

const markup = `
<form class="prompt-input" data-prompt-input>
  <textarea class="prompt-input-textarea" name="prompt" aria-label="Prompt"></textarea>
  <div class="prompt-input-actions">
    <button class="prompt-input-submit" data-prompt-input-submit aria-label="Send">Send</button>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="@" role="listbox" aria-label="People" hidden>
    <div class="prompt-input-option" role="option" data-value="ada">Ada Lovelace</div>
    <div class="prompt-input-option" role="option" data-value="alan" data-keywords="enigma">Alan Turing</div>
    <div class="prompt-input-option" role="option" data-value="grace">Grace Hopper</div>
    <p class="prompt-input-empty" data-prompt-input-empty hidden>No one found.</p>
  </div>
  <div class="prompt-input-menu" data-prompt-input-menu="/" role="listbox" aria-label="Commands" hidden>
    <div class="prompt-input-option" role="option" data-value="summarize">Summarize</div>
    <div class="prompt-input-option" role="option" data-value="translate">Translate</div>
  </div>
</form>`;

function setup(html = markup) {
  document.body.innerHTML = html;
  initPromptInput(document);
  const form = document.querySelector<HTMLFormElement>("form")!;
  const textarea = form.querySelector("textarea")!;
  const submit = form.querySelector<HTMLButtonElement>("[data-prompt-input-submit]")!;
  const [mentions, commands] = [...form.querySelectorAll<HTMLElement>("[data-prompt-input-menu]")];
  return { form, textarea, submit, mentions: mentions!, commands: commands! };
}

function type(textarea: HTMLTextAreaElement, value: string) {
  textarea.value = value;
  textarea.setSelectionRange(value.length, value.length);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function key(el: HTMLElement, k: string, init: KeyboardEventInit = {}) {
  const e = new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(e);
  return e;
}

const visible = (menu: HTMLElement) =>
  [...menu.querySelectorAll<HTMLElement>('[role="option"]')].filter((o) => !o.hidden).map((o) => o.dataset.value);

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("prompt-input", () => {
  test("initialises once", () => {
    const { form, textarea } = setup();
    let submits = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submits++;
    });
    initPromptInput(document);
    expect(form.hasAttribute("data-init")).toBe(true);
    type(textarea, "hi");
    key(textarea, "Enter");
    expect(submits).toBe(1);
  });

  test("Enter submits, Shift+Enter does not", () => {
    const { form, textarea } = setup();
    let submits = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submits++;
    });
    type(textarea, "Hello");
    expect(key(textarea, "Enter", { shiftKey: true }).defaultPrevented).toBe(false);
    expect(submits).toBe(0);
    expect(key(textarea, "Enter").defaultPrevented).toBe(true);
    expect(submits).toBe(1);
  });

  test("an empty box disables submit and Enter sends nothing", () => {
    const { form, textarea, submit } = setup();
    let submits = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submits++;
    });
    expect(submit.disabled).toBe(true);
    type(textarea, "   ");
    expect(submit.disabled).toBe(true);
    key(textarea, "Enter");
    expect(submits).toBe(0);
    type(textarea, "Hi");
    expect(submit.disabled).toBe(false);
  });

  test("an attachment counts as content", async () => {
    const { form, submit } = setup();
    form.insertAdjacentHTML("afterbegin", '<div class="attachment"></div>');
    await new Promise((r) => setTimeout(r));
    expect(submit.disabled).toBe(false);
  });

  test("@ opens the menu and filters it", () => {
    const { textarea, mentions } = setup();
    expect(textarea.getAttribute("role")).toBe("combobox");
    expect(mentions.hidden).toBe(true);
    type(textarea, "Ask @");
    expect(mentions.hidden).toBe(false);
    expect(textarea.getAttribute("aria-expanded")).toBe("true");
    expect(textarea.getAttribute("aria-controls")).toBe(mentions.id);
    expect(visible(mentions)).toEqual(["ada", "alan", "grace"]);
    type(textarea, "Ask @al");
    expect(visible(mentions)).toEqual(["alan"]);
    type(textarea, "Ask @enig");
    expect(visible(mentions)).toEqual(["alan"]);
    type(textarea, "Ask @zz");
    expect(visible(mentions)).toEqual([]);
    expect(mentions.querySelector<HTMLElement>("[data-prompt-input-empty]")!.hidden).toBe(false);
  });

  test("a menu opens below the box when there is no room above it", () => {
    const { form, textarea, mentions } = setup();
    const at = (top: number) => (form.getBoundingClientRect = () => ({ top, bottom: top + 100 }) as DOMRect);
    Object.defineProperty(mentions, "offsetHeight", { configurable: true, get: () => 200 });
    at(500);
    type(textarea, "Ask @");
    expect(mentions.hasAttribute("data-side")).toBe(false);
    type(textarea, "");
    expect(mentions.hidden).toBe(true);
    at(20);
    type(textarea, "Ask @a");
    expect(mentions.dataset.side).toBe("bottom");
  });

  test("@ inside a word does not open the menu", () => {
    const { textarea, mentions } = setup();
    type(textarea, "me@example");
    expect(mentions.hidden).toBe(true);
  });

  test("keyboard pick inserts the value and fires prompt-input:select", () => {
    const { form, textarea, mentions } = setup();
    let detail: any;
    form.addEventListener("prompt-input:select", (e) => (detail = (e as CustomEvent).detail));
    let submits = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submits++;
    });
    type(textarea, "Ask @");
    const first = mentions.querySelector<HTMLElement>('[data-value="ada"]')!;
    expect(textarea.getAttribute("aria-activedescendant")).toBe(first.id);
    key(textarea, "ArrowDown");
    expect(textarea.getAttribute("aria-activedescendant")).toBe(mentions.querySelector('[data-value="alan"]')!.id);
    key(textarea, "ArrowUp");
    key(textarea, "ArrowUp");
    expect(textarea.getAttribute("aria-activedescendant")).toBe(mentions.querySelector('[data-value="grace"]')!.id);
    key(textarea, "Enter");
    expect(submits).toBe(0);
    expect(textarea.value).toBe("Ask @grace ");
    expect(textarea.selectionStart).toBe("Ask @grace ".length);
    expect(mentions.hidden).toBe(true);
    expect(textarea.getAttribute("aria-expanded")).toBe("false");
    expect(textarea.hasAttribute("aria-activedescendant")).toBe(false);
    expect(detail.trigger).toBe("@");
    expect(detail.value).toBe("grace");
    expect(detail.option).toBe(mentions.querySelector('[data-value="grace"]'));
  });

  test("Tab picks, and a click picks", () => {
    const { textarea, mentions } = setup();
    type(textarea, "@gr");
    key(textarea, "Tab");
    expect(textarea.value).toBe("@grace ");
    type(textarea, "@grace and @a");
    mentions.querySelector<HTMLElement>('[data-value="alan"]')!.click();
    expect(textarea.value).toBe("@grace and @alan ");
  });

  test("picking in the middle of the text replaces the whole query", () => {
    const { textarea } = setup();
    textarea.value = "Ask @ad about this";
    textarea.setSelectionRange(7, 7); // "Ask @ad|"
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    key(textarea, "Enter");
    expect(textarea.value).toBe("Ask @ada about this");
    expect(textarea.selectionStart).toBe("Ask @ada ".length);
  });

  test("Escape closes the menu until the next trigger", () => {
    const { textarea, mentions } = setup();
    type(textarea, "@a");
    expect(mentions.hidden).toBe(false);
    key(textarea, "Escape");
    expect(mentions.hidden).toBe(true);
    type(textarea, "@al");
    expect(mentions.hidden).toBe(true);
    type(textarea, "@al @");
    expect(mentions.hidden).toBe(false);
  });

  test("/ commands only open at the start of the text", () => {
    const { textarea, commands } = setup();
    type(textarea, "Please /sum");
    expect(commands.hidden).toBe(true);
    type(textarea, "/sum");
    expect(commands.hidden).toBe(false);
    expect(visible(commands)).toEqual(["summarize"]);
    key(textarea, "Enter");
    expect(textarea.value).toBe("/summarize ");
  });

  test("loading state follows htmx request events; the button stops", () => {
    const { form, textarea, submit } = setup();
    type(textarea, "Hi");
    form.dispatchEvent(new CustomEvent("htmx:before:request", { bubbles: true, detail: { ctx: {} } }));
    expect(form.dataset.state).toBe("loading");
    expect(submit.disabled).toBe(false);
    expect(submit.getAttribute("aria-label")).toBe("Stop");

    let submits = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submits++;
    });
    key(textarea, "Enter");
    expect(submits).toBe(0);

    let stopped = 0;
    let aborted = 0;
    form.addEventListener("prompt-input:stop", () => stopped++);
    form.addEventListener("htmx:abort", () => aborted++);
    submit.click();
    expect(stopped).toBe(1);
    expect(aborted).toBe(1);
    expect(submits).toBe(0);

    // Aborted: no response, so the text stays.
    form.dispatchEvent(new CustomEvent("htmx:finally:request", { bubbles: true, detail: { ctx: { status: "error: AbortError" } } }));
    expect(form.hasAttribute("data-state")).toBe(false);
    expect(submit.getAttribute("aria-label")).toBe("Send");
    expect(textarea.value).toBe("Hi");
  });

  test("a successful request clears the textarea, unless data-prompt-input-clear=false", () => {
    const { form, textarea, submit } = setup();
    type(textarea, "Hi");
    const ok = { ctx: { status: "swapped", response: { status: 200 } } };
    form.dispatchEvent(new CustomEvent("htmx:before:request", { bubbles: true, detail: { ctx: {} } }));
    form.dispatchEvent(new CustomEvent("htmx:finally:request", { bubbles: true, detail: ok }));
    expect(textarea.value).toBe("");
    expect(submit.disabled).toBe(true);

    form.dataset.promptInputClear = "false";
    type(textarea, "Again");
    form.dispatchEvent(new CustomEvent("htmx:finally:request", { bubbles: true, detail: ok }));
    expect(textarea.value).toBe("Again");
  });

  test("stop without an htmx request clears a loading state the app set", async () => {
    const { form, submit } = setup();
    form.dataset.state = "loading";
    await new Promise((r) => setTimeout(r));
    expect(submit.getAttribute("aria-label")).toBe("Stop");
    submit.click();
    expect(form.hasAttribute("data-state")).toBe(false);
  });

  test("server suggestions: fetched with q and trigger, then shown", async () => {
    const urls: string[] = [];
    globalThis.fetch = (async (url: string) => {
      urls.push(String(url));
      return new Response('<div class="prompt-input-option" role="option" data-value="nepal">Nepal</div>');
    }) as unknown as typeof fetch;
    const { form, textarea } = setup(`
      <form data-prompt-input>
        <textarea></textarea>
        <div data-prompt-input-menu="#" data-prompt-input-src="/api/tags" data-prompt-input-delay="0" hidden></div>
      </form>`);
    const menu = form.querySelector<HTMLElement>("[data-prompt-input-menu]")!;
    type(textarea, "about #ne");
    await new Promise((r) => setTimeout(r, 10));
    expect(urls).toEqual(["/api/tags?q=ne&trigger=%23"]);
    expect(menu.hidden).toBe(false);
    expect(menu.getAttribute("role")).toBe("listbox");
    key(textarea, "Enter");
    expect(textarea.value).toBe("about #nepal ");
  });
});
