import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
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
 * A bottom sheet, which is the phone's modal.
 *
 * `@gryt/ui` has no counterpart, and that is deliberate rather than an
 * oversight to be corrected later. A sheet is what a phone does where the web
 * opens a dialog or slides a drawer, and the two are not the same interaction:
 * a sheet is dragged, it settles at heights the user chooses, and dismissing it
 * is a flick rather than a click on an X. Shipping the web's Dialog on a phone
 * would be 1:1 and wrong; inventing a sheet on the web would be worse. So this
 * is an addition, and the README lists it as one.
 *
 * Built on `@gorhom/bottom-sheet` rather than by hand, which is the opposite of
 * the call made for Slider and Tabs, and the reason is the shape of the
 * problem. Those were shallow and Gryt-specific — a press scale is four lines
 * and no library will give you the right one. A sheet is deep and generic:
 * velocity-based dismiss, snap points, keyboard avoidance, a backdrop whose
 * opacity tracks the drag, and the handoff between dragging the sheet and
 * scrolling the content inside it. None of that is about Gryt and all of it is
 * months of edge cases.
 *
 * The library supplies behaviour only. Every colour, radius and dimension below
 * comes from the theme.
 *
 * **`SheetProvider` has to be mounted above anything that renders a Sheet**,
 * next to `ToastProvider` and `TooltipProvider`. That is not ceremony: this is
 * `BottomSheetModal`, not `BottomSheet`, and the difference is where the sheet
 * is anchored.
 *
 * `BottomSheet` positions itself inside whatever container it is rendered in.
 * Written inline in a screen, as this was first, it anchors to its slot in the
 * layout — so it appeared partway down the page with the content behind it
 * showing through, and read as entering from the top. `BottomSheetModal`
 * portals to the provider instead, which sits at the app root, so it is always
 * anchored to the bottom of the screen no matter where the call site is.
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
 * `open` with `onOpenChange` drives it from outside; `defaultOpen` alone lets
 * it manage itself. That is `useOpenState`, which every other overlay in this
 * package already uses — Sheet was the one that did not, and took `defaultOpen`
 * and a `Trigger` and nothing else.
 *
 * What that cost a caller: a sheet opened by something that is not a Pressable
 * — a tab bar item, a notification, a deep link — had to be unmounted and
 * remounted with `defaultOpen` to open it at all, which throws the body away on
 * every open. The mobile app shell did exactly that, twice.
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

export interface SheetContentProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

function Content({ children, style }: SheetContentProps) {
  const theme = useTheme();
  /**
   * The phone's own furniture, which the sheet has to stay clear of at both
   * ends.
   *
   * At the tall snap point the sheet reaches the top of the screen, and without
   * `topInset` its content runs under the Dynamic Island. At the other end the
   * home indicator sits over the last few points, and a control row ending
   * flush with the sheet is clipped by it.
   */
  const insets = useSafeAreaInsets();
  const state = useContext(SheetRefContext);
  // Read here, in the normal tree, and handed back down below — see the note
  // on the provider inside the modal.
  const sheet = useContext(SheetContext);
  if (!state || !sheet) {
    throw new Error("Sheet.Content must be rendered inside Sheet.");
  }

  const { ref, isOpen, setOpen, snapPoints } = state;

  /**
   * `present` and `dismiss` rather than mounting and unmounting by hand: the
   * modal is always rendered and the provider decides whether it is on screen,
   * which is what removes the mount-then-snap-on-the-next-frame dance the
   * inline version needed.
   *
   * Here rather than in `Root` because `ref` is attached to the modal below,
   * and `Root` runs before there is one.
   *
   * `presented` is not bookkeeping that could be dropped. A closed Sheet runs
   * this effect once on mount with `isOpen` false, and dismissing a modal that
   * has never been presented takes it *out* of the provider's registry — after
   * which `present()` is a no-op and the sheet never opens again. It looks like
   * the open prop being ignored, and it is not: it is the close that ran first.
   *
   * **It has to be cleared by `onDismiss` as well**, which is the other way a
   * sheet stops being presented and the one this missed. A flick down dismisses
   * the modal itself and *then* tells React, so the effect that follows finds
   * `presented` still true and calls `dismiss()` on a modal that is already
   * gone — the same unregistering call the ref exists to prevent, arriving by
   * the other door. Every sheet in the app so far was opened by a trigger and
   * closed for good, so nothing noticed until something wanted one back.
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
   * The sheet's own background, drawn here rather than left to `backgroundStyle`.
   *
   * Two things needed fixing and one prop could not do either.
   *
   * `backgroundStyle` paints a view sized exactly to the sheet, and the
   * container `style` sits outside the rounded corners — so a border on the
   * container drew a straight line across the full width above the rounded top,
   * which is the stray line that was reported.
   *
   * And the spring overshoots. A sheet sized exactly to its snap point travels
   * past it and leaves a band of backdrop along the bottom of the screen for a
   * frame or two. So this hangs `grytDrawerBleed` below the bottom edge, which
   * is the same trick and the same distance the web Drawer uses — its comment
   * calls the artefact "a seam of backdrop down the edge".
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
   * Gryt's spring, rather than gorhom's default.
   *
   * `withTiming` over the sampled curve, for the same reason every other
   * animation in this package does it that way: the curve in @gryt/theme is a
   * damped spring solved analytically, and approximating it with a physics
   * engine would be approximating an exact curve with the thing it was chosen
   * over.
   *
   * `springSlow` — 900ms — rather than the 700 a Drawer uses, because a sheet
   * travels further than a drawer does. A drawer crosses its own width, which
   * is most of the screen only on a phone; a sheet at 82% comes up from off the
   * bottom edge and covers nearly all of it. The same duration over a longer
   * distance is a faster animation, and at 700 this arrived quickly enough to
   * read as a snap rather than a slide.
   *
   * **`easeSpringTight`, not `easeSpring`.** This used the loose curve and
   * bounced, and the two are labelled in `easing.ts` in a way that decides it:
   * `easeSpring` "overshoots ~12%, for things that scale in place", and
   * `easeSpringTight` is "critically damped, no overshoot, for things that
   * travel inside bounds". A sheet sliding up from the bottom edge to a snap
   * point is the second thing, not the first — so this was the wrong curve by
   * the package's own rule, and it is the curve the Drawer already uses.
   *
   * Overshoot on a sheet is worse than on a button, too: the thing that
   * overshoots is the top edge, so it travels past its snap point and comes
   * back, which reads as the sheet failing to land rather than as bounce.
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

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      // So a sheet at 100% stops below the Dynamic Island rather than running
      // its content under it.
      topInset={insets.top}
      // Off, because `snapPoints` is the whole point of this component.
      //
      // gorhom v5 defaults dynamic sizing on, which measures the content and
      // sizes the sheet to it — overriding the snap points entirely. A sheet
      // asked for 70% whose content had no intrinsic height collapsed to the
      // height of its own footer, which looks like the snap points being
      // ignored because they were.
      enableDynamicSizing={false}
      enablePanDownToClose
      // A flick down or a tap on the backdrop closes it without anything in
      // React asking, so the state has to be told. Uncontrolled, this is what
      // makes the next `present` work; controlled, it is how the parent finds
      // out its sheet is gone.
      //
      // `presented` first, and not as a tidy-up: the modal has already
      // dismissed itself by the time this runs, and leaving the ref true lets
      // the effect below dismiss it a second time. See the note on the ref.
      onDismiss={() => {
        presented.current = false;
        setOpen(false);
      }}
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      backgroundComponent={renderBackground}
      handleIndicatorStyle={{
        backgroundColor: theme.color.border,
        width: 36,
        height: 4,
      }}
    >
      <BottomSheetView
        style={[
          {
            flex: 1,
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

export const Sheet = Object.assign(Root, { Trigger, Content, Close, Title });
