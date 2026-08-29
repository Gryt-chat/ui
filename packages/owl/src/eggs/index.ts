/**
 * Gryt's eggs: a deterministic generated image for something that is not a
 * person.
 *
 * The same rules as the owls, and for the same reason — the same seed draws the
 * same icon on every client, forever, so every draw is keyed on a channel name
 * and nothing touches Math.random, Date or Intl. See rng.ts.
 *
 * What it draws for is a group chat with no picture uploaded. It was written for
 * server icons, those are getting their own generator instead, and nothing here
 * is named for either — the seed is a string and what it stands for is the
 * caller's business.
 *
 * What it is not is an owl, and that is the job. An owl is one character wearing
 * things; this is a shape with a surface. Put a member list beside a list of
 * these and the two read as different kinds of thing without anybody having to
 * look twice.
 *
 * Back to front: the field, the field's own texture, then the eggs, each one
 * clipped to its shell with a tile of pattern inside it. The eggs are drawn in
 * the order Sivert painted them — deep at the back, light at the front — and
 * the palette hands out its shell tones in that order, so an arrangement of
 * three reads as three objects rather than one blob.
 */

import { escapeXml, fmt, VIEWBOX } from "../geometry";
import { PALETTE_NAMES, PALETTE_SCHEMES } from "../palette";
import { hash32, pick, pickWeighted, pickWeightedByName, unit } from "../rng";
import type { PaletteName, Seed } from "../types";
import { EGG_BASES } from "./bases.generated";
import { eggPalette } from "./palette";
import { EGG_PATTERNS } from "./patterns.generated";
import type {
  EggCount,
  EggOptions,
  EggPalette,
  EggPattern,
  ResolvedEgg,
  ResolvedEggs
} from "./types";

export * from "./types";
export { eggPalette, allEggPalettes } from "./palette";
export { EGG_PATTERNS } from "./patterns.generated";
export { EGG_BASES } from "./bases.generated";

export const EGG_COUNTS: readonly EggCount[] = [1, 2, 3];

/**
 * How often each arrangement turns up.
 *
 * Two is the most common because it is the one that shows the shell ramp off
 * without crowding — a single egg has no ramp to show and three of them are
 * busy at 32 px. This is a fixed list of three that cannot grow, so a shared
 * weighted roll is safe here in a way it is not for the patterns.
 */
const COUNT_WEIGHTS: readonly (readonly [EggCount, number])[] = [
  [1, 30],
  [2, 42],
  [3, 28]
];

/** A pattern by name, or undefined for one nothing here knows. */
export function eggPatternByName(
  name: string | null | undefined
): EggPattern | undefined {
  if (!name) return undefined;
  return EGG_PATTERNS.find((p) => p.name === name);
}

/** Every tile is equally likely against every other. Only "nothing" is tuned. */
const TILE_WEIGHT = 10;

/**
 * How often an egg comes up bare.
 *
 * "Nothing" is a candidate like any other, and its id is the empty string, so
 * adding a tile cannot move the draw that decides whether an egg is patterned
 * at all — only which tile it gets.
 *
 * The share is the weight against every tile's: 60 against 43 tiles at 10 each
 * is one egg in eight. That share drifts down as tiles are added, and it has to
 * — the alternative is deriving the weight from the tile count, which would
 * re-roll "is this egg bare" for every seed the next time one is added, which
 * is the exact thing the by-name draw exists to prevent.
 *
 * One in eight, because a plain egg beside two patterned ones is a rest and
 * three plain eggs is a missing icon.
 */
const BARE_WEIGHT = 60;

/**
 * How often the field comes up bare. Most of the time: the texture is a
 * whisper, and a whisper under every icon is a hum.
 */
const FIELD_BARE_WEIGHT = 560;

/**
 * A pattern for one channel, or null.
 *
 * Drawn by name rather than off one shared range, which is the rule the whole
 * generator is built on: adding a tile to the list can only take icons from the
 * other tiles, never trade two untouched ones against each other. See
 * pickWeightedByName in rng.ts for the measurement that bought that rule.
 */
function choosePattern(
  seed: string,
  channel: string,
  empty: number
): EggPattern | null {
  const entries: [EggPattern | null, string, number][] = [[null, "", empty]];
  for (const p of EGG_PATTERNS) entries.push([p, p.name, TILE_WEIGHT]);
  return pickWeightedByName(seed, channel, entries) ?? null;
}

/**
 * How often an egg borrows another hue: about one in five, and never the one at
 * the back.
 *
 * A borrowed rung is the same rung — rung 1 of violet has the lightness rung 1
 * of teal has, because the scheme decides lightness and only the hue moves. So
 * everything palette.test.ts asserts about separation still holds across a
 * mixed icon, by construction rather than by luck.
 *
 * Never the back one, because that is the egg the icon is read as. Letting it
 * wander makes the field's hue and the icon's hue two different answers to
 * "what colour is this thing".
 */
const HUE_WEIGHTS: readonly (readonly [boolean, number])[] = [
  [false, 78],
  [true, 22]
];

/** The palette one egg's rung is taken from. */
function chooseHue(
  seed: string,
  index: number,
  own: PaletteName,
  asked: PaletteName | null | undefined
): PaletteName {
  if (asked === null) return own;
  if (
    asked !== undefined &&
    (PALETTE_NAMES as readonly string[]).includes(asked)
  )
    return asked;
  if (index === 0) return own;
  if (!pickWeighted(seed, `egg:mixed:${index}`, HUE_WEIGHTS)) return own;

  // Two steps or more around the wheel of ten, so a mixed icon reads as mixed.
  // A neighbour would just look like the palette drifting.
  const others = PALETTE_NAMES.filter((n) => {
    const step = Math.abs(
      PALETTE_NAMES.indexOf(n) - PALETTE_NAMES.indexOf(own)
    );
    return Math.min(step, PALETTE_NAMES.length - step) >= 2;
  });
  return pick(seed, `egg:hue:${index}`, others);
}

/**
 * How much of the arrangement the tile shows.
 *
 * 1 is the drawing as painted, eggs whole and clear of the edge. Around 1.5
 * they start running off it, and the icon stops reading as objects in a nest
 * and starts reading as a mark — which is the dial for the one real problem
 * with drawing eggs at all.
 *
 * The seeded four run from 1.05 to 1.5 rather than sitting at 1, because whole
 * eggs arranged with room around them is the composition that reads as Easter,
 * and one that crops is the composition that reads as an icon. Four steps,
 * because the point is a composition that differs between seeds, not a zoom
 * slider.
 *
 * It scales the eggs and not the field. The field is the tile, and a field that
 * grew with them would put the gradient's ends off-screen and make the texture
 * a different size on every icon for no reason.
 */
const ZOOMS = [1.05, 1.2, 1.35, 1.5];

/**
 * How far the tile is turned, in degrees.
 *
 * Twelve steps of 15°, so the same tile on two eggs of one icon reads as two
 * surfaces rather than as a mistake, and a stripe is never a hair off vertical
 * — an angle of 2° looks like a bug in a way that 15° does not.
 */
function chooseAngle(seed: string, channel: string): number {
  return Math.floor(unit(seed, channel) * 12) * 15;
}

/**
 * How wide one repeat is drawn, in artboard units.
 *
 * The tile's own figure, nudged by a fifth either way. Every tile carries a
 * size that reads at 32 px (see artwork/eggs/patterns.json), and this only moves
 * it enough that two eggs wearing the same tile are not the same surface.
 */
function chooseTile(
  seed: string,
  channel: string,
  pattern: EggPattern
): number {
  const nudge = 0.8 + Math.floor(unit(seed, channel) * 5) * 0.1;
  return Math.round(pattern.tile * nudge);
}

/** Every choice this seed makes, with anything the caller passed in taking over. */
export function resolveEggs(
  seed: Seed,
  options: EggOptions = {}
): ResolvedEggs {
  const s = String(seed);

  // A name nothing knows falls back to the seed's own choice, the same rule the
  // owls apply: one unknown thing costs that thing, not the whole icon. The
  // name may have come from a preference saved by a build with a palette this
  // one does not have.
  const asked = options.palette;
  const paletteName =
    typeof asked === "string" && (PALETTE_NAMES as string[]).includes(asked)
      ? (asked as PaletteName)
      : pick(s, "egg:palette", PALETTE_NAMES);
  const scheme = options.scheme ?? pick(s, "egg:scheme", PALETTE_SCHEMES);

  const base = eggPalette(paletteName, scheme);
  const palette: EggPalette =
    options.palette && typeof options.palette === "object"
      ? { ...base, ...options.palette }
      : base;

  const count: EggCount =
    options.count && EGG_COUNTS.includes(options.count)
      ? options.count
      : pickWeightedByName(
          s,
          "egg:count",
          COUNT_WEIGHTS.map(([c, w]) => [c, String(c), w] as const)
        )!;

  // A palette per egg, cached, because eggPalette is not free and a three-egg
  // icon asks for the same one twice more often than not.
  const rungs = new Map<PaletteName, EggPalette>([[paletteName, palette]]);
  const rungPalette = (name: PaletteName): EggPalette => {
    let found = rungs.get(name);
    if (!found) {
      found = eggPalette(name, scheme);
      rungs.set(name, found);
    }
    return found;
  };

  const shapes = EGG_BASES[count - 1]!;
  const eggs: ResolvedEgg[] = shapes.map((d, i) => {
    // Keyed on the egg's place in the stack rather than on the arrangement, so
    // the back egg of a pair and the back egg of a trio are the same draw. An
    // icon that re-rolls every surface when it gains an egg is not one icon.
    const asked = options.patterns?.[i];
    const pattern =
      asked === null
        ? null
        : asked !== undefined
          ? (eggPatternByName(asked) ?? null)
          : choosePattern(s, `egg:pattern:${i}`, BARE_WEIGHT);

    const hue = chooseHue(s, i, paletteName, options.hues?.[i]);
    const from = rungPalette(hue);

    return {
      d,
      hue,
      shell: from.shells[i]!,
      ink: from.inks[i]!,
      inkSoft: from.inkSofts[i]!,
      pattern,
      angle: pattern ? chooseAngle(s, `egg:angle:${i}`) : 0,
      tile: pattern ? chooseTile(s, `egg:tile:${i}`, pattern) : 0
    };
  });

  const fieldAsked = options.fieldPattern;
  const fieldPattern =
    fieldAsked === null
      ? null
      : fieldAsked !== undefined
        ? (eggPatternByName(fieldAsked) ?? null)
        : choosePattern(s, "egg:field:pattern", FIELD_BARE_WEIGHT);

  const background =
    options.background === false
      ? null
      : typeof options.background === "string"
        ? options.background
        : palette.field;

  const resolved: ResolvedEggs = {
    seed: s,
    size: Math.max(1, Math.round(options.size ?? 256)),
    paletteName,
    scheme,
    palette,
    count,
    eggs,
    field: {
      pattern: fieldPattern,
      angle: fieldPattern ? chooseAngle(s, "egg:field:angle") : 0,
      // Half again as wide as the tile would be on an egg. The field is behind
      // three objects and is meant to be felt rather than read, and a texture
      // at egg scale behind an egg is two patterns fighting.
      tile: fieldPattern
        ? Math.round(chooseTile(s, "egg:field:tile", fieldPattern) * 1.5)
        : 0
    },
    background,
    zoom:
      options.zoom !== undefined
        ? Math.min(2, Math.max(0.5, options.zoom))
        : pick(s, "egg:zoom", ZOOMS),
    cornerRadius: Math.min(1, Math.max(0, options.cornerRadius ?? 0))
  };

  if (options.title !== undefined) resolved.title = options.title;
  return resolved;
}

/**
 * One `<pattern>` tile.
 *
 * `patternTransform` turns before it scales, which is upstream's order and the
 * one that keeps `tile` meaning what it says: a repeat is `tile` units wide
 * whatever angle it is at.
 */
function renderTile(
  id: string,
  pattern: EggPattern,
  ground: string,
  inks: readonly string[],
  angle: number,
  tile: number
): string {
  const scale = tile / pattern.width;

  let body = `<rect width="${pattern.width}" height="${pattern.height}" fill="${ground}"/>`;
  for (const [i, layer] of pattern.layers.entries()) {
    // Cycled rather than clamped, so a tile whose two layers are a figure and
    // its shadow keeps them apart however many layers it has.
    const colour = inks[i % inks.length]!;
    const paint =
      pattern.mode === "fill"
        ? `fill="${colour}" stroke="none"`
        : `fill="none" stroke="${colour}" stroke-width="${pattern.stroke}"` +
          (pattern.mode === "round"
            ? ` stroke-linejoin="round" stroke-linecap="round"`
            : "");
    body += layer.replace("/>", ` ${paint}/>`);
  }

  return (
    `<pattern id="${id}" patternUnits="userSpaceOnUse"` +
    ` width="${pattern.width}" height="${pattern.height}"` +
    ` patternTransform="rotate(${angle}) scale(${fmt(scale)})">${body}</pattern>`
  );
}

/**
 * `seed`'s eggs, as SVG markup.
 *
 * Every id in here is suffixed with a hash of the seed, because a list can
 * draw twenty of these inline on one page and two `<pattern id="a">` in one
 * document is one pattern. The owls learned this the same way.
 */
export function eggAvatarSvg(seed: Seed, options: EggOptions = {}): string {
  const c = resolveEggs(seed, options);
  const key = hash32(c.seed).toString(36);

  let defs = "";
  let art = "";

  if (c.background) {
    // A gradient rather than a flat fill, running a few points of lightness top
    // to bottom, in that direction because that is where the light is. It is
    // nearly invisible at 32 px and that is the intent — it stops a rail of
    // forty icons reading as forty flat swatches without any one of them
    // announcing a gradient.
    defs +=
      `<linearGradient id="f${key}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${c.background}"/>` +
      `<stop offset="1" stop-color="${c.palette.fieldDeep}"/>` +
      `</linearGradient>`;
    art += `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="url(#f${key})"/>`;

    if (c.field.pattern) {
      defs += renderTile(
        `t${key}`,
        c.field.pattern,
        "none",
        [c.palette.fieldInk],
        c.field.angle,
        c.field.tile
      );
      art += `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="url(#t${key})"/>`;
    }
  }

  /*
   * The shade under every egg.
   *
   * One gradient for the whole icon rather than one per egg, so the light comes
   * from one direction across the arrangement instead of each egg being lit on
   * its own. Black at a low alpha rather than a darker tone of the shell,
   * because a shell already carries a pattern in two inks and a third tone
   * would be a fourth thing to keep off the other three.
   *
   * It is what stops an egg reading as a flat sticker with a pattern printed on
   * it — which, at three to a tile, is a decorated egg.
   */
  const shade = `s${key}`;
  if (c.eggs.length > 0) {
    defs +=
      `<linearGradient id="${shade}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0.45" stop-color="#000" stop-opacity="0"/>` +
      `<stop offset="1" stop-color="#000" stop-opacity="0.2"/>` +
      `</linearGradient>`;
  }

  // Around the middle of the artboard, so an arrangement grows outwards rather
  // than sliding off one corner.
  const zoomed = c.zoom !== 1;
  if (zoomed) {
    const offset = (VIEWBOX - VIEWBOX * c.zoom) / 2;
    art += `<g transform="translate(${fmt(offset)} ${fmt(offset)}) scale(${fmt(c.zoom)})">`;
  }

  for (const [i, egg] of c.eggs.entries()) {
    const id = `e${key}${i}`;
    defs += `<clipPath id="c${id}"><path d="${egg.d}"/></clipPath>`;

    // The shell is the tile's own ground rather than a path under it, so the
    // egg is one shape however the tile is turned. A shell drawn separately and
    // a tile drawn over it disagree by a hairline at the edge, and at 32 px
    // that hairline is the whole outline.
    let ground = `<path d="${egg.d}" fill="${egg.shell}"/>`;
    if (egg.pattern) {
      defs += renderTile(
        id,
        egg.pattern,
        egg.shell,
        [egg.ink, egg.inkSoft],
        egg.angle,
        egg.tile
      );
      ground = `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="url(#${id})"/>`;
    }

    art +=
      `<g clip-path="url(#c${id})">${ground}` +
      `<rect width="${VIEWBOX}" height="${VIEWBOX}" fill="url(#${shade})"/></g>`;
  }

  if (zoomed) art += "</g>";

  const title = c.title ? `<title>${escapeXml(c.title)}</title>` : "";
  const label = c.title
    ? ` role="img" aria-label="${escapeXml(c.title)}"`
    : ` role="img" aria-hidden="true"`;

  const radius = c.cornerRadius * (VIEWBOX / 2);
  if (radius > 0) {
    defs +=
      `<clipPath id="r${key}">` +
      `<rect width="${VIEWBOX}" height="${VIEWBOX}" rx="${fmt(radius)}"/></clipPath>`;
    art = `<g clip-path="url(#r${key})">${art}</g>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${c.size}" height="${c.size}"` +
    ` viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" fill="none"${label}>${title}` +
    `<defs>${defs}</defs>${art}</svg>`
  );
}

/** The same icon as a data URI, for an `<img src>`. */
export function eggAvatarDataUri(seed: Seed, options: EggOptions = {}): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(eggAvatarSvg(seed, options))}`;
}

/**
 * The colour this icon's field is painted in, as `#rrggbb`.
 *
 * The top of the gradient rather than an average of it, so the answer is a
 * colour that is actually on the icon. Same contract as `owlAvatarColour`: it
 * is what a tile tinted from this seed should be tinted with.
 */
export function eggAvatarColour(seed: Seed, options: EggOptions = {}): string {
  return resolveEggs(seed, options).palette.field;
}
