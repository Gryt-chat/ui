---
"@gryt/ui": minor
---

`Avatar` takes a `serverSeed` and draws that server's eggs, the same way `seed`
draws a person's owl.

```tsx
<Avatar serverSeed={server.name} className="rounded-(--gryt-radius-md)" />
```

The corner belongs to the caller. `Avatar` already clips to whatever radius its
class sets and the drawing is square, so a server rail gets the theme's radius
in pixels rather than a fraction of the box baked into the SVG — which would be
a different corner at every size.

A server is not a person, so it is a separate prop rather than a flag on `seed`:
passing the wrong one gives the wrong kind of thing rather than the same thing
in another colour. Both at once draws the person.
