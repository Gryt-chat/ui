import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface MessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  from?: "user" | "assistant" | "system";
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  function MessageBubble(
    { children, className, from = "assistant", ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "gryt-message-bubble",
          from === "user" && "ml-auto bg-gryt-accent text-[#141126]",
          from === "assistant" &&
            "mr-auto border border-gryt-border bg-gryt-surface text-gryt-text",
          from === "system" &&
            "mx-auto border border-dashed border-gryt-border bg-transparent text-gryt-muted",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
