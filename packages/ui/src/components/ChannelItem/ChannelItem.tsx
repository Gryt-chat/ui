"use client";

import type { ReactNode } from "react";
import { forwardRef } from "react";

import {
  PiChatsTeardropFill,
  PiChatTeardropTextFill,
  PiLockSimpleFill,
  PiRobotFill,
  PiSpeakerHighFill
} from "../../icons/icons";
import { Button, type ButtonProps } from "../Button/Button";
import { cn } from "../utils/cn";

export type ChannelKind = "text" | "voice" | "forum" | "automated";

/** The channel's icon. A lock replaces it rather than sitting beside it. */
export function ChannelGlyph({ kind, locked = false }: { kind: ChannelKind; locked?: boolean }) {
  if (locked) return <PiLockSimpleFill size={16} />;
  if (kind === "automated") return <PiRobotFill size={16} />;
  if (kind === "forum") return <PiChatsTeardropFill size={16} />;
  return kind === "voice" ? <PiSpeakerHighFill size={16} /> : <PiChatTeardropTextFill size={16} />;
}

export interface ChannelItemProps extends Omit<ButtonProps, "children" | "tone" | "size" | "name"> {
  name: ReactNode;
  kind: ChannelKind;
  /** The one you're reading: the accent pill. */
  selected?: boolean;
  /** Something waiting: the name goes bold and bright. */
  unread?: boolean;
  /** A voice channel you can't join: dimmed, with a lock. */
  locked?: boolean;
  /** The call you're in, tinted when not selected. */
  inCall?: boolean;
  /** Small icons after the name, like push-to-talk. */
  indicators?: ReactNode;
  /** At the right edge, usually the unread count. */
  trailing?: ReactNode;
}

/** One channel in the sidebar, as the client draws it. */
export const ChannelItem = forwardRef<HTMLButtonElement, ChannelItemProps>(function ChannelItem(
  { name, kind, selected = false, unread = false, locked = false, inCall = false, indicators, trailing, style, ...props },
  ref
) {
  const tinted = inCall && !selected;
  return (
    <Button
      ref={ref}
      size="small"
      tone={selected ? "primary" : "ghost"}
      data-gryt="channel-row"
      title={locked ? "You cannot join this voice channel." : undefined}
      style={{
        position: "relative",
        background: tinted ? "var(--gryt-accent-3)" : undefined,
        color: tinted ? "var(--gryt-accent-11)" : undefined,
        width: "100%",
        justifyContent: "start",
        overflow: "hidden",
        opacity: locked ? 0.55 : undefined,
        ...style
      }}
      {...props}
    >
      <div className="flex items-center" style={{ flexShrink: 0 }}>
        <ChannelGlyph kind={kind} locked={locked} />
      </div>
      <span
        className={cn("gryt-hide-in-icons truncate", unread && "font-semibold text-gryt-text")}
        style={{ flex: 1, minWidth: 0, textAlign: "left", display: "block" }}
      >
        {name}
      </span>
      {indicators && (
        <div className="gryt-hide-in-icons flex items-center gap-1" style={{ marginLeft: "auto", flexShrink: 0 }}>
          {indicators}
        </div>
      )}
      {trailing}
    </Button>
  );
});
