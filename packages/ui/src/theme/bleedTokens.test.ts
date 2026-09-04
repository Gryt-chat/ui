// Read off disk, for the same reason motionTokens.test.ts and
// scaleTokens.test.ts do: this is a check on the stylesheet's text.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { grytDrawerBleed } from "@gryt/theme";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "styles", "theme.css"),
  "utf8"
);

/**
 * The drawer bleed exists twice — `--gryt-drawer-bleed` here and
 * `grytDrawerBleed` in @gryt/theme, which React Native reads. If one widened
 * and the other did not, the seam of backdrop would come back on one platform
 * only and be reported as "the drawer flickers on my phone".
 */
describe("the drawer bleed matches theme.css", () => {
  it("is 4rem in the stylesheet", () => {
    const match = /--gryt-drawer-bleed:\s*([\d.]+)rem/.exec(css);
    expect(match, "--gryt-drawer-bleed is not defined in rem in theme.css").not.toBeNull();
    expect(Number(match![1]) * 16).toBe(grytDrawerBleed);
  });
});
