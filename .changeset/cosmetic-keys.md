---
"@gryt/owl": minor
---

Every accessory has a permanent two-letter key, and a worn look encodes to a sixteen-character string.

`encodeWorn` and `decodeWorn` turn what somebody is wearing into `aiasbd----aaabab` and back. Two characters per field, eight fields, fixed width and fixed order, so it can travel beside a nickname and be diagnosed by looking at it. `--` is a slot deliberately left empty, which is a different thing from a field that is absent.

The keys come from `artwork/keys.json`, a ledger the generator only ever adds to. That matters more than it sounds: the obvious encoding is "third hat in the slot", and under it, dropping `hat_apple.svg` into `artwork/` re-sorts the folder and shifts every hat after it — quietly re-dressing everybody who had saved a look. A deleted drawing keeps its entry so its key is never handed to something else, and a drawing that comes back gets the key it had before.

Decoding is forgiving about content and about length, and strict about shape. Fields are read positionally for as many as are present: trailing ones this build does not know about are ignored, and ones it expects and does not find are left unset. That is what makes adding a sixth slot survivable — under a strict-length check, the day `WORN_LENGTH` changed, every string anybody had saved would decode to null and every wardrobe would empty at once. New fields have to be appended rather than inserted, which is the same discipline the ledger runs on. A key this build has never seen — a newer accessory, a palette from a later release — reads as empty rather than failing, so one unknown hat costs that hat instead of the whole avatar. A string of the wrong length is refused outright, because that is a bug rather than a drawing that moved on.

`ACCESSORY_SLOTS` moved from `index.ts` to `accessories.ts`. It is still exported from the package root; the move breaks an import cycle, since the codec needs the slot order and the root re-exports the codec.
