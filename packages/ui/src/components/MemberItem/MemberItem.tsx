"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { cn } from "../utils/cn";

/** How the row draws the person's card behind it: banner picture, card colour, card over a cover, or banner pattern. */
export type MemberItemCardKind = "img" | "fc" | "fc-cover" | "banner";

export interface MemberItemProps extends HTMLAttributes<HTMLDivElement> {
  name: ReactNode;
  avatar: ReactNode;
  /** The role's colour, already readable on the rail. */
  nameColor?: string;
  /** Offline: avatar and name drawn back. */
  offline?: boolean;
  /** Beside the name, e.g. a bot tag. */
  tags?: ReactNode;
  /** A line under the name, like "In Voice". */
  status?: ReactNode;
  statusColor?: string;
  /** What they say they're doing, one clipped line. */
  activity?: string;
  activityIcon?: ReactNode;
  /** After the row, usually an unread count. */
  trailing?: ReactNode;
  /** Just the face, for the slim strip. */
  compact?: boolean;
  clickable?: boolean;
  /** Their card is open; draws the row as hovered. */
  open?: boolean;
  /** The person's card behind the row on hover, from `cardVars`. */
  card?: { kind: MemberItemCardKind; style: CSSProperties };
}

/** One person in the member list, as the client draws it. */
export const MemberItem = forwardRef<HTMLDivElement, MemberItemProps>(function MemberItem(
  {
    name,
    avatar,
    nameColor,
    offline = false,
    tags,
    status,
    statusColor,
    activity,
    activityIcon,
    trailing,
    compact = false,
    clickable = true,
    open = false,
    card,
    className,
    style,
    ...props
  },
  ref
) {
  const face = <span className="inline-flex shrink-0" style={{ opacity: offline ? 0.4 : 1 }}>{avatar}</span>;
  if (compact) {
    return (
      <div
        ref={ref}
        className={cn(clickable && "gryt-member-item-clickable", "rounded-full", className)}
        aria-label={typeof name === "string" ? name : undefined}
        data-card-open={open || undefined}
        style={style}
        {...props}
      >
        <div className="flex w-full items-center justify-center">{face}</div>
        {trailing}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("gryt-member-item", clickable && "gryt-member-item-clickable", card && "gryt-member-item-card", className)}
      data-card-open={open || undefined}
      data-row-card={card?.kind}
      style={{ ...card?.style, ...style }}
      {...props}
    >
      <div className="flex w-full items-center gap-2">
        {face}
        <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: "1px" }}>
          <div className="flex items-center gap-1">
            <span className="gryt-member-item-text truncate text-sm" style={{ color: nameColor, opacity: offline ? 0.7 : 1 }}>
              {name}
            </span>
            {tags}
          </div>
          {status && (
            <span className="gryt-member-item-text text-xs" style={{ color: statusColor, lineHeight: 1.2 }}>
              {status}
            </span>
          )}
          {activity && (
            <span
              className="gryt-member-item-text flex min-w-0 items-center gap-1 text-xs"
              style={{ color: "var(--gryt-neutral-11)", lineHeight: 1.2 }}
              title={activity}
            >
              {activityIcon}
              <span className="truncate">{activity}</span>
            </span>
          )}
        </div>
      </div>
      {trailing}
    </div>
  );
});
