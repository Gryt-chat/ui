import { Separator } from "@base-ui/react/separator";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface DividerProps
  extends Omit<ComponentPropsWithoutRef<typeof Separator>, "className"> {
  className?: string;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  function Divider({ className, orientation = "horizontal", ...props }, ref) {
    return (
      <Separator
        ref={ref}
        orientation={orientation}
        className={cn(
          "gryt-divider bg-gryt-border",
          orientation === "vertical" ? "h-full w-px" : "h-px w-full",
          className
        )}
        {...props}
      />
    );
  }
);
