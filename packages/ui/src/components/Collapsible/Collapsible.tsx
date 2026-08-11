import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export type CollapsibleTriggerProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Trigger
>;
export type CollapsiblePanelProps = ComponentPropsWithoutRef<
  typeof BaseCollapsible.Panel
>;

/**
 * One region that opens and closes — a channel category, an advanced section.
 *
 * Accordion is a set of these that know about each other. Reach for this when
 * there is only one, so nothing has to pretend to be a one-item accordion.
 */
const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ className, ...props }, ref) {
    return (
      <BaseCollapsible.Trigger
        ref={ref}
        className={cn(
          "gryt-collapsible-trigger flex w-full items-center justify-between gap-2",
          "rounded-(--gryt-radius-md) border-0 bg-transparent px-2 py-2 text-left",
          "text-sm font-medium text-gryt-text select-none",
          "transition-colors hover:bg-gryt-surface-raised motion-reduce:transition-none",
          focusRing,
          className
        )}
        {...props}
      />
    );
  }
);

const Panel = forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  function CollapsiblePanel({ className, ...props }, ref) {
    return (
      <BaseCollapsible.Panel
        ref={ref}
        className={cn(
          "gryt-collapsible-panel overflow-hidden",
          // Base UI measures the panel and exposes the height as a variable, so
          // this animates to the content's real height rather than to a guess.
          "h-(--collapsible-panel-height) transition-[height] duration-(--gryt-dur-spring) ease-spring",
          "data-starting-style:h-0 data-ending-style:h-0",
          "motion-reduce:transition-none",
          className
        )}
        {...props}
      />
    );
  }
);

export const Collapsible = {
  Root: BaseCollapsible.Root,
  Trigger,
  Panel
};
