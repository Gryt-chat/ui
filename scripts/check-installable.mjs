// Packs a workspace package and installs the tarball into an empty directory.
//
// This is the only check that looks at the manifest the way a consumer resolves
// it. publint and attw both run against the workspace, where `workspace:*` is a
// legitimate dependency spec, so both passed on @gryt/ui-native 0.1.0 while npm
// refused to install it at all:
//
//   npm error code EUNSUPPORTEDPROTOCOL
//   npm error Unsupported URL Type "workspace:": workspace:*
//
// That release is on npm and cannot be replaced, which is the cost of not
// having had this (GRYT-370).
//
// --legacy-peer-deps because npm 7 and up install peer dependencies
// automatically, and react-native is a large download that proves nothing here.
// The failure this catches happens during resolution, before peers matter.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const pkg = process.argv[2];
if (!pkg) {
  console.error("usage: check-installable.mjs <package-dir>");
  process.exit(1);
}

const dir = resolve(pkg);
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

run("npm", ["pack", "--silent"], dir);
const tarball = readdirSync(dir).find((f) => f.endsWith(".tgz"));
if (!tarball) {
  console.error(`no tarball produced in ${dir}`);
  process.exit(1);
}

const consumer = mkdtempSync(join(tmpdir(), "gryt-installable-"));
writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true }));

try {
  run("npm", ["install", join(dir, tarball), "--legacy-peer-deps", "--no-audit", "--no-fund"], consumer);
  console.log(`check-installable: ${tarball} installs cleanly`);
} catch {
  // npm has already printed why on stderr. A Node stack trace on top of it
  // only buries the one line that matters.
  console.error(`check-installable: ${tarball} does not install`);
  process.exitCode = 1;
} finally {
  rmSync(join(dir, tarball), { force: true });
  rmSync(consumer, { recursive: true, force: true });
}
