import { describe, expect, test } from "bun:test";
import { applyVersions, deferVersions, verToken, withVer } from "./ver";

describe("verToken", () => {
  test("is the project version in a build", () => {
    expect(verToken("1.2.3")).toBe("1.2.3");
    expect(verToken("")).toBe("");
  });

  test("adds a random suffix in dev, the same one every time in a session", () => {
    const dev = verToken("1.2.3", true);
    expect(dev).toMatch(/^1\.2\.3-[a-z0-9]+$/);
    expect(verToken("1.2.3", true)).toBe(dev); // a re-render must not change the URL
    expect(verToken("", true)).toMatch(/^[a-z0-9]+$/); // still busts without a version
    expect(verToken("1.2.3", true)).not.toBe(verToken("1.2.3")); // a new session gets a new one
  });
});

describe("withVer", () => {
  test("appends ?ver=, or &ver= when the URL already has a query", () => {
    expect(withVer("../app.ts", "1.2.3")).toBe("../app.ts?ver=1.2.3");
    expect(withVer("../app.ts?v=2", "1.2.3")).toBe("../app.ts?v=2&ver=1.2.3");
  });

  test("leaves the URL alone without a version", () => {
    expect(withVer("../app.ts", "")).toBe("../app.ts");
  });
});

describe("deferVersions / applyVersions", () => {
  // What assetVer() renders: the page's own URLs, each with ?ver= and nothing else.
  const page = `<link rel="stylesheet" href="../app.css?ver=1.2.3"><script type="module" src="../app.ts?ver=1.2.3"></script><img src="../logo.svg?ver=1.2.3" alt=""><a href="/about">about</a>`;

  test("moves ?ver= out of the URL so a bundler can resolve the file", () => {
    expect(deferVersions(page)).toBe(
      `<link rel="stylesheet" href="../app.css" data-ver="1.2.3"><script type="module" src="../app.ts" data-ver="1.2.3"></script><img src="../logo.svg" data-ver="1.2.3" alt=""><a href="/about">about</a>`,
    );
  });

  test("puts the version back on the URL the bundler ended up with", () => {
    const bundled = `<link rel="stylesheet" href="../assets/app-1a2b.css" data-ver="1.2.3"><script type="module" src="../assets/index-1a2b.js" data-ver="1.2.3"></script>`;
    expect(applyVersions(bundled)).toBe(
      `<link rel="stylesheet" href="../assets/app-1a2b.css?ver=1.2.3"><script type="module" src="../assets/index-1a2b.js?ver=1.2.3"></script>`,
    );
  });

  test("a round trip returns the page to itself", () => {
    expect(applyVersions(deferVersions(page))).toBe(page);
  });

  test("leaves tags without a version untouched", () => {
    const plain = `<link rel="stylesheet" href="../app.css"><script src="../app.ts?v=2"></script>`;
    expect(deferVersions(plain)).toBe(plain);
    expect(applyVersions(plain)).toBe(plain);
  });

  test("keeps the rest of a URL that already has a query", () => {
    expect(deferVersions(`<img src="../logo.svg?ver=1.2.3&amp;size=2">`)).toBe(`<img src="../logo.svg?size=2" data-ver="1.2.3">`);
    expect(applyVersions(`<img src="../logo.svg?size=2" data-ver="1.2.3">`)).toBe(`<img src="../logo.svg?size=2&ver=1.2.3">`);
  });

  test("adds the version to a URL that has one of its own", () => {
    const html = `<script type="module" src="../app.ts?t=17" data-ver="1.2.3"></script>`;
    expect(deferVersions(html)).toBe(html);
    expect(applyVersions(html)).toBe(`<script type="module" src="../app.ts?t=17&ver=1.2.3"></script>`);
  });

  test("drops a marker on a tag with no URL of its own", () => {
    expect(applyVersions(`<span data-ver="1.2.3">x</span>`)).toBe("<span>x</span>");
  });
});