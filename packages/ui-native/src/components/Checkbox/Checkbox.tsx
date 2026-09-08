import { useEffect, useState, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
// Deep imports, one file per icon, rather than the barrel: Metro does not tree-shake. The
// `*Icon` suffix is the spelling @phosphor-icons/react uses.
import { CheckIcon } from "phosphor-react-native/src/icons/Check";
import { MinusIcon } from "phosphor-react-native/src/icons/Minus";

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
 * The tick is a Phosphor `Check`, the same icon `@gryt/ui` draws on the web. It was a text
 * glyph until phosphor-react-native became a peer, so it costs an app that has it nothing.
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
   * The tick scales from 0, not from something near 1: the spring's overshoot is a
   * percentage of travel, so 0.95 → 1 overshoots by 0.006 and does nothing.
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
          // The web keeps the border at 1 always and makes it transparent when checked,
          // rather than dropping to 0 — a border that disappears changes the box's size.
          borderWidth: 1,
          borderColor: filled ? "transparent" : theme.color.border,
          // Was `transparent`, which is not what the web does: an unchecked box
          // is a filled surface with an outline, not a hole.
          backgroundColor: filled ? ramp[8] : theme.color.surfaceRaised,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Animated.View style={tickStyle}>
          {indeterminate ? (
            <MinusIcon size={14} color={theme.color.onAccent} weight="bold" />
          ) : (
            <CheckIcon size={14} color={theme.color.onAccent} weight="bold" />
          )}
        </Animated.View>
      </Animated.View>
    </ControlRow>
  );
}
