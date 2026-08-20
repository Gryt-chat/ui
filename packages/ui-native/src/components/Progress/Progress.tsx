import { useEffect, useState } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { grytDurations } from "@gryt/theme";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useTheme } from "../../theme";

export interface ProgressProps {
  /** 0 to 100. Leave undefined for an indeterminate bar. */
  value?: number;
  tone?: "accent" | "success" | "danger" | "warning";
  style?: StyleProp<ViewStyle>;
}

/** How much of the track the sweeping bar covers. Matches the web's `width: 40%`. */
const SWEEP_FRACTION = 0.4;

/**
 * Determinate travel follows the web deliberately: 300ms on ease-out rather
 * than the spring. A progress bar is a reading, and the spring's 12% overshoot
 * on a jump to 100% runs past the end of the track and comes back — which reads
 * as the job finishing, unfinishing, then finishing.
 *
 * Indeterminate is a partial bar sweeping the track on a loop, at
 * `grytDurations.sweep`, from the same description the web's keyframe follows.
 * Both were empty until GRYT-382: the web passed `value={null}` to Base UI,
 * which leaves the indicator's width unset, and nothing styled it. This file
 * previously called that a parity exception, which it was not — both platforms
 * were missing the same feature, and writing it down as one-sided is what
 * closed the question for a while.
 */
export function Progress({ value, tone = "accent", style }: ProgressProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const indeterminate = value === undefined;
  const clamped = indeterminate ? 0 : Math.max(0, Math.min(100, value));

  // Measured rather than expressed as a percentage. The web animates
  // `translateX` in percentages of the bar's own width, which React Native does
  // not accept in a transform, so the same travel is computed in points from
  // the track's own layout.
  const [trackWidth, setTrackWidth] = useState(0);
  const offset = useSharedValue(0);

  const barWidth = trackWidth * SWEEP_FRACTION;

  useEffect(() => {
    if (!indeterminate || reducedMotion || trackWidth === 0) return;

    // Starts fully off the left edge and ends fully off the right. Leaving the
    // track completely at both ends is what makes the loop seam invisible — a
    // bar that restarts while still on screen flicks backwards once per pass.
    // eslint-disable-next-line react-hooks/immutability
    offset.value = -barWidth;
    // eslint-disable-next-line react-hooks/immutability
    offset.value = withRepeat(
      withTiming(trackWidth, {
        duration: grytDurations.sweep,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, [indeterminate, reducedMotion, trackWidth, barWidth, offset]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width;
    // Guarded because onLayout fires on every re-render in some trees, and
    // setting state unconditionally from it is an infinite loop.
    setTrackWidth((prev) => (prev === next ? prev : next));
  };

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={
        indeterminate ? undefined : { now: clamped, min: 0, max: 100 }
      }
      onLayout={indeterminate ? onLayout : undefined}
      style={[
        {
          height: 6,
          borderRadius: theme.radius.full,
          backgroundColor: theme.scales.neutral[3],
          overflow: "hidden",
        },
        style,
      ]}
    >
      {indeterminate ? (
        <Animated.View
          style={[
            {
              // Full width and dimmed under reduce-motion rather than a frozen
              // partial bar, which reads as a job that stalled 40% in. Matches
              // what the web's `prefers-reduced-motion` rule does.
              width: reducedMotion ? "100%" : barWidth,
              opacity: reducedMotion ? 0.4 : 1,
              height: "100%",
              borderRadius: theme.radius.full,
              backgroundColor: theme.scales[tone][8],
            },
            reducedMotion ? null : sweepStyle,
          ]}
        />
      ) : (
        <View
          style={{
            width: `${clamped}%`,
            height: "100%",
            borderRadius: theme.radius.full,
            backgroundColor: theme.scales[tone][8],
          }}
        />
      )}
    </View>
  );
}
