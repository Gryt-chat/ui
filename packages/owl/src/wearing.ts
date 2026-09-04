/**
 * What somebody is wearing, as a short string travelling beside the nickname.
 *
 * Thirteen fields, two characters each, always in this order:
 *
 *     ai ac ah -- -- ad ab ab -- ae -- -- --
 *     ^expression         ^scheme  ^eyewear tint
 *        ^eyewear            ^ears    ^head tint
 *           ^head                        ^neck tint
 *              ^neck        ^expression tint  ^body tint
 *                 ^body
 *                    ^palette
 *
 * **New fields are appended, never inserted** — see decodeWorn. Fixed width
 * rather than delimited, so a missing field cannot shift the ones after it.
 * `--` means "deliberately nothing", which is not the same as an absence.
 *
 * **The keys never move**, and PALETTE_NAMES is frozen for the same reason:
 * reordering an array would re-colour everybody. See scripts/lib/keys.ts.
 */

import { ACCESSORY_SLOTS, accessoryByName, accessoriesIn } from "./accessories";
import type { AccessorySlot, EarStyle, OwlOptions, PaletteName, PaletteScheme } from "./types";

/** Two characters, no key. A slot somebody chose to leave empty. */
export const EMPTY_FIELD = "--";

/** The width of one field, and of every field. */
const FIELD = 2;

/**
 * Frozen, and not derived from PALETTE_NAMES on purpose.
 *
 * Deriving them from the array's order would mean that inserting a palette in
 * the middle silently recolours everyone whose key sits after it. These are
 * append-only: a new palette takes the next free key and nothing else moves.
 */
const PALETTE_KEYS: Record<PaletteName, string> = {
  violet: "aa",
  amber: "ab",
  teal: "ac",
  pink: "ad",
  blue: "ae",
  green: "af",
  red: "ag",
  gold: "ah",
  indigo: "ai",
  cyan: "aj",
};

const SCHEME_KEYS: Record<PaletteScheme, string> = {
  night: "aa",
  day: "ab",
  dusk: "ac",
};

const EAR_KEYS: Record<EarStyle, string> = {
  none: "aa",
  tufts: "ab",
};

function invert(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([name, key]) => [key, name]));
}

const PALETTE_BY_KEY = invert(PALETTE_KEYS);
const SCHEME_BY_KEY = invert(SCHEME_KEYS);
const EAR_BY_KEY = invert(EAR_KEYS);

/** The look a string describes. Every field optional, because a string may be old. */
export interface WornLook {
  palette?: PaletteName;
  scheme?: PaletteScheme;
  ears?: EarStyle;
  wearing: Partial<Record<AccessorySlot, string | null>>;
  /**
   * A palette per slot, for anybody who wants their hat a different colour from
   * their owl. A slot left out follows the owl, which is what every look
   * written before this field existed does.
   */
  tint?: Partial<Record<AccessorySlot, PaletteName>>;
}

function accessoryKey(name: string | null | undefined): string {
  if (!name) return EMPTY_FIELD;
  return accessoryByName(name)?.key ?? EMPTY_FIELD;
}

/**
 * The string for a look.
 *
 * An accessory the registry does not have encodes as empty rather than
 * throwing: the caller is usually rendering somebody else's avatar, and one
 * unknown hat should cost that hat, not the whole owl.
 */
export function encodeWorn(look: WornLook): string {
  const slots = ACCESSORY_SLOTS.map((slot) => accessoryKey(look.wearing[slot]));
  // Appended after the three settings, never inserted among them. The decoder
  // reads positionally, so an older client reads the first eight fields exactly
  // as it always did and simply does not see these.
  const tints = ACCESSORY_SLOTS.map((slot) => {
    const name = look.tint?.[slot];
    return name ? PALETTE_KEYS[name] : EMPTY_FIELD;
  });
  return [
    ...slots,
    look.palette ? PALETTE_KEYS[look.palette] : EMPTY_FIELD,
    look.scheme ? SCHEME_KEYS[look.scheme] : EMPTY_FIELD,
    look.ears ? EAR_KEYS[look.ears] : EMPTY_FIELD,
    ...tints,
  ].join("");
}

/**
 * How long a string this build writes is.
 *
 * Two fields per slot now — what is worn, and what colour it is painted — plus
 * the three settings between them. It was `(slots + 3)` until tints were added,
 * and the fact that this number can change without emptying anybody's wardrobe
 * is the whole reason `decodeWorn` reads positionally instead of checking it.
 */
export const WORN_LENGTH = (ACCESSORY_SLOTS.length * 2 + 3) * FIELD;

/**
 * The look a string describes, or null. **Forgiving about content and length,
 * strict about shape.**
 *
 * Refusing anything not exactly WORN_LENGTH reads as careful and is a trap: the
 * day a sixth slot is added, every saved string decodes to null and every
 * wardrobe empties at once. So fields are read positionally for as many as are
 * present — unknown trailing ones ignored, missing ones left undefined — and
 * **new fields are appended, never inserted**.
 *
 * A key that no longer resolves reads as empty, so one retired hat costs that
 * hat rather than the whole avatar. Still refused: anything that is not whole
 * two-character fields, and anything too short to carry the slots.
 */
export function decodeWorn(value: string | null | undefined): WornLook | null {
  if (!value) return null;

  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length % FIELD !== 0) return null;
  if (!/^(?:[a-z]{2}|--)+$/.test(trimmed)) return null;
  if (trimmed.length < ACCESSORY_SLOTS.length * FIELD) return null;

  const fields: string[] = [];
  for (let i = 0; i < trimmed.length; i += FIELD) fields.push(trimmed.slice(i, i + FIELD));

  const wearing: Partial<Record<AccessorySlot, string | null>> = {};
  ACCESSORY_SLOTS.forEach((slot, i) => {
    const key = fields[i];
    if (key === EMPTY_FIELD) {
      wearing[slot] = null;
      return;
    }
    const match = accessoriesIn(slot).find((a) => a.key === key);
    // Unknown key: treat as empty rather than as "wear nothing deliberately",
    // so a newer accessory on an older client just does not draw.
    wearing[slot] = match ? match.name : null;
  });

  const look: WornLook = { wearing };
  const at = (i: number) => fields[ACCESSORY_SLOTS.length + i] ?? EMPTY_FIELD;
  const palette = PALETTE_BY_KEY[at(0)];
  const scheme = SCHEME_BY_KEY[at(1)];
  const ears = EAR_BY_KEY[at(2)];
  if (palette) look.palette = palette as PaletteName;
  if (scheme) look.scheme = scheme as PaletteScheme;
  if (ears) look.ears = ears as EarStyle;

  // A string written before tints existed simply stops here, and `at` hands
  // back EMPTY_FIELD for every one of them. Nothing is set, and the accessories
  // follow the owl exactly as they did.
  const tint: Partial<Record<AccessorySlot, PaletteName>> = {};
  ACCESSORY_SLOTS.forEach((slot, i) => {
    const name = PALETTE_BY_KEY[at(3 + i)];
    if (name) tint[slot] = name as PaletteName;
  });
  if (Object.keys(tint).length > 0) look.tint = tint;

  return look;
}

/** A decoded look as options the generator takes, so a caller can draw it. */
export function wornToOptions(look: WornLook): OwlOptions {
  const options: OwlOptions = { wearing: look.wearing };
  if (look.palette) options.palette = look.palette;
  if (look.scheme) options.scheme = look.scheme;
  if (look.ears) options.ears = look.ears;
  if (look.tint) options.tint = look.tint;
  return options;
}
