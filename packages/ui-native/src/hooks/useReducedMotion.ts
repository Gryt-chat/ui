import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * The web gets this from `motion-safe:`. React Native has the same setting and no way to
 * express it in a style, so it is read and subscribed to. Assumes motion is allowed.
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
