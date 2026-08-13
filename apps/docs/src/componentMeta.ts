/* The docs registry, as plain data.
 *
 * Split out of componentDocs.tsx so the OG image generator can read it from a
 * build script. That file imports @gryt/ui, which imports CSS, which a Node or
 * Bun script cannot load — importing it just to read 27 names and descriptions
 * would drag the whole component library and its stylesheet along with it.
 *
 * componentDocs.tsx re-exports everything here, so existing importers are
 * unaffected.
 */

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
    | "conversation-item"
    | "context-menu"
    | "popover"
    | "toast"
    | "scroll-area"
    | "toggle"
    | "toggle-group"
    | "meter"
    | "alert-dialog"
    | "autocomplete"
    | "checkbox-group"
    | "collapsible"
    | "combobox"
    | "fieldset"
    | "form"
    | "menubar"
    | "navigation-menu"
    | "number-field"
    | "otp-field"
    | "preview-card"
    | "toolbar";
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
      { name: "Slider", slug: "slider" },
      { name: "Toggle", slug: "toggle" },
      { name: "ToggleGroup", slug: "toggle-group" },
      { name: "CheckboxGroup", slug: "checkbox-group" },
      { name: "NumberField", slug: "number-field" },
      { name: "OtpField", slug: "otp-field" },
      { name: "Combobox", slug: "combobox" },
      { name: "Autocomplete", slug: "autocomplete" }
    ]
  },
  {
    title: "Forms",
    items: [
      { name: "Form", slug: "form" },
      { name: "Fieldset", slug: "fieldset" }
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
      { name: "Toast", slug: "toast" },
      { name: "Progress", slug: "progress" },
      { name: "Meter", slug: "meter" },
      { name: "Spinner", slug: "spinner" },
      { name: "Skeleton", slug: "skeleton" }
    ]
  },
  {
    title: "Navigation",
    items: [
      { name: "Menu", slug: "menu" },
      { name: "ContextMenu", slug: "context-menu" },
      { name: "Menubar", slug: "menubar" },
      { name: "NavigationMenu", slug: "navigation-menu" },
      { name: "Toolbar", slug: "toolbar" },
      { name: "Popover", slug: "popover" },
      { name: "PreviewCard", slug: "preview-card" },
      { name: "Tabs", slug: "tabs" },
      { name: "Accordion", slug: "accordion" },
      { name: "Collapsible", slug: "collapsible" }
    ]
  },
  {
    title: "Layout",
    items: [
      { name: "Surface", slug: "surface" },
      { name: "Card", slug: "card" },
      { name: "Dialog", slug: "dialog" },
      { name: "AlertDialog", slug: "alert-dialog" },
      { name: "Drawer", slug: "drawer" },
      { name: "ScrollArea", slug: "scroll-area" }
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
    description:
      "Binary selection control for settings and preference rows. Reacts to its label as if it were the control.",
    importName: "Checkbox",
    preview: "checkbox",
    code: `import { Checkbox } from "@gryt/ui";

<Checkbox defaultChecked tone="primary" aria-label="Primary" />
<Checkbox defaultChecked tone="secondary" aria-label="Secondary" />
<Checkbox defaultChecked tone="danger" aria-label="Danger" />

// Wrapped in a label, the box reacts to the whole row: hovering the text
// grows it and pressing anywhere presses it. Nothing to pass — the rule
// starts at the label, so any wrapping label does it, including Field.Label.
<label className="flex items-center gap-2">
  <Checkbox name="rememberMe" />
  Remember me
</label>`
  },
  {
    slug: "radio",
    name: "Radio",
    description:
      "Single-choice control styled with the Gryt accent color. Reacts to its label as if it were the control.",
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
      "Toggle control for on/off settings such as voice activity or presence. Reacts to its label as if it were the control.",
    importName: "Switch",
    preview: "switch",
    code: `import { Switch } from "@gryt/ui";

<Switch defaultChecked tone="primary" aria-label="Primary" />
<Switch defaultChecked tone="secondary" aria-label="Secondary" />
<Switch defaultChecked tone="danger" aria-label="Danger" />

// Inside a label the switch reacts to the whole row, the same as
// Checkbox and Radio do.
<label className="flex items-center justify-between gap-6">
  Noise suppression
  <Switch defaultChecked />
</label>`
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

<Avatar size="small">G</Avatar>
<Avatar>G</Avatar>
<Avatar size="large">G</Avatar>

// fallback is what shows while the image loads, and what stays if it
// never arrives — so it is initials rather than a spinner.
<Avatar src="/owl.png" alt="Gryt" fallback="G" />
<Avatar size="large" src="/owl.png" alt="Gryt" fallback="G" />`
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
  <Avatar size="small" src="/owl.png" alt="Gryt" fallback="G" />
</Badge>
<Badge badgeContent={12}>
  <Avatar src="/owl.png" alt="Gryt" fallback="G" />
</Badge>

// Over max it reads 99+, so the badge can never outgrow what it is
// pinned to. An empty string gives a plain dot.
<Badge badgeContent={240}>
  <Avatar size="large" src="/owl.png" alt="Gryt" fallback="G" />
</Badge>
<Badge badgeContent="">
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
    description:
      "Hover and focus hints for icon-only controls, on any of the four sides.",
    importName: "Tooltip",
    preview: "tooltip",
    code: `import { IconButton, Tooltip } from "@gryt/ui";

// side is "top" by default, and flips on its own when the tooltip would
// leave the viewport — so "top" means "top if it fits".
<Tooltip title="Notifications">
  <IconButton aria-label="Notifications">...</IconButton>
</Tooltip>

<Tooltip title="Right" side="right">...</Tooltip>
<Tooltip title="Bottom" side="bottom">...</Tooltip>
<Tooltip title="Left" side="left" sideOffset={12}>...</Tooltip>`
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
    description:
      "Tabbed navigation for local panels and settings groups, in a row or down a rail.",
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
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs>
  );
}

// orientation goes on the root and nowhere else. Every part styles itself
// from the data-orientation Base UI puts on the DOM, and the arrow keys
// follow it too — up and down rather than left and right.
function VerticalTabsExample() {
  const [value, setValue] = useState("chat");

  return (
    <Tabs orientation="vertical" value={value} onValueChange={setValue}>
      <Tabs.List aria-label="Views" className="w-40">
        <Tabs.Tab value="chat">Chat</Tabs.Tab>
        <Tabs.Tab value="voice">Voice</Tabs.Tab>
        <Tabs.Tab value="files">Files</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="chat">Messages, threads and pins.</Tabs.Panel>
      <Tabs.Panel value="voice">Input, output and suppression.</Tabs.Panel>
      <Tabs.Panel value="files">Uploads shared in this channel.</Tabs.Panel>
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
    description:
      "An edge panel you can drag away to dismiss — left, right, top or bottom — which becomes a bottom sheet under 768px.",
    importName: "Drawer",
    preview: "drawer",
    code: `import { Button, Drawer } from "@gryt/ui";

// side lives on Root, because the swipe direction is Root's business.
// Under 768px this becomes a bottom sheet; pass sheetOnMobile={false} to keep
// the side at every width.
<Drawer.Root open={open} onOpenChange={setOpen} side="right">
  <Drawer.Trigger render={<Button />}>Open drawer</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop />
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Grabber />
        <Drawer.Title>Gryt Drawer</Drawer.Title>
        <Drawer.Description>Drag it away to dismiss.</Drawer.Description>
      </Drawer.Popup>
    </Drawer.Viewport>
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
  },
  {
    slug: "toggle",
    name: "Toggle",
    description:
      "A button that stays pressed, for state you switch rather than actions you fire — mute, deafen, camera off.",
    importName: "Toggle",
    preview: "toggle",
    code: `import { Toggle } from "@gryt/ui";
import { useState } from "react";

function MuteToggle() {
  const [muted, setMuted] = useState(false);

  return (
    <Toggle tone="danger" pressed={muted} onPressedChange={setMuted}>
      {muted ? "Unmute" : "Mute"}
    </Toggle>
  );
}`
  },
  {
    slug: "toggle-group",
    name: "ToggleGroup",
    description:
      "A rail of toggles sharing one value, with arrow-key movement and a single tab stop.",
    importName: "ToggleGroup",
    preview: "toggle-group",
    code: `import { Toggle, ToggleGroup } from "@gryt/ui";
import { useState } from "react";

function LayoutPicker() {
  const [value, setValue] = useState(["grid"]);

  return (
    <ToggleGroup value={value} onValueChange={setValue}>
      <Toggle value="grid" size="small">Grid</Toggle>
      <Toggle value="list" size="small">List</Toggle>
      <Toggle value="focus" size="small">Focus</Toggle>
    </ToggleGroup>
  );
}`
  },
  {
    slug: "meter",
    name: "Meter",
    description:
      "A reading inside a known range, such as mic input level — a measurement rather than the task completion Progress models.",
    importName: "Meter",
    preview: "meter",
    code: `import { Meter } from "@gryt/ui";

<Meter value={62} label="Microphone" showValue />
<Meter value={88} label="Server capacity" tone="warning" showValue />`
  },
  {
    slug: "context-menu",
    name: "ContextMenu",
    description:
      "A right-click menu for a message, member or channel, sharing Menu's popup and items so the two cannot drift apart.",
    importName: "ContextMenu",
    preview: "context-menu",
    code: `import { ContextMenu } from "@gryt/ui";

<ContextMenu.Root>
  <ContextMenu.Trigger>Right-click a message</ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item>Reply</ContextMenu.Item>
        <ContextMenu.Item>Copy text</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>Delete</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>`
  },
  {
    slug: "popover",
    name: "Popover",
    description:
      "An anchored panel for content and controls — a member card, a permissions summary — rather than a column of items. Sits on any side, with any alignment.",
    importName: "Popover",
    preview: "popover",
    code: `import { Popover } from "@gryt/ui";

<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Portal>
    {/* side is top, right, bottom or left; align is start, center or
        end along it. Both flip when the popup would leave the
        viewport, so what you pass is a preference, not a promise. */}
    <Popover.Positioner side="right" align="start" sideOffset={8}>
      <Popover.Popup>
        <Popover.Title>Sivert</Popover.Title>
        <Popover.Description>
          In voice since 20:14. Speaking through a Shure SM7B.
        </Popover.Description>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>`
  },
  {
    slug: "toast",
    name: "Toast",
    description:
      "A transient notice for things that happen away from where you are looking, such as losing the connection.",
    importName: "Toast",
    preview: "toast",
    code: `import { Toast, useToastManager, Button } from "@gryt/ui";

// Wrap the app once.
<Toast.Provider>
  <App />
  <Toast.Portal>
    <Toast.Viewport>
      <ToastList />
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>

function ToastList() {
  const { toasts } = useToastManager();

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      severity={toast.data?.severity}
    >
      <Toast.Title />
      <Toast.Description />
      <Toast.Close />
    </Toast.Root>
  ));
}

// Anywhere below the provider. severity is neutral, info, success,
// warning or danger; it rides in the toast's data, which is Base UI's
// slot for anything the toast manager does not model itself.
const toast = useToastManager();
toast.add({ title: "Invite copied", description: "Expires in 24 hours." });
toast.add({
  title: "Connection lost",
  description: "Reconnecting to the voice server.",
  data: { severity: "danger" }
});

// Anything past that is a className away — Toast.Root forwards it.
<Toast.Root toast={toast} className="border-gryt-accent/40 bg-gryt-accent/10" />`
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    description:
      "A scroll container whose bar fades in only while hovering or scrolling, and that will not hand its scroll to the page behind it.",
    importName: "ScrollArea",
    preview: "scroll-area",
    code: `import { ScrollArea } from "@gryt/ui";

<ScrollArea.Root className="h-64">
  <ScrollArea.Viewport>
    <ScrollArea.Content>{messages}</ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical" />
</ScrollArea.Root>`
  },
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    description:
      "A dialog you cannot dismiss by accident, for decisions that need an answer rather than an escape.",
    importName: "AlertDialog",
    preview: "alert-dialog",
    code: `import { AlertDialog, Button } from "@gryt/ui";

// Escape and the backdrop do nothing here — answering means picking a button.
<AlertDialog.Root>
  <AlertDialog.Trigger render={<Button tone="danger" />}>Leave server</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <AlertDialog.Title>Leave this server?</AlertDialog.Title>
      <AlertDialog.Description>
        You will need a new invite to come back.
      </AlertDialog.Description>
      <AlertDialog.Close render={<Button tone="neutral" />}>Stay</AlertDialog.Close>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>`
  },
  {
    slug: "collapsible",
    name: "Collapsible",
    description:
      "One region that opens and closes, for a channel category or an advanced section.",
    importName: "Collapsible",
    preview: "collapsible",
    code: `import { Collapsible } from "@gryt/ui";

<Collapsible.Root>
  <Collapsible.Trigger>Voice channels</Collapsible.Trigger>
  <Collapsible.Panel>{channels}</Collapsible.Panel>
</Collapsible.Root>`
  },
  {
    slug: "checkbox-group",
    name: "CheckboxGroup",
    description:
      "Checkboxes sharing one value, with a parent that goes indeterminate when only some children are checked.",
    importName: "CheckboxGroup",
    preview: "checkbox-group",
    code: `import { Checkbox, CheckboxGroup } from "@gryt/ui";

const permissions = ["read", "write", "manage"];

// Checkbox renders the box only, so the label is yours to place.
<CheckboxGroup allValues={permissions} defaultValue={["read"]}>
  <label>
    <Checkbox parent name="all" /> All permissions
  </label>
  <label>
    <Checkbox name="read" value="read" /> Read messages
  </label>
</CheckboxGroup>`
  },
  {
    slug: "number-field",
    name: "NumberField",
    description:
      "A numeric input with steppers, and an optional label you can drag sideways for coarse adjustment.",
    importName: "NumberField",
    preview: "number-field",
    code: `import { NumberField } from "@gryt/ui";

<NumberField label="Output volume" defaultValue={80} min={0} max={100} />
<NumberField label="Bitrate (kbps)" defaultValue={64} step={8} scrubbable />`
  },
  {
    slug: "otp-field",
    name: "OtpField",
    description:
      "A one-time code, one box per character, where pasting the whole code fills every box.",
    importName: "OtpField",
    preview: "otp-field",
    code: `import { OtpField } from "@gryt/ui";

<OtpField length={6} onValueChange={setCode} />`
  },
  {
    slug: "combobox",
    name: "Combobox",
    description:
      "Pick from a list narrowed by typing, with optional chips for multiple selection.",
    importName: "Combobox",
    preview: "combobox",
    code: `import { Combobox } from "@gryt/ui";

<Combobox.Root items={members}>
  <Combobox.Input placeholder="Add a member" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Empty>No members found</Combobox.Empty>
        <Combobox.List>
          {(member) => (
            <Combobox.Item key={member} value={member}>{member}</Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>`
  },
  {
    slug: "autocomplete",
    name: "Autocomplete",
    description:
      "A text input that suggests as you type, where the typed text is the answer and the list is only a hint.",
    importName: "Autocomplete",
    preview: "autocomplete",
    code: `import { Autocomplete } from "@gryt/ui";

// Combobox is for when the value must come from the list. Here it need not.
<Autocomplete.Root items={recentSearches}>
  <Autocomplete.Input placeholder="Search messages" />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          {(item) => (
            <Autocomplete.Item key={item} value={item}>{item}</Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>`
  },
  {
    slug: "preview-card",
    name: "PreviewCard",
    description:
      "What appears when you hover a username — content, not a label, so it waits before opening. Sits on any side.",
    importName: "PreviewCard",
    preview: "preview-card",
    code: `import { PreviewCard } from "@gryt/ui";

<PreviewCard.Root>
  <PreviewCard.Trigger>@sivert</PreviewCard.Trigger>
  {/* Positioner takes the same side and align as Popover and Tooltip. */}
  <PreviewCard.Portal>
    <PreviewCard.Positioner>
      <PreviewCard.Popup>Maintains Gryt. In voice since 20:14.</PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>`
  },
  {
    slug: "toolbar",
    name: "Toolbar",
    description:
      "A strip of controls sharing one tab stop, so a call bar costs one stop rather than eight.",
    importName: "Toolbar",
    preview: "toolbar",
    code: `import { IconButton, Toolbar } from "@gryt/ui";

<Toolbar.Root aria-label="Call controls">
  <Toolbar.Button render={<IconButton aria-label="Mute" />}>{micIcon}</Toolbar.Button>
  <Toolbar.Button render={<IconButton aria-label="Deafen" />}>{headphonesIcon}</Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.Button render={<IconButton aria-label="Leave" tone="danger" />}>{leaveIcon}</Toolbar.Button>
</Toolbar.Root>`
  },
  {
    slug: "menubar",
    name: "Menubar",
    description:
      "A bar of menus that behave as one, so moving along it opens the next without a second click.",
    importName: "Menubar",
    preview: "menubar",
    code: `import { Menu, Menubar } from "@gryt/ui";

<Menubar>
  <Menu.Root>
    <Menu.Trigger>Server</Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner align="start">
        <Menu.Popup>
          <Menu.Item>Invite people</Menu.Item>
          <Menu.Item>Server settings</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Menubar>`
  },
  {
    slug: "navigation-menu",
    name: "NavigationMenu",
    description:
      "Site-level navigation whose items open panels of links, resizing between them rather than reopening.",
    importName: "NavigationMenu",
    preview: "navigation-menu",
    code: `import { NavigationMenu } from "@gryt/ui";

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="/voice">Voice</NavigationMenu.Link>
        <NavigationMenu.Link href="/chat">Chat</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Portal>
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>`
  },
  {
    slug: "form",
    name: "Form",
    description:
      "Routes server-side errors back to the fields that caused them, instead of a paragraph at the top.",
    importName: "Form",
    preview: "form",
    code: `import { Button, Form, TextField } from "@gryt/ui";

<Form
  errors={errors}
  onClearErrors={setErrors}
  onSubmit={async (event) => {
    event.preventDefault();
    // Keys match each field's name, so the message lands on the input.
    setErrors(await save(new FormData(event.currentTarget)));
  }}
>
  <TextField name="displayName" label="Display name" />
  <Button type="submit">Save</Button>
</Form>`
  },
  {
    slug: "fieldset",
    name: "Fieldset",
    description:
      "Groups related fields under a legend, so a screen reader announces what the group is for.",
    importName: "Fieldset",
    preview: "fieldset",
    code: `import { Fieldset, TextField } from "@gryt/ui";

<Fieldset.Root>
  <Fieldset.Legend>Server details</Fieldset.Legend>
  <TextField name="name" label="Name" />
  <TextField name="topic" label="Topic" />
</Fieldset.Root>`
  }
];
