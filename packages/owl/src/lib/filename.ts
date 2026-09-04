/**
 * Where an accessory goes, read off the name of the file it was drawn in.
 * Adding a cosmetic is dropping an SVG into artwork/ and running the script.
 *
 * The grammar is `type_family[_variant][.tag].svg`. Underscores separate the
 * three fields; a hyphen joins words inside one of them.
 *
 *   scarf.svg                       a type on its own is its own family
 *   glasses_round.svg               round glasses
 *   glasses_round_gold.svg          the gold pair of them
 *   hat_winter-beanie_red.svg       family of two words, variant of one
 *   glasses_heart.rare.svg          seen less often than the other eyewear
 *   hoodie_plain.covers-head.svg    a garment with a hood, so no hat over it
 *   sporran_dress.neck.svg          a type word the table below has not met
 *   _hat_winter_old.svg             ignored entirely
 *
 * The type is the first field and KEYWORDS turns it into a slot. Type first is
 * not only tidiness: the folder groups itself and a customiser gets
 * type -> family -> variant without being told about it separately.
 *
 * **Nothing here guesses.** A word that is not in the table is an error naming
 * the file, not a default — a silent wrong slot looks like a scarf worn as a hat.
 */

import type { AccessorySlot } from "../types";

/**
 * How likely an accessory is against the others in its slot — **not against the
 * owl as a whole**, which is SLOT_PRESENCE's job. Marking something rare makes
 * it lose to its neighbours rather than making the slot emptier. Untagged is
 * `common`.
 */
export const RARITY_SHARE = {
  common: 1,
  uncommon: 0.6,
  rare: 0.35,
  scarce: 0.2,
} as const;

export type Rarity = keyof typeof RARITY_SHARE;

/**
 * The word in a filename that says which slot a drawing belongs in.
 *
 * Deliberately a list of the things people actually draw rather than a clever
 * rule. It is meant to be added to: a new noun is one line here, and until it
 * is, the script refuses the file by name instead of putting it somewhere.
 */
export const KEYWORDS: Record<string, AccessorySlot> = {
  // expression — the face itself, not something worn on it
  eyes: "expression",
  expression: "expression",
  smile: "expression",
  frown: "expression",
  wink: "expression",
  blink: "expression",

  // eyewear
  glasses: "eyewear",
  spectacles: "eyewear",
  shades: "eyewear",
  goggles: "eyewear",
  monocle: "eyewear",
  visor: "eyewear",
  eyepatch: "eyewear",

  // head
  hat: "head",
  cap: "head",
  beanie: "head",
  crown: "head",
  helmet: "head",
  headset: "head",
  headphones: "head",
  headband: "head",
  bow: "head",
  flower: "head",
  horns: "head",
  halo: "head",
  antlers: "head",

  // neck
  scarf: "neck",
  bowtie: "neck",
  tie: "neck",
  necktie: "neck",
  necklace: "neck",
  collar: "neck",
  choker: "neck",
  bandana: "neck",
  chain: "neck",
  cravat: "neck",

  // body
  shirt: "body",
  tshirt: "body",
  jacket: "body",
  coat: "body",
  hoodie: "body",
  sweater: "body",
  jumper: "body",
  vest: "body",
  suit: "body",
  dress: "body",
  cape: "body",
  apron: "body",
  overalls: "body",
  armour: "body",
};

/**
 * What a slot takes off the bird by default.
 *
 * A garment has a collar, so it and a neck accessory cannot both be worn. Both
 * of the drawn garments say so, which makes it the slot's behaviour rather than
 * each drawing's. A hood on top of that is `covers-head`, because a jacket has
 * no opinion about hats and a hoodie does.
 */
export const SLOT_EXCLUDES: Partial<Record<AccessorySlot, AccessorySlot[]>> = {
  body: ["neck"],
};

/** Where each slot lands unless a tag says otherwise. */
export const DEFAULT_LAYER: Record<AccessorySlot, string> = {
  // Spectacles go over the eyes, because that is what a drawing of spectacles
  // does — the lens is painted and it covers the eye behind it. `over-face` is
  // for a pair drawn as holes only, where the expression should show through.
  expression: "overFace",
  eyewear: "overEyes",
  head: "overAll",
  neck: "overAll",
  // A garment goes on top of everything, collar included. It is drawn over the
  // bird rather than tucked behind it, which is what a coat does.
  body: "overAll",
};

const LAYERS: Record<string, string> = {
  // Where the drawing sits relative to `<g id="owl">` already says this, so a
  // tag is only for overriding that — a drawing exported with the bird in
  // front of it that is meant to be worn on top, or the other way round.
  behind: "behind",
  "over-face": "overFace",
  "over-eyes": "overEyes",
  "over-all": "overAll",
};

export interface Placement {
  /** What the accessory is called in the registry. Unique across all of them. */
  name: string;
  /** The first field, and what KEYWORDS reads to find the slot. */
  type: string;
  /**
   * The thing itself, with its variants — round glasses, whatever colour.
   *
   * Families compete for the slot, and variants split whatever their family
   * gets. Without that, six colourways of one pair of glasses take six shares
   * of eyewear and end up 5.9x as likely as a pair drawn once, which is the
   * slot-presence problem again one level down.
   */
  family: string;
  /** Empty when the family has only the one drawing. */
  variant: string;
  slot: AccessorySlot;
  layer: string;
  rarity: Rarity;
  excludes: AccessorySlot[];
}

/** A file the scan should walk past rather than read. */
export function isIgnored(filename: string): boolean {
  // A leading underscore, so a drawing can be kept next to the ones in use
  // without being in use. Winter_Hat_Small.svg is the reason this exists: it
  // was exported over the top of Winter_Hat.svg, is byte-identical to it, and
  // is kept for whenever it becomes a different hat.
  return filename.startsWith("_") || filename.startsWith(".");
}

class PlacementError extends Error {}

function fail(file: string, message: string): never {
  throw new PlacementError(`${file}: ${message}`);
}

/**
 * Reads a drawing's filename.
 *
 * Throws rather than returning a default, and the message says what to rename
 * the file to. Every failure here is one somebody can fix without reading this
 * file.
 */
export function placementFor(filename: string, slots: readonly AccessorySlot[]): Placement {
  const base = filename.replace(/\.svg$/i, "");
  const [words, ...tags] = base.split(".");

  const fields = words
    .trim()
    .toLowerCase()
    .split("_")
    .map((f) => f.trim())
    .filter(Boolean);

  if (fields.length === 0) fail(filename, "has no name before its tags");
  if (fields.length > 3) {
    fail(
      filename,
      `has ${fields.length} fields. It is type_family_variant — join words ` +
        `inside a field with a hyphen, e.g. ${fields[0]}_${fields.slice(1, -1).join("-")}_${fields[fields.length - 1]}.svg`,
    );
  }

  // A type with nothing after it is its own family: scarf.svg rather than
  // scarf_plain.svg, since the filler field says nothing.
  const [type, family = type, variant = ""] = fields;
  const name = fields.join("-");

  let slot: AccessorySlot | undefined;
  let rarity: Rarity = "common";
  let layer: string | undefined;
  const excludes: AccessorySlot[] = [];

  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();

    if ((slots as readonly string[]).includes(tag)) {
      slot = tag as AccessorySlot;
      continue;
    }
    if (tag in RARITY_SHARE) {
      rarity = tag as Rarity;
      continue;
    }
    if (tag in LAYERS) {
      layer = LAYERS[tag];
      continue;
    }
    if (tag.startsWith("covers-")) {
      const covered = tag.slice("covers-".length);
      if (!(slots as readonly string[]).includes(covered)) {
        fail(filename, `covers-${covered} — "${covered}" is not a slot. One of: ${slots.join(", ")}`);
      }
      excludes.push(covered as AccessorySlot);
      continue;
    }

    fail(
      filename,
      `".${tag}" is not a tag this understands. Tags are a slot ` +
        `(${slots.join(", ")}), a rarity (${Object.keys(RARITY_SHARE).join(", ")}), ` +
        `a layer (${Object.keys(LAYERS).join(", ")}), or covers-<slot>.`,
    );
  }

  if (!slot) {
    // The type field only, not any word in the name. A family called "bow"
    // under type "glasses" is a shape of frame, not a thing worn on the head,
    // and reading every field would have made that a conflict to resolve.
    const found = new Map<AccessorySlot, string>();
    const match = KEYWORDS[type];
    if (match) found.set(match, type);

    if (found.size === 0) {
      // Grouped by slot rather than listed flat. Fifty words on one line is a
      // wall to read past; grouped, it shows the convention as well as the
      // vocabulary, so the next drawing gets named right without asking.
      const bySlot = new Map<AccessorySlot, string[]>();
      for (const [word, slot] of Object.entries(KEYWORDS)) {
        if (!bySlot.has(slot)) bySlot.set(slot, []);
        bySlot.get(slot)!.push(word);
      }
      const vocabulary = [...bySlot]
        .map(([slot, words]) => `\n    ${slot.padEnd(11)} ${words.join(", ")}`)
        .join("");

      fail(
        filename,
        `"${type}" is not a type this knows, so there is no slot to put it in.\n` +
          `  Types:${vocabulary}\n` +
          `  Or name the slot yourself, e.g. ${base}.head.svg`,
      );
    }
    slot = [...found.keys()][0];
  }

  for (const also of SLOT_EXCLUDES[slot] ?? []) {
    if (!excludes.includes(also)) excludes.push(also);
  }

  return {
    name,
    type,
    family: family === type ? type : `${type}-${family}`,
    variant,
    slot,
    layer: layer ?? DEFAULT_LAYER[slot],
    rarity,
    excludes,
  };
}

/**
 * The weight each accessory gets, so its slot fills at the rate SLOT_PRESENCE
 * asks for however many drawings are in it — a new drawing changes which
 * glasses you see rather than whether you see any.
 */
export function weightsFor<
  T extends { name: string; slot: AccessorySlot; family: string; rarity: Rarity },
>(
  items: readonly T[],
  presence: Record<AccessorySlot, number>,
  emptyWeight: number,
): Map<string, number> {
  const weights = new Map<string, number>();

  const slots = new Set(items.map((i) => i.slot));
  for (const slot of slots) {
    const inSlot = items.filter((i) => i.slot === slot);

    /*
     * Families compete for the slot; variants split what their family wins.
     *
     * The alternative is letting every drawing compete directly, and six
     * colourways of round glasses then take six shares of eyewear — 5.9x as
     * likely to turn up as a pair drawn once, for no reason anybody chose.
     * That is the same thing SLOT_PRESENCE fixes between slots, and it needs
     * fixing between families too or drawing variants quietly buries whatever
     * only exists in one.
     */
    const families = [...new Set(inSlot.map((i) => i.family))].sort();
    const shares = families.map((family) => {
      const rarities = new Set(inSlot.filter((i) => i.family === family).map((i) => i.rarity));
      // Checked in placementFor's caller; taking the first is safe here.
      return RARITY_SHARE[[...rarities][0]];
    });
    const shareTotal = shares.reduce((a, b) => a + b, 0);

    // p = filled / (filled + empty), so filled = empty * p / (1 - p).
    const p = presence[slot];
    const slotTotal = Math.round((emptyWeight * p) / (1 - p));

    /*
     * Rounded by largest remainder rather than one at a time, so the weights
     * add up to slotTotal exactly and the slot fills at the rate asked for.
     *
     * Rounding each independently does not: thirty hats sharing a total of 43
     * are 1.43 each, every one of them rounds down to 1, and the slot quietly
     * drops from 30% of owls to 23%. That error grows with the number of
     * drawings, which is the direction this repository goes in.
     */
    // A family's whole share first, then split between its variants, so the
    // rounding is done once at each level rather than compounding.
    const exact = shares.map((share, i) => {
      const variants = inSlot.filter((item) => item.family === families[i]).length;
      return (slotTotal * share) / shareTotal / variants;
    });
    const counts = families.map((family) => inSlot.filter((i) => i.family === family).length);
    const floors = exact.map((n) => Math.max(1, Math.floor(n)));

    let left = slotTotal - floors.reduce((sum, n, i) => sum + n * counts[i], 0);

    // Hand the leftover units to whoever was rounded down hardest. If there is
    // nothing left over — more drawings in the slot than it has weight to give
    // — every one of them is on the floor of 1 and the slot ends up commoner
    // than asked. Better than an accessory that has been drawn and can never
    // be worn.
    const order = exact
      .map((n, i) => [i, n - Math.floor(n)] as const)
      .sort((a, b) => b[1] - a[1]);

    for (const [i] of order) {
      if (left < counts[i]) continue;
      floors[i] += 1;
      left -= counts[i];
    }

    // Every variant of a family carries the same weight, which is what makes
    // the family's share independent of how many of them there are.
    inSlot.forEach((item) => weights.set(item.name, floors[families.indexOf(item.family)]));
  }

  return weights;
}
