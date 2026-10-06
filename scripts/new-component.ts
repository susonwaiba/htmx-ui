// Scaffold a component:
//
//   bun run component:new date-picker              stylesheet only
//   bun run component:new date-picker --behaviour  + TypeScript behaviour and test
//   bun run component:new date-picker --category forms   its group on /docs/components
//                                                  (ids in site/data/component-categories.json)
//
// Creates packages/ui/src/components/<name>/, imports its CSS in packages/ui/src/styles.css,
// registers the behaviour in initComponents, and adds a docs page stub plus a docs-nav entry.
// The registry test in packages/ui/src/components/index.test.ts fails if these drift apart.

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { PAGES, SITE, SRC } from "./paths";

const [name, ...flags] = process.argv.slice(2);
if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error("Usage: bun run component:new <kebab-case-name> [--behaviour] [--category <id>]");
  process.exit(1);
}
const behaviour = flags.includes("--behaviour");
const categoryFlag = flags.indexOf("--category");
const category = categoryFlag >= 0 ? flags[categoryFlag + 1] : undefined;
const categoryIds: string[] = (await Bun.file(join(SITE, "data/component-categories.json")).json()).categories.map(
  (c: { id: string }) => c.id,
);
if (category !== undefined && !categoryIds.includes(category)) {
  console.error(`Unknown category "${category}". One of: ${categoryIds.join(", ")}`);
  process.exit(1);
}
const dir = join(SRC, "components", name);
if (existsSync(dir)) {
  console.error(`packages/ui/src/components/${name}/ already exists`);
  process.exit(1);
}

const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
const title = name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const init = `init${pascal}`;
const created: string[] = [];
const write = async (path: string, body: string) => {
  await Bun.write(path, body);
  created.push(path.replace(SRC, "packages/ui/src").replace(SITE, "site"));
};

await mkdir(dir, { recursive: true });
await write(
  join(dir, `${name}.css`),
  `/* <div class="${name}"${behaviour ? ` data-${name}` : ""}>…</div> */
@layer components {
  .${name} {
    @apply rounded-(--radius) border border-border bg-surface p-4;
  }
}
`,
);

if (behaviour) {
  await write(
    join(dir, `${name}.ts`),
    `// ${title}. Markup: see ${name}.css.
import { queryAll } from "../../utils/dom";

export function ${init}(root: ParentNode) {
  queryAll(root, "[data-${name}]:not([data-init])").forEach((el) => {
    el.dataset.init = "";
    // attach events or logic
  });
}
`,
  );
  await write(
    join(dir, `${name}.test.ts`),
    `import { describe, expect, test } from "bun:test";
import { ${init} } from "./${name}";

describe("${name}", () => {
  test("initialises once", () => {
    document.body.innerHTML = '<div data-${name}></div>';
    ${init}(document);
    ${init}(document);
    expect(document.querySelector("[data-${name}]")!.hasAttribute("data-init")).toBe(true);
  });
});
`,
  );

  // Register: keep imports and calls sorted by component name
  const indexFile = join(SRC, "components/index.ts");
  const index = await Bun.file(indexFile).text();
  const imports = [...index.matchAll(/^import .*;$/gm)].map((m) => m[0]);
  imports.push(`import { ${init} } from "./${name}/${name}";`);
  imports.sort((a, b) => a.split('"')[1]!.localeCompare(b.split('"')[1]!));
  const calls = [...index.matchAll(/^ {2}init\w+\(root\);$/gm)].map((m) => m[0]);
  calls.push(`  ${init}(root);`);
  const next = index
    .replace(/(^import .*;\n)+/m, imports.join("\n") + "\n")
    .replace(/(^ {2}init\w+\(root\);\n)+/m, calls.join("\n") + "\n");
  await Bun.write(indexFile, next);
}

// Import the stylesheet, sorted among the other component imports
const stylesFile = join(SRC, "styles.css");
const styles = await Bun.file(stylesFile).text();
const cssImports = [...styles.matchAll(/^@import "\.\/components\/.*";$/gm)].map((m) => m[0]);
const allCss = [...cssImports, `@import "./components/${name}/${name}.css";`].sort();
await Bun.write(stylesFile, styles.replace(cssImports.join("\n"), allCss.join("\n")));

// Docs page stub
await write(
  join(PAGES, `docs/components/${name}.html`),
  `{% extends "layouts/docs.html" %}
{% from "docs/macros.html" import demo, classes %}
{% set title = "${title}" %}
{% set description = "TODO: one sentence on what ${title.toLowerCase()} is for." %}

{% block content %}
  {% call demo() %}
    <div class="${name}"${behaviour ? ` data-${name}` : ""}>${title}</div>
  {% endcall %}

  <h2 id="reference">Reference</h2>
  {{ classes([
    [".${name}", "TODO"]
  ]) }}
{% endblock %}
`,
);

// Docs navigation: Components section, after "Overview", in its category
const navFile = join(SITE, "data/docs-nav.json");
const nav = await Bun.file(navFile).json();
const section = nav.sections.find((s: { title: string }) => s.title === "Components");
const [overview, ...rest] = section.items;
rest.push({
  title,
  href: `/docs/components/${name}`,
  description: `TODO: ${title} description.`,
  component: true,
  category: category ?? "TODO",
});
// Grouped by category (in component-categories.json order; uncategorised last), A–Z within one,
// so the sidebar, prev/next and llms.txt follow the components page.
const rank = (c?: string) => (c && categoryIds.includes(c) ? categoryIds.indexOf(c) : categoryIds.length);
rest.sort(
  (a: { title: string; category?: string }, b: { title: string; category?: string }) =>
    rank(a.category) - rank(b.category) || a.title.localeCompare(b.title),
);
section.items = [overview, ...rest];
// Written back in the file's own layout: one line per page, so a new entry is a one-line diff.
const line = (item: object) =>
  `{ ${Object.entries(item)
    .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(", ")} }`;
const sections = nav.sections.map(
  (s: { title: string; items: object[] }) =>
    `    {\n      "title": ${JSON.stringify(s.title)},\n      "items": [\n${s.items
      .map((i) => `        ${line(i)}`)
      .join(",\n")}\n      ]\n    }`,
);
await Bun.write(navFile, `{\n  "sections": [\n${sections.join(",\n")}\n  ]\n}\n`);

console.log(`Created ${title}:
${created.map((f) => `  ${f}`).join("\n")}
Updated packages/ui/src/styles.css${behaviour ? ", packages/ui/src/components/index.ts" : ""}, site/data/docs-nav.json

Next: fill in the TODOs in the docs page and nav entry${category ? "" : ` (category: one of ${categoryIds.join(", ")})`}, then restart \`bun run dev\` to see /docs/components/${name}.`);
