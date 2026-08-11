import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";

export type AvatarSize = "small" | "medium" | "large";

const sizeStyles: Record<AvatarSize, string> = {
  small: "h-8 w-8 text-xs",
  medium: "h-10 w-10 text-sm",
  large: "h-12 w-12 text-base"
};

export interface AvatarProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "className"> {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  // Shown while the image loads and if it fails. Falls back to children, which
  // is how the old MUI-based Avatar was called: <Avatar>G</Avatar>.
  fallback?: ReactNode;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { alt, children, className, fallback, size = "medium", src, ...props },
  ref
) {
  return (
    <BaseAvatar.Root
      ref={ref}
      className={cn(
        "gryt-avatar inline-flex shrink-0 items-center justify-center overflow-hidden align-middle select-none",
        "rounded-(--gryt-radius-full) bg-gryt-surface-raised font-medium text-gryt-text ring-1 ring-gryt-border",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        <BaseAvatar.Image
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : null}
      <BaseAvatar.Fallback className="flex h-full w-full items-center justify-center">
        {fallback ?? children}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
});
