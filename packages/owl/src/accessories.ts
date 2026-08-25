/**
 * What an owl can wear.
 *
 * Empty on purpose. The drawings go in below, and this file is the whole of
 * what adding one involves.
 *
 * ## Adding one
 *
 * An accessory is exported from the design file on the **same 1024 x 1024 frame
 * as the owl**, positioned exactly where it should sit, with the background,
 * body, face plate, eyes and beak layers removed. Its path data then goes in
 * here verbatim — no scaling, no anchor point, no arithmetic. That is the entire
 * reason for the 1024 frame: an earlier pass had each drawing in its own
 * coordinate space and every one of them needed two numbers guessed by eye,
 * which is where the crooked ones came from.
 *
 * Each path names a colour role rather than carrying a hex, so a teal owl and a
 * pink owl wear the same hat in their own colours. The roles are the keys of
 * `OwlPalette` — `trim`, `trimDeep`, `trimSoft`, `gold`, `goldDeep`, `accent`,
 * `wing`, `face`. The drawn accessories mostly used the bird's own hue at a
 * different lightness, which is what `trim` and its two neighbours are for;
 * `gold` is the odd one out and it is what the scarf and the pilot frames were
 * painted in.
 *
 * ## Slots and layers
 *
 * `slot` is where it is worn, and one accessory is drawn per slot. Four slots
 * means a hat and glasses and a scarf are three independent rolls that can all
 * come up at once — and that two hats never can.
 *
 * `layer` is where it lands in the stack, and it is per accessory rather than
 * per slot because two things worn in the same place do not always sit at the
 * same depth. A pair of glasses whose lenses are painted rather than punched
 * has to go under the eyes, so the owl's own eyes land on top of it and the
 * expression still shows through the glass. A frame with real holes in it wants
 * to be over them. Both are `slot: "eyes"`.
 *
 * `excludes` is for the pairs that are each fine alone and wrong together — a
 * scarf under a buttoned jacket, a hat under a hood.
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
   * A line rather than a shape.
   *
   * Not every drawn thing is a filled outline — the winter jacket's sleeve
   * seams are drawn with the pen tool and come out as a stroke with no fill at
   * all. Treated as a fill they turn into solid blobs across the sleeve, so the
   * stroke has to survive the trip.
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
   * How often it comes up, against the other accessories in its slot.
   *
   * Derived, not written: the generator sizes these so the slot fills at
   * SLOT_PRESENCE's rate, splitting that between the drawings by the rarity
   * tag in each filename. Editing one here is undone by the next run.
   */
  weight: number;
  /**
   * Base parts this repaints, as role -> role.
   *
   * A coat covers the owl's arms, so the drawing paints the wings in the
   * background's colour and they vanish. That is a change to the bird rather
   * than a shape drawn on top of it, and it has to travel with the coat: the
   * extractor spots the recoloured path and records `{ wing: "background" }`
   * here rather than quietly subtracting it away and losing the intent.
   *
   * Repaints a role, not a path, so both wings go together and it still works
   * on all thirty palettes.
   */
  recolour?: Readonly<Partial<Record<PaletteSlot, PaletteSlot>>>;
  /**
   * Parts of the bird this replaces, which are then not drawn at all.
   *
   * An expression brings its own eyes. In the drawing that reads as the eyes
   * being painted the same colour as the face plate, but painting them out is
   * not the same as leaving them out: the eyes and the beak are both drawn in
   * `accent`, so a repaint would take the beak with them, and a plate-coloured
   * disc is wrong anywhere the plate is not what is behind it.
   */
  hides?: readonly OwlPart[];
  /** Drawn in order, back to front. Keep the design file's own order. */
  paths: readonly AccessoryPath[];
}

/**
 * The bird an accessory is drawn on top of, and the one the extractor subtracts
 * back out.
 *
 * Exported because two places need it and they have to agree exactly: the
 * script that writes owl-base.svg, and the download on the site's drawing
 * guide. A second copy that drifted would hand somebody a bird a little unlike
 * the one their drawing is measured against, and every path would fail to
 * match with nothing saying why.
 *
 * The palette is only there so the drawing is pleasant to work on — the
 * subtraction matches on geometry and ignores colour except where it has
 * changed. `tufts` ears because that is the drawn owl, and an accessory
 * positioned against any other would sit a little wrong on this one.
 *
 * Every slot is emptied explicitly, and that is not belt and braces. Left to
 * the seed the bird would wear whatever the registry rolled for it, so the
 * moment the first accessory landed the bird being subtracted stopped being
 * bare and every drawing failed to match. That happened.
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
 * How often a slot is filled at all.
 *
 * The knob that matters, and the one that used to not exist. A weight in the
 * generated list is a share of its slot; these decide how big the slot is
 * against nothing, and the generator sizes the weights to hit them. So the
 * numbers here hold however many drawings land in artwork/ — an eighth pair of
 * glasses changes which glasses turn up, not whether anyone is wearing any.
 *
 * That was not true before. Weights were written by hand against a fixed
 * EMPTY_WEIGHT, so every drawing added to a slot made that slot more likely to
 * be filled: eight pairs of glasses had put eyewear on 38% of owls, and a ninth
 * would have pushed it past that without anybody choosing it. The comment here
 * used to describe that as adding "a fifth hat makes hats a little more common",
 * which was accurate and is the drift.
 *
 * Kept low on purpose. A uniform draw over a slot's contents plus nothing puts
 * a hat on most of a member list, and at that rate the hat stops being a thing
 * about that person and becomes noise.
 *
 * These are the rates the hand-written weights happened to produce, carried
 * over so adopting the model moved nobody by itself.
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
 * How much weight "nothing" carries in each slot.
 *
 * The same in every slot now, and it is only the denominator SLOT_PRESENCE is
 * measured against — the generator picks weights to suit it. Change
 * SLOT_PRESENCE to make a slot rarer; this number does nothing on its own.
 *
 * A thousand rather than a hundred so there is room to divide. Weights are
 * whole numbers, so this is the resolution the split between drawings is cut
 * at, and a slot with thirty of them in it still lands on the rate it asked
 * for rather than a few points under.
 */
export const EMPTY_WEIGHT: Record<AccessorySlot, number> = {
  expression: 1000,
  eyewear: 1000,
  head: 1000,
  neck: 1000,
  body: 1000,
};

/**
 * Everything an owl can wear.
 *
 * Generated from `artwork/` by `scripts/owl-accessory.mjs --all`, which takes a
 * drawing of the bird wearing something and subtracts the bird back out. The
 * drawings are the source; this list is derived from them, and editing it by
 * hand means the next run of that script throws the edit away.
 */
export const ACCESSORIES: readonly Accessory[] = GENERATED_ACCESSORIES;

export function accessoriesIn(slot: AccessorySlot): Accessory[] {
  return ACCESSORIES.filter((a) => a.slot === slot);
}

export function accessoryByName(name: string): Accessory | undefined {
  return ACCESSORIES.find((a) => a.name === name);
}

/**
 * The palette after everything worn has had its say.
 *
 * Applied in slot order so two garments asking for the same repaint settle it
 * the same way on every client. Reads every role off the original palette, not
 * off the half-updated copy, so `{ wing: "background", background: "wing" }`
 * swaps them rather than collapsing both into one.
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
