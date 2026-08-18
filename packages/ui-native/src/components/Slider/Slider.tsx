import { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { toneRamp, useTheme, type ComponentTone } from "../../theme";

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

  useEffect(() => {
    state.current = { width, value, min, max, step, disabled };
  }, [width, value, min, max, step, disabled]);

  useEffect(() => {
    emit.current = { onValueChange, onValueCommit, controlled };
  }, [onValueChange, onValueCommit, controlled]);

  const valueFromX = (x: number) => {
    const s = state.current;
    if (s.width <= 0) return s.value;
    const ratio = Math.max(0, Math.min(1, x / s.width));
    const raw = s.min + ratio * (s.max - s.min);
    const stepped = Math.round(raw / s.step) * s.step;
    return Math.max(s.min, Math.min(s.max, stepped));
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
      onPanResponderGrant: (e) => apply(valueFromX(e.nativeEvent.locationX)),
      onPanResponderMove: (_e, gesture) => {
        const s = state.current;
        const ratio = (s.value - s.min) / (s.max - s.min || 1);
        apply(valueFromX(ratio * s.width + gesture.dx));
      },
      onPanResponderRelease: () => emit.current.onValueCommit?.(state.current.value),
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
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: Math.max(0, ratio * width - THUMB / 2),
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: ramp[8],
          borderWidth: 2,
          borderColor: theme.color.bg,
        }}
      />
    </View>
  );
}
