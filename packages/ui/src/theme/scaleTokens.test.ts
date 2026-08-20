// Read off disk, for the same reason motionTokens.test.ts does: this is a check
// on what the components' class strings say, and Vite's plugins are not
// involved in that.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { grytScaleSteps } from "@gryt/theme";

const componentsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "components"
);

function source(component: string): string {
  return readFileSync(join(componentsDir, component, `${component}.tsx`), "utf8");
}

/**
 * The scale a Tailwind arbitrary value asks for, e.g. `active:scale-[0.96]`.
 *
 * Matched loosely on the variant prefix because the components qualify these
 * differently — `not-data-disabled:`, `not-[[aria-haspopup]]:`, `group-` on the
 * slider thumb — and the qualifiers are about *when* it applies, which is not
 * what this test is checking.
 */
function scaleFor(css: string, state: "hover" | "active"): number {
  const match = new RegExp(`${state}:(?:[a-z-]+:)*scale-\\[([0-9.]+)\\]`).exec(css);
  if (!match) throw new Error(`no ${state}: scale found`);
  return Number(match[1]);
}

/**
 * The press and hover scales exist twice: as arbitrary values in these class
 * strings, and as `grytScaleSteps` in @gryt/theme, which is what React Native
 * reads — there is no Tailwind there to read a class from.
 *
 * They are the same interaction, so they have to be the same numbers, and they
 * are exactly the kind of thing that drifts. GRYT-390 was partly a report that
 * the native controls had no press feedback at all; the next version of that
 * bug is native having some and it being 0.96 everywhere because whoever added
 * it did not notice that a checkbox presses further than a button.
 *
 * `hover` is asserted too, even though React Native never uses it. It is in the
 * token so the pair stays together and so nobody ports it — the comment on
 * `grytScaleSteps` says to leave it alone, and a comment nobody tests is a
 * comment that stops being true.
 */
describe("press and hover scales match @gryt/theme", () => {
  const cases: [keyof typeof grytScaleSteps, string][] = [
    ["button", "Button"],
    ["iconButton", "IconButton"],
    ["checkbox", "Checkbox"],
    ["radio", "Radio"],
    ["switch", "Switch"],
    ["toggle", "Toggle"],
    ["toast", "Toast"],
    ["sliderThumb", "Slider"],
  ];

  for (const [token, component] of cases) {
    it(`${component} presses to ${grytScaleSteps[token].press}`, () => {
      expect(scaleFor(source(component), "active")).toBe(grytScaleSteps[token].press);
    });

    it(`${component} hovers to ${grytScaleSteps[token].hover}`, () => {
      expect(scaleFor(source(component), "hover")).toBe(grytScaleSteps[token].hover);
    });
  }

  it("covers every component that declares a press scale", () => {
    // Otherwise adding a ninth scaling component silently gets no coverage,
    // which is how the list above stops being the list.
    const declared = cases.map(([, component]) => component).sort();
    const found = readFileSync(join(componentsDir, "..", "index.ts"), "utf8");
    for (const component of declared) {
      expect(found).toContain(component);
    }
    expect(declared).toHaveLength(Object.keys(grytScaleSteps).length);
  });
});
