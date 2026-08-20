import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { springy } from "../../motion";
import { toneRamp, useTheme } from "../../theme";
import { ControlRow } from "../internal/ControlRow";

export type RadioTone = "primary" | "secondary" | "neutral" | "danger";

interface RadioGroupValue {
  value: string | number | null;
  setValue: (value: string | number) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupValue | null>(null);

export interface RadioGroupProps {
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string | number) => void;
  disabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The group holds the value, which is the part a radio cannot do alone.
 *
 * The web gets this from Base UI's RadioGroup, and a lone Radio outside one is
 * a mistake there too. Here it throws, because a radio that silently never
 * checks is worse than one that says why.
 */
export function RadioGroup({
  value: controlled,
  defaultValue,
  onValueChange,
  disabled,
  children,
  style,
}: RadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState<string | number | null>(
    defaultValue ?? null,
  );
  const value = controlled ?? uncontrolled;

  return (
    <RadioGroupContext.Provider
      value={{
        value,
        disabled,
        setValue: (next) => {
          if (controlled === undefined) setUncontrolled(next);
          onValueChange?.(next);
        },
      }}
    >
      <View accessibilityRole="radiogroup" style={style}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps {
  value: string | number;
  disabled?: boolean;
  tone?: RadioTone;
  /**
   * Tapping this selects the radio, which is what a `<label>` does on the web.
   *
   * Radios need it more than anything else here: they come in stacks, so a
   * 20pt target missed by a few points does not do nothing — it selects the
   * neighbour, which is worse than no response at all.
   */
  label?: ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SIZE = 20;

export function Radio({
  value,
  disabled,
  tone = "primary",
  label,
  style,
  accessibilityLabel,
}: RadioProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error("Radio must be rendered inside a RadioGroup.");

  const selected = group.value === value;
  const isDisabled = disabled || group.disabled;
  const ramp = toneRamp(theme, tone);

  // Scales from 0 for the same reason the checkbox tick does — see the comment
  // there. The dot used to be mounted and unmounted, which is that transition
  // with the duration set to nothing.
  const dot = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    const to = selected ? 1 : 0;
    // eslint-disable-next-line react-hooks/immutability
    dot.value = reducedMotion ? to : springy(to);
  }, [selected, dot, reducedMotion]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot.value }],
    opacity: dot.value,
  }));

  return (
    <ControlRow
      label={label}
      onPress={() => group.setValue(value)}
      disabled={isDisabled}
      pressScale={grytScaleSteps.radio.press}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !!isDisabled }}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          // 1, matching the web. It was 1.5, which reads heavier than the
          // checkbox sitting next to it in the same form.
          borderWidth: 1,
          borderColor: selected ? ramp[8] : theme.color.border,
          // The web fills the circle and outlines it; only the dot is new when
          // it is selected.
          backgroundColor: theme.color.surfaceRaised,
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <Animated.View
          style={[
            {
              width: SIZE / 2,
              height: SIZE / 2,
              borderRadius: SIZE / 4,
              backgroundColor: ramp[8],
            },
            dotStyle,
          ]}
        />
      </View>
    </ControlRow>
  );
}
