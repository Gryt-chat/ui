import { Select as BaseSelect } from "@base-ui/react/select";
import { CaretUpDown, Check } from "@phosphor-icons/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";
import { focusRing, popupMotion, popupSurface } from "../utils/styles";

export interface SelectOption {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
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
  options?: SelectOption[];
  label?: ReactNode;
  placeholder?: string;
  size?: SelectSize;
  className?: string;
}

export function Select({
  className,
  label,
  options = [],
  placeholder = "Select",
  size = "medium",
  ...props
}: SelectProps) {
  return (
    <BaseSelect.Root items={options} {...props}>
      <div className={cn("gryt-select flex w-full flex-col gap-1.5", className)}>
        {label ? (
          <BaseSelect.Label className="text-xs font-medium text-gryt-muted">
            {label}
          </BaseSelect.Label>
        ) : null}
        <BaseSelect.Trigger
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2",
            "rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface-raised",
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

      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={6} className="outline-none">
          <BaseSelect.Popup
            className={cn("min-w-(--anchor-width) p-1", popupSurface, popupMotion)}
          >
            <BaseSelect.List>
              {options.map((option) => (
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
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
