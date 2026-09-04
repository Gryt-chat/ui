import {
  Avatar,
  Badge,
  Collapsible,
  ContextMenu,
  IconButton,
  Menu,
  ScrollArea,
  Tooltip
} from "@gryt/ui";
import {
  CaretRight,
  DotsThree,
  Hash,
  Plus,
  SpeakerHigh
} from "@phosphor-icons/react";
import { useState } from "react";
import type { ReactNode } from "react";

/**
 * The two rails down the left of the client: servers, then that server's
 * channels.
 *
 * - The server rail is icons only, so every one carries a Tooltip. An icon rail
 *   without names is a memory test for anyone who has joined more than three.
 * - Unread counts are a Badge on the server icon and bold text on the channel,
 *   not both in both places. Two treatments of one fact read as two facts.
 * - Right-clicking a channel opens the same actions as its ⋯ button. People
 *   reach for the context menu first.
 */

const SERVERS = [
  { id: "gryt", name: "Gryt", unread: 0, active: true },
  { id: "sfu", name: "SFU internals", unread: 3 },
  { id: "design", name: "Design", unread: 0 },
  { id: "ops", name: "Ops", unread: 12 }
];

const GROUPS = [
  {
    name: "Text",
    channels: [
      { id: "general", name: "general", unread: false },
      { id: "voice-plumbing", name: "voice-plumbing", unread: true },
      { id: "releases", name: "releases", unread: false }
    ]
  },
  {
    name: "Voice",
    voice: true,
    channels: [
      { id: "lounge", name: "Lounge", members: ["kasper", "nora"] },
      { id: "focus", name: "Focus room", members: [] }
    ]
  }
];

export function ServerSidebar() {
  const [server, setServer] = useState("gryt");
  const [channel, setChannel] = useState("voice-plumbing");

  // A fixed width, because that is what a sidebar is. Stretch it to fill a
  // window and the channel names end up an inch from their icons.
  return (
    <div className="flex h-full w-[19rem] shrink-0 border-r border-gryt-border bg-gryt-bg">
      {/* ── server rail ─────────────────────────────────────── */}
      <nav
        aria-label="Servers"
        className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-gryt-border py-3"
      >
        {SERVERS.map((entry) => (
          <Tooltip key={entry.id} title={entry.name} side="right">
            <button
              type="button"
              aria-current={entry.id === server ? "true" : undefined}
              onClick={() => setServer(entry.id)}
              className={[
                "rounded-(--gryt-radius-full) p-0.5 transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
                entry.id === server
                  ? "ring-2 ring-gryt-accent"
                  : "ring-0 hover:bg-white/5"
              ].join(" ")}
            >
              <Badge badgeContent={entry.unread}>
                <Avatar>{entry.name.slice(0, 1).toUpperCase()}</Avatar>
              </Badge>
            </button>
          </Tooltip>
        ))}

        <Tooltip title="Add a server" side="right">
          <IconButton aria-label="Add a server" className="mt-1">
            <Plus size={18} />
          </IconButton>
        </Tooltip>
      </nav>

      {/* ── channel rail ────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gryt-border px-3 py-3">
          <span className="truncate text-sm font-semibold text-gryt-text">
            {SERVERS.find((entry) => entry.id === server)?.name}
          </span>
          <Menu.Root>
            <Menu.Trigger render={<IconButton aria-label="Server menu" size="small" />}>
              <DotsThree size={18} />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end">
                <Menu.Popup>
                  <Menu.Item>Invite people</Menu.Item>
                  <Menu.Item>Server settings</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item>Leave server</Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </header>

        <ScrollArea.Root className="min-h-0 flex-1">
          <ScrollArea.Viewport className="px-2 py-2">
            <ScrollArea.Content className="flex flex-col gap-2">
              {GROUPS.map((group) => (
                <Collapsible.Root key={group.name} defaultOpen>
                  <Collapsible.Trigger className="group justify-start gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted hover:text-gryt-text">
                    <CaretRight
                      className="transition-transform duration-150 group-data-panel-open:rotate-90"
                      size={11}
                    />
                    {group.name}
                  </Collapsible.Trigger>
                  <Collapsible.Panel>
                    <ul className="m-0 flex list-none flex-col gap-0.5 p-0 pt-1">
                      {group.channels.map((entry) => (
                        <li key={entry.id}>
                          <ChannelRow
                            active={entry.id === channel}
                            icon={
                              group.voice ? (
                                <SpeakerHigh size={16} />
                              ) : (
                                <Hash size={16} />
                              )
                            }
                            members={"members" in entry ? entry.members : []}
                            name={entry.name}
                            unread={"unread" in entry ? entry.unread : false}
                            onSelect={() => setChannel(entry.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  </Collapsible.Panel>
                </Collapsible.Root>
              ))}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" />
        </ScrollArea.Root>
      </div>
    </div>
  );
}

function ChannelRow({
  active,
  icon,
  members,
  name,
  onSelect,
  unread
}: {
  active: boolean;
  icon: ReactNode;
  members: string[];
  name: string;
  onSelect: () => void;
  unread: boolean;
}) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        render={
          <div
            className={[
              "flex flex-col rounded-(--gryt-radius-md) px-2 py-1.5 transition-colors duration-150",
              active ? "bg-gryt-surface-raised" : "hover:bg-white/5"
            ].join(" ")}
          />
        }
      >
        <button
          type="button"
          onClick={onSelect}
          className={[
            "flex w-full min-w-0 items-center gap-2 text-left text-sm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
            active || unread ? "text-gryt-text" : "text-gryt-muted",
            unread && !active ? "font-semibold" : "font-normal"
          ].join(" ")}
        >
          <span className="shrink-0 text-gryt-muted">{icon}</span>
          <span className="truncate">{name}</span>
        </button>

        {/* Who is already in the voice channel, under its name. This is the
            one thing people check before joining, and putting it behind a
            click means they join to find out. */}
        {members.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-1 p-0 pt-1 pl-6">
            {members.map((member) => (
              <li
                key={member}
                className="flex items-center gap-2 text-xs text-gryt-muted"
              >
                <Avatar size="small" className="h-5 w-5 text-[10px]">
                  {member.slice(0, 1).toUpperCase()}
                </Avatar>
                <span className="truncate">{member}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup>
            <ContextMenu.Item>Mark as read</ContextMenu.Item>
            <ContextMenu.Item>Copy link</ContextMenu.Item>
            <ContextMenu.Separator />
            <ContextMenu.Item>Mute channel</ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
