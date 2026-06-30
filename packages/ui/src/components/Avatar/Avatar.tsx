import MuiAvatar from "@mui/material/Avatar";
import type { AvatarProps as MuiAvatarProps } from "@mui/material/Avatar";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type AvatarProps = MuiAvatarProps;

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { className, ...props },
  ref
) {
  return (
    <MuiAvatar ref={ref} className={cn("gryt-avatar", className)} {...props} />
  );
});
