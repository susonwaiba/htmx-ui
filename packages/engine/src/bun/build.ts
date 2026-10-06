// `htmx-ui build` on Bun: every page is a Bun.build HTML entrypoint, rendered by
// the htmx-ui plugin, then Tailwind; the public directory is copied over as-is.
// Pages keep their paths (docs/intro.html); scripts, styles and assets go to
// assets/ with content hashes, shared by every page that uses them (./chunks.ts).
import { cp, rm } from "node:fs/promises";
import { relative } from "node:path";
import { pagesOf, type ResolvedConfig } from "../core/config";
import { writeNotFound } from "../core/not-found";
import { applyVersions } from "../core/ver";
import { optimizeChunks } from "./chunks";
import { htmxUiPlugin, PUBLIC_ORIGIN } from "./plugin";

export async function build(config: ResolvedConfig): Promise<boolean> {
  const { outDir } = config;
  const opts = config.user.build ?? {};
  const pages = pagesOf(config);
  const start = performance.now();
  config.debug.log("build", `building ${pages.length} pages into ${outDir}`);
  await rm(outDir, { recursive: true, force: true });

  const plugins = [htmxUiPlugin(config)];
  try {
    plugins.push((await import(Bun.resolveSync("bun-plugin-tailwind", config.root))).default);
  } catch {
    console.warn("htmx-ui: bun-plugin-tailwind is not installed; building without Tailwind (bun add -d bun-plugin-tailwind tailwindcss)");
  }

  // Bun.build throws on a failed bundle; its errors (an unresolved import, a syntax
  // error) are on the AggregateError, not in its message, so print them.
  const result = await Bun.build({
    entrypoints: pages.map((p) => p.file),
    root: config.pagesDir,
    outdir: outDir,
    target: "browser",
    minify: opts.minify ?? true,
    splitting: true,
    naming: { entry: "[dir]/[name].[ext]", chunk: "assets/[name]-[hash].[ext]", asset: "assets/[name]-[hash].[ext]" },
    sourcemap: opts.sourcemap ?? "linked",
    plugins,
    define: { "process.env.NODE_ENV": JSON.stringify("production"), ...opts.define },
  }).catch((e: unknown) => {
    if (!(e instanceof AggregateError)) throw e;
    console.error("Build failed:");
    for (const error of e.errors) console.error(error);
    return null;
  });
  if (!result) return false;
  if (!result.success) {
    console.error("Build failed:");
    for (const log of result.logs) console.error(log);
    return false;
  }

  const removed = new Set(optimizeChunks(result.outputs.map((o) => o.path)));
  const outputs = result.outputs.filter((o) => !removed.has(o.path));

  // Both post-processing passes on the built pages, after optimizeChunks (it matches
  // script srcs as plain strings): links to public files were given a placeholder origin
  // so Bun would leave them alone, and assetVer()'s ?ver= was parked in a data-ver
  // attribute while Bun bundled the page (./plugin.ts). Bun keeps that attribute on the
  // tags it passes through (img, source, iframe) but not on the ones it rewrites.
  for (const output of outputs) {
    if (!output.path.endsWith(".html")) continue;
    const html = await Bun.file(output.path).text();
    const settled = applyVersions(config.publicDir ? html.replaceAll(PUBLIC_ORIGIN, "") : html);
    if (settled !== html) await Bun.write(output.path, settled);
  }
  if (config.publicDir) await cp(config.publicDir, outDir, { recursive: true });
  // After public/, which may hold the project's own 404.html.
  writeNotFound(outDir);
  await opts.done?.({ config, outDir, pages });

  for (const output of outputs) {
    if (output.path.endsWith(".map")) continue;
    console.log(` -> ${relative(process.cwd(), output.path)} (${(output.size / 1024).toFixed(1)} KB)`);
  }
  const done = (performance.now() - start).toFixed(0);
  config.debug.log("build", `build done: ${outputs.length} files in ${done}ms`, { pages: pages.length });
  return true;
}
