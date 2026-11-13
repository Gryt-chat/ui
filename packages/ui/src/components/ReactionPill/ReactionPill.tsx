"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { forwardRef } from "react";

import { EmojiText } from "../EmojiText/EmojiText";
import { Tooltip } from "../Tooltip/Tooltip";

export interface ReactionPillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** The reaction as stored: a Unicode emoji or a `:shortcode:`. */
  emoji: string;
  count: number;
  /** You're one of the people who reacted, so it's tinted. */
  mine?: boolean;
  /** Who reacted, shown under the emoji in the tooltip. */
  who?: ReactNode;
  /** Absent where you may not react: the count shows and nothing is pressable. */
  onToggle?: () => void;
  customEmojis?: ReadonlyMap<string, string>;
}

// Steps 3/4 fill and 7/8 or 5/6 edge, resting and hovered; accent for yours, neutral otherwise.
const fill = (mine: boolean, hover: boolean) => `var(--gryt-${mine ? "accent" : "neutral"}-${hover ? 4 : 3})`;
const edge = (mine: boolean, hover: boolean) => `var(--gryt-${mine ? "accent" : "neutral"}-${(mine ? 7 : 5) + (hover ? 1 : 0)})`;

/** One reaction under a message: the emoji and how many, with who in the tooltip. */
export const ReactionPill = forwardRef<HTMLButtonElement, ReactionPillProps>(function ReactionPill(
  { emoji, count, mine = false, who, onToggle, customEmojis, style, ...rest },
  ref
) {
  const paint = (e: MouseEvent<HTMLButtonElement>, hover: boolean) => {
    e.currentTarget.style.background = fill(mine, hover);
    e.currentTarget.style.borderColor = edge(mine, hover);
  };
  return (
    <Tooltip
      title={
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ lineHeight: 1 }}>
            <EmojiText text={emoji} emojiSize={22} disableTooltip customEmojis={customEmojis} />
          </div>
          {who && <div style={{ opacity: 0.9 }}>{who}</div>}
        </div>
      }
    >
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        aria-disabled={!onToggle || undefined}
        aria-pressed={onToggle ? mine : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "0 8px",
          minHeight: 28,
          fontSize: 14,
          lineHeight: 1,
          background: fill(mine, false),
          border: `1px solid ${edge(mine, false)}`,
          borderRadius: "var(--gryt-radius-md)",
          cursor: onToggle ? "pointer" : "default",
          transition: "background 0.15s, border-color 0.15s",
          whiteSpace: "nowrap",
          color: mine ? "var(--gryt-accent-11)" : "var(--gryt-neutral-12)",
          ...style,
        }}
        onMouseEnter={onToggle ? (e) => paint(e, true) : undefined}
        onMouseLeave={onToggle ? (e) => paint(e, false) : undefined}
        {...rest}
      >
        {/* Line height normal: at 1 the emoji's box put its ink 3px above the pill's middle. */}
        <span style={{ lineHeight: "normal" }}>
          <EmojiText text={emoji} emojiSize={18} disableTooltip customEmojis={customEmojis} />
        </span>
        <span style={{ fontWeight: 500, fontSize: 13 }}>{count}</span>
      </button>
    </Tooltip>
  );
});

/** The "+" after a message's reactions, which opens the picker. */
export const AddReactionButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function AddReactionButton({ style, ...rest }, ref) {
    const paint = (e: MouseEvent<HTMLButtonElement>, hover: boolean) => {
      e.currentTarget.style.background = hover ? "var(--gryt-neutral-4)" : "var(--gryt-neutral-3)";
      e.currentTarget.style.borderColor = hover ? "var(--gryt-neutral-6)" : "var(--gryt-neutral-5)";
    };
    return (
      <button
        ref={ref}
        type="button"
        title="Add reaction"
        aria-label="Add reaction"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          minHeight: 28,
          background: "var(--gryt-neutral-3)",
          border: "1px solid var(--gryt-neutral-5)",
          borderRadius: "var(--gryt-radius-md)",
          cursor: "pointer",
          transition: "background 0.15s, border-color 0.15s",
          color: "var(--gryt-neutral-10)",
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          ...style,
        }}
        onMouseEnter={(e) => paint(e, true)}
        onMouseLeave={(e) => paint(e, false)}
        {...rest}
      >
        +
      </button>
    );
  }
);
