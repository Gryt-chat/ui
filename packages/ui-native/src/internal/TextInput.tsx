import { forwardRef } from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  type TextStyle,
} from "react-native";

import { useTheme } from "../theme/useTheme";

export type TextInputProps = RNTextInputProps;

/**
 * `TextInput`, in whatever face the theme was given — the same job the internal
 * `Text` does. Without it a field's text stays on the platform font while its
 * label changes, which only shows up once somebody types.
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(function GrytTextInput(
  { style, ...props },
  ref,
) {
  const theme = useTheme();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;

  if (flat?.fontFamily) return <RNTextInput ref={ref} style={style} {...props} />;

  return (
    <RNTextInput
      ref={ref}
      style={[style, { fontWeight: undefined, ...theme.font(flat?.fontWeight) }]}
      {...props}
    />
  );
});
