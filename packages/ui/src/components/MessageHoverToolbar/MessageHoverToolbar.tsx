"use client";

import type { CSSProperties, MouseEvent } from "react";

import { PiArrowBendUpLeftBold, PiChatCircleBold, PiDotsThreeBold, PiSmileyWinkBold } from "../../icons/icons";
import { EmojiText } from "../EmojiText/EmojiText";
import { Tooltip } from "../Tooltip/Tooltip";

/* Sized to the GRYT-1722 drafts: 36px buttons, 21px emoji, 20px icons. */
const BAR_BUTTON: CSSProperties = {
  width: 36,
  height: 36,
  padding: 0,
  border: "none",
  borderRadius: 8,
  background: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--gryt-neutral-11)",
  transition: "background 0.15s",
};
const hoverOn = (e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "var(--gryt-neutral-5)"; };
const hoverOff = (e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "none"; };

export const MessageHoverToolbar = ({
  onReply,
  onThread,
  threadLabel,
  onMore,
  quickReactions,
  onQuickReaction,
  onOpenEmojiPicker,
  customEmojis,
}: {
  onReply?: () => void;
  /** Starts this message's thread, or opens it if it has one. Absent where there can't be one. */
  onThread?: () => void;
  threadLabel?: string;
  /** Opens the message's own menu at the button, where thread, pin, edit and delete live. */
  onMore?: (anchor: HTMLElement) => void;
  /**
   * The reactions this person uses most, already ordered and padded. Empty when
   * they may not react here, which is why this takes a list not a permission.
   */
  quickReactions?: string[];
  onQuickReaction?: (src: string) => void;
  /** Open the full picker. Passed only when this person may react. */
  onOpenEmojiPicker?: () => void;
  /** The server's own emoji, for quick reactions that are custom ones. */
  customEmojis?: ReadonlyMap<string, string>;
}) => {
  const showQuick = !!onQuickReaction && !!quickReactions && quickReactions.length > 0;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        background: "var(--gryt-neutral-3)",
        border: "1px solid var(--gryt-neutral-6)",
        borderRadius: 12,
        padding: "3px 5px",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
        pointerEvents: "auto",
        /* Chrome, not content: the bar sits earlier in the DOM than the text
           it floats over, so a drag copied it too. */
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Reactions first, then reply and the menu, like Teams. Thread, pin, edit
          and delete moved into that menu, which is also the right-click menu (GRYT-1722). */}
      {showQuick && quickReactions.map((src) => (
        <Tooltip key={src} title={<>React with <EmojiText text={src} disableTooltip customEmojis={customEmojis} /></>}>
          <button
            onClick={() => onQuickReaction(src)}
            aria-label={`React with ${src}`}
            style={{ ...BAR_BUTTON, fontSize: 21, lineHeight: 1 }}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <EmojiText text={src} emojiSize={22} disableTooltip customEmojis={customEmojis} />
          </button>
        </Tooltip>
      ))}
      {onOpenEmojiPicker && (
        <Tooltip title="Add reaction">
          <button
            onClick={onOpenEmojiPicker}
            aria-label="React with another emoji"
            style={BAR_BUTTON}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <PiSmileyWinkBold size={20} />
          </button>
        </Tooltip>
      )}
      {(showQuick || onOpenEmojiPicker) && (onReply || onMore) && (
        <span
          aria-hidden="true"
          style={{ width: 1, height: 22, margin: "0 4px", background: "var(--gryt-neutral-6)" }}
        />
      )}
      {onReply && (
        <Tooltip title="Reply">
          <button
            onClick={onReply}
            aria-label="Reply"
            style={BAR_BUTTON}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <PiArrowBendUpLeftBold size={20} />
          </button>
        </Tooltip>
      )}
      {onThread && (
        <Tooltip title={threadLabel}>
          <button
            onClick={onThread}
            aria-label={threadLabel}
            style={BAR_BUTTON}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <PiChatCircleBold size={20} />
          </button>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip title="More">
          <button
            onClick={(e) => onMore(e.currentTarget)}
            aria-label="More"
            style={BAR_BUTTON}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <PiDotsThreeBold size={20} />
          </button>
        </Tooltip>
      )}
    </div>
  );
};
