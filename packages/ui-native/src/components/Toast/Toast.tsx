import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { Text } from "../../internal/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { grytScaleSteps } from "@gryt/theme";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { fade, usePressScale } from "../../motion";
import { useTheme } from "../../theme";

export type ToastSeverity = "info" | "success" | "warning" | "error";

export interface ToastOptions {
  title?: string;
  description?: string;
  severity?: ToastSeverity;
  /** Milliseconds. Null keeps it up until it is dismissed. */
  duration?: number | null;
}

interface QueuedToast extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  show: (toast: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Toasts need somewhere to live, which on the web is a portal at the document
 * root and here is a provider near the top of the tree.
 *
 * **Mount it above everything else it has to cover.** The viewport is rendered
 * as a sibling *after* `children`, so it paints over anything inside them —
 * including a `Sheet`, whose content goes through `@gorhom/portal` to a host
 * that is itself inside those children. Put `ToastProvider` below
 * `SheetProvider` and the sheet wins instead, which is the wrong way round: a
 * sheet is a surface you are working in, and a toast is the app telling you
 * something happened while you work.
 *
 * They are deliberately not built on `Modal` like the dialogs are. A modal
 * intercepts touches for the whole screen, and a toast that blocked the app
 * until it faded would be worse than no toast.
 *
 * **What that costs, stated rather than discovered:** a `Modal` is a separate
 * native window, so anything built on one — `Dialog`, `AlertDialog`, `Drawer`,
 * and the platform's own `ActionSheetIOS` — draws *over* a toast, whatever the
 * z-index says. React Native has no z-index across windows. A flow that raises
 * a dialog and toasts at the same moment should toast after the dialog closes;
 * there is nothing this component can do about it from inside the tree, and
 * the alternative is a toast that can block the app, which is worse.
 */
export function ToastProvider({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast: ToastOptions) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { ...toast, id }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <Viewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside a <ToastProvider>.");
  return value;
}

const RAMP: Record<ToastSeverity, "accent" | "success" | "warning" | "danger"> = {
  info: "accent",
  success: "success",
  warning: "warning",
  error: "danger",
};

function Viewport({
  toasts,
  onDismiss,
}: {
  toasts: QueuedToast[];
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  if (toasts.length === 0) return null;

  return (
    <View
      // Only the toasts take touches; the gaps between them do not.
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        /* The top, which on a phone is the only edge that is reliably free.
         *
         * The bottom is where a tab bar sits, where the home indicator sits,
         * and where every sheet in the app rises from — so a toast there is
         * either under the chrome or in the way of the gesture. It is also
         * where iOS puts nothing of its own, precisely because that edge is
         * the user's.
         *
         * Below the status bar rather than over it: the clock and the battery
         * are not ours to cover, and a toast that starts under the notch reads
         * as a system banner rather than as this app talking. */
        top: insets.top + theme.space(2),
        paddingHorizontal: theme.space(4),
        gap: theme.space(2),
        /* Explicit rather than relying on paint order. Within this tree the
         * viewport is already last, but a caller can put something absolutely
         * positioned after it — a floating bar, a call pill — and the toast
         * has to win. `elevation` is the Android half of the same statement. */
        zIndex: 1000,
        elevation: 24,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: QueuedToast;
  onDismiss: (id: number) => void;
}) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  const ramp = theme.scales[RAMP[toast.severity ?? "info"]];
  const duration = toast.duration === undefined ? 4000 : toast.duration;
  // `active:scale-[0.96]` on the web. The `hover:scale-[1.04]` half has no
  // touch equivalent and is deliberately not emulated.
  const press = usePressScale(grytScaleSteps.toast.press, reducedMotion);

  useEffect(() => {
    if (!reducedMotion) {
      // eslint-disable-next-line react-hooks/immutability
      opacity.value = fade(1);
    }
    if (duration === null) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss, opacity, reducedMotion, toast.id]);

  const enter = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[enter, press.style]}>
      <Pressable
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="alert"
        accessibilityLiveRegion={
          toast.severity === "error" || toast.severity === "warning" ? "assertive" : "polite"
        }
        onPress={() => onDismiss(toast.id)}
        style={{
          backgroundColor: theme.color.surfaceRaised,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderLeftWidth: 3,
          borderColor: theme.color.border,
          borderLeftColor: ramp[8],
          padding: theme.space(3),
          gap: theme.space(0.5),
        }}
      >
        {toast.title ? (
          <Text style={{ color: theme.color.text, fontSize: 14, fontWeight: "600" }}>
            {toast.title}
          </Text>
        ) : null}
        {toast.description ? (
          <Text style={{ color: theme.color.muted, fontSize: 13, lineHeight: 18 }}>
            {toast.description}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export interface ToastProps {
  style?: StyleProp<ViewStyle>;
}
