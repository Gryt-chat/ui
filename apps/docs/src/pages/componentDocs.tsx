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
  ConversationItem,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MessageBubble,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Surface,
  Switch,
  Tabs,
  TextField,
  Tooltip
} from "@gryt/ui";
import { Bell, DotsThree, PaperPlaneTilt } from "@phosphor-icons/react";
import type { Tone } from "@gryt/ui";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { Preview } from "../components/Preview";

export interface ComponentDoc {
  slug: string;
  name: string;
  description: string;
  importName: string;
  preview:
    | "button"
    | "icon-button"
    | "text-field"
    | "select"
    | "checkbox"
    | "radio"
    | "switch"
    | "slider"
    | "avatar"
    | "badge"
    | "chip"
    | "tooltip"
    | "divider"
    | "card"
    | "alert"
    | "progress"
    | "spinner"
    | "skeleton"
    | "dialog"
    | "drawer"
    | "menu"
    | "tabs"
    | "accordion"
    | "surface"
    | "message-bubble"
    | "composer"
    | "conversation-item";
  code: string;
}

export interface ComponentNavSection {
  title: string;
  items: Array<Pick<ComponentDoc, "name" | "slug">>;
}

export const componentNavSections: ComponentNavSection[] = [
  {
    title: "Actions",
    items: [
      { name: "Button", slug: "button" },
      { name: "IconButton", slug: "icon-button" }
    ]
  },
  {
    title: "Data Input",
    items: [
      { name: "TextField", slug: "text-field" },
      { name: "Select", slug: "select" },
      { name: "Checkbox", slug: "checkbox" },
      { name: "Radio", slug: "radio" },
      { name: "Switch", slug: "switch" },
      { name: "Slider", slug: "slider" }
    ]
  },
  {
    title: "Data Display",
    items: [
      { name: "Avatar", slug: "avatar" },
      { name: "Badge", slug: "badge" },
      { name: "Chip", slug: "chip" },
      { name: "Tooltip", slug: "tooltip" },
      { name: "Divider", slug: "divider" }
    ]
  },
  {
    title: "Feedback",
    items: [
      { name: "Alert", slug: "alert" },
      { name: "Progress", slug: "progress" },
      { name: "Spinner", slug: "spinner" },
      { name: "Skeleton", slug: "skeleton" }
    ]
  },
  {
    title: "Navigation",
    items: [
      { name: "Menu", slug: "menu" },
      { name: "Tabs", slug: "tabs" },
      { name: "Accordion", slug: "accordion" }
    ]
  },
  {
    title: "Layout",
    items: [
      { name: "Surface", slug: "surface" },
      { name: "Card", slug: "card" },
      { name: "Dialog", slug: "dialog" },
      { name: "Drawer", slug: "drawer" }
    ]
  },
  {
    title: "Chat",
    items: [
      { name: "MessageBubble", slug: "message-bubble" },
      { name: "Composer", slug: "composer" },
      { name: "ConversationItem", slug: "conversation-item" }
    ]
  }
];

export const componentDocs: ComponentDoc[] = [
  {
    slug: "button",
    name: "Button",
    description:
      "Primary, secondary, neutral, danger, and ghost actions, fully rounded, that grow on hover and shrink on press.",
    importName: "Button",
    preview: "button",
    code: `import { Button } from "@gryt/ui";

<Button>Primary</Button>
<Button tone="secondary">Secondary</Button>
<Button tone="neutral">Neutral</Button>
<Button tone="danger">Danger</Button>
<Button tone="ghost">Ghost</Button>

<Button size="xsmall">Extra small</Button>
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>`
  },
  {
    slug: "icon-button",
    name: "IconButton",
    description:
      "Circular icon actions for compact toolbars and dense desktop controls.",
    importName: "IconButton",
    preview: "icon-button",
    code: `import { IconButton } from "@gryt/ui";
import { Bell, PaperPlaneTilt } from "@phosphor-icons/react";

<IconButton aria-label="Notifications">
  <Bell size={18} />
</IconButton>
<IconButton tone="secondary" aria-label="Send">
  <PaperPlaneTilt size={18} />
</IconButton>`
  },
  {
    slug: "text-field",
    name: "TextField",
    description:
      "Rounded text fields for forms, settings, and composer-adjacent inputs.",
    importName: "TextField",
    preview: "text-field",
    code: `import { TextField } from "@gryt/ui";

<TextField label="Workspace" defaultValue="Gryt Chat" />
<TextField label="Server slug" size="small" defaultValue="design-sync" />
<TextField label="Notes" multiline minRows={3} />
<TextField label="Slug" error helperText="Already taken" />`
  },
  {
    slug: "select",
    name: "Select",
    description:
      "Themed option selection with Gryt surfaces and rounded menus.",
    importName: "Select",
    preview: "select",
    code: `import { Select } from "@gryt/ui";
import { useState } from "react";

function SelectExample() {
  const [device, setDevice] = useState("studio");

  return (
    <Select
      label="Input device"
      value={device}
      onValueChange={(next) => setDevice(String(next))}
      options={[
        { label: "Studio mic", value: "studio" },
        { label: "Headset", value: "headset" },
        { label: "System default", value: "system" }
      ]}
    />
  );
}`
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description: "Binary selection control for settings and preference rows.",
    importName: "Checkbox",
    preview: "checkbox",
    code: `import { Checkbox } from "@gryt/ui";

<Checkbox defaultChecked tone="primary" aria-label="Primary" />
<Checkbox defaultChecked tone="secondary" aria-label="Secondary" />
<Checkbox defaultChecked tone="danger" aria-label="Danger" />`
  },
  {
    slug: "radio",
    name: "Radio",
    description: "Single-choice control styled with the Gryt accent color.",
    importName: "Radio",
    preview: "radio",
    code: `import { Radio, RadioGroup } from "@gryt/ui";
import { useState } from "react";

function RadioExample() {
  const [mode, setMode] = useState("voice");

  return (
    <RadioGroup value={mode} onValueChange={(next) => setMode(String(next))}>
      <label>
        <Radio value="voice" />
        Voice activity
      </label>
      <label>
        <Radio value="push" tone="secondary" />
        Push to talk
      </label>
    </RadioGroup>
  );
}`
  },
  {
    slug: "switch",
    name: "Switch",
    description:
      "Toggle control for on/off settings such as voice activity or presence.",
    importName: "Switch",
    preview: "switch",
    code: `import { Switch } from "@gryt/ui";

<Switch defaultChecked tone="primary" aria-label="Primary" />
<Switch defaultChecked tone="secondary" aria-label="Secondary" />
<Switch defaultChecked tone="danger" aria-label="Danger" />`
  },
  {
    slug: "slider",
    name: "Slider",
    description:
      "Range control for volume, thresholds, and other numeric settings.",
    importName: "Slider",
    preview: "slider",
    code: `import { Slider } from "@gryt/ui";

<Slider defaultValue={64} tone="primary" aria-label="Input volume" />
<Slider defaultValue={42} tone="secondary" aria-label="Output volume" />
<Slider defaultValue={78} tone="danger" aria-label="Danger threshold" />`
  },
  {
    slug: "avatar",
    name: "Avatar",
    description: "Identity marker for users, servers, and conversation rows.",
    importName: "Avatar",
    preview: "avatar",
    code: `import { Avatar } from "@gryt/ui";

<Avatar>G</Avatar>`
  },
  {
    slug: "badge",
    name: "Badge",
    description:
      "Small counters and status markers layered on icons or avatars.",
    importName: "Badge",
    preview: "badge",
    code: `import { Avatar, Badge } from "@gryt/ui";

<Badge badgeContent={3}>
  <Avatar>G</Avatar>
</Badge>`
  },
  {
    slug: "chip",
    name: "Chip",
    description: "Compact labels for state, filters, and metadata.",
    importName: "Chip",
    preview: "chip",
    code: `import { Chip } from "@gryt/ui";

<Chip label="Connected" tone="success" />
<Chip label="Beta" tone="secondary" />
<Chip label="Muted" tone="warning" />
<Chip label="Danger" tone="danger" />`
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    description: "Hover and focus hints for icon-only controls.",
    importName: "Tooltip",
    preview: "tooltip",
    code: `import { IconButton, Tooltip } from "@gryt/ui";

<Tooltip title="Notifications">
  <IconButton aria-label="Notifications">...</IconButton>
</Tooltip>`
  },
  {
    slug: "divider",
    name: "Divider",
    description: "Subtle separators for menus, panels, and grouped content.",
    importName: "Divider",
    preview: "divider",
    code: `import { Divider } from "@gryt/ui";

<Divider />`
  },
  {
    slug: "alert",
    name: "Alert",
    description:
      "Feedback banners for success, warning, error, and informational states.",
    importName: "Alert",
    preview: "alert",
    code: `import { Alert } from "@gryt/ui";

<Alert severity="success">Connected to Gryt.</Alert>
<Alert severity="warning">Input level is peaking.</Alert>
<Alert severity="error">Connection failed.</Alert>`
  },
  {
    slug: "progress",
    name: "Progress",
    description: "Linear progress indicator for loading and completion states.",
    importName: "Progress",
    preview: "progress",
    code: `import { Progress } from "@gryt/ui";
import { useEffect, useState } from "react";

function ProgressExample() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : current + 10));
    }, 500);

    return () => window.clearInterval(timer);
  }, []);

  return <Progress variant="determinate" value={value} />;
}`
  },
  {
    slug: "spinner",
    name: "Spinner",
    description: "Circular loading indicator for compact async states.",
    importName: "Spinner",
    preview: "spinner",
    code: `import { Spinner } from "@gryt/ui";

<Spinner size={24} />`
  },
  {
    slug: "skeleton",
    name: "Skeleton",
    description: "Placeholder blocks for loading panels and rows.",
    importName: "Skeleton",
    preview: "skeleton",
    code: `import { Skeleton } from "@gryt/ui";

<Skeleton variant="rounded" width={220} height={42} />`
  },
  {
    slug: "menu",
    name: "Menu",
    description: "Floating command lists with keyboard navigation.",
    importName: "Menu",
    preview: "menu",
    code: `import { IconButton, Menu } from "@gryt/ui";

<Menu.Root>
  <Menu.Trigger render={<IconButton aria-label="Open menu" />}>
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
</Menu.Root>`
  },
  {
    slug: "tabs",
    name: "Tabs",
    description: "Tabbed navigation for local panels and settings groups.",
    importName: "Tabs",
    preview: "tabs",
    code: `import { Tabs } from "@gryt/ui";
import { useState } from "react";

function TabsExample() {
  const [value, setValue] = useState("chat");

  return (
    <Tabs value={value} onValueChange={setValue}>
      <Tabs.List aria-label="Views">
        <Tabs.Tab value="chat">Chat</Tabs.Tab>
        <Tabs.Tab value="voice">Voice</Tabs.Tab>
        <Tabs.Tab value="files">Files</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}`
  },
  {
    slug: "accordion",
    name: "Accordion",
    description: "Disclosure panels for dense settings and grouped details.",
    importName: "Accordion",
    preview: "accordion",
    code: `import { Accordion } from "@gryt/ui";

<Accordion defaultValue={["voice"]}>
  <Accordion.Item value="voice">
    <Accordion.Trigger>Voice settings</Accordion.Trigger>
    <Accordion.Panel>Input and output controls.</Accordion.Panel>
  </Accordion.Item>
</Accordion>`
  },
  {
    slug: "surface",
    name: "Surface",
    description: "The base rounded panel primitive for Gryt layouts.",
    importName: "Surface",
    preview: "surface",
    code: `import { Surface } from "@gryt/ui";

<Surface elevated className="p-4">Panel content</Surface>`
  },
  {
    slug: "card",
    name: "Card",
    description:
      "Grouped content with Gryt borders, surfaces, and rounded shape.",
    importName: "Card",
    preview: "card",
    code: `import { Card, CardContent, CardHeader } from "@gryt/ui";

<Card>
  <CardHeader title="Server status" />
  <CardContent>Latency stable.</CardContent>
</Card>`
  },
  {
    slug: "dialog",
    name: "Dialog",
    description: "Modal surfaces for confirmations and focused tasks.",
    importName: "Dialog",
    preview: "dialog",
    code: `import { Dialog } from "@gryt/ui";

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Join server?</Dialog.Title>
      <Dialog.Description>Confirm the action.</Dialog.Description>
      <Dialog.Footer>
        <Dialog.Close render={<Button tone="neutral" />}>Cancel</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>`
  },
  {
    slug: "drawer",
    name: "Drawer",
    description: "Side panel for navigation, details, or narrow workflows.",
    importName: "Drawer",
    preview: "drawer",
    code: `import { Button, Drawer } from "@gryt/ui";

<Drawer.Root open={open} onOpenChange={setOpen}>
  <Drawer.Trigger render={<Button />}>Open drawer</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Popup side="right">
      <Drawer.Title>Gryt Drawer</Drawer.Title>
      <Drawer.Description>Side panel content.</Drawer.Description>
    </Drawer.Popup>
  </Drawer.Portal>
</Drawer.Root>`
  },
  {
    slug: "message-bubble",
    name: "MessageBubble",
    description: "Chat bubble states for user, assistant, and system messages.",
    importName: "MessageBubble",
    preview: "message-bubble",
    code: `import { MessageBubble } from "@gryt/ui";

<MessageBubble from="assistant">Rounded bubble on a Gryt surface.</MessageBubble>`
  },
  {
    slug: "composer",
    name: "Composer",
    description: "Autosizing chat input with a built-in submit action.",
    importName: "Composer",
    preview: "composer",
    code: `import { Composer } from "@gryt/ui";

<Composer submitLabel="Send" />`
  },
  {
    slug: "conversation-item",
    name: "ConversationItem",
    description:
      "Selectable conversation row for sidebars and inbox-style lists.",
    importName: "ConversationItem",
    preview: "conversation-item",
    code: `import { ConversationItem } from "@gryt/ui";

<ConversationItem title="Gryt UI" subtitle="Component system" active />`
  }
];

const docsBySlug = new Map(componentDocs.map((doc) => [doc.slug, doc]));

export function ComponentDocPage() {
  const { component } = useParams();
  const doc = component ? docsBySlug.get(component) : undefined;

  if (!doc) {
    return <Navigate replace to="/components/button" />;
  }

  return (
    <article className="prose prose-invert max-w-none">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gryt-muted">
        {doc.importName}
      </p>
      <h1>{doc.name}</h1>
      <p>{doc.description}</p>
      <Preview>
        <ComponentPreview preview={doc.preview} />
      </Preview>
      <CodeBlock code={doc.code} language="tsx" title={`${doc.name}.tsx`} />
    </article>
  );
}

function ComponentPreview({ preview }: { preview: ComponentDoc["preview"] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputDevice, setInputDevice] = useState("studio");
  const [radioMode, setRadioMode] = useState("voice");
  const [tabValue, setTabValue] = useState("chat");

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
  }
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
