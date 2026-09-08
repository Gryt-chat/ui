/**
 * The egg ramp is a set of gaps, and this is where they are enforced. The schemes are
 * written once and used at ten hues, and hue shifts perceived lightness.
 */

import { describe, expect, it } from "vitest";

import { owlPalette, PALETTE_NAMES, PALETTE_SCHEMES } from "../palette";
import { allEggPalettes, eggPalette } from "./palette";

/** The L of `#rrggbb`, in the same percent the palette is written in. */
function lightness(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}

const apart = (a: string, b: string) => Math.abs(lightness(a) - lightness(b));

describe("every hue and scheme", () => {
  const all = allEggPalettes();

  it("covers all thirty", () => {
    expect(all).toHaveLength(PALETTE_NAMES.length * PALETTE_SCHEMES.length);
  });

  it("is all colours", () => {
    for (const { palette } of all) {
      for (const value of [
        palette.field,
        palette.fieldDeep,
        palette.fieldInk,
        ...palette.shells,
        ...palette.inks,
        ...palette.inkSofts
      ]) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  /*
   * Both ends of the field, because an egg sits over the middle of the gradient. Eleven
   * rather than twelve: a percent read back out of `#rrggbb` lands within half a point.
   */
  it("keeps every shell off the field", () => {
    for (const { name, scheme, palette } of all) {
      for (const [i, shell] of palette.shells.entries()) {
        for (const ground of [palette.field, palette.fieldDeep]) {
          expect(
            apart(shell, ground),
            `${name}/${scheme} shell ${i} against the field`
          ).toBeGreaterThanOrEqual(11);
        }
      }
    }
  });

  it("keeps each shell off the one behind it", () => {
    for (const { name, scheme, palette } of all) {
      const [a, b, c] = palette.shells;
      expect(
        apart(a, b),
        `${name}/${scheme} shells 0 and 1`
      ).toBeGreaterThanOrEqual(11);
      expect(
        apart(b, c),
        `${name}/${scheme} shells 1 and 2`
      ).toBeGreaterThanOrEqual(11);
    }
  });

  /*
   * Bounded above as well as below, and that is the point. White stripes on a coloured egg
   * is a decorated egg, and three to a tile is Easter; the lower bound keeps it visible.
   */
  it("gives every shell an ink that reads on it and does not shout", () => {
    for (const { name, scheme, palette } of all) {
      for (let i = 0; i < 3; i += 1) {
        const ink = apart(palette.shells[i]!, palette.inks[i]!);
        expect(ink, `${name}/${scheme} ink ${i}`).toBeGreaterThanOrEqual(18);
        expect(ink, `${name}/${scheme} ink ${i}`).toBeLessThanOrEqual(32);

        // The quiet one is meant to be quiet, so it only has a floor: below
        // this a second layer stops being visible at all.
        expect(
          apart(palette.shells[i]!, palette.inkSofts[i]!),
          `${name}/${scheme} soft ink ${i}`
        ).toBeGreaterThanOrEqual(8);
      }
    }
  });

  /*
   * Either a deep field with pale eggs or a bright field with deep eggs. A soft egg on a
   * soft field is the Easter signature, and this is what stops any scheme producing one.
   */
  it("puts every shell on one side of the field", () => {
    for (const { name, scheme, palette } of all) {
      const bright = lightness(palette.field) > 50;
      for (const [i, shell] of palette.shells.entries()) {
        expect(
          lightness(shell) < lightness(palette.field),
          `${name}/${scheme} shell ${i} against a ${bright ? "bright" : "deep"} field`
        ).toBe(bright);
      }
    }
  });

  // The same value the owls draw on, not a colour chosen to go with it.
  it("draws on the owl's own background", () => {
    for (const { name, scheme, palette } of all) {
      expect(palette.field, `${name}/${scheme}`).toBe(
        owlPalette(name, scheme).background
      );
    }
  });

  // A whisper, not a pattern. It has to be visible and it must not compete with
  // the eggs sitting on it.
  it("keeps the field's own texture faint", () => {
    for (const { name, scheme, palette } of all) {
      const gap = Math.min(
        apart(palette.fieldInk, palette.field),
        apart(palette.fieldInk, palette.fieldDeep)
      );
      expect(gap, `${name}/${scheme} field texture`).toBeGreaterThanOrEqual(4);
      expect(
        Math.max(
          apart(palette.fieldInk, palette.field),
          apart(palette.fieldInk, palette.fieldDeep)
        ),
        `${name}/${scheme} field texture`
      ).toBeLessThanOrEqual(22);
    }
  });

  it("gives the three schemes three different fields", () => {
    for (const name of PALETTE_NAMES) {
      const fields = PALETTE_SCHEMES.map((s) => eggPalette(name, s).field);
      expect(new Set(fields).size).toBe(3);
    }
  });

  // The same throw the owl palette makes: `hsl` on an undefined hue returns "#d062NaN",
  // which no renderer draws and no type checker catches.
  it("refuses a name it does not have", () => {
    expect(() => eggPalette("plum" as never, "dusk")).toThrow(
      /not one of the egg palettes/
    );
  });
});
