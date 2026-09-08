/**
 * The vocabulary of an egg: a shape and a surface, standing for something that is not a
 * person. The colours are the owl's, so the two lists do not look assembled.
 */

import type { PaletteName, PaletteScheme } from "../types";

/** How many eggs. Sivert drew an arrangement for each. */
export type EggCount = 1 | 2 | 3;

/** How a pattern tile's paths are painted. */
export type EggPatternMode = "fill" | "stroke" | "round";

/**
 * One tile from pattern.monster, with everything its UI would have decided already
 * decided. See scripts/egg-pattern.ts; only the scale moves at draw time.
 */
export interface EggPattern {
  /** pattern.monster's slug. It is the draw key, so it never changes. */
  name: string;
  mode: EggPatternMode;
  /** The tile, in its own units. */
  width: number;
  height: number;
  /** How wide one repeat is drawn, in artboard units, before the seed nudges it. */
  tile: number;
  /** Stroke width in tile units. Ignored when `mode` is `fill`. */
  stroke: number;
  /** The ink layers, back to front. */
  layers: readonly string[];
}

/**
 * The tones an egg icon is drawn from: three shell rungs, deep to light back to front.
 * Each carries the two inks its pattern uses, so contrast is decided here once.
 */
export interface EggPalette {
  /** The tile behind everything. */
  field: string;
  /** The field's other end, for the gradient across it. */
  fieldDeep: string;
  /** The field's own texture, a step off the field itself. */
  fieldInk: string;
  /** Back to front: the shell each egg is painted in. */
  shells: readonly [string, string, string];
  /** The strong ink on each shell. */
  inks: readonly [string, string, string];
  /** A second, quieter ink, for a tile with more than one layer. */
  inkSofts: readonly [string, string, string];
}

export interface EggOptions {
  /** Rendered width/height. The viewBox is always 1024x1024. */
  size?: number;

  /** A named palette, or partial colour overrides on top of the seeded one. */
  palette?: PaletteName | Partial<EggPalette>;
  scheme?: PaletteScheme;

  /** How many eggs. Omit to let the seed decide. */
  count?: EggCount;

  /**
   * The pattern on each egg, by name, back to front. `null` leaves that egg plain; a
   * shorter array only fixes the eggs it covers.
   */
  patterns?: readonly (string | null)[];

  /**
   * The palette each egg's tone is taken from, back to front. `null` pins that egg to the
   * icon's own; omit a slot to let the seed decide — see chooseHue.
   */
  hues?: readonly (PaletteName | null)[];

  /** The field's texture by name, `null` for a bare field. */
  fieldPattern?: string | null;

  /** `false` draws the eggs on nothing, for a caller that brings its own tile. */
  background?: boolean | string;

  /**
   * How close the tile crops in. 1 is the drawing as painted; past about 1.5 the eggs run
   * off the edge and read as a mark. Omit to let the seed pick — see ZOOMS.
   */
  zoom?: number;

  /** 0 is a square, 1 is a circle. The default is a square. */
  cornerRadius?: number;

  /** Adds <title> and an accessible name for inline SVG. */
  title?: string;
}

/** One egg, resolved: which shell, which pattern, and how that pattern sits. */
export interface ResolvedEgg {
  /** Closed path data on the 1024 artboard. */
  d: string;
  /** The palette this egg's tone came from. Usually the icon's own. */
  hue: PaletteName;
  shell: string;
  ink: string;
  inkSoft: string;
  pattern: EggPattern | null;
  /** Degrees. The tile is turned before it is scaled. */
  angle: number;
  /** How wide one repeat is drawn, in artboard units. */
  tile: number;
}

export interface ResolvedEggs {
  seed: string;
  size: number;
  paletteName: PaletteName;
  scheme: PaletteScheme;
  palette: EggPalette;
  count: EggCount;
  eggs: readonly ResolvedEgg[];
  field: {
    pattern: EggPattern | null;
    angle: number;
    tile: number;
  };
  background: string | null;
  /** How much the eggs are scaled up inside the tile. 1 is as painted. */
  zoom: number;
  cornerRadius: number;
  title?: string;
}
