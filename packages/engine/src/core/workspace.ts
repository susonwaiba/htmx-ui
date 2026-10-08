// Where a project's linked packages live, for the dev server.
//
// A dependency installed from a registry sits under node_modules and never changes
// while you work. One linked into node_modules from elsewhere (a workspace package,
// `file:` or `link:`) is source you may be editing, like htmx-ui's own packages are
// for its website. Bun.serve only reliably notices edits to files under its working
// directory: outside it, it sees the first change to a file and misses the next ones,
// and misses a save that replaces the file outright. So `htmx-ui dev` (./dev.ts) runs
// the server from the directory that holds the project and every linked package,
// and the dev server (./dev-server.ts) watches those packages for the stylesheets
// that only Tailwind reads.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, parse, resolve, sep } from "node:path";

type Manifest = { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; optionalDependencies?: Record<string, string> };

function manifest(dir: string): Manifest {
  try {
    return JSON.parse(readFileSync(resolve(dir, "package.json"), "utf8"));
  } catch {
    return {};
  }
}

/** Where `name` is installed for code in `dir`: the nearest node_modules/<name>, like Node's resolution. */
function installed(dir: string, name: string): string | null {
  for (let d = dir; ; d = dirname(d)) {
    const candidate = resolve(d, "node_modules", name);
    if (existsSync(candidate)) return candidate;
    if (dirname(d) === d) return null;
  }
}

/** The directory of the package.json nearest `dir`: a project root such as web/ often has none of its own. */
function owner(dir: string): string | null {
  for (let d = dir; ; d = dirname(d)) {
    if (existsSync(resolve(d, "package.json"))) return d;
    if (dirname(d) === d) return null;
  }
}

/**
 * The real directories of the packages linked into a project (by the package.json
 * nearest its root), and of the packages linked into those (their dependencies,
 * not their dev tooling). Registry installs, whose real path is inside a
 * node_modules, are left out.
 */
export function linkedPackages(root: string): string[] {
  const found = new Set<string>();
  const visit = (dir: string, deps: Record<string, string>) => {
    for (const name of Object.keys(deps)) {
      const link = installed(dir, name);
      if (!link) continue;
      let real: string;
      try {
        real = realpathSync(link);
      } catch {
        continue;
      }
      if (real.split(sep).includes("node_modules") || found.has(real) || real === root) continue;
      found.add(real);
      const m = manifest(real);
      visit(real, { ...m.dependencies, ...m.optionalDependencies });
    }
  };
  const dir = owner(root);
  if (!dir) return [];
  const own = manifest(dir);
  visit(dir, { ...own.dependencies, ...own.devDependencies, ...own.optionalDependencies });
  return [...found].sort();
}

/** The deepest directory containing every one of `dirs`. */
export function commonAncestor(dirs: string[]): string {
  const split = (d: string) => resolve(d).split(sep);
  let common = split(dirs[0]!);
  for (const dir of dirs.slice(1)) {
    const parts = split(dir);
    let i = 0;
    while (i < common.length && i < parts.length && common[i] === parts[i]) i++;
    common = common.slice(0, i);
  }
  return common.join(sep) || parse(resolve(dirs[0]!)).root;
}

/**
 * The working directory for the dev server: the project root, widened to take in
 * its linked packages. Never the filesystem root: packages linked from that far
 * apart keep the old behaviour (edits to them may need a restart) rather than
 * having Bun treat the whole disk as the project.
 */
export function serveRoot(root: string, linked = linkedPackages(root)): string {
  const dir = commonAncestor([root, ...linked]);
  return dir === parse(dir).root ? root : dir;
}
