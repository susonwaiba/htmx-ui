// Repository directories, for the repo's own scripts (release check, scaffolding, archiving).
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");
/** htmx-ui: the component library. */
export const UI = resolve(ROOT, "packages/ui");
export const SRC = resolve(UI, "src");
/** htmx-ui-engine: the CLI, Bun plugin and Vite plugin. */
export const ENGINE = resolve(ROOT, "packages/engine");
/** create-htmx-ui: the project scaffolder. */
export const CREATE = resolve(ROOT, "packages/create-htmx-ui");
/** The website; its own paths are in site/lib/paths.ts. */
export const SITE = resolve(ROOT, "site");
export const PAGES = resolve(SITE, "pages");
export const DIST = resolve(ROOT, "dist");
/** Published packages, in dependency order. */
export const PACKAGES = [UI, ENGINE, CREATE];
