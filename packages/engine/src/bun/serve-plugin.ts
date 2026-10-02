// The plugin as Bun.serve loads it: a module whose default export is the plugin,
// listed under [serve.static] plugins in the bunfig.toml that `htmx-ui dev`
// generates (./dev.ts). It reads the project's config from the working directory.
import { loadConfig } from "../core/config";
import { htmxUiPlugin } from "./plugin";

export default htmxUiPlugin(await loadConfig());
