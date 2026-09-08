import { Select as BaseSelect } from "@base-ui/react/select";
import { CaretUpDown, Check } from "@phosphor-icons/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { usePortalContainer } from "../../portalContainer";
import { cn } from "../utils/cn";
import { focusRing, popupMotion, popupSurface } from "../utils/styles";

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}

/**
 * A run of options under a heading. `options` takes these mixed in with plain ones. The
 * theme library asked: forty-seven presets read as one flat list to a screen reader.
 */
export interface SelectOptionGroup {
  label: ReactNode;
  options: SelectOption[];
}

function isGroup(entry: SelectOption | SelectOptionGroup): entry is SelectOptionGroup {
  return "options" in entry;
}

export type SelectSize = "small" | "medium";

const sizeStyles: Record<SelectSize, string> = {
  small: "min-h-9 px-3 text-sm",
  medium: "min-h-11 px-4 text-sm"
};

export interface SelectProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseSelect.Root>,
    "children" | "items"
  > {
  options?: (SelectOption | SelectOptionGroup)[];
  label?: ReactNode;
  placeholder?: string;
  size?: SelectSize;
  className?: string;
}

/*
 * The popup portals to the document body and no caller can change that per call site; it
 * follows GrytProvider's `containOverlays`. A dialog is a containing block, so it drifts.
 */
function renderItem(option: SelectOption) {
  return (
    <BaseSelect.Item
      key={String(option.value)}
      value={option.value}
      disabled={option.disabled}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2",
        "rounded-(--gryt-radius-md) px-3 py-2 text-sm text-gryt-text",
        "outline-none select-none data-highlighted:bg-gryt-surface-raised",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50"
      )}
    >
      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="text-gryt-accent-11">
        <Check size={14} weight="bold" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

export function Select({
  className,
  label,
  options = [],
  placeholder = "Select",
  size = "medium",
  ...props
}: SelectProps) {
  const portalContainer = usePortalContainer();
  // Base UI reads `items` to turn the value back into a label for the trigger,
  // so it wants every option, not the groups they sit in.
  const flat = options.flatMap((entry) => (isGroup(entry) ? entry.options : entry));

  return (
    <BaseSelect.Root items={flat} {...props}>
      <div className={cn("gryt-select flex w-full flex-col gap-1.5", className)}>
        {label ? (
          <BaseSelect.Label className="text-xs font-medium text-gryt-muted">
            {label}
          </BaseSelect.Label>
        ) : null}
        <BaseSelect.Trigger
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2",
            "rounded-(--gryt-radius-field) border border-gryt-border bg-gryt-surface-raised",
            "text-gryt-text select-none",
            "transition-colors duration-150 hover:border-gryt-accent-light",
            "data-disabled:cursor-not-allowed data-disabled:opacity-60",
            focusRing,
            sizeStyles[size]
          )}
        >
          <BaseSelect.Value placeholder={placeholder} />
          <BaseSelect.Icon className="shrink-0 text-gryt-muted">
            <CaretUpDown size={16} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>

      <BaseSelect.Portal container={portalContainer}>
        <BaseSelect.Positioner
          sideOffset={6}
          className="gryt-select-positioner outline-none"
        >
          <BaseSelect.Popup
            className={cn("min-w-(--anchor-width) p-1", popupSurface, popupMotion)}
          >
            <BaseSelect.List>
              {options.map((entry, index) =>
                isGroup(entry) ? (
                  <BaseSelect.Group key={index}>
                    <BaseSelect.GroupLabel className="px-3 pt-2 pb-1 text-xs font-medium text-gryt-muted">
                      {entry.label}
                    </BaseSelect.GroupLabel>
                    {entry.options.map(renderItem)}
                  </BaseSelect.Group>
                ) : (
                  renderItem(entry)
                )
              )}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
