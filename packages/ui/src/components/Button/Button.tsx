import MuiButton from "@mui/material/Button";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

type ButtonSize = MuiButtonProps["size"] | "xsmall";

const buttonToneStyles: Record<
  NonNullable<ButtonProps["tone"]>,
  SxProps<Theme>
> = {
  primary: {
    backgroundColor: "var(--gryt-accent)",
    color: "#141126",
    "&:hover": {
      backgroundColor: "var(--gryt-accent-light)"
    }
  },
  secondary: {
    backgroundColor: "var(--gryt-secondary)",
    color: "#07131c",
    "&:hover": {
      backgroundColor: "#bae6fd"
    }
  },
  neutral: {
    backgroundColor: "var(--gryt-surface-raised)",
    color: "var(--gryt-text)",
    "&:hover": {
      backgroundColor: "#334155"
    }
  },
  danger: {
    backgroundColor: "var(--gryt-danger)",
    color: "#250b0b",
    "&:hover": {
      backgroundColor: "#fca5a5"
    }
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--gryt-muted)",
    "&:hover": {
      backgroundColor: "rgb(255 255 255 / 0.08)",
      color: "var(--gryt-text)"
    }
  }
};

export interface ButtonProps extends Omit<MuiButtonProps, "size"> {
  tone?: "primary" | "secondary" | "neutral" | "danger" | "ghost";
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      size = "medium",
      sx,
      tone = "primary",
      variant = "contained",
      ...props
    },
    ref
  ) {
    const muiSize = size === "xsmall" ? "small" : size;

    return (
      <MuiButton
        ref={ref}
        size={muiSize}
        variant={variant}
        className={cn(
          "gryt-button",
          size === "xsmall" && "min-h-8 px-3 text-xs",
          className
        )}
        sx={[
          buttonToneStyles[tone],
          size === "xsmall" && {
            minHeight: 32,
            paddingInline: 12,
            fontSize: "0.75rem"
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
        ]}
        {...props}
      />
    );
  }
);
