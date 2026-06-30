import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export interface ButtonProps extends MuiButtonProps {
  tone?: "primary" | "neutral" | "danger";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, tone = "primary", variant = "contained", ...props },
    ref
  ) {
    return (
      <MuiButton
        ref={ref}
        variant={variant}
        className={cn(
          "gryt-button",
          tone === "primary" &&
            "bg-gryt-accent text-[#141126] hover:bg-gryt-accent-light",
          tone === "neutral" &&
            "bg-gryt-surface-raised text-gryt-text hover:bg-slate-700",
          tone === "danger" && "bg-gryt-danger text-[#250b0b] hover:bg-red-300",
          className
        )}
        {...props}
      />
    );
  }
);
