import {
  Avatar,
  Chip,
  Composer,
  IconButton,
  MessageBubble,
  ScrollArea,
  Tooltip
} from "@gryt/ui";
import { Hash, Info, UsersThree } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

/**
 * A channel view: header, message list, composer.
 *
 * The parts that are easy to get wrong and are done properly here:
 *
 * - The list scrolls, the header and composer do not. Only the middle region
 *   is a ScrollArea, and it is the only thing in the column allowed to grow.
 * - New messages scroll into view. Without that the composer sends into a
 *   viewport that never moves, which reads as the message not having sent.
 * - Consecutive messages from the same person drop the avatar and the name.
 *   Repeating them on every line is what makes a chat log look like a table.
 */

interface Message {
  id: number;
  author: string;
  own?: boolean;
  system?: boolean;
  time: string;
  body: string;
}

const INITIAL: Message[] = [
  {
    id: 1,
    author: "system",
    system: true,
    time: "",
    body: "kasper joined the channel"
  },
  {
    id: 2,
    author: "kasper",
    time: "14:02",
    body: "The SFU is dropping the second simulcast layer on Firefox again."
  },
  {
    id: 3,
    author: "kasper",
    time: "14:02",
    body: "Only on the 4-person calls, which is why nobody noticed."
  },
  {
    id: 4,
    author: "sivert",
    own: true,
    time: "14:05",
    body: "Do you have a capture? I can look at it tonight."
  },
  {
    id: 5,
    author: "nora",
    time: "14:11",
    body: "I have one from this morning — same thing, 720p never arrives."
  }
];

export function ChatPanel() {
  const [messages, setMessages] = useState(INITIAL);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // scrollTop on the viewport, not scrollIntoView on the last message.
  // scrollIntoView walks up and scrolls every scrollable ancestor it finds, so
  // sending a message would also drag the page the panel is embedded in.
  //
  // A jump, not a smooth scroll. scroll-behavior: smooth is ignored outright by
  // some browsers, and a chat that lands on the newest message instantly is
  // what people expect anyway.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = event.currentTarget.elements.namedItem(
      "message"
    ) as HTMLTextAreaElement | null;
    const body = field?.value.trim() ?? "";
    if (body === "") return;

    setMessages((current) => [
      ...current,
      {
        id: current.length + 1,
        author: "sivert",
        own: true,
        time: "now",
        body
      }
    ]);

    if (field) field.value = "";
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-gryt-bg">
      <header className="flex shrink-0 items-center gap-3 border-b border-gryt-border px-4 py-3">
        <Hash className="text-gryt-muted" size={18} />
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-semibold text-gryt-text">
            voice-plumbing
          </p>
          <p className="m-0 truncate text-xs text-gryt-muted">
            SFU, ICE and everything that goes wrong between them
          </p>
        </div>
        <Chip className="ml-auto" label="3 online" tone="success" />
        <Tooltip title="Members">
          <IconButton aria-label="Members">
            <UsersThree size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Channel details">
          <IconButton aria-label="Channel details">
            <Info size={18} />
          </IconButton>
        </Tooltip>
      </header>

      <ScrollArea.Root className="min-h-0 flex-1">
        <ScrollArea.Viewport ref={viewportRef} className="px-4 py-4">
          <ScrollArea.Content className="flex flex-col gap-2">
            {messages.map((message, index) => (
              <Row
                key={message.id}
                message={message}
                // Same author as the line above, so the avatar and the name are
                // already on screen.
                grouped={messages[index - 1]?.author === message.author}
              />
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>

      <div className="shrink-0 border-t border-gryt-border p-3">
        <Composer
          name="message"
          placeholder="Message #voice-plumbing"
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

function Row({ message, grouped }: { message: Message; grouped: boolean }) {
  if (message.system) {
    return <MessageBubble from="system">{message.body}</MessageBubble>;
  }

  return (
    <div
      className={[
        "flex items-end gap-2",
        message.own ? "flex-row-reverse" : "flex-row"
      ].join(" ")}
    >
      {/* The spacer keeps grouped messages aligned with the first one instead
          of sliding left where the avatar was. */}
      {grouped ? (
        <div className="h-8 w-8 shrink-0" />
      ) : (
        <Avatar size="small">{message.author.slice(0, 1).toUpperCase()}</Avatar>
      )}

      <div className="flex min-w-0 flex-col gap-1">
        {grouped ? null : (
          <div
            className={[
              "flex items-baseline gap-2 text-xs text-gryt-muted",
              message.own ? "justify-end" : "justify-start"
            ].join(" ")}
          >
            <span className="font-medium text-gryt-text">{message.author}</span>
            <span>{message.time}</span>
          </div>
        )}
        <MessageBubble from={message.own ? "user" : "assistant"}>
          {message.body}
        </MessageBubble>
      </div>
    </div>
  );
}
