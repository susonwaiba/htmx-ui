// htmx-ui-plugin-versions: keep the docs of every release online.
//
//   import { defineConfig } from "htmx-ui-engine";
//   import docs from "htmx-ui-plugin-docs";
//   import versions from "htmx-ui-plugin-versions";
//   export default defineConfig({ plugins: [docs(), versions()] });
//
// The latest docs render live at <prefix> (default /docs). Older versions are frozen
// builds in archive/v<id>/, served at <prefix>/v<id>/ (./versions.ts). The plugin:
//   - serves archived versions in dev and from server adapters (fetch), and copies them
//     into the build (build.done)
//   - publishes <prefix>/versions.json, the manifest the switcher reads at runtime
//   - adds docsVersions() and versions/macros.html (version_switcher(), version_banner())
//   - adds two CLI commands:
//       htmx-ui versions:name <x.y.z>   name the version in development ("next")
//       htmx-ui versions:archive        build, freeze the latest version, start a new "next"
// The browser side is htmx-ui-plugin-versions/client. Used with htmx-ui-plugin-docs, the
// archive also keeps each version's Markdown and sitemap, and site search follows the
// version being read.

import { contentType, definePlugin, pagesOf, type Plugin, type ResolvedConfig } from "htmx-ui-engine";
import { existsSync, readFileSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  archiveDocs,
  archiveFile,
  nameVersion,
  NEXT_VERSION,
  readVersionsFile,
  startNext,
  versionId,
  versionLabel,
  versionPath,
  versionsManifest,
  writeVersionsFile,
  type Manifest,
  type VersionsFile,
} from "./versions";

export * from "./versions";

export interface VersionsOptions {
  /** Route prefix of the docs (the same as htmx-ui-plugin-docs'). Default "/docs". */
  prefix?: string;
  /** The list of versions, relative to the project root. Default "data/versions.json". */
  file?: string;
  /** Where frozen versions are kept, relative to the project root. Default "archive". */
  archive?: string;
}

/** What docsVersions() returns to templates. */
export interface DocsVersions {
  /** Id of the latest version: "next" while it is in development. */
  latest: string;
  /** The version this page belongs to (always the latest: older ones are frozen). */
  current: string;
  /** Its label: "next", "v0.2". */
  label: string;
  /** URL of the published manifest. */
  manifest: string;
  versions: { id: string; label: string; released: string | null; path: string; latest: boolean }[];
}

/** What the versions plugin offers other plugins: `config.plugins.find((p) => p.name === "versions")?.api`. */
export interface VersionsApi {
  readonly prefix: string;
  /** URL of the published manifest, e.g. "/docs/versions.json". */
  readonly manifestUrl: string;
  /** The manifest as published: every version, its path, sitemap and pages. */
  manifest(): Promise<Manifest>;
}

/** The plugin's templates: src/templates, from src/ and from the compiled lib/ alike. */
export const TEMPLATES = fileURLToPath(new URL("../src/templates", import.meta.url));

export function versions(options: VersionsOptions = {}): Plugin & { api: VersionsApi } {
  const prefix = (options.prefix ?? "/docs").replace(/\/$/, "");
  const manifestUrl = `${prefix}/versions.json`;
  let config: ResolvedConfig | null = null;

  const resolved = () => {
    if (!config) throw new Error("[htmx-ui-plugin-versions] used before the config was resolved");
    return config;
  };
  const file = () => resolve(resolved().root, options.file ?? "data/versions.json");
  const archive = () => resolve(resolved().root, options.archive ?? "archive");
  const rel = (path: string) => relative(process.cwd(), path) || ".";

  /** The latest docs' pages: every page under the prefix, from the page files. */
  const latestUrls = () =>
    pagesOf(resolved())
      .map((p) => p.url)
      .filter((url) => url === prefix || url.startsWith(prefix + "/"));
  const manifest = () => versionsManifest(latestUrls(), archive(), file(), prefix);

  return definePlugin({
    name: "versions",
    roots: [TEMPLATES],
    configResolved(c) {
      config = c;
    },
    globals: {
      /** docsVersions(): the versions file as the switcher shows it (see DocsVersions). */
      docsVersions(): DocsVersions {
        // Globals are synchronous: read the (small) file directly, fresh on every render.
        const data = JSON.parse(readFileSync(file(), "utf8")) as VersionsFile;
        const list = data.versions.map((v) => ({
          id: v.id,
          label: v.label,
          released: v.released ?? null,
          path: versionPath(v, data.latest, prefix),
          latest: v.id === data.latest,
        }));
        const label = list.find((v) => v.latest)?.label ?? versionLabel(data.latest);
        return { latest: data.latest, current: data.latest, label, manifest: manifestUrl, versions: list };
      },
    },
    routes: {
      [manifestUrl]: async () =>
        new Response(JSON.stringify(await manifest(), null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } }),
    },
    async fetch(req) {
      // Archived docs versions: /docs/v0.1/...
      const found = archiveFile(new URL(req.url).pathname, archive(), prefix);
      if (!found) return null;
      const head = req.method === "HEAD";
      return new Response(head ? null : await readFile(found), { headers: { "Content-Type": contentType(found) } });
    },
    build: {
      async done({ outDir }) {
        // Older docs versions are frozen snapshots; copy them in as-is.
        if (existsSync(archive())) await cp(archive(), join(outDir, prefix.slice(1)), { recursive: true });
        await mkdir(join(outDir, prefix.slice(1)), { recursive: true });
        await writeFile(join(outDir, manifestUrl.slice(1)), JSON.stringify(await manifest(), null, 2));
        console.log(` -> ${manifestUrl.slice(1)}, archived docs versions`);
      },
    },
    commands: {
      "versions:name": {
        usage: "<x.y.z>",
        description: "name the docs version in development (0.2.0 -> 0.2; from 1.0, 1.4.0 -> 1)",
        async run({ args }) {
          if (!args[0]) throw new Error("Usage: htmx-ui versions:name <x.y.z>   e.g. htmx-ui versions:name 0.2.0");
          const id = versionId(args[0]);
          await writeVersionsFile(file(), nameVersion(await readVersionsFile(file()), id));
          console.log(`Docs version ${id} named and dated in ${rel(file())}.
Next: release it, then run "htmx-ui versions:archive" before writing the next version's docs.`);
        },
      },
      "versions:archive": {
        usage: "[--skip-build]",
        description: "build, freeze the latest docs version, start a new next",
        async run({ config, options: opts, build }) {
          const data = await readVersionsFile(file());
          const next = startNext(data); // refuses an unnamed latest version before anything is built
          const current = data.latest;
          if (!opts["skip-build"]) {
            console.log(`Building the site to snapshot ${versionLabel(current)}…`);
            if (!(await build())) return 1;
          }
          // The version opened below is the newer one every frozen page's banner points at.
          const pages = await archiveDocs({ dist: config.outDir, id: current, newer: { label: NEXT_VERSION, path: prefix }, archive: archive(), prefix });
          await writeVersionsFile(file(), next);
          console.log(`Archived ${pages.length} pages to ${rel(join(archive(), `v${current}`))}/ (served at ${prefix}/v${current})

${NEXT_VERSION} is now the latest docs version. Next:
  - Write docs for it as usual.
  - On release, run "htmx-ui versions:name <x.y.z>", then "htmx-ui versions:archive" again.
  - Commit ${rel(join(archive(), `v${current}`))}/ and ${rel(file())}.`);
        },
      },
    },
    api: { prefix, manifestUrl, manifest },
  });
}

export default versions;
