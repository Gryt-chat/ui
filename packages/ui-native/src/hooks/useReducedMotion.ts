import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * The web gets this from `motion-safe:`, which Tailwind compiles to a
 * `prefers-reduced-motion` media query. React Native has the same setting and no
 * way to express it in a style, so it has to be read and subscribed to.
 *
 * Assumes motion is allowed until told otherwise, which matches the web: the
 * media query only matches once the OS says to reduce.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (!cancelled) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return reduced;
}
