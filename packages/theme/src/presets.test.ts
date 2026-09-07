import { describe, expect, it } from "vitest";
import { contrast } from "./oklch";
import type { GrytThemePreset } from "./presets";
import {
  GRYT_THEME_COLLECTIONS,
  grytPresets,
  grytPresetsByCollection
} from "./presets";

/**
 * A preset is data, and data rots quietly: a typo in `collection` drops a theme
 * out of the picker without failing anything, and a hand-edited hex value can
 * put grey text on a grey page. Both are checked here.
 */
describe("the presets", () => {
  it("gives every preset a unique id and name", () => {
    const ids = grytPresets.map((p) => p.id);
    const names = grytPresets.map((p) => p.name);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("puts every preset in a collection that exists", () => {
    for (const preset of grytPresets) {
      expect(GRYT_THEME_COLLECTIONS).toContain(preset.collection);
    }
  });

  // The grouped view is what the picker renders, so a preset missing from it is
  // a preset nobody can select. Counting both ways catches a collection name
  // that is spelled right in the array and wrong on a preset.
  it("shows every preset in the grouped view", () => {
    const grouped = grytPresetsByCollection.flatMap((g) => g.presets);
    expect(grouped).toHaveLength(grytPresets.length);
    expect(new Set(grouped.map((p) => p.id))).toEqual(
      new Set(grytPresets.map((p) => p.id))
    );
  });

  it("leaves no collection empty", () => {
    for (const group of grytPresetsByCollection) {
      expect(group.presets.length).toBeGreaterThan(0);
    }
  });
});

/* Two bars, because the two halves of the library are not the same promise.
 *
 * A ported palette is what its author published. Solarized is low contrast on
 * purpose and Catppuccin Latte measures 6.57 on its own page; holding either to
 * Gryt's bar would mean changing the thing being ported. So every preset is
 * held to AA, which catches a typo without arguing with a published palette,
 * and the generated ones are held to the bar they were generated against. */
const PORTED_FLOOR: [string, (p: GrytThemePreset["theme"]) => number, number][] = [
  ["dark text on page", (t) => contrast(t.dark.text, t.dark.bg), 4.5],
  ["dark text on surface", (t) => contrast(t.dark.text, t.dark.surface), 4.5],
  ["dark muted on page", (t) => contrast(t.dark.muted, t.dark.bg), 3],
  ["light text on page", (t) => contrast(t.light.text, t.light.bg), 4.5],
  ["light text on surface", (t) => contrast(t.light.text, t.light.surface), 4.5],
  ["light muted on page", (t) => contrast(t.light.muted, t.light.bg), 3]
];

const GENERATED_RULES: [string, (p: GrytThemePreset["theme"]) => number, number][] = [
  ["dark text on page", (t) => contrast(t.dark.text, t.dark.bg), 11],
  ["dark text on surface", (t) => contrast(t.dark.text, t.dark.surface), 10],
  ["dark muted on page", (t) => contrast(t.dark.muted, t.dark.bg), 4.5],
  ["dark muted on surface", (t) => contrast(t.dark.muted, t.dark.surface), 4.2],
  ["dark accent on page", (t) => contrast(t.hue.accent, t.dark.bg), 3],
  ["dark border on page", (t) => contrast(t.dark.border, t.dark.bg), 1.15],
  ["light text on page", (t) => contrast(t.light.text, t.light.bg), 11],
  ["light text on surface", (t) => contrast(t.light.text, t.light.surface), 11],
  ["light muted on page", (t) => contrast(t.light.muted, t.light.bg), 4.5],
  ["light muted on surface", (t) => contrast(t.light.muted, t.light.surface), 4.5],
  ["light border on page", (t) => contrast(t.light.border, t.light.bg), 1.12],
  ["ink on accent", (t) => contrast(t.hue.onAccent, t.hue.accent), 7],
  ["ink on secondary", (t) => contrast(t.hue.onSecondary, t.hue.secondary), 7],
  ["ink on danger", (t) => contrast(t.hue.onDanger, t.hue.danger), 7]
];

/** The collections generated in OKLCH, as opposed to ported or hand-picked. */
const GENERATED = new Set(["Midnight", "Winter", "Spring", "Summer", "Autumn", "Nature", "Pastel"]);

describe("every preset stays readable", () => {
  for (const preset of grytPresets) {
    it(`${preset.collection} / ${preset.name}`, () => {
      for (const [what, measure, floor] of PORTED_FLOOR) {
        expect(
          Number(measure(preset.theme).toFixed(2)),
          `${what} in ${preset.name}`
        ).toBeGreaterThanOrEqual(floor);
      }
    });
  }
});

describe("the generated collections hold Gryt's own bar", () => {
  for (const preset of grytPresets.filter((p) => GENERATED.has(p.collection))) {
    it(`${preset.collection} / ${preset.name}`, () => {
      for (const [what, measure, floor] of GENERATED_RULES) {
        expect(
          Number(measure(preset.theme).toFixed(2)),
          `${what} in ${preset.name}`
        ).toBeGreaterThanOrEqual(floor);
      }
    });
  }
});

/*
 * A theme with `lightHue` carries a second set of fills and a second set of ink
 * to sit on them, and until GRYT-994 nothing looked at it. Winter Arc passed on
 * its dark half and measured 4.68 on the light one.
 *
 * Only the generated collections are held here. Every ported palette with a
 * lightHue misses this bar — Nord's light accent is 3.50 against its own ink —
 * and those are published values, so holding them to it would mean changing the
 * thing being ported.
 */
describe("a split light hue set is held to the same bar", () => {
  const split = grytPresets.filter(
    (preset) => GENERATED.has(preset.collection) && preset.theme.lightHue !== null
  );

  for (const preset of split) {
    it(`${preset.collection} / ${preset.name}`, () => {
      const hues = preset.theme.lightHue!;
      const pairs = [
        ["ink on accent", hues.onAccent, hues.accent],
        ["ink on secondary", hues.onSecondary, hues.secondary],
        ["ink on danger", hues.onDanger, hues.danger]
      ] as const;

      for (const [what, ink, fill] of pairs) {
        expect(
          Number(contrast(ink, fill).toFixed(2)),
          `${what} in ${preset.name}'s light half`
        ).toBeGreaterThanOrEqual(7);
      }
    });
  }
});
