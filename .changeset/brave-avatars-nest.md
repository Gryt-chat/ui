---
"@gryt/ui": minor
---

`Avatar` takes an `eggSeed` and draws that seed's eggs, the same way `seed` draws
a person's owl.

```tsx
<Avatar eggSeed={chat.id} className="rounded-(--gryt-radius-md)" />
```

Named for the drawing rather than for what it stands for, because that has
already changed once — these were written for server icons and are now the
generated image for a group chat, with server icons getting their own generator.

The corner belongs to the caller. `Avatar` clips to whatever radius its class
sets and the drawing is square, so it gets the theme's radius in pixels rather
than a fraction of the box baked into the SVG — which would be a different corner
at every size.

Separate from `seed` rather than a flag on it: passing the wrong one should give
you the wrong kind of thing rather than the same thing in another colour. Both at
once draws the person.
