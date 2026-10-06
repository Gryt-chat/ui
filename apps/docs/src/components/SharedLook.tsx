import { eggAvatarDataUri, owlAvatarDataUri } from "@gryt/owl";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { sharedEgg, sharedOwl } from "../lib/sharedLook";

/** The owl a shared link names, above the page that explains owls (GRYT-1673). Nothing without one. */
export function SharedOwlHeader() {
  const [params] = useSearchParams();
  const owl = useMemo(() => sharedOwl(params), [params]);
  if (!owl) return null;
  return (
    <figure className="not-prose mb-(--space-lg) flex items-center gap-6 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-5">
      <img
        alt={`${owl.name}'s owl`}
        className="h-32 w-32 shrink-0 rounded-[32px]"
        height={128}
        src={owlAvatarDataUri(owl.seed, { size: 256, ...owl.options })}
        width={128}
      />
      <figcaption className="flex min-w-0 flex-col gap-1">
        <span className="text-[length:var(--text-lg)] font-bold text-gryt-text [overflow-wrap:anywhere]">{owl.name}&rsquo;s owl</span>
        <span className="text-sm text-gryt-muted">
          {owl.worn
            ? "Somebody dressed this owl up in Gryt and shared it. Yours is in Settings, under your picture."
            : "The owl this name draws in Gryt, before anybody dresses it up."}
        </span>
      </figcaption>
    </figure>
  );
}

/** The egg a shared link names, above the page that explains eggs. */
export function SharedEggHeader() {
  const [params] = useSearchParams();
  const seed = useMemo(() => sharedEgg(params), [params]);
  if (!seed) return null;
  return (
    <figure className="not-prose mb-(--space-lg) flex items-center gap-6 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-5">
      <img alt={`The egg for ${seed}`} className="h-32 w-32 shrink-0 rounded-[32px]" height={128} src={eggAvatarDataUri(seed, { size: 256 })} width={128} />
      <figcaption className="flex min-w-0 flex-col gap-1">
        <span className="text-[length:var(--text-lg)] font-bold text-gryt-text [overflow-wrap:anywhere]">{seed}</span>
        <span className="text-sm text-gryt-muted">The egg this name hatches in Gryt, for a group or a server without a picture.</span>
      </figcaption>
    </figure>
  );
}
