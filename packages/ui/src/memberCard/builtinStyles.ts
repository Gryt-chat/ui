/**
 * Ready-made card styles, by id. Adding one is a new entry here; the settings page
 * lists them in this order, and the swatch is drawn from the style itself.
 */

import { type CardStyle, DEFAULT_CARD_STYLE, PATTERN_FADES, TUNING } from "./cardStyle";
import { CARD_PATTERNS } from "./patterns";

export interface BuiltinCardStyle {
  id: string;
  name: string;
  style: CardStyle;
}

const s = (over: Partial<CardStyle>): CardStyle => ({ ...DEFAULT_CARD_STYLE, ...over });

export const BUILTIN_CARD_STYLES: readonly BuiltinCardStyle[] = [
  { id: "owl", name: "Owl", style: s({}) },
  {
    id: "harbour",
    name: "Harbour",
    style: s({ fill: "gradient", c1: "#1d4e89", c2: "#3fb6a8", angle: 135, pattern: "contours" }),
  },
  {
    id: "signal",
    name: "Signal",
    style: s({ fill: "solid", c1: "#ffd400", c2: "#ffd400", pattern: "dots", cover: "card" }),
  },
  {
    id: "night-shift",
    name: "Night shift",
    style: s({ fill: "gradient", c1: "#0b0b12", c2: "#5b2a86", angle: 160, pattern: "weave", fade: "banner" }),
  },
  {
    id: "ember",
    name: "Ember",
    style: s({ fill: "gradient", c1: "#ff7a1a", c2: "#7a1020", angle: 120, pattern: "gradient" }),
  },
];

/** The swatch beside a style's name: its own colours, or the app accent for the owl. */
export function styleSwatch(style: CardStyle): string {
  if (style.fill === "solid" && style.c1) return style.c1;
  if (style.fill === "gradient" && style.c1 && style.c2) return `linear-gradient(${style.angle}deg,${style.c1},${style.c2})`;
  return "var(--gryt-accent)";
}

/** A colour from a hue, saturation and lightness, as #rrggbb. */
function hsl(h: number, sat: number, light: number): string {
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const RANDOM_PATTERNS = CARD_PATTERNS.filter((p) => p.kind !== "none").map((p) => p.id);

/** Icons the `icon` pattern can land on; all are in Phosphor. */
const RANDOM_ICONS = ["star", "heart", "moon", "lightning", "leaf", "fire", "music-note", "game-controller", "paw-print", "planet", "skull", "ghost", "flower", "crown", "sparkle"];

/** A card style for the Surprise me button: every field is rolled. Colours stay in a range that reads well. */
export function randomCardStyle(random: () => number = Math.random): CardStyle {
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(random() * list.length)];
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const hue = Math.floor(random() * 360);
  const fill = pick(["owl", "solid", "solid", "gradient", "gradient", "gradient"] as const);
  // The owl's own colour with no pattern is the default card, which is no surprise.
  const pattern = fill === "owl" || random() < 0.85 ? pick(RANDOM_PATTERNS) : "none";
  const style: CardStyle = {
    ...DEFAULT_CARD_STYLE,
    fill,
    angle: fill === "gradient" ? Math.floor(random() * 360) : DEFAULT_CARD_STYLE.angle,
    pattern,
    colours: random() < 0.7 ? "card" : "banner",
    cover: random() < 0.5 ? "card" : "banner",
    fade: random() < 0.5 ? "banner" : "bottom",
    pScale: int(70, 200),
    pRotate: pick([0, 0, 15, 30, 45, 90, int(TUNING.pRotate.min, TUNING.pRotate.max)]),
    pFade: random() < 0.5 ? "none" : pick(PATTERN_FADES),
    pSeed: int(TUNING.pSeed.min, TUNING.pSeed.max),
  };
  if (fill !== "owl") style.c1 = hsl(hue, 0.55 + random() * 0.35, 0.35 + random() * 0.3);
  if (fill === "gradient") style.c2 = hsl((hue + 30 + random() * 120) % 360, 0.5 + random() * 0.4, 0.25 + random() * 0.35);
  if (random() < 0.4) style.pOpacity = int(8, TUNING.pOpacity.max);
  if (random() < 0.25) style.pInk = hsl(Math.floor(random() * 360), 0.5 + random() * 0.4, 0.4 + random() * 0.4);
  if (pattern === "icon") style.pIcon = pick(RANDOM_ICONS);
  if (random() < 0.3) style.pStroke = pick([60, 150, 200, 250]);
  if (random() < 0.3) style.edge = pick([0, 2, 3, 4]);
  if (random() < 0.3) style.pLayer = "front";
  return style;
}
