/**
 * The colours an egg icon comes in.
 *
 * The field is the owl's own background, the same string `owlPalette` returns,
 * not a colour picked to go with it. A server rail and a member list sit next
 * to each other on screen, and "the same family" is a thing that drifts on the
 * next edit where "the same value" is not.
 *
 * What differs from the owls is the shape of the rest. An owl needs named roles
 * for a bird that is always drawn the same way. An icon needs a ladder: three
 * shells that separate from each other and from the field, each with the ink
 * its pattern is drawn in. The numbers below are lightnesses on that ladder and
 * the gaps between them are the design, so `palette.test.ts` asserts every one
 * — at all ten hues, because a tweak that reads fine in violet is the kind that
 * loses the middle egg in gold.
 *
 * Two things here are deliberate defences against the icon reading as Easter,
 * which is the failure mode of drawing servers as eggs:
 *
 *   - The shells are never pastel on pastel. Either the field is deep and the
 *     eggs are pale, or the field is bright and the eggs are deep. A soft egg
 *     on a soft field is the Easter signature and no scheme here produces one.
 *   - The inks sit about 22 to 26 points off their shell, not 50. That is a
 *     surface rather than a decoration — the test has an upper bound as well as
 *     a lower one, so "make it pop" fails.
 *
 * `day` and `dusk` are close to each other, and that is honest rather than
 * hidden: both are deep eggs on a bright field, separated by saturation and a
 * few points of lightness, exactly as the owls' two bright schemes are. There
 * are only two families once a shell has to clear the field by a visible
 * margin, and inventing a third would mean one of them not clearing it.
 */

import { hsl, HUE_BY_NAME, PALETTE_NAMES } from "../palette";
import type { PaletteName, PaletteScheme } from "../types";
import type { EggPalette } from "./types";

export function eggPalette(
  name: PaletteName,
  scheme: PaletteScheme
): EggPalette {
  const h = HUE_BY_NAME[name];

  // The same throw the owl palette makes, for the same reason: by the time a
  // name reaches here it has been chosen, and `hsl` on an undefined hue returns
  // "#d062NaN" — a string no renderer draws and no type checker catches.
  if (h === undefined) {
    throw new Error(
      `"${name}" is not one of the egg palettes. One of: ${PALETTE_NAMES.join(", ")}.`
    );
  }

  // Pale eggs on the owl's deep field.
  if (scheme === "night") {
    return {
      field: hsl(h, 36, 26),
      fieldDeep: hsl(h + 2, 38, 19),
      fieldInk: hsl(h + 2, 34, 32),
      shells: [hsl(h + 2, 38, 44), hsl(h + 8, 42, 60), hsl(h + 14, 46, 76)],
      inks: [hsl(h + 8, 42, 66), hsl(h + 2, 38, 36), hsl(h + 4, 40, 52)],
      inkSofts: [hsl(h + 4, 40, 55), hsl(h + 6, 40, 71), hsl(h + 8, 42, 65)]
    };
  }

  // Deep eggs on the owl's bright field.
  if (scheme === "day") {
    return {
      field: hsl(h, 60, 64),
      fieldDeep: hsl(h + 4, 58, 58),
      fieldInk: hsl(h, 50, 52),
      shells: [hsl(h - 4, 34, 22), hsl(h + 2, 34, 34), hsl(h + 10, 36, 46)],
      inks: [hsl(h + 8, 38, 45), hsl(h + 10, 40, 57), hsl(h + 14, 42, 69)],
      inkSofts: [hsl(h + 4, 36, 33), hsl(h + 8, 38, 45), hsl(h + 12, 40, 57)]
    };
  }

  // The same again, hotter, on the owl's saturated field.
  return {
    field: hsl(h, 54, 60),
    fieldDeep: hsl(h + 4, 52, 53),
    fieldInk: hsl(h + 2, 46, 47),
    shells: [hsl(h - 6, 44, 16), hsl(h, 46, 28), hsl(h + 8, 48, 40)],
    inks: [hsl(h + 10, 46, 39), hsl(h + 12, 48, 51), hsl(h + 18, 52, 63)],
    inkSofts: [hsl(h + 4, 44, 27), hsl(h + 8, 46, 39), hsl(h + 14, 48, 51)]
  };
}

/** Every egg palette, for a picker or a contact sheet. */
export function allEggPalettes(): {
  name: PaletteName;
  scheme: PaletteScheme;
  palette: EggPalette;
}[] {
  const out: {
    name: PaletteName;
    scheme: PaletteScheme;
    palette: EggPalette;
  }[] = [];
  for (const name of PALETTE_NAMES) {
    for (const scheme of ["night", "day", "dusk"] as PaletteScheme[]) {
      out.push({ name, scheme, palette: eggPalette(name, scheme) });
    }
  }
  return out;
}
