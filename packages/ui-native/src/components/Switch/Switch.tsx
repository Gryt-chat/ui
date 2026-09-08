import { useEffect, useState, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { springy } from "../../motion";
import { grytScaleSteps } from "@gryt/theme";
import { toneRamp, useTheme } from "../../theme";
import { ControlRow } from "../internal/ControlRow";

export type SwitchTone = "primary" | "secondary" | "neutral" | "danger";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  tone?: SwitchTone;
  /** Tapping this toggles the switch, as a `<label>` does on the web. */
  label?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

// The web is h-6 w-10 with a thumb translating x-4. Same numbers in points.
const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 24;
const THUMB = 16;
const TRAVEL = 16;

/**
 * Not React Native's own Switch, which draws the platform control in green or Material and
 * whose colour props do not reach the whole shape. Drawn from the tokens instead.
 */
export function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  tone = "primary",
  label,
  style,
  accessibilityLabel,
}: SwitchProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const checked = controlled ?? uncontrolled;

  const offset = useSharedValue(checked ? TRAVEL : 0);

  // The web is `translate-x-4` on `ease-spring` — the overshooting curve, because the
  // travel is 16px inside a 40px track. Following the web rather than second-guessing it.
  useEffect(() => {
    const to = checked ? TRAVEL : 0;
    // eslint-disable-next-line react-hooks/immutability
    offset.value = reducedMotion ? to : springy(to);
  }, [checked, offset, reducedMotion]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }]
  }));

  const ramp = toneRamp(theme, tone);

  return (
    <ControlRow
      label={label}
      onPress={() => {
        const next = !checked;
        if (controlled === undefined) setUncontrolled(next);
        onCheckedChange?.(next);
      }}
      disabled={disabled}
      pressScale={grytScaleSteps.switch.press}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View
        style={{
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          padding: (TRACK_HEIGHT - THUMB) / 2,
          justifyContent: "center",
          // The web outlines the track and fills it with surfaceRaised when off, then
          // paints the tone over it. neutral[5] with no border was wrong beside a checkbox.
          borderWidth: 1,
          borderColor: checked ? "transparent" : theme.color.border,
          backgroundColor: checked ? ramp[8] : theme.color.surfaceRaised,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={[
            {
              width: THUMB,
              height: THUMB,
              borderRadius: THUMB / 2,
              backgroundColor: checked ? theme.color.bg : theme.color.text,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </ControlRow>
  );
}
