/* Facts about the OG images that both the generator and the prerenderer need.
 *
 * Kept apart from generate-og.ts because that file runs on import — importing
 * it just to read a filename would regenerate all 30 images as a side effect.
 */

import type { OgPage } from "./og-pages";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Canvas padding, and the width a line has to live within. */
export const OG_PAD = 64;
export const OG_CONTENT = OG_WIDTH - OG_PAD * 2;

/** JetBrains Mono is monospaced at a 0.6em advance; 0.615 leaves a hair of slack. */
const MONO_ADVANCE = 0.615;

/**
 * 52px is the size the approved comp used. Every line that fits gets exactly
 * that, so pages stay typographically identical; only long names step down.
 * `import { ConversationItem } from "@gryt/ui"` is 43 characters and would run
 * past the canvas edge at 52.
 */
export const HERO_MAX = 52;
export const HERO_MIN = 30;

/** Largest size at which the hero line still clears the content width. */
export function heroFontSize(line: string): number {
  const fitted = Math.floor(OG_CONTENT / (line.length * MONO_ADVANCE));
  return Math.max(HERO_MIN, Math.min(HERO_MAX, fitted));
}

/** The hero as one string, for width measurement. */
export function heroLine(page: OgPage): string {
  return page.hero.map((token) => token.text).join("");
}

/** Where a route's image lands inside public/og. */
export function fileNameFor(route: string): string {
  return (route === "" ? "index" : route.replace(/\//g, "-")) + ".png";
}
