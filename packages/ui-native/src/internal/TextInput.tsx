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
 * `TextInput`, in whatever face the theme was given.
 *
 * The same job the internal `Text` does, for the one other primitive that draws
 * glyphs. Without it a field's own text stays on the platform font while its
 * label above it changes — which is more obviously wrong than either being
 * consistently wrong, and is the kind of thing that only shows up once
 * somebody types.
 *
 * The placeholder comes along for free: React Native styles it from the same
 * `fontFamily`.
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
