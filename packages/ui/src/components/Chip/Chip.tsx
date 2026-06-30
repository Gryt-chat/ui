import MuiChip from "@mui/material/Chip";
import type { ChipProps as MuiChipProps } from "@mui/material/Chip";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type ChipProps = MuiChipProps;

export const Chip = forwardRef<HTMLDivElement, ChipProps>(function Chip(
  { className, ...props },
  ref
) {
  return (
    <MuiChip ref={ref} className={cn("gryt-chip", className)} {...props} />
  );
});
