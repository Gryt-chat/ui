/**
 * Reading the drawable things out of an SVG.
 *
 * A drawing tool does not only emit `<path>`. A rounded rectangle stays a
 * `<rect>`, a dot stays a `<circle>`, and a line drawn with the pen tool comes
 * out as a `<path>` with a `stroke` and no fill at all. An extractor that only
 * knows about filled paths drops the first two on the floor and turns the third
 * into a solid blob — all three silently, which is the part that matters. The
 * winter jacket arrived with two stroked seams and a `<rect>` for the zip pull,
 * and every one of those failures happened before this file existed.
 *
 * So: everything is converted to path data, stroke properties are carried
 * through, and anything not understood is reported rather than skipped.
 */

/** One drawable thing, as path data and the paint it was drawn with. */
export interface Shape {
  d: string;
  /**
   * Empty rather than the string "none", for both of these. The caller tests
   * them for truthiness to decide whether a shape is filled, stroked or both,
   * and "none" is truthy.
   */
  fill: string;
  stroke: string;
  /** Zero when there is no stroke, so it is never read against an empty one. */
  strokeWidth: number;
  linecap?: string;
  linejoin?: string;
  evenodd: boolean;
  /**
   * The layer name, when the drawing tool was asked to write one.
   *
   * Figma emits layer names as `id` only if "Include id attribute" is on, so
   * this is absent on any older export and everything downstream has to cope
   * without it.
   */
  id?: string;
  /**
   * Whether this sat inside a group named `owl`.
   *
   * That group is the whole point: it says which shapes are the bird and which
   * are the thing being drawn on it, so the extractor does not have to
   * recognise the bird by its geometry and cannot be fooled when a drawing tool
   * rewrites a curve.
   */
  inOwl?: boolean;
  /**
   * Whether this was drawn before the group named `owl` opened.
   *
   * An SVG paints in document order, so a shape ahead of the bird is a shape
   * behind the bird. That is how a drawing says "this goes underneath" without
   * anybody naming a layer in the filename, and it is the only thing telling
   * the two headsets apart: read off their geometry they are the same three
   * paths, and one wears its band behind the ear tufts.
   *
   * False once the group has been seen, and false throughout a drawing that
   * has no group at all.
   */
  beforeOwl?: boolean;
}

export interface ReadShapesResult {
  shapes: Shape[];
  /** Tags that turned up and were not understood. Reported, never skipped. */
  unknown: string[];
}

/** Kappa: the handle length that turns four cubics into a circle. */
const K = 0.5522847498307936;

function attr(attrs: string, name: string): string | undefined {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(attrs);
  return m ? m[1] : undefined;
}

function num(attrs: string, name: string, fallback = 0): number {
  const v = attr(attrs, name);
  return v === undefined ? fallback : Number(v);
}

function round(n: number): number {
  return Number(n.toFixed(3));
}

/**
 * A rectangle as path data, corners included.
 *
 * Cubics rather than arcs, because the simplifier's parser refuses arcs — and
 * it refuses them on purpose, so this converts rather than making it guess.
 */
export function rectPath(attrs: string): string {
  const x = num(attrs, "x");
  const y = num(attrs, "y");
  const w = num(attrs, "width");
  const h = num(attrs, "height");
  let rx = num(attrs, "rx", num(attrs, "ry"));
  let ry = num(attrs, "ry", rx);
  rx = Math.min(rx, w / 2);
  ry = Math.min(ry, h / 2);

  if (rx <= 0 || ry <= 0) {
    return `M${round(x)} ${round(y)}H${round(x + w)}V${round(y + h)}H${round(x)}Z`;
  }
  const cx = rx * K;
  const cy = ry * K;
  const p = (a: number, b: number) => `${round(a)} ${round(b)}`;
  return (
    `M${p(x + rx, y)}` +
    `L${p(x + w - rx, y)}` +
    `C${p(x + w - rx + cx, y)} ${p(x + w, y + ry - cy)} ${p(x + w, y + ry)}` +
    `L${p(x + w, y + h - ry)}` +
    `C${p(x + w, y + h - ry + cy)} ${p(x + w - rx + cx, y + h)} ${p(x + w - rx, y + h)}` +
    `L${p(x + rx, y + h)}` +
    `C${p(x + rx - cx, y + h)} ${p(x, y + h - ry + cy)} ${p(x, y + h - ry)}` +
    `L${p(x, y + ry)}` +
    `C${p(x, y + ry - cy)} ${p(x + rx - cx, y)} ${p(x + rx, y)}Z`
  );
}

/** An ellipse as four cubics. `<circle>` is the case where rx and ry agree. */
export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  const hx = rx * K;
  const hy = ry * K;
  const p = (a: number, b: number) => `${round(a)} ${round(b)}`;
  return (
    `M${p(cx, cy - ry)}` +
    `C${p(cx + hx, cy - ry)} ${p(cx + rx, cy - hy)} ${p(cx + rx, cy)}` +
    `C${p(cx + rx, cy + hy)} ${p(cx + hx, cy + ry)} ${p(cx, cy + ry)}` +
    `C${p(cx - hx, cy + ry)} ${p(cx - rx, cy + hy)} ${p(cx - rx, cy)}` +
    `C${p(cx - rx, cy - hy)} ${p(cx - hx, cy - ry)} ${p(cx, cy - ry)}Z`
  );
}

function pointsPath(attrs: string, close: boolean): string {
  const nums = (attr(attrs, "points") || "").match(/-?\d*\.?\d+/g) || [];
  if (nums.length < 4) return "";
  let d = `M${nums[0]} ${nums[1]}`;
  for (let i = 2; i + 1 < nums.length; i += 2) d += `L${nums[i]} ${nums[i + 1]}`;
  return close ? d + "Z" : d;
}

/** Tags that hold no artwork and should not be walked into. */
const IGNORED = new Set(["svg", "g", "defs", "clippath", "mask", "title", "desc", "style"]);

/**
 * One colour, spelled the one way.
 *
 * Everything downstream compares colours as strings — the extractor decides
 * "this arm is painted the background, so the drawing means to remove it" with
 * `p.fill === realPalette.background`, and the ink table is keyed on hex. A
 * tool that writes the same colour differently is therefore a tool whose
 * drawings quietly do the wrong thing.
 *
 * Quietly is the problem. A wing whose colour matches nothing falls through to
 * "could not place this", which drops the path and adds a warning — so the arm
 * is neither hidden nor recoloured, the bird's own wing draws, and the run
 * succeeds. Figma writes `#6cdac8ff` and the jackets stopped dropping their
 * arms, with a warning line as the only sign.
 *
 * `#rgb`, `rgb()` and `rgba()` all fold to six-digit hex. An eight-digit hex
 * folds only when its alpha is `ff`.
 *
 * A real alpha is left exactly as it was. `#6cdac880` is a translucent colour
 * and genuinely is not the background; flattening it would trade a silent miss
 * for a silent lie, and failing loudly is the better of the two.
 */
export function colour(raw: string | undefined): string {
  const value = (raw || "none").trim().toLowerCase();
  if (value === "none" || value === "") return "";

  const hex = /^#([0-9a-f]{3,8})$/.exec(value);
  if (hex) {
    const digits = hex[1];
    if (digits.length === 3) return "#" + [...digits].map((d) => d + d).join("");
    if (digits.length === 6) return value;
    if (digits.length === 8 && digits.slice(6) === "ff") return "#" + digits.slice(0, 6);
    return value;
  }

  const rgb = /^rgba?\(([^)]+)\)$/.exec(value);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length >= 4 && parts[3] !== "1" && parts[3] !== "100%") return value;
    const channels = parts.slice(0, 3).map((part) =>
      part.endsWith("%")
        ? Math.round((parseFloat(part) / 100) * 255)
        : Math.round(parseFloat(part)),
    );
    if (channels.length !== 3 || channels.some((n) => Number.isNaN(n))) return value;
    return (
      "#" +
      channels
        .map((n) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0"))
        .join("")
    );
  }

  // A named colour, a url(#gradient), anything else. Left alone: this
  // normalises spelling, it does not resolve colour.
  return value;
}

/**
 * Every drawable thing in an SVG, as path data with its paint.
 *
 * `<defs>` is cut out first, so a clip path's rectangle is never mistaken for a
 * rectangle somebody drew.
 *
 * A missing `fill` means none, which is what the root `<svg fill="none">` these
 * files carry already says. A path with a stroke and no fill is a line, and it
 * has to stay one.
 */
export function readShapes(svg: string): ReadShapesResult {
  const body = svg.replace(/<defs\b[\s\S]*?<\/defs>/gi, "");
  const shapes: Shape[] = [];
  const unknown = new Set<string>();

  /*
   * Containers are tracked rather than skipped, so a shape can say whether it
   * sat inside the group named `owl`. Only the outermost such group counts —
   * a layer inside the bird called "owl" again would otherwise close the real
   * one early and hand half the bird to the accessory.
   */
  let depth = 0;
  let owlDepth: number | null = null;
  let seenOwl = false;

  for (const m of body.matchAll(/<(\/?)([A-Za-z][\w-]*)\b([^>]*?)(\/?)>/g)) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    const selfClosing = m[4] === "/";

    if (tag === "g" || tag === "svg") {
      if (closing) {
        if (owlDepth !== null && depth === owlDepth) owlDepth = null;
        depth -= 1;
      } else if (!selfClosing) {
        depth += 1;
        if (owlDepth === null && (attr(attrs, "id") ?? "").trim().toLowerCase() === "owl") {
          owlDepth = depth;
          seenOwl = true;
        }
      }
      continue;
    }
    if (closing || IGNORED.has(tag)) continue;

    let d: string | undefined;
    if (tag === "path") d = attr(attrs, "d");
    else if (tag === "rect") d = rectPath(attrs);
    else if (tag === "circle") {
      const r = num(attrs, "r");
      d = ellipsePath(num(attrs, "cx"), num(attrs, "cy"), r, r);
    } else if (tag === "ellipse") {
      d = ellipsePath(num(attrs, "cx"), num(attrs, "cy"), num(attrs, "rx"), num(attrs, "ry"));
    } else if (tag === "polygon") d = pointsPath(attrs, true);
    else if (tag === "polyline") d = pointsPath(attrs, false);
    else if (tag === "line") {
      d =
        `M${num(attrs, "x1")} ${num(attrs, "y1")}` +
        `L${num(attrs, "x2")} ${num(attrs, "y2")}`;
    } else {
      unknown.add(tag);
      continue;
    }
    if (!d) continue;

    const fill = colour(attr(attrs, "fill"));
    const stroke = colour(attr(attrs, "stroke"));
    shapes.push({
      d,
      fill,
      stroke,
      strokeWidth: stroke === "" ? 0 : num(attrs, "stroke-width", 1),
      linecap: attr(attrs, "stroke-linecap"),
      linejoin: attr(attrs, "stroke-linejoin"),
      evenodd: /fill-rule="evenodd"/.test(attrs),
      id: attr(attrs, "id"),
      inOwl: owlDepth !== null,
      beforeOwl: !seenOwl,
    });
  }

  return { shapes, unknown: [...unknown] };
}
