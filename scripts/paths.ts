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
/** htmx-ui-upgrade: migrates a project's code between versions (packages/upgrade/migrations/). */
export const UPGRADE = resolve(ROOT, "packages/upgrade");
/** The official plugins: htmx-ui-plugin-docs, -versions, -search. */
export const PLUGINS = ["docs", "versions", "search"].map((name) => resolve(ROOT, `packages/plugin-${name}`));
/** The website; its own paths are in site/lib/paths.ts. */
export const SITE = resolve(ROOT, "site");
export const PAGES = resolve(SITE, "pages");
export const DIST = resolve(ROOT, "dist");
/** Published packages, in dependency order (they release together, with one version). */
export const PACKAGES = [UI, ENGINE, ...PLUGINS, CREATE, UPGRADE];
