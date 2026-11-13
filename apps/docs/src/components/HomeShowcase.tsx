import {
  Avatar,
  avatarSeed,
  BAR_BUTTON_STYLE,
  BAR_SOLO_CLASS,
  CallControlButton,
  Chip,
  Composer,
  ConversationItem,
  LEAVE_CLASS,
  MemberCard,
  MessageBubble,
  MessageGroup,
  MessageHoverToolbar,
  randomCardStyle,
  seedFromId,
  Slider,
  Switch
} from "@gryt/ui";
import { owlAvatarColour, owlAvatarDataUri } from "@gryt/owl";
import { PiMicrophoneFill, PiPhoneDisconnectFill, PiSpeakerSlashFill, PiCameraFill } from "@gryt/ui/icons";
import { useMemo } from "react";
import { useSiteTheme } from "../lib/theme/siteTheme";

const OWLS = [
  "Barracuda", "Prairie", "Pimby", "Moss", "Juniper", "Kestrel", "Nova", "Tundra",
  "Saffron", "Echo", "Biscuit", "Marlow", "Quill", "Rune", "Pepper", "Sable",
  "Clover", "Atlas", "Wren", "Indigo", "Fennel", "Orbit", "Hazel", "Comet",
  "Basil", "Lumen", "Thistle", "Pixel", "Maple", "Drift", "Ember", "Willow",
  "Cobalt", "Fable", "Sprout", "Glacier", "Mango", "Rook", "Tansy", "Vesper"
];

const CARDS = [
  { name: "Juniper", status: "online", statusLine: "Around tonight for co-op.", bio: "Mostly on after nine." },
  { name: "Kestrel", status: "afk", statusLine: "Back in ten.", bio: "Mains support. Never the healer." },
  { name: "Saffron", status: "in_voice", statusLine: "Recording, ping if it's on fire.", bio: "Makes the server's emoji." }
] as const;

/** The same card on every visit, so the page doesn't reshuffle under people. */
function seeded(name: string): () => number {
  let a = seedFromId(name);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function SectionTitle({ title, children }: { title: string; children: string }) {
  return (
    <>
      <h2 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
        {title}
      </h2>
      <p className="m-0 max-w-[62ch] pb-(--space-sm) text-sm leading-6 text-gryt-muted">{children}</p>
    </>
  );
}

export function HomeShowcase() {
  const appearance = useSiteTheme().appearance;
  const cards = useMemo(
    () => CARDS.map((c) => ({ ...c, style: randomCardStyle(seeded(c.name)), avatar: owlAvatarDataUri(avatarSeed(c.name) ?? c.name) })),
    []
  );

  return (
    <>
      <section className="border-t border-gryt-border py-(--space-lg)">
        <SectionTitle title="Owls">
          Everyone gets an owl from their name. These are forty names through the same Avatar the app uses.
        </SectionTitle>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Owls">
          {OWLS.map((name) => (
            <li key={name}>
              <Avatar seed={avatarSeed(name)} alt={name} size="large" />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-gryt-border py-(--space-lg)">
        <SectionTitle title="Member cards">
          The card you get when you click someone. Colours, pattern and banner all come from one style string.
        </SectionTitle>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <div key={c.name} className="min-w-0">
              <MemberCard
                appearance={appearance}
                avatarSrc={c.avatar}
                name={c.name}
                owlHex={owlAvatarColour(avatarSeed(c.name) ?? c.name)}
                profile={{ cardStyle: c.style, bio: c.bio, pronouns: null, statusLine: c.statusLine }}
                seedKey={c.name}
                status={c.status}
                channelName="Game night"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gryt-border py-(--space-lg)">
        <SectionTitle title="Put together">
          A chat, a conversation list and a call panel, made only from the components on this page.
        </SectionTitle>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-3 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-4">
            <MessageGroup
              avatar={<Avatar seed={avatarSeed("Moss")} alt="Moss" size="large" className="h-[51px] w-[51px]" />}
              name="Moss"
              time="20:58"
            >
              <MessageBubble>Anyone up for a round after dinner?</MessageBubble>
            </MessageGroup>
            <MessageGroup
              avatar={<Avatar seed={avatarSeed("Wren")} alt="Wren" size="large" className="h-[51px] w-[51px]" />}
              name="Wren"
              time="21:02"
              style={{ marginTop: 14 }}
            >
              <MessageBubble
                toolbar={
                  <MessageHoverToolbar
                    quickReactions={["👍", "❤️", "😂", "😮"]}
                    onQuickReaction={() => {}}
                    onOpenEmojiPicker={() => {}}
                    onReply={() => {}}
                    onMore={() => {}}
                  />
                }
              >
                In. I'll set up the voice channel.
              </MessageBubble>
            </MessageGroup>
            <MessageGroup name="Juniper" time="21:04" own style={{ marginTop: 14 }}>
              <MessageBubble from="user">Bringing snacks</MessageBubble>
            </MessageGroup>
            <div className="mt-auto">
              <Composer placeholder="Message #general" aria-label="Message #general" onAdd={() => {}} onEmoji={() => {}} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-2">
              <ConversationItem
                active
                title="Game night"
                subtitle="Wren: In. I'll set up the voice channel."
                meta="21:04"
                avatar={<Avatar seed={avatarSeed("Wren")} alt="" size="medium" />}
              />
              <ConversationItem
                title="Pepper"
                subtitle="That clip was unreal"
                meta="20:51"
                unread={3}
                presence="online"
                avatar={<Avatar seed={avatarSeed("Pepper")} alt="" size="medium" />}
              />
              <ConversationItem
                title="Basil"
                subtitle="New owls are in"
                meta="Tue"
                pinned
                presence="afk"
                avatar={<Avatar seed={avatarSeed("Basil")} alt="" size="medium" />}
              />
            </div>

            <div className="flex flex-col gap-3 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gryt-text">Voice chat</span>
                <Chip label="Connected" tone="success" />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm text-gryt-text">
                Noise suppression
                <Switch defaultChecked />
              </label>
              <Slider defaultValue={70} aria-label="Output volume" />
              <div className="flex items-center gap-2">
                <CallControlButton state="idle" idleClassName={BAR_SOLO_CLASS} style={BAR_BUTTON_STYLE} aria-label="Mute">
                  <PiMicrophoneFill size={20} />
                </CallControlButton>
                <CallControlButton state="off" style={BAR_BUTTON_STYLE} aria-label="Undeafen">
                  <PiSpeakerSlashFill size={20} />
                </CallControlButton>
                <CallControlButton state="live" style={BAR_BUTTON_STYLE} aria-label="Turn camera off">
                  <PiCameraFill size={20} />
                </CallControlButton>
                <span className="flex-1" />
                <CallControlButton state="idle" className={LEAVE_CLASS} style={BAR_BUTTON_STYLE} aria-label="Leave call">
                  <PiPhoneDisconnectFill size={20} />
                </CallControlButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
