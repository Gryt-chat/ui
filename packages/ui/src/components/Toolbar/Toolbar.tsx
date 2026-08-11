import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type ToolbarRootProps = ComponentPropsWithoutRef<
  typeof BaseToolbar.Root
>;

/**
 * A strip of controls that share one tab stop.
 *
 * The point is the keyboard model: Tab enters the toolbar once and the arrow
 * keys move between its buttons, so a call bar with eight controls costs one
 * stop on the way to the message box instead of eight.
 */
const Root = forwardRef<HTMLDivElement, ToolbarRootProps>(function Toolbar(
  { className, ...props },
  ref
) {
  return (
    <BaseToolbar.Root
      ref={ref}
      className={cn(
        "gryt-toolbar flex items-center gap-1",
        "rounded-(--gryt-radius-full) border border-gryt-border bg-gryt-surface p-1",
        className
      )}
      {...props}
    />
  );
});

const Separator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseToolbar.Separator>
>(function ToolbarSeparator({ className, ...props }, ref) {
  return (
    <BaseToolbar.Separator
      ref={ref}
      className={cn("gryt-toolbar-separator mx-1 h-6 w-px bg-gryt-border", className)}
      {...props}
    />
  );
});

export const Toolbar = {
  Root,
  Group: BaseToolbar.Group,
  Button: BaseToolbar.Button,
  Link: BaseToolbar.Link,
  Input: BaseToolbar.Input,
  Separator
};
