// Everything that must pass before publishing htmx-ui, htmx-ui-engine and create-htmx-ui.
//
//   bun run release:check
//
// 1. Typecheck, tests, docs-site build, package builds (packages/*/lib).
// 2. Repo rules: no template syntax in built pages; the UI package never imports the
//    site, the scripts or the engine; one version across the packages, in the changelog.
// 3. Pack each package's real tarball and check what's in it.
// 4. Smoke tests against the tarballs (need network access to install from npm):
//    - the UI package alone in a Bun.build project, and its compiled lib/ on Node;
//    - a site scaffolded by create-htmx-ui for each package manager on PATH, built
//      and typechecked: bun (Bun runtime), and npm, pnpm, yarn (Node runtime, Vite).

import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CREATE, DIST, ENGINE, PACKAGES, ROOT, SRC, UI } from "./paths";

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
await step("package builds (packages/ui/lib, packages/engine/lib)", () => quiet($`bun run build:lib`.cwd(ROOT)).then(() => {}));

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
  const minor = version.split(".").slice(0, 2).join(".");
  if (!versions.versions.some((v: { id: string }) => v.id === minor)) throw new Error(`no docs version ${minor}`);
});

const work = await mkdtemp(join(tmpdir(), "htmx-ui-release-"));
const tarballs: Record<string, string> = {};

/** Pack a package and check its tarball has `must` and nothing matching `forbidden`. */
async function pack(dir: string, must: string[]) {
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
  tarballs[pkg.name] = tarball;
  console.log(`(${files.length} files)`);
}

await step("pack htmx-ui", () =>
  pack(UI, ["package.json", "README.md", "LICENSE", "lib/index.js", "lib/index.d.ts", "lib/theme.js", "lib/theme.d.ts", "src/styles.css", "src/components/button/button.css", "src/components/icon/icon.html", "src/icons/sun.svg"]),
);
await step("pack htmx-ui-engine", () =>
  pack(ENGINE, ["package.json", "README.md", "LICENSE", "bin/htmx-ui.js", "lib/index.js", "lib/index.d.ts", "lib/node/index.js", "lib/node/vite-plugin.js", "lib/node/vite-plugin.d.ts", "src/bun/cli.ts", "src/bun/plugin.ts", "src/core/render.ts"]),
);
await step("pack create-htmx-ui", () =>
  pack(CREATE, ["package.json", "README.md", "LICENSE", "index.js", "template/_gitignore", "template/htmx-ui.config.ts", "template/pages/index.html"]),
);

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

/** This script's environment minus the npm_config_* / npm_* variables Bun sets, so each package manager sets its own. */
const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^npm_/i.test(k))) as Record<string, string>;

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

  failIfNot(await $`${pm} install`.cwd(dir).env(cleanEnv).quiet().nothrow(), `${pm} install`);
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

for (const pm of ["bun", "npm", "pnpm", "yarn"] as const) {
  if (!Bun.which(pm)) {
    console.log(`• smoke test: create-htmx-ui with ${pm} … skipped (${pm} not on PATH)`);
    if (pm === "npm") failed = true; // the Node runtime must be covered
    continue;
  }
  await step(`smoke test: create-htmx-ui with ${pm} (${pm === "bun" ? "Bun" : "Node + Vite"}), install, build, typecheck`, () => scaffolded(pm));
}

await rm(work, { recursive: true, force: true });

if (failed) {
  console.error("\nRelease check failed.");
  process.exit(1);
}
console.log(`\nReady to publish ${PACKAGES.length} packages at ${version}: htmx-ui, htmx-ui-engine, create-htmx-ui.`);
