import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type DrawerSide = "left" | "right" | "top" | "bottom";

// Base UI has no drawer part. A drawer is a dialog pinned to an edge, and it
// wants the same focus trap, escape handling and scroll lock, so it is built
// on Dialog rather than reinvented.
const sideStyles: Record<DrawerSide, string> = {
  left: "inset-y-0 left-0 h-full w-80 max-w-[85vw] border-r data-starting-style:-translate-x-full data-ending-style:-translate-x-full",
  right:
    "inset-y-0 right-0 h-full w-80 max-w-[85vw] border-l data-starting-style:translate-x-full data-ending-style:translate-x-full",
  top: "inset-x-0 top-0 h-auto max-h-[85vh] w-full border-b data-starting-style:-translate-y-full data-ending-style:-translate-y-full",
  bottom:
    "inset-x-0 bottom-0 h-auto max-h-[85vh] w-full border-t data-starting-style:translate-y-full data-ending-style:translate-y-full"
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
        "gryt-drawer fixed z-50 flex flex-col gap-4 border-gryt-border bg-gryt-surface p-5 text-gryt-text",
        "transition-transform duration-(--gryt-dur-spring-soft) ease-spring-soft motion-reduce:transition-none",
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
        "transition-opacity duration-(--gryt-dur-spring-soft) ease-spring-soft motion-reduce:transition-none",
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
