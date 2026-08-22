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
 * Dragging, on a surface where a drag might belong to something else.
 *
 * The web gets pointer capture: once the thumb is grabbed, every move belongs
 * to the slider until release. React Native has no equivalent, and volume
 * sliders live in settings lists, so a horizontal drag has to be told apart
 * from the scroll it is sitting in.
 *
 * `activeOffsetX` is that distinction, declared rather than fought over. The
 * pan claims the gesture once the finger has clearly gone sideways, and a
 * vertical drag never activates it at all, so the scroll view keeps it. That
 * replaces `onPanResponderTerminationRequest: () => false` plus the `DragLock`
 * that had to switch the scroll view off, because refusing to hand back a JS
 * responder says nothing to the native recogniser that actually does the
 * scrolling on iOS.
 *
 * Both gestures run on the JS thread. The Drawer's stay worklets because they
 * only move a shared value; every callback here has to reach React state and
 * the consumer's `onValueChange`, so the hop is happening either way and
 * pretending otherwise would only add a way to get it wrong.
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

  // The responder callbacks are created once and would otherwise close over the
  // first render's values forever, so the current ones live in refs. Written in
  // an effect rather than during render: mutating a ref while rendering is the
  // kind of thing that breaks under concurrent rendering, and the callbacks only
  // fire from touch events, which is always after an effect has run.
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
   * Tap to seek, drag to scrub, and nothing at all if the finger goes down the
   * page.
   *
   * Two gestures rather than one because they want opposite thresholds. A tap
   * has to work with no movement; a drag must not claim anything until it is
   * clearly sideways, or every attempt to scroll past a slider moves it. `Race`
   * lets whichever qualifies win, and only one ever does.
   */
  /* Everything below runs when a finger moves, not while this memo builds the
   * recognisers. react-hooks/refs and react-hooks/immutability cannot see
   * through the closures: they read `state.current` and `emit.current` being
   * touched during render, and `thumbScale.value` — a Reanimated shared value —
   * being assigned there. Both actually happen inside gesture callbacks.
   *
   * The refs are deliberate and explained where they are declared: they are
   * what lets the gesture read the live value without rebuilding itself on
   * every render, which is the same reason the dependency list below is
   * short. */
  /* eslint-disable react-hooks/refs, react-hooks/immutability */
  const gesture = useMemo(() => {
    const seek = (x: number) => {
      const s = state.current;
      if (s.disabled) return;
      // Absolute position in the track, not accumulated translation.
      //
      // The old version anchored on where the gesture started and added
      // `gesture.dx`, which is the distance from the *start* rather than from
      // the last event — so offsetting the live value by it added the whole
      // travel again every move and the thumb accelerated away from the
      // finger. Reading the position directly cannot express that bug.
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
    // `apply` and `valueFromX` read refs that are written in effects, so they
    // do not need to be dependencies — and listing them would rebuild the
    // gesture on every render.
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
