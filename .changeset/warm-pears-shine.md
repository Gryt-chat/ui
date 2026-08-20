---
"@gryt/theme": minor
"@gryt/ui": minor
"@gryt/ui-native": minor
---

An indeterminate Progress actually shows something.

Both platforms rendered an empty track. The web passed `value={null}` to Base UI,
which marks the indicator indeterminate and leaves its width unset, and nothing
styled that — no keyframes anywhere in the package and no rule for
`data-indeterminate`. React Native had written the same gap down as a parity
exception, which made a shared hole look like a one-sided one.

Now a bar 40% of the track sweeps across it on a loop, from the same
description on both: fully off the left edge to fully off the right, so the loop
seam is invisible. `grytDurations.sweep` and `--gryt-dur-sweep` are the one
duration, kept equal by the test that already covers the others.

Reduce-motion gets a full-width dimmed bar rather than a frozen partial one,
which would read as a job that stalled 40% in.
