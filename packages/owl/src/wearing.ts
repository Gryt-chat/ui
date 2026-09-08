/**
 * What somebody is wearing, as a fixed-width string beside the nickname: two characters
 * per field, appended never inserted, and `--` means deliberately nothing.
 */

import { ACCESSORY_SLOTS, accessoryByName, accessoriesIn } from "./accessories";
import type { AccessorySlot, EarStyle, OwlOptions, PaletteName, PaletteScheme } from "./types";

/** Two characters, no key. A slot somebody chose to leave empty. */
export const EMPTY_FIELD = "--";

/** The width of one field, and of every field. */
const FIELD = 2;

/**
 * Frozen, and not derived from PALETTE_NAMES: deriving from the array's order would mean
 * inserting a palette recolours everyone after it. Append-only.
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
   * A palette per slot, for anybody who wants their hat a different colour from their
   * owl. A slot left out follows the owl, which is what every older look does.
   */
  tint?: Partial<Record<AccessorySlot, PaletteName>>;
}

function accessoryKey(name: string | null | undefined): string {
  if (!name) return EMPTY_FIELD;
  return accessoryByName(name)?.key ?? EMPTY_FIELD;
}

/**
 * The string for a look. An accessory the registry does not have encodes as empty rather
 * than throwing: one unknown hat should cost that hat, not the whole owl.
 */
export function encodeWorn(look: WornLook): string {
  const slots = ACCESSORY_SLOTS.map((slot) => accessoryKey(look.wearing[slot]));
  // Appended after the three settings, never inserted among them. The decoder reads
  // positionally, so an older client reads the first eight fields as it always did.
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
 * How long a string this build writes is. It can change without emptying anybody's
 * wardrobe, which is why `decodeWorn` reads positionally instead of checking it.
 */
export const WORN_LENGTH = (ACCESSORY_SLOTS.length * 2 + 3) * FIELD;

/**
 * The look a string describes, or null. Forgiving about content and length, strict about
 * shape: fields are read positionally, so adding a slot cannot empty every wardrobe.
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

  // A string written before tints existed stops here, and `at` hands back EMPTY_FIELD for
  // every one. Nothing is set, and the accessories follow the owl as they did.
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
