/**
 * The vocabulary of an owl. The body, wings, face plate and beak have no styles and no
 * varying proportions: this is one character, not a face generator.
 */

export type Seed = string | number;

/** Ear tufts. The drawn owl has them; some owls do not. */
export type EarStyle = "none" | "tufts";

/**
 * A part of the bird itself, as opposed to something it is wearing. Named so a drawing
 * can say which of them it replaces — see `hides` on Accessory.
 */

/**
 * A piece of the bird a drawing can replace. The paired ones are individually
 * addressable: a wink brings a closed eye and leaves the open one.
 */
export type OwlPart =
  | "earTufts"
  | "body"
  | "wings"
  | "wingLeft"
  | "wingRight"
  | "face"
  | "eyes"
  | "eyeLeft"
  | "eyeRight"
  | "beak";

/**
 * Where an accessory is worn. One per slot, drawn independently, so a hat, glasses and a
 * scarf are three rolls. `expression` is a slot like the others.
 */
export type AccessorySlot = "expression" | "eyewear" | "head" | "neck" | "body";

/**
 * Where an accessory sits in the stack: `overEyes` for a painted lens, `overFace` for a
 * frame of holes, `overAll` for most things. Within a layer, they draw in slot order.
 */
export type AccessoryLayer = "behind" | "underFace" | "overFace" | "overEyes" | "overAll";

/**
 * The five colours an owl is drawn from, plus six for what it wears. `accent` is the dark
 * one; the `trim` three stay inside the palette's hue, and `gold` is the exception.
 */
export interface OwlPalette {
  background: string;
  body: string;
  face: string;
  accent: string;
  wing: string;
  /**
   * A rung above `trim`. The four-tone garments need it — a hoodie drawn in a
   * highlight, a body, a shadow and a deep shadow does not fit in three.
   */
  trimLight: string;
  trim: string;
  /** A shade under `trim`, for the shaded half of a two-tone accessory. */
  trimDeep: string;
  /** Near-white: pearls, the crown of a winter hat, petals. */
  trimSoft: string;
  gold: string;
  goldDeep: string;
}

/** A colour role an accessory's paths can ask for. */
export type PaletteSlot = keyof OwlPalette;

export interface OwlOptions {
  /** Rendered width/height. The viewBox is always 1024x1024. */
  size?: number;

  /** A named palette, or partial colour overrides on top of the seeded one. */
  palette?: PaletteName | Partial<OwlPalette>;
  scheme?: PaletteScheme;

  ears?: EarStyle;

  /**
   * What it is wearing, by accessory name, per slot. `null` empties a slot the seed would
   * have filled; omit a slot to let the seed decide.
   */
  wearing?: Partial<Record<AccessorySlot, string | null>>;

  /**
   * A palette to paint one slot's accessory in — per slot rather than per part, so every
   * choice is a ramp somebody drew. The scheme is not part of it: a tint takes the owl's.
   */
  tint?: Partial<Record<AccessorySlot, PaletteName>>;

  /** `false` draws the owl on nothing, for a caller that brings its own tile. */
  background?: boolean | string;

  /** 0 is a square, 1 is a circle. The default is square. */
  cornerRadius?: number;

  /** Adds <title> and an accessible name for inline SVG. */
  title?: string;
}

export interface ResolvedOwl {
  seed: string;
  size: number;
  paletteName: PaletteName;
  scheme: PaletteScheme;
  palette: OwlPalette;
  ears: EarStyle;
  /** The accessory chosen in each slot, by name. Absent means nothing. */
  wearing: Partial<Record<AccessorySlot, string>>;
  /** The palette each slot is painted in, where it is not the owl's own. */
  tint: Partial<Record<AccessorySlot, PaletteName>>;
  background: string | null;
  cornerRadius: number;
  title?: string;
}

/** One name per entry in TILE_HUES — see palette.ts. */
export type PaletteName =
  | "violet"
  | "amber"
  | "teal"
  | "pink"
  | "blue"
  | "green"
  | "red"
  | "gold"
  | "indigo"
  | "cyan";

/** How light the owl is against its background. */
export type PaletteScheme = "night" | "day" | "dusk";
