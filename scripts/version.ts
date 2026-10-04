// Name the docs version being worked on, at release time.
//
//   bun run version:set 0.2.0
//
// 1. site/data/versions.json: replaces the "next" version with <major.minor> (docs
//    are versioned per minor before 1.0, per major after) and dates it today.
// 2. packages/*/package.json: sets the three packages to the same version.
//
// Run it when you release; `bun run release:check` then verifies one version
// everywhere. Run `bun run docs:archive` afterwards to start the next working version.

import { NEXT_VERSION, readVersionsFile, versionLabel } from "../site/lib/versions";
import { PACKAGES, SITE } from "./paths";
import { join, resolve } from "node:path";

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: bun run version:set <version>   e.g. bun run version:set 0.2.0");
  process.exit(1);
}
const [major = "0", minor = "0"] = version.split(".");
const id = Number(major) >= 1 ? major : `${major}.${minor}`;

const file = resolve(SITE, "data/versions.json");
const data = await readVersionsFile(file);
if (data.latest !== NEXT_VERSION) {
  console.error(`The latest docs version is "${data.latest}", not "${NEXT_VERSION}"; nothing to name`);
  process.exit(1);
}
if (data.versions.some((v) => v.id === id)) {
  console.error(`Version ${id} already exists in site/data/versions.json`);
  process.exit(1);
}

data.versions = data.versions.map((v) =>
  v.id === NEXT_VERSION ? { id, label: versionLabel(id), released: new Date().toISOString().slice(0, 10) } : v,
);
data.latest = id;
await Bun.write(file, JSON.stringify(data, null, 2) + "\n");
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