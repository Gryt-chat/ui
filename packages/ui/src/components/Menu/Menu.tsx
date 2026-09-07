import { Menu as BaseMenu } from "@base-ui/react/menu";
import { CaretRight, Check } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { popupMotion, popupSurfaceColors } from "../utils/styles";

export type MenuPopupProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
export type MenuItemProps = ComponentPropsWithoutRef<typeof BaseMenu.Item>;
export type MenuPositionerProps = ComponentPropsWithoutRef<
  typeof BaseMenu.Positioner
>;
export type MenuGroupProps = ComponentPropsWithoutRef<typeof BaseMenu.Group>;
export type MenuGroupLabelProps = ComponentPropsWithoutRef<
  typeof BaseMenu.GroupLabel
>;
export type MenuSubmenuTriggerProps = ComponentPropsWithoutRef<
  typeof BaseMenu.SubmenuTrigger
>;
export type MenuCheckboxItemProps = ComponentPropsWithoutRef<
  typeof BaseMenu.CheckboxItem
>;
export type MenuRadioGroupProps = ComponentPropsWithoutRef<
  typeof BaseMenu.RadioGroup
>;
export type MenuRadioItemProps = ComponentPropsWithoutRef<
  typeof BaseMenu.RadioItem
>;

/**
 * One row, whichever kind of row it is.
 *
 * Item, SubmenuTrigger, CheckboxItem and RadioItem all sit in the same column
 * and have to line up. They did not: only Item was styled, so a submenu trigger
 * rendered as bare text with no padding, sitting twelve pixels to the left of
 * every row above and below it.
 */
const menuItem = [
  "flex cursor-pointer items-center gap-2 rounded-(--gryt-radius-md)",
  "px-3 py-2 text-sm text-gryt-text outline-none select-none",
  // Base UI drives keyboard and pointer highlight through the same
  // attribute, so arrow keys and the mouse land on identical styling.
  "data-highlighted:bg-gryt-surface-raised",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50"
].join(" ");

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
        "gryt-menu min-w-44 outline-none",
        popupSurfaceColors,
        // Concentric with the rows inside it. The shared surface is xl (28px),
        // which is right for a dialog and wrong here: an item is md (12px) and
        // sat 4px in, so the popup's corner curved away from the highlighted
        // row and left a crescent of surface showing on the first and last
        // item. lg (20px) less the 8px inset is exactly the item's 12px.
        "rounded-(--gryt-radius-lg) p-2",
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
      className={cn("gryt-menu-item", menuItem, className)}
      {...props}
    />
  );
});

const Group = forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  { className, ...props },
  ref
) {
  return (
    <BaseMenu.Group
      ref={ref}
      className={cn("gryt-menu-group", className)}
      {...props}
    />
  );
});

/**
 * The heading over a group of rows. Quiet, small, and indented to the same
 * column as the labels underneath it.
 */
const GroupLabel = forwardRef<HTMLDivElement, MenuGroupLabelProps>(
  function MenuGroupLabel({ className, ...props }, ref) {
    return (
      <BaseMenu.GroupLabel
        ref={ref}
        className={cn(
          "gryt-menu-group-label px-3 pt-1.5 pb-1 text-xs font-medium",
          "text-gryt-muted select-none",
          className
        )}
        {...props}
      />
    );
  }
);

/**
 * A row that opens a submenu. Carries its own caret, because a submenu trigger
 * that does not point anywhere reads as an item that does nothing when pressed.
 */
const SubmenuTrigger = forwardRef<HTMLDivElement, MenuSubmenuTriggerProps>(
  function MenuSubmenuTrigger({ children, className, ...props }, ref) {
    return (
      <BaseMenu.SubmenuTrigger
        ref={ref}
        className={cn(
          "gryt-menu-submenu-trigger justify-between",
          menuItem,
          // Held open while the submenu is showing. Without it the row you came
          // through goes flat the moment the pointer leaves it, and the open
          // submenu appears to belong to nothing.
          "data-popup-open:bg-gryt-surface-raised",
          className
        )}
        {...props}
      >
        <span className="flex min-w-0 items-center gap-2">{children}</span>
        <CaretRight
          size={12}
          weight="bold"
          className="shrink-0 text-gryt-muted"
        />
      </BaseMenu.SubmenuTrigger>
    );
  }
);

const CheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem({ children, className, ...props }, ref) {
    return (
      <BaseMenu.CheckboxItem
        ref={ref}
        className={cn(
          "gryt-menu-checkbox-item justify-between",
          menuItem,
          className
        )}
        {...props}
      >
        <span className="flex min-w-0 items-center gap-2">{children}</span>
        <BaseMenu.CheckboxItemIndicator className="flex shrink-0 text-gryt-accent-11">
          <Check size={14} weight="bold" />
        </BaseMenu.CheckboxItemIndicator>
      </BaseMenu.CheckboxItem>
    );
  }
);

const RadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>(
  function MenuRadioGroup({ className, ...props }, ref) {
    return (
      <BaseMenu.RadioGroup
        ref={ref}
        className={cn("gryt-menu-radio-group", className)}
        {...props}
      />
    );
  }
);

const RadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
  function MenuRadioItem({ children, className, ...props }, ref) {
    return (
      <BaseMenu.RadioItem
        ref={ref}
        className={cn(
          "gryt-menu-radio-item justify-between",
          menuItem,
          className
        )}
        {...props}
      >
        <span className="flex min-w-0 items-center gap-2">{children}</span>
        <BaseMenu.RadioItemIndicator className="flex shrink-0 text-gryt-accent-11">
          <Check size={14} weight="bold" />
        </BaseMenu.RadioItemIndicator>
      </BaseMenu.RadioItem>
    );
  }
);

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
  Group,
  GroupLabel,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  SubmenuRoot: BaseMenu.SubmenuRoot,
  SubmenuTrigger,
  Separator
};
