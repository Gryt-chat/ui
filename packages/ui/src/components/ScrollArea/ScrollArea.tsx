import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type ScrollAreaRootProps = ComponentPropsWithoutRef<
  typeof BaseScrollArea.Root
>;
export type ScrollAreaViewportProps = ComponentPropsWithoutRef<
  typeof BaseScrollArea.Viewport
>;
export type ScrollAreaScrollbarProps = ComponentPropsWithoutRef<
  typeof BaseScrollArea.Scrollbar
>;

const Root = forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  function ScrollAreaRoot({ className, ...props }, ref) {
    return (
      <BaseScrollArea.Root
        ref={ref}
        className={cn("gryt-scroll-area relative", className)}
        {...props}
      />
    );
  }
);

// overscroll-contain so a message list that hits its end does not hand the
// scroll to the page behind it.
const Viewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport({ className, ...props }, ref) {
    return (
      <BaseScrollArea.Viewport
        ref={ref}
        className={cn(
          "gryt-scroll-area-viewport h-full w-full overscroll-contain",
          "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gryt-accent-light",
          className
        )}
        {...props}
      />
    );
  }
);

const Scrollbar = forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  function ScrollAreaScrollbar({ className, orientation, ...props }, ref) {
    return (
      <BaseScrollArea.Scrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
          "gryt-scroll-area-scrollbar flex touch-none p-0.5 select-none",
          // Fades in on hover or while scrolling rather than sitting there
          // permanently — a chat sidebar is mostly not being scrolled.
          "opacity-0 transition-opacity duration-(--gryt-dur-fast)",
          "data-hovering:opacity-100 data-scrolling:opacity-100",
          "motion-reduce:transition-none",
          orientation === "horizontal" ? "h-2 flex-col" : "w-2",
          className
        )}
        {...props}
      >
        <BaseScrollArea.Thumb className="flex-1 rounded-(--gryt-radius-full) bg-gryt-border transition-colors hover:bg-gryt-muted motion-reduce:transition-none" />
      </BaseScrollArea.Scrollbar>
    );
  }
);

export const ScrollArea = {
  Root,
  Viewport,
  Scrollbar,
  Content: BaseScrollArea.Content,
  Corner: BaseScrollArea.Corner
};
