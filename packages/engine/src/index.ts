// htmx-ui-engine: the runtime-agnostic core, for config files and custom tooling.
//   import { defineConfig } from "htmx-ui-engine";          htmx-ui.config.ts
//   import { render, routeFor } from "htmx-ui-engine";      render a template yourself
//   import { createSite } from "htmx-ui-engine";            serve the site from your own server
//   import { definePlugin, editHtml } from "htmx-ui-engine"; write a plugin
// Runtime adapters: "htmx-ui-engine/bun" (Bun plugin) and "htmx-ui-engine/vite" (Vite plugin).
// Server adapters: "htmx-ui-engine/elysia", "/express", "/hono", "/fastify", "/koa".
export {
  defineConfig,
  findConfigFile,
  loadConfig,
  pagesOf,
  renderPage,
  resolveConfig,
  type BuildContext,
  type Handler,
  type Importer,
  type ResolvedConfig,
  type RootSpec,
  type UserConfig,
} from "./core/config";
export { logger, TOPICS, type Debug, type Logger, type Topic } from "./core/debug";
export {
  dedent,
  inlineSvg,
  locate,
  markup,
  normalizeRoots,
  relativeAsset,
  render,
  tryLocate,
  warm,
  type RenderOptions,
  type TemplateRoot,
} from "./core/render";
export { highlight } from "./core/highlight";
export { editHtml, HtmlElement, type HtmlHandlers } from "./core/html";
export { definePlugin, type Command, type CommandContext, type Plugin, type PluginOption } from "./core/plugin";
export { findPages, matchRoute, routeFor, type Page } from "./core/routes";
export { staticFile } from "./core/static";
export { contentType, createSite, type Site, type SiteOptions } from "./core/site";
