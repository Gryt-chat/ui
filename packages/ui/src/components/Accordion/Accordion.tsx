import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { CaretDown } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export type AccordionProps = ComponentPropsWithoutRef<
  typeof BaseAccordion.Root
>;
export type AccordionItemProps = ComponentPropsWithoutRef<
  typeof BaseAccordion.Item
>;
export type AccordionPanelProps = ComponentPropsWithoutRef<
  typeof BaseAccordion.Panel
>;

const Root = forwardRef<HTMLDivElement, AccordionProps>(function AccordionRoot(
  { className, ...props },
  ref
) {
  return (
    <BaseAccordion.Root
      ref={ref}
      className={cn(
        "gryt-accordion flex w-full flex-col gap-2 rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface p-2",
        className
      )}
      {...props}
    />
  );
});

const Item = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, ...props }, ref) {
    return (
      <BaseAccordion.Item
        ref={ref}
        className={cn("gryt-accordion-item", className)}
        {...props}
      />
    );
  }
);

export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<typeof BaseAccordion.Trigger> {
  // Defaults to a caret that rotates when the panel opens. Pass one to
  // override it, or null for no indicator at all.
  expandIcon?: ReactNode;
}

const Trigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ children, className, expandIcon, ...props }, ref) {
    return (
      <BaseAccordion.Header className="gryt-accordion-header m-0">
        <BaseAccordion.Trigger
          ref={ref}
          className={cn(
            "gryt-accordion-trigger flex w-full items-center justify-between gap-3",
            "rounded-(--gryt-radius-lg) border-0 bg-transparent px-3 py-2.5",
            "text-left text-sm font-medium text-gryt-text select-none",
            "transition-colors duration-150 hover:bg-gryt-surface-raised",
            focusRing,
            className
          )}
          {...props}
        >
          {children}
          {expandIcon === undefined ? (
            <CaretDown
              size={16}
              // Base UI flags the open panel on the trigger, so the caret needs
              // no state of its own.
              className="shrink-0 transition-transform duration-(--gryt-dur-spring) ease-spring data-panel-open:rotate-180 motion-reduce:transition-none"
            />
          ) : (
            expandIcon
          )}
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>
    );
  }
);

const Panel = forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel({ children, className, ...props }, ref) {
    return (
      <BaseAccordion.Panel
        ref={ref}
        className={cn(
          "gryt-accordion-panel overflow-hidden text-sm text-gryt-muted",
          // Base UI measures the panel and exposes the height as a variable,
          // which is what makes a real open and close transition possible.
          "h-[var(--accordion-panel-height)] transition-[height] duration-(--gryt-dur-spring-soft) ease-spring-soft",
          "data-starting-style:h-0 data-ending-style:h-0",
          "motion-reduce:transition-none",
          className
        )}
        {...props}
      >
        <div className="px-3 pt-1 pb-3">{children}</div>
      </BaseAccordion.Panel>
    );
  }
);

export const Accordion = Object.assign(Root, { Item, Trigger, Panel });
