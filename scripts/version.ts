// Name the docs version being worked on, at release time.
//
//   bun run version:set 0.2.0
//
// 1. site/data/versions.json: replaces the "next" version with <major.minor> (docs
//    are versioned per minor before 1.0, per major after) and dates it today. This is
//    what `htmx-ui versions:name` (htmx-ui-plugin-versions) does.
// 2. packages/*/package.json: sets every package to the same version.
//
// Run it when you release; `bun run release:check` then verifies one version
// everywhere. Run `bun run docs:archive` afterwards to start the next working version.

import { nameVersion, readVersionsFile, versionId, writeVersionsFile } from "../packages/plugin-versions/src/versions";
import { PACKAGES, SITE } from "./paths";
import { join, resolve } from "node:path";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: bun run version:set <version>   e.g. bun run version:set 0.2.0");
  process.exit(1);
}
const id = versionId(version);

const file = resolve(SITE, "data/versions.json");
try {
  await writeVersionsFile(file, nameVersion(await readVersionsFile(file), id));
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
console.log(`Docs version ${id} named and dated in site/data/versions.json`);

for (const dir of PACKAGES) {
  const path = join(dir, "package.json");
  const pkg = await Bun.file(path).json();
  const text = await Bun.file(path).text();
  await Bun.write(path, text.replace(`"version": "${pkg.version}"`, `"version": "${version}"`));
  console.log(`${pkg.name} ${pkg.version} -> ${version}`);
}

console.log(`
Now add "## ${version}" to CHANGELOG.md and a release to site/data/changelog.json,
then run "bun run release:check" and "bun run docs:archive".`);
