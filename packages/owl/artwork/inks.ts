/**
 * The colours accessories are drawn in, and what each one means.
 *
 * An accessory is drawn in whatever looks right in the drawing tool, not in the
 * palette an owl is finally rendered with — a bow tie drawn teal has to work on
 * all thirty palettes, so its colours are recorded as roles and repainted per
 * owl. This is that lookup.
 *
 * It is one table for every drawing rather than one per drawing, and that is
 * not a simplification: the seventeen `map` blocks this replaced held thirty
 * distinct colours between them and never once disagreed about what one meant.
 * `#282d33` was `accent` in superman-glasses, fbi-glasses and headset alike.
 * They were seventeen copies of one palette.
 *
 * Which is what makes adding an accessory free. Draw it in colours already
 * below and there is nothing to edit — drop the SVG in this folder and run the
 * script. A colour that is not here stops the build and prints the line to add,
 * because the alternative is guessing, and a guessed role is an owl wearing
 * something the wrong shade with nothing to say so.
 *
 * Grouped by role, lightest first inside each.
 */

import type { PaletteSlot } from "../src/types";

export const INKS: Record<string, PaletteSlot> = {
  // Near-white: pearls, the crown of a winter hat, petals.
  "#fbf1db": "trimSoft",
  "#ebebeb": "trimSoft",
  "#fadf99": "trimSoft",
  "#bfdbcb": "trimSoft",

  // The highlight rung, for a four-tone garment.
  "#53c5be": "trimLight",
  "#258a95": "trimLight",
  "#6bb2b5": "trimLight",       // hat_bear
  "#259099": "trimLight",       // hat_cap
  "#1a7786": "trimLight",       // hat_winter

  // The body of an accessory.
  "#57a695": "trim",
  "#6a9070": "trim",
  "#27979b": "trim",
  "#3e8077": "trim",
  "#21858f": "trim",
  "#257773": "trim",
  "#288c94": "trim",       // hat_bear
  "#1f828b": "trim",       // hat_cap
  "#1d7282": "trim",       // hat_winter
  "#1c7c88": "trim",       // hat_bucket

  // Its shaded half.
  "#387a71": "trimDeep",
  "#1b7681": "trimDeep",
  "#336762": "trimDeep",
  "#376452": "trimDeep",
  "#186975": "trimDeep",
  "#135763": "trimDeep",
  "#217f8b": "trimDeep",       // hat_bear
  "#166472": "trimDeep",       // hat_cap
  "#16646e": "trimDeep",       // hat_cap
  "#186270": "trimDeep",       // hat_winter
  "#136773": "trimDeep",       // hat_bucket

  // The dark one: frames, outlines, the bird's own eyes and beak.
  "#0b6970": "accent",
  "#145a65": "accent",
  "#265251": "accent",
  "#2e4c51": "accent",
  "#254b40": "accent",
  "#114f5b": "accent",
  "#282d33": "accent",
  "#0f4a53": "accent",       // hat_cap

  /*
   * The canonical swatch: one colour per role, and the only one new work uses.
   *
   * These are `realPalette` — the exact colours `--base` paints the bird in, so
   * they are already on the artboard to eyedrop from, and they are what the
   * Figma styles are named after. A drawing made from them needs no entry here
   * at all, because every colour is definitionally its own role. There is
   * nothing to decide and so nothing to get wrong.
   *
   * The forty-odd entries below are what that replaces: seven roles wearing
   * forty coats of paint, because every drawing picked its own teal. `trim`
   * alone is eleven near-identical hexes. Each new one was a judgement call by
   * whoever ran the script about which rung it belonged to, and a wrong call is
   * an owl wearing something the wrong shade with nothing to say so.
   *
   * They stay because the drawings that used them are in the history. Nothing
   * new should need them.
   */
  "#6cdac8": "background",
  "#33665a": "body",
  "#cdeaef": "face",
  "#244c43": "wing",
  "#d4e9ed": "trimSoft",
  "#95d0cc": "trimLight",
  "#65b3a9": "trim",
  "#438e87": "trimDeep",
  "#c98936": "gold",
  "#a36c2e": "goldDeep",

  // Warm, and outside the palette's hue on purpose.
  "#e7c25d": "gold",
  "#c88735": "gold",

  // The shaded half of that.
  "#a08332": "goldDeep",
  "#a08232": "goldDeep",
  "#ab712d": "goldDeep",
};
