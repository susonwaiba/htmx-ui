// File-based routing shared by both runtimes' dev servers, the builds and the renderer.
//   index.html -> "/", about.html -> "/about", docs/index.html -> "/docs",
//   docs/changelog/0.1.0.html -> "/docs/changelog/0.1.0"

import { existsSync, globSync } from "node:fs";
import { resolve, sep } from "node:path";

/** Route for a page path relative to the pages directory, using "/" separators. */
export function routeFor(file: string): string {
  const route = "/" + file.replace(/\.html$/, "").replace(/(^|\/)index$/, "");
  return route === "/" ? route : route.replace(/\/$/, "");
}

export interface Page {
  /** Absolute path of the page template. */
  file: string;
  /** Path relative to the pages directory, "/" separators: "docs/index.html". */
  path: string;
  /** Route: "/docs". */
  url: string;
}

/** Every pages/**\/*.html, sorted by route. None when the directory doesn't exist. */
export function findPages(pagesDir: string): Page[] {
  // Bun's globSync throws on a missing cwd where Node's returns nothing; a deployment
  // that forgot its pages has to reach createSite()'s own error, which says what to copy.
  if (!existsSync(pagesDir)) return [];
  return globSync("**/*.html", { cwd: pagesDir })
    .map((rel) => {
      const path = rel.split(sep).join("/");
      return { file: resolve(pagesDir, rel), path, url: routeFor(path) };
    })
    .sort((a, b) => a.url.localeCompare(b.url));
}

/**
 * Match a pathname against a route pattern in Bun.serve's syntax, so dev routes
 * behave the same on both runtimes: "/api/users/:id" (named segment) and
 * "/files/*" (any rest). Returns the params, or null when it doesn't match.
 */
export function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  const want = pattern.split("/");
  const got = pathname.split("/");
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    const w = want[i]!;
    if (w === "*" && i === want.length - 1) return params;
    const g = got[i];
    if (g === undefined) return null;
    if (w.startsWith(":")) params[w.slice(1)] = decodeURIComponent(g);
    else if (w !== g) return null;
  }
  return got.length === want.length ? params : null;
}

/** Static paths win over parameters, parameters over wildcards (as in Bun.serve). */
export function sortRoutes(patterns: string[]): string[] {
  const score = (p: string) => (p.includes("*") ? 2 : p.includes("/:") ? 1 : 0);
  return [...patterns].sort((a, b) => score(a) - score(b) || b.length - a.length);
}
