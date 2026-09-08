import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";
import Animated from "react-native-reanimated";

import { usePressScale } from "../../motion";
import { useTheme } from "../../theme";

/**
 * A control and its label, where tapping either one works. React Native has no `<label>`,
 * so the association is structural: both sit inside one Pressable, which is the target.
 */

/**
 * How far past its own edge a control still counts as pressed. 12 on each side takes a
 * 20pt box to the 44pt minimum without moving a pixel of what is drawn, unlike padding.
 */
export const CONTROL_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export interface ControlRowProps {
  /** Tapping this toggles the control. Omit for a bare control. */
  label?: ReactNode;
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  /** From `grytScaleSteps`, so it matches whatever the web does. */
  pressScale: number;
  accessibilityRole: "checkbox" | "radio" | "switch";
  accessibilityState: { checked?: boolean | "mixed"; disabled?: boolean };
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ControlRow({
  label,
  children,
  onPress,
  disabled,
  pressScale,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  style,
}: ControlRowProps) {
  const theme = useTheme();
  const press = usePressScale(pressScale, disabled);

  // Only the control scales, not the label. The web scales the control element and the text
  // beside it is a sibling; a line of text jumping under a fingertip reads as a glitch.
  const control = <Animated.View style={press.style}>{children}</Animated.View>;

  // A label needs a string for screen readers, and `label` may be a node. Falling back to
  // it only when it is a string beats stringifying an element into "[object Object]".
  const spokenLabel =
    accessibilityLabel ?? (typeof label === "string" ? label : undefined);

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={spokenLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={CONTROL_HIT_SLOP}
      style={[
        label != null
          ? { flexDirection: "row", alignItems: "center", gap: theme.space(2) }
          : { alignSelf: "flex-start" },
        style,
      ]}
    >
      {control}
      {label != null ? (
        typeof label === "string" ? (
          <Text
            style={{
              color: disabled ? theme.color.muted : theme.color.text,
              fontSize: 14,
              // The row centres on the control, so the text has to sit on the
              // same optical line rather than on its own baseline.
              lineHeight: 20,
            }}
          >
            {label}
          </Text>
        ) : (
          <View>{label}</View>
        )
      ) : null}
    </Pressable>
  );
}
