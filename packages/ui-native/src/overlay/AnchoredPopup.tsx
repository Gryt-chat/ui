import { useState, type ReactNode } from "react";
import { Modal, Pressable, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from "react-native";

import { placePopup, type AnchorOptions, type AnchorRect } from "./placePopup";
import { screenSize } from "./useAnchoredPosition";
import { useTheme } from "../theme";

/**
 * The shared body of every popup that hangs off a trigger. It renders once invisibly to
 * find out how big it is, then again in place: the position depends on the size.
 */
export interface AnchoredPopupProps extends AnchorOptions {
  open: boolean;
  anchor: AnchorRect | null;
  onDismiss: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Tooltips do not take presses; menus do. */
  pointerEvents?: "auto" | "none";
}

export function AnchoredPopup({
  open,
  anchor,
  onDismiss,
  children,
  style,
  pointerEvents = "auto",
  ...options
}: AnchoredPopupProps) {
  const theme = useTheme();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.width !== width || size.height !== height) {
      setSize({ width, height });
    }
  };

  if (!open || !anchor) return null;

  const placement = size
    ? placePopup(anchor, size, screenSize(), options)
    : null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDismiss}>
      <Pressable style={{ flex: 1 }} onPress={onDismiss}>
        <View
          onLayout={onLayout}
          pointerEvents={pointerEvents}
          style={[
            {
              position: "absolute",
              // Off-screen for the measuring pass, so nothing flashes in the
              // wrong place before the position is known.
              top: placement?.top ?? -9999,
              left: placement?.left ?? -9999,
              maxHeight: placement?.maxHeight,
              backgroundColor: theme.color.surfaceRaised,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.color.border,
            },
            style,
          ]}
        >
          {/* Swallows presses so tapping inside does not dismiss. */}
          <Pressable onPress={() => {}}>{children}</Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
