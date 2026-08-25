---
"@gryt/ui": minor
---

`--font-sans` names Atkinson Hyperlegible Next, and `--font-mono` names Atkinson Hyperlegible Mono.

Gryt is set in Atkinson Hyperlegible everywhere it renders — the client, the site, the docs, the Keycloak login theme — and it is an accessibility choice rather than a taste one. The Braille Institute drew it for character differentiation: `I`, `l` and `1` are unmistakable, `b`/`d` and `p`/`q` are subtly asymmetric, and `c`, `e` and `s` keep open apertures at small sizes.

This token named Inter, so the default the library shipped was a face Gryt does not use, and every consumer had to override it. There was no `--font-mono` at all.

The font files are not shipped here. Naming a family only decides what is asked for first, and a consumer that does not load it falls through to the same `ui-sans-serif, system-ui` stack as before.
