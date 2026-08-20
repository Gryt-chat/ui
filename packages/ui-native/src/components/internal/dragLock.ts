import { createContext, useContext } from "react";

/**
 * A control holding a scrolling ancestor still while it is being dragged.
 *
 * This exists because of one bug, and the obvious fixes all fail in ways that
 * look like they worked, so it is worth writing down.
 *
 * Dragging a `Slider` inside a scrolling screen scrolled the screen. The first
 * fix — `onPanResponderTerminationRequest: () => false` — was necessary and not
 * sufficient: it stops the ScrollView taking the responder away, so the thumb
 * follows your finger now, and the page still scrolls underneath. On iOS the
 * scroll is driven by a native `UIPanGestureRecognizer` that is not part of
 * React Native's JS responder system, so refusing to hand over the responder
 * answers a question the native recogniser never asked.
 * `onShouldBlockNativeResponder` is the knob for that, and it is Android-only.
 *
 * What works is `scrollEnabled` — and the control cannot reach the scroll view
 * to set it, since they are separated by however much app markup. So the scroll
 * view publishes a lock, the control claims it, and neither has to know where
 * the other is.
 *
 * `react-native-gesture-handler` solves this properly, by negotiating with the
 * native recogniser rather than switching it off. That is the better fix and it
 * is blocked on GRYT-393: this package ships prebuilt JavaScript, Reanimated's
 * babel plugin does not run over `node_modules`, and gesture callbacks are
 * therefore never worklets. Measured on a device, not assumed. When that is
 * solved, this should probably go.
 */
export interface DragLock {
  locked: boolean;
  lock: () => void;
  unlock: () => void;
}

export const DragLockContext = createContext<DragLock | null>(null);

const NO_LOCK: DragLock = {
  locked: false,
  lock: () => {},
  unlock: () => {},
};

/**
 * Claimed by a control for the duration of a drag.
 *
 * No-ops outside a `ScrollArea`, which is the normal case for a control that is
 * not in a scrolling screen. A control must not require the provider: a slider
 * in a fixed panel has nothing to lock, and throwing there would be inventing a
 * dependency on a component it does not need.
 */
export function useDragLock(): DragLock {
  return useContext(DragLockContext) ?? NO_LOCK;
}
