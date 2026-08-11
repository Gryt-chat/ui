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
        "gryt-tabs-list inline-flex items-center gap-1 rounded-(--gryt-radius-full) bg-gryt-surface-raised p-1",
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
        "transition-colors duration-150 hover:text-gryt-text",
        // Base UI marks the selected tab with data-active, not data-selected.
        "data-active:bg-gryt-accent data-active:text-gryt-on-accent",
        focusRing,
        className
      )}
      {...props}
    />
  );
});

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

export const Tabs = Object.assign(Root, { List, Tab, Panel });
export { Tab };
