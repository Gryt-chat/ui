/**
 * Taking a drawing of the bird wearing something and getting the something out.
 *
 * Pulled out of owl-accessory.ts so that more than one thing can run it. The
 * script does, and so does the drop zone on the site's drawing guide — the
 * point of which is that somebody can check an export without cloning a
 * monorepo first. Nothing in here touches the filesystem or process.argv, and
 * it has to stay that way: a browser is one of the callers.
 *
 * The subtraction matches the bird on its geometry rather than on its path
 * data. A drawing tool rewrites path data on export — degenerate segments come
 * back as H and L, numbers get re-rounded — so comparing strings finds nothing.
 * Extent, perimeter and area survive that.
 */

import * as owl from "../index";
import type { OwlPart } from "../types";

import { readShapes, type Shape } from "./svg-shapes";
import { GROUPED_PARTS, PART_BY_LAYER } from "./owl-group";
import { simplifyPath } from "./svg-simplify";
import { DEFAULT_LAYER } from "./filename";

// The ink table used to be re-exported from here, so a caller had one import
// for the whole job. It cannot be now: this file moved under src/ so the CLI
// could reach it, and artwork/ is not package code — it is this repository's
// drawings and the roles they are painted in. Somebody drawing a hat at their
// own kitchen table has no copy of it and should not need one.
//
// `scripts/authoring.ts` puts the two back together for the things that do want
// both, which is the docs app's upload checker.
export {
  placementFor,
  isIgnored,
  KEYWORDS,
  RARITY_SHARE,
  type Placement,
  type Rarity
} from "./filename";

/**
 * The bird the extractor subtracts, and the one the guide hands out.
 *
 * See OWL_BASE for why it is defined in the package rather than here.
 */
const BASE = owl.OWL_BASE;

/* --- geometry ------------------------------------------------------------ */

/**
 * A path, walked and sampled into a polyline.
 *
 * Supports the commands a drawing tool actually emits for this artwork. Arcs
 * are not among them and are rejected rather than approximated — an accessory
 * that is subtly the wrong shape is harder to notice than one that refuses to
 * build.
 */
function flatten(d: string) {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
  const points: Array<[number, number]> = [];
  let subpaths = 0;
  let i = 0;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let command = "";
  const num = () => Number(tokens[i++]);

  /** Eight samples a curve: enough that two spellings of one arc agree. */
  const cubic = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
    for (let k = 1; k <= 8; k += 1) {
      const t = k / 8;
      const u = 1 - t;
      points.push([
        u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
        u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
      ]);
    }
    x = x3;
    y = y3;
  };

  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) command = tokens[i++];
    const rel = command === command.toLowerCase();
    const c = command.toUpperCase();
    if (c === "A") throw new Error("arc commands are not supported");

    if (c === "Z") {
      points.push([sx, sy]);
      x = sx;
      y = sy;
      continue;
    }
    if (c === "M") {
      x = rel ? x + num() : num();
      y = rel ? y + num() : num();
      sx = x;
      sy = y;
      subpaths += 1;
      points.push([x, y]);
      command = rel ? "l" : "L";
      continue;
    }
    if (c === "L") {
      x = rel ? x + num() : num();
      y = rel ? y + num() : num();
      points.push([x, y]);
      continue;
    }
    if (c === "H") {
      x = rel ? x + num() : num();
      points.push([x, y]);
      continue;
    }
    if (c === "V") {
      y = rel ? y + num() : num();
      points.push([x, y]);
      continue;
    }
    if (c === "C") {
      const x1 = rel ? x + num() : num();
      const y1 = rel ? y + num() : num();
      const x2 = rel ? x + num() : num();
      const y2 = rel ? y + num() : num();
      cubic(x1, y1, x2, y2, rel ? x + num() : num(), rel ? y + num() : num());
      continue;
    }
    if (c === "Q") {
      const qx = rel ? x + num() : num();
      const qy = rel ? y + num() : num();
      const ex = rel ? x + num() : num();
      const ey = rel ? y + num() : num();
      cubic(
        x + (2 / 3) * (qx - x), y + (2 / 3) * (qy - y),
        ex + (2 / 3) * (qx - ex), ey + (2 / 3) * (qy - ey),
        ex, ey,
      );
      continue;
    }
    throw new Error(`unsupported path command "${command}"`);
  }
  return { points, subpaths };
}

/**
 * What a path draws, as a string two files can be compared on.
 *
 * Extent, perimeter and area. Serialisation changes none of them, and two
 * genuinely different shapes agreeing on all three is not something that
 * happens by accident.
 *
 * The tolerance is deliberately tight, and widening it was tried. A drawing
 * whose bird has been nudged or rescaled by a fraction stops matching, and that
 * looks like something to paper over — but it is the tool working. The whole
 * method depends on the drawing sitting on an unmodified base, and a drawing
 * that no longer does produces an accessory in the wrong place. Rounding the
 * extent to whole units let the drift through the first check and left it
 * failing on perimeter and area anyway, so all it bought was a later and less
 * obvious error.
 *
 * When this stops matching, the fix is in the drawing: put it back on a clean
 * base. The "not found" note below says how many of the bird's paths went
 * missing, which is the number to watch.
 */function shapeKey(d: string): string {
  const { points, subpaths } = flatten(d);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let length = 0;
  let area = 0;
  for (let k = 0; k < points.length; k += 1) {
    const [px, py] = points[k];
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
    const [qx, qy] = points[(k + 1) % points.length];
    length += Math.hypot(qx - px, qy - py);
    area += px * qy - qx * py;
  }
  const r = (n: number) => Math.round(n * 2) / 2;
  return [
    r(minX), r(minY), r(maxX), r(maxY),
    Math.round(length), Math.round(Math.abs(area) / 2), subpaths,
  ].join("|");
}

/** The frame itself, however it is spelled — a background rather than a hat. */
function isBackground(d: string): boolean {
  const { points } = flatten(d);
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return (
    Math.min(...xs) <= 0.5 && Math.min(...ys) <= 0.5 &&
    Math.max(...xs) >= 1023.5 && Math.max(...ys) >= 1023.5 &&
    points.length <= 12
  );
}

function paths(svg: string): Shape[] {
  return readShapes(svg).shapes;
}

/* --- the bird, and what each of its paths is ----------------------------- */

/**
 * Which palette role each of the bird's paths is painted from.
 *
 * Found by drawing the bird once in a palette of sentinel colours and reading
 * the fills back, rather than by hard-coding "the fourth path is a wing". The
 * generator stays free to reorder its own layers.
 */
export const ROLES = [
  "background", "body", "face", "accent", "wing",
  "trimLight", "trim", "trimDeep", "trimSoft", "gold", "goldDeep",
] as const satisfies readonly owl.PaletteSlot[];
const sentinels: Partial<owl.OwlPalette> = Object.fromEntries(
  ROLES.map((role, i) => [role, `#${(i + 1).toString(16).padStart(6, "0")}`]),
);
const roleOf = new Map(
  paths(owl.owlAvatarSvg("base", { ...BASE, palette: sentinels })).map((p) => [
    shapeKey(p.d),
    ROLES[parseInt(p.fill.slice(1), 16) - 1],
  ]),
);

/**
 * Which part of the bird each of its paths belongs to.
 *
 * Colour cannot answer this — the eyes and the beak are both `accent` — and it
 * is the difference between "this drawing replaces the eyes" and "this drawing
 * paints the beak away too".
 */
const partOf = new Map(owl.owlPartPaths(BASE).map((p) => [shapeKey(p.d), p.part]));
export const realPalette = owl.owlPalette(BASE.palette, BASE.scheme);
const roleByColour = new Map(
  Object.entries(realPalette).map(([role, hex]) => [hex.toLowerCase(), role]),
);
// The field is not part of the bird. It is a <rect> here and a <path> in a
// drawing, so it would never match anyway — leaving it in only makes every
// extraction report one path missing.
const baseFills = new Map(
  paths(owl.owlAvatarSvg("base", BASE))
    .filter((p) => !isBackground(p.d))
    .map((p) => [shapeKey(p.d), p.fill]),
);

/* --- extraction ---------------------------------------------------------- */

/** How light a hex is, for sorting. Rough on purpose; it only needs an order. */
function lightness(hex: string): number {
  const int = parseInt(hex.replace("#", ""), 16);
  return (((int >> 16) & 255) * 0.299 + ((int >> 8) & 255) * 0.587 + (int & 255) * 0.114) / 255;
}

/** Lightest first, which is the order the drawn accessories use their tones in. */
const LADDER: owl.PaletteSlot[] = ["trimSoft", "trimLight", "trim", "trimDeep", "accent"];

/** What extract needs to know about the accessory it is pulling out. */
export interface ExtractOptions {
  name: string;
  /** Permanent, from artwork/keys.json. See scripts/lib/keys.ts. */
  key: string;
  slot: owl.AccessorySlot;
  /** Unset takes the slot's default from DEFAULT_LAYER. */
  layer?: string;
  weight: number;
  excludes: string[];
  places: number;
  tolerance: number;
  map: Map<string, owl.PaletteSlot>;
}

export function extract(svg: string, label: string, opts: ExtractOptions) {
  if (/<g\b[^>]*\btransform=/.test(svg)) {
    throw new Error(
      `${label} has a <g transform=...> in it. Flatten the transforms in the drawing ` +
        "tool and export again — this script does not apply them, and an accessory " +
        "that is silently offset is worse than one that fails to build.",
    );
  }
  const viewBox = /viewBox="([^"]*)"/.exec(svg)?.[1];
  if (viewBox && viewBox.trim() !== "0 0 1024 1024") {
    throw new Error(
      `${label} has viewBox "${viewBox}". It has to be "0 0 1024 1024" — that is the ` +
        "frame the generator draws on, and it is the whole reason this works. Run with " +
        "--base to get a bird on the right frame and draw on that.",
    );
  }

  const seen = new Set<string>();
  const recolour: Partial<Record<owl.PaletteSlot, string>> = {};
  const hides = new Set<string>();
  const unplaceable = new Set<string>();
  const notes: string[] = [];

  const { shapes: allShapes, unknown } = readShapes(svg);
  for (const tag of unknown) {
    notes.push(`<${tag}> is not something this can read — it was left out`);
  }

  /*
   * When the drawing says which shapes are the bird, believe it.
   *
   * A Figma export with "Include id attribute" on wraps the bird in
   * `<g id="owl">` and names every part inside it. That is a statement of fact
   * from the drawing, and it beats recognising the bird by its geometry —
   * which is what everything below does, and which breaks whenever the tool
   * rewrites a curve, turns a segment into `H`, or moves something half a unit.
   * A day was lost to exactly that.
   *
   * So the bird is lifted out here and the geometry matcher below never sees
   * it. What is left is the accessory, and which parts are missing from the
   * group is which parts the drawing means to replace — deleting the eye you
   * are drawing over says "left" or "right" for free.
   *
   * Drawings without the group still go the old way, because there are fifty of
   * them in the history and they have to keep extracting the same.
   */
  const structural = allShapes.some((s) => s.inOwl);
  let drawn = allShapes;
  if (structural) {
    const inside = allShapes.filter((s) => s.inOwl);
    drawn = allShapes.filter((s) => !s.inOwl);

    const present = new Set<OwlPart>();
    for (const s of inside) {
      const part = PART_BY_LAYER.get((s.id ?? "").trim().toLowerCase());
      if (part) present.add(part);
      else if (s.id) notes.push(`a layer inside the owl group is named "${s.id}", which is not a part of the bird`);
    }
    for (const part of GROUPED_PARTS) {
      if (!present.has(part)) hides.add(part);
    }
  }

  const kept = drawn.filter((p) => {
    if (isBackground(p.d)) return false;
    const key = shapeKey(p.d);
    if (!baseFills.has(key)) return true;
    seen.add(key);

    // The shape is the bird's but the colour is not. Two different intentions
    // wear that disguise, and telling them apart needs to know which part it is.
    if (p.fill !== baseFills.get(key)) {
      const part = partOf.get(key);

      /*
       * An expression brings its own eyes and paints the drawn ones out to say
       * so. Recorded as "do not draw this one" rather than as a repaint: the
       * eyes and the beak share a colour, so repainting the role would take the
       * beak with them, and a plate-coloured disc is only invisible where the
       * plate is what happens to be behind it.
       *
       * Per side, because a wink is one closed eye and one open one. Hiding the
       * pair lost the open eye and the wink came out with a blank face.
       */
      if (part === "eyeLeft" || part === "eyeRight") {
        hides.add(part);
        return false;
      }

      /*
       * A part painted the background's colour is a part the drawing means to
       * remove — a coat over an arm, a hat over the ear tufts. Recorded as a
       * hide of that part rather than as a repaint of its role, which would
       * take everything sharing the role whether the drawing covered it or not.
       *
       * This was the wings only, and the rest of the bird fell through to the
       * role. That made an oversize hat delete the whole torso: the ear tufts
       * are drawn in the body's colour, so painting over the two of them read
       * as "repaint body" and repainted the chest with them. The drawing had
       * covered two shapes near the crown and lost everything below the face.
       *
       * Anything painted some other colour is a genuine recolour and stays one,
       * and stays keyed by role — a coat that turns the arms brown means the
       * role, not one arm.
       */
      if (part && p.fill === realPalette.background) {
        hides.add(part);
        return false;
      }

      const role = roleOf.get(key);
      const to = roleByColour.get(p.fill);
      if (!role) unplaceable.add(`${p.fill} — could not tell which part that is`);
      else if (!to) {
        // A part of the bird repainted in a colour that is not one of the
        // bird's. The drawing asked for something and gets nothing: the path is
        // dropped and the bird's own part draws underneath, unchanged.
        //
        // Worth naming the common case, because the fix is not obvious from
        // "not one of the base owl's colours". An arm painted the background
        // colour is how a coat drops the arms, and it used to miss whenever the
        // drawing tool spelled that colour a different way. Colours are
        // normalised now, so reaching here means the colour really is different.
        const hint =
          part === "wingLeft" || part === "wingRight"
            ? ` (to drop an arm, paint it exactly ${realPalette.background})`
            : "";
        unplaceable.add(`${p.fill} on ${part} — not one of the base owl's colours${hint}`);
      } else recolour[role] = to;
    }
    return false;
  });

  /*
   * A part of the bird the drawing does not contain is a part the drawing means
   * to replace.
   *
   * Deleting the eye you are drawing over is the natural thing to do — hide the
   * layer in the component instance and draw the new one — and it already says
   * exactly which side. eyes_wink_left removes the left eye and keeps the
   * right; eyes_wink_right does the mirror. That is the whole signal, per side,
   * for free.
   *
   * It used to be read the other way round: the eye had to be *present* for the
   * hide to be recorded, so deleting it left the bird's own eye drawing
   * underneath the new one. Every expression broke at once the day the drawings
   * moved to a Figma component, because the component made deleting a layer the
   * obvious move.
   *
   * Only the parts an accessory legitimately replaces. A missing body or face
   * is not an intention, it is a drawing that was not made on this bird, and
   * silently hiding the torso is the worst way to find that out.
   */
  const REPLACEABLE = new Set<OwlPart>([
    "eyeLeft", "eyeRight", "beak", "earTufts", "wingLeft", "wingRight",
  ]);
  /*
   * Only when the drawing did not say. With `<g id="owl">` the bird was lifted
   * out above and never offered to the matcher, so every base path would look
   * absent and the whole bird would be hidden — which is what happened the
   * first time this ran.
   */
  const absent = structural ? [] : [...baseFills.keys()].filter((k) => !seen.has(k));
  const unexplained: string[] = [];
  for (const key of absent) {
    const part = partOf.get(key);
    if (part && REPLACEABLE.has(part)) hides.add(part);
    else unexplained.push(part ?? "an unidentified path");
  }
  if (unexplained.length > 0) {
    notes.push(
      `${unexplained.length} of the bird's ${baseFills.size} paths were not found ` +
        `(${[...new Set(unexplained)].join(", ")}) — a layer was edited or moved, ` +
        "or this was not drawn on the base",
    );
  }
  for (const f of unplaceable) notes.push(`repainted in a colour this cannot place: ${f}`);
  if (kept.length === 0 && Object.keys(recolour).length === 0 && hides.size === 0) {
    throw new Error(`${label}: nothing left after subtracting the bird`);
  }

  // Shrink after the subtraction, never before it: the bird is matched on its
  // geometry, and rounding the drawing first would move the very numbers being
  // matched on.
  const before = kept.reduce((n, p) => n + p.d.length, 0);
  for (const p of kept) p.d = simplifyPath(p.d, opts.places, opts.tolerance);
  const after = kept.reduce((n, p) => n + p.d.length, 0);

  const distinct = [
    ...new Set(kept.flatMap((p) => [p.fill, p.stroke].filter(Boolean))),
  ].sort((a, b) => lightness(b) - lightness(a));
  const roles = new Map<string, owl.PaletteSlot>();
  distinct.forEach((hex, i) => {
    roles.set(hex, opts.map.get(hex) ?? LADDER[Math.min(i, LADDER.length - 1)]);
  });

  /*
   * A drawing that sits ahead of the bird in the file is drawn behind it.
   *
   * Same statement of fact as the group itself, one level up: document order
   * is what an SVG paints in, so a headset band drawn before `<g id="owl">` is
   * a band the ear tufts come through. Without this the two headsets extract
   * to the same three paths in the same layer and are one accessory holding
   * two of the head slot's shares.
   *
   * Only when the filename did not say. A `.behind` or `.over-all` tag is
   * somebody overriding this on purpose, and it wins.
   */
  const named = opts.layer ?? DEFAULT_LAYER[opts.slot] ?? "overAll";
  const sitsBehind =
    structural && kept.length > 0 && kept.every((p) => p.beforeOwl);
  const layer =
    sitsBehind && named === (DEFAULT_LAYER[opts.slot] ?? "overAll") ? "behind" : named;
  const repaints = Object.entries(recolour);
  const literal =
    `  {\n` +
    `    name: "${opts.name}",\n` +
    `    key: "${opts.key}",\n` +
    `    slot: "${opts.slot}",\n` +
    `    layer: "${layer}",\n` +
    `    weight: ${opts.weight},\n` +
    (opts.excludes.length
      ? `    excludes: [${opts.excludes.map((e) => `"${e}"`).join(", ")}],\n`
      : "") +
    (hides.size
      ? `    hides: [${[...hides].map((h) => `"${h}"`).join(", ")}],\n`
      : "") +
    (repaints.length
      ? `    recolour: { ${repaints.map(([k, v]) => `${k}: "${v}"`).join(", ")} },\n`
      : "") +
    `    paths: [\n` +
    kept
      .map((p) => {
        const bits = [];
        if (p.fill) bits.push(`fill: "${roles.get(p.fill)}"`);
        if (p.stroke) {
          bits.push(`stroke: "${roles.get(p.stroke)}"`);
          bits.push(`strokeWidth: ${Math.round(p.strokeWidth * 10) / 10}`);
          if (p.linecap) bits.push(`linecap: "${p.linecap}"`);
          if (p.linejoin) bits.push(`linejoin: "${p.linejoin}"`);
        }
        if (p.evenodd) bits.push("evenodd: true");
        return `      { ${bits.join(", ")}, d: "${p.d}" },`;
      })
      .join("\n") +
    `\n    ],\n  },`;

  const pad = " ".repeat(20);

  // Colours the ink table has never seen. The caller collects these across
  // every drawing and stops, rather than shipping the lightness ladder's guess:
  // the ladder ranks a drawing's own colours against each other, so it has no
  // way to know that a mid-teal is `trim` here and `trimLight` in a lighter
  // drawing, and it gets that wrong more often than not.
  const guessed = distinct.filter((hex) => !opts.map.has(hex));
  const summary =
    `${opts.name.padEnd(18)} ${String(kept.length).padStart(2)} paths  ` +
    `${(after / 1000).toFixed(1).padStart(5)}kB` +
    (before > after ? ` -${String(Math.round((100 * (before - after)) / before)).padStart(2)}%` : "     ") +
    `  ${opts.slot}/${layer}` +
    (hides.size ? `  hides ${[...hides].join(" ")}` : "") +
    (repaints.length ? `  repaints ${repaints.map(([k, v]) => `${k}->${v}`).join(" ")}` : "") +
    (guessed.length
      ? `\n${pad}guessed: ${guessed.map((h) => `${h}->${roles.get(h)}`).join(" ")}`
      : "") +
    notes.map((n) => `\n${pad}warning: ${n}`).join("");

  const paint = (p: Shape, colour: (hex: string) => string) =>
    `<path d="${p.d}"${p.evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : ""}` +
    ` fill="${p.fill ? colour(p.fill) : "none"}"` +
    (p.stroke
      ? ` stroke="${colour(p.stroke)}" stroke-width="${p.strokeWidth}"` +
        (p.linecap ? ` stroke-linecap="${p.linecap}"` : "") +
        (p.linejoin ? ` stroke-linejoin="${p.linejoin}"` : "")
      : "") +
    "/>";
  const body = kept.map((p) => paint(p, (hex) => hex)).join("");
  const stripped =
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" ` +
    `viewBox="0 0 1024 1024" fill="none">${body}</svg>\n`;

  return {
    literal,
    summary,
    stripped,
    roles,
    kept,
    paint,
    guessed,
    /*
     * How much of the bird was found, and how much there was to find.
     *
     * The number that says whether this was drawn on the base at all. A drawing
     * that finds none of the bird still extracts perfectly happily — it just
     * keeps every path in the file, including the bird's, and produces an
     * accessory shaped like a whole owl. The summary carries this as prose; a
     * caller that has to decide pass or fail needs the number.
     *
     * Deliberate replacements are not counted here. Deleting the eye you are
     * drawing over is how an expression says which eye it replaces, so counting
     * it as damage would fail every expression ever drawn. `replaced` has those
     * separately, and `found` is the honest count of what was located either
     * way — so found + missed does not have to equal ofBird.
     */
    missed: unexplained.length,
    replaced: [...hides],
    found: baseFills.size - absent.length,
    ofBird: baseFills.size,
    notes,
  };
}
