import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { useTheme } from "../../theme";

export type DrawerSide = "left" | "right" | "bottom";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer(part: string) {
  const value = useContext(DrawerContext);
  if (!value) throw new Error(`Drawer.${part} must be rendered inside Drawer.Root.`);
  return value;
}

export interface DrawerRootProps extends OpenStateProps {
  children?: ReactNode;
}

function Root({ children, ...openProps }: DrawerRootProps) {
  const state = useOpenState(openProps);
  return <DrawerContext.Provider value={state}>{children}</DrawerContext.Provider>;
}

function Trigger({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { setOpen } = useDrawer("Trigger");
  return (
    <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={style}>
      {children}
    </Pressable>
  );
}

function Portal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export interface DrawerPopupProps {
  children?: ReactNode;
  side?: DrawerSide;
  /** Fraction of the screen, 0 to 1. */
  size?: number;
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Slides in from an edge, which is the one place an animation is not decoration.
 *
 * A drawer that appears without moving reads as a screen change rather than a
 * panel, so this one animates even though Collapsible and Skeleton do not.
 * Reduce-motion still turns it off: the drawer arrives in place instead.
 */
function Popup({
  children,
  side = "left",
  size = 0.8,
  dismissible = true,
  style,
}: DrawerPopupProps) {
  const { open, setOpen } = useDrawer("Popup");
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const screen = Dimensions.get("window");
  const vertical = side === "bottom";
  const extent = vertical ? screen.height * size : screen.width * size;

  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!open) {
      progress.setValue(0);
      return;
    }
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  }, [open, progress, reducedMotion]);

  const hidden = side === "right" ? extent : side === "left" ? -extent : extent;
  const translate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [hidden, 0],
  });

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={dismissible ? () => setOpen(false) : undefined}
    >
      <Pressable
        onPress={dismissible ? () => setOpen(false) : undefined}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <Animated.View
          accessibilityViewIsModal
          style={{
            position: "absolute",
            top: side === "bottom" ? undefined : 0,
            bottom: 0,
            left: side === "right" ? undefined : 0,
            right: side === "left" ? undefined : 0,
            width: vertical ? "100%" : extent,
            height: vertical ? extent : "100%",
            backgroundColor: theme.color.surface,
            borderColor: theme.color.border,
            borderRightWidth: side === "left" ? 1 : 0,
            borderLeftWidth: side === "right" ? 1 : 0,
            borderTopWidth: vertical ? 1 : 0,
            borderTopLeftRadius: vertical ? theme.radius.lg : 0,
            borderTopRightRadius: vertical ? theme.radius.lg : 0,
            transform: [vertical ? { translateY: translate } : { translateX: translate }],
          }}
        >
          <Pressable onPress={() => {}} style={[{ flex: 1 }, style]}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Close({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { setOpen } = useDrawer("Close");
  return (
    <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={style}>
      {children}
    </Pressable>
  );
}

export const Drawer = { Root, Trigger, Portal, Popup, Close };
