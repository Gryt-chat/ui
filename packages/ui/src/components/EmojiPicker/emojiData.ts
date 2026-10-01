import { gemoji } from "gemoji";

import type { EmojiPickerGroup } from "./EmojiPicker";

const CATEGORY_ICONS: Record<string, string> = {
  "Smileys & Emotion": "😀",
  "People & Body": "👋",
  "Animals & Nature": "🐾",
  "Food & Drink": "🍕",
  "Travel & Places": "✈️",
  Activities: "⚽",
  Objects: "💡",
  Symbols: "💜",
  Flags: "🏁"
};

let groups: EmojiPickerGroup[] | null = null;

/** The standard Unicode emoji catalog, grouped for EmojiPicker and built once on demand. */
export function standardEmojiGroups(): EmojiPickerGroup[] {
  if (groups) return groups;
  const byCategory = new Map<string, EmojiPickerGroup>();
  const seen = new Set<string>();

  for (const entry of gemoji) {
    if (seen.has(entry.emoji)) continue;
    seen.add(entry.emoji);
    let group = byCategory.get(entry.category);
    if (!group) {
      group = {
        id: entry.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: entry.category,
        icon: CATEGORY_ICONS[entry.category] ?? "•",
        items: []
      };
      byCategory.set(entry.category, group);
    }
    group.items.push({
      id: `unicode:${entry.emoji}`,
      name: entry.names[0] ?? entry.description,
      emoji: entry.emoji,
      keywords: [...entry.names.slice(1), ...entry.tags, entry.description]
    });
  }

  groups = Array.from(byCategory.values());
  return groups;
}
