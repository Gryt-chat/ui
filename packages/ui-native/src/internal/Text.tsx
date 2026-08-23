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
 * `Text`, in whatever face the theme was given.
 *
 * React Native has no cascade: a font set on a parent does not reach the text
 * inside it, so there is no root rule an app can write and every `Text` has to
 * name its own family. Every component in this library imports `Text` from
 * here rather than from `react-native`, which is what makes
 * `GrytThemeProvider fonts={…}` reach all of them — and what makes a component
 * written next year get it without anybody remembering to.
 *
 * The alternative was spreading `theme.font()` into every style in the library.
 * That works, and it is a rule somebody has to keep applying; this is the same
 * rule applied once. `theme.font()` stays exported for anyone styling their own
 * `Text` outside the library.
 *
 * The weight has to be read before the family can be chosen, which is why the
 * style is flattened. `StyleSheet.flatten` handles the array form and the
 * registered-id form, both of which components here use.
 *
 * **A `fontFamily` already in the style wins**, so a caller who deliberately
 * wants one specific face is not fought by the wrapper.
 *
 * **A theme with no faces changes nothing.** `theme.font` hands back the bare
 * `fontWeight` in that case, which is what the style already said.
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
