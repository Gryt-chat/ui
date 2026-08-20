import {
  createContext,
  useContext,
  useEffect,
  type ReactNode
} from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  type StyleProp,
  type ViewStyle
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { grytDrawerBleed } from "@gryt/theme";
import { durations, springy } from "../../motion";
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
  if (!value)
    throw new Error(`Drawer.${part} must be rendered inside Drawer.Root.`);
  return value;
}

export interface DrawerRootProps extends OpenStateProps {
  children?: ReactNode;
}

function Root({ children, ...openProps }: DrawerRootProps) {
  const state = useOpenState(openProps);
  return (
    <DrawerContext.Provider value={state}>{children}</DrawerContext.Provider>
  );
}

function Trigger({
  children,
  style
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { setOpen } = useDrawer("Trigger");
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setOpen(true)}
      style={style}
    >
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
  style
}: DrawerPopupProps) {
  const { open, setOpen } = useDrawer("Popup");
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const screen = Dimensions.get("window");
  const vertical = side === "bottom";
  const extent = vertical ? screen.height * size : screen.width * size;

  const progress = useSharedValue(0);

  /**
   * The panel is built `grytDrawerBleed` larger than it needs to be and hangs
   * that much off-screen, with matching padding so the content sits where it
   * would have.
   *
   * The spring overshoots — that is what makes it a spring — and it settles
   * onto its target from both directions. A panel sized exactly to its resting
   * place therefore shows a seam of backdrop down its edge on the undershoot,
   * for a frame or two, every time it opens. The web has had this since the
   * Drawer was written, as `--gryt-drawer-bleed`; this side did not.
   *
   * `grytDrawerBleed` rather than a local 64, and `bleedTokens.test.ts` in
   * @gryt/ui keeps it equal to what theme.css says. Two overhangs that must
   * match is how they stop matching.
   */
  const bleed = grytDrawerBleed;
  const panelExtent = extent + bleed;

  // Measured against the bleed panel, so the panel's *visible* edge lands
  // exactly off-screen rather than the overhang doing it.
  const hidden =
    side === "right" ? panelExtent : side === "left" ? -panelExtent : panelExtent;

  // 700ms, the web's `--gryt-dur-spring-soft`, on the overshooting curve —
  // which is what the web uses here despite the panel travelling its own
  // width. Matching it rather than substituting the tight curve, because the
  // brief is 1:1 with the web and not a second opinion about it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    progress.value =
      !open || reducedMotion
        ? open
          ? 1
          : 0
        : springy(1, { duration: durations.springSoft });
  }, [open, progress, reducedMotion]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [
      vertical
        ? { translateY: hidden + (0 - hidden) * progress.value }
        : { translateX: hidden + (0 - hidden) * progress.value }
    ],
    opacity: progress.value
  }));

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
          style={[
            {
              position: "absolute",
              top: side === "bottom" ? undefined : 0,
              bottom: 0,
              left: side === "right" ? undefined : 0,
              right: side === "left" ? undefined : 0,
              width: vertical ? "100%" : panelExtent,
              height: vertical ? panelExtent : "100%",
              // The overhang, and the padding that puts the content back where
              // it would have been without it.
              paddingLeft: side === "right" ? bleed : 0,
              paddingRight: side === "left" ? bleed : 0,
              paddingBottom: vertical ? bleed : 0,
              backgroundColor: theme.color.surface,
              borderColor: theme.color.border,
              borderRightWidth: side === "left" ? 1 : 0,
              borderLeftWidth: side === "right" ? 1 : 0,
              borderTopWidth: vertical ? 1 : 0,
              borderTopLeftRadius: vertical ? theme.radius.lg : 0,
              borderTopRightRadius: vertical ? theme.radius.lg : 0
            },
            panelStyle
          ]}
        >
          <Pressable onPress={() => {}} style={[{ flex: 1 }, style]}>
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Close({
  children,
  style
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { setOpen } = useDrawer("Close");
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setOpen(false)}
      style={style}
    >
      {children}
    </Pressable>
  );
}

export const Drawer = { Root, Trigger, Portal, Popup, Close };
