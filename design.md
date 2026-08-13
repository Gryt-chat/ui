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
- **Tool pages** (`/theme/generator`): Workbench. A sticky editor rail on the
  left and a live stage on the right, both full height, with what you take away
  underneath the stage. A tool page is the one type that may break the 5xl
  column — prose wants a measure, two panes want the room — so `AppShell` opts
  these routes out by name. Prose belongs in the header and nowhere else: past
  the first paragraph the page is controls and results.

## Theme

The chrome has no palette of its own. `tokens.css` names the docs' colours and
aliases every one of them onto `@gryt/ui`'s, so the site wears whatever theme is
selected in the header rather than a second copy of Gryt's:

- `--color-paper`      → `--gryt-bg`
- `--color-paper-2`    → `--gryt-surface`
- `--color-paper-3`    → `--gryt-surface-raised`
- `--color-ink`        → `--gryt-text`
- `--color-ink-2`      → `--gryt-muted`
- `--color-rule`       → `--gryt-border`
- `--color-accent`     → `--gryt-accent`
- `--color-accent-ink` → `--gryt-on-accent`
- `--color-focus`      → `--gryt-accent-light`
- `--color-code-paper` and `--color-code-ink` → the **dark** half, always

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
- Tool pages MAY render the same components and example screens under a theme
  other than the site's own, and MAY use native controls the library does not
  document — `input[type=color]` is the only one so far, because the platform
  picker is the one every OS already has an eyedropper behind.
- No page uses enrichment. There is no illustration budget here.

## The header's theme controls

The site is themeable from its own header: a preset picker carrying everything
`grytPresets` ships, plus **Custom** — whatever is currently in the generator —
and a dark/light toggle. Both write to one store, applied as CSS custom
properties on the root element, because overlays portal to `document.body` and
anything lower would leave every dialog on the old palette.

Two consequences the system has to live with:

- **The chrome has no palette of its own.** `tokens.css` aliases `--color-paper`,
  `--color-ink`, `--color-rule` and the rest onto the `--gryt-*` tokens. They
  were the same values written twice; now they are one.
- **Code blocks keep the dark half of whatever theme is on, in both
  appearances.** Shiki writes its colours inline, one theme's worth, so a light
  surface under them puts near-white keywords on near-white paper. A second
  Shiki theme is the thorough answer and this is not it — but a dark block on a
  light page is a deliberate look, not an oversight, and it is *that theme's*
  dark rather than Gryt's.

## New pages

A nav item can declare the version it arrived in. It wears a **New** tag while
the library is still on that minor, and the next minor takes it off — nobody has
to remember, which is the only way a "New" tag stays true.

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
