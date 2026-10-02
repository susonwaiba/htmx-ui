// Scaffold a component:
//
//   bun run component:new date-picker              stylesheet only
//   bun run component:new date-picker --behaviour  + TypeScript behaviour and test
//
// Creates src/components/<name>/, imports its CSS in src/styles.css, registers the
// behaviour in initComponents, and adds a docs page stub plus a docs-nav entry.
// The registry test in src/components/index.test.ts fails if these drift apart.

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { PAGES, SITE, SRC } from "./paths";

const [name, ...flags] = process.argv.slice(2);
if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error("Usage: bun run component:new <kebab-case-name> [--behaviour]");
  process.exit(1);
}
const behaviour = flags.includes("--behaviour");
const dir = join(SRC, "components", name);
if (existsSync(dir)) {
  console.error(`src/components/${name}/ already exists`);
  process.exit(1);
}

const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
const title = name.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
const init = `init${pascal}`;
const created: string[] = [];
const write = async (path: string, body: string) => {
  await Bun.write(path, body);
  created.push(path.replace(SRC, "src").replace(SITE, "site"));
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
{% from "macros/docs.html" import demo, classes %}
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

// Docs navigation: Components section, alphabetical after "Overview"
const navFile = join(SITE, "data/docs-nav.json");
const nav = await Bun.file(navFile).json();
const section = nav.sections.find((s: { title: string }) => s.title === "Components");
const [overview, ...rest] = section.items;
rest.push({ title, href: `/docs/components/${name}`, description: `TODO: ${title} description.`, component: true });
rest.sort((a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title));
section.items = [overview, ...rest];
await Bun.write(navFile, JSON.stringify(nav, null, 2) + "\n");

console.log(`Created ${title}:
${created.map((f) => `  ${f}`).join("\n")}
Updated src/styles.css${behaviour ? ", src/components/index.ts" : ""}, site/data/docs-nav.json

Next: fill in the TODOs in the docs page and nav entry, then restart \`bun run dev\` to see /docs/components/${name}.`);
