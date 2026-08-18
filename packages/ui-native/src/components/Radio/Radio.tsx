import { createContext, useContext, useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { toneRamp, useTheme } from "../../theme";

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
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SIZE = 20;

export function Radio({
  value,
  disabled,
  tone = "primary",
  style,
  accessibilityLabel,
}: RadioProps) {
  const theme = useTheme();
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error("Radio must be rendered inside a RadioGroup.");

  const selected = group.value === value;
  const isDisabled = disabled || group.disabled;
  const ramp = toneRamp(theme, tone);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !!isDisabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={isDisabled}
      onPress={() => group.setValue(value)}
      style={[
        {
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1.5,
          borderColor: selected ? ramp[8] : theme.color.border,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {selected ? (
        <View
          style={{
            width: SIZE / 2,
            height: SIZE / 2,
            borderRadius: SIZE / 4,
            backgroundColor: ramp[8],
          }}
        />
      ) : null}
    </Pressable>
  );
}
