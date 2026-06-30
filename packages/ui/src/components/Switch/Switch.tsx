import MuiSwitch from "@mui/material/Switch";
import type { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type SwitchProps = MuiSwitchProps;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch({ className, ...props }, ref) {
    return (
      <MuiSwitch
        ref={ref}
        className={cn("gryt-switch", className)}
        {...props}
      />
    );
  }
);
