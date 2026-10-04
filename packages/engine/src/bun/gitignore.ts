import { readFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";

function parseGitignore(root: string): string[] {
  try {
    const content = readFileSync(resolve(root, ".gitignore"), "utf8");
    const lines = content.split(/\r?\n/);
    const patterns: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      patterns.push(trimmed);
    }
    return patterns;
  } catch {
    return [];
  }
}

// Very simple matcher - skip common patterns
const DEFAULT_IGNORE = [
  "node_modules",
  ".git",
  ".cache",
  "dist",
  "out",
  "lib",
  "coverage",
  "*.tgz",
];

export function createIgnore(root: string) {
  const patterns = [...DEFAULT_IGNORE, ...parseGitignore(root)];
  const ignoreSet = new Set(patterns.filter((p) => !p.includes("*") && !p.includes("/")));
  return (filePath: string): boolean => {
    try {
      const rel = relative(root, filePath);
      if (!rel || rel.startsWith('..')) {
        // If outside root, check basename
        const base = basename(filePath);
        if (ignoreSet.has(base)) return true;
        return false;
      }
      const parts = rel.split(/[/\\]/);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part && ignoreSet.has(part)) return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  };
}
