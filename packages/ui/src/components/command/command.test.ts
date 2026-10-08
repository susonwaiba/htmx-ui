import { describe, expect, test } from "bun:test";
import { matchesHotkey } from "../../utils/hotkey";
import { commandMatches, initCommand } from "./command";

const markup = `
  <div class="command" data-command>
    <input class="command-input" data-command-input />
    <div class="command-list">
      <div class="command-group" role="group">
        <div class="command-item" data-value="calendar">Calendar</div>
        <div class="command-item" data-value="emoji" data-keywords="smiley">Search emoji</div>
      </div>
      <div class="command-separator" role="separator"></div>
      <div class="command-group" role="group">
        <div class="command-item" data-value="settings">Settings</div>
        <div class="command-item" data-value="billing" aria-disabled="true">Billing</div>
      </div>
    </div>
    <p class="command-empty" data-command-empty hidden>No results.</p>
  </div>`;

const type = (input: HTMLInputElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event("input"));
};
const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

describe("command", () => {
  test("matches words and letters in order", () => {
    expect(commandMatches("Settings", "stng")).toBe(true);
    expect(commandMatches("Settings", "set")).toBe(true);
    expect(commandMatches("Settings", "gs x")).toBe(false);
  });

  test("filters items, hides empty groups and stray separators, shows the empty state", () => {
    document.body.innerHTML = markup;
    initCommand(document);
    const input = document.querySelector<HTMLInputElement>("input")!;
    const groups = document.querySelectorAll<HTMLElement>(".command-group");
    const separator = document.querySelector<HTMLElement>(".command-separator")!;
    expect(input.getAttribute("role")).toBe("combobox");

    type(input, "smiley");
    expect(groups[0]!.hidden).toBe(false);
    expect(groups[1]!.hidden).toBe(true);
    expect(separator.hidden).toBe(true);
    expect(document.querySelector('[data-value="emoji"]')!.hasAttribute("data-highlighted")).toBe(true);

    type(input, "zzz");
    expect(document.querySelector<HTMLElement>("[data-command-empty]")!.hidden).toBe(false);

    type(input, "");
    expect(separator.hidden).toBe(false);
  });

  test("arrow keys skip disabled items and wrap; Enter selects", () => {
    document.body.innerHTML = markup;
    initCommand(document);
    const input = document.querySelector<HTMLInputElement>("input")!;
    const highlighted = () => document.querySelector<HTMLElement>("[data-highlighted]")?.dataset.value;
    expect(highlighted()).toBe("calendar");
    key(input, "ArrowDown");
    key(input, "ArrowDown");
    expect(highlighted()).toBe("settings");
    key(input, "ArrowDown");
    expect(highlighted()).toBe("calendar");
    expect(input.getAttribute("aria-activedescendant")).toBe(document.querySelector("[data-highlighted]")!.id);

    let selected = "";
    document.addEventListener("command:select", (e) => (selected = (e as CustomEvent).detail.value), { once: true });
    key(input, "Enter");
    expect(selected).toBe("calendar");
  });

  test("hotkeys", () => {
    const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
    const apple = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
    expect(matchesHotkey(e, "mod+k")).toBe(!apple);
    expect(matchesHotkey(e, "ctrl+k")).toBe(true);
    expect(matchesHotkey(e, "ctrl+shift+k")).toBe(false);
  });
});
