---
"@gryt/ui": patch
"@gryt/ui-native": patch
---

WebhookCard sits on its own surface now: the app background inside its hairline border, so a hovered message row stops at the card's edge instead of showing through it. Field chips and picture placeholders use the raised surface. A click or tap anywhere on the card opens its link, with a pointer, a hover state and the focus ring on the card itself. Links, buttons and pictures inside the card still open on their own. A drag that selected text opens nothing, and only http(s) URLs become links.
