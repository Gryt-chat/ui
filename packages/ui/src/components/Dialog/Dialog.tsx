import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { forwardRef, useState } from "react";
import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { mergeRefs, PortalContainerProvider } from "../utils/portalContainer";

// Base UI drives enter and exit animation through data-starting-style and
// data-ending-style, which it sets for one frame either side of the transition.
// The element has to carry the transition itself; there is no JS timing.
const motion =
  "transition-[opacity,scale,translate] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none";

export type DialogBackdropProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Backdrop
>;

const Backdrop = forwardRef<HTMLDivElement, DialogBackdropProps>(
  function DialogBackdrop({ className, ...props }, ref) {
    return (
      <BaseDialog.Backdrop
        ref={ref}
        className={cn(
          "gryt-dialog-backdrop fixed inset-0 min-h-dvh bg-black/60",
          "backdrop-blur-(--gryt-backdrop-blur)",
          motion,
          "data-starting-style:opacity-0 data-ending-style:opacity-0",
          className
        )}
        {...props}
      />
    );
  }
);

export type DialogPopupProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Popup
>;

// 32rem, not the 24rem this used to be. Radix Themes, which the client is
// migrating off, gives Dialog.Content 600px, so a dialog ported across to this
// one shrank by a third for no reason anybody chose — and the client had grown
// a w-[27rem]..w-[30rem] override on every dialog to claw some of it back.
// tailwind-merge means those overrides still win, so this only moves the ones
// that never said anything. AlertDialog carries the same width deliberately.
const Popup = forwardRef<HTMLDivElement, DialogPopupProps>(
  function DialogPopup({ className, children, ...props }, ref) {
    // Published so overlays inside this dialog portal into it rather than
    // alongside it (GRYT-242). State rather than a ref, because a ref does not
    // re-render and the children need the element on the pass after it exists.
    const [element, setElement] = useState<HTMLDivElement | null>(null);

    return (
      <BaseDialog.Popup
        ref={mergeRefs(ref, setElement)}
        className={cn(
          "gryt-dialog fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "flex w-[32rem] max-w-[calc(100vw-3rem)] flex-col gap-4",
          "rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-5 text-gryt-text",
          motion,
          "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
          className
        )}
        {...props}
      >
        <PortalContainerProvider container={element}>
          {children}
        </PortalContainerProvider>
      </BaseDialog.Popup>
    );
  }
);

export type DialogTitleProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Title
>;

const Title = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, ...props }, ref) {
    return (
      <BaseDialog.Title
        ref={ref}
        className={cn(
          "gryt-dialog-title text-base font-semibold text-gryt-text",
          className
        )}
        {...props}
      />
    );
  }
);

export type DialogDescriptionProps = ComponentPropsWithoutRef<
  typeof BaseDialog.Description
>;

const Description = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    return (
      <BaseDialog.Description
        ref={ref}
        className={cn(
          "gryt-dialog-description text-sm text-gryt-muted",
          className
        )}
        {...props}
      />
    );
  }
);

export type DialogFooterProps = HTMLAttributes<HTMLDivElement>;

// Replaces MUI's DialogActions. Base UI has no equivalent part, because it is
// a plain row of buttons and nothing about it needs behaviour.
const Footer = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "gryt-dialog-footer flex justify-end gap-3",
          className
        )}
        {...props}
      />
    );
  }
);

export const Dialog = {
  Root: BaseDialog.Root,
  Trigger: BaseDialog.Trigger,
  Portal: BaseDialog.Portal,
  Close: BaseDialog.Close,
  Backdrop,
  Popup,
  Title,
  Description,
  Footer
};
