---
"@gryt/theme": minor
"@gryt/ui": minor
---

An unread colour of its own, and a Badge tone that uses it.

`--gryt-unread` and `--gryt-on-unread`, one literal shared by both appearances
rather than a step of a family. Every theme inherits it without doing anything,
and a themer overrides it with `color.unread` or by setting the variable.

`danger` was carrying this job. It measured 2.56:1 against the light surface,
under the 3:1 a filled shape wants, which is why an unread badge read as soft
rather than as something to look at. The new value is 4.75:1 on the dark
sidebar and 3.28:1 on the light one, at chroma 0.23 against danger's 0.17.

`Badge` takes `tone="unread"`. Its tone union is its own now: the shared `Tone`
stays closed so Checkbox, Radio, Switch and Slider cannot invent a colour.
