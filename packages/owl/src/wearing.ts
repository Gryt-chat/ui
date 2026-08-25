/**
 * What somebody is wearing, as a short string.
 *
 * It travels beside the nickname: sent on join, updated when the avatar
 * changes, unset when somebody goes back to an uploaded picture. So it has to
 * be short, stable, and readable enough that a wrong one can be diagnosed by
 * looking at it.
 *
 * Eight fields, two characters each, always in this order and always present:
 *
 *     ai ac ah -- -- ad ab ab
 *     ^expression         ^scheme
 *        ^eyewear            ^ears
 *           ^head
 *              ^neck
 *                 ^body
 *                    ^palette
 *
 * Fixed width rather than delimited, because the fields are fixed too, and a
 * missing one would otherwise shift everything after it. An empty slot is
 * `--`, which is a value meaning "deliberately nothing" rather than an absence
 * — the difference matters, since "no hat" is a choice somebody made and "no
 * opinion" is not.
 *
 * The accessory keys come from the registry and never move; see
 * scripts/lib/keys.ts for why that is a ledger rather than an index. The three
 * non-accessory fields are frozen here for the same reason: PALETTE_NAMES is an
 * array, and reordering an array is exactly the kind of harmless-looking edit
 * that would re-colour everybody.
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
  return [
    ...slots,
    look.palette ? PALETTE_KEYS[look.palette] : EMPTY_FIELD,
    look.scheme ? SCHEME_KEYS[look.scheme] : EMPTY_FIELD,
    look.ears ? EAR_KEYS[look.ears] : EMPTY_FIELD,
  ].join("");
}

/** How long a string this build writes is. */
export const WORN_LENGTH = (ACCESSORY_SLOTS.length + 3) * FIELD;

/**
 * The look a string describes, or null if it is not one.
 *
 * Forgiving about content and about length, strict about shape.
 *
 * Length matters more than it looks. An earlier version of this refused
 * anything that was not exactly WORN_LENGTH, which reads as careful and is a
 * trap: the day a sixth slot is added, WORN_LENGTH changes and every string
 * anybody has saved decodes to null — every wardrobe empties at once, silently,
 * because of a change nobody connected to it. So fields are read positionally
 * for as many as are present. Trailing fields this build does not know about
 * are ignored, because a newer client wrote them; fields it expects and does
 * not find are left undefined, because an older one did. New fields therefore
 * have to be appended and never inserted, which is the same discipline the key
 * ledger already runs on.
 *
 * Content is forgiving for the same reason. A key that no longer resolves — a
 * retired drawing, a palette from a later release — reads as empty rather than
 * failing, so one unknown hat costs that hat instead of the whole avatar.
 *
 * What is still refused: anything that is not whole two-character fields of
 * a-z or `--`, and anything too short to carry the slots. Those are bugs rather
 * than drawings that moved on.
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

  return look;
}

/** A decoded look as options the generator takes, so a caller can draw it. */
export function wornToOptions(look: WornLook): OwlOptions {
  const options: OwlOptions = { wearing: look.wearing };
  if (look.palette) options.palette = look.palette;
  if (look.scheme) options.scheme = look.scheme;
  if (look.ears) options.ears = look.ears;
  return options;
}
