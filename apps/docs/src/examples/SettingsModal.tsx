import {
  Button,
  Dialog,
  Divider,
  IconButton,
  Meter,
  ScrollArea,
  Select,
  Slider,
  Switch,
  Tabs,
  TextField
} from "@gryt/ui";
import {
  FadersHorizontal,
  Palette,
  User,
  UserCircle,
  VideoCamera,
  X
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";

/**
 * The Gryt settings modal.
 *
 * A copy of the client's settings dialog, rebuilt on @gryt/ui. The rail holds
 * five destinations named for what you are trying to do rather than which
 * subsystem owns the setting — that replaced fourteen flat tabs, two of which
 * held a single control each.
 *
 * The pieces worth lifting are the shape, not the settings: a Dialog wide
 * enough to hold a rail, a search field that filters the rail rather than the
 * panel, and one scroll region on the right so the rail stays put while the
 * panel moves.
 */

interface Destination {
  value: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  /** Searched alongside the label, so "microphone" finds Sound & video. */
  keywords: string[];
  panel: ReactNode;
}

export function SettingsModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>Open settings</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        {/* The popup's own padding is removed: the rail has to reach the edges
            of the dialog, and each region pads itself instead.
            The accessible name is on the popup rather than a Dialog.Title,
            because the heading inside changes with the destination and the
            dialog is still "Settings" whichever one you are on. */}
        <Dialog.Popup
          aria-label="Settings"
          className="h-[32rem] max-h-[80vh] w-[min(56rem,calc(100vw-2rem))] max-w-none overflow-hidden p-0"
        >
          <SettingsBody onClose={() => setOpen(false)} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SettingsBody({ onClose }: { onClose?: () => void }) {
  const [active, setActive] = useState("you");
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return DESTINATIONS;
    return DESTINATIONS.filter((destination) =>
      [destination.label, ...destination.keywords].some((term) =>
        term.toLowerCase().includes(needle)
      )
    );
  }, [query]);

  // Searching to an empty rail should not also empty the panel — you are
  // narrowing the list, not leaving the page you were on.
  const panel =
    DESTINATIONS.find((destination) => destination.value === active) ??
    DESTINATIONS[0];

  // Filtered-out tabs are hidden, not unmounted. The indicator measures the
  // active tab to place itself, so removing tabs from the DOM as you type
  // makes the pill jump around behind the search field. When the active one is
  // itself filtered out there is nothing to point at, and the pill goes rather
  // than parking at zero height in the corner.
  const matched = new Set(matches.map((destination) => destination.value));
  const activeIsVisible = matched.has(active);

  return (
    <Tabs
      className="grid h-full min-h-0 grid-cols-[minmax(0,14rem)_minmax(0,1fr)]"
      orientation="vertical"
      value={active}
      onValueChange={(value) => setActive(String(value))}
    >
      <div className="flex min-w-0 flex-col gap-3 border-r border-gryt-border bg-gryt-surface p-3">
        <TextField
          size="small"
          placeholder="Search settings"
          aria-label="Search settings"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <Tabs.List
          aria-label="Settings sections"
          className="min-w-0 gap-0.5 bg-transparent p-0"
        >
          {DESTINATIONS.map((destination) => {
            const Icon = destination.icon;

            return (
              <Tabs.Tab
                key={destination.value}
                value={destination.value}
                className={matched.has(destination.value) ? undefined : "hidden"}
              >
                <Icon size={17} />
                <span className="truncate">{destination.label}</span>
              </Tabs.Tab>
            );
          })}
          {activeIsVisible ? <Tabs.Indicator /> : null}
        </Tabs.List>

        {matches.length === 0 ? (
          <p className="m-0 px-2.5 text-sm text-gryt-muted">
            Nothing matches “{query}”.
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col">
        {/* Plain elements, not Dialog.Title and Dialog.Close. This body is
            also rendered outside a dialog — on the docs page you are reading
            it on — and Base UI throws if its parts are used without a
            Dialog.Root above them. */}
        <header className="flex items-center justify-between gap-3 border-b border-gryt-border px-5 py-3">
          <h2 className="m-0 text-base font-semibold text-gryt-text">
            {panel.label}
          </h2>
          {onClose ? (
            <IconButton
              aria-label="Close settings"
              size="small"
              onClick={onClose}
            >
              <X size={16} />
            </IconButton>
          ) : null}
        </header>

        {/* One scroll region, on the right. The rail is short enough to fit,
            and scrolling both at once is how you lose your place.

            The scroll region wraps the panels rather than sitting inside each
            one: it is the same box whichever destination you are on, so
            switching does not rebuild the scroller and lose your position. */}
        <ScrollArea.Root className="min-h-0 flex-1">
          <ScrollArea.Viewport className="px-5 py-5">
            <ScrollArea.Content>
              {DESTINATIONS.map((destination) => (
                <Tabs.Panel
                  key={destination.value}
                  value={destination.value}
                  className="flex flex-col gap-5 p-0"
                >
                  {destination.panel}
                </Tabs.Panel>
              ))}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" />
        </ScrollArea.Root>
      </div>
    </Tabs>
  );
}

/* ── the panels ─────────────────────────────────────────────── */

function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="m-0 text-xs font-semibold uppercase tracking-wider text-gryt-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

/** A labelled row. The description carries the caveat, so the label can stay
    short enough to scan down the column. */
function Row({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="m-0 text-sm text-gryt-text">{label}</p>
        {description ? (
          <p className="m-0 text-xs leading-5 text-gryt-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}

function YouPanel() {
  return (
    <>
      <Section title="Profile">
        <TextField label="Display name" defaultValue="sivert" />
        <TextField
          label="Status"
          placeholder="What are you up to?"
          defaultValue=""
        />
      </Section>
      <Divider />
      <Section title="Identity">
        <Row
          label="Key fingerprint"
          description="The public half of the keypair this device signs with."
        >
          <code className="font-mono text-xs text-gryt-muted">
            4f2a 91c8 7d13 aa60
          </code>
        </Row>
        <Row
          label="Require approval on new devices"
          description="A new device has to be authorised from one you already trust."
        >
          <Switch defaultChecked />
        </Row>
      </Section>
    </>
  );
}

function AccountPanel() {
  return (
    <>
      <Section title="Account">
        <TextField label="Email" defaultValue="sivert@example.com" />
        <Row
          label="Two-factor authentication"
          description="Handled by your identity server, not by Gryt."
        >
          <Button size="small" tone="neutral">
            Manage
          </Button>
        </Row>
      </Section>
      <Divider />
      <Section title="Sessions">
        <Row label="This device" description="macOS · signed in 2 hours ago">
          <Button size="small" tone="neutral" disabled>
            Current
          </Button>
        </Row>
        <Row label="gryt-desktop" description="Windows · 3 days ago">
          <Button size="small" tone="danger">
            Sign out
          </Button>
        </Row>
      </Section>
    </>
  );
}

function SoundAndVideoPanel() {
  return (
    <>
      <Section title="Devices">
        <Select
          label="Microphone"
          defaultValue="studio"
          options={[
            { label: "Studio microphone", value: "studio" },
            { label: "Built-in microphone", value: "builtin" },
            { label: "Headset", value: "headset" }
          ]}
        />
        <Select
          label="Speaker"
          defaultValue="headphones"
          options={[
            { label: "Headphones", value: "headphones" },
            { label: "Built-in output", value: "builtin" }
          ]}
        />
      </Section>
      <Divider />
      <Section title="Input">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gryt-text">Input volume</span>
            <span className="text-gryt-muted">72%</span>
          </div>
          <Slider defaultValue={72} aria-label="Input volume" />
        </div>
        {/* Meter, not Progress: this is a reading right now, and it announces
            differently to a screen reader. */}
        <Meter value={38} label="Input level" showValue />
      </Section>
      <Divider />
      <Section title="Voice processing">
        <Row
          label="Noise suppression"
          description="Removes fan and keyboard noise before it is sent."
        >
          <Switch defaultChecked />
        </Row>
        <Row label="Echo cancellation">
          <Switch defaultChecked />
        </Row>
        <Row
          label="Automatic gain control"
          description="Off if you already run a compressor upstream."
        >
          <Switch />
        </Row>
      </Section>
    </>
  );
}

function LooksPanel() {
  return (
    <>
      <Section title="Appearance">
        <Select
          label="Theme"
          defaultValue="dark"
          options={[
            { label: "Gryt dark", value: "dark" },
            { label: "Gryt light", value: "light" },
            { label: "Match the system", value: "system" }
          ]}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gryt-text">Message density</span>
            <span className="text-gryt-muted">comfortable</span>
          </div>
          <Slider defaultValue={50} aria-label="Message density" />
        </div>
      </Section>
      <Divider />
      <Section title="Chat">
        <Row label="Show avatars beside messages">
          <Switch defaultChecked />
        </Row>
        <Row
          label="Play animated emoji"
          description="Off saves a surprising amount of battery on a laptop."
        >
          <Switch defaultChecked />
        </Row>
      </Section>
    </>
  );
}

function BehaviourPanel() {
  return (
    <>
      <Section title="Voice">
        <Row
          label="Push to talk"
          description="Hold a key to transmit instead of sending on voice activity."
        >
          <Switch />
        </Row>
        <Row label="Keybind">
          <code className="rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface-raised px-2 py-1 font-mono text-xs text-gryt-muted">
            ⌥ Space
          </code>
        </Row>
      </Section>
      <Divider />
      <Section title="Notifications">
        <Row label="Notify me when someone joins a voice channel">
          <Switch defaultChecked />
        </Row>
        <Row label="Notify me on direct messages">
          <Switch defaultChecked />
        </Row>
        <Row
          label="Play a sound"
          description="Notifications stay silent while you are in a call either way."
        >
          <Switch />
        </Row>
      </Section>
    </>
  );
}

const DESTINATIONS: Destination[] = [
  {
    value: "you",
    label: "You",
    icon: User,
    keywords: ["profile", "nickname", "identity", "key", "device"],
    panel: <YouPanel />
  },
  {
    value: "account",
    label: "Account",
    icon: UserCircle,
    keywords: ["email", "password", "sessions", "two-factor"],
    panel: <AccountPanel />
  },
  {
    value: "sound-video",
    label: "Sound & video",
    icon: VideoCamera,
    keywords: [
      "microphone",
      "speaker",
      "camera",
      "noise",
      "echo",
      "input",
      "output"
    ],
    panel: <SoundAndVideoPanel />
  },
  {
    value: "looks",
    label: "How Gryt looks",
    icon: Palette,
    keywords: ["theme", "appearance", "density", "avatars", "emoji"],
    panel: <LooksPanel />
  },
  {
    value: "behaviour",
    label: "How Gryt behaves",
    icon: FadersHorizontal,
    keywords: ["hotkey", "push to talk", "notifications", "presence"],
    panel: <BehaviourPanel />
  }
];
