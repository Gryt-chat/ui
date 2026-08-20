import { useState, type ReactNode } from "react";
import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { usePressScale } from "../../motion";

import { toneRamp, useTheme, type ComponentTone } from "../../theme";

export type ToggleTone = Extract<ComponentTone, "primary" | "secondary" | "neutral" | "danger">;
export type ToggleSize = "xsmall" | "small" | "medium" | "large";

const SIZES: Record<ToggleSize, { minHeight: number; paddingH: number; fontSize: number }> = {
  xsmall: { minHeight: 32, paddingH: 10, fontSize: 12 },
  small: { minHeight: 36, paddingH: 12, fontSize: 14 },
  medium: { minHeight: 40, paddingH: 14, fontSize: 14 },
  large: { minHeight: 48, paddingH: 18, fontSize: 16 },
};

export interface ToggleProps {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
  tone?: ToggleTone;
  size?: ToggleSize;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** A button that stays down. Mute, deafen, and the rest of the call controls. */
/**
 * Animated.createAnimatedComponent rather than a wrapping Animated.View.
 *
 * A Toggle is laid out by its parent — a Toolbar puts them in a row — and an
 * extra view between the two would take the layout props and leave the button
 * sized by its content. The web scales the button element itself, so this does
 * too.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Toggle({
  pressed: controlled,
  defaultPressed = false,
  onPressedChange,
  disabled,
  tone = "primary",
  size = "medium",
  children,
  style,
  accessibilityLabel,
}: ToggleProps) {
  const theme = useTheme();
  const press = usePressScale(grytScaleSteps.toggle.press, disabled);
  const [uncontrolled, setUncontrolled] = useState(defaultPressed);
  const on = controlled ?? uncontrolled;
  const metrics = SIZES[size];
  const ramp = toneRamp(theme, tone);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onPress={() => {
        const next = !on;
        if (controlled === undefined) setUncontrolled(next);
        onPressedChange?.(next);
      }}
      style={[
        press.style,
        {
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingH,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.space(2),
          borderRadius: theme.radius.full,
          backgroundColor: on ? ramp[2] : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={{
            color: on ? ramp[10] : theme.color.muted,
            fontSize: metrics.fontSize,
            fontWeight: "600",
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
