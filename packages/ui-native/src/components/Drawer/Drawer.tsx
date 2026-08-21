import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Modal,
  Pressable,
  type StyleProp,
  type ViewStyle
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { grytDrawerBleed } from "@gryt/theme";
import { durations, springy, travel as travelTo } from "../../motion";
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
/**
 * The scrim takes an animated opacity, so it has to be an animated component.
 * Declared once at module scope — `createAnimatedComponent` inside a render
 * makes a new component type every time, which remounts the subtree.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Popup({
  children,
  side = "left",
  size = 0.8,
  dismissible = true,
  style
}: DrawerPopupProps) {
  const { open, setOpen } = useDrawer("Popup");
  const theme = useTheme();
  /**
   * The phone's own furniture, which a drawer has to stay clear of.
   *
   * A panel from the side is full height by definition, so its first row sits
   * under the Dynamic Island and its last under the home indicator unless it
   * says otherwise. A panel from the bottom only has the second problem.
   *
   * This is the same call GRYT-402 made for `Sheet`, and it belongs here for
   * the same reason: every caller would otherwise write the same two lines, and
   * the one that forgets ships a drawer with its heading under the clock. That
   * is how the mobile shell's server switcher first looked.
   */
  const insets = useSafeAreaInsets();
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

  /**
   * 700ms on the *tight* curve, and this changed on both platforms at once.
   *
   * It used to be the overshooting one, matching the web, with a note saying
   * that a panel travelling its own width is exactly the case
   * `--ease-spring-tight` was added for — and that if it ever felt wrong on a
   * device, the web was what was wrong and both should change together.
   *
   * It felt wrong on a device. A full-height panel arriving with a 12%
   * overshoot reads as aggressive rather than lively, because the overshoot is
   * a percentage of the travel and the travel here is most of the screen. The
   * same 12% on a 20px switch thumb is texture; on a 320pt panel it is a slam.
   *
   * `@gryt/ui`'s Drawer moved to `ease-spring-tight` in the same change.
   */
  /**
   * Mounted for longer than it is open, so the panel can animate out.
   *
   * React Native's `Modal` unmounts the moment `visible` goes false, and the
   * close was also snapping `progress` straight to 0 rather than animating it
   * — so a dismissed drawer did not slide away, it simply stopped existing.
   * Both halves had to change: animate the close, and stay mounted until that
   * animation has finished.
   */
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    if (reducedMotion) {
      // eslint-disable-next-line react-hooks/immutability
      progress.value = open ? 1 : 0;
      if (!open) setMounted(false);
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    progress.value = travelTo(
      open ? 1 : 0,
      { duration: durations.springSoft },
      (finished) => {
        "worklet";
        // Unmount only once the panel is actually gone, and only if the
        // animation ran to the end — an interrupted close means it was
        // reopened, and unmounting then would take the drawer away as it
        // arrives.
        if (finished && !open) runOnJS(setMounted)(false);
      }
    );
  }, [open, mounted, progress, reducedMotion]);

  /**
   * How far the finger has dragged the panel away from open, in points.
   *
   * Separate from `progress` rather than folded into it. `progress` is
   * animated on the spring, and a drag has to track the finger exactly —
   * feeding a gesture through an overshooting curve makes the panel lead and
   * lag the thumb, which reads as the drawer being slippery.
   */
  const drag = useSharedValue(0);

  const panelStyle = useAnimatedStyle(() => {
    const travel = hidden + (0 - hidden) * progress.value + drag.value;
    return {
      // Transform only. The panel slides; it does not fade. This used to carry
      // `opacity: progress.value`, which the web's Popup does not — it declares
      // `transition-transform` and nothing else — and a panel that fades as it
      // arrives reads as a dialog rather than a drawer.
      transform: [vertical ? { translateY: travel } : { translateX: travel }]
    };
  });

  /**
   * The scrim fades with the panel, and thins further as it is dragged away.
   *
   * Two separate rules, both the web's:
   *
   * ```
   * "[opacity:calc(1-var(--drawer-swipe-progress,0))]",
   * "transition-opacity duration-(--gryt-dur-spring-soft) ease-spring-tight",
   * "data-starting-style:opacity-0 data-ending-style:opacity-0",
   * ```
   *
   * The first is the drag term. The other two are the fade: the backdrop
   * starts and ends at zero, over the same duration and easing as the panel's
   * slide. `progress` already runs on `travel`, which is `easeSpringTight` at
   * `springSoft` — so multiplying by it is the same curve, not a new one.
   *
   * GRYT-408 took the fade out, on the grounds that "the web's Popup declares
   * `transition-transform` and nothing else". That is true, and it is about
   * `Drawer.Popup` — the panel, which still only translates. The backdrop is a
   * different element and says the opposite. Without the fade the scrim was at
   * full strength before the panel was on screen and stayed there while it slid
   * away, then blinked off with the Modal.
   */
  const scrimStyle = useAnimatedStyle(() => {
    const dragged = extent > 0 ? Math.min(1, Math.abs(drag.value) / extent) : 0;
    return { opacity: progress.value * (1 - dragged) };
  });

  /**
   * Swipe to dismiss, which the web has had from Base UI's drawer primitive
   * and this did not have at all (GRYT-395). A drawer you cannot push back is
   * the thing a drawer is for.
   *
   * `PanResponder` rather than react-native-gesture-handler: the Slider proved
   * this path works from this package's prebuilt output today, and an attempt
   * at gesture-handler from here failed for reasons still not understood
   * (GRYT-393). This is not the place to retry that.
   */
  const gesture = useRef({ extent, side, vertical, dismissible, setOpen });
  useEffect(() => {
    gesture.current = { extent, side, vertical, dismissible, setOpen };
  }, [extent, side, vertical, dismissible, setOpen]);

  /* eslint-disable react-hooks/refs */
  const [responder] = useState(() =>
    PanResponder.create({
      // Claimed on move, not on start. Claiming on start would swallow every
      // tap on the panel's own content — buttons inside a drawer would stop
      // working, which is a far worse bug than not being able to swipe.
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) => {
        if (!gesture.current.dismissible) return false;
        // Only once the drag is clearly along the axis the panel closes on,
        // and clearly a drag rather than a slow press. Anything else belongs
        // to whatever is inside.
        const along = gesture.current.vertical ? g.dy : g.dx;
        const across = gesture.current.vertical ? g.dx : g.dy;
        return Math.abs(along) > 8 && Math.abs(along) > Math.abs(across);
      },
      // Once it is ours it stays ours, for the same reason the Slider needs
      // this: the default is to grant, and a ScrollView inside the drawer
      // would take the drag back mid-swipe.
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_e, g) => {
        const { vertical: v, side: sd } = gesture.current;
        const raw = v ? g.dy : g.dx;
        // Clamped to the closing direction. Dragging a left drawer rightwards
        // should do nothing, not tear it off its edge.
        const closing = sd === "left" ? Math.min(0, raw) : Math.max(0, raw);
        // eslint-disable-next-line react-hooks/immutability
        drag.value = closing;
      },
      onPanResponderRelease: (_e, g) => {
        const { vertical: v, side: sd, extent: ex } = gesture.current;
        const moved = Math.abs(v ? g.dy : g.dx);
        const speed = Math.abs(v ? g.vy : g.vx);
        // Half the panel, or a flick. The velocity term is what makes a short
        // sharp swipe work — without it you have to drag the whole way, which
        // is the difference between a drawer and a slow puzzle.
        const dismiss = moved > ex / 2 || speed > 0.5;

        if (dismiss) {
          gesture.current.setOpen(false);
          // Left where it is: the close animation runs from here, and resetting
          // it first would snap the panel back before it left.
          return;
        }
        // eslint-disable-next-line react-hooks/immutability
        drag.value = travelTo(0, { duration: durations.springSoft });
      },
      onPanResponderTerminate: () => {
        // eslint-disable-next-line react-hooks/immutability
        drag.value = travelTo(0, { duration: durations.springSoft });
      }
    })
  );
  /* eslint-enable react-hooks/refs */

  // Cleared once the panel is closed, so the next open does not start from
  // wherever the last swipe left it.
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/immutability
      drag.value = 0;
    }
  }, [open, drag]);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={dismissible ? () => setOpen(false) : undefined}
    >
      <AnimatedPressable
        onPress={dismissible ? () => setOpen(false) : undefined}
        style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }, scrimStyle]}
      >
        <Animated.View
          accessibilityViewIsModal
          {...responder.panHandlers}
          style={[
            {
              position: "absolute",
              // The overhang hangs *off* the edge the panel comes from, which
              // is the only direction that helps. It used to be added to the
              // width instead, so the panel grew inwards — 64pt more of the
              // screen covered, and the seam it was meant to hide still there,
              // because the gap opens on the entering edge and that is the edge
              // the extra material was not on.
              top: side === "bottom" ? undefined : 0,
              bottom: vertical ? -bleed : 0,
              left: side === "right" ? undefined : side === "left" ? -bleed : 0,
              right: side === "left" ? undefined : side === "right" ? -bleed : 0,
              width: vertical ? "100%" : panelExtent,
              height: vertical ? panelExtent : "100%",
              // Puts the content back where it would have been without the
              // overhang, so `size` still means what it says.
              paddingLeft: side === "left" ? bleed : 0,
              paddingRight: side === "right" ? bleed : 0,
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
          <Pressable
            onPress={() => {}}
            style={[
              {
                flex: 1,
                // Before the caller's style, so a drawer that wants to run
                // under the island — a full-bleed image, say — still can.
                paddingTop: vertical ? 0 : insets.top,
                paddingBottom: insets.bottom
              },
              style
            ]}
          >
            {children}
          </Pressable>
        </Animated.View>
      </AnimatedPressable>
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
