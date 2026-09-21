/* Holds dist/sitemap.xml to the pages on disk, both ways: every entry is a page whose
 * canonical is that exact URL, and every page with a canonical is an entry. Run after prerender. */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const ORIGIN = (process.env.DOCS_ORIGIN ?? "https://ui.gryt.chat").replace(
  /\/$/,
  ""
);

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return pages(full);
    return entry === "index.html" ? [full] : [];
  });
}

function head(file: string) {
  const html = readFileSync(file, "utf8");
  return {
    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1],
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html)
  };
}

const problems: string[] = [];
const xml = readFileSync(join(distDir, "sitemap.xml"), "utf8");
const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) =>
  match[1].replace(/&amp;/g, "&")
);
const listed = new Set(locs);

if (locs.length === 0) problems.push("sitemap.xml lists no pages");
if (listed.size !== locs.length)
  problems.push("sitemap.xml lists a page twice");

for (const loc of locs) {
  if (!loc.startsWith(`${ORIGIN}/`)) {
    problems.push(`${loc} is not on ${ORIGIN}`);
    continue;
  }
  const file = join(distDir, new URL(loc).pathname, "index.html");
  if (!existsSync(file)) {
    problems.push(
      `${loc} is listed but there is no ${relative(distDir, file)}`
    );
    continue;
  }
  const { canonical, noindex } = head(file);
  if (noindex) problems.push(`${loc} is listed but the page is noindex`);
  else if (canonical !== loc)
    problems.push(
      `${loc} is listed but its canonical is ${canonical ?? "missing"}`
    );
}

for (const file of pages(distDir)) {
  const { canonical, noindex } = head(file);
  if (noindex || !canonical || listed.has(canonical)) continue;
  problems.push(
    `${relative(distDir, file)} has canonical ${canonical}, which is not in sitemap.xml`
  );
}

const robots = existsSync(join(distDir, "robots.txt"))
  ? readFileSync(join(distDir, "robots.txt"), "utf8")
  : "";
if (!robots.split("\n").includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) {
  problems.push(`robots.txt has no "Sitemap: ${ORIGIN}/sitemap.xml" line`);
}

if (problems.length > 0) {
  console.error(`check-sitemap: ${problems.length} problem(s)\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `check-sitemap: ${locs.length} pages, each one on disk under its own canonical.`
);
