---
"@gryt/ui-native": patch
---

The Drawer's swipe-to-dismiss runs on `react-native-gesture-handler`.

It was on `PanResponder` because gesture callbacks from this package's
prebuilt output were measured doing nothing (GRYT-393) — the babel plugin was
not reaching `node_modules`, so nothing became a worklet. Measured again with
a probe built inside this package: both worklet and `runOnJS` callbacks report
correctly. Whatever it was has been fixed underneath us.

What changes, in order of how much it matters:

- **The callbacks are worklets.** The panel tracks the finger on the UI
  thread, rather than through the JS bridge.
- **The axis rules are declared rather than hand-rolled.** `activeOffsetX` and
  `failOffsetY` replace threshold arithmetic in `onMoveShouldSetPanResponder`,
  and `onPanResponderTerminationRequest: () => false` — a way of keeping the
  drag by never handing it back — is gone.
- **A dismissed panel no longer returns to open before it leaves.** `drag` was
  cleared when `open` went false, which is the instant a swipe dismisses, so
  the panel jumped back and then slid out. It is cleared once the panel is
  unmounted instead (GRYT-429).

Velocity is now points per second rather than points per millisecond, so the
flick threshold moved from `0.5` to `500`. Same gesture, different unit.

This does **not** make a `ScrollView` inside a Drawer scroll. That does not
work today either — verified against both builds — and fixing it needs the
drawer to compose with the scrollable by reference, which is an API decision
rather than a port. GRYT-431.
