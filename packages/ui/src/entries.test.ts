import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

import * as root from "./index";
import * as theme from "./theme/index";

const srcDir = __dirname;
const entriesDir = join(srcDir, "entries");
const componentsDir = join(srcDir, "components");

const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === "test" ? [] : sourceFiles(full);
    return /\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name)
      ? [full]
      : [];
  });
}

describe("component entry points", () => {
  const entryNames = readdirSync(entriesDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => basename(file, ".ts"));

  it("gives every component folder a subpath", () => {
    const folders = readdirSync(componentsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "utils")
      .map((entry) => kebab(entry.name));

    // A new folder needs src/entries/<kebab-name>.ts; see "Adding a component" in the root README.
    expect(folders.filter((name) => !entryNames.includes(name))).toEqual([]);
  });

  it("exports everything the root exports from some subpath", async () => {
    const reachable = new Set(Object.keys(theme));
    for (const name of entryNames) {
      const entry = (await import(`./entries/${name}.ts`)) as Record<
        string,
        unknown
      >;
      for (const key of Object.keys(entry)) reachable.add(key);
    }

    expect(Object.keys(root).filter((key) => !reachable.has(key))).toEqual([]);
  });

  it('marks every interactive module "use client"', () => {
    const interactive =
      /\buse[A-Z]\w*\(|createContext|@base-ui\/|@phosphor-icons\/|\bon[A-Z]\w*=\{/;
    const missing = sourceFiles(srcDir)
      .filter((file) => {
        const code = readFileSync(file, "utf8");
        return interactive.test(code) && !/^"use client";/.test(code);
      })
      .map((file) => relative(srcDir, file));

    expect(missing).toEqual([]);
  });
});
