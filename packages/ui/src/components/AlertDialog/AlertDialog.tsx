import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type AlertDialogPopupProps = ComponentPropsWithoutRef<
  typeof BaseAlertDialog.Popup
>;

/**
 * A dialog you cannot dismiss by accident — for "Leave this server?".
 *
 * Styled identically to Dialog on purpose; the difference is behaviour, not
 * looks. Escape and clicking the backdrop do nothing here, so answering
 * requires picking one of the buttons. Using this where Dialog belongs is worse
 * than not having it, because it takes away the escape people expect.
 */
const Popup = forwardRef<HTMLDivElement, AlertDialogPopupProps>(
  function AlertDialogPopup({ className, ...props }, ref) {
    return (
      <BaseAlertDialog.Popup
        ref={ref}
        className={cn(
          "gryt-alert-dialog fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "flex w-96 max-w-[calc(100vw-3rem)] flex-col gap-4",
          "rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-5 text-gryt-text",
          "outline-none",
          "transition-[opacity,scale] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
          "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
          className
        )}
        {...props}
      />
    );
  }
);

const Backdrop = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseAlertDialog.Backdrop>
>(function AlertDialogBackdrop({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Backdrop
      ref={ref}
      className={cn(
        "gryt-alert-dialog-backdrop fixed inset-0 z-50 min-h-dvh bg-black/60",
        "backdrop-blur-(--gryt-backdrop-blur)",
        "transition-opacity duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
        "data-starting-style:opacity-0 data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  );
});

const Title = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<typeof BaseAlertDialog.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Title
      ref={ref}
      className={cn(
        "gryt-alert-dialog-title text-lg font-semibold text-gryt-text",
        className
      )}
      {...props}
    />
  );
});

const Description = forwardRef<
  HTMLParagraphElement,
  ComponentPropsWithoutRef<typeof BaseAlertDialog.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <BaseAlertDialog.Description
      ref={ref}
      className={cn(
        "gryt-alert-dialog-description text-sm leading-6 text-gryt-muted",
        className
      )}
      {...props}
    />
  );
});

export const AlertDialog = {
  Root: BaseAlertDialog.Root,
  Trigger: BaseAlertDialog.Trigger,
  Portal: BaseAlertDialog.Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Close: BaseAlertDialog.Close
};
