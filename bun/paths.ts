// Project directories, in one place.
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dir, "..");
/** The htmx-ui package: components, styles, theme, icons. What package.json exports. */
export const SRC = resolve(ROOT, "src");
/** The docs + marketing website built from this repo. Not published. */
export const SITE = resolve(ROOT, "site");
/** Routes: site/pages/**\/*.html */
export const PAGES = resolve(SITE, "pages");
/** Frozen builds of older docs versions, served under /docs/v<version>/ */
export const ARCHIVE = resolve(SITE, "archive");
export const ICONS = resolve(SRC, "icons");
export const DIST = resolve(ROOT, "dist");

/** Template roots, searched in order: site templates first, then the package's macros. */
export const TEMPLATE_ROOTS = [SITE, SRC];
