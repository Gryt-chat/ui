import MuiDivider from "@mui/material/Divider";
import type { DividerProps as MuiDividerProps } from "@mui/material/Divider";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type DividerProps = MuiDividerProps;

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { className, ...props },
  ref
) {
  return (
    <MuiDivider
      ref={ref}
      className={cn("gryt-divider", className)}
      {...props}
    />
  );
});
