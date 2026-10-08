import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { bumpPackage, compareVersions, detectVersion, LATEST, migrateText, pending, upgrade } from "./index";
import { MIGRATIONS } from "./migrations";

const only = (version: string) => MIGRATIONS.filter((m) => m.version === version);

async function project(files: Record<string, string>) {
  const dir = await mkdtemp(join(tmpdir(), "htmx-ui-upgrade-"));
  for (const [path, text] of Object.entries(files)) {
    await mkdir(dirname(join(dir, path)), { recursive: true });
    await writeFile(join(dir, path), text);
  }
  return dir;
}

describe("versions", () => {
  test("compares and detects versions", () => {
    expect(compareVersions("0.10.0", "0.9.9")).toBeGreaterThan(0);
    expect(compareVersions("^0.2.0", "0.2.0")).toBe(0);
    expect(detectVersion({ dependencies: { "htmx-ui": "^0.2.0" }, devDependencies: { "htmx-ui-engine": "^0.1.0" } })?.version).toBe("0.2.0");
    expect(detectVersion({ devDependencies: { "htmx-ui-engine": "~0.1.3" } })?.version).toBe("0.1.3");
    expect(detectVersion({ dependencies: { "htmx-ui": "workspace:*" } })).toBeNull();
  });

  test("picks the migrations after from, up to to, oldest first", () => {
    expect(pending("0.1.0", "0.3.0").map((m) => m.version)).toEqual(["0.2.0", "0.3.0"]);
    expect(pending("0.2.0", "0.3.0").map((m) => m.version)).toEqual(["0.3.0"]);
    expect(pending("0.2.4", "0.2.9")).toEqual([]);
  });

  test("migrations are listed oldest first, and the newest is what it upgrades to by default", () => {
    const versions = MIGRATIONS.map((m) => m.version);
    expect([...versions].sort(compareVersions)).toEqual(versions);
    expect(compareVersions(LATEST, versions.at(-1)!)).toBeGreaterThanOrEqual(0);
  });

  test("bumps the htmx-ui packages in package.json, keeping its formatting", () => {
    const text = `{\n  "dependencies": {\n    "htmx-ui": "^0.2.0",\n    "htmx.org": "^4.0.0",\n    "htmx-ui-plugin-docs": "~0.2.0"\n  },\n  "devDependencies": { "htmx-ui-engine": "^0.2.0" }\n}\n`;
    const { text: out, changes } = bumpPackage(text, "0.3.0");
    expect(out).toBe(text.replaceAll(/"(\^|~)0\.2\.0"/g, '"^0.3.0"'));
    expect(out).toContain('"htmx.org": "^4.0.0"');
    expect(changes).toHaveLength(3);
  });
});

describe("0.2.0", () => {
  const run = (text: string, path = "layouts/docs.html") => migrateText(text, path, only("0.2.0"));

  test("templates is roots in the config, and nowhere else", () => {
    const config = `export default defineConfig({\n  templates: ["."],\n});\n`;
    expect(run(config, "htmx-ui.config.ts").text).toBe(`export default defineConfig({\n  roots: ["."],\n});\n`);
    expect(run(config, "app.ts").text).toBe(config);
  });

  test("renames the sidebar's classes and attributes in markup, scripts and styles", () => {
    const html = `<button data-sidebar-toggle>☰</button>\n<p class="sidebar-label">Docs</p>\n<a class="sidebar-link {{ 'active' if current }}" href="/">Home</a>\n<p>Use .sidebar-link</p>\n`;
    const { text, changes, warnings } = run(html);
    expect(text).toBe(
      `<button data-sidebar-trigger>☰</button>\n<p class="sidebar-group-label">Docs</p>\n<a class="sidebar-menu-button {{ 'active' if current }}" href="/">Home</a>\n<p>Use .sidebar-link</p>\n`,
    );
    expect(changes.map((c) => c.description)).toEqual([".sidebar-link → .sidebar-menu-button", ".sidebar-label → .sidebar-group-label", "[data-sidebar-toggle] → [data-sidebar-trigger]"]);
    // Prose isn't rewritten; it is pointed out
    expect(warnings).toEqual([expect.objectContaining({ line: 4, message: expect.stringContaining("sidebar-menu-button") })]);

    const ts = `document.querySelectorAll(".sidebar-link, [data-sidebar-toggle]");\nel.classList.add("sidebar-link");\nel.dataset.sidebarToggle = "";\n`;
    expect(run(ts, "app.ts").text).toBe(`document.querySelectorAll(".sidebar-menu-button, [data-sidebar-trigger]");\nel.classList.add("sidebar-menu-button");\nel.dataset.sidebarTrigger = "";\n`);
    expect(run(`.sidebar-link:hover, .sidebar-links { color: red }`, "styles.css").text).toBe(`.sidebar-menu-button:hover, .sidebar-links { color: red }`);
  });

  test("reports what it can't rewrite", () => {
    const { warnings } = run(`<div class="sidebar-backdrop" data-sidebar-close></div>`);
    expect(warnings.map((w) => w.message)).toEqual([expect.stringContaining(".sidebar-layout"), expect.stringContaining("close buttons")]);
  });
});

describe("0.3.0", () => {
  const run = (text: string, path = "pages/index.html") => migrateText(text, path, only("0.3.0"));

  test("the 0.2 copy button becomes a clipboard button with its icons", () => {
    const old = `<button type="button" class="code-copy" data-copy aria-label="Copy code">
  <span class="code-copy-idle inline-flex items-center gap-1.5">{{ icon("copy") }}<span data-copy-label>Copy</span></span>
  <span class="code-copied items-center gap-1.5" aria-live="polite">{{ icon("check") }}Copied</span>
</button>`;
    const { text, warnings } = run(old);
    expect(text).toBe(
      `<button type="button" class="btn btn-ghost btn-xs btn-icon clipboard code-copy" data-clipboard data-clipboard-target="pre:not([hidden]) code" aria-label="Copy code">` +
        `<span class="clipboard-idle">{{ icon("copy") }}</span><span class="clipboard-done">{{ icon("check") }}</span></button>`,
    );
    expect(warnings).toEqual([]);
  });

  test("a copy button it doesn't recognise is reported, not rewritten", () => {
    const odd = `<button class="code-copy" data-copy>Copy</button>`;
    const { text, warnings } = run(odd);
    expect(text).toBe(`<button class="btn btn-ghost btn-xs code-copy" data-copy>Copy</button>`);
    expect(warnings.map((w) => w.message)).toEqual([expect.stringContaining("data-copy is gone")]);
  });

  test("drops initCode", () => {
    const ts = `import { initCode, initComponents } from "htmx-ui/components";\nimport { initCode as x } from "./x";\nimport { initCode } from "htmx-ui/code";\n\ninitComponents(document);\n  initCode(document);\n`;
    const { text, warnings } = run(ts, "app.ts");
    expect(text).toBe(`import { initComponents } from "htmx-ui/components";\nimport { initCode as x } from "./x";\n\ninitComponents(document);\n`);
    expect(warnings.map((w) => w.line)).toEqual([2]);
  });

  test("close buttons, the sidebar trigger and the jump button become .btn buttons", () => {
    const html = `<button class="dialog-close" data-dialog-close>×</button>
<button class="btn btn-ghost btn-icon btn-sm sheet-close">×</button>
<button class="sidebar-trigger" data-sidebar-trigger>☰</button>
<button class="message-scroller-jump">↓</button>
{{ button(class="dialog-close") }}`;
    expect(run(html).text).toBe(`<button class="btn btn-ghost btn-icon btn-sm dialog-close" data-dialog-close>×</button>
<button class="btn btn-ghost btn-icon btn-sm sheet-close">×</button>
<button class="btn btn-ghost btn-icon btn-sm sidebar-trigger" data-sidebar-trigger>☰</button>
<button class="btn btn-outline btn-sm btn-rounded message-scroller-jump">↓</button>
{{ button(class="dialog-close") }}`);
  });

  test("code tabs are tabs, .item-separator is .separator", () => {
    const html = `<div class="code-tabs" role="tablist"><button class="code-tab" role="tab">a</button></div><hr class="item-separator">`;
    expect(run(html).text).toBe(`<div class="tabs-list tabs-line code-tabs" role="tablist"><button class="tabs-trigger" role="tab">a</button></div><hr class="separator">`);
  });

  test('version switcher links get hx-boost="false", and only once', () => {
    const html = `<p class="dropdown-label">Documentation versions</p>
<div class="dropdown-menu" role="menu">
  <a class="dropdown-item" href="/docs/v0.1">v0.1</a>
  <a class="dropdown-item" data-version-link href="/docs" hx-boost="false">v0.3</a>
</div>
<a class="link" data-version-link href="/docs/v0.2">/docs/v0.2</a>`;
    expect(run(html).text).toBe(`<p class="dropdown-label">Documentation versions</p>
<div class="dropdown-menu" role="menu">
  <a class="dropdown-item" href="/docs/v0.1" hx-boost="false">v0.1</a>
  <a class="dropdown-item" data-version-link href="/docs" hx-boost="false">v0.3</a>
</div>
<a class="link" data-version-link href="/docs/v0.2" hx-boost="false">/docs/v0.2</a>`);
  });
});

describe("upgrade()", () => {
  const files = {
    "package.json": `{\n  "dependencies": { "htmx-ui": "^0.1.0" },\n  "devDependencies": { "htmx-ui-engine": "^0.1.0" }\n}\n`,
    "htmx-ui.config.ts": `export default defineConfig({ templates: ["."] });\n`,
    "layouts/docs.html": `<a class="sidebar-link">x</a><hr class="item-separator">\n`,
    "node_modules/htmx-ui/x.html": `<a class="sidebar-link">x</a>\n`,
    "archive/v0.1/index.html": `<a class="sidebar-link">x</a>\n`,
  };

  test("runs every migration from the package.json version, skipping dependencies and archives", async () => {
    const dir = await project(files);
    const report = upgrade(dir, { to: "0.3.0" });
    expect(report.from).toBe("0.1.0");
    expect(report.migrations.map((m) => m.version)).toEqual(["0.2.0", "0.3.0"]);
    expect(report.files.map((f) => f.path)).toEqual(["htmx-ui.config.ts", "layouts/docs.html", "package.json"]);
    const read = (p: string) => readFileSync(join(dir, p), "utf8");
    expect(read("layouts/docs.html")).toBe(`<a class="sidebar-menu-button">x</a><hr class="separator">\n`);
    expect(read("htmx-ui.config.ts")).toContain("roots:");
    expect(JSON.parse(read("package.json")).devDependencies["htmx-ui-engine"]).toBe("^0.3.0");
    expect(read("node_modules/htmx-ui/x.html")).toBe(files["node_modules/htmx-ui/x.html"]);
    expect(read("archive/v0.1/index.html")).toBe(files["archive/v0.1/index.html"]);
  });

  test("a dry run writes nothing; --from overrides package.json", async () => {
    const dir = await project(files);
    const report = upgrade(dir, { from: "0.2.0", to: "0.3.0", dryRun: true });
    expect(report.migrations.map((m) => m.version)).toEqual(["0.3.0"]);
    expect(report.files.map((f) => f.path)).toEqual(["layouts/docs.html", "package.json"]);
    expect(readFileSync(join(dir, "layouts/docs.html"), "utf8")).toBe(files["layouts/docs.html"]);
  });

  test("nothing to do when already on the version; refuses versions it doesn't know", async () => {
    const dir = await project(files);
    expect(upgrade(dir, { from: "0.3.0", to: "0.3.0" }).files).toEqual([]);
    expect(() => upgrade(dir, { to: "99.0.0" })).toThrow("htmx-ui-upgrade@latest");
  });
});
