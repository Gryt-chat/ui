import MuiTooltip from "@mui/material/Tooltip";
import type { TooltipProps as MuiTooltipProps } from "@mui/material/Tooltip";

export type TooltipProps = MuiTooltipProps;

export function Tooltip(props: TooltipProps) {
  return <MuiTooltip arrow enterDelay={350} {...props} />;
}
