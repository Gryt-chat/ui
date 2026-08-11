import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { popupMotion, popupSurface } from "../utils/styles";

export type PreviewCardPopupProps = ComponentPropsWithoutRef<
  typeof BasePreviewCard.Popup
>;
export type PreviewCardPositionerProps = ComponentPropsWithoutRef<
  typeof BasePreviewCard.Positioner
>;

/**
 * What appears when you hover a username.
 *
 * Not a Tooltip and not a Popover. A tooltip labels a control and opens
 * instantly; this holds real content, so it waits before opening and stays put
 * long enough to move the pointer into it. Popover is the click-to-open
 * equivalent — reach for that when the panel has controls, since content that
 * only appears on hover is unreachable from a keyboard or a touchscreen.
 */
const Positioner = forwardRef<HTMLDivElement, PreviewCardPositionerProps>(
  function PreviewCardPositioner({ className, sideOffset = 8, ...props }, ref) {
    return (
      <BasePreviewCard.Positioner
        ref={ref}
        sideOffset={sideOffset}
        className={cn("gryt-preview-card-positioner outline-none", className)}
        {...props}
      />
    );
  }
);

const Popup = forwardRef<HTMLDivElement, PreviewCardPopupProps>(
  function PreviewCardPopup({ className, ...props }, ref) {
    return (
      <BasePreviewCard.Popup
        ref={ref}
        className={cn(
          "gryt-preview-card w-64 max-w-[calc(100vw-2rem)] p-4 outline-none",
          popupSurface,
          popupMotion,
          className
        )}
        {...props}
      />
    );
  }
);

export const PreviewCard = {
  Root: BasePreviewCard.Root,
  Trigger: BasePreviewCard.Trigger,
  Portal: BasePreviewCard.Portal,
  Positioner,
  Popup,
  Arrow: BasePreviewCard.Arrow
};
