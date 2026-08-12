/* The examples registry, as plain data.
 *
 * Split from pages/examples.tsx for the same reason componentMeta.ts is split
 * from componentDocs.tsx: the OG image generator reads it from a build script,
 * and that file imports @gryt/ui, which imports CSS, which a Node or Bun script
 * cannot load.
 *
 * The source shown on each page is not here. It is read from the example's own
 * file with Vite's ?raw, so the code someone copies is the code that rendered
 * above it — there is no second copy to drift.
 */

export interface ExampleDoc {
  slug: string;
  name: string;
  /** One line, under the title. */
  description: string;
  /** The paragraph above the preview: what it is and where it came from. */
  blurb: string;
  /** Components from @gryt/ui the example is built out of. */
  uses: string[];
  /**
   * How tall the preview stage is. Screens that fill a window get more room
   * than a panel that would only stretch.
   */
  stage: "tall" | "medium" | "auto";
}

export const exampleDocs: ExampleDoc[] = [
  {
    slug: "sign-in",
    name: "Sign-in screen",
    description:
      "The split-canvas sign-in page, animated WebGL background included.",
    blurb:
      "This is the Keycloak login theme from Gryt-chat/auth, copied here as one file. It is what you actually see when you sign in to a Gryt server — the brand panel on the left, the form on the right, and a fragment shader painting the background behind both. The theme spreads it across a Template, a Form and a Page because Keycloak needs it to; nothing else about it changes.",
    uses: ["Alert", "Button", "Checkbox", "TextField"],
    stage: "tall"
  },
  {
    slug: "settings-modal",
    name: "Settings modal",
    description:
      "The client's settings dialog — search, a destination rail, one scroll region.",
    blurb:
      "The Gryt client's settings, rebuilt on @gryt/ui. Five destinations named for what you are trying to do rather than which subsystem owns the setting, a search field that filters the rail rather than the panel, and a single scroll region on the right so the rail stays where you left it. The rail is Tabs in its vertical orientation, so the arrow keys walk it and the accent pill slides between destinations.",
    uses: [
      "Button",
      "Dialog",
      "Divider",
      "IconButton",
      "Meter",
      "ScrollArea",
      "Select",
      "Slider",
      "Switch",
      "Tabs",
      "TextField"
    ],
    stage: "medium"
  },
  {
    slug: "chat-panel",
    name: "Chat panel",
    description: "A channel view: header, message list, composer.",
    blurb:
      "The three-row layout every chat client ends up with, done so the middle row is the only thing that scrolls. Consecutive messages from the same person drop the avatar and the name, and sending scrolls the new message into view — leave that out and a sent message looks like it never left.",
    uses: [
      "Avatar",
      "Chip",
      "Composer",
      "IconButton",
      "MessageBubble",
      "ScrollArea",
      "Tooltip"
    ],
    stage: "tall"
  },
  {
    slug: "voice-panel",
    name: "Voice channel",
    description:
      "Participant tiles with speaking, muted and deafened as separate marks.",
    blurb:
      "A voice channel while you are in it. Muted, deafened, speaking and sharing are independent states — deafened implies muted, but muted says nothing about deafened — so each gets its own mark rather than being folded into one status. The speaking ring is on the avatar and nothing else moves; tiles that grow or reorder make a busy channel unreadable.",
    uses: [
      "Avatar",
      "Button",
      "Chip",
      "IconButton",
      "Meter",
      "Popover",
      "Slider",
      "Tooltip"
    ],
    stage: "medium"
  },
  {
    slug: "server-sidebar",
    name: "Server sidebar",
    description: "The two left rails: servers, then that server's channels.",
    blurb:
      "An icon rail of servers next to a rail of channels. Every server icon carries a tooltip, because an icon rail without names is a memory test once you have joined more than three. Right-clicking a channel opens the same actions as its ⋯ button, which is where people reach first.",
    uses: [
      "Avatar",
      "Badge",
      "Collapsible",
      "ContextMenu",
      "IconButton",
      "Menu",
      "ScrollArea",
      "Tooltip"
    ],
    stage: "tall"
  }
];
