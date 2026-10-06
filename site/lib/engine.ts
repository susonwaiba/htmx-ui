// The site's resolved engine config, plugins included, for rendering pages outside
// the engine (the site's tests). Always render with renderPage(engine, file), so a
// test sees exactly what the dev server and the build serve: heading ids included.
import { resolveConfig } from "htmx-ui-engine";
import config from "../htmx-ui.config";
import { SITE } from "./paths";

export const engine = resolveConfig(config, SITE);

/** A plugin's api by name, e.g. the docs plugin's pages(). */
export const pluginApi = <T>(name: string) => engine.plugins.find((p) => p.name === name)!.api as T;
