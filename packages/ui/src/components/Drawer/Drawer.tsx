import MuiDrawer from "@mui/material/Drawer";
import type { DrawerProps as MuiDrawerProps } from "@mui/material/Drawer";
import { cn } from "../utils/cn";

export type DrawerProps = MuiDrawerProps;

export function Drawer({ PaperProps, ...props }: DrawerProps) {
  return (
    <MuiDrawer
      PaperProps={{
        ...PaperProps,
        className: cn("gryt-drawer", PaperProps?.className)
      }}
      {...props}
    />
  );
}
