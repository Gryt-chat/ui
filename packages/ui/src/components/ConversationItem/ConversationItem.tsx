"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { PiPushPinFill } from "../../icons/icons";
import { Avatar } from "../Avatar/Avatar";
import { Badge } from "../Badge/Badge";
import { PresenceDot, type PresenceStatus } from "../PresenceDot/PresenceDot";
import { cn } from "../utils/cn";

export interface ConversationItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  title: ReactNode;
  /** The last message, or what the conversation is when there's none yet. */
  subtitle?: ReactNode;
  active?: boolean;
  avatar?: ReactNode;
  /** Beside the title on the right, usually when the last message came. */
  meta?: ReactNode;
  /** Beside the title, e.g. the server's name when two rows share a name. */
  note?: ReactNode;
  unread?: number;
  pinned?: boolean;
  /** Drawn back. Still opens and reads normally. */
  hidden?: boolean;
  /** The other person's presence, on the avatar. Undefined draws nothing. */
  presence?: PresenceStatus;
}

/** One conversation in a list, as the client's direct messages draw it. */
export const ConversationItem = forwardRef<HTMLButtonElement, ConversationItemProps>(function ConversationItem(
  { active = false, avatar, className, subtitle, title, meta, note, unread = 0, pinned = false, hidden = false, presence, style, ...props },
  ref
) {
  const unselectedMuted = unread > 0 ? "var(--gryt-neutral-11)" : "var(--gryt-neutral-10)";
  const muted = active ? "color-mix(in oklch, var(--color-gryt-on-accent) 70%, transparent)" : unselectedMuted;
  const face = avatar ?? (
    <Avatar size="medium" fallback={typeof title === "string" ? title.slice(0, 1).toUpperCase() : undefined} />
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center rounded-(--gryt-radius-lg) text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
        "enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        active ? "bg-gryt-accent text-gryt-on-accent" : "text-gryt-text hover:bg-gryt-neutral-3 active:bg-gryt-neutral-4",
        className
      )}
      style={{ gap: 12, padding: "10px 12px", border: 0, ...(hidden && !active ? { opacity: 0.55 } : {}), ...style }}
      {...props}
    >
      <span className="relative inline-flex shrink-0">
        {face}
        {presence && (
          <span
            className="absolute rounded-(--gryt-radius-full)"
            style={{ bottom: -1, right: -1, padding: 3, background: active ? "var(--gryt-accent)" : "var(--gryt-neutral-2)" }}
          >
            <PresenceDot status={presence} size={10} />
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col" style={{ gap: 2 }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          <span className="truncate" style={{ fontSize: 15, fontWeight: unread > 0 ? 700 : 500 }}>
            {title}
          </span>
          {note && (
            <span className="shrink-0 whitespace-nowrap" style={{ fontSize: 12, color: muted }}>
              · {note}
            </span>
          )}
          <span
            className="ml-auto flex shrink-0 items-center"
            style={{ gap: 4, fontSize: 12, color: muted, fontVariantNumeric: "tabular-nums" }}
          >
            {pinned && <PiPushPinFill size={12} aria-label="Pinned" />}
            {meta}
          </span>
        </span>
        <span className="flex items-center" style={{ gap: 8 }}>
          <span className="truncate" style={{ flex: 1, fontSize: 13, color: muted }}>
            {subtitle ?? " "}
          </span>
          {unread > 0 && <Badge badgeContent={unread} tone="unread" title={`${unread} unread`} className="shrink-0" />}
        </span>
      </span>
    </button>
  );
});
