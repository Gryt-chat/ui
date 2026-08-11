import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Composer,
  ContextMenu,
  ConversationItem,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MessageBubble,
  Meter,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  ScrollArea,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Surface,
  Switch,
  Tabs,
  TextField,
  Toast,
  Toggle,
  ToggleGroup,
  Tooltip,
  useToastManager
} from "@gryt/ui";
import { Bell, DotsThree, PaperPlaneTilt } from "@phosphor-icons/react";
import type { Tone } from "@gryt/ui";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { Preview } from "../components/Preview";

import type { ComponentDoc } from "../componentMeta";
import { componentDocs } from "../componentMeta";

// The registry moved to ../componentMeta so a build script can read it without
// pulling in @gryt/ui and its stylesheet. Re-exported here so the pages and
// components that already import it from this module keep working.
export type { ComponentDoc, ComponentNavSection } from "../componentMeta";
export { componentDocs, componentNavSections } from "../componentMeta";

const docsBySlug = new Map(componentDocs.map((doc) => [doc.slug, doc]));

export function ComponentDocPage() {
  const { component } = useParams();
  const doc = component ? docsBySlug.get(component) : undefined;

  if (!doc) {
    return <Navigate replace to="/components/button" />;
  }

  const index = componentDocs.findIndex((entry) => entry.slug === doc.slug);
  const previous = componentDocs[index - 1];
  const next = componentDocs[index + 1];

  return (
    <article>
      {/* Label stacks above the heading in the same column. The tag-left /
          heading-right split is the templated-editorial tell. */}
      <header className="pb-(--space-md)">
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent">
          {doc.importName}
        </p>
        <h1 className="mt-2 font-display text-[length:var(--text-2xl)] font-semibold leading-tight tracking-[-0.022em] text-gryt-text">
          {doc.name}
        </h1>
        <p className="mt-2 max-w-[62ch] text-[length:var(--text-md)] leading-7 text-gryt-muted">
          {doc.description}
        </p>
      </header>

      <Preview>
        <ComponentPreview preview={doc.preview} />
      </Preview>
      <CodeBlock code={doc.code} language="tsx" title={`${doc.name}.tsx`} />

      <nav
        aria-label="Component pagination"
        className="mt-(--space-lg) flex flex-col gap-2 border-t border-gryt-border pt-(--space-md) sm:flex-row sm:justify-between"
      >
        {previous ? (
          <Link className={pagerClass} to={`/components/${previous.slug}`}>
            <span className="block text-xs text-gryt-muted">Previous</span>
            <span className="block font-medium text-gryt-text">
              {previous.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            className={`${pagerClass} sm:text-right`}
            to={`/components/${next.slug}`}
          >
            <span className="block text-xs text-gryt-muted">Next</span>
            <span className="block font-medium text-gryt-text">{next.name}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

const pagerClass =
  "min-w-0 rounded-(--gryt-radius-md) border border-gryt-border px-4 py-2.5 text-sm transition-colors hover:border-gryt-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light";

function ComponentPreview({ preview }: { preview: ComponentDoc["preview"] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputDevice, setInputDevice] = useState("studio");
  const [radioMode, setRadioMode] = useState("voice");
  const [tabValue, setTabValue] = useState("chat");
  const [muted, setMuted] = useState(false);
  const [layout, setLayout] = useState<string[]>(["grid"]);

  switch (preview) {
    case "button":
      return (
        <div className="grid w-full gap-5">
          <ExampleSection title="Tones">
            <Button>Primary</Button>
            <Button tone="secondary">Secondary</Button>
            <Button tone="neutral">Neutral</Button>
            <Button tone="danger">Danger</Button>
            <Button tone="ghost">Ghost</Button>
          </ExampleSection>
          <ExampleSection title="Sizes">
            <Button size="xsmall">Extra small</Button>
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="large">Large</Button>
          </ExampleSection>
        </div>
      );
    case "icon-button":
      return (
        <div className="grid w-full gap-5">
          <ExampleSection title="Tones">
            <IconButton tone="primary" aria-label="Notifications">
              <Bell size={18} />
            </IconButton>
            <IconButton tone="secondary" aria-label="Send">
              <PaperPlaneTilt size={18} />
            </IconButton>
            <IconButton tone="neutral" aria-label="More options">
              <DotsThree size={18} />
            </IconButton>
            <IconButton tone="danger" aria-label="Warnings">
              <Bell size={18} />
            </IconButton>
            <IconButton tone="ghost" aria-label="Ghost action">
              <DotsThree size={18} />
            </IconButton>
          </ExampleSection>
          <ExampleSection title="Sizes">
            <IconButton size="xsmall" aria-label="Extra small">
              <Bell size={14} />
            </IconButton>
            <IconButton size="small" aria-label="Small">
              <Bell size={16} />
            </IconButton>
            <IconButton size="medium" aria-label="Medium">
              <Bell size={18} />
            </IconButton>
            <IconButton size="large" aria-label="Large">
              <Bell size={22} />
            </IconButton>
          </ExampleSection>
        </div>
      );
    case "text-field":
      return (
        <div className="grid w-full gap-4 md:grid-cols-2">
          <TextField label="Workspace" defaultValue="Gryt Chat" />
          <TextField
            label="Server slug"
            size="small"
            defaultValue="design-sync"
          />
          <TextField
            label="Topic"
            defaultValue="Voice settings"
          />
          <TextField label="Notes" multiline minRows={3} />
        </div>
      );
    case "select":
      return (
        <div className="grid w-full gap-4 md:grid-cols-2">
          <Select
            label="Input device"
            value={inputDevice}
            onValueChange={(next) => setInputDevice(String(next))}
            options={[
              { label: "Studio mic", value: "studio" },
              { label: "Headset", value: "headset" },
              { label: "System default", value: "system" }
            ]}
          />
          <Select
            label="Output device"
            defaultValue="speakers"
            size="small"
            options={[
              { label: "Speakers", value: "speakers" },
              { label: "Headphones", value: "headphones" },
              { label: "Unavailable display", value: "display", disabled: true }
            ]}
          />
        </div>
      );
    case "checkbox":
      return (
        <ControlGrid>
          <ControlExample label="Primary">
            <Checkbox defaultChecked tone="primary" aria-label="Primary" />
          </ControlExample>
          <ControlExample label="Secondary">
            <Checkbox defaultChecked tone="secondary" aria-label="Secondary" />
          </ControlExample>
          <ControlExample label="Success">
            <Checkbox defaultChecked tone="success" aria-label="Success" />
          </ControlExample>
          <ControlExample label="Warning">
            <Checkbox defaultChecked tone="warning" aria-label="Warning" />
          </ControlExample>
          <ControlExample label="Danger">
            <Checkbox defaultChecked tone="danger" aria-label="Danger" />
          </ControlExample>
        </ControlGrid>
      );
    case "radio":
      return (
        <div className="grid w-full gap-4">
          <div className="grid gap-2">
            <RadioGroup
              value={radioMode}
              onValueChange={(next) => setRadioMode(String(next))}
            >
              <RadioOption tone="primary" label="Voice activity" value="voice" />
              <RadioOption tone="secondary" label="Push to talk" value="push" />
              <RadioOption tone="danger" label="Muted" value="muted" />
            </RadioGroup>
          </div>
          <p className="text-sm text-gryt-muted">
            Selected: <span className="text-gryt-text">{radioMode}</span>
          </p>
        </div>
      );
    case "switch":
      return (
        <ControlGrid>
          <ControlExample label="Primary">
            <Switch defaultChecked tone="primary" aria-label="Primary" />
          </ControlExample>
          <ControlExample label="Secondary">
            <Switch defaultChecked tone="secondary" aria-label="Secondary" />
          </ControlExample>
          <ControlExample label="Success">
            <Switch defaultChecked tone="success" aria-label="Success" />
          </ControlExample>
          <ControlExample label="Warning">
            <Switch defaultChecked tone="warning" aria-label="Warning" />
          </ControlExample>
          <ControlExample label="Danger">
            <Switch defaultChecked tone="danger" aria-label="Danger" />
          </ControlExample>
        </ControlGrid>
      );
    case "slider":
      return (
        <div className="grid w-full gap-5">
          <SliderExample
            label="Input"
            value={64}
            tone="primary"
            ariaLabel="Input volume"
          />
          <SliderExample
            label="Output"
            value={42}
            tone="secondary"
            ariaLabel="Output volume"
          />
          <SliderExample
            label="Warning"
            value={72}
            tone="warning"
            ariaLabel="Warning threshold"
          />
          <SliderExample
            label="Danger"
            value={88}
            tone="danger"
            ariaLabel="Danger threshold"
          />
        </div>
      );
    case "avatar":
      return <Avatar>G</Avatar>;
    case "badge":
      return (
        <Badge badgeContent={3}>
          <Avatar>G</Avatar>
        </Badge>
      );
    case "chip":
      return (
        <div className="flex flex-wrap gap-3">
          <Chip label="Connected" tone="success" />
          <Chip label="Beta" tone="secondary" />
          <Chip label="Muted" tone="warning" />
          <Chip label="Danger" tone="danger" />
        </div>
      );
    case "tooltip":
      return (
        <Tooltip title="Notifications">
          <IconButton aria-label="Notifications">
            <Bell size={18} />
          </IconButton>
        </Tooltip>
      );
    case "divider":
      return (
        <div className="w-full">
          <p className="text-sm text-gryt-muted">Before</p>
          <Divider className="my-4" />
          <p className="text-sm text-gryt-muted">After</p>
        </div>
      );
    case "alert":
      return (
        <div className="grid w-full gap-3">
          <Alert severity="success">Connected to Gryt.</Alert>
          <Alert severity="info">New voice region available.</Alert>
          <Alert severity="warning">Input level is peaking.</Alert>
          <Alert severity="error">Connection failed.</Alert>
        </div>
      );
    case "progress":
      return <AnimatedProgressPreview />;
    case "spinner":
      return <Spinner size={28} />;
    case "skeleton":
      return <Skeleton variant="rounded" width={220} height={42} />;
    case "menu":
      return (
        <div>
          <Menu.Root>
            <Menu.Trigger
              render={<IconButton aria-label="Open menu" />}
            >
              <DotsThree size={18} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="start">
                <Menu.Popup>
                  <Menu.Item>Edit server</Menu.Item>
                  <Menu.Item>Invite people</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item>Leave</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      );
    case "tabs":
      return (
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <Tabs.List aria-label="Views">
            <Tabs.Tab value="chat">Chat</Tabs.Tab>
            <Tabs.Tab value="voice">Voice</Tabs.Tab>
            <Tabs.Tab value="files">Files</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs>
      );
    case "accordion":
      return (
        <Accordion defaultValue={["voice"]}>
          <Accordion.Item value="voice">
            <Accordion.Trigger>Voice settings</Accordion.Trigger>
            <Accordion.Panel>
              Input, output, threshold, and suppression controls belong here.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="video">
            <Accordion.Trigger>Video settings</Accordion.Trigger>
            <Accordion.Panel>
              Camera, resolution, and background blur belong here.
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      );
    case "surface":
      return (
        <Surface elevated className="p-4">
          Panel content on a Gryt surface.
        </Surface>
      );
    case "card":
      return (
        <Card>
          <CardHeader title="Server status" subheader="Gryt voice region" />
          <CardContent>
            Latency stable. Voice activity detection active.
          </CardContent>
          <CardActions>
            <Button size="small">Open</Button>
            <Button tone="neutral" size="small">
              Details
            </Button>
          </CardActions>
        </Card>
      );
    case "dialog":
      return (
        <>
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger render={<Button />}>Open dialog</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop />
              <Dialog.Popup>
                <Dialog.Title>Join Gryt server?</Dialog.Title>
                <Dialog.Description>
                  Flat Gryt surface and border, no shadow, on the Base UI
                  dialog.
                </Dialog.Description>
                <Dialog.Footer>
                  <Dialog.Close render={<Button tone="neutral" />}>
                    Cancel
                  </Dialog.Close>
                  <Dialog.Close render={<Button />}>Join</Dialog.Close>
                </Dialog.Footer>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </>
      );
    case "drawer":
      return (
        <>
          <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Drawer.Trigger render={<Button />}>Open drawer</Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Popup side="right">
                <Drawer.Title className="text-lg font-semibold text-gryt-text">
                  Gryt Drawer
                </Drawer.Title>
                <Drawer.Description className="text-sm text-gryt-muted">
                  Side panel content, pinned to the edge.
                </Drawer.Description>
                <Drawer.Close render={<Button tone="neutral" />}>
                  Close
                </Drawer.Close>
              </Drawer.Popup>
            </Drawer.Portal>
          </Drawer.Root>
        </>
      );
    case "message-bubble":
      return (
        <div className="space-y-3">
          <MessageBubble from="assistant">
            Rounded bubble on a Gryt surface.
          </MessageBubble>
          <MessageBubble from="user">
            Use the Gryt code-theme colors.
          </MessageBubble>
          <MessageBubble from="system">System status message.</MessageBubble>
        </div>
      );
    case "composer":
      return <Composer submitLabel="Send" />;
    case "conversation-item":
      return (
        <Surface className="max-w-sm space-y-1 p-3" elevated>
          <ConversationItem
            title="Gryt UI"
            subtitle="Component system"
            active
          />
          <ConversationItem
            title="Design tokens"
            subtitle="Code-theme palette"
          />
          <ConversationItem title="Publishing" subtitle="npm package" />
        </Surface>
      );
    case "toggle":
      return (
        <div className="grid w-full gap-5">
          <ExampleSection title="Pressed state">
            <Toggle tone="danger" pressed={muted} onPressedChange={setMuted}>
              {muted ? "Unmute" : "Mute"}
            </Toggle>
            <Toggle tone="primary" defaultPressed>
              Deafen
            </Toggle>
            <Toggle tone="neutral">Camera</Toggle>
            <Toggle disabled>Unavailable</Toggle>
          </ExampleSection>
          <ExampleSection title="Sizes">
            <Toggle size="xsmall" defaultPressed>
              Extra small
            </Toggle>
            <Toggle size="small" defaultPressed>
              Small
            </Toggle>
            <Toggle size="medium" defaultPressed>
              Medium
            </Toggle>
            <Toggle size="large" defaultPressed>
              Large
            </Toggle>
          </ExampleSection>
        </div>
      );
    case "toggle-group":
      return (
        <ToggleGroup value={layout} onValueChange={setLayout}>
          <Toggle value="grid" size="small">
            Grid
          </Toggle>
          <Toggle value="list" size="small">
            List
          </Toggle>
          <Toggle value="focus" size="small">
            Focus
          </Toggle>
        </ToggleGroup>
      );
    case "meter":
      return <MeterExample />;
    case "context-menu":
      return (
        <ContextMenu.Root>
          <ContextMenu.Trigger
            render={
              <Surface
                className="grid h-28 w-full max-w-sm place-items-center text-sm text-gryt-muted select-none"
                elevated
              />
            }
          >
            Right-click anywhere in here
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner>
              <ContextMenu.Popup>
                <ContextMenu.Item>Reply</ContextMenu.Item>
                <ContextMenu.Item>Copy text</ContextMenu.Item>
                <ContextMenu.Item>Pin to channel</ContextMenu.Item>
                <ContextMenu.Separator />
                <ContextMenu.Item>Delete</ContextMenu.Item>
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.Root>
      );
    case "popover":
      return (
        <Popover.Root>
          <Popover.Trigger render={<Button tone="neutral" />}>
            Open member card
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup>
                <div className="flex items-center gap-3">
                  <Avatar fallback="S" />
                  <div>
                    <Popover.Title>Sivert</Popover.Title>
                    <p className="m-0 text-xs text-gryt-muted">In voice</p>
                  </div>
                </div>
                <Popover.Description>
                  Joined the channel at 20:14. Speaking through a Shure SM7B.
                </Popover.Description>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      );
    case "toast":
      return <ToastExample />;
    case "scroll-area":
      return (
        <ScrollArea.Root className="h-56 w-full max-w-sm rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface">
          <ScrollArea.Viewport className="p-3">
            <ScrollArea.Content className="grid gap-2">
              {SCROLL_ROWS.map((row) => (
                <ConversationItem
                  key={row.title}
                  title={row.title}
                  subtitle={row.subtitle}
                />
              ))}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" />
        </ScrollArea.Root>
      );
  }
}

const SCROLL_ROWS = [
  { title: "general", subtitle: "Sivert: pushed the OG images" },
  { title: "design", subtitle: "Tokens now ship as theme.css" },
  { title: "voice-lobby", subtitle: "3 people connected" },
  { title: "releases", subtitle: "server v1.3.1-beta.1" },
  { title: "incidents", subtitle: "Beta tunnel returned 502" },
  { title: "off-topic", subtitle: "Anyone up for a round?" },
  { title: "docs", subtitle: "Key rotation is documented" },
  { title: "sfu", subtitle: "SVC layers landed" }
];

// The mic level a client would feed from an analyser node. Driven here on an
// interval so the meter is doing the thing it exists for rather than sitting
// at a fixed number.
function MeterExample() {
  const [level, setLevel] = useState(42);

  useEffect(() => {
    const id = setInterval(() => {
      setLevel((current) => {
        const next = current + (Math.random() * 34 - 17);
        return Math.max(4, Math.min(96, Math.round(next)));
      });
    }, 420);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid w-full max-w-sm gap-4">
      <Meter value={level} label="Microphone" showValue />
      <Meter value={88} label="Server capacity" tone="warning" showValue />
      <Meter value={97} label="Disk" tone="danger" showValue />
    </div>
  );
}

function ToastExample() {
  return (
    <Toast.Provider>
      <ToastTrigger />
      <Toast.Portal>
        <Toast.Viewport>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastTrigger() {
  const toast = useToastManager();

  return (
    <Button
      onClick={() =>
        toast.add({
          title: "Invite copied",
          description: "The link expires in 24 hours."
        })
      }
    >
      Copy invite
    </Button>
  );
}

function ToastList() {
  const { toasts } = useToastManager();

  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast}>
      <Toast.Title />
      <Toast.Description />
      <Toast.Close />
    </Toast.Root>
  ));
}

function ExampleSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-gryt-muted">
        {title}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function ControlGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {children}
    </div>
  );
}

function ControlExample({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-gryt-border bg-gryt-surface px-3 py-2 text-sm text-gryt-muted">
      <span>{label}</span>
      {children}
    </label>
  );
}

function RadioOption({
  tone,
  label,
  value
}: {
  tone: Tone;
  label: string;
  value: string;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg border border-gryt-border bg-gryt-surface px-3 py-2 text-sm text-gryt-muted transition-colors hover:border-gryt-accent-light hover:text-gryt-text">
      <span>{label}</span>
      <Radio tone={tone} value={value} />
    </label>
  );
}

function SliderExample({
  label,
  value,
  tone,
  ariaLabel
}: {
  label: string;
  value: number;
  tone: Tone;
  ariaLabel: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gryt-text">{label}</span>
        <span className="text-gryt-muted">{value}%</span>
      </div>
      <Slider defaultValue={value} tone={tone} aria-label={ariaLabel} />
    </div>
  );
}

function AnimatedProgressPreview() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : current + 10));
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid w-full gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gryt-text">Upload progress</span>
        <span className="text-gryt-muted">{value}%</span>
      </div>
      <Progress value={value} />
      <Progress />
    </div>
  );
}
