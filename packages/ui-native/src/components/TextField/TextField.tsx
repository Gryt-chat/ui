import { useState, type ReactNode } from "react";
import {
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { TextInput } from "../../internal/TextInput";
import { Text } from "../../internal/Text";

import { useTheme } from "../../theme";

export type TextFieldSize = "small" | "medium";

const SIZES: Record<TextFieldSize, { minHeight: number; fontSize: number; paddingH: number }> = {
  small: { minHeight: 36, fontSize: 14, paddingH: 12 },
  medium: { minHeight: 40, fontSize: 14, paddingH: 14 },
};

export interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  size?: TextFieldSize;
  multiline?: boolean;
  /** Web calls this minRows. Same meaning: the starting height in lines. */
  minRows?: number;
  style?: StyleProp<ViewStyle>;
}

export function TextField({
  label,
  helperText,
  error = false,
  size = "medium",
  multiline = false,
  minRows = 3,
  style,
  editable,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const metrics = SIZES[size];
  const disabled = editable === false;

  // The web shows focus with an outline, which sits outside the box and does not
  // move anything. React Native has no outline, so the border changes colour
  // instead of a second ring appearing, which would shift the layout.
  const borderColor = error
    ? theme.color.danger
    : focused
      ? theme.color.accent
      : theme.color.border;

  return (
    <View style={[{ gap: theme.space(1.5) }, style]}>
      {label ? (
        <Text style={{ color: theme.color.muted, fontSize: 13, fontWeight: "500" }}>
          {label}
        </Text>
      ) : null}

      <View
        style={{
          borderWidth: 1,
          borderColor,
          borderRadius: theme.radius.md,
          backgroundColor: theme.color.surface,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <TextInput
          multiline={multiline}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={theme.color.muted}
          style={{
            color: theme.color.text,
            fontSize: metrics.fontSize,
            paddingHorizontal: metrics.paddingH,
            minHeight: multiline
              ? metrics.minHeight + metrics.fontSize * 1.4 * (minRows - 1)
              : metrics.minHeight,
            textAlignVertical: multiline ? "top" : "center",
            paddingVertical: multiline ? theme.space(2) : 0,
          }}
          {...rest}
        />
      </View>

      {helperText ? (
        <Text
          style={{
            color: error ? theme.scales.danger[10] : theme.color.muted,
            fontSize: 12,
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
