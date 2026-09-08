import { useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
// Deep imports, one file per icon, rather than the barrel: Metro does not tree-shake. The
// `*Icon` suffix is the spelling @phosphor-icons/react uses.
import { MinusIcon } from "phosphor-react-native/src/icons/Minus";
import { PlusIcon } from "phosphor-react-native/src/icons/Plus";
import { TextInput } from "../../internal/TextInput";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";

/**
 * Declared here rather than inside NumberField. A component defined in another's body is a
 * new type on every render, so React remounts it and any state inside is lost.
 */
function StepButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{ paddingHorizontal: theme.space(3), paddingVertical: theme.space(2) }}
    >
      {icon}
    </Pressable>
  );
}

export interface NumberFieldProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Typed or stepped, with the keyboard set to numeric. The web's scrub gesture is not
 * reproduced: it competes with scrolling, and Slider already covers it here.
 */
export function NumberField({
  value: controlled,
  defaultValue = 0,
  onValueChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  label,
  disabled,
  style,
}: NumberFieldProps) {
  const theme = useTheme();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  // Kept separately so a half-typed "-" or "" does not become 0 mid-edit.
  const [text, setText] = useState(String(defaultValue));

  const commit = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    if (controlled === undefined) setUncontrolled(clamped);
    setText(String(clamped));
    onValueChange?.(clamped);
  };

  return (
    <View style={[{ gap: theme.space(1.5) }, style]}>
      {label ? (
        <Text style={{ color: theme.color.muted, fontSize: 13, fontWeight: "500" }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.color.border,
          borderRadius: theme.radius.md,
          backgroundColor: theme.color.surface,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <StepButton
          icon={<MinusIcon size={16} color={theme.color.muted} weight="bold" />}
          label="Decrease"
          disabled={disabled || value <= min}
          onPress={() => commit(value - step)}
        />
        <TextInput
          editable={!disabled}
          keyboardType="numeric"
          value={text}
          onChangeText={setText}
          onBlur={() => {
            const parsed = Number(text);
            commit(Number.isFinite(parsed) ? parsed : value);
          }}
          style={{
            flex: 1,
            textAlign: "center",
            color: theme.color.text,
            fontSize: 14,
            paddingVertical: theme.space(2),
          }}
        />
        <StepButton
          icon={<PlusIcon size={16} color={theme.color.muted} weight="bold" />}
          label="Increase"
          disabled={disabled || value >= max}
          onPress={() => commit(value + step)}
        />
      </View>
    </View>
  );
}
