import { readFileSync, writeFileSync } from "node:fs";

export function assertPatchBeta(version, current) {
  if (!/^\d+\.\d+\.\d+-beta\.\d+$/.test(version)) throw new Error("Only beta versions are allowed");
  const [major, minor, patch] = current.split(".").map(Number);
  if (version.split("-")[0] !== `${major}.${minor}.${patch + 1}`) throw new Error("Only the next UI patch is allowed");
}

if (process.argv[1]?.endsWith("prepare-ui-beta.mjs")) {
  const path = new URL("../packages/ui/package.json", import.meta.url);
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  assertPatchBeta(process.argv[2] ?? "", pkg.version);
  pkg.version = process.argv[2];
  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
}
