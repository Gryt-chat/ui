import { type ReactNode } from "react";
import { ScrollView, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";

export interface ScrollAreaProps extends Omit<ScrollViewProps, "style"> {
  children?: ReactNode;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * A thin pass over ScrollView. A phone has no scrollbars to replace, so this stays for
 * call-site parity; its one job is defaulting the indicator off, as the web hides it.
 */
export function ScrollArea({
  children,
  horizontal = false,
  style,
  contentStyle,
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  ...rest
}: ScrollAreaProps) {
  return (
    <ScrollView
      horizontal={horizontal}
      style={style}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
