import { useCallback, useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Matches a media query, safely on the server.
 *
 * Written here rather than taken from Base UI's `unstable-use-media-query`,
 * because a component library should not put an explicitly unstable export on
 * its public path.
 *
 * useSyncExternalStore rather than useState in an effect: matchMedia is an
 * external store, and reading it into state after mount means an extra render
 * on every consumer plus a frame where the answer is wrong. The server snapshot
 * is false so the first client paint agrees with the server's.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return noop();
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
