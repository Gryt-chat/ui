import { useState } from "react";
import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";

import { toneRamp, useTheme } from "../../theme";

export type CheckboxTone = "primary" | "secondary" | "neutral" | "danger";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Base UI's third state, for a parent of partly-checked children. */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  tone?: CheckboxTone;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SIZE = 20;

/**
 * The tick is a text glyph rather than an icon.
 *
 * `@gryt/ui` renders a Phosphor `Check`. Pulling an icon library in here would
 * be the first runtime dependency this package has, for one glyph, and
 * `@phosphor-icons/react` renders SVG that React Native cannot mount without
 * react-native-svg on top. Both are decisions for whoever needs a full icon set,
 * not for a checkbox.
 */
export function Checkbox({
  checked: controlled,
  defaultChecked = false,
  indeterminate = false,
  onCheckedChange,
  disabled,
  tone = "primary",
  style,
  accessibilityLabel,
}: CheckboxProps) {
  const theme = useTheme();
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const checked = controlled ?? uncontrolled;
  const ramp = toneRamp(theme, tone);
  const filled = checked || indeterminate;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: indeterminate ? "mixed" : checked,
        disabled: !!disabled,
      }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => {
        const next = !checked;
        if (controlled === undefined) setUncontrolled(next);
        onCheckedChange?.(next);
      }}
      style={[
        {
          width: SIZE,
          height: SIZE,
          borderRadius: theme.radius.sm,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: filled ? 0 : 1.5,
          borderColor: theme.color.border,
          backgroundColor: filled ? ramp[8] : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {filled ? (
        <Text style={{ color: theme.color.bg, fontSize: 13, fontWeight: "900", lineHeight: 15 }}>
          {indeterminate ? "–" : "✓"}
        </Text>
      ) : null}
    </Pressable>
  );
}
