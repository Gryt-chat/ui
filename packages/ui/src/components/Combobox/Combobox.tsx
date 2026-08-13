import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import {
  fieldControl,
  fieldSizes,
  focusRing,
  popupMotion,
  popupSurface
} from "../utils/styles";

/**
 * Shared with Autocomplete, which is the same list wearing different
 * semantics. Exported so the two cannot drift, the way ContextMenu shares
 * Menu's item.
 */
export const listboxItemClass = [
  "flex cursor-default items-center gap-2 rounded-(--gryt-radius-md)",
  "px-3 py-2 text-sm text-gryt-text outline-none select-none",
  // Base UI drives keyboard and pointer highlight through one attribute, so
  // arrow keys and the mouse land on identical styling.
  "data-highlighted:bg-gryt-surface-raised",
  "data-selected:text-gryt-accent-11",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50"
].join(" ");

/**
 * The typeahead input on both Combobox and Autocomplete.
 *
 * This is TextField's control, through the same shared constant, so the three
 * places you can type in this library are the same shape. It used to be its own
 * class list asking for `rounded-(--gryt-radius-input)` — a token that has never
 * existed — so it rendered with square corners next to a fully rounded
 * TextField.
 */
export const listboxInputClass = [
  fieldControl,
  fieldSizes.medium,
  "border-gryt-border",
  focusRing
].join(" ");

export type ComboboxPopupProps = ComponentPropsWithoutRef<
  typeof BaseCombobox.Popup
>;

const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<typeof BaseCombobox.Input>
>(function ComboboxInput({ className, ...props }, ref) {
  return (
    <BaseCombobox.Input
      ref={ref}
      className={cn("gryt-combobox-input", listboxInputClass, className)}
      {...props}
    />
  );
});

const Positioner = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseCombobox.Positioner>
>(function ComboboxPositioner({ className, sideOffset = 6, ...props }, ref) {
  return (
    <BaseCombobox.Positioner
      ref={ref}
      sideOffset={sideOffset}
      className={cn("gryt-combobox-positioner outline-none", className)}
      {...props}
    />
  );
});

const Popup = forwardRef<HTMLDivElement, ComboboxPopupProps>(
  function ComboboxPopup({ className, ...props }, ref) {
    return (
      <BaseCombobox.Popup
        ref={ref}
        className={cn(
          "gryt-combobox max-h-64 w-(--anchor-width) overflow-y-auto overscroll-contain p-1 outline-none",
          popupSurface,
          popupMotion,
          className
        )}
        {...props}
      />
    );
  }
);

const Item = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseCombobox.Item>
>(function ComboboxItem({ className, ...props }, ref) {
  return (
    <BaseCombobox.Item
      ref={ref}
      className={cn("gryt-combobox-item", listboxItemClass, className)}
      {...props}
    />
  );
});

const Empty = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseCombobox.Empty>
>(function ComboboxEmpty({ className, ...props }, ref) {
  return (
    <BaseCombobox.Empty
      ref={ref}
      className={cn(
        "gryt-combobox-empty px-3 py-2 text-sm text-gryt-muted",
        className
      )}
      {...props}
    />
  );
});

/**
 * Pick from a list, narrowed by typing. Select with a filter, in effect.
 *
 * Supports multiple selection with chips, which is what a member picker or a
 * role assignment wants. Use Autocomplete instead when the value is free text
 * and the list is only a suggestion.
 */
export const Combobox = {
  Root: BaseCombobox.Root,
  Input,
  InputGroup: BaseCombobox.InputGroup,
  Trigger: BaseCombobox.Trigger,
  Icon: BaseCombobox.Icon,
  Clear: BaseCombobox.Clear,
  Value: BaseCombobox.Value,
  Chips: BaseCombobox.Chips,
  Chip: BaseCombobox.Chip,
  ChipRemove: BaseCombobox.ChipRemove,
  Portal: BaseCombobox.Portal,
  Positioner,
  Popup,
  List: BaseCombobox.List,
  Item,
  ItemIndicator: BaseCombobox.ItemIndicator,
  Group: BaseCombobox.Group,
  GroupLabel: BaseCombobox.GroupLabel,
  Empty,
  Separator: BaseCombobox.Separator
};
