# Design — Gryt UI docs

A locked design system for the `@gryt/ui` documentation site (`apps/docs`). Every
page redesign reads this file before emitting code. Do not regenerate per page —
extend or amend this file when the system needs to grow.

The palette is not a design choice made here. It comes from
[Gryt-chat/code-theme](https://github.com/Gryt-chat/code-theme) and is shared with
the Gryt client, so the docs look like the product they document. What this file
locks is everything around it.

## Genre

modern-minimal.

Dev-tool documentation. Dark paper is a brand fact, not an atmospheric mood — no
bloom, no glow, no gradient meshes. Flat surfaces separated by hairlines.

## Macrostructure family

- **Index pages** (`/`): Catalogue. A live index of every component, equal weight,
  no hero pitch. The components are the proof; a marketing hero would be a claim.
- **Content pages** (`/installation`, `/theme`): Long Document. Continuous prose
  with inline section heads.
- **Reference pages** (`/components/:slug`): Component Playground. Preview above,
  source below, one copy action per block.

## Theme

Converted from the code-theme hex values. Both notations ship — `--gryt-*` for
raw use, `--color-gryt-*` for Tailwind utilities — and they must move together.

- `--color-paper`    oklch(18.7% 0.011 268.1)  /* #111318 */
- `--color-paper-2`  oklch(23.1% 0.014 266.9)  /* #1a1d24 */
- `--color-paper-3`  oklch(24.5% 0.016 274.2)  /* #1e2028 */
- `--color-ink`      oklch(90.8% 0.008 286.2)  /* #e0e0e6 */
- `--color-ink-2`    oklch(62.7% 0.000  89.9)  /* #888888 */
- `--color-rule`     oklch(31.0% 0.024 268.5)  /* #2b303d */
- `--color-accent`   oklch(70.1% 0.151 284.8)  /* #968ff8 */
- `--color-accent-ink` oklch(19.4% 0.042 288.4) /* #141126 */
- `--color-focus`    oklch(78.8% 0.113 286.4)  /* #b4afff */

Accent budget: **≤ 5 % of any viewport.** It marks the active nav item, the focus
ring, inline code, and one primary action per page. It is not a decoration.

## Typography

Self-hosted through `@fontsource-variable`, not a CDN — the docs must build and
render offline, and both previously-declared faces were never actually loaded.

Inter stays as the body face because the library declares `--font-sans: Inter`;
loading it here is what finally makes the component previews render in the face
they were designed for. The display face is Geist so the docs chrome has a voice
of its own. Three families total — display, body, mono — and no more.

- Display: Geist Variable, weight 600, style normal
- Body:    Inter Variable, weight 400
- Mono:    JetBrains Mono Variable, weight 400
- Display tracking: `-0.022em`
- Type scale anchor: `--text-display` = `clamp(2.25rem, 4vw + 0.75rem, 3.5rem)`

Headings are roman. No italic display, ever.

## Spacing

4-point named scale in `tokens.css`. Pages use named tokens (`var(--space-md)`)
or Tailwind's scale — never raw pixel values in component files.

## Motion

Motion-cut project: no motion library is installed and none should be added.

- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`
- Reveal pattern: **none.** The page is composed, not performed. No scroll reveals.
- Permitted motion: state transitions only — hover, focus, open/close. ≤ 200 ms.
- Reduced-motion fallback: opacity-only, ≤ 150 ms.

## Microinteractions stance

- Silent success. The copy button swaps its label to "Copied" for 1.6 s; no toast.
- Command palette: ⌘K / Ctrl K opens, Esc closes, ↑/↓ move, Enter opens. If the
  pill ships, the keyboard model ships with it.
- Focus rings appear instantly and are never animated.

## CTA voice

- Primary: filled accent, fully rounded, `Button` from the library itself.
- Secondary: `tone="neutral"`, same shape.
- The docs use `@gryt/ui` for every control they document. A docs site for a
  component library that hand-rolls its own buttons is advertising doubt.

## Per-page allowances

- Index pages MAY render live components as the page content.
- Content pages: typography only.
- Reference pages: preview + code, nothing else.
- No page uses enrichment. There is no illustration budget here.

## What pages MUST share

- The sidebar IA and the wordmark.
- The accent colour and its placement.
- The display + body + mono trio.
- The CTA voice.
- Section heading rhythm: label above, heading directly beneath, same column.

## What pages MAY differ on

- Macrostructure, within the family for that page type.
- Density — reference pages run tighter than content pages.

## Anti-patterns specific to this site

- **No invented metrics.** No "trusted by N teams", no download counts, no
  "10× faster". The component count is real and countable; everything else is not.
- **No re-drawn chrome.** Code blocks do not get fake title bars with traffic
  lights. Previews do not get fake browser frames.
- **No tag-left / heading-right split heads.** Label stacks above the heading.
