export type PresenceStatus = "in_voice" | "online" | "afk" | "offline";

const COLOUR: Record<PresenceStatus, string> = {
  in_voice: "var(--gryt-accent-9)",
  online: "var(--gryt-success-9)",
  afk: "var(--gryt-warning-9)",
  offline: "var(--gryt-neutral-9)",
};

/** A status as a small dot, in the member list's colours. Undefined draws nothing: that's "no data", not offline. */
export function PresenceDot({ status, size = 8 }: { status: PresenceStatus | undefined; size?: number }) {
  if (!status) return null;
  return (
    <span
      aria-hidden
      style={{ display: "block", flexShrink: 0, width: size, height: size, borderRadius: "50%", background: COLOUR[status] }}
    />
  );
}
