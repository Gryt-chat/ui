/**
 * `dist/index.js` is one file that imports nothing, and a second `entry:` silently undoes
 * that. The bare `#!` check is the other half: `npx` runs the CLI file directly.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

const dist = path.resolve(import.meta.dir, "..", "dist");
const problems: string[] = [];

const index = readFileSync(path.join(dist, "index.js"), "utf8");
const imports = [...index.matchAll(/(?:^|\n)\s*import\s[^;]*?from\s*["']([^"']+)["']/g)].map(
  (m) => m[1],
);
if (imports.length > 0) {
  problems.push(
    `dist/index.js imports ${[...new Set(imports)].join(", ")}.\n` +
      "  It is meant to be one self-contained file. The usual cause is a second\n" +
      "  entry added to vite.config.ts — build the new thing with its own config\n" +
      "  instead, the way vite.config.cli.ts does.",
  );
}

const cjs = readFileSync(path.join(dist, "index.cjs"), "utf8");
if (/\brequire\((?!"node:)/.test(cjs.replace(/require\(["']\.\/package\.json["']\)/g, ""))) {
  problems.push("dist/index.cjs requires something. Same reason as above.");
}

const cli = readFileSync(path.join(dist, "cli.js"), "utf8");
if (!cli.startsWith("#!")) {
  problems.push("dist/cli.js has no shebang, so npx cannot run it.");
}

if (problems.length > 0) {
  console.error("dist is not the shape it should be:\n");
  for (const p of problems) console.error(`- ${p}\n`);
  process.exit(1);
}

console.log(
  `dist ok — index.js self-contained (${Math.round(index.length / 1024)}kB), cli.js runnable`,
);
