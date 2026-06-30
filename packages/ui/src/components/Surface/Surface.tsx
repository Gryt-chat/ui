import Paper from "@mui/material/Paper";
import type { PaperProps } from "@mui/material/Paper";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export interface SurfaceProps extends PaperProps {
  elevated?: boolean;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  function Surface({ className, elevated = false, ...props }, ref) {
    return (
      <Paper
        ref={ref}
        className={cn(
          "gryt-surface rounded-(--gryt-radius-lg)",
          elevated && "bg-gryt-surface-raised",
          className
        )}
        {...props}
      />
    );
  }
);
