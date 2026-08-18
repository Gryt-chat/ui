import { useCallback, useState } from "react";
import { Dimensions, type View } from "react-native";

import type { AnchorRect } from "./placePopup";

/**
 * Measures a trigger in window coordinates.
 *
 * `measureInWindow` is asynchronous and its callback can fire after the popup
 * has closed again, so a stale result is dropped rather than applied.
 */
export function useAnchorMeasure() {
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);

  const measure = useCallback((node: View | null) => {
    if (!node) {
      setAnchor(null);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  }, []);

  return { anchor, measure, clear: useCallback(() => setAnchor(null), []) };
}

export function screenSize() {
  const { width, height } = Dimensions.get("window");
  return { width, height };
}
