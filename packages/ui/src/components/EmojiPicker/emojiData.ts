import { AirplaneTilt, Flag, ForkKnife, HandWaving, Heart, type Icon, Lightbulb, PawPrint, Smiley, SoccerBall } from "@phosphor-icons/react";
import { createElement } from "react";
import { gemoji } from "gemoji";

import type { EmojiPickerGroup } from "./EmojiPicker";

/* Phosphor, bold, for the category rail (GRYT-1725). Emoji glyphs here read as clutter. */
const CATEGORY_ICONS: Record<string, Icon> = {
  "Smileys & Emotion": Smiley,
  "People & Body": HandWaving,
  "Animals & Nature": PawPrint,
  "Food & Drink": ForkKnife,
  "Travel & Places": AirplaneTilt,
  Activities: SoccerBall,
  Objects: Lightbulb,
  Symbols: Heart,
  Flags: Flag
};
const LABELS: Record<string, string> = { "Smileys & Emotion": "Smileys", "People & Body": "People" };

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
        label: LABELS[entry.category] ?? entry.category,
        icon: createElement(CATEGORY_ICONS[entry.category] ?? Smiley, { size: 20, weight: "bold" }),
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
