import MuiSlider from "@mui/material/Slider";
import type { SliderProps as MuiSliderProps } from "@mui/material/Slider";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type SliderProps = MuiSliderProps;

export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  { className, ...props },
  ref
) {
  return (
    <MuiSlider ref={ref} className={cn("gryt-slider", className)} {...props} />
  );
});
