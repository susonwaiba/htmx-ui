// Site directories, in one place.
import { dirname, resolve } from "node:path";

/** The docs + marketing website. Its engine config is site/htmx-ui.config.ts. */
export const SITE = resolve(import.meta.dir, "..");
/** Repository root. */
export const ROOT = resolve(SITE, "..");
/** Routes: site/pages/**\/*.html */
export const PAGES = resolve(SITE, "pages");
/** Frozen builds of older docs versions, served under /docs/v<version>/ */
export const ARCHIVE = resolve(SITE, "archive");
/** Build output (the repository's dist/, as before the move to workspaces). */
export const DIST = resolve(ROOT, "dist");
/** The htmx-ui package's source as the site resolves it (workspace link to packages/ui). */
export const UI = resolve(dirname(Bun.resolveSync("htmx-ui/package.json", SITE)), "src");
export const ICONS = resolve(UI, "icons");
