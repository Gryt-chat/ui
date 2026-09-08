/**
 * What an owl can wear. An accessory is exported on the same 1024 x 1024 frame as the
 * owl, positioned where it sits, and its path data goes in verbatim — no arithmetic.
 */
import { GENERATED_ACCESSORIES } from "./accessories.generated";
import type {
  AccessoryLayer,
  AccessorySlot,
  OwlOptions,
  OwlPalette,
  OwlPart,
  PaletteSlot,
} from "./types";

export interface AccessoryPath {
  /** Path data on the owl's own 1024 x 1024 frame, verbatim. */
  d: string;
  /** Which palette colour fills this path. Absent on a stroke-only line. */
  fill?: PaletteSlot;
  /**
   * A line rather than a shape. Pen-tool seams come out as a stroke with no
   * fill, and treated as a fill they become solid blobs across the sleeve.
   */
  stroke?: PaletteSlot;
  /** In artwork units, on the 1024 frame. */
  strokeWidth?: number;
  linecap?: "butt" | "round" | "square";
  linejoin?: "miter" | "round" | "bevel";
  /** Set for a path that carries its own holes. */
  evenodd?: boolean;
}

export interface Accessory {
  /** Stable. It is what `wearing` names and what a picker stores. */
  name: string;
  slot: AccessorySlot;
  layer: AccessoryLayer;
  /**
   * Slots this cannot be worn with. Checked both ways, so declaring it on one
   * of a conflicting pair is enough.
   */
  excludes?: readonly AccessorySlot[];
  /**
   * How often it comes up, against the others in its slot. Derived, not written: the
   * generator sizes these, so editing one here is undone by the next run.
   */
  weight: number;
  /**
   * Its permanent two-letter name, for the string a person's look travels as. Assigned
   * once from artwork/keys.json and never reused, including after the drawing has gone.
   */
  key: string;
  /**
   * Base parts this repaints, as role -> role: a coat covers the arms, so the drawing
   * paints the wings in the background's colour. A role, so it works on all palettes.
   */
  recolour?: Readonly<Partial<Record<PaletteSlot, PaletteSlot>>>;
  /**
   * Parts of the bird this replaces, not drawn at all. Painting them out is not the same:
   * eyes and beak share `accent`, and a plate-coloured disc is wrong off the plate.
   */
  hides?: readonly OwlPart[];
  /** Drawn in order, back to front. Keep the design file's own order. */
  paths: readonly AccessoryPath[];
}

/**
 * The bird an accessory is drawn on top of, and the one the extractor subtracts back out.
 * The script and the site's download have to agree exactly, and every slot is emptied.
 */
export const OWL_BASE = {
  palette: "teal",
  scheme: "day",
  ears: "tufts",
  size: 1024,
  wearing: {
    expression: null,
    eyewear: null,
    head: null,
    neck: null,
    body: null,
  },
} as const satisfies OwlOptions;

/**
 * How often a slot is filled at all. A generated weight is a share of its slot; these
 * decide the slot's size, so the numbers hold however many drawings land in artwork/.
 */
export const SLOT_PRESENCE: Record<AccessorySlot, number> = {
  // Empty here is not a face with no eyes — it is the eyes the bird is drawn
  // with, which is the one every other expression is a departure from.
  expression: 0.18,
  eyewear: 0.38,
  head: 0.3,
  neck: 0.35,
  body: 0.18,
};

/**
 * The denominator SLOT_PRESENCE is measured against; it does nothing on its own. A
 * thousand rather than a hundred, so a slot with thirty drawings still lands on its rate.
 */

/**
 * The order slots are drawn in, and chosen in. Fixed, and it has to stay fixed: change it
 * and everyone owning two things that exclude each other swaps one for the other.
 */
export const ACCESSORY_SLOTS: AccessorySlot[] = [
  "expression", "eyewear", "head", "neck", "body",
];

export const EMPTY_WEIGHT: Record<AccessorySlot, number> = {
  expression: 1000,
  eyewear: 1000,
  head: 1000,
  neck: 1000,
  body: 1000,
};

/**
 * Everything an owl can wear, generated from `artwork/` by `scripts/owl-accessory.mjs
 * --all`. Editing this by hand means the next run throws the edit away.
 */
export const ACCESSORIES: readonly Accessory[] = GENERATED_ACCESSORIES;

export function accessoriesIn(slot: AccessorySlot): Accessory[] {
  return ACCESSORIES.filter((a) => a.slot === slot);
}

export function accessoryByName(name: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.name === name);
}

/**
 * The palette after everything worn has had its say, in slot order. Reads roles off the
 * original palette, so a swap swaps rather than collapsing both into one.
 */
export function repaint(palette: OwlPalette, worn: readonly Accessory[]): OwlPalette {
  let out = palette;
  for (const accessory of worn) {
    if (!accessory.recolour) continue;
    const next = { ...out };
    for (const [part, source] of Object.entries(accessory.recolour)) {
      next[part as PaletteSlot] = out[source as PaletteSlot];
    }
    out = next;
  }
  return out;
}
