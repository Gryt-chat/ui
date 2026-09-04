import type { ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";
import Animated from "react-native-reanimated";

import { usePressScale } from "../../motion";
import { useTheme } from "../../theme";

/**
 * A control and its label, where tapping either one works.
 *
 * The web gets this for free: a `<label>` wrapping the control, and the browser
 * forwards the click. React Native has no `<label>` and no `htmlFor`, so the
 * association has to be structural — the label and the control are inside one
 * Pressable, and that Pressable is the target.
 *
 * A parity *match* reached through a different API, which is why the exceptions
 * table lists it as an API difference rather than a behaviour one.
 *
 * Without a label it renders the control alone, so the bare form still works.
 */

/**
 * How far past its own edge a control still counts as pressed.
 *
 * There is no web equivalent and nothing to be 1:1 with — a pointer is exact
 * and a fingertip is about 9mm across. 20×20 is well under the 44pt minimum
 * both Apple and WCAG ask for, and radios are usually stacked, so a near miss
 * lands on the neighbour rather than on nothing.
 *
 * 12 on each side takes a 20pt box to 44pt without moving a single pixel of
 * what is drawn. It is deliberately not padding: padding would change the
 * layout and the spacing between a control and its label.
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

  // Only the control scales, not the label. The web scales the control element
  // and the text beside it is a sibling, so a whole row springing would be a
  // difference rather than a match — and a line of text jumping under a
  // fingertip reads as a glitch rather than as feedback.
  const control = <Animated.View style={press.style}>{children}</Animated.View>;

  // A label needs a string for screen readers, and `label` may be a node.
  // Falling back to it only when it is a string is better than stringifying an
  // element into "[object Object]".
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
