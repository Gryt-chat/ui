---
"@gryt/owl": minor
---

Adds `npx @gryt/owl check <file.svg>`, so a drawing can be checked without
cloning the repository. It reports whether the filename gives the drawing a
slot, whether it is on the 1024 frame, whether the transforms are flattened,
how much of the bird it found, what is left after the subtraction, and which
colours have no palette role. It writes nothing and exits non-zero when the
drawing would not build.

The CLI is built by a config of its own rather than as a second entry on the
main one. A second entry makes rollup hoist the shared half into a chunk, which
took `dist/index.js` from 86kB to 13kB and two `import` statements — the package
would have quietly stopped being the one self-contained file it says it is.
`scripts/check-dist-shape.ts` runs after the build and now fails on it.

`extract`, `filename`, `svg-shapes` and `svg-simplify` moved from `scripts/lib/`
to `src/lib/` so the CLI can reach them. The ink table did not: it is this
repository's drawings rather than package data, and `scripts/authoring.ts` joins
the two for the docs app's upload checker. Generated accessory output is
byte-identical.
