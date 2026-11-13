import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface MessageBubbleProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** `user` is your own message, in the accent; `assistant` is anyone else's. */
  from?: "user" | "assistant" | "system";
  /** Floats over the bubble's top edge, the way the client's hover bar does. */
  toolbar?: ReactNode;
}

/** One message as the client's bubbles look draws it. */
export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble(
  { children, className, from = "assistant", toolbar, ...props },
  ref
) {
  return (
    <div ref={ref} className={cn("gryt-message-bubble", className)} data-from={from} {...props}>
      {toolbar && <div className="gryt-message-bubble-toolbar">{toolbar}</div>}
      {children}
    </div>
  );
});
