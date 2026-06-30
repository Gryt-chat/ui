import MuiMenu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import type { MenuProps as MuiMenuProps } from "@mui/material/Menu";
import type { MenuItemProps as MuiMenuItemProps } from "@mui/material/MenuItem";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type MenuProps = MuiMenuProps;
export type MenuItemProps = MuiMenuItemProps;

export function Menu({ PaperProps, ...props }: MenuProps) {
  return (
    <MuiMenu
      PaperProps={{
        ...PaperProps,
        className: cn("gryt-menu", PaperProps?.className)
      }}
      {...props}
    />
  );
}

export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  function MenuItem({ className, ...props }, ref) {
    return (
      <MuiMenuItem
        ref={ref}
        className={cn("gryt-menu-item", className)}
        {...props}
      />
    );
  }
);
