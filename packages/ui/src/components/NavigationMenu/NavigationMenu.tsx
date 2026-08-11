import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { focusRing, popupMotion, popupSurface } from "../utils/styles";

/**
 * A bar of menus that behave as one — File, Edit, View.
 *
 * Once any menu is open, moving along the bar opens the next without a second
 * click, which is the behaviour that separates a menubar from several
 * independent Menus sitting next to each other.
 */
export type MenubarProps = ComponentPropsWithoutRef<typeof BaseMenubar>;

export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(
  function Menubar({ className, ...props }, ref) {
    return (
      <BaseMenubar
        ref={ref}
        className={cn(
          "gryt-menubar flex items-center gap-1",
          "rounded-(--gryt-radius-md) border border-gryt-border bg-gryt-surface p-1",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * Site-level navigation whose items open panels.
 *
 * Distinct from Menubar: the items are links first and the panels can hold
 * layout — a column of sections, a promo — rather than a list of commands. The
 * viewport animates between panels so moving along the bar resizes rather than
 * closing and reopening.
 */
const Trigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof BaseNavigationMenu.Trigger>
>(function NavigationMenuTrigger({ className, ...props }, ref) {
  return (
    <BaseNavigationMenu.Trigger
      ref={ref}
      className={cn(
        "gryt-navigation-menu-trigger flex items-center gap-1.5 rounded-(--gryt-radius-md)",
        "border-0 bg-transparent px-3 py-2 text-sm font-medium text-gryt-text select-none",
        "transition-colors hover:bg-gryt-surface-raised motion-reduce:transition-none",
        "data-popup-open:bg-gryt-surface-raised",
        focusRing,
        className
      )}
      {...props}
    />
  );
});

const Popup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseNavigationMenu.Popup>
>(function NavigationMenuPopup({ className, ...props }, ref) {
  return (
    <BaseNavigationMenu.Popup
      ref={ref}
      className={cn(
        "gryt-navigation-menu-popup outline-none",
        popupSurface,
        popupMotion,
        className
      )}
      {...props}
    />
  );
});

const Viewport = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseNavigationMenu.Viewport>
>(function NavigationMenuViewport({ className, ...props }, ref) {
  return (
    <BaseNavigationMenu.Viewport
      ref={ref}
      className={cn(
        "gryt-navigation-menu-viewport relative overflow-hidden",
        className
      )}
      {...props}
    />
  );
});

const Link = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof BaseNavigationMenu.Link>
>(function NavigationMenuLink({ className, ...props }, ref) {
  return (
    <BaseNavigationMenu.Link
      ref={ref}
      className={cn(
        "gryt-navigation-menu-link block rounded-(--gryt-radius-md) px-3 py-2",
        "text-sm text-gryt-text no-underline outline-none",
        "transition-colors hover:bg-gryt-surface-raised motion-reduce:transition-none",
        focusRing,
        className
      )}
      {...props}
    />
  );
});

export const NavigationMenu = {
  Root: BaseNavigationMenu.Root,
  List: BaseNavigationMenu.List,
  Item: BaseNavigationMenu.Item,
  Trigger,
  Content: BaseNavigationMenu.Content,
  Portal: BaseNavigationMenu.Portal,
  Positioner: BaseNavigationMenu.Positioner,
  Viewport,
  Popup,
  Link,
  Icon: BaseNavigationMenu.Icon,
  Arrow: BaseNavigationMenu.Arrow
};
