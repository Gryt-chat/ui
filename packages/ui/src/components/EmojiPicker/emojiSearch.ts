import type { EmojiPickerGroup, EmojiPickerItem } from "./EmojiPicker";

interface Match {
  item: EmojiPickerItem;
  tier: number;
}

function searchable(item: EmojiPickerItem): string[] {
  return [item.name, ...(item.keywords ?? [])].map((part) =>
    part.toLocaleLowerCase()
  );
}

/** Search favors exact starts, then word starts, then any matching name or keyword. */
export function filterEmojiItems(
  groups: EmojiPickerGroup[],
  query: string
): EmojiPickerItem[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  const seen = new Set<string>();
  const matches: Match[] = [];

  for (const group of groups) {
    for (const item of group.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      const values = searchable(item);
      const words = values.flatMap((value) => value.split(/[\s_-]+/));
      let tier = 3;
      if (values[0]?.startsWith(needle)) tier = 0;
      else if (words.some((word) => word.startsWith(needle))) tier = 1;
      else if (values.some((value) => value.includes(needle))) tier = 2;
      if (tier < 3) matches.push({ item, tier });
    }
  }

  return matches
    .sort((a, b) => a.tier - b.tier || a.item.name.localeCompare(b.item.name))
    .map(({ item }) => item);
}
