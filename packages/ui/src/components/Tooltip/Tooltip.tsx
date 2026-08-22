import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";
import { usePortalContainer } from "../../portalContainer";
import { cn } from "../utils/cn";
import { popupMotion } from "../utils/styles";

export interface TooltipProps {
  // Kept as a single-child wrapper rather than exposing Base UI's five parts.
  // Both MUI and Radix Themes spell a tooltip this way, so client call sites
  // move across unchanged, and a tooltip has no useful middle ground to
  // compose anyway.
  title: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
}

// Hover delay is not set here — it belongs to Tooltip.Provider, which shares
// timing across every tooltip so moving between two triggers does not restart
// the wait. GrytProvider renders one; see its tooltipDelay prop.
export function Tooltip({
  children,
  className,
  side = "top",
  sideOffset = 8,
  title
}: TooltipProps) {
  const portalContainer = usePortalContainer();

  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal container={portalContainer}>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={sideOffset}
          className="gryt-tooltip-positioner"
        >
          <BaseTooltip.Popup
            className={cn(
              "gryt-tooltip rounded-(--gryt-radius-md) border border-gryt-border bg-gryt-surface-raised",
              "px-2.5 py-1.5 text-xs text-gryt-text",
              popupMotion,
              className
            )}
          >
            {title}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

// Base UI shares hover timing across tooltips through this provider, so moving
// between two triggers skips the delay the second time. GrytProvider renders
// one already; this is exported for apps that do not use GrytProvider.
export const TooltipProvider = BaseTooltip.Provider;
