/**
 * Reading the drawable things out of an SVG. A tool emits `<rect>` and `<circle>` too,
 * and a stroked path with no fill is a line — all converted, and nothing skipped silently.
 */

/** One drawable thing, as path data and the paint it was drawn with. */
export interface Shape {
  d: string;
  /**
   * Empty rather than the string "none", for both. The caller tests them for truthiness
   * to decide whether a shape is filled or stroked, and "none" is truthy.
   */
  fill: string;
  stroke: string;
  /** Zero when there is no stroke, so it is never read against an empty one. */
  strokeWidth: number;
  linecap?: string;
  linejoin?: string;
  evenodd: boolean;
  /**
   * The layer name, when the drawing tool wrote one. Figma emits it only with "Include id
   * attribute" on, so it is absent on older exports and everything has to cope.
   */
  id?: string;
  /**
   * Whether this sat inside a group named `owl`. That group says which shapes are the
   * bird, so the extractor does not have to recognise it by geometry.
   */
  inOwl?: boolean;
  /**
   * Whether this was drawn before the group named `owl` opened: an SVG paints in document
   * order, so a shape ahead of the bird is behind it. That tells the two headsets apart.
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
 * A rectangle as path data, corners included. Cubics rather than arcs, because the
 * simplifier's parser refuses arcs on purpose rather than guessing.
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
 * One colour, spelled the one way. Everything downstream compares colours as strings, and
 * a real alpha is left alone: `#6cdac880` is not the background, and flattening lies.
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
 * Every drawable thing in an SVG, as path data with its paint. `<defs>` is cut out first,
 * so a clip path's rectangle is never mistaken for one somebody drew.
 */
export function readShapes(svg: string): ReadShapesResult {
  const body = svg.replace(/<defs\b[\s\S]*?<\/defs>/gi, "");
  const shapes: Shape[] = [];
  const unknown = new Set<string>();

  /*
   * Containers are tracked rather than skipped, so a shape can say whether it sat inside
   * `owl`. Only the outermost counts, or a nested layer closes the real one early.
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
