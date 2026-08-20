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
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const pkg = process.argv[2];
if (!pkg) {
  console.error("usage: check-installable.mjs <package-dir>");
  process.exit(1);
}

const dir = resolve(pkg);
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

function packInto(packageDir) {
  run("npm", ["pack", "--silent"], packageDir);
  const produced = readdirSync(packageDir).find((f) => f.endsWith(".tgz"));
  if (!produced) {
    console.error(`no tarball produced in ${packageDir}`);
    process.exit(1);
  }
  return join(packageDir, produced);
}

// Workspace siblings are resolved from local tarballs, not from the registry.
//
// A package that depends on a sibling names a real semver range, because that
// is what consumers install. On the registry that range resolves; on a pull
// request adding a brand new sibling it cannot, because nothing is published
// yet — @gryt/ui and @gryt/ui-native both went un-installable the moment they
// started depending on @gryt/theme, and the check was right to say so and
// useless to act on.
//
// Overriding to the local tarball keeps the thing this check exists for: it
// still resolves the manifest the way a consumer does, and still catches a
// `workspace:*` that escaped into a published range (GRYT-370). Each sibling's
// own installability is covered by its own run.
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
const overrides = {};
const siblingTarballs = [];

// The spec is checked before anything is overridden. An override resolves a
// dependency whatever its spec says, which would hide the exact bug this file
// was written for: with `workspace:*` put back on a sibling, the install
// succeeded and the check went green. So a sibling that names something npm
// cannot install from a registry fails here, loudly, before the override can
// paper over it.
const UNPUBLISHABLE = /^(workspace|link|file|portal):/;

for (const [name, spec] of Object.entries(manifest.dependencies ?? {})) {
  for (const group of ["packages", "apps"]) {
    const candidate = join(workspaceRoot, group, name.replace(/^@[^/]+\//, ""));
    let candidateName;
    try {
      candidateName = JSON.parse(readFileSync(join(candidate, "package.json"), "utf8")).name;
    } catch {
      continue;
    }
    if (candidateName !== name) continue;

    if (UNPUBLISHABLE.test(spec)) {
      console.error(
        `check-installable: ${manifest.name} depends on ${name} as "${spec}", which no consumer can install. ` +
          `Give it a real semver range — this is what shipped @gryt/ui-native 0.1.0 broken (GRYT-370).`
      );
      process.exit(1);
    }

    const packed = packInto(candidate);
    overrides[name] = `file:${packed}`;
    siblingTarballs.push(packed);
  }
}

const tarballPath = packInto(dir);
const tarball = tarballPath.slice(dir.length + 1);

const consumer = mkdtempSync(join(tmpdir(), "gryt-installable-"));
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({ name: "consumer", private: true, ...(Object.keys(overrides).length ? { overrides } : {}) })
);

if (siblingTarballs.length > 0) {
  console.log(`check-installable: resolving ${Object.keys(overrides).join(", ")} from the workspace`);
}

try {
  run("npm", ["install", join(dir, tarball), "--legacy-peer-deps", "--no-audit", "--no-fund"], consumer);
  console.log(`check-installable: ${tarball} installs cleanly`);
} catch {
  // npm has already printed why on stderr. A Node stack trace on top of it
  // only buries the one line that matters.
  console.error(`check-installable: ${tarball} does not install`);
  process.exitCode = 1;
} finally {
  rmSync(tarballPath, { force: true });
  for (const packed of siblingTarballs) rmSync(packed, { force: true });
  rmSync(consumer, { recursive: true, force: true });
}
