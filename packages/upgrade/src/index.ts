// htmx-ui-upgrade: upgrade a project's code to a newer htmx-ui (the CLI is cli.ts).
//
// Reads the htmx-ui version the project is on from its package.json, then runs every
// migration after it up to this package's version (migrations/<version>.ts, one per release
// with breaking changes): class and attribute renames in templates, scripts and stylesheets,
// config keys, removed APIs. It sets the htmx-ui packages in package.json to the new version
// and lists what it couldn't change safely, file by file, for a person to finish.
//
// Node APIs only (it runs from lib/ on Node 18+, and from src/ on Bun).
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { MIGRATIONS } from "./migrations";
import type { Migration } from "./transforms";

export { MIGRATIONS };
export type { Change, Found, Migration } from "./transforms";

/** This package's version (package.json is one level up from src/ and lib/). */
export const VERSION: string = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

/** [major, minor, patch] from "0.2.0", "^0.2.0", "~0.2.1-beta.1", or null. */
export function parseVersion(s: unknown): [number, number, number] | null {
  const m = /(\d+)\.(\d+)\.(\d+)/.exec(String(s ?? ""));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

export function compareVersions(a: string, b: string) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) throw new Error(`not a version: ${x ? b : a}`);
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

/** The newest version this release can upgrade to: its own, or a migration written ahead of the release. */
export const LATEST = MIGRATIONS.map((m) => m.version).reduce((a, b) => (compareVersions(a, b) >= 0 ? a : b), VERSION);

/** The packages that release together, whose ranges package.json gets bumped. */
export const PACKAGES = /^(htmx-ui|htmx-ui-engine|htmx-ui-plugin-[\w-]+)$/;

/** Directories never scanned: dependencies, build output, frozen docs builds (htmx-ui-plugin-versions) and dot-directories (.git, caches). */
const SKIP = new Set(["node_modules", "dist", "build", "lib", "coverage", "archive"]);
const MAX_FILE = 2 * 1024 * 1024;

type Dependencies = Record<string, string>;
interface PackageJson {
  dependencies?: Dependencies;
  devDependencies?: Dependencies;
  peerDependencies?: Dependencies;
}

/** The htmx-ui version a project's package.json depends on: htmx-ui, else the engine, else a plugin. */
export function detectVersion(pkg: PackageJson): { version: string; source: string } | null {
  const deps: Dependencies = { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
  const names = ["htmx-ui", "htmx-ui-engine", ...Object.keys(deps).filter((n) => n.startsWith("htmx-ui-plugin-"))];
  for (const name of names) {
    const v = parseVersion(deps[name]);
    if (v) return { version: v.join("."), source: `${name} ${deps[name]}` };
  }
  return null;
}

/** The migrations that take code on `from` to `to`, oldest first. */
export const pending = (from: string, to: string, migrations = MIGRATIONS) =>
  migrations.filter((m) => compareVersions(m.version, from) > 0 && compareVersions(m.version, to) <= 0);

export interface Applied {
  description: string;
  count: number;
  version?: string;
}

export interface Warning {
  line: number;
  message: string;
  version: string;
}

/** Set the htmx-ui packages' ranges in package.json text to ^to, keeping its formatting. */
export function bumpPackage(text: string, to: string) {
  const changes: Applied[] = [];
  const out = text.replace(/"([\w@/.-]+)"(\s*:\s*)"([\^~]?)(\d+\.\d+\.\d+[^"]*)"/g, (all, name: string, colon: string, prefix: string, version: string) => {
    if (!PACKAGES.test(name) || version === to) return all;
    changes.push({ description: `${name} ${prefix}${version} → ^${to}`, count: 1 });
    return `"${name}"${colon}"^${to}"`;
  });
  return { text: out, changes };
}

const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

/** Run migrations on one file's text: the new text, what changed, and what to check by hand. */
export function migrateText(text: string, path: string, migrations: Migration[]) {
  const changes: Applied[] = [];
  const warnings: Warning[] = [];
  for (const migration of migrations) {
    for (const change of migration.changes) {
      if (!change.files(path)) continue;
      const result = change.apply(text, path);
      text = result.text;
      if (result.count) changes.push({ description: change.description, count: result.count, version: migration.version });
    }
  }
  // Checks run on the result, once every migration has had its say
  const seen = new Set<string>();
  for (const migration of migrations) {
    for (const change of migration.changes) {
      if (!change.check || !change.files(path)) continue;
      for (const { index, message } of change.check(text, path)) {
        const line = lineOf(text, index);
        if (seen.has(`${line}:${message}`)) continue;
        seen.add(`${line}:${message}`);
        warnings.push({ line, message, version: migration.version });
      }
    }
  }
  warnings.sort((a, b) => a.line - b.line);
  return { text, changes, warnings };
}

/** Files under dir worth reading, as paths relative to dir with / separators. */
export function* listFiles(dir: string, base = dir): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name) && !entry.name.startsWith(".")) yield* listFiles(path, base);
    } else if (entry.isFile() && statSync(path).size <= MAX_FILE) {
      yield relative(base, path).split(sep).join("/");
    }
  }
}

export interface UpgradeOptions {
  /** The version the code is written for. Default: read from package.json. */
  from?: string;
  /** Default: LATEST. */
  to?: string;
  /** Report only; write nothing. */
  dryRun?: boolean;
  migrations?: Migration[];
}

export interface Report {
  dir: string;
  from: string;
  to: string;
  /** Where from came from: "htmx-ui ^0.2.0", or "--from". */
  source: string;
  migrations: Migration[];
  files: { path: string; changes: Applied[] }[];
  warnings: (Warning & { path: string })[];
  dryRun: boolean;
}

/** Upgrade the project in dir. Returns a report; writes nothing with dryRun. */
export function upgrade(dir: string, { from, to = LATEST, dryRun = false, migrations = MIGRATIONS }: UpgradeOptions = {}): Report {
  dir = resolve(dir);
  let pkgText: string | null = null;
  try {
    pkgText = readFileSync(join(dir, "package.json"), "utf8");
  } catch {}
  let source = "--from";
  if (!from) {
    if (pkgText === null) throw new Error(`no package.json in ${dir}; pass --from <version>`);
    const detected = detectVersion(JSON.parse(pkgText));
    if (!detected) throw new Error("package.json has no htmx-ui version (a workspace: range?); pass --from <version>");
    ({ version: from, source } = detected);
  }
  if (!parseVersion(from)) throw new Error(`--from ${from} is not a version`);
  if (!parseVersion(to)) throw new Error(`--to ${to} is not a version`);
  if (compareVersions(to, LATEST) > 0) throw new Error(`this htmx-ui-upgrade knows versions up to ${LATEST}; run htmx-ui-upgrade@latest`);

  const report: Report = { dir, from, to, source, migrations: pending(from, to, migrations), files: [], warnings: [], dryRun };
  if (compareVersions(from, to) >= 0) return report;

  for (const path of listFiles(dir)) {
    const file = join(dir, path);
    const before = readFileSync(file, "utf8");
    if (before.includes("\0")) continue; // binary
    let { text, changes, warnings } = migrateText(before, path, report.migrations);
    if (path === "package.json") {
      const bumped = bumpPackage(text, to);
      text = bumped.text;
      changes = [...changes, ...bumped.changes];
    }
    if (changes.length) {
      report.files.push({ path, changes });
      if (!dryRun && text !== before) writeFileSync(file, text);
    }
    for (const w of warnings) report.warnings.push({ path, ...w });
  }
  return report;
}
