import { describe, expect, test } from "bun:test";
import { collapseBreadcrumb, initBreadcrumb } from "./breadcrumb";

const sep = '<li class="breadcrumb-separator" aria-hidden="true">/</li>';
const crumb = (label: string) => `<li class="breadcrumb-item"><a class="breadcrumb-link" href="/${label}">${label}</a></li>`;

// happy-dom has no layout: each visible <li> is 100px wide, the list `room` px.
const setup = (room: number) => {
  document.body.innerHTML = `
    <nav aria-label="Breadcrumb" data-breadcrumb>
      <ol class="breadcrumb">
        ${crumb("home")}${sep}
        <li class="breadcrumb-item" data-breadcrumb-ellipsis hidden>
          <button class="breadcrumb-ellipsis">…</button><div role="menu" hidden></div>
        </li>
        <li class="breadcrumb-separator" aria-hidden="true" hidden>/</li>
        ${crumb("docs")}${sep}${crumb("components")}${sep}${crumb("forms")}${sep}
        <li class="breadcrumb-item"><span class="breadcrumb-page" aria-current="page">Input</span></li>
      </ol>
    </nav>`;
  const nav = document.querySelector<HTMLElement>("nav")!;
  const list = nav.querySelector<HTMLElement>("ol")!;
  Object.defineProperty(list, "clientWidth", { get: () => room, configurable: true });
  Object.defineProperty(list, "scrollWidth", {
    get: () => [...list.children].filter((li) => !(li as HTMLElement).hidden).length * 100,
  });
  return { nav, list, resize: (w: number) => (room = w) };
};

const visibleLinks = (list: HTMLElement) =>
  [...list.querySelectorAll<HTMLElement>(".breadcrumb-item:not([hidden]) .breadcrumb-link")].map((a) => a.textContent);
const menu = () => [...document.querySelectorAll('[role="menu"] a')].map((a) => [a.textContent, a.getAttribute("href")]);

describe("breadcrumb", () => {
  test("leaves a breadcrumb that fits alone", () => {
    const { list } = setup(2000);
    initBreadcrumb(document);
    expect(visibleLinks(list)).toEqual(["home", "docs", "components", "forms"]);
    expect(document.querySelector<HTMLElement>("[data-breadcrumb-ellipsis]")!.hidden).toBe(true);
  });

  test("hides middle items from the left behind the ellipsis, listing them in its menu", () => {
    const { list } = setup(750);
    initBreadcrumb(document);
    initBreadcrumb(document);
    // 9 visible <li> at first; after hiding docs (+ its separator) and showing the ellipsis
    // (+ separator): 9; after components: 7.
    expect(visibleLinks(list)).toEqual(["home", "forms"]);
    expect(document.querySelector<HTMLElement>("[data-breadcrumb-ellipsis]")!.hidden).toBe(false);
    expect(menu()).toEqual([["docs", "/docs"], ["components", "/components"]]);
    expect(list.lastElementChild!.hasAttribute("hidden")).toBe(false);
  });

  test("shows items again when there is room", () => {
    const { nav, list, resize } = setup(500);
    initBreadcrumb(document);
    expect(visibleLinks(list)).toEqual(["home"]);
    resize(2000);
    collapseBreadcrumb(nav);
    expect(visibleLinks(list)).toEqual(["home", "docs", "components", "forms"]);
    expect(menu()).toEqual([]);
  });
});
