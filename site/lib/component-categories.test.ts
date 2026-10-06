// The components index and the docs sidebar group components by the "category" on their
// docs-nav entry (site/data/docs-nav.json), in the order of site/data/component-categories.json.
import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { SITE } from "./paths";

const nav = await Bun.file(resolve(SITE, "data/docs-nav.json")).json();
const { categories } = await Bun.file(resolve(SITE, "data/component-categories.json")).json();
const ids: string[] = categories.map((c: { id: string }) => c.id);
const components = nav.sections.flatMap((s: { items: { component?: boolean }[] }) => s.items.filter((i) => i.component));

describe("component categories", () => {
  test("every component belongs to a known category", () => {
    for (const item of components) expect(ids, item.title).toContain(item.category);
  });

  test("every category has components, and ids are unique", () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(components.some((c: { category: string }) => c.category === id), id).toBe(true);
  });

  test("docs-nav lists components by category, A-Z within one, so prev/next follow the groups", () => {
    const key = (c: { category: string; title: string }) => [ids.indexOf(c.category), c.title.toLowerCase()] as const;
    const sorted = [...components].sort((a, b) => {
      const [ca, ta] = key(a);
      const [cb, tb] = key(b);
      return ca - cb || ta.localeCompare(tb);
    });
    expect(components.map((c: { title: string }) => c.title)).toEqual(sorted.map((c: { title: string }) => c.title));
  });
});
