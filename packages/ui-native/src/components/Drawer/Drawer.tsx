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
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { grytDrawerBleed } from "@gryt/theme";
import { durations, travel as travelTo } from "../../motion";
import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { reachOf, seedFor } from "./drawerPull";
import { useTheme } from "../../theme";

export type DrawerSide = "left" | "right" | "bottom";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The caller's own reach into the panel, 0 to 1. See `DrawerRootProps`. */
  pull?: SharedValue<number>;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

/**
 * Scrollables inside the panel, so the drawer's pan can let them through. gesture-handler
 * settles two recognisers by reference, so the drawer has to be handed the scrollable.
 */

/**
 * What `simultaneousWithExternalGesture` accepts. Its types want a ref to a component
 * type, which a mounted scroll view is not — reconciled with one cast.
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
  /**
   * How far the caller has pulled the panel out, 0 shut to 1 open, for dragging it open
   * from elsewhere. It composes: the panel takes whichever of pull and spring reaches further.
   */
  pull?: SharedValue<number>;
}

function Root({ children, pull, ...openProps }: DrawerRootProps) {
  const state = useOpenState(openProps);
  const value = useMemo(
    () => ({ ...state, pull }),
    [state, pull]
  );
  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
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
 * Slides in from an edge, which is the one place an animation is not decoration. A drawer
 * that appears without moving reads as a screen change. Reduce-motion still turns it off.
 */

/**
 * The scrim takes an animated opacity, so it has to be an animated component. Declared at
 * module scope — `createAnimatedComponent` in a render remounts the subtree.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Popup({
  children,
  side = "left",
  size = 0.8,
  dismissible = true,
  style
}: DrawerPopupProps) {
  const { open, setOpen, pull } = useDrawer("Popup");
  const theme = useTheme();
  /**
   * A side panel is full height, so its first row sits under the Dynamic Island unless it
   * says otherwise. Here rather than at every caller, since the one that forgets ships it.
   */
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const screen = Dimensions.get("window");
  const vertical = side === "bottom";
  const extent = vertical ? screen.height * size : screen.width * size;

  const progress = useSharedValue(0);

  /**
   * A local stand-in so the worklets below can read one value either way. A caller that
   * passes nothing leaves it at 0, and `reach` is then `progress`.
   */
  const ownPull = useSharedValue(0);
  const pulled = pull ?? ownPull;


  /**
   * The panel is built `grytDrawerBleed` larger and hangs that much off-screen: the spring
   * settles from both directions, and an undershoot would show a seam. Never a local number.
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
   * 700ms on the tight curve, and @gryt/ui's Drawer matches. A 12% overshoot is texture on
   * a 20px thumb and a slam on a 320pt panel. Change both platforms together.
   */

  /**
   * Mounted for longer than it is open, so the panel can animate out — RN's `Modal`
   * unmounts the moment `visible` goes false.
   */
  const [mounted, setMounted] = useState(open);

  /*
   * react-hooks/set-state-in-effect is right that this derives from a prop and wrong that
   * it can derive during render: `mounted` has to stay true until the exit animation ends.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    if (reducedMotion) {
      // eslint-disable-next-line react-hooks/immutability
      progress.value = open ? 1 : 0;
      // Same as the mount above: there is no animation to wait for, so the unmount happens
      // immediately, but it is still driven by `open` having changed.

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!open) setMounted(false);
      return;
    }

    /* Opening starts from wherever a drag had got to. Springing from 0 would take the
       panel back to the edge, and the larger-of-two rule cannot save it. */
    if (open) {
      progress.value = seedFor(progress.value, pulled.value);
    }

    // eslint-disable-next-line react-hooks/immutability
    progress.value = travelTo(
      open ? 1 : 0,
      { duration: durations.springSoft },
      (finished) => {
        "worklet";
        // Unmount only once the panel is gone and only if the animation ran to the end —
        // an interrupted close means it was reopened.
        if (finished && !open) runOnJS(setMounted)(false);
      }
    );
  }, [open, mounted, progress, pulled, reducedMotion]);

  /**
   * How far the finger has dragged the panel away from open, in points. Kept off
   * `progress`: feeding a gesture through an overshooting curve lags the thumb.
   */
  const drag = useSharedValue(0);

  /**
   * How far out the panel is, from whichever is reaching further. `Math.max` rather than a
   * flag: the panel cannot go backwards, because it is always the larger of the two.
   */
  const reach = () => {
    "worklet";
    return reachOf(progress.value, pulled.value);
  };

  /* A pull off zero mounts the panel and a pull back to zero takes it away, or an abandoned
     drag leaves a Modal up with nothing in view. Only while `open` is false. */
  useAnimatedReaction(
    () => pulled.value > 0,
    (reaching, was) => {
      if (reaching === was) return;
      if (reaching) runOnJS(setMounted)(true);
      else if (!open) runOnJS(setMounted)(false);
    },
    [open]
  );

  const panelStyle = useAnimatedStyle(() => {
    const travel = hidden + (0 - hidden) * reach() + drag.value;
    return {
      // Transform only. The panel slides; it does not fade — the web's Popup declares
      // `transition-transform` and nothing else, and a fading panel reads as a dialog.
      transform: [vertical ? { translateY: travel } : { translateX: travel }]
    };
  });

  /**
   * The scrim fades with the panel and thins further as it is dragged away, both the web's
   * rules. The fade is the backdrop's, not the Popup's — without it the scrim blinks off.
   */
  const scrimStyle = useAnimatedStyle(() => {
    const dragged = extent > 0 ? Math.min(1, Math.abs(drag.value) / extent) : 0;
    return { opacity: reach() * (1 - dragged) };
  });

  /**
   * Swipe to dismiss (GRYT-395), on gesture-handler rather than `PanResponder`, which
   * cannot negotiate with a native scroll recogniser. The callbacks stay worklets.
   */

  /**
   * Scrollables that have announced themselves. State rather than a ref, so the pan
   * rebuilds: a child's ref is still empty at the detector's first attach.
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

    /* Claim only a drag heading the way the panel closes, and only past 8pt. `failOffset`
     * on the other axis hands a cross-axis drag to whatever is scrolling. */
    if (vertical) {
      gesture.activeOffsetY(8).failOffsetX([-12, 12]);
    } else {
      gesture.activeOffsetX(closingSign * 8).failOffsetY([-12, 12]);
    }

    /* Let the scrollables run, or the drawer's recogniser wins and a list inside the panel
     * cannot move (GRYT-431). What goes is the blocking before either has decided. */
    if (scrollables.length > 0) {
      gesture.simultaneousWithExternalGesture(...scrollables);
    }

    /* Every `drag.value = …` below runs in a worklet on the UI thread. react-hooks cannot
     * see through the closure and reads a shared value being assigned during render. */

    /* eslint-disable react-hooks/immutability */
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

        /* Half the panel, or a flick. Velocity is points per second here, where
         * `PanResponder` reported points per millisecond. */
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
    /* eslint-enable react-hooks/immutability */
  }, [dismissible, drag, extent, scrollables, setOpen, side, vertical]);

  /**
   * Leftover drag springs back on open and is cleared on `mounted`, not on `open` going
   * false — that happens the instant a swipe dismisses (GRYT-429).
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
                // The overhang hangs off the edge the panel comes from, which is the only
                // direction that helps: added to the width, the panel grew inwards instead.
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
 * Announce a scrollable to the drawer around it. Silently does nothing outside
 * a `Drawer.Popup`, so a shared component can use it either way.
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
 * The scroll view to use inside a drawer. React Native's own will not scroll in there:
 * gesture-handler settles the two recognisers by reference, and this is the introduction.
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
