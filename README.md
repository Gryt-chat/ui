<div align="center">
  <img src="https://raw.githubusercontent.com/Gryt-chat/client/main/public/logo.svg" width="80" alt="Gryt logo" />
  <h1>Gryt UI</h1>
  <p>The component library behind <a href="https://github.com/Gryt-chat/gryt">Gryt</a>, in two packages that share one set of tokens.<br /><code>@gryt/ui</code> for the web, <code>@gryt/ui-native</code> for React Native.<br />Documented at <a href="https://ui.gryt.chat">ui.gryt.chat</a>.</p>
</div>

<br />

`@gryt/ui` builds on [Base UI](https://base-ui.com), the MUI team's headless component library, styled with Tailwind on the Gryt palette. Flat surfaces, fully rounded controls, chat-focused primitives. Built for the Gryt desktop and web client, and usable by anything else.

## Install

```sh
bun add @gryt/ui
```

```sh
npm install @gryt/ui
pnpm add @gryt/ui
yarn add @gryt/ui
```

`@gryt/ui` includes Base UI, Phosphor icons, and the compiled Gryt styles. Your app provides `react` and `react-dom`. There's no CSS-in-JS runtime.

For React Native, install [`@gryt/ui-native`](packages/ui-native) instead. It's
the same design system through a different renderer, and it's covered below.

```sh
npm install @gryt/ui-native
```

## Usage

Import the stylesheet once in your app's global entry file.

```tsx
// main.tsx, app.tsx, layout.tsx, or another global app entry
import "@gryt/ui/styles.css";
```

Wrap your app with `GrytProvider`, then use the components.

```tsx
import { Button, GrytProvider, TextField } from "@gryt/ui";

export function App() {
  return (
    <GrytProvider>
      <form>
        <TextField label="Channel name" placeholder="Design review" />
        <Button tone="primary" size="medium">
          Create channel
        </Button>
      </form>
    </GrytProvider>
  );
}
```

For Next.js, import the stylesheet from `app/layout.tsx` or `pages/_app.tsx`.

## Links

- Platform monorepo: [Gryt-chat/gryt](https://github.com/Gryt-chat/gryt)
- Desktop/web client: [Gryt-chat/client](https://github.com/Gryt-chat/client)
- Code theme palette: [Gryt-chat/code-theme](https://github.com/Gryt-chat/code-theme)
- Product site: [gryt.chat](https://gryt.chat)
- App: [app.gryt.chat](https://app.gryt.chat)
- Docs: [docs.gryt.chat](https://docs.gryt.chat)

## Development

```sh
bun install
bun run dev
```

## Scripts

```sh
bun run typecheck
bun run test
bun run build
```

## The workspace

`packages/ui` and `packages/ui-native` are both published. The second is the
same design system on React Native and is covered below. The docs app is
private, and consumes the workspace package through Vite.

`bun run build:lib` names the two libraries rather than building everything,
because the docs app blocked a publish once.

## React Native

`packages/ui-native` renders the same tokens through React Native. It imports
the theme from `@gryt/ui/theme`, which is a separate entry precisely so it can:
the main entry bundles every component, pulls in Base UI, and imports the
stylesheet as a side effect, none of which React Native can take.

The colour maths is shared rather than copied. `neutralScale`, `hueScale` and
`alphaScale` are exported from this package, and `ui-native` composes them into
plain values instead of CSS custom properties. A curve tuned here moves there.

It's published, and short of ten of the 42 components in `@gryt/ui` — mostly
the Gryt-specific ones, which want a screen to design against rather than a web
component to copy. Its README carries the list, and a table of the places where
a component deliberately behaves differently on a phone. See GRYT-342.

## Issues

Please report bugs and request features in the
[main Gryt repository](https://github.com/Gryt-chat/gryt/issues).

## Sponsors

What sponsoring pays for, the tiers, and everyone who has sponsored:
[gryt.chat/sponsors](https://gryt.chat/sponsors). To sponsor:
[GitHub Sponsors](https://github.com/sponsors/Gryt-chat).

The list itself lives in the [Gryt README](https://github.com/Gryt-chat/gryt#sponsors),
in one place rather than ten, so it cannot fall out of step across repositories.

## License

MIT — see [LICENSE](LICENSE).

This is the one Gryt repository that isn't AGPL. The apps it's used by — client,
server, SFU and the rest — are AGPL-3.0, and the argument for copyleft there's that
somebody running a modified Gryt as a service should publish their changes. A
component library is a different thing: it's meant to be picked up and used in
whatever somebody is building, including things that have nothing to do with Gryt,
and AGPL would make that impossible for most of them.

`@gryt/ui` has been published to npm as MIT since the first release, so this records
what was already true rather than deciding anything new.
