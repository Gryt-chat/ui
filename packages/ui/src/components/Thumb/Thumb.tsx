"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../utils/cn";

/** The Thumb: an edge tab low on the right that opens a drawer, links at the bottom (GRYT-1719).
 *  Tap only, since an edge swipe is the phone's back gesture; the same tab closes it. */
export interface ThumbProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What a screen reader calls the tab. */
  label?: string;
  closeLabel?: string;
  /** What a screen reader calls the drawer. */
  drawerLabel?: string;
  /** Classes for the drawer. Hide the tab on wide screens with `tabClassName`. */
  className?: string;
  tabClassName?: string;
}

/* Halfway down, but never above the lowest 348px, so a tall phone keeps it in reach. */
const TAB_TOP: CSSProperties = { top: "max(calc(50svh - 48px), calc(100svh - 348px))" };

/** The tab itself: a sliver of the drawer's edge with an accent grip, inside a 44px target. */
const tab = cn(
  "h-24 border-0 bg-transparent p-0 cursor-pointer",
  "after:absolute after:inset-y-0 after:right-0 after:w-[18px] after:box-border after:rounded-l-xl",
  "after:border after:border-r-0 after:border-gryt-border after:bg-gryt-surface after:content-['']",
  "before:absolute before:z-[1] before:top-[30px] before:right-[7px] before:h-9 before:w-1 before:rounded-sm",
  "before:bg-gryt-accent-9 before:opacity-85 before:content-['']",
  "focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gryt-accent-9"
);

export function Thumb({
  children,
  open,
  defaultOpen,
  onOpenChange,
  label = "Menu",
  closeLabel = "Close menu",
  drawerLabel = "Navigation",
  className,
  tabClassName
}: ThumbProps) {
  return (
    <BaseDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)}>
      <BaseDialog.Trigger
        aria-label={label}
        data-gryt="thumb"
        style={TAB_TOP}
        className={cn(tab, "fixed right-0 z-[100] w-11 after:shadow-[-4px_0_16px_rgb(0_0_0/0.45)]", tabClassName)}
      />
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className={cn(
            "fixed inset-0 z-[200] bg-black/60 transition-opacity duration-200",
            "data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none"
          )}
        />
        <BaseDialog.Popup
          aria-label={drawerLabel}
          className={cn(
            "fixed inset-y-0 right-0 z-[201] flex w-[min(62vw,260px)] flex-col box-border",
            "rounded-l-2xl border-l border-gryt-border bg-gryt-surface px-3 pt-5 pb-7 outline-none",
            "shadow-[-12px_0_40px_rgb(0_0_0/0.5)]",
            "transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            "data-starting-style:translate-x-full data-ending-style:translate-x-full",
            className
          )}
        >
          <BaseDialog.Close
            aria-label={closeLabel}
            style={TAB_TOP}
            className={cn(tab, "absolute -left-[18px] w-[18px]")}
          />
          {/* Links sit at the bottom, where the thumb that opened it is. */}
          <nav className="flex flex-1 flex-col justify-end gap-0.5 overflow-y-auto py-4">{children}</nav>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
