import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type DrawerSide = "left" | "right" | "top" | "bottom";

// Base UI has no drawer part. A drawer is a dialog pinned to an edge, and it
// wants the same focus trap, escape handling and scroll lock, so it is built
// on Dialog rather than reinvented.
// The panel is --gryt-drawer-bleed longer than it looks and hangs that much
// off-screen, with matching padding so the content sits where it would have.
// A spring settles onto its target from both directions; without the bleed,
// the moment it sits a fraction short of flush you get a seam of backdrop down
// the edge. Overrunning the edge means an undershoot reveals more drawer.
const sideStyles: Record<DrawerSide, string> = {
  left: "inset-y-0 -left-(--gryt-drawer-bleed) h-full w-[calc(20rem+var(--gryt-drawer-bleed))] max-w-[calc(85vw+var(--gryt-drawer-bleed))] border-r py-5 pr-5 pl-[calc(1.25rem+var(--gryt-drawer-bleed))] data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
  right:
    "inset-y-0 -right-(--gryt-drawer-bleed) h-full w-[calc(20rem+var(--gryt-drawer-bleed))] max-w-[calc(85vw+var(--gryt-drawer-bleed))] border-l py-5 pl-5 pr-[calc(1.25rem+var(--gryt-drawer-bleed))] data-starting-style:translate-x-full data-ending-style:translate-x-full",
  top: "inset-x-0 -top-(--gryt-drawer-bleed) h-auto max-h-[calc(85vh+var(--gryt-drawer-bleed))] w-full border-b px-5 pb-5 pt-[calc(1.25rem+var(--gryt-drawer-bleed))] data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
  bottom:
    "inset-x-0 -bottom-(--gryt-drawer-bleed) h-auto max-h-[calc(85vh+var(--gryt-drawer-bleed))] w-full border-t px-5 pt-5 pb-[calc(1.25rem+var(--gryt-drawer-bleed))] data-starting-style:translate-y-full data-ending-style:translate-y-full"
};

export type DrawerPopupProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Popup
> & {
  side?: DrawerSide;
};

const Popup = forwardRef<HTMLDivElement, DrawerPopupProps>(function DrawerPopup(
  { className, side = "right", ...props },
  ref
) {
  return (
    <BaseDialog.Popup
      ref={ref}
      className={cn(
        "gryt-drawer fixed z-50 flex flex-col gap-4 border-gryt-border bg-gryt-surface text-gryt-text",
        "transition-transform duration-(--gryt-dur-spring-soft) ease-spring motion-reduce:transition-none",
        sideStyles[side],
        className
      )}
      {...props}
    />
  );
});

const Backdrop = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>
>(function DrawerBackdrop({ className, ...props }, ref) {
  return (
    <BaseDialog.Backdrop
      ref={ref}
      className={cn(
        "gryt-drawer-backdrop fixed inset-0 min-h-dvh bg-black/60",
        "transition-opacity duration-(--gryt-dur-spring-soft) ease-spring motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  );
});

export const Drawer = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Close: BaseDialog.Close,
  Title: BaseDialog.Title,
  Description: BaseDialog.Description,
  Backdrop,
  Popup
};
