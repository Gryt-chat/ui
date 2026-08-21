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
 * The web's ScrollArea exists to replace scrollbars the browser draws badly and
 * inconsistently. A phone has no scrollbars to replace: the indicator is drawn
 * by the OS, it fades on its own, and it already matches everything else on the
 * device. So the component stays for call-site parity and does almost nothing,
 * which is the honest version.
 *
 * Its one job is defaulting the indicator off, since the web version hides the
 * native scrollbar too.
 *
 * It used to have a second: publishing a drag lock that a Slider could claim to
 * switch this list off for the duration of a drag. That existed because
 * `PanResponder` could not tell the native scroll recogniser anything, so the
 * only way to stop the list moving under a slider was to disable it. The Slider
 * declares `activeOffsetX` now and the two gestures settle it between them, so
 * there is nothing to hold still and nothing to leak if a drag is interrupted.
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
