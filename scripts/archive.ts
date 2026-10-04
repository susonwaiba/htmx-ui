// Freeze the current docs as an older version and start a new one.
//
//   bun run docs:archive
//
// 1. Builds the site (set SITE_URL as for a production build).
// 2. Snapshots dist/docs as the current latest version into site/archive/v<latest>/.
// 3. Marks it archived in site/data/versions.json and starts a new "next".
//
// Run it when you start documenting a release whose docs differ from the current
// ones; usually right after tagging the current release. The new version is not
// numbered yet: `bun run version:set <x.y>` names it when it is released, so the
// next release may turn out to be a patch, a minor or 1.0.

import { $ } from "bun";
import { archiveDocs, NEXT_VERSION, readVersionsFile, versionLabel } from "../site/lib/versions";
import { DIST, SITE } from "./paths";
import { resolve } from "node:path";

const file = resolve(SITE, "data/versions.json");
const data = await readVersionsFile(file);
const current = data.latest;
if (current === NEXT_VERSION) {
  console.error(`v${current} has no release number yet; name it first with "bun run version:set <x.y>"`);
  process.exit(1);
}
if (data.versions.some((v) => v.id === NEXT_VERSION)) {
  console.error(`site/data/versions.json already has a "${NEXT_VERSION}" version; it must be the latest one`);
  process.exit(1);
}

console.log(`Building the site to snapshot ${versionLabel(current)}…`);
await $`bun run build`;

const pages = await archiveDocs({
  dist: DIST,
  id: current,
  // The version opened below is the newer one every frozen page's banner points at.
  newer: { label: NEXT_VERSION, path: "/docs" },
});
console.log(`Archived ${pages.length} pages to site/archive/v${current}/ (served at /docs/v${current})`);

data.versions = data.versions.map((v) => (v.id === current ? { ...v, archived: true } : v));
data.versions.unshift({ id: NEXT_VERSION, label: NEXT_VERSION });
data.latest = NEXT_VERSION;
await Bun.write(file, JSON.stringify(data, null, 2) + "\n");

console.log(`
${NEXT_VERSION} is now the latest docs version. Next:
  - Write docs for it in site/pages/docs.
  - On release, run "bun run version:set <x.y>" (it names ${NEXT_VERSION}, dates it and
    checks the package versions), then "bun run docs:archive" to start the next one.
  - Commit site/archive/v${current}/ and site/data/versions.json.`);