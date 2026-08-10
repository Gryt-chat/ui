---
"@gryt/ui": minor
---

Move Button and Dialog off `@mui/material` onto Base UI (`@base-ui/react`), styled with Tailwind.

Button keeps its `tone`, `size`, `startIcon` and `endIcon` props, and gains a hover grow and press shrink that respect `prefers-reduced-motion`. The `sx` and `variant` props are gone, since there is no Emotion to interpret them — pass `className` instead.

Dialog changes shape. It was MUI's controlled `<Dialog open onClose>` with `DialogTitle`, `DialogContent` and `DialogActions` as siblings; it is now a compositional namespace:

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Body</Dialog.Description>
      <Dialog.Footer>
        <Dialog.Close render={<Button tone="neutral" />}>Cancel</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

`DialogActions` becomes `Dialog.Footer`, and `DialogContent` becomes `Dialog.Description` or plain children.

The remaining 24 components still import `@mui/material`, so Emotion has not left the dependency tree yet.
