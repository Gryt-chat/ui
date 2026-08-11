import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export type TabsProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;
export type TabsListProps = ComponentPropsWithoutRef<typeof BaseTabs.List>;
export type TabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
export type TabsPanelProps = ComponentPropsWithoutRef<typeof BaseTabs.Panel>;

const Root = forwardRef<HTMLDivElement, TabsProps>(function TabsRoot(
  { className, ...props },
  ref
) {
  return (
    <BaseTabs.Root
      ref={ref}
      className={cn("gryt-tabs", className)}
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
        "gryt-tab inline-flex min-h-8 items-center justify-center whitespace-nowrap",
        "rounded-(--gryt-radius-full) border-0 bg-transparent px-4 py-1.5",
        "text-sm font-medium text-gryt-muted select-none",
        "relative z-10 transition-colors duration-150 hover:text-gryt-text",
        // Base UI marks the selected tab with data-active, not data-selected.
        // The fill moved to Indicator so it can travel between tabs; the tab
        // itself only changes its text colour.
        "data-active:text-gryt-on-accent",
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
// --active-tab-width, which is what lets the pill slide rather than jump.
// renderBeforeHydration keeps it positioned on the first paint instead of
// animating in from the left edge.
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
      className={cn("gryt-tabs-panel pt-3 text-sm text-gryt-text", className)}
      {...props}
    />
  );
});

export const Tabs = Object.assign(Root, { List, Tab, Panel, Indicator });
export { Tab };
