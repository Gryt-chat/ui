import { useEffect, useState } from "react";
import { Animated, Pressable, type StyleProp, type ViewStyle } from "react-native";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { toneRamp, useTheme } from "../../theme";

export type SwitchTone = "primary" | "secondary" | "neutral" | "danger";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  tone?: SwitchTone;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

// The web is h-6 w-10 with a thumb translating x-4. Same numbers in points.
const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 24;
const THUMB = 16;
const TRAVEL = 16;

/**
 * Not React Native's own Switch.
 *
 * `<Switch>` from React Native draws the platform control, which is green on
 * iOS and follows the Material palette on Android. Neither is the Gryt accent,
 * and `thumbColor`/`trackColor` do not reach the whole shape. A design system
 * that cannot colour its own switch is not much of a design system, so this is
 * drawn from the tokens like everything else.
 *
 * The cost is that it does not pick up future platform restyling for free, which
 * is the trade the whole library is already making.
 */
export function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  tone = "primary",
  style,
  accessibilityLabel,
}: SwitchProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const checked = controlled ?? uncontrolled;

  const [offset] = useState(() => new Animated.Value(checked ? TRAVEL : 0));

  useEffect(() => {
    if (reducedMotion) {
      offset.setValue(checked ? TRAVEL : 0);
      return;
    }
    Animated.spring(offset, {
      toValue: checked ? TRAVEL : 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  }, [checked, offset, reducedMotion]);

  const ramp = toneRamp(theme, tone);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => {
        const next = !checked;
        if (controlled === undefined) setUncontrolled(next);
        onCheckedChange?.(next);
      }}
      style={[
        {
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          padding: (TRACK_HEIGHT - THUMB) / 2,
          justifyContent: "center",
          backgroundColor: checked ? ramp[8] : theme.scales.neutral[5],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: checked ? theme.color.bg : theme.color.text,
          transform: [{ translateX: offset }],
        }}
      />
    </Pressable>
  );
}
