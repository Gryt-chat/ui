import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { listboxInputClass, listboxItemClass } from "../Combobox/Combobox";
import { popupMotion, popupSurface } from "../utils/styles";

/**
 * A text input that suggests as you type.
 *
 * The difference from Combobox is what the value is allowed to be: here the
 * typed text is the answer and the list is a suggestion, so a search box or a
 * tag input belongs here. Combobox is for when the value must come from the
 * list. They share item and input styling deliberately — two lists that look
 * different for no reason is worse than one that looks the same.
 */

const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Input>
>(function AutocompleteInput({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Input
      ref={ref}
      className={cn("gryt-autocomplete-input", listboxInputClass, className)}
      {...props}
    />
  );
});

const Positioner = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Positioner>
>(function AutocompletePositioner({ className, sideOffset = 6, ...props }, ref) {
  return (
    <BaseAutocomplete.Positioner
      ref={ref}
      sideOffset={sideOffset}
      className={cn("gryt-autocomplete-positioner outline-none", className)}
      {...props}
    />
  );
});

const Popup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Popup>
>(function AutocompletePopup({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Popup
      ref={ref}
      className={cn(
        "gryt-autocomplete max-h-64 w-(--anchor-width) overflow-y-auto overscroll-contain p-1 outline-none",
        popupSurface,
        popupMotion,
        className
      )}
      {...props}
    />
  );
});

const Item = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Item>
>(function AutocompleteItem({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Item
      ref={ref}
      className={cn("gryt-autocomplete-item", listboxItemClass, className)}
      {...props}
    />
  );
});

const Empty = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseAutocomplete.Empty>
>(function AutocompleteEmpty({ className, ...props }, ref) {
  return (
    <BaseAutocomplete.Empty
      ref={ref}
      className={cn(
        "gryt-autocomplete-empty px-3 py-2 text-sm text-gryt-muted",
        className
      )}
      {...props}
    />
  );
});

export const Autocomplete = {
  Root: BaseAutocomplete.Root,
  Input,
  InputGroup: BaseAutocomplete.InputGroup,
  Trigger: BaseAutocomplete.Trigger,
  Icon: BaseAutocomplete.Icon,
  Clear: BaseAutocomplete.Clear,
  Value: BaseAutocomplete.Value,
  Portal: BaseAutocomplete.Portal,
  Positioner,
  Popup,
  List: BaseAutocomplete.List,
  Item,
  Group: BaseAutocomplete.Group,
  GroupLabel: BaseAutocomplete.GroupLabel,
  Empty,
  Separator: BaseAutocomplete.Separator
};
