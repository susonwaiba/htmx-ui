// Everything that must pass before publishing. Runs as `prepublishOnly`.
//
//   bun run release:check
//
// 1. Typecheck, tests, docs-site build, package build (lib/).
// 2. Repo rules: no template syntax in built pages; src/ never imports site/ or bun/.
// 3. Pack the real tarball and check what's in it.
// 4. Smoke test: install the tarball into a fresh project and build a page with it
//    (needs network access to install htmx.org and tailwindcss).

import { $ } from "bun";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DIST, ROOT, SRC } from "./paths";

const pkg = await Bun.file(join(ROOT, "package.json")).json();
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

await step("typecheck", () => quiet($`bun run typecheck`).then(() => {}));
await step("tests", () => quiet($`bun test`).then(() => {}));
await step("docs site build", () => quiet($`bun run build`).then(() => {}));
await step("package build (lib/)", () => quiet($`bun run build:lib`).then(() => {}));

await step("no template syntax in built pages", async () => {
  const leaks: string[] = [];
  for await (const f of new Bun.Glob("**/*.html").scan(DIST)) {
    if (/\{[%{#]/.test(await Bun.file(join(DIST, f)).text())) leaks.push(f);
  }
  if (leaks.length) throw new Error(`template syntax in: ${leaks.join(", ")}`);
});

await step("src/ does not import site/ or bun/", async () => {
  const bad: string[] = [];
  for await (const f of new Bun.Glob("**/*.{ts,css,html}").scan(SRC)) {
    const text = await Bun.file(join(SRC, f)).text();
    if (/(from|import|@import)\s+["'](\.\.\/)+(site|bun)\//.test(text)) bad.push(f);
  }
  if (bad.length) throw new Error(bad.join(", "));
});

await step(`version ${pkg.version} is in CHANGELOG.md and site/data/versions.json`, async () => {
  const changelog = await Bun.file(join(ROOT, "CHANGELOG.md")).text();
  if (!changelog.includes(`## ${pkg.version}`)) throw new Error(`CHANGELOG.md has no "## ${pkg.version}" section`);
  const versions = await Bun.file(join(ROOT, "site/data/versions.json")).json();
  const minor = pkg.version.split(".").slice(0, 2).join(".");
  if (!versions.versions.some((v: { id: string }) => v.id === minor)) throw new Error(`no docs version ${minor}`);
});

const work = await mkdtemp(join(tmpdir(), "htmx-ui-release-"));
let tarball = "";

await step("pack tarball and check contents", async () => {
  await quiet($`bun pm pack --destination ${work} --ignore-scripts`.cwd(ROOT));
  tarball = join(work, `${pkg.name}-${pkg.version}.tgz`);
  const files = (await $`tar -tzf ${tarball}`.text()).split("\n").filter(Boolean).map((f) => f.replace(/^package\//, ""));
  const must = ["package.json", "README.md", "LICENSE", "CHANGELOG.md", "lib/index.js", "lib/index.d.ts", "lib/theme.js", "lib/theme.d.ts", "src/styles.css", "src/components/button/button.css", "src/icons/sun.svg"];
  const missing = must.filter((f) => !files.includes(f));
  const forbidden = files.filter((f) => /\.test\.ts$|^site\/|^bun\/|^dist\/|^node_modules\//.test(f));
  if (missing.length) throw new Error(`missing from tarball: ${missing.join(", ")}`);
  if (forbidden.length) throw new Error(`should not be in tarball: ${forbidden.join(", ")}`);
  console.log(`(${files.length} files)`);
});

await step("smoke test: install tarball into a fresh project and build", async () => {
  if (!tarball) throw new Error("no tarball");
  const app = join(work, "app");
  await Bun.write(join(app, "package.json"), JSON.stringify({ name: "smoke", private: true, type: "module" }));
  await Bun.write(
    join(app, "styles.css"),
    `@import "tailwindcss";\n@import "htmx-ui/styles.css";\n@source "./";\n`,
  );
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
  await quiet($`bun add ${tarball} htmx.org tailwindcss bun-plugin-tailwind`.cwd(app));
  const build = join(app, "build.ts");
  await Bun.write(
    build,
    `import tailwind from "bun-plugin-tailwind";\n` +
      `const r = await Bun.build({ entrypoints: ["./index.html"], outdir: "./out", plugins: [tailwind] });\n` +
      `if (!r.success) { console.error(r.logs); process.exit(1); }\n`,
  );
  await quiet($`bun run build.ts`.cwd(app));
  let css = "";
  for await (const f of new Bun.Glob("**/*.css").scan(join(app, "out"))) css += await Bun.file(join(app, "out", f)).text();
  for (const needle of [".btn-primary", ".prose", "--primary", "--tw-prose-body"]) {
    if (!css.includes(needle)) throw new Error(`built CSS is missing ${needle}`);
  }
  await quiet($`bunx tsc --noEmit --strict --module preserve --moduleResolution bundler --target esnext --lib esnext,dom app.ts`.cwd(app).nothrow()).then(
    (r) => {
      if (r.exitCode !== 0) throw new Error(`consumer typecheck failed:\n${r.stdout}${r.stderr}`);
    },
  );
});

await rm(work, { recursive: true, force: true });

if (failed) {
  console.error("\nRelease check failed.");
  process.exit(1);
}
console.log(`\nReady to publish ${pkg.name}@${pkg.version}.`);
