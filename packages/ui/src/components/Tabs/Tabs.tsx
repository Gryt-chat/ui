import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export type TabsProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;
export type TabsListProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;
export type TabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
export type TabsPanelProps = ComponentPropsWithoutRef<typeof BaseTabs.Panel>;

/**
 * Orientation is Base UI's `orientation` prop on Root, and every part below
 * styles itself from the `data-orientation` it puts on the DOM rather than from
 * a prop of ours. That is why none of these take an orientation of their own:
 * setting it in two places is how a list ends up vertical and its indicator
 * still travelling sideways.
 *
 * Vertical is the same visual language turned ninety degrees — the accent pill
 * still slides between rows. It suits a rail of five or six destinations. Past
 * about a dozen the filled pill becomes a block of accent parked in the corner
 * of the screen, and a quieter marker is the better call; the docs sidebar is
 * that case and deliberately does not use this.
 */
const Root = forwardRef<HTMLDivElement, TabsProps>(function TabsRoot(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.Root
      ref={ref}
      className={cn(
        "gryt-tabs",
        // Vertical puts the rail and the panel side by side. min-w-0 on the
        // panel does the rest; without the flex here the panel lands under the
        // rail and the layout reads as a very tall accordion.
        "data-[orientation=vertical]:flex data-[orientation=vertical]:items-stretch",
        className
      )}
      {...props}
    />
  );
});

const List = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.List
      ref={ref}
      className={cn(
        "gryt-tabs-list relative inline-flex items-center gap-1 rounded-(--gryt-radius-full) bg-gryt-surface-raised p-1",
        // A rail, not a pill: rows are full width and the corner radius drops
        // to lg, because a 999px radius on a tall box bows its short edges.
        "data-[orientation=vertical]:flex data-[orientation=vertical]:shrink-0",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        "data-[orientation=vertical]:rounded-(--gryt-radius-lg)",
        className
      )}
      {...props}
    />
  );
});

const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.Tab
      ref={ref}
      className={cn(
        "gryt-tab inline-flex min-h-8 cursor-pointer items-center justify-center whitespace-nowrap",
        "rounded-(--gryt-radius-full) border-0 bg-transparent px-4 py-1.5",
        "text-sm font-medium text-gryt-muted select-none",
        // Scale as well as colour, matching Button exactly — 1.03 under the
        // cursor, 0.96 pressed, on the spring duration and curve. A tab that
        // only changed colour read as not being a button at all next to
        // anything that did move, and the owl designer's rail was reported as
        // "not using the Gryt UI tabs" for precisely that reason.
        //
        // motion-safe, so the whole thing is colour-only for anybody who asked
        // for reduced motion.
        "relative z-10 hover:text-gryt-text",
        "transition-[scale,color,background-color] duration-(--gryt-dur-spring) ease-spring",
        "motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.96]",
        "motion-reduce:transition-colors motion-reduce:duration-150",
        // Base UI marks the selected tab with data-active, not data-selected.
        // The fill moved to Indicator so it can travel between tabs; the tab
        // itself only changes its text colour.
        "data-active:text-gryt-on-accent",
        // Left-aligned and taller in a rail. Centred labels in a vertical list
        // leave the text edge ragged, which is what makes a rail look untidy.
        "data-[orientation=vertical]:min-h-9 data-[orientation=vertical]:justify-start",
        "data-[orientation=vertical]:gap-2.5 data-[orientation=vertical]:px-3",
        "data-[orientation=vertical]:rounded-(--gryt-radius-md)",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        focusRing,
        className
      )}
      {...props}
    />
  );
});

export type TabsIndicatorProps = ComponentPropsWithoutRef<
  typeof BaseTabs.Indicator
>;

// Base UI measures the active tab and publishes --active-tab-left and
// --active-tab-width, plus --active-tab-top and --active-tab-height, which is
// what lets the pill slide rather than jump. renderBeforeHydration keeps it
// positioned on the first paint instead of animating in from the left edge.
//
// The vertical rules hang off the ancestor's data-orientation rather than the
// indicator's own. Root is the part guaranteed to carry it, and an indicator
// that reads its orientation from somewhere other than the root it belongs to
// is a bug waiting for someone to nest two sets of tabs.
const Indicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(
  function TabsIndicator({ className, ...props }, ref) {
    return (
      <BaseTabs.Indicator
        ref={ref}
        renderBeforeHydration
        className={cn(
          "gryt-tabs-indicator absolute top-1 left-0 z-0 h-[calc(100%-0.5rem)]",
          "w-(--active-tab-width) translate-x-(--active-tab-left)",
          "rounded-(--gryt-radius-full) bg-gryt-accent",
          "transition-[translate,width] duration-(--gryt-dur-spring) ease-spring",
          "motion-reduce:transition-none",
          // Same pill, travelling down the rail instead of across the row.
          "[[data-orientation=vertical]_&]:top-0 [[data-orientation=vertical]_&]:left-1",
          "[[data-orientation=vertical]_&]:h-(--active-tab-height)",
          "[[data-orientation=vertical]_&]:w-[calc(100%-0.5rem)]",
          "[[data-orientation=vertical]_&]:translate-x-0",
          "[[data-orientation=vertical]_&]:translate-y-(--active-tab-top)",
          "[[data-orientation=vertical]_&]:rounded-(--gryt-radius-md)",
          "[[data-orientation=vertical]_&]:transition-[translate,height]",
          className
        )}
        {...props}
      />
    );
  }
);

const Panel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.Panel
      ref={ref}
      className={cn(
        "gryt-tabs-panel pt-3 text-sm text-gryt-text",
        // Beside the rail rather than under it, and allowed to shrink so long
        // content wraps instead of pushing the rail off screen.
        "data-[orientation=vertical]:min-w-0 data-[orientation=vertical]:flex-1",
        "data-[orientation=vertical]:pt-0 data-[orientation=vertical]:pl-4",
        className
      )}
      {...props}
    />
  );
});

export const Tabs = Object.assign(Root, { List, Tab, Panel, Indicator });
export { Tab };
