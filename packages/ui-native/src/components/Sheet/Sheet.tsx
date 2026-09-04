import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { grytDrawerBleed } from "@gryt/theme";
import { durations, easeSpringTight } from "../../motion";
import { useOpenState, type OpenStateProps } from "../../overlay/useOpenState";
import { useTheme } from "../../theme";
import { nextPresentation } from "./presentation";

/**
 * A bottom sheet, which is the phone's modal. `@gryt/ui` has no counterpart on
 * purpose: a sheet is dragged, settles at heights the user chooses, and is
 * dismissed with a flick, so it is an addition rather than a web component
 * ported across.
 *
 * On `@gorhom/bottom-sheet` rather than by hand, unlike Slider and Tabs —
 * velocity dismiss, snap points, keyboard avoidance and the drag-to-scroll
 * handoff are generic and are months of edge cases. The library supplies
 * behaviour only; every colour and dimension comes from the theme.
 *
 * **`SheetProvider` has to be mounted above anything that renders a Sheet.**
 * This is `BottomSheetModal`, which portals to the provider at the app root —
 * a plain `BottomSheet` anchors to its slot in the layout, so written inline it
 * appears partway down the page and reads as entering from the top.
 */

export interface SheetProviderProps {
  children?: ReactNode;
}

/** Mount once, at the root. See the note above for why it is required. */
export function SheetProvider({ children }: SheetProviderProps) {
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>;
}

interface SheetContextValue {
  open: () => void;
  close: () => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheet(part: string) {
  const value = useContext(SheetContext);
  if (!value) throw new Error(`Sheet.${part} must be rendered inside Sheet.`);
  return value;
}

export interface SheetProps extends OpenStateProps {
  /**
   * Heights the sheet settles at, as percentages or points.
   *
   * The web has no equivalent concept — a dialog is one size — which is part of
   * why this is its own component rather than a Drawer with a prop.
   */
  snapPoints?: (string | number)[];
  children?: ReactNode;
}

/**
 * `open` with `onOpenChange` drives it from outside; `defaultOpen` alone lets it
 * manage itself. Without the controlled form a sheet opened by anything that is
 * not a Pressable had to be remounted to open at all, throwing the body away.
 */
function Root({
  snapPoints = ["50%"],
  children,
  ...openProps
}: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const state = useOpenState(openProps);
  const { open: isOpen, setOpen } = state;

  // Asking for the state rather than reaching for the ref, so a controlled
  // Sheet's parent gets the final say — `setOpen` on a controlled overlay
  // reports and does not decide. The effect in `Content` is what actually
  // presents, once the modal it presents exists.
  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);

  const context = useMemo<SheetContextValue>(() => ({ open, close }), [open, close]);

  return (
    <SheetContext.Provider value={context}>
      <SheetRefContext.Provider value={{ ref, isOpen, setOpen, snapPoints }}>
        {children}
      </SheetRefContext.Provider>
    </SheetContext.Provider>
  );
}

interface SheetRefValue {
  ref: React.RefObject<BottomSheetModal | null>;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  snapPoints: (string | number)[];
}

const SheetRefContext = createContext<SheetRefValue | null>(null);

export interface SheetTriggerProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A Pressable, like every other trigger in this package — which means its
 * children have to be plain visual content. Nesting a Button inside one gives
 * the inner pressable the touch and the sheet never opens, silently. Same
 * footgun the overlay triggers already carry.
 */
function Trigger({ children, style }: SheetTriggerProps) {
  const sheet = useSheet("Trigger");
  return (
    <Pressable onPress={sheet.open} style={style}>
      {children}
    </Pressable>
  );
}

/**
 * Everything about presenting the modal, shared by `Content` and `ScrollView`.
 *
 * The two are alternatives rather than one inside the other, so both need the
 * whole `BottomSheetModal` — the effect that presents it, the backdrop, the
 * background and the animation curve. This is that, once.
 */
function useSheetModal() {
  const theme = useTheme();
  /**
   * Both ends. At the tall snap point the content runs under the Dynamic Island
   * without `topInset`; at the other the home indicator clips a control row
   * ending flush with the sheet.
   */
  const insets = useSafeAreaInsets();
  const state = useContext(SheetRefContext);
  // Read here, in the normal tree, and handed back down below — see the note
  // on the provider inside the modal.
  const sheet = useContext(SheetContext);
  if (!state || !sheet) {
    throw new Error("Sheet.Content and Sheet.ScrollView must be rendered inside Sheet.");
  }

  const { ref, isOpen, setOpen, snapPoints } = state;

  /**
   * `present` and `dismiss` rather than mounting by hand: the modal is always
   * rendered and the provider decides whether it is on screen. Here rather than
   * in `Root`, which runs before there is a `ref`.
   *
   * **`presented` is not droppable bookkeeping.** Dismissing a modal that has
   * never been presented takes it *out* of the provider's registry, after which
   * `present()` is a no-op and the sheet never opens again — which reads as the
   * open prop being ignored.
   *
   * **It has to be cleared by `onDismiss` too.** A flick down dismisses the
   * modal and then tells React, so the following effect finds `presented` still
   * true and calls `dismiss()` on a modal that is already gone.
   */
  const presented = useRef(false);

  useEffect(() => {
    const next = nextPresentation(isOpen, presented.current);
    presented.current = next.presented;

    if (next.action === "present") ref.current?.present();
    else if (next.action === "dismiss") ref.current?.dismiss();
  }, [isOpen, ref]);

  // The modal renders nothing until it is presented, so there is no invisible
  // backdrop sitting over the screen eating taps while it is closed. That was
  // a real hazard with the inline version and had to be handled by unmounting.
  /**
   * The sheet's own background, which `backgroundStyle` cannot draw: it paints
   * a view sized exactly to the sheet, and the container `style` sits outside
   * the rounded corners, so a border there draws a straight line above the
   * rounded top.
   *
   * It also hangs `grytDrawerBleed` below the bottom edge, because the spring
   * overshoots and a sheet sized exactly to its snap point leaves a band of
   * backdrop for a frame or two. Same trick and distance as the web Drawer.
   */
  const renderBackground = useCallback(
    ({ style: bgStyle }: BottomSheetBackgroundProps) => (
      <View
        pointerEvents="none"
        style={[
          bgStyle,
          {
            backgroundColor: theme.color.surface,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            // Follows the rounded corners, unlike a border on the container.
            borderTopWidth: 1,
            borderColor: theme.color.border,
            // The overhang. Negative bottom rather than extra height, so the
            // rounded top stays where the sheet actually is.
            bottom: -grytDrawerBleed,
          },
        ]}
      />
    ),
    [theme],
  );

  /**
   * Gryt's spring, not gorhom's default. `withTiming` over the sampled curve,
   * since @gryt/theme's is a damped spring solved analytically and a physics
   * engine would approximate the thing it was chosen over.
   *
   * `springSlow` rather than a Drawer's 700, because a sheet travels further —
   * the same duration over a longer distance reads as a snap rather than a
   * slide.
   *
   * **`easeSpringTight`, not `easeSpring`.** `easing.ts` labels the loose one
   * as "for things that scale in place" and the tight one "for things that
   * travel inside bounds". On a sheet the overshooting edge is the top, so it
   * reads as failing to land rather than as bounce.
   */
  const animationConfigs = useBottomSheetTimingConfigs({
    duration: durations.springSlow,
    easing: easeSpringTight,
  });

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        // Tracks the drag, so dragging the sheet down lightens the scrim
        // rather than holding full opacity until it snaps shut.
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  return {
    theme,
    insets,
    /* Re-provided inside the modal by whichever part renders the children. See
     * the note at the call sites — `@gorhom/portal` does not carry context. */
    sheet,
    modalProps: {
      ref,
      snapPoints,
      // So a sheet at 100% stops below the Dynamic Island rather than running
      // its content under it.
      topInset: insets.top,
      // Off, because `snapPoints` is the whole point of this component.
      //
      // gorhom v5 defaults dynamic sizing on, which measures the content and
      // sizes the sheet to it — overriding the snap points entirely. A sheet
      // asked for 70% whose content had no intrinsic height collapsed to the
      // height of its own footer, which looks like the snap points being
      // ignored because they were.
      enableDynamicSizing: false,
      enablePanDownToClose: true,
      // A flick down or a tap on the backdrop closes it without anything in
      // React asking, so the state has to be told. Uncontrolled, this is what
      // makes the next `present` work; controlled, it is how the parent finds
      // out its sheet is gone.
      //
      // `presented` first, and not as a tidy-up: the modal has already
      // dismissed itself by the time this runs, and leaving the ref true lets
      // the effect below dismiss it a second time. See the note on the ref.
      onDismiss: () => {
        presented.current = false;
        setOpen(false);
      },
      animationConfigs,
      backdropComponent: renderBackdrop,
      backgroundComponent: renderBackground,
      handleIndicatorStyle: {
        backgroundColor: theme.color.border,
        width: 36,
        height: 4,
      },
    },
  };
}

export interface SheetContentProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * The sheet's body, for content that fits. Use `Sheet.ScrollView` when it might
 * not — `BottomSheetView` sizes itself to its children, so a scrollable inside
 * has no bounded height and grows until the sheet clips it.
 *
 * **`height: "100%"`, because `flex: 1` is not enough**: with no bounded height
 * to be all of, anything wanting to be the whole sheet collapses to its own
 * content. It sits before `style`, so a caller can still override it (GRYT-516).
 */
function Content({ children, style }: SheetContentProps) {
  const { theme, insets, sheet, modalProps } = useSheetModal();

  return (
    <BottomSheetModal {...modalProps}>
      <BottomSheetView
        style={[
          {
            flex: 1,
            height: "100%",
            padding: theme.space(4),
            // The home indicator's strip, on top of whatever padding the caller
            // asked for. Without it the last row of content is clipped by it —
            // reported as the voice controls being cut off at the bottom.
            paddingBottom: theme.space(4) + insets.bottom,
          },
          style,
        ]}
      >
        {/*
          The context is provided a second time, inside the modal, and it has
          to be.

          `BottomSheetModal` teleports its children with `@gorhom/portal`,
          which does not render them through a React portal — it renders them
          in a different tree, under the provider at the app root. React
          context does not survive that, so anything below here looking for
          `SheetContext` finds nothing.

          What that looked like: the sheet presented correctly and then threw
          "Sheet.Close must be rendered inside Sheet." from inside its own
          content. Nothing about the error points at teleporting, and it only
          happens for the parts that read context — a Sheet whose content is
          plain text works fine, which is exactly how this would have shipped.
        */}
        <SheetContext.Provider value={sheet}>{children}</SheetContext.Provider>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

export type SheetScrollViewProps = ComponentProps<typeof BottomSheetScrollView>;

/**
 * The sheet's body, for content that might not fit.
 *
 * **In place of `Sheet.Content`, not inside it.** RN's own `ScrollView` does not
 * scroll in a sheet: gesture-handler settles the pan and the native scroll
 * recogniser by reference, so they have to know about each other.
 *
 * It bundles the four things three callers had to get right together — bounded
 * height, no padding on the container, the keyboard inset, and
 * `keyboardShouldPersistTaps`, without which the first tap only dismisses the
 * keyboard (GRYT-492).
 *
 * **It does not decide the snap point.** A sheet taking a keyboard wants a tall
 * one; at 46% the field and its button are both behind the keyboard.
 */
function ScrollView({
  children,
  style,
  contentContainerStyle,
  ...props
}: SheetScrollViewProps) {
  const { theme, insets, sheet, modalProps } = useSheetModal();

  return (
    <BottomSheetModal {...modalProps}>
      <BottomSheetScrollView
        // The keyboard's height as a bottom inset, so what it covers can still
        // be scrolled into what is left of the sheet.
        automaticallyAdjustKeyboardInsets
        // Or the first tap on anything only dismisses the keyboard, and the
        // button has to be pressed twice.
        keyboardShouldPersistTaps="handled"
        {...props}
        style={[{ flex: 1 }, style]}
        contentContainerStyle={[
          {
            padding: theme.space(4),
            // The home indicator's strip, as in `Content`.
            paddingBottom: theme.space(4) + insets.bottom,
          },
          contentContainerStyle,
        ]}
      >
        {/* Provided again for the same reason as in `Content`. */}
        <SheetContext.Provider value={sheet}>{children}</SheetContext.Provider>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

export interface SheetCloseProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Close({ children, style }: SheetCloseProps) {
  const sheet = useSheet("Close");
  return (
    <Pressable onPress={sheet.close} style={style}>
      {children}
    </Pressable>
  );
}

export interface SheetTitleProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Title({ children, style }: SheetTitleProps) {
  const theme = useTheme();
  return (
    <View style={style}>
      <Text
        accessibilityRole="header"
        style={{
          color: theme.color.text,
          fontSize: 18,
          fontWeight: "600",
          marginBottom: theme.space(2),
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export const Sheet = Object.assign(Root, {
  Trigger,
  Content,
  ScrollView,
  Close,
  Title,
});
