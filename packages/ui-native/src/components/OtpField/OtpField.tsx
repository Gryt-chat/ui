import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme";

export interface OtpFieldProps {
  length?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * One hidden input behind a row of boxes.
 *
 * The obvious build is one TextInput per digit, and it is a trap: backspace
 * across an empty box, paste, and autofill all have to be threaded between
 * inputs by hand, and every platform disagrees about the events. A single
 * invisible input holding the whole code gets all three for free, and the boxes
 * become presentation.
 *
 * `textContentType="oneTimeCode"` is what makes iOS offer the code from
 * Messages. Android reads `autoComplete="sms-otp"`.
 */
export function OtpField({
  length = 6,
  value: controlled,
  onValueChange,
  onComplete,
  disabled,
  autoFocus,
  style,
}: OtpFieldProps) {
  const theme = useTheme();
  const [uncontrolled, setUncontrolled] = useState("");
  const value = controlled ?? uncontrolled;
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInput>(null);

  const setValue = (next: string) => {
    const digits = next.replace(/\D/g, "").slice(0, length);
    if (controlled === undefined) setUncontrolled(digits);
    onValueChange?.(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <Pressable
      accessibilityRole="none"
      disabled={disabled}
      onPress={() => input.current?.focus()}
      style={[{ flexDirection: "row", gap: theme.space(2) }, style]}
    >
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length;
        const active = focused && i === value.length;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              aspectRatio: 0.8,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: active ? theme.color.accent : theme.color.border,
              borderRadius: theme.radius.md,
              backgroundColor: theme.color.surface,
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <Text style={{ color: theme.color.text, fontSize: 20, fontWeight: "600" }}>
              {filled ? value[i] : ""}
            </Text>
          </View>
        );
      })}

      <TextInput
        ref={input}
        value={value}
        onChangeText={setValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        // Off-screen rather than hidden: opacity 0 still takes the caret on
        // some Android builds, and display:none stops autofill reaching it.
        style={{ position: "absolute", top: -9999, left: -9999, width: 1, height: 1 }}
      />
    </Pressable>
  );
}
