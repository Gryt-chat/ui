// Read off disk for the same reason theme.test.ts does: this is a check on the
// source text, and Vite's plugins are not involved in that.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrast, grytScales, grytScalesLight } from "@gryt/theme";

const componentsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "components"
);

function sources(dir: string): Array<[string, string]> {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sources(path);
    if (!/\.tsx?$/.test(entry) || entry.endsWith(".test.tsx")) return [];
    return [[path, readFileSync(path, "utf8")] as [string, string]];
  });
}

const HUES = ["accent", "secondary", "success", "danger", "warning"] as const;

/**
 * The flat hue names are step 9 — the solid fill, the same colour in both
 * appearances, and **wrong for text**: it reads on a dark page and not on a
 * white panel. The contrast tests below measure step 11, which nothing used, so
 * a success Chip in light mode was bright green on pale green and passed.
 */
describe("tone colours", () => {
  it("never draws text in a hue's flat name", () => {
    const flat = new RegExp(
      `text-gryt-(${HUES.join("|")})(?![-0-9a-z])`,
      "g"
    );
    const offenders = sources(componentsDir).flatMap(([path, source]) => {
      const found = source.match(flat);
      return found === null ? [] : [`${path}: ${found.join(", ")}`];
    });

    expect(offenders).toEqual([]);
  });
});

describe("the steps a tone is drawn from", () => {
  const sets = [
    ["dark", grytScales],
    ["light", grytScalesLight]
  ] as const;

  for (const [name, scales] of sets) {
    it(`carries tone text on its own tint, ${name}`, () => {
      // Step 11 on step 3, which is what a Chip, an Alert and a Toast are:
      // text on that hue's component background.
      for (const hue of HUES) {
        expect(contrast(scales[hue][10], scales[hue][2])).toBeGreaterThanOrEqual(
          4.5
        );
      }
    });

    it(`carries tone text on the page and on a panel, ${name}`, () => {
      for (const hue of HUES) {
        for (const background of [scales.neutral[0], scales.neutral[1]]) {
          expect(contrast(scales[hue][10], background)).toBeGreaterThanOrEqual(
            4.5
          );
        }
      }
    });
  }
});
