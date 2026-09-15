# @gryt/ui

React component library for [Gryt](https://github.com/Gryt-chat/gryt), the open-source WebRTC voice chat platform.

Built with Base UI, React, Phosphor icons, Tailwind-authored compiled CSS, and the Gryt design palette from [Gryt-chat/code-theme](https://github.com/Gryt-chat/code-theme).

## Install

```sh
bun add @gryt/ui
```

```sh
npm install @gryt/ui
pnpm add @gryt/ui
yarn add @gryt/ui
```

Gryt UI includes Base UI, Phosphor icons, and its compiled CSS. It also brings `@gryt/theme` for the tokens and `@gryt/owl` for the generated avatars, both of which are small and have no dependencies of their own. Your app should provide React and React DOM. There is no CSS-in-JS runtime.

## Usage

Import the stylesheet once in your app's global entry file.

```tsx
// main.tsx, app.tsx, layout.tsx, or another global app entry
import "@gryt/ui/styles.css";
```

For Next.js, import the stylesheet from `app/layout.tsx` or `pages/_app.tsx`.

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

## Examples

Buttons support Gryt tones, variants, and sizes.

```tsx
import { Button } from "@gryt/ui";

export function Actions() {
  return (
    <>
      <Button tone="primary">Save</Button>
      <Button tone="secondary" variant="outlined">
        Invite
      </Button>
      <Button tone="danger" variant="contained" size="small">
        Delete
      </Button>
      <Button tone="ghost" variant="text" size="xsmall">
        Dismiss
      </Button>
    </>
  );
}
```

Form primitives are Base UI-backed and inherit the Gryt theme.

```tsx
import { Select, Switch, TextField } from "@gryt/ui";

export function Preferences() {
  return (
    <>
      <TextField label="Display name" placeholder="Sivert" />
      <Select
        label="Voice activity"
        defaultValue="push-to-talk"
        options={[
          { label: "Push to talk", value: "push-to-talk" },
          { label: "Open mic", value: "open-mic" }
        ]}
      />
      <Switch
        defaultChecked
        inputProps={{ "aria-label": "Noise suppression" }}
      />
    </>
  );
}
```

## Components

Includes Base UI-backed primitives for buttons, inputs, selects, tabs, menus, dialogs, drawers, cards, feedback, data display, and Gryt chat-specific components like `Composer`, `ConversationItem`, and `MessageBubble`.

The package also exports `GrytProvider`, `createGrytTheme`, and `grytTokens` for apps that need a consistent Gryt theme boundary.

## Importing one component

Every component has its own entry point too. The name is the component in kebab case.

```tsx
import { Button } from "@gryt/ui/button";
import { VideoPlayer } from "@gryt/ui/video-player";
```

`@gryt/ui` still works and exports everything. Both paths load the same files, so a bundler that tree-shakes only ships what you use either way.

Interactive components carry `"use client"`, so a Next.js server component can import them. On webpack, import from the subpath in server components, or add `@gryt/ui` to `experimental.optimizePackageImports`. Without that, a root import from a server component pulls in every component. Turbopack doesn't have this problem.

Subpath types need `moduleResolution` set to `bundler`, `node16` or `nodenext`. The old `node` setting only resolves `@gryt/ui` and `@gryt/ui/theme`.

## Styles

`@gryt/ui/styles.css` contains the compiled component styles. Import it once globally; do not import it inside every component.

```tsx
import "@gryt/ui/styles.css";
```

If your bundler supports CSS imports from npm packages, no extra CSS configuration is needed.

## Links

- Package source: [Gryt-chat/ui](https://github.com/Gryt-chat/ui)
- Gryt platform: [Gryt-chat/gryt](https://github.com/Gryt-chat/gryt)
- Gryt client: [Gryt-chat/client](https://github.com/Gryt-chat/client)
- Gryt docs: [docs.gryt.chat](https://docs.gryt.chat)

## License

MIT — see [LICENSE](LICENSE). The Gryt apps themselves are AGPL-3.0; this library is
deliberately permissive so it can be used in anything.
