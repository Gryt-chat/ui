import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  MessageBubble,
  Progress,
  Radio,
  RadioGroup,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  TextField
} from "@gryt/ui";
import { Bell, DotsThree } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { componentDocs, componentNavSections } from "./componentDocs";
import { exampleDocs } from "../exampleMeta";

// A specimen per card. Every one is the real component rendered inert — for the
// overlay components (Dialog, Menu, Drawer, Select, Tooltip) the specimen is the
// control that opens them, which is still the real thing. Drawing a fake popup
// here would be re-drawn chrome, and a screenshot would go stale.
const specimens: Record<string, ReactNode> = {
  button: <Button size="xsmall">Send</Button>,
  "icon-button": (
    <IconButton size="xsmall" aria-label="Notifications">
      <Bell size={15} />
    </IconButton>
  ),
  "text-field": <TextField placeholder="Workspace" size="small" />,
  select: <Button size="xsmall" tone="neutral">Input device ⌄</Button>,
  checkbox: <Checkbox defaultChecked aria-label="Checkbox specimen" />,
  radio: (
    <RadioGroup defaultValue="a">
      <Radio value="a" aria-label="Radio specimen" />
    </RadioGroup>
  ),
  switch: <Switch defaultChecked aria-label="Switch specimen" />,
  slider: (
    <div className="w-28">
      <Slider defaultValue={62} aria-label="Slider specimen" />
    </div>
  ),
  avatar: <Avatar size="small">G</Avatar>,
  badge: (
    <Badge badgeContent={3}>
      <Avatar size="small">G</Avatar>
    </Badge>
  ),
  chip: <Chip label="Connected" tone="success" />,
  tooltip: (
    <IconButton size="xsmall" aria-label="Tooltip specimen">
      <Bell size={15} />
    </IconButton>
  ),
  divider: (
    <div className="w-24">
      <Divider />
    </div>
  ),
  alert: (
    <Alert severity="success" className="px-2.5 py-1.5 text-xs">
      Connected
    </Alert>
  ),
  progress: (
    <div className="w-28">
      <Progress value={64} />
    </div>
  ),
  spinner: <Spinner size={20} />,
  skeleton: <Skeleton variant="rounded" width={112} height={20} />,
  dialog: <Button size="xsmall" tone="neutral">Open dialog</Button>,
  drawer: <Button size="xsmall" tone="neutral">Open drawer</Button>,
  menu: (
    <IconButton size="xsmall" aria-label="Menu specimen">
      <DotsThree size={15} />
    </IconButton>
  ),
  tabs: (
    <div className="flex items-center gap-1 rounded-full bg-gryt-surface-raised p-1">
      <span className="rounded-full bg-gryt-accent px-2.5 py-1 text-[11px] font-medium text-gryt-on-accent">
        Chat
      </span>
      <span className="px-2.5 py-1 text-[11px] text-gryt-muted">Voice</span>
    </div>
  ),
  accordion: <Button size="xsmall" tone="ghost">Voice settings ⌄</Button>,
  surface: (
    <div className="h-8 w-28 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface-raised" />
  ),
  card: (
    <div className="h-8 w-28 rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface" />
  ),
  "message-bubble": (
    <MessageBubble from="user" className="px-3 py-1.5 text-xs">
      Ready
    </MessageBubble>
  ),
  composer: (
    <div className="flex w-32 items-center justify-between rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface px-3 py-1.5 text-[11px] text-gryt-muted">
      Message Gryt
    </div>
  ),
  "conversation-item": (
    <div className="flex w-32 items-center gap-2 rounded-(--gryt-radius-xl) bg-gryt-accent px-2.5 py-1.5">
      <Avatar size="small" className="size-6 text-[10px]">
        D
      </Avatar>
      <span className="truncate text-[11px] font-semibold text-gryt-on-accent">
        Design sync
      </span>
    </div>
  )
};

export function HomePage() {
  const bySlug = new Map(componentDocs.map((doc) => [doc.slug, doc]));

  return (
    <div>
      <header className="pb-(--space-lg)">
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent-11">
          @gryt/ui
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-[length:var(--text-2xl)] font-semibold leading-[1.1] tracking-[-0.022em] text-gryt-text">
          {componentDocs.length} components, on Base UI and Tailwind.
        </h1>
        <p className="mt-3 max-w-xl text-[length:var(--text-md)] leading-7 text-gryt-muted">
          The component library behind the Gryt client. Flat surfaces, fully
          rounded controls, keyboard behaviour from Base UI, and no CSS-in-JS
          runtime.
        </p>
        <div className="mt-5 max-w-md">
          <CodeBlock code="bun add @gryt/ui" language="sh" />
        </div>
      </header>

      {/* Ahead of the component grid: the examples are the fastest way to see
          whether this library builds the kind of thing you are building. */}
      <section className="border-t border-gryt-border py-(--space-lg)">
        <h2 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
          Examples
        </h2>
        <p className="m-0 max-w-[62ch] pb-(--space-sm) text-sm leading-6 text-gryt-muted">
          Whole screens, built only out of the components below. Each one runs
          on its page and ships its own source.
        </p>
        <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
          {exampleDocs.map((doc) => (
            <li key={doc.slug}>
              <Link
                to={`/examples/${doc.slug}`}
                className="flex h-full flex-col gap-1 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-4 transition-colors duration-200 hover:border-gryt-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
              >
                <span className="font-display text-base font-semibold tracking-tight text-gryt-text">
                  {doc.name}
                </span>
                <span className="text-sm leading-6 text-gryt-muted">
                  {doc.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {componentNavSections.map((section) => (
        <section
          key={section.title}
          className="border-t border-gryt-border py-(--space-lg)"
        >
          <h2 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            {section.title}
          </h2>
          <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item) => {
              const doc = bySlug.get(item.slug);

              return (
                <li key={item.slug}>
                  <Link
                    to={`/components/${item.slug}`}
                    className="group flex h-full flex-col gap-3 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-4 transition-colors duration-200 hover:border-gryt-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
                  >
                    {/* inert as well as aria-hidden: the thumbnail is a live
                        component, and hiding a focusable thing from the
                        accessibility tree while leaving it in the tab order is
                        worse than not hiding it. inert takes it out of both. */}
                    <span
                      aria-hidden="true"
                      inert
                      className="pointer-events-none flex h-14 items-center justify-center overflow-hidden rounded-(--gryt-radius-md) bg-gryt-bg px-3"
                    >
                      {specimens[item.slug] ?? null}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-base font-semibold tracking-tight text-gryt-text">
                        {item.name}
                      </span>
                      {doc ? (
                        <span className="mt-1 block text-sm leading-6 text-gryt-muted">
                          {doc.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
