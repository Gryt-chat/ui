import MuiTab from "@mui/material/Tab";
import MuiTabs from "@mui/material/Tabs";
import type { TabProps as MuiTabProps } from "@mui/material/Tab";
import type { TabsProps as MuiTabsProps } from "@mui/material/Tabs";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type TabsProps = MuiTabsProps;
export type TabProps = MuiTabProps;

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, ...props },
  ref
) {
  return (
    <MuiTabs ref={ref} className={cn("gryt-tabs", className)} {...props} />
  );
});

export const Tab = forwardRef<HTMLDivElement, TabProps>(function Tab(
  { className, ...props },
  ref
) {
  return <MuiTab ref={ref} className={cn("gryt-tab", className)} {...props} />;
});
