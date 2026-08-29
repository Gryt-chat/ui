/* Generate a whole theme from nothing, and repair one that has drifted.
 *
 * The useful thing about a random theme is not the randomness. It is that a
 * palette of eighteen colours is a lot to pick by hand before you know whether
 * you like where it is going, and one button that produces a coherent starting
 * point is worth more than an empty set of pickers.
 *
 * Coherent is the whole trick. Random hex values produce noise, so almost
 * nothing here is free: the lightness of every step is fixed at roughly what
 * Gryt's own palette uses, the neutrals are tinted toward the accent's hue
 * rather than picked separately, and the status hues stay in the arcs people
 * read as go, careful and stop. What actually varies is the hue, how far the
 * neutrals lean into it, and the corner radius. That is enough to make two
 * rolls look unrelated while both of them still work.
 */

import { contrast as ratio, hexToOklch, oklchToHex } from "@gryt/theme";
import { contrastChecks } from "./contrast";
import type { Appearance, HueSet, RadiusKey, ThemeDraft } from "./draft";
import { cloneDraft, themeStyle } from "./draft";

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

const RADIUS_FAMILIES: Array<Record<RadiusKey, number>> = [
  { sm: 8, md: 12, lg: 20, xl: 28, full: 999 },
  { sm: 6, md: 8, lg: 14, xl: 18, full: 999 },
  { sm: 4, md: 6, lg: 10, xl: 14, full: 8 },
  { sm: 2, md: 4, lg: 6, xl: 8, full: 4 },
  { sm: 10, md: 16, lg: 24, xl: 32, full: 999 }
];

export function generateDraft(): ThemeDraft {
  const hue = rand(0, 360);
  // How far the greys lean into the accent's hue. At 0.4 they read as grey
  // with a cast; at 2 the whole page is obviously tinted, which is what makes
  // a warm theme feel warm rather than "grey with an orange button".
  const tint = pick([0.4, 0.8, 1.4, 2.2]);
  // Far enough round the wheel to read as a second colour rather than a shade
  // of the first, and either side so it is not always the same direction.
  const secondaryHue = hue + pick([-1, 1]) * rand(110, 200);

  const grey = (l: number, chroma: number, h = hue) =>
    oklchToHex({ l, c: chroma * tint, h });

  const bgL = rand(0.15, 0.21);
  const dark = {
    bg: grey(bgL, 0.011),
    surface: grey(bgL + 0.045, 0.014),
    surfaceRaised: grey(bgL + 0.062, 0.016),
    surfaceHover: grey(bgL + 0.125, 0.022),
    border: grey(bgL + 0.125, 0.024),
    muted: grey(rand(0.62, 0.665), 0.008),
    text: grey(rand(0.9, 0.925), 0.008)
  };

  // Light is not the dark set inverted. The page is the grey one and the
  // surface above it is white, which is the arrangement the library's light
  // ramp is built around.
  const lightBgL = rand(0.95, 0.968);
  const light = {
    bg: grey(lightBgL, 0.006),
    surface: grey(rand(0.995, 1), 0.001),
    surfaceRaised: grey(lightBgL + 0.016, 0.004),
    surfaceHover: grey(lightBgL - 0.035, 0.01),
    border: grey(rand(0.878, 0.9), 0.014),
    muted: grey(rand(0.46, 0.5), 0.014),
    text: grey(rand(0.23, 0.27), 0.014)
  };

  const accent = oklchToHex({ l: rand(0.67, 0.74), c: rand(0.13, 0.17), h: hue });
  const secondary = oklchToHex({
    l: rand(0.79, 0.85),
    c: rand(0.09, 0.13),
    h: secondaryHue
  });
  const danger = oklchToHex({ l: rand(0.67, 0.72), c: rand(0.15, 0.19), h: rand(18, 30) });

  const hueSet = {
    accent,
    accentLight: lighten(accent, 0.085),
    secondary,
    secondaryLight: lighten(secondary, 0.07),
    success: oklchToHex({ l: rand(0.8, 0.85), c: rand(0.15, 0.19), h: rand(140, 156) }),
    danger,
    dangerLight: lighten(danger, 0.08),
    warning: oklchToHex({ l: rand(0.82, 0.86), c: rand(0.14, 0.17), h: rand(72, 90) }),
    onAccent: "",
    onSecondary: "",
    onDanger: ""
  };

  hueSet.onAccent = readableOn(accent);
  hueSet.onSecondary = readableOn(secondary);
  hueSet.onDanger = readableOn(danger);

  return {
    hue: hueSet,
    // Generated themes keep one hue set. Splitting light off is a decision
    // somebody makes about their own palette, not something to roll for them.
    lightHue: null,
    dark,
    light,
    radius: { ...pick(RADIUS_FAMILIES) }
  };
}

/** Same hue and chroma, further up the lightness ramp. */
function lighten(hex: string, by: number): string {
  const { l, c, h } = hexToOklch(hex);
  return oklchToHex({ l: Math.min(0.97, l + by), c: c * 0.85, h });
}

/**
 * A label colour for a filled control.
 *
 * Ink or paper, whichever reads better on the fill, tinted toward the fill's
 * own hue so it looks chosen rather than dropped in — black-or-white passes the
 * same checks and looks like a placeholder.
 *
 * Then pushed until it clears 7:1 rather than the 4.5 the checks require. The
 * label on a filled button is the one piece of text in an app that always sits
 * on a saturated colour, it is usually a verb somebody is about to press, and
 * the whole cost of AAA here is a shade of a colour that was already nearly
 * black. Where the fill cannot carry 7 with any label at all — a mid-lightness
 * blue tops out around 6 — this returns the best there is and the report says
 * what it came to.
 */
export function readableOn(fill: string): string {
  const { c, h } = hexToOklch(fill);
  const ink = oklchToHex({ l: 0.17, c: Math.min(0.05, c * 0.3), h });
  const paper = oklchToHex({ l: 0.97, c: Math.min(0.03, c * 0.2), h });
  const better = ratio(ink, fill) >= ratio(paper, fill) ? ink : paper;
  return ensureContrast(better, fill, 7);
}

/** The three label colours, recomputed from the fills they sit on. */
export function withAutoLabels(hues: HueSet): HueSet {
  return {
    ...hues,
    onAccent: readableOn(hues.accent),
    onSecondary: readableOn(hues.secondary),
    onDanger: readableOn(hues.danger)
  };
}

/** Whether a hue set already carries the labels the auto pick would give it. */
export function labelsAreAuto(hues: HueSet): boolean {
  const auto = withAutoLabels(hues);
  return (
    auto.onAccent === hues.onAccent &&
    auto.onSecondary === hues.onSecondary &&
    auto.onDanger === hues.onDanger
  );
}

/**
 * Push a colour away from its background until it carries text.
 *
 * Lightness only. Moving the hue would change which colour it is, and moving
 * chroma barely moves contrast at all — lightness is the axis that decides
 * whether something is readable.
 */
export function ensureContrast(
  foreground: string,
  background: string,
  min: number
): string {
  if (ratio(foreground, background) >= min) return foreground;

  const { l, c, h } = hexToOklch(foreground);
  const direction = l >= hexToOklch(background).l ? 1 : -1;

  let next = l;
  for (let step = 0; step < 120; step++) {
    next = Math.min(1, Math.max(0, next + direction * 0.008));
    const candidate = oklchToHex({ l: next, c, h });
    if (ratio(candidate, background) >= min) return candidate;
    if (next === 0 || next === 1) break;
  }
  // Ran out of ramp: black or white is the best this hue can do.
  return direction === 1 ? "#ffffff" : "#000000";
}

/**
 * Fix what the contrast report is complaining about, without redesigning the
 * theme.
 *
 * Only the colours whose job is to be read get moved — text, muted text, and
 * the labels on filled controls. The anchors somebody actually chose, the
 * background and the accent, are left exactly where they are: a repair that
 * changed the accent would be answering a question nobody asked.
 */
export function repairDraft(draft: ThemeDraft): ThemeDraft {
  const next = cloneDraft(draft);

  for (const appearance of ["dark", "light"] as const) {
    next[appearance].text = ensureContrast(
      next[appearance].text,
      next[appearance].bg,
      7
    );
    next[appearance].text = ensureContrast(
      next[appearance].text,
      next[appearance].surface,
      7
    );
    next[appearance].muted = ensureContrast(
      next[appearance].muted,
      next[appearance].bg,
      4.5
    );
    next[appearance].muted = ensureContrast(
      next[appearance].muted,
      next[appearance].surface,
      4.5
    );
  }

  for (const hues of [next.hue, next.lightHue]) {
    if (hues === null) continue;
    for (const [on, family] of [
      ["onAccent", "accent"],
      ["onSecondary", "secondary"],
      ["onDanger", "danger"]
    ] as const) {
      const fill = hues[family];
      // 7 rather than 4.5, to match what the automatic pick aims for. A repair
      // that left the label at "just about legible" would have to be run again
      // the moment somebody turned the automatic pick on.
      if (ratio(hues[on], fill) < 7) hues[on] = readableOn(fill);
    }
  }

  return next;
}

/** Whether a repair would change anything, so the button can say so. */
export function needsRepair(draft: ThemeDraft): boolean {
  return (["dark", "light"] as const).some((appearance: Appearance) =>
    contrastChecks(draft, themeStyle(draft, appearance), appearance).some(
      (item) => !item.advisory && item.level === "fail"
    )
  );
}
