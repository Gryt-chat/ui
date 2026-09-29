/**
 * Where icon patterns get their icons. Every Phosphor icon is its own chunk, and only the
 * app knows how to split its bundle, so the app hands the card a loader.
 */

import type { PatternMark } from "../../memberCard/patternSvg";

export interface CardIconModule {
  ICON_NAMES: readonly string[];
  loadIconMark(name: string): Promise<PatternMark | null>;
}

let loader: (() => Promise<CardIconModule>) | null = null;
let loaded: Promise<CardIconModule> | null = null;

/** Called once by the app, usually as `setCardIconLoader(() => import("./phosphorIcons"))`. */
export function setCardIconLoader(load: () => Promise<CardIconModule>): void {
  loader = load;
  loaded = null;
}

/** Null until the app has set a loader; the icon pattern then draws the default mark. */
export function cardIcons(): Promise<CardIconModule> | null {
  if (!loader) return null;
  loaded ??= loader();
  return loaded;
}
