import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "gryt-card rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface text-gryt-text",
        className
      )}
      {...props}
    />
  );
});

export interface CardHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  subheader?: ReactNode;
}

export function CardHeader({
  children,
  className,
  subheader,
  title,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("gryt-card-header flex flex-col gap-1 p-4", className)}
      {...props}
    >
      {title ? (
        <span className="text-base font-semibold text-gryt-text">{title}</span>
      ) : null}
      {subheader ? (
        <span className="text-sm text-gryt-muted">{subheader}</span>
      ) : null}
      {children}
    </div>
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "gryt-card-content px-4 pb-4 text-sm text-gryt-muted",
        className
      )}
      {...props}
    />
  );
}

export function CardActions({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "gryt-card-actions flex items-center gap-2 px-4 pb-4",
        className
      )}
      {...props}
    />
  );
}
