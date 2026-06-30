import Avatar from "@mui/material/Avatar";
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
        "gryt-conversation-item",
        active
          ? "bg-gryt-accent text-[#141126]"
          : "text-gryt-text hover:bg-white/5",
        className
      )}
      {...props}
    >
      {avatar ?? (
        <Avatar
          className={cn(
            "h-9 w-9 text-sm",
            active
              ? "bg-[#141126] text-gryt-accent"
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
              active ? "text-[#302a63]" : "text-gryt-muted"
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
});
