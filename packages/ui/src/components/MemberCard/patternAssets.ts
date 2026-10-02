import { avatarSeed, decodeWorn, owlAvatarSvg, wornToOptions } from "@gryt/owl";
import { useEffect, useMemo, useState } from "react";

import type { CardStyle } from "../../memberCard/cardStyle";
import type { EmojiPickerGroup, EmojiPickerItem } from "../EmojiPicker/EmojiPicker";
import { cardIcons } from "./cardIconSource";
import { GRYT_MARK } from "../../memberCard/grytMark";
import { cardPattern } from "../../memberCard/patterns";
import type { Tile } from "../../memberCard/patterns/tileTypes";
import type { PatternMark } from "../../memberCard/patternSvg";

/** The icon a card with the icon pattern and no pick of its own strews. */
export const DEFAULT_ICON = "star";
export const DEFAULT_EMOJI = "unicode:✨";
const EMPTY_EMOJI_GROUPS: readonly EmojiPickerGroup[] = [];

let tiles: Promise<Map<string, Tile>> | null = null;

/** All the tile paths, in one chunk that only loads once somebody's card needs it. */
function loadTiles(): Promise<Map<string, Tile>> {
  tiles ??= import("../../memberCard/patterns/tiles.generated").then((m) => new Map(m.TILES.map((t) => [t.id, t])));
  return tiles;
}

const CIRCLE = "<circle cx='512' cy='512' r='512'/>";

/** The member's own owl head, cut to a circle like the Gryt mark. */
function owlMark(nickname: string, worn?: string | null): PatternMark | null {
  const seed = avatarSeed(nickname);
  if (!seed) return null;
  const look = decodeWorn(worn);
  const svg = owlAvatarSvg(seed, { ...(look ? wornToOptions(look) : {}), background: false });
  const body = svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { viewBox: "0 0 1024 1024", body, clip: CIRCLE, mono: false };
}

const xml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");

function unicodeEmojiMark(emoji: string): PatternMark {
  return {
    viewBox: "0 0 100 100",
    body: `<text x='50' y='78' text-anchor='middle' font-size='78' font-family='Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif'>${xml(emoji)}</text>`,
    mono: false,
    tint: false,
  };
}

function pickedEmoji(id: string, groups: readonly EmojiPickerGroup[]): EmojiPickerItem | null {
  if (id.startsWith("unicode:")) return { id, name: id.slice(8), emoji: id.slice(8) };
  return groups.flatMap((group) => group.items).find((item) => item.id === id) ?? null;
}

async function imageEmojiMark(url: string): Promise<PatternMark | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) return null;
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return {
    viewBox: "0 0 100 100",
    body: `<image href='${xml(data)}' width='100' height='100' preserveAspectRatio='xMidYMid meet'/>`,
    mono: false,
    tint: false,
  };
}

export interface PatternAssets {
  tile?: Tile;
  mark?: PatternMark;
}

/** Whatever this card's pattern draws with, loaded on demand. Empty until it arrives. */
export function usePatternAssets(
  style: CardStyle,
  owl: { nickname: string; worn?: string | null },
  emojiGroups: readonly EmojiPickerGroup[] = EMPTY_EMOJI_GROUPS,
): PatternAssets {
  const pattern = cardPattern(style.pattern);
  const [assets, setAssets] = useState<PatternAssets>({});
  const icon = style.pIcon ?? DEFAULT_ICON;
  const emojiId = style.pEmoji ?? DEFAULT_EMOJI;
  const emoji = useMemo(() => pickedEmoji(emojiId, emojiGroups), [emojiGroups, emojiId]);
  const emojiText = emoji?.emoji;
  const emojiUrl = emoji?.imageUrl;

  useEffect(() => {
    let live = true;
    const set = (next: PatternAssets) => live && setAssets(next);
    if (pattern.kind === "tile") void loadTiles().then((all) => set({ tile: all.get(pattern.id) }));
    else if (pattern.id === "gryt-faces") set({ mark: { ...GRYT_MARK, mono: false } });
    else if (pattern.id === "my-owl") set({ mark: owlMark(owl.nickname, owl.worn) ?? undefined });
    else if (pattern.id === "icon") {
      void (cardIcons() ?? Promise.reject(new Error("no icon loader")))
        .then((m) => m.loadIconMark(icon).then((mark) => mark ?? m.loadIconMark(DEFAULT_ICON)))
        .then((mark) => set({ mark: mark ?? undefined }));
    } else if (pattern.id === "emoji" && emojiText) {
      set({ mark: unicodeEmojiMark(emojiText) });
    } else if (pattern.id === "emoji" && emojiUrl) {
      void imageEmojiMark(emojiUrl)
        .then((mark) => set({ mark: mark ?? undefined }))
        .catch(() => set({}));
    } else set({});
    return () => {
      live = false;
    };
  }, [pattern.id, pattern.kind, icon, emojiText, emojiUrl, owl.nickname, owl.worn]);

  return assets;
}
