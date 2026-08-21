import {
  createContext,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  type StyleProp,
  type ViewStyle
} from "react-native";
import {
  FlatList as GestureFlatList,
  Gesture,
  GestureDetector,
  ScrollView as GestureScrollView
} from "react-native-gesture-handler";
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

/**
 * Scrollables inside the panel, so the drawer's pan can be told to let them
 * through.
 *
 * gesture-handler settles two recognisers by reference — there is no way to say
 * "defer to whatever scrollable happens to be in there". A drawer's children
 * are the caller's, so the drawer cannot find them; they have to announce
 * themselves. That is why this is a scrollable the drawer hands you rather than
 * a prop you point at one, and it is the same answer `@gorhom/bottom-sheet`
 * reaches with `BottomSheetScrollView`.
 */
/**
 * What `simultaneousWithExternalGesture` accepts.
 *
 * gesture-handler types its external references as a ref to a *component type*,
 * which a mounted scroll view is not. That typing predates the current API and
 * the value it wants is the instance, so the two are reconciled with one cast
 * where a scrollable registers itself, rather than by loosening everything
 * this passes through.
 */
type ScrollableRef = RefObject<ComponentType<object> | null | undefined>;

interface DrawerScrollables {
  register: (ref: ScrollableRef) => void;
  unregister: (ref: ScrollableRef) => void;
}

const DrawerScrollContext = createContext<DrawerScrollables | null>(null);

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
    side === "right"
      ? panelExtent
      : side === "left"
        ? -panelExtent
        : panelExtent;

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
   * `react-native-gesture-handler` rather than `PanResponder`. That was the
   * other way round because gesture callbacks from this package's prebuilt
   * output were measured doing nothing (GRYT-393) — the babel plugin was not
   * reaching `node_modules`, so nothing became a worklet. Measured again on
   * 2026-08-21 with a probe built inside this package: both worklet and
   * `runOnJS` callbacks report correctly. Whatever it was, it is fixed, and
   * `PanResponder` was only ever the fallback.
   *
   * The reason to move is what the axis constraints below buy. `PanResponder`
   * cannot negotiate with a native scroll recogniser, so the old version kept
   * the drag with `onPanResponderTerminationRequest: () => false` — which
   * works by never handing the gesture back, and stops a `ScrollView` inside
   * the drawer scrolling at all. Here the pan simply fails on a cross-axis
   * drag and the scrollable gets it, which is the same rule the web relies on
   * the browser for.
   *
   * The callbacks stay worklets. Running them on the JS thread would be
   * simpler and would give up the whole point: the panel tracks the finger on
   * the UI thread, with nothing to be blocked by a busy bridge.
   */
  /**
   * Scrollables that have announced themselves, and the pan is rebuilt when one
   * does.
   *
   * State rather than a ref precisely so it rebuilds: gesture-handler resolves
   * these when the gesture is attached, and a child's ref is still empty at the
   * detector's first attach. Registering flips this, the memo below runs again,
   * and the detector re-attaches with something to point at.
   */
  const [scrollables, setScrollables] = useState<ScrollableRef[]>([]);

  const scrollRegistry = useMemo<DrawerScrollables>(
    () => ({
      register: (ref) =>
        setScrollables((current) =>
          current.includes(ref) ? current : [...current, ref]
        ),
      unregister: (ref) =>
        setScrollables((current) => current.filter((r) => r !== ref))
    }),
    []
  );

  const pan = useMemo(() => {
    const closingSign = side === "left" ? -1 : 1;

    const gesture = Gesture.Pan().enabled(dismissible);

    /* Claim only a drag heading the way the panel closes, and only once it is
     * clearly a drag rather than a slow press — 8pt, the same threshold the
     * old responder used. `failOffset` on the other axis is the half that
     * `PanResponder` had no answer for: a finger moving across the panel is
     * somebody scrolling its contents, and this hands that over rather than
     * swallowing it. */
    if (vertical) {
      gesture.activeOffsetY(8).failOffsetX([-12, 12]);
    } else {
      gesture.activeOffsetX(closingSign * 8).failOffsetY([-12, 12]);
    }

    /* Let the scrollables run. Without this the drawer's recogniser competes
     * with the scroll view's and wins, so a list inside the panel cannot move —
     * which it could not, on either `PanResponder` or a bare pan (GRYT-431).
     *
     * "Simultaneous" overstates what happens: the axis rules above mean this
     * pan does not activate on a vertical drag at all, so in practice the
     * scroll view has it alone. What this removes is the blocking that was
     * happening before either of them had decided anything. */
    if (scrollables.length > 0) {
      gesture.simultaneousWithExternalGesture(...scrollables);
    }

    return gesture
      .onUpdate((event) => {
        "worklet";
        const raw = vertical ? event.translationY : event.translationX;
        // Clamped to the closing direction. Dragging a left drawer rightwards
        // should do nothing, not tear it off its edge.
        drag.value = closingSign < 0 ? Math.min(0, raw) : Math.max(0, raw);
      })
      .onEnd((event) => {
        "worklet";
        const moved = Math.abs(
          vertical ? event.translationY : event.translationX
        );
        const speed = Math.abs(vertical ? event.velocityY : event.velocityX);

        /* Half the panel, or a flick. The velocity term is what makes a short
         * sharp swipe work — without it you have to drag the whole way, which
         * is the difference between a drawer and a slow puzzle.
         *
         * Gesture-handler reports velocity in points per second where
         * `PanResponder` reported points per millisecond, so the old `0.5`
         * became 500. Same gesture, different unit — worth stating, because
         * carrying the number across unchanged would have made a flick need to
         * be a thousand times faster and looked like the velocity term simply
         * not working.
         */
        if (moved > extent / 2 || speed > 500) {
          // Left where it is: the close animation runs from here, and snapping
          // it back first would show the panel returning before it left.
          runOnJS(setOpen)(false);
          return;
        }
        drag.value = travelTo(0, { duration: durations.springSoft });
      })
      .onFinalize((_event, success) => {
        "worklet";
        // A gesture cancelled by the system — an incoming call, a parent
        // taking over — leaves the panel wherever the finger was.
        if (!success)
          drag.value = travelTo(0, { duration: durations.springSoft });
      });
  }, [dismissible, drag, extent, scrollables, setOpen, side, vertical]);

  /**
   * Any leftover drag goes back as the panel opens, and is cleared once it is
   * gone.
   *
   * Two moments, deliberately. Clearing on `open` going false was wrong: that
   * happens the instant a swipe dismisses, so the panel jumped back to fully
   * open and then slid out — exactly what the release handler above says must
   * not happen (GRYT-429). `mounted` is the moment the panel is actually off
   * screen, where a hard reset costs nothing to look at.
   */
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/immutability
      drag.value = travelTo(0, { duration: durations.springSoft });
    }
  }, [open, drag]);

  useEffect(() => {
    if (!mounted) {
      // eslint-disable-next-line react-hooks/immutability
      drag.value = 0;
    }
  }, [mounted, drag]);

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
        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
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
                left:
                  side === "right" ? undefined : side === "left" ? -bleed : 0,
                right:
                  side === "left" ? undefined : side === "right" ? -bleed : 0,
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
              <DrawerScrollContext.Provider value={scrollRegistry}>
                {children}
              </DrawerScrollContext.Provider>
            </Pressable>
          </Animated.View>
        </GestureDetector>
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

/**
 * Announce a scrollable to the drawer around it, for as long as it is mounted.
 *
 * Silently does nothing outside a `Drawer.Popup`, which is the right answer for
 * a component that is only ever a scroll view with one extra job — throwing
 * would make it unusable in any shared piece that might or might not be in a
 * drawer.
 */
function useRegisterScrollable(ref: RefObject<unknown>) {
  const asExternal = ref as ScrollableRef;
  const registry = useContext(DrawerScrollContext);
  const register = registry?.register;
  const unregister = registry?.unregister;

  useEffect(() => {
    if (!register || !unregister) return;
    register(asExternal);
    return () => unregister(asExternal);
  }, [asExternal, register, unregister]);
}

export type DrawerScrollViewProps = ComponentProps<typeof GestureScrollView>;

/**
 * The scroll view to use inside a drawer.
 *
 * React Native's own will not scroll in there: the drawer's pan and the scroll
 * view's native recogniser both want the touch, and gesture-handler settles
 * that by reference — which means the two have to know about each other. This
 * is that introduction, and it is why the drawer hands you a scrollable rather
 * than taking a prop pointing at one.
 */
function DrawerScrollView(props: DrawerScrollViewProps) {
  const ref = useRef(null);
  useRegisterScrollable(ref);
  return <GestureScrollView ref={ref} {...props} />;
}

export type DrawerFlatListProps<ItemT> = ComponentProps<
  typeof GestureFlatList<ItemT>
>;

/** The same, for a list long enough to deserve one. */
function DrawerFlatList<ItemT>(props: DrawerFlatListProps<ItemT>) {
  const ref = useRef(null);
  useRegisterScrollable(ref);
  return <GestureFlatList ref={ref} {...props} />;
}

export const Drawer = {
  Root,
  Trigger,
  Portal,
  Popup,
  Close,
  ScrollView: DrawerScrollView,
  FlatList: DrawerFlatList
};
