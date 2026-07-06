import MuiIconButton from "@mui/material/IconButton";
import type { IconButtonProps as MuiIconButtonProps } from "@mui/material/IconButton";
import type { SxProps, Theme } from "@mui/material/styles";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

type IconButtonSize = MuiIconButtonProps["size"] | "xsmall";

const iconButtonToneStyles: Record<
  NonNullable<IconButtonProps["tone"]>,
  SxProps<Theme>
> = {
  primary: {
    color: "var(--gryt-accent)",
    "&:hover": { backgroundColor: "rgb(150 143 248 / 0.1)" }
  },
  secondary: {
    color: "var(--gryt-secondary)",
    "&:hover": { backgroundColor: "rgb(125 211 252 / 0.1)" }
  },
  neutral: {
    color: "var(--gryt-muted)",
    "&:hover": {
      backgroundColor: "rgb(255 255 255 / 0.08)",
      color: "var(--gryt-text)"
    }
  },
  danger: {
    color: "var(--gryt-danger)",
    "&:hover": { backgroundColor: "rgb(248 113 113 / 0.1)" }
  },
  ghost: {
    color: "var(--gryt-muted)",
    "&:hover": {
      backgroundColor: "rgb(255 255 255 / 0.08)",
      color: "var(--gryt-text)"
    }
  }
};

export interface IconButtonProps extends Omit<MuiIconButtonProps, "size"> {
  tone?: "primary" | "secondary" | "neutral" | "danger" | "ghost";
  size?: IconButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, size = "medium", sx, tone = "neutral", ...props },
    ref
  ) {
    const muiSize = size === "xsmall" ? "small" : size;

    return (
      <MuiIconButton
        ref={ref}
        size={muiSize}
        className={cn("gryt-icon-button", className)}
        sx={[
          iconButtonToneStyles[tone],
          size === "xsmall" && {
            height: 32,
            width: 32,
            padding: 0.5
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : [])
        ]}
        {...props}
      />
    );
  }
);
