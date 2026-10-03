import { describe, expect, test } from "bun:test";

import { initVersions } from "./versions";

const MANIFEST = {
  latest: "0.2",
  versions: [
    { id: "0.2", label: "v0.2", path: "/docs", latest: true, pages: ["", "/installation", "/components/button"] },
    { id: "0.1", label: "v0.1", path: "/docs/v0.1", latest: false, pages: ["", "/installation"] },
  ],
};

/** The switcher partial plus a stand-in for the manifest it fetches. */
function setup(
  path: string,
  manifest: unknown = MANIFEST,
  href = "https://example.test/docs/components/button",
  version = "0.2",
) {
  document.body.innerHTML = `
    <span data-version-switcher data-version="${version}" data-versions-src="/docs/versions.json">
      <ul data-version-items></ul>
    </span>
    <div data-version-banner hidden></div>`;
  Object.defineProperty(window, "location", {
    value: { href, pathname: path, origin: "https://example.test" },
    writable: true,
  });
  stubFetch(() => new Response(JSON.stringify(manifest)));
}

function page(path: string, manifest?: unknown, href?: string) {
  setup(path, manifest, href);
  return initVersions();
}

/** Stand in for fetch; the switcher only ever asks for the manifest. */
function stubFetch(handler: (url: string) => Response) {
  globalThis.fetch = (async (url: string) => handler(url)) as typeof fetch;
}

const hrefs = () =>
  [...document.querySelectorAll("[data-version-items] a")].map((a) => a.getAttribute("href"));

describe("versions", () => {
  test("keeps the reader on the same page when switching versions", async () => {
    await page("/docs/components/button");
    // 0.2 is current and has the page; 0.1 does not, so it falls back to its root.
    expect(hrefs()).toEqual(["/docs/components/button", "/docs/v0.1"]);
  });

  test("matches an absolute version path against the subdirectory it is served from", async () => {
    const manifest = {
      latest: "0.2",
      versions: [
        { id: "0.2", label: "v0.2", path: "https://example.test/htmx-ui/docs", latest: true, pages: ["", "/components/button"] },
        { id: "0.1", label: "v0.1", path: "https://example.test/htmx-ui/docs/v0.1", latest: false, pages: ["", "/components/button"] },
      ],
    };

    await page("/htmx-ui/docs/components/button", manifest, "https://example.test/htmx-ui/docs/components/button");

    // Without the pathname comparison both links would collapse to each version's root.
    expect(hrefs()).toEqual([
      "https://example.test/htmx-ui/docs/components/button",
      "https://example.test/htmx-ui/docs/v0.1/components/button",
    ]);
  });

  test("shows the banner on an archived version, linking to the same page when it exists", async () => {
    document.body.innerHTML = `
      <span data-version-switcher data-version="0.1" data-versions-src="/docs/versions.json">
        <ul data-version-items></ul>
      </span>
      <div data-version-banner hidden></div>`;
    Object.defineProperty(window, "location", {
      value: { href: "https://example.test/docs/v0.1/installation", pathname: "/docs/v0.1/installation" },
      writable: true,
    });
    stubFetch(() => new Response(JSON.stringify(MANIFEST)));

    await initVersions();

    const banner = document.querySelector<HTMLElement>("[data-version-banner]")!;
    expect(banner.hidden).toBe(false);
    expect(banner.querySelector("a")?.getAttribute("href")).toBe("/docs/installation");
  });

  test("keeps the server-rendered links when the manifest cannot be read", async () => {
    setup("/docs/components/button");
    stubFetch(() => {
      throw new Error("offline");
    });

    await initVersions();

    expect(hrefs()).toEqual([]);
  });
});