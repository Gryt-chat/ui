/* Writes a real HTML file per route, so link unfurls differ per page and so
 * nginx can tell a route from a typo.
 *
 * The docs are a SPA on createBrowserRouter: one index.html answers every
 * route, so a crawler asking for /components/switch gets the same <meta> as the
 * root and every unfurl looks identical. This copies the built index.html to
 * dist/<route>/index.html with that page's title, description and og:image
 * patched in. React still takes over on load and routes client-side.
 *
 * Every route in src/routes.ts gets a file, not just the ones with a share
 * card, because nginx now 404s anything that is not on disk. A route missing
 * from that list is a route that stops working, so the check below fails the
 * build rather than letting it ship.
 *
 * Run after `vite build`.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { exampleDocs } from "../src/exampleMeta";
import { docsRoutes } from "../src/routes";
import { ogPages, type OgPage } from "./og-pages";
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

function headFor(page: OgPage): string {
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

/**
 * The head for a page that exists so nginx can find it, but that nobody should
 * reach from a search result: the two routes that redirect into their first
 * child, the full-screen copy of an example, and the 404 itself. No canonical
 * and no share card — a duplicate or a dead end is not worth indexing.
 */
function noindexHead(title: string, description: string): string {
  return [
    `<title>${escapeAttr(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<meta name="robots" content="noindex" />`
  ].join("\n    ");
}

/** Title and description for a route with no share card of its own. */
function stubFor(route: string): { title: string; description: string } {
  if (route === "components") {
    return {
      title: "Components — Gryt UI",
      description: "The component reference, one page per component."
    };
  }

  if (route === "examples") {
    return {
      title: "Examples — Gryt UI",
      description: "Whole screens from the Gryt client, built out of the library."
    };
  }

  const full = /^examples\/(.+)\/full$/.exec(route);
  const doc = full ? exampleDocs.find((entry) => entry.slug === full[1]) : undefined;

  if (doc) {
    return {
      title: `${doc.name} — Gryt UI`,
      description: doc.description
    };
  }

  throw new Error(
    `prerender: ${route} has no share card and no stub. Add one to stubFor, or give it an entry in og-pages.ts.`
  );
}

/** index.html with the placeholder title dropped and a real head injected. */
function render(shell: string, head: string): string {
  return shell
    // Drop the placeholder title from the shell so it cannot win by being first.
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace("</head>", `  ${head}\n  </head>`);
}

function write(route: string, html: string) {
  const dir = route === "" ? distDir : join(distDir, route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

function main() {
  const shell = readFileSync(join(distDir, "index.html"), "utf8");

  if (!shell.includes("</head>")) {
    throw new Error("prerender: built index.html has no </head> to inject into");
  }

  const byRoute = new Map(ogPages.map((page) => [page.route, page]));

  // Drift in the direction the route list cannot catch: a share card for a page
  // the router no longer serves. Cheap to check while the map is here.
  const orphans = ogPages
    .map((page) => page.route)
    .filter((route) => !docsRoutes.includes(route));

  if (orphans.length > 0) {
    throw new Error(
      `prerender: og-pages.ts names routes that are not in src/routes.ts: ${orphans.join(", ")}`
    );
  }

  for (const route of docsRoutes) {
    const page = byRoute.get(route);

    if (page) {
      write(route, render(shell, headFor(page)));
      continue;
    }

    const stub = stubFor(route);
    write(route, render(shell, noindexHead(stub.title, stub.description)));
  }

  // nginx serves this for anything that does not resolve, with a 404 status.
  // The SPA boots from it exactly as it does from any other entry point, and
  // the catch-all route renders NotFound.
  const notFound = noindexHead("Page not found — Gryt UI", "There is nothing at this address.");
  writeFileSync(join(distDir, "404.html"), render(shell, notFound));

  console.log(
    `prerender: ${docsRoutes.length} routes + 404.html -> dist (origin ${ORIGIN})`
  );
}

main();
