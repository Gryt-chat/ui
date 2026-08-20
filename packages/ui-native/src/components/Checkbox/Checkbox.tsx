import { useEffect, useState, type ReactNode } from "react";
import { Text, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { springy } from "../../motion";
import { toneRamp, useTheme } from "../../theme";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { ControlRow } from "../internal/ControlRow";

export type CheckboxTone = "primary" | "secondary" | "neutral" | "danger";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Base UI's third state, for a parent of partly-checked children. */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  tone?: CheckboxTone;
  /**
   * Tapping this toggles the box, which is what a `<label>` does on the web.
   * See ControlRow for why it is a prop here rather than a wrapper element.
   */
  label?: ReactNode;
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
  label,
  style,
  accessibilityLabel,
}: CheckboxProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const checked = controlled ?? uncontrolled;
  const ramp = toneRamp(theme, tone);
  const filled = checked || indeterminate;

  /**
   * The tick scales from 0, not from something near 1.
   *
   * Straight from the web's comment, and it is not a detail: the spring's
   * overshoot is a percentage of the travel, so 0 → 1 overshoots to 1.12 and
   * visibly springs, while 0.95 → 1 overshoots by 0.006 and does nothing at
   * all. It used to appear instantly here, which is the same bug with the
   * travel set to zero.
   */
  const tick = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    const to = filled ? 1 : 0;
    // eslint-disable-next-line react-hooks/immutability
    tick.value = reducedMotion ? to : springy(to);
  }, [filled, tick, reducedMotion]);

  const tickStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tick.value }],
    opacity: tick.value,
  }));

  return (
    <ControlRow
      label={label}
      onPress={() => {
        const next = !checked;
        if (controlled === undefined) setUncontrolled(next);
        onCheckedChange?.(next);
      }}
      disabled={disabled}
      pressScale={grytScaleSteps.checkbox.press}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: indeterminate ? "mixed" : checked,
        disabled: !!disabled,
      }}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: theme.radius.sm,
          alignItems: "center",
          justifyContent: "center",
          // The web keeps the border at 1 always and makes it transparent when
          // checked, rather than dropping to 0 — a border that disappears
          // changes the box's size mid-transition.
          borderWidth: 1,
          borderColor: filled ? "transparent" : theme.color.border,
          // Was `transparent`, which is not what the web does: an unchecked box
          // is a filled surface with an outline, not a hole.
          backgroundColor: filled ? ramp[8] : theme.color.surfaceRaised,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View style={tickStyle}>
          <Text
            style={{
              color: theme.color.onAccent,
              fontSize: 13,
              fontWeight: "900",
              lineHeight: 15,
            }}
          >
            {indeterminate ? "–" : "✓"}
          </Text>
        </Animated.View>
      </Animated.View>
    </ControlRow>
  );
}
