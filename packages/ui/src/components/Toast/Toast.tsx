import { Toast as BaseToast } from "@base-ui/react/toast";
import { X } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type ToastSeverity =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

/**
 * Severity is a tinted edge and a wash, not a filled card.
 *
 * Alert tints its whole surface, and that is right for something sitting in
 * the page where it has to compete with the content around it. A toast is
 * already floating over everything with nothing to compete with, so the same
 * treatment reads as shouting. The border carries the colour and the fill stays
 * near the surface underneath.
 */
const severityStyles: Record<ToastSeverity, string> = {
  neutral: "border-white/8 bg-gryt-surface",
  info: "border-gryt-secondary/30 bg-gryt-secondary/8",
  success: "border-gryt-success/30 bg-gryt-success/8",
  warning: "border-gryt-warning/30 bg-gryt-warning/8",
  danger: "border-gryt-danger/30 bg-gryt-danger/8"
};

export interface ToastRootProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseToast.Root>, "className"> {
  severity?: ToastSeverity;
  className?: string;
}
export type ToastViewportProps = ComponentPropsWithoutRef<
  typeof BaseToast.Viewport
>;

/**
 * Transient notice: connection lost, invite copied, message failed to send.
 *
 * design.md's stance is silent success — most things that worked should say
 * nothing. This is for the cases where the user is not looking at the thing
 * that changed, which in a voice client is most of them.
 */
const Viewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport({ className, ...props }, ref) {
    return (
      <BaseToast.Viewport
        ref={ref}
        className={cn(
          "gryt-toast-viewport fixed right-4 bottom-4 z-50 flex w-[min(22rem,calc(100vw-2rem))]",
          "flex-col gap-2 outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

const Root = forwardRef<HTMLDivElement, ToastRootProps>(function ToastRoot(
  { className, severity = "neutral", ...props },
  ref
) {
  return (
    <BaseToast.Root
      ref={ref}
      className={cn(
        "gryt-toast relative flex flex-col p-3 pr-9",
        // Not popupSurface. That border is --gryt-border, a solid slate line
        // that is right for a menu anchored to the thing that opened it and too
        // heavy for a card floating in the corner with nothing behind it. A
        // white hairline separates it from the page without drawing a box
        // around it.
        "rounded-(--gryt-radius-xl) border text-gryt-text",
        severityStyles[severity],
        // Swiping is a pointer gesture, so the toast follows the finger
        // through Base UI's swipe variables before it animates out.
        "transition-[opacity,transform] duration-(--gryt-dur-spring) ease-spring",
        "data-starting-style:translate-y-2 data-starting-style:opacity-0",
        "data-ending-style:translate-y-2 data-ending-style:opacity-0",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
});

const Title = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseToast.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return (
    <BaseToast.Title
      ref={ref}
      className={cn(
        "gryt-toast-title text-sm font-semibold text-gryt-text",
        className
      )}
      {...props}
    />
  );
});

const Description = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseToast.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <BaseToast.Description
      ref={ref}
      className={cn(
        "gryt-toast-description mt-0.5 text-sm leading-6 text-gryt-muted",
        className
      )}
      {...props}
    />
  );
});

const Close = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof BaseToast.Close>
>(function ToastClose({ className, children, ...props }, ref) {
  return (
    <BaseToast.Close
      ref={ref}
      aria-label="Close"
      className={cn(
        "gryt-toast-close absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center",
        "rounded-(--gryt-radius-full) border-0 bg-transparent text-gryt-muted",
        "transition-colors hover:bg-white/8 hover:text-gryt-text motion-reduce:transition-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
        className
      )}
      {...props}
    >
      {children ?? <X size={14} weight="bold" />}
    </BaseToast.Close>
  );
});

const Action = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof BaseToast.Action>
>(function ToastAction({ className, ...props }, ref) {
  return (
    <BaseToast.Action
      ref={ref}
      className={cn(
        "gryt-toast-action mt-2 self-start rounded-(--gryt-radius-full) border-0",
        "bg-gryt-accent px-3 py-1.5 text-sm font-medium text-gryt-on-accent",
        "transition-[scale] duration-(--gryt-dur-spring) ease-spring",
        "motion-safe:hover:scale-[1.04] motion-safe:active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
        className
      )}
      {...props}
    />
  );
});

export const Toast = {
  Provider: BaseToast.Provider,
  Portal: BaseToast.Portal,
  Viewport,
  Root,
  Title,
  Description,
  Close,
  Action
};

/**
 * Raise a toast without importing Base UI directly.
 *
 * Taken off the namespace rather than re-exported from "@base-ui/react/toast":
 * at that path the hook is a type-only declaration, and re-exporting it as a
 * value fails under isolatedModules. The value lives on the parts namespace.
 */
export const useToastManager = BaseToast.useToastManager;
