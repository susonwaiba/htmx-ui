// Everything that must pass before publishing htmx-ui, htmx-ui-engine, the plugins, create-htmx-ui and htmx-ui-upgrade.
//
//   bun run release:check
//
// 1. Typecheck, tests, docs-site build, package builds (packages/*/lib).
// 2. Repo rules: no template syntax in built pages; the UI package never imports the
//    site, the scripts or the engine; one version across the packages, in the changelog;
//    a release with breaking changes has an htmx-ui-upgrade migration.
// 3. Pack each package's real tarball and check what's in it.
// 4. Smoke tests against the tarballs (need network access to install from npm):
//    - the UI package alone in a Bun.build project, and its compiled lib/ on Node;
//    - the engine's lib/ on Node: createSite() and the server adapters, with no
//      framework installed, so they must not import one;
//    - a site scaffolded by create-htmx-ui for each package manager on PATH, built
//      and typechecked: bun (Bun runtime), and npm, pnpm, yarn (Node runtime, Vite);
//      then the same site with the docs, versions and search plugins: built, a docs
//      version named and archived with their CLI commands, on that runtime.

import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NEXT_VERSION } from "../packages/plugin-versions/src/versions";
import { MIGRATIONS } from "../packages/upgrade/src/migrations";
import { CREATE, DIST, ENGINE, PACKAGES, PLUGINS, ROOT, SRC, UI, UPGRADE } from "./paths";

let failed = false;

async function step(name: string, fn: () => Promise<void>) {
  process.stdout.write(`• ${name} … `);
  try {
    await fn();
    console.log("ok");
  } catch (e) {
    failed = true;
    console.log("FAILED");
    console.error(e instanceof Error ? e.message : e);
  }
}

const quiet = (cmd: ReturnType<typeof $>) => cmd.quiet();
const read = (dir: string) => Bun.file(join(dir, "package.json")).json();
const ui = await read(UI);
const version: string = ui.version;

await step("typecheck", () => quiet($`bun run typecheck`.cwd(ROOT)).then(() => {}));
await step("tests", () => quiet($`bun test`.cwd(ROOT)).then(() => {}));
await step("docs site build", () => quiet($`bun run build`.cwd(ROOT)).then(() => {}));
await step("package builds (packages/ui/lib, packages/engine/lib, packages/plugin-*/lib)", () => quiet($`bun run build:lib`.cwd(ROOT)).then(() => {}));

await step("no template syntax in built pages", async () => {
  const leaks: string[] = [];
  for await (const f of new Bun.Glob("**/*.html").scan(DIST)) {
    if (/\{[%{#]/.test(await Bun.file(join(DIST, f)).text())) leaks.push(f);
  }
  if (leaks.length) throw new Error(`template syntax in: ${leaks.join(", ")}`);
});

await step("packages/ui/src does not import the site, scripts or the engine", async () => {
  const bad: string[] = [];
  for await (const f of new Bun.Glob("**/*.{ts,css,html}").scan(SRC)) {
    const text = await Bun.file(join(SRC, f)).text();
    if (/(from|import|@import)\s+["']((\.\.\/)+(site|scripts|engine)\/|htmx-ui-engine)/.test(text)) bad.push(f);
  }
  if (bad.length) throw new Error(bad.join(", "));
});

await step(`every package is ${version}, and ${version} is in CHANGELOG.md and site/data/versions.json`, async () => {
  for (const dir of PACKAGES) {
    const pkg = await read(dir);
    if (pkg.version !== version) throw new Error(`${pkg.name} is ${pkg.version}, htmx-ui is ${version} (packages release together)`);
  }
  const changelog = await Bun.file(join(ROOT, "CHANGELOG.md")).text();
  if (!changelog.includes(`## ${version}`)) throw new Error(`CHANGELOG.md has no "## ${version}" section`);
  const versions = await Bun.file(join(ROOT, "site/data/versions.json")).json();
  const docs = (versions.versions as { id: string; released?: string }[]).find((v) => v.id === NEXT_VERSION);
  if (docs) throw new Error(`site/data/versions.json still has the "${NEXT_VERSION}" docs version; run "bun run version:set ${version}"`);
  const minor = version.split(".").slice(0, 2).join(".");
  if (!(versions.versions as { id: string }[]).some((v) => v.id === minor)) throw new Error(`no docs version ${minor}`);
});

await step(`htmx-ui-upgrade has a migration for ${version} if it has breaking changes`, async () => {
  const changelog = await Bun.file(join(ROOT, "CHANGELOG.md")).text();
  const section = changelog.split(/^## /m).find((s) => s.startsWith(`${version} `) || s.startsWith(`${version}\n`)) ?? "";
  const migration = join(UPGRADE, `src/migrations/${version}.ts`);
  if (/^### Breaking/m.test(section) && !(await Bun.file(migration).exists())) {
    throw new Error(`CHANGELOG.md lists breaking changes for ${version} but packages/upgrade/src/migrations/${version}.ts doesn't exist (see AGENTS.md, Releasing a Version)`);
  }
  const listed = MIGRATIONS.map((m) => m.version);
  for await (const f of new Bun.Glob("*.ts").scan(join(UPGRADE, "src/migrations"))) {
    if (f !== "index.ts" && !listed.includes(f.slice(0, -3))) throw new Error(`packages/upgrade/src/migrations/${f} is not listed in src/migrations/index.ts`);
  }
});

const work = await mkdtemp(join(tmpdir(), "htmx-ui-release-"));
const tarballs: Record<string, string> = {};

/** Pack a package and check its tarball has `must` and nothing matching `forbidden`. */
async function pack(dir: string, must: string[], peers: string[] = []) {
  const pkg = await read(dir);
  await quiet($`bun pm pack --destination ${work} --ignore-scripts`.cwd(dir));
  const tarball = join(work, `${pkg.name}-${pkg.version}.tgz`);
  const files = (await $`tar -tzf ${tarball}`.text()).split("\n").filter(Boolean).map((f) => f.replace(/^package\//, ""));
  const missing = must.filter((f) => !files.includes(f));
  const forbidden = files.filter((f) => /\.test\.ts$|^node_modules\/|^dist\/|(^|\/)\.cache\//.test(f));
  if (missing.length) throw new Error(`missing from ${pkg.name}: ${missing.join(", ")}`);
  if (forbidden.length) throw new Error(`should not be in ${pkg.name}: ${forbidden.join(", ")}`);
  const manifest = JSON.parse(await $`tar -xOzf ${tarball} package/package.json`.text());
  const workspace = Object.entries({ ...manifest.dependencies, ...manifest.devDependencies }).filter(([, v]) => String(v).startsWith("workspace:"));
  if (workspace.length) throw new Error(`${pkg.name} still has workspace: dependencies: ${workspace.map(([k]) => k).join(", ")}`);
  // `bun pm pack` rewrites `workspace:` from bun.lock, so a lockfile that still
  // records the previous version packs peer ranges for it: npm then refuses the
  // tree (ERESOLVE) deep in the plugin smoke tests instead of saying so here.
  for (const dep of peers) {
    const range = manifest.peerDependencies?.[dep];
    if (range !== `^${version}`) throw new Error(`${pkg.name} peers ${dep}@${range ?? "none"}, expected ^${version} (stale bun.lock? run bun install)`);
  }
  tarballs[pkg.name] = tarball;
  console.log(`(${files.length} files)`);
}

await step("pack htmx-ui", () =>
  pack(UI, ["package.json", "README.md", "LICENSE", "lib/index.js", "lib/index.d.ts", "lib/theme.js", "lib/theme.d.ts", "src/styles.css", "src/components/button/button.css", "src/components/icon/icon.html", "src/icons/sun.svg"]),
);
await step("pack htmx-ui-engine", () =>
  pack(ENGINE, ["package.json", "README.md", "LICENSE", "bin/htmx-ui.js", "lib/index.js", "lib/index.d.ts", "lib/node/index.js", "lib/node/vite-plugin.js", "lib/node/vite-plugin.d.ts", "lib/express.js", "lib/elysia.js", "lib/hono.js", "lib/fastify.js", "lib/koa.js", "src/bun/cli.ts", "src/bun/plugin.ts", "src/core/render.ts", "src/core/site.ts"]),
);
for (const dir of PLUGINS) {
  const name = dir.split("/").pop()!.replace("plugin-", "");
  await step(`pack htmx-ui-plugin-${name}`, () =>
    pack(dir, ["package.json", "README.md", "LICENSE", "lib/index.js", "lib/index.d.ts", "lib/client.js", "lib/client.d.ts", "src/index.ts", "src/client.ts", "src/styles.css", `src/templates/${name}/macros.html`], ["htmx-ui", "htmx-ui-engine"]),
  );
}
await step("pack create-htmx-ui", () =>
  pack(CREATE, ["package.json", "README.md", "LICENSE", "index.js", "template/_gitignore", "template/htmx-ui.config.ts", "template/pages/index.html"]),
);

await step("pack htmx-ui-upgrade", () => pack(UPGRADE, ["package.json", "README.md", "LICENSE", "bin/htmx-ui-upgrade.js", "lib/index.js", "lib/index.d.ts", "lib/cli.js", "src/index.ts", "src/migrations/index.ts"]));

const failIfNot = (r: { exitCode: number; stdout: Buffer; stderr: Buffer }, what: string) => {
  if (r.exitCode !== 0) throw new Error(`${what} failed:\n${r.stdout}${r.stderr}`.slice(0, 4000));
};

/** The built CSS has the library's tokens and component classes, and Tailwind's from its macros. */
async function checkCss(out: string, needles = [".btn-primary", ".prose", "--primary", "--tw-prose-body"]) {
  let css = "";
  for await (const f of new Bun.Glob("**/*.css").scan(out)) css += await Bun.file(join(out, f)).text();
  for (const needle of needles) if (!css.includes(needle)) throw new Error(`built CSS in ${out} is missing ${needle}`);
}

await step("smoke test: htmx-ui alone in a Bun.build project, and its lib/ on Node", async () => {
  const app = join(work, "ui-only");
  await Bun.write(join(app, "package.json"), JSON.stringify({ name: "smoke", private: true, type: "module" }));
  await Bun.write(join(app, "styles.css"), `@import "tailwindcss";\n@import "htmx-ui/styles.css";\n@source "./";\n`);
  await Bun.write(
    join(app, "app.ts"),
    `import "htmx.org";\nimport "./styles.css";\nimport { initComponents } from "htmx-ui";\nimport { initTheme, getTheme } from "htmx-ui/theme";\n` +
      `const t: "light" | "dark" = getTheme();\ninitTheme(); initComponents(document); console.log(t);\n`,
  );
  await Bun.write(
    join(app, "index.html"),
    `<!doctype html><html><head><script type="module" src="./app.ts"></script></head>` +
      `<body class="bg-background"><button class="btn btn-primary">x</button><article class="prose"><p>Hi</p></article></body></html>`,
  );
  await quiet($`bun add ${tarballs["htmx-ui"]!} htmx.org@^4.0.0 tailwindcss bun-plugin-tailwind`.cwd(app));
  await Bun.write(
    join(app, "build.ts"),
    `import tailwind from "bun-plugin-tailwind";\n` +
      `const r = await Bun.build({ entrypoints: ["./index.html"], outdir: "./out", plugins: [tailwind] });\n` +
      `if (!r.success) { console.error(r.logs); process.exit(1); }\n`,
  );
  await quiet($`bun run build.ts`.cwd(app));
  await checkCss(join(app, "out"));
  failIfNot(await $`bunx tsc --noEmit --strict --module preserve --moduleResolution bundler --target esnext --lib esnext,dom app.ts`.cwd(app).quiet().nothrow(), "consumer typecheck");
  // Node resolves the "default" condition: lib/, which must export what the types promise
  const node = await $`node --input-type=module -e ${'const m = await import("htmx-ui"); const t = await import("htmx-ui/theme"); if (typeof m.initComponents !== "function" || typeof t.initTheme !== "function") { console.error(Object.keys(m), Object.keys(t)); process.exit(1); }'}`
    .cwd(app)
    .quiet()
    .nothrow();
  failIfNot(node, "importing htmx-ui's lib/ on Node");
});

await step("smoke test: htmx-ui-engine's lib/ on Node (createSite + server adapters, no framework installed)", async () => {
  const app = join(work, "engine-only");
  await Bun.write(join(app, "package.json"), JSON.stringify({ name: "smoke-engine", private: true, type: "module" }));
  // @types/node: the adapters' lib/*.d.ts are typed with node:http, like any Node middleware.
  await quiet($`bun add -d @types/node`.cwd(app));
  await quiet($`bun add ${tarballs["htmx-ui-engine"]!}`.cwd(app));
  // A consumer that imports every server entry point; it must typecheck without
  // express, elysia, hono, fastify or koa in the project, because the adapters never import them.
  await Bun.write(
    join(app, "server.ts"),
    `import { createSite } from "htmx-ui-engine";\n` +
      `import { htmxUi as expressUi } from "htmx-ui-engine/express";\n` +
      `import { htmxUi as elysiaUi } from "htmx-ui-engine/elysia";\n` +
      `import { htmxUi as honoUi } from "htmx-ui-engine/hono";\n` +
      `import { htmxUi as fastifyUi } from "htmx-ui-engine/fastify";\n` +
      `import { htmxUi as koaUi } from "htmx-ui-engine/koa";\n` +
      `const site = await createSite();\n` +
      `const handlers = [expressUi({ site }), elysiaUi({ site }), honoUi({ site }), fastifyUi({ site }), koaUi({ site })];\n` +
      `const html: string = await site.render(site.pages[0]!.path);\n` +
      `const fragment: string = site.fragment("partials/x.html");\n` +
      `const served: Response = await site.handle(new Request("https://example.com/"));\n` +
      `console.log(handlers.length, html.length, fragment.length, served.status);\n`,
  );
  failIfNot(
    await $`bunx tsc --noEmit --strict --module preserve --moduleResolution bundler --target esnext --lib esnext,dom server.ts`.cwd(app).quiet().nothrow(),
    "server adapter typecheck",
  );
  // Node resolves the "default" condition: lib/, which must export what the types promise
  const probe =
    `const core = await import("htmx-ui-engine");` +
    `const adapters = await Promise.all(["express", "elysia", "hono", "fastify", "koa"].map((n) => import("htmx-ui-engine/" + n)));` +
    `if (typeof core.createSite !== "function") { console.error(Object.keys(core)); process.exit(1); }` +
    `for (const [i, a] of adapters.entries()) if (typeof a.htmxUi !== "function") { console.error(i, Object.keys(a)); process.exit(1); }`;
  failIfNot(await $`node --input-type=module -e ${probe}`.cwd(app).quiet().nothrow(), "importing htmx-ui-engine's lib/ on Node");
});

/** This script's environment minus the npm_config_* / npm_* variables Bun sets, so each package manager sets its own. */
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^npm_/i.test(k))) as Record<string, string>;

/**
 * `pm install` in `dir`. Yarn 1 caches `file:` tarballs under a key that doesn't change with
 * their content, and every run packs to the same relative path (`../htmx-ui-engine-0.1.0.tgz`),
 * so a shared cache hands back a tarball packed by an earlier run. Yarn gets a cache of its
 * own in this run's work directory.
 */
async function install(pm: "bun" | "npm" | "pnpm" | "yarn", dir: string, what: string) {
  const env = pm === "yarn" ? { ...cleanEnv, YARN_CACHE_FOLDER: join(work, "yarn-cache") } : cleanEnv;
  failIfNot(await $`${pm} install`.cwd(dir).env(env).quiet().nothrow(), what);
}

/** Scaffold a site with the packed create-htmx-ui for `pm`, install the packed packages, build, typecheck. */
async function scaffolded(pm: "bun" | "npm" | "pnpm" | "yarn") {
  const dir = join(work, `site-${pm}`);
  // Run the packed scaffolder, as `<pm> create htmx-ui` would
  const create = join(work, "create");
  await quiet($`mkdir -p ${create} && tar -xzf ${tarballs["create-htmx-ui"]!} -C ${create}`);
  failIfNot(await $`node ${join(create, "package/index.js")} ${dir} --pm ${pm} --no-install`.quiet().nothrow(), "create-htmx-ui");
  // The published versions don't exist yet: install the tarballs instead
  const pkg = await Bun.file(join(dir, "package.json")).json();
  pkg.dependencies["htmx-ui"] = `file:${tarballs["htmx-ui"]}`;
  pkg.devDependencies["htmx-ui-engine"] = `file:${tarballs["htmx-ui-engine"]}`;
  await Bun.write(join(dir, "package.json"), JSON.stringify(pkg, null, 2));

  await install(pm, dir, `${pm} install`);
  failIfNot(await $`${pm} run build`.cwd(dir).env(cleanEnv).quiet().nothrow(), `${pm} run build`);
  for (const page of ["index.html", "about.html", "favicon.svg"]) {
    if (!(await Bun.file(join(dir, "dist", page)).exists())) throw new Error(`${pm}: dist/${page} missing`);
  }
  const home = await Bun.file(join(dir, "dist/index.html")).text();
  if (/\{[%{#]/.test(home)) throw new Error(`${pm}: template syntax left in dist/index.html`);
  if (!home.includes('href="/favicon.svg"')) throw new Error(`${pm}: the public favicon link was rewritten`);
  await checkCss(join(dir, "dist"), [".btn-primary", ".card-title", ".prose", "--primary", ".size-4"]);
  failIfNot(await $`bunx tsc --noEmit -p .`.cwd(dir).quiet().nothrow(), `${pm}: project typecheck`);
}

/** The scaffolded site plus the three plugins, set up as their docs say: build, name a version, archive it. */
async function withPlugins(pm: "bun" | "npm" | "pnpm" | "yarn") {
  const dir = join(work, `site-${pm}`);
  const pkg = await Bun.file(join(dir, "package.json")).json();
  for (const name of ["docs", "versions", "search"]) pkg.dependencies[`htmx-ui-plugin-${name}`] = `file:${tarballs[`htmx-ui-plugin-${name}`]}`;
  // No arguments after the script name: package managers pass them on differently.
  Object.assign(pkg.scripts, { "docs:name": "htmx-ui versions:name 0.1.0", "docs:archive": "htmx-ui versions:archive" });
  await Bun.write(join(dir, "package.json"), JSON.stringify(pkg, null, 2));

  await Bun.write(
    join(dir, "htmx-ui.config.ts"),
    `import { defineConfig } from "htmx-ui-engine";\nimport docs from "htmx-ui-plugin-docs";\nimport search from "htmx-ui-plugin-search";\nimport versions from "htmx-ui-plugin-versions";\n\n` +
      `export default defineConfig({ url: "https://smoke.test", plugins: [docs({ name: "Smoke", description: "Smoke docs." }), versions(), search()] });\n`,
  );
  await Bun.write(join(dir, "data/docs-nav.json"), JSON.stringify({ sections: [{ title: "Start", items: [{ title: "Intro", href: "/docs" }, { title: "Guide", href: "/docs/guide" }] }] }));
  await Bun.write(join(dir, "data/versions.json"), JSON.stringify({ latest: "next", versions: [{ id: "next", label: "next" }] }));
  await Bun.write(
    join(dir, "layouts/docs.html"),
    `{% extends "layouts/base.html" %}{% from "docs/macros.html" import markdown_actions %}{% from "search/macros.html" import search %}` +
      `{% from "versions/macros.html" import version_switcher, version_banner %}{% set nav = docsNav(url) %}` +
      `{% block content %}{{ search() }}{{ version_switcher() }}<article>{{ version_banner() }}<p class="eyebrow">{{ nav.section }}</p><h1>{{ title }}</h1>` +
      `{{ markdown_actions(url) }}<div data-docs-content>{% block docs %}{% endblock %}</div></article>{% endblock %}`,
  );
  const page = (title: string, body: string) => `{% extends "layouts/docs.html" %}{% set title = "${title}" %}{% block docs %}${body}{% endblock %}`;
  await Bun.write(join(dir, "pages/docs/index.html"), page("Intro", "<p>Welcome.</p>"));
  await Bun.write(join(dir, "pages/docs/guide.html"), page("Guide", '<h2>Set up</h2><p>See <a href="/docs">the intro</a>.</p>'));
  const app = await Bun.file(join(dir, "app.ts")).text();
  await Bun.write(
    join(dir, "app.ts"),
    `import { initSearch } from "htmx-ui-plugin-search/client";\nimport { initVersions } from "htmx-ui-plugin-versions/client";\n` +
      app +
      `document.addEventListener("DOMContentLoaded", () => {\n  initVersions();\n  initSearch();\n});\n`,
  );
  const css = await Bun.file(join(dir, "styles.css")).text();
  const imports = ["docs", "versions", "search"].map((n) => `@import "htmx-ui-plugin-${n}/styles.css";`).join("\n");
  await Bun.write(join(dir, "styles.css"), css.replace('@import "htmx-ui/styles.css";', `@import "htmx-ui/styles.css";\n${imports}`));

  await install(pm, dir, `${pm} install (plugins)`);
  failIfNot(await $`${pm} run build`.cwd(dir).env(cleanEnv).quiet().nothrow(), `${pm} run build (plugins)`);
  const read = (f: string) => Bun.file(join(dir, f)).text();
  if (!(await read("dist/llms.txt")).includes("- [Guide](https://smoke.test/docs/guide.md)")) throw new Error(`${pm}: dist/llms.txt is missing the guide`);
  if (!(await read("dist/docs/guide.md")).includes("## Set up")) throw new Error(`${pm}: dist/docs/guide.md is wrong`);
  const sitemap = JSON.parse(await read("dist/sitemap.json"));
  if (sitemap.version !== "next" || sitemap.versions?.length !== 1) throw new Error(`${pm}: dist/sitemap.json has no versions`);
  const guide = await read("dist/docs/guide.html");
  for (const needle of ['id="set-up"', "heading-anchor", "data-version-switcher", "data-search-dialog", 'data-clipboard-url="/docs/guide.md"']) {
    if (!guide.includes(needle)) throw new Error(`${pm}: dist/docs/guide.html is missing ${needle}`);
  }
  await checkCss(join(dir, "dist"), [".search-dialog", ".search-option", ".btn-primary", ".font-mono"]);
  failIfNot(await $`bunx tsc --noEmit -p .`.cwd(dir).quiet().nothrow(), `${pm}: project typecheck (plugins)`);

  failIfNot(await $`${pm} run docs:name`.cwd(dir).env(cleanEnv).quiet().nothrow(), `${pm} run docs:name (htmx-ui versions:name)`);
  failIfNot(await $`${pm} run docs:archive`.cwd(dir).env(cleanEnv).quiet().nothrow(), `${pm} run docs:archive (htmx-ui versions:archive)`);
  const frozen = await read("archive/v0.1/guide.html");
  if (!frozen.includes('href="/docs/v0.1"') || !frozen.includes("You're viewing the docs for v0.1.")) throw new Error(`${pm}: archive/v0.1/guide.html was not frozen`);
  if (JSON.parse(await read("data/versions.json")).latest !== "next") throw new Error(`${pm}: versions:archive did not start a new next`);
}

await step("smoke test: the packed htmx-ui-upgrade on Node upgrades a 0.1 project", async () => {
  const tool = join(work, "upgrade");
  const app = join(work, "upgrade-app");
  await quiet($`mkdir -p ${tool} && tar -xzf ${tarballs["htmx-ui-upgrade"]!} -C ${tool}`);
  await Bun.write(join(app, "package.json"), JSON.stringify({ dependencies: { "htmx-ui": "^0.1.0" } }, null, 2));
  await Bun.write(join(app, "layouts/base.html"), `<a class="sidebar-link" href="/">Home</a>\n`);
  failIfNot(await $`node ${join(tool, "package/bin/htmx-ui-upgrade.js")} ${app} --to ${version} --force`.quiet().nothrow(), "htmx-ui-upgrade");
  if (!(await Bun.file(join(app, "layouts/base.html")).text()).includes('class="sidebar-menu-button"')) throw new Error("layouts/base.html was not upgraded");
  const range = (await Bun.file(join(app, "package.json")).json()).dependencies["htmx-ui"];
  if (range !== `^${version}`) throw new Error(`package.json has htmx-ui ${range}, expected ^${version}`);
});

for (const pm of ["bun", "npm", "pnpm", "yarn"] as const) {
  if (!Bun.which(pm)) {
    console.log(`• smoke test: create-htmx-ui with ${pm} … skipped (${pm} not on PATH)`);
    if (pm === "npm") failed = true; // the Node runtime must be covered
    continue;
  }
  const runtime = pm === "bun" ? "Bun" : "Node + Vite";
  await step(`smoke test: create-htmx-ui with ${pm} (${runtime}), install, build, typecheck`, () => scaffolded(pm));
  await step(`smoke test: the docs, versions and search plugins with ${pm} (${runtime}): build, versions:name, versions:archive`, () => withPlugins(pm));
}

await rm(work, { recursive: true, force: true });

if (failed) {
  console.error("\nRelease check failed.");
  process.exit(1);
}
const names = await Promise.all(PACKAGES.map(async (dir) => (await read(dir)).name));
console.log(`\nReady to publish ${PACKAGES.length} packages at ${version}: ${names.join(", ")}.`);
