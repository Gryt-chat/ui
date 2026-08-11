import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { Menu } from "../Menu/Menu";

export type ContextMenuPositionerProps = ComponentPropsWithoutRef<
  typeof BaseContextMenu.Positioner
>;

/**
 * A right-click menu: a message, a member, a channel.
 *
 * Base UI builds this out of Menu's own parts — its Popup, Item and Separator
 * are literally Menu's components — so this reuses the styled ones rather than
 * restyling them. A context menu that drifted from the dropdown menu would be
 * a bug nobody notices until both are on screen at once.
 */
const Positioner = forwardRef<HTMLDivElement, ContextMenuPositionerProps>(
  function ContextMenuPositioner({ className, sideOffset = 2, ...props }, ref) {
    return (
      <BaseContextMenu.Positioner
        ref={ref}
        // Smaller than Menu's 8. This anchors to the pointer rather than to a
        // trigger element, and 8px from the cursor reads as a menu that missed.
        sideOffset={sideOffset}
        className={cn("gryt-context-menu-positioner outline-none", className)}
        {...props}
      />
    );
  }
);

export const ContextMenu = {
  Root: BaseContextMenu.Root,
  Trigger: BaseContextMenu.Trigger,
  Portal: BaseContextMenu.Portal,
  Positioner,
  Popup: Menu.Popup,
  Item: Menu.Item,
  Separator: Menu.Separator,
  Group: BaseContextMenu.Group,
  GroupLabel: BaseContextMenu.GroupLabel,
  SubmenuRoot: BaseContextMenu.SubmenuRoot,
  SubmenuTrigger: BaseContextMenu.SubmenuTrigger
};
