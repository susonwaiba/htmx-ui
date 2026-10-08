// The htmx-ui-upgrade command (bin/htmx-ui-upgrade.js runs main()).
//
//   npx htmx-ui-upgrade@latest [directory]
//   bunx htmx-ui-upgrade@latest [directory] --dry-run
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { compareVersions, LATEST, MIGRATIONS, upgrade, VERSION, type Report } from "./index";

const HELP = `Usage: htmx-ui-upgrade [directory] [options]

Upgrades the code in directory (default: .) from the htmx-ui version in its package.json
to ${LATEST}, the newest this version of htmx-ui-upgrade knows.

Options:
  --from <version>   the version the code is written for (default: read from package.json)
  --to <version>     upgrade to this version instead (default: ${LATEST})
  --dry-run          show what would change; write nothing
  --force            run even though the git working tree has uncommitted changes
  --list             list the migrations and exit
  -v, --version      show this tool's version
  -h, --help         show this help`;

/** Uncommitted changes under dir, or null when it isn't in a git repository (or git is missing). */
function gitChanges(dir: string) {
  const r = spawnSync("git", ["status", "--porcelain", "--", "."], { cwd: dir, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
}

function print({ from, to, source, migrations, files, warnings, dryRun }: Report) {
  if (compareVersions(from, to) >= 0) {
    console.log(`Already on ${from} (${source}); nothing to upgrade to ${to}.`);
    return;
  }
  console.log(`Upgrading ${from} → ${to} (${source})`);
  console.log(migrations.length ? `Migrations: ${migrations.map((m) => m.version).join(", ")}` : "No breaking changes between these versions.");
  console.log(`\n${dryRun ? "Would change" : "Changed"} ${files.length} file${files.length === 1 ? "" : "s"}${files.length ? ":" : "."}`);
  for (const f of files) {
    console.log(`  ${f.path}`);
    for (const c of f.changes) console.log(`    ${c.description}${c.count > 1 ? ` (${c.count})` : ""}`);
  }
  if (warnings.length) {
    console.log(`\nCheck by hand (${warnings.length}):`);
    for (const w of warnings) console.log(`  ${w.path}:${w.line}  ${w.message}`);
  }
  const notes = migrations.flatMap((m) => (m.notes ?? []).map((n) => `${m.version}: ${n}`));
  if (notes.length) {
    console.log("\nAlso:");
    for (const n of notes) console.log(`  - ${n}`);
  }
  console.log(
    dryRun
      ? "\nDry run: nothing was written."
      : "\nNext: install the new versions with your package manager, then build and check the site. Release notes: https://susonwaiba.github.io/htmx-ui/docs/changelog",
  );
}

/** Runs the command; returns the exit code. */
export async function main(argv = process.argv.slice(2)): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      from: { type: "string" },
      to: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      force: { type: "boolean", default: false },
      list: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });
  if (values.help) return console.log(HELP), 0;
  if (values.version) return console.log(VERSION), 0;
  if (values.list) {
    for (const m of MIGRATIONS) {
      console.log(m.version);
      for (const c of m.changes) console.log(`  ${c.manual ? "reports: " : ""}${c.description}`);
    }
    return 0;
  }
  if (positionals.length > 1) throw new Error(`one directory, not ${positionals.length}\n\n${HELP}`);
  const dir = resolve(positionals[0] ?? ".");
  const dryRun = values["dry-run"];
  if (!dryRun && !values.force && gitChanges(dir)) {
    throw new Error("the git working tree has uncommitted changes. Commit or stash them first so the upgrade is easy to review and undo, or pass --force (or --dry-run)");
  }
  print(upgrade(dir, { from: values.from, to: values.to, dryRun }));
  return 0;
}
