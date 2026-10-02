// Freeze the current docs as an older version and start a new one.
//
//   bun run docs:archive 0.2
//
// 1. Builds the site (set SITE_URL as for a production build).
// 2. Snapshots dist/docs as the current latest version into site/archive/v<latest>/.
// 3. Marks it archived in site/data/versions.json and adds <next> as the new latest.
//
// Run it when you start documenting a release whose docs differ from the current
// ones; usually right after tagging the current release.

import { $ } from "bun";
import { archiveDocs, readVersionsFile } from "../site/lib/versions";
import { DIST, SITE } from "./paths";
import { resolve } from "node:path";

const next = process.argv[2];
if (!next || !/^\d+(\.\d+)*$/.test(next)) {
  console.error("Usage: bun run docs:archive <next-version>   e.g. bun run docs:archive 0.2");
  process.exit(1);
}

const file = resolve(SITE, "data/versions.json");
const data = await readVersionsFile(file);
const current = data.latest;
if (data.versions.some((v) => v.id === next)) {
  console.error(`Version ${next} already exists in site/data/versions.json`);
  process.exit(1);
}

console.log(`Building the site to snapshot v${current}…`);
await $`bun run build`;

const pages = await archiveDocs({ dist: DIST, id: current });
console.log(`Archived ${pages.length} pages to site/archive/v${current}/ (served at /docs/v${current})`);

data.versions = data.versions.map((v) => (v.id === current ? { ...v, archived: true } : v));
data.versions.unshift({ id: next, label: `v${next}` });
data.latest = next;
await Bun.write(file, JSON.stringify(data, null, 2) + "\n");

console.log(`
v${next} is now the latest docs version. Next:
  - Bump "version" in packages/*/package.json when you release ${next}.
  - Set "released" for v${next} in site/data/versions.json at release time.
  - Commit site/archive/v${current}/ and site/data/versions.json.`);
