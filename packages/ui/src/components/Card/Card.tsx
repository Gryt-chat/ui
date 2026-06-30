import MuiCard from "@mui/material/Card";
import MuiCardActions from "@mui/material/CardActions";
import MuiCardContent from "@mui/material/CardContent";
import MuiCardHeader from "@mui/material/CardHeader";
import type { CardProps as MuiCardProps } from "@mui/material/Card";
import type {
  CardActionsProps,
  CardContentProps,
  CardHeaderProps
} from "@mui/material";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type CardProps = MuiCardProps;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref
) {
  return (
    <MuiCard ref={ref} className={cn("gryt-card", className)} {...props} />
  );
});

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <MuiCardHeader className={cn("gryt-card-header", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <MuiCardContent className={cn("gryt-card-content", className)} {...props} />
  );
}

export function CardActions({ className, ...props }: CardActionsProps) {
  return (
    <MuiCardActions className={cn("gryt-card-actions", className)} {...props} />
  );
}
