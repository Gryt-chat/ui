import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import type { CircularProgressProps } from "@mui/material/CircularProgress";
import type { LinearProgressProps } from "@mui/material/LinearProgress";
import { cn } from "../utils/cn";

export function Spinner({ className, ...props }: CircularProgressProps) {
  return (
    <CircularProgress className={cn("gryt-spinner", className)} {...props} />
  );
}

export function Progress({ className, ...props }: LinearProgressProps) {
  return (
    <LinearProgress className={cn("gryt-progress", className)} {...props} />
  );
}
