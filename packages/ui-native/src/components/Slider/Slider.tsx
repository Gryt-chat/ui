import { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { springy } from "../../motion";
import { toneRamp, useTheme, type ComponentTone } from "../../theme";
import { valueAt } from "./sliderValue";

export type SliderTone = Extract<ComponentTone, "primary" | "secondary" | "neutral" | "danger">;

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
 * The web gets pointer capture: once the thumb is grabbed, every move belongs to
 * the slider until release. React Native has no equivalent, so this claims the
 * gesture through PanResponder and holds it, which is what stops a horizontal
 * drag being read as a scroll by whatever list the slider is sitting in.
 *
 * Volume sliders live in scroll views, so this matters more here than it looks.
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
  accessibilityLabel,
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
  /** Where the current gesture started, in track coordinates. */
  const origin = useRef(0);
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

  // useState with an initialiser rather than useRef(...).current, which counts
  // as reading a ref during render. Created once either way.
  //
  // The rule is disabled for the block below because it reads what the closures
  // mention, not what runs. Every state.current here executes inside a touch
  // callback, long after render, and none of it decides what is drawn — the
  // rendered position comes from `value` and `width` directly. The thing the
  // rule protects against, a component rendering from a ref and not updating,
  // cannot happen here.
  /* eslint-disable react-hooks/refs */
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !state.current.disabled,
      // Claimed on move as well, so a drag that begins as a scroll still lands
      // here once it is clearly horizontal.
      onMoveShouldSetPanResponder: () => !state.current.disabled,
      onPanResponderGrant: (e) => {
        // Where the finger landed, kept for the drag to offset from.
        origin.current = e.nativeEvent.locationX;
        thumbScale.value = springy(grytScaleSteps.sliderThumb.press);
        apply(valueFromX(e.nativeEvent.locationX));
      },
      // `gesture.dx` is the distance from where the gesture *started*, not from
      // the previous event. Offsetting the live value by it therefore adds the
      // whole travel again on every move, and the thumb accelerates away from
      // the finger — 200px wide, 0-100, dragging to x=50 then 60 then 70 gave
      // 25, then 55, then 90. Tapping was always fine, because grant uses
      // locationX directly, which is what made it look like a rendering
      // problem rather than an arithmetic one.
      //
      // Anchoring on the grant position is also what makes the drag continue
      // from the finger: grant has already seeked the thumb there.
      onPanResponderMove: (_e, gesture) => {
        apply(valueFromX(origin.current + gesture.dx));
      },
      // The fix for GRYT-390's "the slider still lets me scroll the page".
      //
      // The comment above says this "claims the gesture and holds it". It did
      // not: `onPanResponderTerminationRequest` defaults to *granting*, so the
      // enclosing ScrollView asked for the responder as soon as the finger
      // moved and got it. Every drag inside a scrolling screen scrolled the
      // screen, which is every drag — volume sliders live in settings lists.
      //
      // Saying no is the whole fix. `onShouldBlockNativeResponder` stops the
      // native scroll view taking over underneath on Android, where the JS
      // answer alone is not enough.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderRelease: () => {
        thumbScale.value = springy(1);
        emit.current.onValueCommit?.(state.current.value);
      },
    }),
  );
  /* eslint-enable react-hooks/refs */

  const ratio = (value - min) / (max - min || 1);

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[{ height: THUMB, justifyContent: "center", opacity: disabled ? 0.5 : 1 }, style]}
      {...responder.panHandlers}
    >
      <View
        style={{
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: theme.scales.neutral[4],
        }}
      >
        <View
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            borderRadius: TRACK_HEIGHT / 2,
            backgroundColor: ramp[8],
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
            borderColor: theme.color.bg,
          },
          thumbStyle,
        ]}
      />
    </View>
  );
}
