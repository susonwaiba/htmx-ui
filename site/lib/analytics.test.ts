// Google Analytics is opt-in through GA_MEASUREMENT_ID, which the deploy
// pipeline sets and nothing else does. Both directions are rendered by a child
// process with its own environment, so the guarantees hold whether or not the
// developer running the tests happens to have the variable exported.
import { describe, expect, test } from "bun:test";
import { SITE } from "./paths";

// Render one page the way the build does (site/lib/engine.ts pulls in the config
// and its plugins), from site/ so `htmx-ui-engine` resolves like the site's own
// scripts do.
const SCRIPT = `
import { renderPage } from "htmx-ui-engine";
import { engine } from "./lib/engine";
import { PAGES } from "./lib/paths";
console.log(renderPage(engine, PAGES + "/index.html"));
`;

const render = (measurementId?: string) => {
  const env: Record<string, string | undefined> = { ...process.env };
  delete env.GA_MEASUREMENT_ID;
  if (measurementId) env.GA_MEASUREMENT_ID = measurementId;
  const run = Bun.spawnSync({ cmd: ["bun", "-e", SCRIPT], cwd: SITE, env, stdout: "pipe", stderr: "pipe" });
  const stderr = new TextDecoder().decode(run.stderr);
  if (run.exitCode !== 0) throw new Error(`render failed (exit ${run.exitCode}):\n${stderr}`);
  return new TextDecoder().decode(run.stdout);
};

// Rendering the site's engine in a fresh process outgrows bun's 5s default.
const SLOW = 60_000;

describe("google analytics", () => {
  test("emits no tracking code when GA_MEASUREMENT_ID is unset", () => {
    const html = render();
    expect(html).not.toContain("googletagmanager");
    expect(html).not.toContain("gtag(");
    expect(html).not.toContain("dataLayer");
  }, SLOW);

  test("emits the GA4 snippet, and a page_view for boosted navigation, when it is set", () => {
    const html = render("G-TEST123");
    expect(html).toContain('src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"');
    expect(html).toContain('gtag("config", "G-TEST123")');
    // hx-boost means most links navigate without a page load; without this hook
    // GA would only ever see the landing page.
    expect(html).toContain('addEventListener("htmx:after:settle"');
    expect(html).toContain('gtag("event", "page_view"');
  }, SLOW);
});
