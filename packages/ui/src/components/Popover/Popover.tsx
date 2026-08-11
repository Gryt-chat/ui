import { Popover as BasePopover } from "@base-ui/react/popover";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { popupMotion, popupSurface } from "../utils/styles";

export type PopoverPopupProps = ComponentPropsWithoutRef<
  typeof BasePopover.Popup
>;
export type PopoverPositionerProps = ComponentPropsWithoutRef<
  typeof BasePopover.Positioner
>;

const Positioner = forwardRef<HTMLDivElement, PopoverPositionerProps>(
  function PopoverPositioner({ className, sideOffset = 8, ...props }, ref) {
    return (
      <BasePopover.Positioner
        ref={ref}
        sideOffset={sideOffset}
        className={cn("gryt-popover-positioner outline-none", className)}
        {...props}
      />
    );
  }
);

// Wider default than Menu: this holds prose and controls — a member card, a
// permissions summary — rather than a column of one-line items.
const Popup = forwardRef<HTMLDivElement, PopoverPopupProps>(
  function PopoverPopup({ className, ...props }, ref) {
    return (
      <BasePopover.Popup
        ref={ref}
        className={cn(
          "gryt-popover max-w-[min(20rem,calc(100vw-2rem))] p-4 outline-none",
          popupSurface,
          popupMotion,
          className
        )}
        {...props}
      />
    );
  }
);

const Title = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof BasePopover.Title>
>(function PopoverTitle({ className, ...props }, ref) {
  return (
    <BasePopover.Title
      ref={ref}
      className={cn(
        "gryt-popover-title text-sm font-semibold text-gryt-text",
        className
      )}
      {...props}
    />
  );
});

const Description = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof BasePopover.Description>
>(function PopoverDescription({ className, ...props }, ref) {
  return (
    <BasePopover.Description
      ref={ref}
      className={cn(
        "gryt-popover-description mt-1 text-sm leading-6 text-gryt-muted",
        className
      )}
      {...props}
    />
  );
});

export const Popover = {
  Root: BasePopover.Root,
  Trigger: BasePopover.Trigger,
  Portal: BasePopover.Portal,
  Positioner,
  Popup,
  Title,
  Description,
  Close: BasePopover.Close,
  Arrow: BasePopover.Arrow
};
