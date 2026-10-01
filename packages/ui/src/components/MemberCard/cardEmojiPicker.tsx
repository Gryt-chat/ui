"use client";

import { useMemo } from "react";

import { EmojiPicker } from "../EmojiPicker/EmojiPicker";
import type { EmojiPickerGroup, EmojiPickerItem } from "../EmojiPicker/EmojiPicker";
import { standardEmojiGroups } from "../EmojiPicker/emojiData";

/** Current-server emoji stay first; Unicode follows as the shared fallback. */
export default function CardEmojiPicker({
  customGroups,
  value,
  onPick,
}: {
  customGroups: readonly EmojiPickerGroup[];
  value?: string;
  onPick: (item: EmojiPickerItem) => void;
}) {
  const groups = useMemo(
    () => [...customGroups, ...standardEmojiGroups()],
    [customGroups],
  );
  return (
    <EmojiPicker
      groups={groups}
      selectedId={value}
      onSelect={onPick}
      className="h-[min(22rem,calc(100dvh-6rem))] border-0"
    />
  );
}
