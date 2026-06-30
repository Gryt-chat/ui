import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  MessageBubble,
  Progress,
  Radio,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Surface,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip
} from "@gryt/ui";
import { Bell, ChevronDown, MoreHorizontal, Send } from "lucide-react";
import { useState } from "react";
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
      "Primary, neutral, and destructive actions with Gryt color and pill-shaped Material styling.",
    importName: "Button",
    preview: "button",
    code: `import { Button } from "@gryt/ui";

<Button>Primary</Button>
<Button tone="neutral">Neutral</Button>
<Button tone="danger">Danger</Button>`
  },
  {
    slug: "icon-button",
    name: "IconButton",
    description:
      "Circular icon actions for compact toolbars and dense desktop controls.",
    importName: "IconButton",
    preview: "icon-button",
    code: `import { IconButton } from "@gryt/ui";
import { Bell } from "lucide-react";

<IconButton aria-label="Notifications">
  <Bell size={18} />
</IconButton>`
  },
  {
    slug: "text-field",
    name: "TextField",
    description:
      "Rounded MUI text fields for forms, settings, and composer-adjacent inputs.",
    importName: "TextField",
    preview: "text-field",
    code: `import { TextField } from "@gryt/ui";

<TextField label="Workspace" defaultValue="Gryt Chat" />`
  },
  {
    slug: "select",
    name: "Select",
    description:
      "Themed option selection with Gryt surfaces and rounded menus.",
    importName: "Select",
    preview: "select",
    code: `import { Select } from "@gryt/ui";

<Select
  label="Input device"
  defaultValue="studio"
  options={[{ label: "Studio mic", value: "studio" }]}
/>`
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description: "Binary selection control for settings and preference rows.",
    importName: "Checkbox",
    preview: "checkbox",
    code: `import { Checkbox } from "@gryt/ui";

<Checkbox defaultChecked aria-label="Enable noise suppression" />`
  },
  {
    slug: "radio",
    name: "Radio",
    description: "Single-choice control styled with the Gryt accent color.",
    importName: "Radio",
    preview: "radio",
    code: `import { Radio } from "@gryt/ui";

<Radio defaultChecked aria-label="Selected channel" />`
  },
  {
    slug: "switch",
    name: "Switch",
    description:
      "Toggle control for on/off settings such as voice activity or presence.",
    importName: "Switch",
    preview: "switch",
    code: `import { Switch } from "@gryt/ui";

<Switch defaultChecked aria-label="Voice activity" />`
  },
  {
    slug: "slider",
    name: "Slider",
    description:
      "Range control for volume, thresholds, and other numeric settings.",
    importName: "Slider",
    preview: "slider",
    code: `import { Slider } from "@gryt/ui";

<Slider defaultValue={64} aria-label="Input volume" />`
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

<Chip label="Connected" />`
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

<Alert severity="success">Connected to Gryt.</Alert>`
  },
  {
    slug: "progress",
    name: "Progress",
    description: "Linear progress indicator for loading and completion states.",
    importName: "Progress",
    preview: "progress",
    code: `import { Progress } from "@gryt/ui";

<Progress variant="determinate" value={72} />`
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
    description: "Floating command lists built on MUI Menu and MenuItem.",
    importName: "Menu",
    preview: "menu",
    code: `import { Menu, MenuItem } from "@gryt/ui";

<Menu open={open} anchorEl={anchorEl} onClose={closeMenu}>
  <MenuItem>Edit server</MenuItem>
</Menu>`
  },
  {
    slug: "tabs",
    name: "Tabs",
    description: "Tabbed navigation for local panels and settings groups.",
    importName: "Tabs",
    preview: "tabs",
    code: `import { Tab, Tabs } from "@gryt/ui";

<Tabs value={0} aria-label="Views">
  <Tab label="Chat" />
  <Tab label="Voice" />
</Tabs>`
  },
  {
    slug: "accordion",
    name: "Accordion",
    description: "Disclosure panels for dense settings and grouped details.",
    importName: "Accordion",
    preview: "accordion",
    code: `import { Accordion, AccordionDetails, AccordionSummary } from "@gryt/ui";

<Accordion defaultExpanded>
  <AccordionSummary>Voice settings</AccordionSummary>
  <AccordionDetails>Input and output controls.</AccordionDetails>
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
      "MUI Card wrapper with Gryt borders, surfaces, and rounded shape.",
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
    code: `import { Dialog, DialogContent, DialogTitle } from "@gryt/ui";

<Dialog open={open} onClose={closeDialog}>
  <DialogTitle>Join server?</DialogTitle>
  <DialogContent>Confirm the action.</DialogContent>
</Dialog>`
  },
  {
    slug: "drawer",
    name: "Drawer",
    description: "Side panel for navigation, details, or narrow workflows.",
    importName: "Drawer",
    preview: "drawer",
    code: `import { Drawer } from "@gryt/ui";

<Drawer open={open} onClose={closeDrawer}>
  <div>Drawer content</div>
</Drawer>`
  },
  {
    slug: "message-bubble",
    name: "MessageBubble",
    description: "Chat bubble states for user, assistant, and system messages.",
    importName: "MessageBubble",
    preview: "message-bubble",
    code: `import { MessageBubble } from "@gryt/ui";

<MessageBubble from="assistant">Material 3 shape is active.</MessageBubble>`
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  switch (preview) {
    case "button":
      return (
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button tone="neutral">Neutral</Button>
          <Button tone="danger">Danger</Button>
        </div>
      );
    case "icon-button":
      return (
        <div className="flex gap-3">
          <IconButton aria-label="Notifications">
            <Bell size={18} />
          </IconButton>
          <IconButton aria-label="Send">
            <Send size={18} />
          </IconButton>
        </div>
      );
    case "text-field":
      return <TextField label="Workspace" defaultValue="Gryt Chat" />;
    case "select":
      return (
        <Select
          label="Input device"
          defaultValue="studio"
          options={[
            { label: "Studio mic", value: "studio" },
            { label: "Headset", value: "headset" }
          ]}
        />
      );
    case "checkbox":
      return <Checkbox defaultChecked aria-label="Enable noise suppression" />;
    case "radio":
      return <Radio defaultChecked aria-label="Selected channel" />;
    case "switch":
      return <Switch defaultChecked aria-label="Voice activity" />;
    case "slider":
      return <Slider defaultValue={64} aria-label="Input volume" />;
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
          <Chip label="Connected" />
          <Chip label="Beta" color="primary" />
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
      return <Alert severity="success">Connected to Gryt.</Alert>;
    case "progress":
      return <Progress variant="determinate" value={72} />;
    case "spinner":
      return <Spinner size={28} />;
    case "skeleton":
      return <Skeleton variant="rounded" width={220} height={42} />;
    case "menu":
      return (
        <div>
          <IconButton
            aria-label="Open menu"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreHorizontal size={18} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => setMenuAnchor(null)}>Edit server</MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              Invite people
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setMenuAnchor(null)}>Leave</MenuItem>
          </Menu>
        </div>
      );
    case "tabs":
      return (
        <Tabs value={0} aria-label="Views">
          <Tab label="Chat" />
          <Tab label="Voice" />
          <Tab label="Files" />
        </Tabs>
      );
    case "accordion":
      return (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
            Voice settings
          </AccordionSummary>
          <AccordionDetails>
            Input, output, threshold, and suppression controls belong here.
          </AccordionDetails>
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
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Join Gryt server?</DialogTitle>
            <DialogContent>
              Rounded, themed MUI dialog with Gryt surface and border treatment.
            </DialogContent>
            <DialogActions>
              <Button tone="neutral" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Join</Button>
            </DialogActions>
          </Dialog>
        </>
      );
    case "drawer":
      return (
        <>
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <div className="w-72 p-5">
              <h2 className="text-lg font-semibold text-gryt-text">
                Gryt Drawer
              </h2>
              <p className="mt-2 text-sm text-gryt-muted">
                Side panel content.
              </p>
            </div>
          </Drawer>
        </>
      );
    case "message-bubble":
      return (
        <div className="space-y-3">
          <MessageBubble from="assistant">
            Material 3-style shape is active.
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
