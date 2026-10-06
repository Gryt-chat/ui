/* The marks a scatter pattern strews, kept free of the DOM so the phone builds the
   same ones (GRYT-1630). An image emoji needs a fetch, so it stays with the web card. */

import { avatarSeed, decodeWorn, owlAvatarSvg, wornToOptions } from "@gryt/owl";

import type { PatternMark } from "./patternSvg";

export { GRYT_MARK } from "./grytMark";

/** The emoji a card with the emoji pattern and no pick of its own strews. */
export const DEFAULT_EMOJI = "unicode:✨";

const CIRCLE = "<circle cx='512' cy='512' r='512'/>";

/** The member's own owl head, cut to a circle like the Gryt mark. */
export function owlMark(nickname: string, worn?: string | null): PatternMark | null {
  const seed = avatarSeed(nickname);
  if (!seed) return null;
  const look = decodeWorn(worn);
  const svg = owlAvatarSvg(seed, { ...(look ? wornToOptions(look) : {}), background: false });
  const body = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { viewBox: "0 0 1024 1024", body, clip: CIRCLE, mono: false };
}

const xml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");

export function unicodeEmojiMark(emoji: string): PatternMark {
  return {
    viewBox: "0 0 100 100",
    body: `<text x='50' y='78' text-anchor='middle' font-size='78' font-family='Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif'>${xml(emoji)}</text>`,
    mono: false,
    tint: false,
  };
}
