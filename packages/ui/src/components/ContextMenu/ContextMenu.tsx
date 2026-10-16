"use client";

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { Menu } from "../Menu/Menu";
import { usePopupCollisionPadding } from "../../overlayInset";

export type ContextMenuPositionerProps = ComponentPropsWithoutRef<
  typeof BaseContextMenu.Positioner
>;

/**
 * A right-click menu. Base UI builds it out of Menu's own parts, so this reuses the styled
 * ones — Menu styles all of them now, so this list can be the passthrough it claimed.
 */
const Positioner = forwardRef<HTMLDivElement, ContextMenuPositionerProps>(
  function ContextMenuPositioner(
    {
      className,
      collisionPadding,
      sideOffset = 2,
      ...props
    },
    ref
  ) {
    const padding = usePopupCollisionPadding();
    return (
      <BaseContextMenu.Positioner
        ref={ref}
        collisionPadding={collisionPadding ?? padding}
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
  Group: Menu.Group,
  GroupLabel: Menu.GroupLabel,
  CheckboxItem: Menu.CheckboxItem,
  RadioGroup: Menu.RadioGroup,
  RadioItem: Menu.RadioItem,
  SubmenuRoot: BaseContextMenu.SubmenuRoot,
  SubmenuTrigger: Menu.SubmenuTrigger
};
