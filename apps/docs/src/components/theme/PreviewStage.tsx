import { GrytProvider, Tabs } from "@gryt/ui";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ChatPanel } from "../../examples/ChatPanel";
import { ServerSidebar } from "../../examples/ServerSidebar";
import { SettingsBody } from "../../examples/SettingsModal";
import { SignInScreen } from "../../examples/SignInScreen";
import type { ShaderPalette } from "../../examples/ShaderBackground";
import { VoicePanel } from "../../examples/VoicePanel";
import { ComponentPreview } from "../../pages/componentDocs";
import type { ComponentDoc } from "../../componentMeta";

/**
 * The theme, against things that already exist.
 *
 * Every demo here is one the docs already ship — the component previews from
 * the reference pages, and the example screens. Nothing is built for this page:
 * a second set of demos would drift the first time somebody improved one.
 *
 * Only the visible tab is mounted. Base UI unmounts an inactive panel, and the
 * sign-in screen holds a WebGL context — five of those behind hidden tabs is
 * not free.
 */

/** Components worth showing, in the order somebody would look at them. */
const GALLERY: Array<{ title: string; previews: ComponentDoc["preview"][] }> = [
  { title: "Buttons", previews: ["button", "icon-button", "toggle-group"] },
  {
    title: "Fields",
    previews: ["text-field", "checkbox", "radio", "switch", "slider"]
  },
  { title: "Surfaces", previews: ["card", "alert", "divider"] },
  {
    title: "Status",
    previews: ["chip", "badge", "avatar", "progress", "meter", "skeleton"]
  },
  { title: "Navigation", previews: ["tabs", "accordion"] },
  { title: "Chat", previews: ["message-bubble", "conversation-item", "composer"] }
];

const SCREENS = [
  { value: "sign-in", label: "Sign-in" },
  { value: "chat", label: "Chat" },
  { value: "voice", label: "Voice" },
  { value: "settings", label: "Settings" },
  { value: "sidebar", label: "Sidebar" }
] as const;

/**
 * The themed box everything is rendered in.
 *
 * GrytProvider puts the theme's custom properties on this element, so the whole
 * subtree reads them. Overlays used to be the exception — a Select or a Tooltip
 * portalled to document.body and landed outside this, where the site's own
 * theme still applies, so a dropdown opened inside a preview came up in the
 * wrong colours. `containOverlays` keeps them in here instead (GRYT-242).
 */
function Stage({
  children,
  scroll = false,
  theme
}: {
  children: ReactNode;
  scroll?: boolean;
  theme: CSSProperties;
}) {
  return (
    <GrytProvider
      containOverlays
      className={[
        "h-[38rem] max-h-[78vh] w-full rounded-(--gryt-radius-xl)",
        "border border-gryt-border bg-gryt-bg text-gryt-text"
      ].join(" ")}
      theme={theme}
    >
      {/* The clipping lives here rather than on the provider, because the
          provider is now also where overlays are portalled. Leave the two on
          one element and a dropdown opened near the bottom of the stage is cut
          off at the stage's edge — measured at 78px of a 106px popup. The
          themed box and the scroll viewport are different jobs. */}
      <div
        className={[
          "h-full w-full rounded-(--gryt-radius-xl)",
          scroll ? "overflow-y-auto" : "overflow-hidden"
        ].join(" ")}
      >
        {children}
      </div>
    </GrytProvider>
  );
}

export interface PreviewStageProps {
  theme: CSSProperties;
  /** The shader reads its colours from here rather than from the DOM. */
  palette: ShaderPalette;
}

export function PreviewStage({ theme, palette }: PreviewStageProps) {
  const [view, setView] = useState<string>("components");

  return (
    <Tabs value={view} onValueChange={(value) => setView(String(value))}>
      {/* Six tabs do not fit a 320px phone, and the root clips overflow, so
          without this the last two are simply unreachable there. */}
      <Tabs.List
        aria-label="What to preview the theme against"
        className="max-w-full overflow-x-auto"
      >
        <Tabs.Tab value="components">Components</Tabs.Tab>
        {SCREENS.map((screen) => (
          <Tabs.Tab key={screen.value} value={screen.value}>
            {screen.label}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator />
      </Tabs.List>

      <Tabs.Panel value="components">
        <Stage scroll theme={theme}>
          <div className="grid gap-(--space-lg) p-5">
            {GALLERY.map((group) => (
              <section key={group.title}>
                <h3 className="m-0 pb-3 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
                  {group.title}
                </h3>
                <div className="grid gap-4">
                  {group.previews.map((preview) => (
                    <div
                      key={preview}
                      className="rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-4"
                    >
                      <ComponentPreview preview={preview} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Stage>
      </Tabs.Panel>

      <Tabs.Panel value="sign-in">
        <Stage theme={theme}>
          <SignInScreen palette={palette} />
        </Stage>
      </Tabs.Panel>

      <Tabs.Panel value="chat">
        <Stage theme={theme}>
          <ChatPanel />
        </Stage>
      </Tabs.Panel>

      <Tabs.Panel value="voice">
        <Stage theme={theme}>
          <VoicePanel />
        </Stage>
      </Tabs.Panel>

      <Tabs.Panel value="settings">
        <Stage theme={theme}>
          <div className="h-full p-4">
            <div className="mx-auto h-full max-w-4xl overflow-hidden rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface">
              <SettingsBody />
            </div>
          </div>
        </Stage>
      </Tabs.Panel>

      <Tabs.Panel value="sidebar">
        <Stage theme={theme}>
          <div className="flex h-full">
            <ServerSidebar />
            <div className="hidden flex-1 items-center justify-center p-6 text-sm text-gryt-muted sm:flex">
              The channel goes here.
            </div>
          </div>
        </Stage>
      </Tabs.Panel>
    </Tabs>
  );
}
