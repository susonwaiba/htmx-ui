#!/usr/bin/env bun

import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, dirname, extname, basename } from "node:path";

const BASE_URL = "https://susonwaiba.github.io/htmx-ui";
const DIST_DIR = "dist";

const HTML_EXTENSIONS = [".html"];
const RESOURCE_ATTRIBUTES = ["href", "src", "action", "poster", "data-src"];

async function getFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

function toAbsoluteUrl(resource: string, currentFile: string): string {
  // Don't touch:
  // - absolute URLs
  // - protocol-relative URLs
  // - anchors
  // - data/blob URLs
  // - mailto/tel/etc.
  if (
    /^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i.test(resource) ||
    resource.startsWith("/")
  ) {
    return resource;
  }

  // Remove query/hash temporarily.
  const match = resource.match(/^([^?#]*)([?#].*)?$/);
  const resourcePath = match?.[1] ?? resource;
  const suffix = match?.[2] ?? "";

  // Resolve the resource relative to the HTML/CSS/JS file.
  const currentDir = dirname(relative(DIST_DIR, currentFile));
  const resolved = join(currentDir, resourcePath);

  // Normalize ./ and ../ etc.
  const normalized = resolved.replaceAll("\\", "/").replace(/^\/+/, "");

  return `${BASE_URL}/${normalized}${suffix}`;
}

function rewriteResourceAttributes(
  content: string,
  currentFile: string,
): string {
  const attributePattern = new RegExp(
    `\\b(${RESOURCE_ATTRIBUTES.join("|")})=(["'])([^"']+)\\2`,
    "gi",
  );

  return content.replace(attributePattern, (_, attribute, quote, resource) => {
    const absolute = toAbsoluteUrl(resource, currentFile);

    return `${attribute}=${quote}${absolute}${quote}`;
  });
}

function rewriteCssUrls(content: string, currentFile: string): string {
  return content.replace(
    /url\(\s*(["']?)([^)"']+)\1\s*\)/gi,
    (_, quote, resource) => {
      const absolute = toAbsoluteUrl(resource, currentFile);

      return `url(${quote}${absolute}${quote})`;
    },
  );
}

function rewriteJsStrings(content: string, currentFile: string): string {
  // This intentionally only handles common static import-like URLs.
  // It avoids trying to rewrite arbitrary JS strings.
  return content.replace(
    /(['"`])(\.{1,2}\/[^'"`]+)\1/g,
    (_, quote, resource) => {
      const absolute = toAbsoluteUrl(resource, currentFile);

      return `${quote}${absolute}${quote}`;
    },
  );
}

async function createExtensionlessPages(files: string[]) {
  for (const file of files) {
    if (!HTML_EXTENSIONS.includes(extname(file))) {
      continue;
    }

    const relativePath = relative(DIST_DIR, file);

    // Don't create another copy for index.html.
    if (basename(file) === "index.html") {
      continue;
    }

    const name = basename(file, ".html");
    const dir = dirname(relativePath);

    const targetDir =
      dir === "." ? join(DIST_DIR, name) : join(DIST_DIR, dir, name);

    const target = join(targetDir, "index.html");

    await mkdir(targetDir, { recursive: true });
    await cp(file, target);

    console.log(`Created: ${relative(DIST_DIR, target)}`);
  }
}

async function main() {
  const files = await getFiles(DIST_DIR);

  for (const file of files) {
    const extension = extname(file).toLowerCase();

    if (![".html", ".css", ".js"].includes(extension)) {
      continue;
    }

    let content = await readFile(file, "utf8");

    if (extension === ".html") {
      content = rewriteResourceAttributes(content, file);
    }

    if (extension === ".css") {
      content = rewriteCssUrls(content, file);
    }

    if (extension === ".js") {
      content = rewriteJsStrings(content, file);
    }

    await writeFile(file, content);
  }

  // Re-read files because the directory now contains the rewritten files.
  const rewrittenFiles = await getFiles(DIST_DIR);

  await createExtensionlessPages(rewrittenFiles);

  console.log(`\nPrepared ${DIST_DIR}/ for GitHub Pages.`);
  console.log(`Base URL: ${BASE_URL}`);
}

await main();
