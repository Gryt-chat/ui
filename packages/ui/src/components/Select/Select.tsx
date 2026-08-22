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

/*
 * The popup portals to the document body, and no caller can change that per
 * call site. It follows GrytProvider's `containOverlays` and nothing else.
 *
 * A `portalContainer` prop existed briefly so a Select inside a dialog could
 * render into it rather than beside it. It does not work, and it caused the
 * dropdowns in the client's server settings to open in the wrong place.
 *
 * Base UI positions the popup by computing coordinates against the viewport. A
 * dialog is `position: fixed` and centres itself with `translate: -50% -50%`,
 * and both of those make it a containing block for positioned descendants — so
 * the coordinates get resolved against the dialog and its own offset is counted
 * twice. Measured in a browser, with the dialog at (16, 226): the popup landed
 * 227px too low and 17px too far right, matching the dialog's origin.
 *
 * Neither escape works. `positionMethod="fixed"` changes nothing. Removing the
 * translate fixes the vertical error and leaves the horizontal one, because the
 * dialog is still positioned.
 *
 * Portalling to the body is correct on both axes and already renders above the
 * dialog, so there was never a stacking problem to solve.
 *
 * The other half of GRYT-242 — a popup that genuinely needs to live inside a
 * themed subtree, because a second theme is being previewed inside a page — is
 * now `containOverlays` on GrytProvider. Deliberately not this prop back: the
 * container is set once, for a subtree, by whoever established the theme. A
 * per-call prop is the thing somebody reaches for to fix a layout problem,
 * which is how the bug above got made.
 */
export function Select({
  className,
  label,
  options = [],
  placeholder = "Select",
  size = "medium",
  ...props
}: SelectProps) {
  const portalContainer = usePortalContainer();

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

      <BaseSelect.Portal container={portalContainer}>
        <BaseSelect.Positioner
          sideOffset={6}
          className="gryt-select-positioner outline-none"
        >
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
