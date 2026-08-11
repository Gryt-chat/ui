/* Writes a real HTML file per route, so link unfurls differ per page.
 *
 * The docs are a SPA on createBrowserRouter: one index.html answers every
 * route, which means a crawler asking for /components/switch gets the same
 * <meta> as the root and every unfurl looks identical. This copies the built
 * index.html to dist/<route>/index.html with that page's title, description
 * and og:image patched in. The app itself is untouched — React still takes
 * over on load and routes client-side from there.
 *
 * Run after `vite build`.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ogPages } from "./og-pages";
import { fileNameFor, OG_HEIGHT, OG_WIDTH } from "./og-meta";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "..", "dist");

/**
 * Crawlers reject a relative og:image, so the absolute origin has to be known
 * at build time. Overridable for a preview deploy on another hostname.
 */
const ORIGIN = (process.env.DOCS_ORIGIN ?? "https://ui.gryt.chat").replace(/\/$/, "");

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headFor(page: (typeof ogPages)[number]): string {
  const url = page.route === "" ? `${ORIGIN}/` : `${ORIGIN}/${page.route}`;
  const image = `${ORIGIN}/og/${fileNameFor(page.route)}`;
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Gryt UI" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${OG_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_HEIGHT}" />`,
    `<meta property="og:image:alt" content="${title}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`
  ].join("\n    ");
}

function main() {
  const shell = readFileSync(join(distDir, "index.html"), "utf8");

  if (!shell.includes("</head>")) {
    throw new Error("prerender: built index.html has no </head> to inject into");
  }

  for (const page of ogPages) {
    // Drop the placeholder title from the shell so it cannot win by being first.
    const html = shell
      .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
      .replace("</head>", `  ${headFor(page)}\n  </head>`);

    const dir = page.route === "" ? distDir : join(distDir, page.route);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
  }

  console.log(`prerender: ${ogPages.length} routes -> dist (origin ${ORIGIN})`);
}

main();
