import { type ReactNode } from "react";
import { ScrollView, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";

export interface ScrollAreaProps extends Omit<ScrollViewProps, "style"> {
  children?: ReactNode;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * A thin pass over ScrollView.
 *
 * The web's ScrollArea exists to replace scrollbars the browser draws badly. A
 * phone has no scrollbars to replace: the indicator is drawn by the OS, fades
 * on its own, and already matches everything else on the device. So the
 * component stays for call-site parity and does almost nothing. Its one job is
 * defaulting the indicator off, since the web version hides the native
 * scrollbar too.
 *
 * It used to have a second: publishing a drag lock a Slider could claim, back
 * when `PanResponder` could not tell the native scroll recogniser anything. The
 * Slider declares `activeOffsetX` now and the two gestures settle it between
 * them, so there is nothing to hold still and nothing to leak.
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
