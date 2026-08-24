import {
  Accordion,
  Alert,
  AlertDialog,
  Autocomplete,
  Avatar,
  Badge,
  Button,
  Card,
  CheckboxGroup,
  Collapsible,
  Combobox,
  Fieldset,
  Form,
  Menubar,
  NavigationMenu,
  NumberField,
  OtpField,
  PreviewCard,
  Toolbar,
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
import { avatarSeed } from "@gryt/owl";
import { Bell, DotsThree, PaperPlaneTilt } from "@phosphor-icons/react";
import type { DrawerSide, Tone, ToastSeverity } from "@gryt/ui";
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
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent-11">
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

/**
 * Exported for the theme generator, which previews a theme against the same
 * demos this page documents. A second set built for the generator would drift
 * from these the first time one of them was improved.
 */
export function ComponentPreview({ preview }: { preview: ComponentDoc["preview"] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
      return (
        <div className="grid w-full gap-6">
          <ExampleSection title="Initials">
            <Avatar size="small">G</Avatar>
            <Avatar>G</Avatar>
            <Avatar size="large">G</Avatar>
          </ExampleSection>
          <ExampleSection title="Image">
            {/* The fallback is what shows while the image is still loading or
                if it never arrives, so it is initials rather than a spinner. */}
            <Avatar size="small" src={OWL} alt="Gryt" fallback="G" />
            <Avatar src={OWL} alt="Gryt" fallback="G" />
            <Avatar size="large" src={OWL} alt="Gryt" fallback="G" />
          </ExampleSection>
          <ExampleSection title="Generated">
            {/* No src, so each of these is drawn from the seed. The same
                nickname is the same owl on every client and forever, which is
                the point of the thing — see @gryt/owl. */}
            {MEMBERS.slice(0, 4).map((member) => (
              <Avatar key={member} seed={avatarSeed(member)} alt={member} />
            ))}
          </ExampleSection>
        </div>
      );
    case "badge":
      return (
        <div className="grid w-full gap-6">
          <ExampleSection title="Count">
            <Badge badgeContent={3}>
              <Avatar size="small" src={OWL} alt="Gryt" fallback="G" />
            </Badge>
            <Badge badgeContent={12}>
              <Avatar src={OWL} alt="Gryt" fallback="G" />
            </Badge>
            {/* Over max it reads 99+, so a badge can never outgrow the thing
                it is pinned to. */}
            <Badge badgeContent={240}>
              <Avatar size="large" src={OWL} alt="Gryt" fallback="G" />
            </Badge>
          </ExampleSection>
          <ExampleSection title="Dot">
            <Badge badgeContent="">
              <Avatar size="small">G</Avatar>
            </Badge>
            <Badge badgeContent="">
              <Avatar>G</Avatar>
            </Badge>
            <Badge badgeContent="">
              <Avatar size="large">G</Avatar>
            </Badge>
          </ExampleSection>
        </div>
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
      // Laid out where each one points, so the grid itself shows the prop.
      return (
        <div className="grid w-full max-w-xs grid-cols-3 place-items-center gap-2">
          <span />
          <Tooltip title="Top" side="top">
            <IconButton aria-label="Top">
              <Bell size={18} />
            </IconButton>
          </Tooltip>
          <span />
          <Tooltip title="Left" side="left">
            <IconButton aria-label="Left">
              <Bell size={18} />
            </IconButton>
          </Tooltip>
          <span className="text-xs text-gryt-muted">side</span>
          <Tooltip title="Right" side="right">
            <IconButton aria-label="Right">
              <Bell size={18} />
            </IconButton>
          </Tooltip>
          <span />
          <Tooltip title="Bottom" side="bottom">
            <IconButton aria-label="Bottom">
              <Bell size={18} />
            </IconButton>
          </Tooltip>
          <span />
        </div>
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
        <div className="grid w-full gap-6">
          <ExampleSection title="Horizontal">
            <Tabs value={tabValue} onValueChange={setTabValue}>
              <Tabs.List aria-label="Views">
                <Tabs.Tab value="chat">Chat</Tabs.Tab>
                <Tabs.Tab value="voice">Voice</Tabs.Tab>
                <Tabs.Tab value="files">Files</Tabs.Tab>
                <Tabs.Indicator />
              </Tabs.List>
            </Tabs>
          </ExampleSection>
          <ExampleSection title="Vertical">
            <Tabs
              className="w-full max-w-md"
              orientation="vertical"
              value={tabValue}
              onValueChange={setTabValue}
            >
              <Tabs.List aria-label="Views" className="w-40">
                <Tabs.Tab value="chat">Chat</Tabs.Tab>
                <Tabs.Tab value="voice">Voice</Tabs.Tab>
                <Tabs.Tab value="files">Files</Tabs.Tab>
                <Tabs.Indicator />
              </Tabs.List>
              <Tabs.Panel value="chat">
                Messages, threads and pins.
              </Tabs.Panel>
              <Tabs.Panel value="voice">
                Input, output and suppression.
              </Tabs.Panel>
              <Tabs.Panel value="files">
                Uploads shared in this channel.
              </Tabs.Panel>
            </Tabs>
          </ExampleSection>
        </div>
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
      return <DrawerExample />;
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
        <div className="grid w-full gap-6">
          <ExampleSection title="Sides">
            {SIDES.map((side) => (
              <Popover.Root key={side}>
                <Popover.Trigger render={<Button size="small" tone="neutral" />}>
                  {side}
                </Popover.Trigger>
                <Popover.Portal>
                  {/* side and align are Base UI's, and both flip on their own
                      when the popup would leave the viewport — so "top" means
                      "top if it fits". */}
                  <Popover.Positioner side={side}>
                    <Popover.Popup className="w-56">
                      <Popover.Title>side=&quot;{side}&quot;</Popover.Title>
                      <Popover.Description>
                        Flips to the opposite side when there is no room.
                      </Popover.Description>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            ))}
          </ExampleSection>
          <ExampleSection title="Alignment">
            {ALIGNMENTS.map((align) => (
              <Popover.Root key={align}>
                <Popover.Trigger render={<Button size="small" tone="neutral" />}>
                  {align}
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Positioner align={align} side="bottom">
                    <Popover.Popup className="w-56">
                      <Popover.Title>align=&quot;{align}&quot;</Popover.Title>
                      <Popover.Description>
                        Where the popup sits along the chosen side.
                      </Popover.Description>
                    </Popover.Popup>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            ))}
          </ExampleSection>
          <ExampleSection title="Member card">
            <PopoverMember />
          </ExampleSection>
        </div>
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
    case "alert-dialog":
      return (
        <AlertDialog.Root>
          <AlertDialog.Trigger render={<Button tone="danger" />}>
            Leave server
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Popup>
              <AlertDialog.Title>Leave this server?</AlertDialog.Title>
              <AlertDialog.Description>
                You will need a new invite to come back. Escape and the backdrop
                do nothing here.
              </AlertDialog.Description>
              <div className="flex justify-end gap-2">
                <AlertDialog.Close render={<Button tone="neutral" />}>
                  Stay
                </AlertDialog.Close>
                <AlertDialog.Close render={<Button tone="danger" />}>
                  Leave
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      );
    case "collapsible":
      return (
        <Collapsible.Root className="w-full max-w-sm">
          <Collapsible.Trigger>Voice channels</Collapsible.Trigger>
          <Collapsible.Panel>
            <div className="grid gap-1 px-2 pt-2 text-sm text-gryt-muted">
              <span>General</span>
              <span>Gaming</span>
              <span>AFK</span>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      );
    case "checkbox-group":
      return (
        <CheckboxGroup allValues={PERMISSIONS} defaultValue={["read"]}>
          <label className="flex items-center gap-2 text-sm text-gryt-text">
            <Checkbox parent name="all" />
            All permissions
          </label>
          {PERMISSION_LABELS.map((permission) => (
            <label
              key={permission.name}
              className="flex items-center gap-2 pl-6 text-sm text-gryt-muted"
            >
              <Checkbox name={permission.name} value={permission.name} />
              {permission.label}
            </label>
          ))}
        </CheckboxGroup>
      );
    case "number-field":
      return (
        <div className="flex flex-wrap gap-6">
          <NumberField label="Output volume" defaultValue={80} min={0} max={100} />
          <NumberField label="Bitrate (kbps)" defaultValue={64} step={8} scrubbable />
        </div>
      );
    case "otp-field":
      return <OtpField length={6} />;
    case "combobox":
      return (
        <Combobox.Root items={MEMBERS}>
          <Combobox.Input placeholder="Add a member" />
          <Combobox.Portal>
            <Combobox.Positioner>
              <Combobox.Popup>
                <Combobox.Empty>No members found</Combobox.Empty>
                <Combobox.List>
                  {(member: string) => (
                    <Combobox.Item key={member} value={member}>
                      {member}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      );
    case "autocomplete":
      return (
        <Autocomplete.Root items={SEARCHES}>
          <Autocomplete.Input placeholder="Search messages" />
          <Autocomplete.Portal>
            <Autocomplete.Positioner>
              <Autocomplete.Popup>
                <Autocomplete.List>
                  {(item: string) => (
                    <Autocomplete.Item key={item} value={item}>
                      {item}
                    </Autocomplete.Item>
                  )}
                </Autocomplete.List>
              </Autocomplete.Popup>
            </Autocomplete.Positioner>
          </Autocomplete.Portal>
        </Autocomplete.Root>
      );
    case "preview-card":
      return (
        <div className="grid w-full gap-6">
          <ExampleSection title="Sides">
            {SIDES.map((side) => (
              <PreviewCard.Root key={side}>
                <PreviewCard.Trigger className="cursor-default text-gryt-accent-11 underline-offset-4 hover:underline">
                  @{side}
                </PreviewCard.Trigger>
                <PreviewCard.Portal>
                  <PreviewCard.Positioner side={side}>
                    <PreviewCard.Popup className="w-56">
                      <p className="m-0 text-sm font-semibold text-gryt-text">
                        side=&quot;{side}&quot;
                      </p>
                      <p className="mt-1 mb-0 text-xs leading-5 text-gryt-muted">
                        Hover rather than click, so it opens on its own.
                      </p>
                    </PreviewCard.Popup>
                  </PreviewCard.Positioner>
                </PreviewCard.Portal>
              </PreviewCard.Root>
            ))}
          </ExampleSection>
          <ExampleSection title="Member card">
            <PreviewCardMember />
          </ExampleSection>
        </div>
      );
    case "toolbar":
      return (
        <Toolbar.Root aria-label="Call controls">
          <Toolbar.Button render={<IconButton aria-label="Mute" />}>
            <Bell size={18} />
          </Toolbar.Button>
          <Toolbar.Button render={<IconButton aria-label="More" />}>
            <DotsThree size={18} />
          </Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.Button
            render={<IconButton aria-label="Send" tone="primary" />}
          >
            <PaperPlaneTilt size={18} />
          </Toolbar.Button>
        </Toolbar.Root>
      );
    case "menubar":
      return (
        <Menubar>
          {MENUBAR_MENUS.map((menu) => (
            <Menu.Root key={menu.label}>
              <Menu.Trigger className="cursor-default rounded-(--gryt-radius-md) border-0 bg-transparent px-3 py-1.5 text-sm text-gryt-text outline-none select-none hover:bg-gryt-surface-raised data-popup-open:bg-gryt-surface-raised">
                {menu.label}
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner align="start">
                  <Menu.Popup>
                    {menu.items.map((item) => (
                      <Menu.Item key={item}>{item}</Menu.Item>
                    ))}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          ))}
        </Menubar>
      );
    case "navigation-menu":
      return (
        <NavigationMenu.Root>
          <NavigationMenu.List className="flex items-center gap-1">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
              <NavigationMenu.Content className="grid w-56 gap-1 p-2">
                <NavigationMenu.Link href="#voice">Voice</NavigationMenu.Link>
                <NavigationMenu.Link href="#chat">Chat</NavigationMenu.Link>
                <NavigationMenu.Link href="#servers">Servers</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item>
              <NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
              <NavigationMenu.Content className="grid w-56 gap-1 p-2">
                <NavigationMenu.Link href="#guide">Guide</NavigationMenu.Link>
                <NavigationMenu.Link href="#api">API</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Portal>
            <NavigationMenu.Positioner sideOffset={8}>
              <NavigationMenu.Popup>
                <NavigationMenu.Viewport />
              </NavigationMenu.Popup>
            </NavigationMenu.Positioner>
          </NavigationMenu.Portal>
        </NavigationMenu.Root>
      );
    case "form":
      return (
        // gap-4 and a self-start button: Form is a <form> with no layout of
        // its own, so without this the field and the button sit flush against
        // each other and the button stretches the full width.
        <Form className="flex w-full max-w-sm flex-col gap-4">
          <TextField
            name="displayName"
            label="Display name"
            defaultValue="Sivert"
          />
          <Button className="self-start" type="submit">
            Save
          </Button>
        </Form>
      );
    case "fieldset":
      return (
        <Fieldset.Root className="w-full max-w-sm">
          <Fieldset.Legend>Server details</Fieldset.Legend>
          <TextField name="name" label="Name" defaultValue="Gryt" />
          <TextField name="topic" label="Topic" placeholder="What is this for?" />
        </Fieldset.Root>
      );
  }
}

/* Served from apps/docs/public. The Gryt client's own app icon, so the
   avatar examples show a real image rather than a placeholder service. */
const OWL = "/owl.png";

const PERMISSIONS = ["read", "write", "manage"];
const PERMISSION_LABELS = [
  { name: "read", label: "Read messages" },
  { name: "write", label: "Send messages" },
  { name: "manage", label: "Manage channel" }
];
const MEMBERS = ["sivert", "kasper", "nora", "tobias", "ida"];
const SEARCHES = ["deploy", "design tokens", "release notes", "sfu"];
const MENUBAR_MENUS = [
  { label: "Server", items: ["Invite people", "Server settings"] },
  { label: "View", items: ["Compact mode", "Show member list"] }
];

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

/* Severity rides along in the toast's `data`, which is Base UI's escape hatch
   for anything the manager does not model itself. The alternative is a second
   store keyed by toast id, kept in sync by hand. */
const TOAST_SEVERITIES: Array<{
  severity: ToastSeverity;
  label: string;
  title: string;
  description: string;
}> = [
  {
    severity: "neutral",
    label: "Neutral",
    title: "Invite copied",
    description: "The link expires in 24 hours."
  },
  {
    severity: "info",
    label: "Info",
    title: "New voice region",
    description: "eu-north is now closer to you than eu-west."
  },
  {
    severity: "success",
    label: "Success",
    title: "Server created",
    description: "You are the owner of gryt.chat/design."
  },
  {
    severity: "warning",
    label: "Warning",
    title: "Input is peaking",
    description: "Lower the microphone gain by a few decibels."
  },
  {
    severity: "danger",
    label: "Danger",
    title: "Connection lost",
    description: "Reconnecting to the voice server."
  }
];

function ToastTrigger() {
  const toast = useToastManager();

  return (
    <div className="flex flex-wrap gap-2">
      {TOAST_SEVERITIES.map((entry) => (
        <Button
          key={entry.severity}
          size="small"
          tone={entry.severity === "neutral" ? "primary" : "neutral"}
          onClick={() =>
            toast.add({
              title: entry.title,
              description: entry.description,
              data: { severity: entry.severity }
            })
          }
        >
          {entry.label}
        </Button>
      ))}
    </div>
  );
}

function ToastList() {
  const { toasts } = useToastManager();

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      severity={
        (toast.data as { severity?: ToastSeverity } | undefined)?.severity
      }
    >
      <Toast.Title />
      <Toast.Description />
      <Toast.Close />
    </Toast.Root>
  ));
}

/** Base UI's four sides and three alignments, in the order the docs show them. */
const SIDES = ["top", "right", "bottom", "left"] as const;
const DRAWER_SIDES: DrawerSide[] = ["left", "right", "top", "bottom"];
const ALIGNMENTS = ["start", "center", "end"] as const;

function DrawerExample() {
  // One open state and one side, rather than four independent drawers: only
  // one can be open at a time anyway, and four Roots means four backdrops
  // stacked on top of each other the moment two are open at once.
  const [side, setSide] = useState<DrawerSide | null>(null);

  return (
    <>
      <ExampleSection title="Side">
        {DRAWER_SIDES.map((entry) => (
          <Button
            key={entry}
            size="small"
            tone={entry === "right" ? "primary" : "neutral"}
            onClick={() => setSide(entry)}
          >
            {entry}
          </Button>
        ))}
      </ExampleSection>

      <Drawer.Root
        open={side !== null}
        onOpenChange={(open) => setSide(open ? side : null)}
        side={side ?? "right"}
      >
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Grabber />
              <Drawer.Title className="text-lg font-semibold text-gryt-text">
                side=&quot;{side ?? "right"}&quot;
              </Drawer.Title>
              <Drawer.Description className="text-sm text-gryt-muted">
                Drag it back towards its own edge to dismiss. Narrow the window
                below 768px and left and right become bottom sheets.
              </Drawer.Description>
              <Drawer.Close render={<Button tone="neutral" />}>
                Close
              </Drawer.Close>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

function PopoverMember() {
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
}

function PreviewCardMember() {
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger className="cursor-default text-gryt-accent-11 underline-offset-4 hover:underline">
        @sivert
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner>
          <PreviewCard.Popup>
            <div className="flex items-center gap-3">
              <Avatar fallback="S" />
              <div>
                <p className="m-0 text-sm font-semibold text-gryt-text">
                  Sivert
                </p>
                <p className="m-0 text-xs text-gryt-muted">In voice</p>
              </div>
            </div>
            <p className="mt-3 mb-0 text-sm leading-6 text-gryt-muted">
              Maintains Gryt. Joined the channel at 20:14.
            </p>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
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
      {/* A progressbar with no name is a bar nothing can announce. Base UI
          leaves naming to the caller, so the caller names it. */}
      <Progress aria-label="Upload progress" value={value} />
      <Progress aria-label="Working" />
    </div>
  );
}
