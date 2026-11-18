import { forwardRef } from "react";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export type ListRowTone = "accent" | "neutral" | "success" | "danger";

const tileTone: Record<ListRowTone, string> = {
  accent: "bg-gryt-accent-3 text-gryt-accent-11",
  neutral: "bg-gryt-surface-hover text-gryt-text",
  success: "bg-gryt-success-3 text-gryt-success-11",
  danger: "bg-gryt-danger-3 text-gryt-danger-11"
};

export type ListGroupProps = HTMLAttributes<HTMLDivElement>;

/** A rounded group of rows with hairlines between them, like a settings section. */
export const ListGroup = forwardRef<HTMLDivElement, ListGroupProps>(
  function ListGroup({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "gryt-list-group overflow-hidden rounded-(--gryt-radius-surface) border border-gryt-border bg-gryt-surface",
          "[&>*+*]:border-t [&>*+*]:border-gryt-surface-hover",
          className
        )}
        {...props}
      />
    );
  }
);

interface RowContent {
  /** An icon, drawn in a rounded tile at the start. */
  icon?: ReactNode;
  iconTone?: ListRowTone;
  title: ReactNode;
  /** A second, quieter line: the current value, not an explanation. */
  description?: ReactNode;
  /** A button, a badge or a chevron at the end. */
  trailing?: ReactNode;
}

export type ListRowProps = RowContent &
  Omit<HTMLAttributes<HTMLDivElement>, "title"> & { href?: undefined };
export type ListRowLinkProps = RowContent &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "title"> & { href: string };

const rowClass =
  "gryt-list-row flex min-h-15 items-center gap-3.5 px-4 py-3 text-inherit no-underline";

function Content({
  icon,
  iconTone = "accent",
  title,
  description,
  trailing
}: RowContent) {
  return (
    <>
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-(--gryt-radius-md) [&>svg]:size-4.5",
            tileTone[iconTone]
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-gryt-text">{title}</span>
        {description && (
          <span className="text-[13px] text-gryt-muted">{description}</span>
        )}
      </span>
      {trailing}
    </>
  );
}

/** One row of a ListGroup. Give it an href and the whole row becomes the link. */
export const ListRow = forwardRef<
  HTMLDivElement | HTMLAnchorElement,
  ListRowProps | ListRowLinkProps
>(function ListRow(
  { icon, iconTone, title, description, trailing, className, ...props },
  ref
) {
  const content = (
    <Content {...{ icon, iconTone, title, description, trailing }} />
  );
  if (typeof props.href === "string") {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(
          rowClass,
          "transition-colors duration-(--gryt-dur-fast) hover:bg-gryt-surface-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gryt-accent-light",
          className
        )}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(rowClass, className)}
      {...(props as HTMLAttributes<HTMLDivElement>)}
    >
      {content}
    </div>
  );
});
