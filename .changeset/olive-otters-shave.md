---
"@gryt/ui-native": minor
---

`Drawer.ScrollView` and `Drawer.FlatList`, for a drawer with more in it than fits.

React Native's own scrollables do not scroll inside a `Drawer.Popup`. The
drawer's pan and the scroll view's native recogniser both want the touch, and
gesture-handler settles that by reference — so the two have to know about each
other. A drawer's children are the caller's, so it cannot go looking for them;
they announce themselves instead. That is why this is a scrollable the drawer
hands you rather than a prop pointing at one, and it is the same answer
`@gorhom/bottom-sheet` reaches with `BottomSheetScrollView`.

```tsx
<Drawer.Popup side="left">
  <Drawer.ScrollView>{items}</Drawer.ScrollView>
</Drawer.Popup>
```

Both take the props their gesture-handler equivalents do. Outside a drawer they
are ordinary scrollables, so a component that may or may not be in one does not
have to care.

Swipe-to-dismiss is unchanged: the pan still claims a clearly sideways drag,
and a vertical one goes to the list.
