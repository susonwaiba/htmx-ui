import { afterEach, describe, expect, test } from "bun:test";

import { initVersions } from "./client";
import { bannerMarkup } from "./versions";

// The tests below stub window.location and fetch; put the real ones back so they don't
// leak into other files' tests (all tests share one document).
const realLocation = Object.getOwnPropertyDescriptor(window, "location");
const realFetch = globalThis.fetch;

afterEach(() => {
  if (realLocation) Object.defineProperty(window, "location", realLocation);
  globalThis.fetch = realFetch;
});

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
    // Styled and worded exactly as the archiver bakes it in, so a snapshot's banner is
    // only ever refreshed: no unstyled box growing into an alert when the page loads.
    expect(banner.className).toBe("alert alert-warning mb-8");
    expect(banner.getAttribute("role")).toBe("status");
    expect(banner.querySelector(".alert-title")?.textContent).toBe("You're viewing the docs for v0.1.");
    expect(banner.querySelector(".alert-description")?.textContent).toBe("The latest version is v0.2. Go to this page in v0.2.");
    expect(banner.querySelector("a")?.getAttribute("href")).toBe("/docs/installation");
    expect(bannerMarkup("v0.1", "v0.2", "/docs/installation")).toContain(banner.innerHTML);
  });

  test("refreshes the banner a snapshot already ships with", async () => {
    // An archived page arrives with the banner already built (./versions.ts)
    document.body.innerHTML = `
      <span data-version-switcher data-version="0.1" data-versions-src="/docs/versions.json">
        <ul data-version-items></ul>
      </span>
      ${bannerMarkup("v0.1", "next", "/docs/installation")}`;
    Object.defineProperty(window, "location", {
      value: { href: "https://example.test/docs/v0.1/installation", pathname: "/docs/v0.1/installation" },
      writable: true,
    });
    stubFetch(() => new Response(JSON.stringify(MANIFEST)));

    await initVersions();

    const banner = document.querySelector<HTMLElement>("[data-version-banner]")!;
    // Same element, only the label and the link moved on to the version released since
    expect(banner.className).toBe("alert alert-warning mb-8");
    expect(banner.querySelector(".alert-title")?.textContent).toBe("You're viewing the docs for v0.1.");
    expect(banner.querySelector(".alert-description")?.textContent).toBe("The latest version is v0.2. Go to this page in v0.2.");
    expect(banner.querySelector("a")?.getAttribute("href")).toBe("/docs/installation");
  });

  test("marks the version in development instead of calling it the latest", async () => {
    const manifest = {
      latest: "next",
      versions: [
        { id: "next", label: "next", path: "/docs", latest: true, released: null, pages: ["", "/components/button"] },
        { id: "0.1", label: "v0.1", path: "/docs/v0.1", latest: false, released: "2026-01-01", pages: [""] },
      ],
    };
    setup("/docs/components/button", manifest, "https://example.test/docs/components/button", "next");
    await initVersions();

    const items = [...document.querySelectorAll("[data-version-items] a")];
    expect(items.map((a) => a.textContent)).toEqual(["nextIn development", "v0.1"]);
    // Nothing is archived yet, so no banner
    expect(document.querySelector<HTMLElement>("[data-version-banner]")!.hidden).toBe(true);
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