import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { eggAvatarDataUri, owlAvatarDataUri } from "@gryt/owl";
import { forwardRef, useMemo } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";

export type AvatarSize = "small" | "medium" | "large";

const sizeStyles: Record<AvatarSize, string> = {
  small: "h-8 w-8 text-xs",
  medium: "h-10 w-10 text-sm",
  large: "h-12 w-12 text-base"
};

// The intrinsic size of the generated SVG, which CSS then overrides. One number
// for every avatar size on purpose: it is vector, so nothing is gained by
// matching the box, and a single value means one memo entry per person rather
// than one per person per size.
const OWL_SIZE = 256;

export interface AvatarProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseAvatar.Root>,
  "className"
> {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  /**
   * Draws this person's owl, from @gryt/owl.
   *
   * Used when there is no `src`, and also when `src` is given and fails to
   * load — somebody whose uploaded avatar 404s should get their own owl back
   * rather than a letter.
   *
   * Pass `avatarSeed(nickname)` rather than the nickname itself. The two
   * differ for anyone whose name is not already lower case, and an avatar
   * drawn from one seed beside a voice tile tinted from the other is the bug
   * that rule exists to prevent.
   */
  seed?: string;
  /**
   * Draws this server's icon, from @gryt/owl's eggs. The server's name is the
   * seed, so renaming it changes the icon.
   *
   * A server is not a person and is not drawn as one, so this is a separate
   * prop rather than a flag on `seed` — passing the wrong one gives the wrong
   * kind of thing rather than the same thing in another colour.
   *
   * The corner is the caller's. This component clips to whatever radius its
   * className sets, and the SVG is drawn square, so a server rail asking for
   * `rounded-(--gryt-radius-md)` gets the theme's radius in pixels rather than
   * a fraction of the box baked into the drawing.
   */
  serverSeed?: string;
  // Shown while the image loads and if it fails. Falls back to children, which
  // is how the old MUI-based Avatar was called: <Avatar>G</Avatar>.
  fallback?: ReactNode;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    alt,
    children,
    className,
    fallback,
    seed,
    serverSeed,
    size = "medium",
    src,
    ...props
  },
  ref
) {
  // Memoised because avatars render in member lists that repaint often, and
  // the seed never changes under a row.
  const owl = useMemo(
    () => (seed ? owlAvatarDataUri(seed, { size: OWL_SIZE }) : undefined),
    [seed]
  );

  // No cornerRadius: the root clips, so the corner is whatever the theme's
  // radius is in pixels rather than a fraction of the drawing.
  const egg = useMemo(
    () =>
      serverSeed ? eggAvatarDataUri(serverSeed, { size: OWL_SIZE }) : undefined,
    [serverSeed]
  );

  // A person wins a server, on the grounds that passing both is a caller bug
  // and drawing the more specific thing makes it the more obvious one.
  const generated = owl ?? egg;

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
      {/* The owl goes here rather than through BaseAvatar.Image, and that is
          the whole of what "no src" means: the fallback is the only thing
          rendered, so it shows immediately. Base UI's Image renders nothing
          until the browser reports the image loaded, which is right for a URL
          over the network and pointless for a data URI that is already in
          memory — it would blank the avatar for a frame every time.

          It also gets the broken-upload case for free: an avatar URL that 404s
          leaves Base UI on the fallback, which is this person's owl. */}
      <BaseAvatar.Fallback className="flex h-full w-full items-center justify-center">
        {generated ? (
          <img
            src={generated}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          (fallback ?? children)
        )}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
});
