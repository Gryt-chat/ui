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
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { useTheme } from "../../theme";

/**
 * A bottom sheet, which is the phone's modal.
 *
 * `@gryt/ui` has no counterpart, and that is deliberate rather than an
 * oversight to be corrected later. A sheet is what a phone does where the web
 * opens a dialog or slides a drawer, and the two are not the same interaction:
 * a sheet is dragged, it settles at heights the user chooses, and dismissing it
 * is a flick rather than a click on an X. Shipping the web's Dialog on a phone
 * would be 1:1 and wrong; inventing a sheet on the web would be worse. So this
 * is an addition, and it is in the parity exceptions table as one.
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

export interface SheetProps {
  /**
   * Heights the sheet settles at, as percentages or points.
   *
   * The web has no equivalent concept — a dialog is one size — which is part of
   * why this is its own component rather than a Drawer with a prop.
   */
  snapPoints?: (string | number)[];
  /** Starts open. Uncontrolled; use the Trigger for the usual case. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function Root({
  snapPoints = ["50%"],
  defaultOpen = false,
  onOpenChange,
  children,
}: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);

  // `present` and `dismiss` rather than mounting and unmounting by hand: the
  // modal is always rendered and the provider decides whether it is on screen,
  // which is what removes the mount-then-snap-on-the-next-frame dance the
  // inline version needed.
  const open = useCallback(() => {
    ref.current?.present();
    onOpenChange?.(true);
  }, [onOpenChange]);

  const close = useCallback(() => {
    ref.current?.dismiss();
  }, []);

  const context = useMemo<SheetContextValue>(() => ({ open, close }), [open, close]);

  return (
    <SheetContext.Provider value={context}>
      <SheetRefContext.Provider value={{ ref, defaultOpen, snapPoints, onOpenChange }}>
        {children}
      </SheetRefContext.Provider>
    </SheetContext.Provider>
  );
}

interface SheetRefValue {
  ref: React.RefObject<BottomSheetModal | null>;
  defaultOpen: boolean;
  snapPoints: (string | number)[];
  onOpenChange?: (open: boolean) => void;
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
  const state = useContext(SheetRefContext);
  // Read here, in the normal tree, and handed back down below — see the note
  // on the provider inside the modal.
  const sheet = useContext(SheetContext);
  if (!state || !sheet) {
    throw new Error("Sheet.Content must be rendered inside Sheet.");
  }

  const { ref, defaultOpen, snapPoints, onOpenChange } = state;

  useEffect(() => {
    if (defaultOpen) ref.current?.present();
  }, [defaultOpen, ref]);

  // The modal renders nothing until it is presented, so there is no invisible
  // backdrop sitting over the screen eating taps while it is closed. That was
  // a real hazard with the inline version and had to be handled by unmounting.
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
      enablePanDownToClose
      onDismiss={() => onOpenChange?.(false)}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.color.surface,
        // Corners on the top two only. A sheet is anchored to the bottom edge
        // and rounding all four would float it, which is a different component.
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.color.border,
        width: 36,
        height: 4,
      }}
      style={{
        // gorhom draws no shadow, and without a border the sheet's top edge
        // vanishes against a dark backdrop at low opacity.
        borderTopWidth: 1,
        borderColor: theme.color.border,
      }}
    >
      <BottomSheetView style={[{ flex: 1, padding: theme.space(4) }, style]}>
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
