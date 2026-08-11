import { Menu as BaseMenu } from "@base-ui/react/menu";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { popupMotion, popupSurface } from "../utils/styles";

export type MenuPopupProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
export type MenuItemProps = ComponentPropsWithoutRef<typeof BaseMenu.Item>;
export type MenuPositionerProps = ComponentPropsWithoutRef<
  typeof BaseMenu.Positioner
>;

const Positioner = forwardRef<HTMLDivElement, MenuPositionerProps>(
  function MenuPositioner({ className, sideOffset = 8, ...props }, ref) {
    return (
      <BaseMenu.Positioner
        ref={ref}
        sideOffset={sideOffset}
        className={cn("gryt-menu-positioner outline-none", className)}
        {...props}
      />
    );
  }
);

const Popup = forwardRef<HTMLDivElement, MenuPopupProps>(function MenuPopup(
  { className, ...props },
  ref
) {
  return (
    <BaseMenu.Popup
      ref={ref}
      className={cn(
        "gryt-menu min-w-44 p-1 outline-none",
        popupSurface,
        popupMotion,
        className
      )}
      {...props}
    />
  );
});

const Item = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { className, ...props },
  ref
) {
  return (
    <BaseMenu.Item
      ref={ref}
      className={cn(
        "gryt-menu-item flex cursor-default items-center gap-2 rounded-(--gryt-radius-md)",
        "px-3 py-2 text-sm text-gryt-text outline-none select-none",
        // Base UI drives keyboard and pointer highlight through the same
        // attribute, so arrow keys and the mouse land on identical styling.
        "data-highlighted:bg-gryt-surface-raised",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

const Separator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseMenu.Separator>
>(function MenuSeparator({ className, ...props }, ref) {
  return (
    <BaseMenu.Separator
      ref={ref}
      className={cn("gryt-menu-separator my-1 h-px bg-gryt-border", className)}
      {...props}
    />
  );
});

export const Menu = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Portal: BaseMenu.Portal,
  Positioner,
  Popup,
  Item,
  Separator
};
