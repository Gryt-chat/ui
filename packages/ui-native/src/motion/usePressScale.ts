/* The press half of the web's hover/active pair.
 *
 * `hover:scale-[1.03]` has no meaning on a touch screen and is deliberately
 * not emulated — there is no state between "not touching" and "touching", so
 * inventing one would be a difference from the web rather than a match to it.
 * The `active:` half ports exactly.
 */
import { useCallback } from "react";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { springy } from "./motion";

export interface PressScale {
  onPressIn: () => void;
  onPressOut: () => void;
  style: ReturnType<typeof useAnimatedStyle>;
}

/**
 * Scale to `pressed` while held, spring back to 1 on release.
 *
 * Returns handlers to spread onto a Pressable and an animated style for the
 * view that should scale. Both directions use the overshooting curve, so the
 * release settles with the same texture the web has.
 */
export function usePressScale(pressed: number, disabled?: boolean): PressScale {
  const scale = useSharedValue(1);

  // A Reanimated shared value is mutated by design — assigning `.value` is how
  // an animation is started, and the object identity never changes. The
  // immutability rule reads it as a mutated binding, which is what the rule is
  // for everywhere else and a false positive here. Scoped to these two
  // assignments rather than the file.
  /* eslint-disable react-hooks/immutability */
  const onPressIn = useCallback(() => {
    if (disabled) return;
    scale.value = springy(pressed);
  }, [disabled, pressed, scale]);

  const onPressOut = useCallback(() => {
    if (disabled) return;
    scale.value = springy(1);
  }, [disabled, scale]);
  /* eslint-enable react-hooks/immutability */

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return { onPressIn, onPressOut, style };
}
