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
 * Where toasts live: a provider near the top of the tree, above everything it has to cover.
 * Not built on `Modal`, so a Dialog or Drawer draws over a toast whatever the z-index says.
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
        /* The top, which on a phone is the only edge reliably free: the bottom holds the
         * tab bar, the home indicator and every sheet. Below the status bar, not over it. */
        top: insets.top + theme.space(2),
        paddingHorizontal: theme.space(4),
        gap: theme.space(2),
        /* Explicit rather than relying on paint order: a caller can put something
         * absolutely positioned after it. `elevation` is the Android half of that. */
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
