import MuiRadio from "@mui/material/Radio";
import type { RadioProps as MuiRadioProps } from "@mui/material/Radio";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type RadioProps = MuiRadioProps;

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { className, ...props },
  ref
) {
  return (
    <MuiRadio ref={ref} className={cn("gryt-radio", className)} {...props} />
  );
});
