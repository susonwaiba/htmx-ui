// htmx-ui-engine: the runtime-agnostic core, for config files and custom tooling.
//   import { defineConfig } from "htmx-ui-engine";          htmx-ui.config.ts
//   import { render, routeFor } from "htmx-ui-engine";      render a template yourself
// Runtime adapters: "htmx-ui-engine/bun" (Bun plugin) and "htmx-ui-engine/vite" (Vite plugin).
export {
  defineConfig,
  findConfigFile,
  loadConfig,
  pagesOf,
  renderPage,
  resolveConfig,
  type BuildContext,
  type Handler,
  type ResolvedConfig,
  type UserConfig,
} from "./core/config";
export { dedent, inlineSvg, relativeAsset, render, type RenderOptions } from "./core/render";
export { highlight } from "./core/highlight";
export { findPages, matchRoute, routeFor, type Page } from "./core/routes";
export { staticFile } from "./core/static";
