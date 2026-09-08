import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { springy } from "../../motion";
import { toneRamp, useTheme, type ComponentTone } from "../../theme";
import { valueAt } from "./sliderValue";

export type SliderTone = Extract<
  ComponentTone,
  "primary" | "secondary" | "neutral" | "danger"
>;

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires once at the end of a drag, for anything expensive. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  tone?: SliderTone;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const TRACK_HEIGHT = 4;
const THUMB = 20;

/**
 * Dragging, on a surface where a drag might belong to something else. `activeOffsetX` is
 * the distinction: the pan claims the gesture once the finger has clearly gone sideways.
 */
export function Slider({
  value: controlled,
  defaultValue = 0,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  tone = "primary",
  style,
  accessibilityLabel
}: SliderProps) {
  const theme = useTheme();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  const [width, setWidth] = useState(0);
  const ramp = toneRamp(theme, tone);

  // The responder callbacks are created once and would close over the first render's
  // values, so the current ones live in refs, written in an effect rather than in render.
  const state = useRef({ width, value, min, max, step, disabled });
  const emit = useRef({ onValueChange, onValueCommit, controlled });
  /**
   * `active:scale-[0.94]` on the web. `hover:scale-[1.12]` has no touch
   * equivalent, so only the press half ports.
   */
  const thumbScale = useSharedValue(1);
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }]
  }));

  useEffect(() => {
    state.current = { width, value, min, max, step, disabled };
  }, [width, value, min, max, step, disabled]);

  useEffect(() => {
    emit.current = { onValueChange, onValueCommit, controlled };
  }, [onValueChange, onValueCommit, controlled]);

  const valueFromX = (x: number) => {
    const s = state.current;
    // Before layout there is no position to read, so hold what we have rather
    // than snapping to min.
    if (s.width <= 0) return s.value;
    return valueAt(x, s);
  };

  const apply = (next: number) => {
    if (emit.current.controlled === undefined) setUncontrolled(next);
    emit.current.onValueChange?.(next);
  };

  /**
   * Tap to seek, drag to scrub, and nothing if the finger goes down the page. Two gestures,
   * because a tap works with no movement and a drag must not claim anything until sideways.
   */

  /* Everything below runs when a finger moves, not while this memo builds the recognisers.
   * react-hooks cannot see through the closures into the gesture callbacks. */

  /* eslint-disable react-hooks/refs, react-hooks/immutability */
  const gesture = useMemo(() => {
    const seek = (x: number) => {
      const s = state.current;
      if (s.disabled) return;
      // Absolute position in the track, not accumulated translation. `gesture.dx` is the
      // distance from the start, so offsetting the live value by it doubles the travel.
      apply(valueFromX(x));
    };

    const pan = Gesture.Pan()
      .runOnJS(true)
      .enabled(!disabled)
      // Sideways, and clearly so. Below this the scroll view keeps the gesture,
      // which is the whole reason the lock is gone.
      .activeOffsetX([-4, 4])
      .onBegin(() => {
        // On touch down rather than on activation: the press feedback should
        // answer the finger, not wait to find out where it is going.
        thumbScale.value = springy(grytScaleSteps.sliderThumb.press);
      })
      .onStart((event) => seek(event.x))
      .onUpdate((event) => seek(event.x))
      .onEnd(() => emit.current.onValueCommit?.(state.current.value))
      .onFinalize(() => {
        thumbScale.value = springy(1);
      });

    const tap = Gesture.Tap()
      .runOnJS(true)
      .enabled(!disabled)
      .onEnd((event, success) => {
        if (!success) return;
        seek(event.x);
        emit.current.onValueCommit?.(state.current.value);
      });

    return Gesture.Race(pan, tap);
    // `apply` and `valueFromX` read refs written in effects, so they are not dependencies;
    // listing them would rebuild the gesture on every render.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, thumbScale]);
  /* eslint-enable react-hooks/refs, react-hooks/immutability */

  const ratio = (value - min) / (max - min || 1);

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        onLayout={(e: LayoutChangeEvent) =>
          setWidth(e.nativeEvent.layout.width)
        }
        style={[
          {
            height: THUMB,
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1
          },
          style
        ]}
      >
        <View
          style={{
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            backgroundColor: theme.scales.neutral[4]
          }}
        >
          <View
            style={{
              width: `${ratio * 100}%`,
              height: "100%",
              borderRadius: TRACK_HEIGHT / 2,
              backgroundColor: ramp[8]
            }}
          />
        </View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: Math.max(0, ratio * width - THUMB / 2),
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: ramp[8],
              borderWidth: 2,
              borderColor: theme.color.bg
            },
            thumbStyle
          ]}
        />
      </View>
    </GestureDetector>
  );
}
