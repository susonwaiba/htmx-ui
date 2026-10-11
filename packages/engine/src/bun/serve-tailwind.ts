// bun-plugin-tailwind as Bun.serve loads it in dev, listed in the bunfig.toml that
// `htmx-ui dev` generates (./dev.ts), after ./serve-plugin.ts.
//
// The dev server runs from the directory holding the project and its linked
// packages (../core/workspace.ts), not the project itself, and Bun.serve gives the
// plugin no root: so this hands it the project's (./tailwind.ts), or a stylesheet
// with no source(...) would have Tailwind scan every package in the workspace.
import type { BunPlugin } from "bun";
import { rootedTailwind } from "./tailwind";

const root = process.env.HTMX_UI_ROOT ?? process.cwd();
const tailwind = (await import(Bun.resolveSync("bun-plugin-tailwind", root))).default as BunPlugin;

export default rootedTailwind(tailwind, root) satisfies BunPlugin;
