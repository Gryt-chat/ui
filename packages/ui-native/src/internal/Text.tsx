import { forwardRef } from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

import { useTheme } from "../theme/useTheme";

export interface TextProps extends RNTextProps {
  /**
   * Draw this in the code face.
   *
   * A prop rather than a second component, because the only difference is which
   * family a weight resolves to.
   */
  mono?: boolean;
}

/**
 * `Text`, in whatever face the theme was given. React Native has no cascade, so
 * every `Text` has to name its own family — **every component in this library
 * imports it from here rather than from `react-native`**, which is what makes
 * `GrytThemeProvider fonts={…}` reach a component written next year.
 *
 * The style is flattened because the weight has to be read before the family
 * can be chosen.
 *
 * **A `fontFamily` already in the style wins**, and a theme with no faces
 * changes nothing.
 */
export const Text = forwardRef<RNText, TextProps>(function GrytText(
  { style, mono = false, ...props },
  ref,
) {
  const theme = useTheme();
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;

  if (flat?.fontFamily) return <RNText ref={ref} style={style} {...props} />;

  /* After the caller's style so the resolved family lands, and the weight it
   * replaces is unset rather than left alongside — see `FontStyle`. */
  return (
    <RNText
      ref={ref}
      style={[style, { fontWeight: undefined, ...theme.font(flat?.fontWeight, { mono }) }]}
      {...props}
    />
  );
});
