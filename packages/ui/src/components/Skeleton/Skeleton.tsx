import MuiSkeleton from "@mui/material/Skeleton";
import type { SkeletonProps as MuiSkeletonProps } from "@mui/material/Skeleton";
import { cn } from "../utils/cn";

export type SkeletonProps = MuiSkeletonProps;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <MuiSkeleton className={cn("gryt-skeleton", className)} {...props} />;
}
