/**
 * Gryt's owls: a deterministic avatar generator. The same seed always draws the same owl,
 * everywhere, forever — so no Math.random, no Date, no locale, and every draw is keyed.
 */

import { escapeXml, fmt, VIEWBOX } from "./geometry";
import { OWL } from "./metrics";
import { owlPalette, PALETTE_NAMES, PALETTE_SCHEMES } from "./palette";
import { renderBody, renderEars, renderWing } from "./parts/body";
import { renderEye } from "./parts/eyes";
import { renderBeak, renderFace } from "./parts/face";
// pickWeighted still, for ears: EAR_WEIGHTS is a fixed pair that cannot grow, so the
// by-name draw has nothing to protect and switching would move every owl's ears.
import { hash32, pick, pickWeighted, pickWeightedByName } from "./rng";
import {
  ACCESSORY_SLOTS,
  accessoriesIn,
  accessoryByName,
  EMPTY_WEIGHT,
  repaint,
  type Accessory,
} from "./accessories";
import type {
  AccessoryLayer,
  AccessorySlot,
  EarStyle,
  OwlOptions,
  OwlPalette,
  OwlPart,
  PaletteName,
  ResolvedOwl,
  Seed,
} from "./types";

export * from "./types";
// The normalisation rule ships with the generator. Every consumer draws from a nickname,
// and two disagreeing about "Sivert" and "sivert" is two people with two faces.
export { avatarSeed } from "./avatarSeed";
export {
  encodeWorn,
  decodeWorn,
  wornToOptions,
  EMPTY_FIELD,
  WORN_LENGTH,
  type WornLook,
} from "./wearing";
export { owlPalette, allOwlPalettes, hsl, PALETTE_NAMES, PALETTE_SCHEMES, TILE_HUES } from "./palette";
export { OWL, type OwlMetrics } from "./metrics";
// Servers, not people — see eggs/index.ts. Spelled out to the file rather than the
// folder: fix-declarations.ts appends `.js`, and `./eggs.js` is not a file.
export {
  eggAvatarSvg,
  eggAvatarDataUri,
  eggAvatarColour,
  resolveEggs,
  eggPalette,
  allEggPalettes,
  eggPatternByName,
  EGG_COUNTS,
  EGG_PATTERNS,
  EGG_BASES,
  type EggCount,
  type EggOptions,
  type EggPalette,
  type EggPattern,
  type EggPatternMode,
  type ResolvedEgg,
  type ResolvedEggs,
} from "./eggs/index";
export {
  ACCESSORIES,
  ACCESSORY_SLOTS,
  EMPTY_WEIGHT,
  SLOT_PRESENCE,
  OWL_BASE,
  accessoriesIn,
  accessoryByName,
  repaint,
  type Accessory,
  type AccessoryPath,
} from "./accessories";

export const EAR_STYLES: EarStyle[] = ["none", "tufts"];

/** `tufts` beats `none` because the drawn owl has them. */
const EAR_WEIGHTS: readonly (readonly [EarStyle, number])[] = [
  ["tufts", 68], ["none", 32],
];

/**
 * What this seed wears. Slots are drawn in a fixed order, and a conflicting slot comes up
 * empty. Fixed rather than by weight: change it and everyone's scarf becomes a jacket.
 */
function chooseAccessories(
  seed: string,
  asked: Partial<Record<AccessorySlot, string | null>> = {},
): Partial<Record<AccessorySlot, string>> {
  const worn: Partial<Record<AccessorySlot, string>> = {};
  const taken: AccessorySlot[] = [];

  for (const slot of ACCESSORY_SLOTS) {
    const override = asked[slot];
    if (override === null) continue;
    if (override !== undefined) {
      if (accessoryByName(override)) {
        worn[slot] = override;
        taken.push(slot);
      }
      continue;
    }

    const available = accessoriesIn(slot).filter(
      (a) =>
        !taken.some((t) => a.excludes?.includes(t)) &&
        !taken.some((t) => accessoryByName(worn[t]!)?.excludes?.includes(slot)),
    );
    if (available.length === 0) continue;

    // "nothing" is a candidate like any other and its id is fixed, so adding a drawing
    // cannot move the draw deciding whether the slot is filled at all.
    const entries: [Accessory | null, string, number][] = [
      [null, "", EMPTY_WEIGHT[slot]],
    ];
    for (const a of available) entries.push([a, a.name, a.weight]);

    const chosen = pickWeightedByName(seed, `wear:${slot}`, entries);
    if (chosen) {
      worn[slot] = chosen.name;
      taken.push(slot);
    }
  }

  return worn;
}

/** Every choice this seed makes, with anything the caller passed in taking over. */
export function resolveOwl(seed: Seed, options: OwlOptions = {}): ResolvedOwl {
  const s = String(seed);

  /*
   * A name nothing knows falls back to the seed's own: one unknown thing costs that
   * thing, not the whole avatar. Drawing an owl is not a place to throw.
   */
  const asked = options.palette;
  const paletteName =
    typeof asked === "string" && (PALETTE_NAMES as string[]).includes(asked)
      ? asked
      : pick(s, "palette", PALETTE_NAMES);
  const scheme = options.scheme ?? pick(s, "scheme", PALETTE_SCHEMES);

  const base = owlPalette(paletteName, scheme);
  const palette: OwlPalette =
    options.palette && typeof options.palette === "object"
      ? { ...base, ...options.palette }
      : base;

  const background =
    options.background === false ? null
    : typeof options.background === "string" ? options.background
    : palette.background;

  const resolved: ResolvedOwl = {
    seed: s,
    size: Math.max(1, Math.round(options.size ?? 256)),
    paletteName,
    scheme,
    palette,
    ears: options.ears ?? pickWeighted(s, "ears", EAR_WEIGHTS),
    wearing: chooseAccessories(s, options.wearing),
    // Filtered rather than trusted. A palette name from a newer build reads as "no tint"
    // and the accessory follows the owl — the same rule decodeWorn applies.
    tint: cleanTint(options.tint),
    background,
    cornerRadius: Math.min(1, Math.max(0, options.cornerRadius ?? 0)),
  };

  if (options.title !== undefined) resolved.title = options.title;
  return resolved;
}

function cleanTint(
  tint: OwlOptions["tint"],
): Partial<Record<AccessorySlot, PaletteName>> {
  if (!tint) return {};
  const out: Partial<Record<AccessorySlot, PaletteName>> = {};
  for (const slot of ACCESSORY_SLOTS) {
    const name = tint[slot];
    if (name && (PALETTE_NAMES as readonly string[]).includes(name)) out[slot] = name;
  }
  return out;
}

/** Everything worn, in slot order, each with the slot it came from. */
function wornBy(c: ResolvedOwl): { slot: AccessorySlot; accessory: Accessory }[] {
  const out: { slot: AccessorySlot; accessory: Accessory }[] = [];
  for (const slot of ACCESSORY_SLOTS) {
    const name = c.wearing[slot];
    const worn = name ? accessoryByName(name) : undefined;
    if (worn) out.push({ slot, accessory: worn });
  }
  return out;
}

function renderAccessories(
  worn: readonly { slot: AccessorySlot; accessory: Accessory }[],
  paletteFor: (slot: AccessorySlot) => OwlPalette,
  layer: AccessoryLayer,
): string {
  let out = "";
  for (const { slot, accessory } of worn) {
    if (accessory.layer !== layer) continue;
    const palette = paletteFor(slot);
    for (const p of accessory.paths) {
      // `fill="none"` is spelled out. An SVG dropped into an <img> has no page to inherit
      // from and the default is black, so an unfilled line comes out as a blob.
      out +=
        `<path d="${p.d}"` +
        (p.evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : "") +
        ` fill="${p.fill ? palette[p.fill] : "none"}"` +
        (p.stroke
          ? ` stroke="${palette[p.stroke]}" stroke-width="${p.strokeWidth ?? 1}"` +
            (p.linecap ? ` stroke-linecap="${p.linecap}"` : "") +
            (p.linejoin ? ` stroke-linejoin="${p.linejoin}"` : "")
          : "") +
        "/>";
    }
  }
  return out;
}

/**
 * `seed`'s owl, as SVG markup, back to front. The tufts go behind the body so the seam
 * never shows, and a hat goes last so it covers them rather than growing out of them.
 */
export function owlAvatarSvg(seed: Seed, options: OwlOptions = {}): string {
  const c = resolveOwl(seed, options);
  const m = OWL;
  const worn = wornBy(c);

  // A coat repaints the arms out. That has to happen before anything is drawn,
  // and it applies to the bird's own parts as well as to the coat.
  const p = repaint(c.palette, worn.map((w) => w.accessory));

  /*
   * The palette a slot's accessory is painted from: the owl's own unless tinted, and a
   * tint takes the owl's scheme. Cached per slot, because owlPalette is not free.
   */
  const tinted = new Map<AccessorySlot, OwlPalette>();
  const paletteFor = (slot: AccessorySlot): OwlPalette => {
    const name = c.tint[slot];
    if (!name) return p;
    let found = tinted.get(slot);
    if (!found) {
      // From the repainted palette, not the raw one: a coat that paints the wings out
      // still paints them out in the colour the bird is on.
      found = { ...p, ...owlPalette(name, c.scheme) };
      tinted.set(slot, found);
    }
    return found;
  };

  // A drawing that brings its own version of a part says so, and the bird's own is not
  // drawn. Painting it out is wrong twice: eyes and beak share a colour.
  const hidden = new Set<OwlPart>();
  for (const { accessory } of worn) for (const part of accessory.hides ?? []) hidden.add(part);

  // A drawing may name one of a pair or the pair itself, so a side is hidden by either.
  // A wink hides one eye; an expression that brings both says "eyes" once.
  const gone = (part: OwlPart, pair?: OwlPart) =>
    hidden.has(part) || (pair !== undefined && hidden.has(pair));
  const draw = (part: OwlPart, markup: string, pair?: OwlPart) =>
    gone(part, pair) ? "" : markup;

  const parts =
    renderAccessories(worn, paletteFor, "behind") +
    draw("earTufts", renderEars(m, c.ears, p.body)) +
    draw("body", renderBody(m, p.body)) +
    draw("wingLeft", renderWing(m, p.wing, -1), "wings") +
    draw("wingRight", renderWing(m, p.wing, 1), "wings") +
    renderAccessories(worn, paletteFor, "underFace") +
    draw("face", renderFace(m, p.face)) +
    renderAccessories(worn, paletteFor, "overFace") +
    draw("eyeLeft", renderEye(m, p, -1), "eyes") +
    draw("eyeRight", renderEye(m, p, 1), "eyes") +
    draw("beak", renderBeak(m, p.accent)) +
    renderAccessories(worn, paletteFor, "overEyes") +
    renderAccessories(worn, paletteFor, "overAll");

  const title = c.title ? `<title>${escapeXml(c.title)}</title>` : "";
  const label = c.title
    ? ` role="img" aria-label="${escapeXml(c.title)}"`
    : ` role="img" aria-hidden="true"`;

  // The clip only earns its keep when there is a corner radius, and it costs an id that
  // has to stay unique on a page with fifty avatars. Without one, the viewBox does it.
  const radius = c.cornerRadius * (VIEWBOX / 2);
  const field = c.background
    ? `<rect width="${VIEWBOX}" height="${VIEWBOX}"${radius > 0 ? ` rx="${fmt(radius)}"` : ""} fill="${c.background}"/>`
    : "";

  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${c.size}" height="${c.size}" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" fill="none"${label}>${title}`;

  if (radius > 0) {
    const id = `owl${hash32(c.seed).toString(36)}`;
    return (
      `${open}<defs><clipPath id="${id}"><rect width="${VIEWBOX}" height="${VIEWBOX}" rx="${fmt(radius)}"/></clipPath></defs>` +
      `<g clip-path="url(#${id})">${field}${parts}</g></svg>`
    );
  }

  return `${open}${field}${parts}</svg>`;
}

/**
 * The bird's own paths, each tagged with the part that drew it. For tooling: the
 * extractor has to know a repainted path is an eye, and colour cannot tell it.
 */
export function owlPartPaths(options: OwlOptions = {}): { part: OwlPart; d: string }[] {
  const c = resolveOwl("parts", options);
  const m = OWL;
  const p = c.palette;

  const shapes = (part: OwlPart, markup: string) =>
    [...markup.matchAll(/\bd="([^"]*)"/g)].map((match) => ({ part, d: match[1]! }));

  return [
    ...shapes("earTufts", renderEars(m, c.ears, p.body)),
    ...shapes("body", renderBody(m, p.body)),
    ...shapes("wingLeft", renderWing(m, p.wing, -1)),
    ...shapes("wingRight", renderWing(m, p.wing, 1)),
    ...shapes("face", renderFace(m, p.face)),
    ...shapes("eyeLeft", renderEye(m, p, -1)),
    ...shapes("eyeRight", renderEye(m, p, 1)),
    ...shapes("beak", renderBeak(m, p.accent)),
  ];
}

/** The same owl as a data URI, for an `<img src>`. */
export function owlAvatarDataUri(seed: Seed, options: OwlOptions = {}): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(owlAvatarSvg(seed, options))}`;
}

/**
 * The colour this owl's field is painted in, as `#rrggbb`. Voice tiles are tinted from
 * it — the background, because that is what reads as "that person's colour".
 */
export function owlAvatarColour(seed: Seed, options: OwlOptions = {}): string {
  return resolveOwl(seed, options).palette.background;
}
