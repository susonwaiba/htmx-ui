// The `ver=` query behind the assetVer() template global, and the two HTML
// passes that get it past a bundler.
//
// Neither Bun nor Vite can resolve an asset URL that carries a query string
// (`app.ts?ver=1.2.3` fails with "Could not resolve"), and both rewrite the URL
// themselves once it resolves, so a version rendered straight into the page would
// either break the build or be thrown away. So assetVer() renders it, the plugins
// move it out of the way before their bundler sees the page (deferVersions puts it
// in a data-ver attribute) and move it back onto the finished URL afterwards
// (applyVersions). See ./bun/plugin.ts, ./bun/build.ts and ./node/vite-plugin.ts.
//
// Pure string work on node: APIs only, so it runs on Bun and Node alike.

/** Opening tags; an attribute value can't hold an unescaped ">", so this is enough. */
const TAGS = /<[a-z][^>]*>/gi;
/** The attribute a bundled asset's URL lives in. */
const URL_ATTR = /\b(href|src|poster)="([^"]*)"/i;
const VER_QUERY = /[?&]ver=[^&#"]*/;
/** The marker carries the space in front of it, so removing it leaves no gap. */
const DATA_VER = /\s*\bdata-ver="([^"]*)"/;

/** Random per process: a restarted dev server must not reuse the URLs of the last one. */
const g = globalThis as typeof globalThis & { __htmxUiVer?: string };
const nonce = () => (g.__htmxUiVer ??= Math.random().toString(36).slice(2, 8));

/**
 * The token assetVer() appends: the project's own version in a build, plus a
 * random suffix per dev session so dev always loads the file as it is now.
 * Empty when the project declares no version, which makes assetVer() == asset().
 */
export function verToken(version: string, dev = false): string {
  if (!dev) return version;
  return version ? `${version}-${nonce()}` : nonce();
}

/** `url` with the version appended: `?ver=`, or `&ver=` when it already has a query. */
export function withVer(url: string, ver: string): string {
  if (!ver) return url;
  return `${url}${url.includes("?") ? "&" : "?"}ver=${ver}`;
}

/** `"../app.ts?ver=1.2.3"` -> `["../app.ts", "1.2.3"]`, keeping any other query params; nothing to carry without it. */
function splitVer(url: string): [string, string] {
  const query = VER_QUERY.exec(url);
  if (!query) return [url, ""];
  const ver = query[0].slice(query[0].indexOf("=") + 1);
  const rest = /^&(amp;)?/.exec(url.slice(query.index + query[0].length));
  if (!rest) return [url.slice(0, query.index), ver]; // ver was the whole query: its separator goes too
  // Keep the separator the param had, and drop the one in front of what follows.
  return [`${url.slice(0, query.index)}${query[0][0]}${url.slice(query.index + query[0].length + rest[0].length).replace(/^&/, "")}`, ver];
}

/** `src="../app.ts?ver=1.2.3"` -> `src="../app.ts" data-ver="1.2.3"`, so a bundler can resolve the file. */
export function deferVersions(html: string): string {
  return html.replace(TAGS, (tag) => {
    const attr = URL_ATTR.exec(tag);
    if (!attr) return tag;
    const [url, ver] = splitVer(attr[2]!);
    if (!ver) return tag;
    return tag.replace(attr[0]!, `${attr[1]}="${url}" data-ver="${ver}"`);
  });
}

/** `src="../app.ts-1a2b.js" data-ver="1.2.3"` -> `src="../app.ts-1a2b.js?ver=1.2.3"`, on the bundler's own URL. */
export function applyVersions(html: string): string {
  return html.replace(TAGS, (tag) => {
    const marked = DATA_VER.exec(tag);
    if (!marked) return tag;
    const bare = tag.replace(marked[0], "");
    const attr = URL_ATTR.exec(bare);
    if (!attr) return bare;
    return bare.replace(attr[0]!, `${attr[1]}="${withVer(attr[2]!, marked[1]!)}"`);
  });
}