---
"@gryt/ui": minor
---

`Select` takes groups.

`options` now accepts `{ label, options }` entries mixed in with plain ones, so
a caller that never needed groups doesn't change and nothing existing breaks.
Groups render through Base UI's `Select.Group` and `Select.GroupLabel`.

The theme library is what asked for it. The presets went to forty-seven across
ten collections in 0.28.0, and the docs switcher was putting the collection into
every label to make one flat list scannable. That reads well enough, and it says
"Winter" forty-seven times to a screen reader instead of naming the group once.
The switcher passes real groups now.

One thing worth knowing if you write another grouped select: Base UI reads
`items` to turn a value back into a label for the trigger, so it needs the
options rather than the groups they sit in. Hand it the array you were given and
everything looks right until something is selected and the trigger shows the raw
value. `Select.test.tsx` holds that case.
