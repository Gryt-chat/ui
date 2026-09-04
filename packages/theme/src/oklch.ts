/**
 * sRGB and OKLCH, and the scale generator. At runtime rather than only in a
 * script because overriding a colour has to regenerate its whole scale — a
 * theme that set `--gryt-accent` and left `--gryt-accent-9` alone would change
 * almost nothing, since the components read the scale.
 *
 * No dependency: the published OKLab matrices are eighty lines of arithmetic.
 */

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return [
    parseInt(full.slice(0, 2), 16) / 255,
    parseInt(full.slice(2, 4), 16) / 255,
    parseInt(full.slice(4, 6), 16) / 255
  ];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  const part = (c: number) =>
    Math.round(clamp01(c) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

export function hexToOklch(hex: string): Oklch {
  const [r0, g0, b0] = hexToRgb(hex).map(srgbToLinear) as [
    number,
    number,
    number
  ];
  const l = Math.cbrt(
    0.4122214708 * r0 + 0.5363325363 * g0 + 0.0514459929 * b0
  );
  const m = Math.cbrt(
    0.2119034982 * r0 + 0.6806995451 * g0 + 0.1073969566 * b0
  );
  const s = Math.cbrt(
    0.0883024619 * r0 + 0.2817188376 * g0 + 0.6299787005 * b0
  );
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    l: L,
    c: Math.hypot(a, b),
    h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
  };
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return rgbToHex([
    linearToSrgb(clamp01(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3)),
    linearToSrgb(clamp01(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3)),
    linearToSrgb(clamp01(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3))
  ]);
}

/** The lightness and chroma of each step on a hue scale, dark theme. */
const HUE_L = [0.195, 0.24, 0.27, 0.3, 0.33, 0.37, 0.43, 0.52];
const HUE_C = [0.014, 0.026, 0.04, 0.052, 0.062, 0.072, 0.084, 0.1];

/**
 * Twelve steps for a hue. 1-8 are backgrounds and borders, 9 and 10 the
 * anchors, 11 and 12 text — **placed relative to 10 rather than at a fixed
 * lightness**, since the -light tokens differ family to family and a fixed
 * value puts text above the fill in one scale and below it in another.
 */
export function hueScale(solid: string, solidHover: string): string[] {
  const { h } = hexToOklch(solid);
  const steps = HUE_L.map((l, i) => oklchToHex({ l, c: HUE_C[i], h }));
  steps.push(solid, solidHover);

  const l10 = hexToOklch(solidHover).l;
  const l11 = Math.min(0.95, Math.max(0.84, l10 + 0.04));
  const l12 = Math.min(0.98, Math.max(l11 + 0.06, 0.93));
  steps.push(oklchToHex({ l: l11, c: 0.11, h }));
  steps.push(oklchToHex({ l: l12, c: 0.055, h }));
  return steps;
}

const NEUTRAL_L = [
  0.187, 0.231, 0.245, 0.268, 0.289, 0.31, 0.355, 0.425, 0.52, 0.57, 0.627,
  0.908
];
const NEUTRAL_C = [
  0.011, 0.014, 0.016, 0.019, 0.022, 0.024, 0.026, 0.026, 0.02, 0.012, 0.0,
  0.008
];

/**
 * Twelve neutral steps, from the six an app names directly.
 *
 * Those six are kept exactly — a theme that says its background is #0b0b0f
 * means it, and interpolating through it would move it by a shade.
 */
export function neutralScale(anchors: {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  muted: string;
  text: string;
}): string[] {
  const fixed: Record<number, string> = {
    0: anchors.bg,
    1: anchors.surface,
    2: anchors.surfaceRaised,
    5: anchors.border,
    10: anchors.muted,
    11: anchors.text
  };
  const hue = hexToOklch(anchors.border).h;
  return NEUTRAL_L.map(
    (l, i) => fixed[i] ?? oklchToHex({ l, c: NEUTRAL_C[i], h: hue })
  );
}

/**
 * The same steps as translucent overlays.
 *
 * Solved rather than guessed: the smallest alpha whose overlay colour is still
 * inside the gamut, which is what makes a tinted hover composite to the same
 * value over an avatar as it does over the app background.
 */
export function alphaScale(scale: string[], background: string): string[] {
  const bg = hexToRgb(background);
  return scale.map((hex) => {
    const target = hexToRgb(hex);
    let alpha = 0;
    for (let i = 0; i < 3; i++) {
      const t = target[i];
      const b = bg[i];
      if (t > b) alpha = Math.max(alpha, b < 1 ? (t - b) / (1 - b) : 0);
      else if (t < b) alpha = Math.max(alpha, b > 0 ? (b - t) / b : 0);
    }
    if (alpha < 1e-6) return "transparent";
    const overlay = rgbToHex(
      target.map((t, i) => clamp01(bg[i] + (t - bg[i]) / alpha)) as [
        number,
        number,
        number
      ]
    );
    const [r, g, b] = hexToRgb(overlay).map((c) => Math.round(c * 255));
    return `rgb(${r} ${g} ${b} / ${(alpha * 100).toFixed(1)}%)`;
  });
}

/* ── light ──────────────────────────────────────────────────────────────
   Not a mirror of the dark ramps, because elevation does not mirror: step 1 is
   a light grey page and step 2 is white, so **the ramp is deliberately not
   monotonic across those two** — that non-monotonicity is the elevation.

   The text steps were measured. Here they have to be dark enough on white,
   which is tighter than being light enough on near-black. */

const LIGHT_NEUTRAL_L = [
  0.962, 1.0, 0.978, 0.952, 0.928, 0.898, 0.855, 0.79, 0.66, 0.61, 0.48, 0.25
];
const LIGHT_NEUTRAL_C = [
  0.006, 0.0, 0.004, 0.007, 0.01, 0.013, 0.016, 0.018, 0.016, 0.014, 0.012,
  0.014
];

const LIGHT_HUE_L = [0.975, 0.955, 0.93, 0.905, 0.878, 0.845, 0.795, 0.72];
const LIGHT_HUE_C = [0.012, 0.024, 0.038, 0.05, 0.062, 0.074, 0.09, 0.11];

/** Twelve light neutral steps. Anchors are kept exactly, as in the dark set. */
export function neutralScaleLight(anchors: {
  bg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  muted: string;
  text: string;
}): string[] {
  const fixed: Record<number, string> = {
    0: anchors.bg,
    1: anchors.surface,
    2: anchors.surfaceRaised,
    5: anchors.border,
    10: anchors.muted,
    11: anchors.text
  };
  const hue = hexToOklch(anchors.border).h;
  return LIGHT_NEUTRAL_L.map(
    (l, i) => fixed[i] ?? oklchToHex({ l, c: LIGHT_NEUTRAL_C[i], h: hue })
  );
}

/**
 * Twelve light steps for a hue.
 *
 * Step 9 stays the brand colour, so a filled button is the same colour in both
 * appearances and Gryt looks like Gryt either way. 10 goes *darker* for hover,
 * which is the light-mode direction — the dark set goes lighter. 11 and 12 are
 * text, dark enough to read on white.
 */
export function hueScaleLight(solid: string): string[] {
  const { l, c, h } = hexToOklch(solid);
  const steps = LIGHT_HUE_L.map((sl, i) =>
    oklchToHex({ l: sl, c: LIGHT_HUE_C[i], h })
  );
  steps.push(solid);
  steps.push(oklchToHex({ l: Math.max(0, l - 0.07), c, h }));
  // 0.46 rather than 0.5, which is where this started. Step 11 has to carry
  // text on step 3 as well as on the page — a Chip, an Alert and a Toast are
  // all that pairing — and at 0.5 the secondary hue measured 4.48:1 against its
  // own tint. Four hundredths of lightness is not visible; failing AA is.
  steps.push(oklchToHex({ l: 0.46, c: 0.15, h }));
  steps.push(oklchToHex({ l: 0.33, c: 0.1, h }));
  return steps;
}

/** WCAG relative luminance, for asserting contrast rather than eyeballing it. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio. 4.5 is AA for body text, 3 for large text and UI. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
