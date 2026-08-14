import { Avatar } from "../Avatar/Avatar";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export interface ConversationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  subtitle?: string;
  active?: boolean;
  avatar?: ReactNode;
}

export const ConversationItem = forwardRef<
  HTMLButtonElement,
  ConversationItemProps
>(function ConversationItem(
  { active = false, avatar, className, subtitle, title, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "gryt-conversation-item enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? "bg-gryt-accent text-gryt-on-accent"
          : "text-gryt-text hover:bg-white/5",
        className
      )}
      {...props}
    >
      {avatar ?? (
        <Avatar
          size="small"
          className={cn(
            active
              // Step 9 by number rather than by its flat name: this is the
              // filled-button pair inverted — the accent as ink on the ink
              // colour it normally carries — and naming the step says so.
              ? "bg-gryt-on-accent text-gryt-accent-9 ring-transparent"
              : "bg-gryt-surface-raised text-gryt-text"
          )}
        >
          {title.slice(0, 1).toUpperCase()}
        </Avatar>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        {subtitle ? (
          <span
            className={cn(
              "block truncate text-xs",
              active ? "text-gryt-on-accent/85" : "text-gryt-muted"
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
});
