---
"@gryt/owl": minor
---

Accessories are configured by their filename, and adding one no longer moves people who do not get it.

`artwork/accessories.json` is gone. A drawing's slot comes from a word in its filename — `Winter_Hat.svg` is a hat — with dot-tags for the rest: `.rare`, `.covers-head`, `.over-face`, an explicit slot, or a leading underscore to keep a file out of the registry. Colours come from `artwork/inks.ts`, one table for every drawing rather than a copy per drawing, so a new accessory in colours already in use needs no configuration at all. A word or a colour the script does not know stops the run and says what to add.

How often a slot is filled is now set directly, in `SLOT_PRESENCE`, and weights are sized to hit it. Before, the rate was a side effect of how many drawings were in the slot: eight pairs of glasses had put eyewear on 38% of owls, and a ninth would have pushed it higher with nobody choosing that.

Accessories are also drawn per candidate rather than along one shared range, so adding a drawing can only take owls from the others. Adding one used to change 28.6% of owls while 8.7% wore the new thing — a fifth of everyone reshuffled for nothing, on every addition. It is 4.4% now, all of it the slot holding its rate steady.

**This moves existing avatars once.** Roughly three quarters of seeds resolve to a different owl, because both the weights and the draw changed. The three pinned hashes in `owl.test.ts` were regenerated, which is the only time they have been. Nothing after this moves anyone who does not get the new accessory.

`SLOT_PRESENCE` is exported alongside `EMPTY_WEIGHT`, which is now a flat constant and no longer a knob.
