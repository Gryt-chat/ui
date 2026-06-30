import MuiIconButton from "@mui/material/IconButton";
import type { IconButtonProps as MuiIconButtonProps } from "@mui/material/IconButton";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export interface IconButtonProps extends MuiIconButtonProps {
  tone?: "primary" | "neutral" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ className, tone = "neutral", ...props }, ref) {
    return (
      <MuiIconButton
        ref={ref}
        className={cn(
          "gryt-icon-button",
          tone === "primary" && "text-gryt-accent hover:bg-gryt-accent/10",
          tone === "neutral" &&
            "text-gryt-muted hover:bg-white/8 hover:text-gryt-text",
          tone === "danger" && "text-gryt-danger hover:bg-red-300/10",
          className
        )}
        {...props}
      />
    );
  }
);
