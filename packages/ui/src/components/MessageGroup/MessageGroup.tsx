import type { CSSProperties, ReactNode } from "react";

export interface MessageGroupProps {
  /** The sender's face. Your own messages have none, as in the client. */
  avatar?: ReactNode;
  name: ReactNode;
  /** A role's colour. Falls back to the accent for you and the text colour for anyone else. */
  nameColor?: string;
  time?: ReactNode;
  own?: boolean;
  /** The person's messages, usually MessageBubbles. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** A run of one person's messages: face, name and time over their bubbles. Yours sit on the right. */
export function MessageGroup({ avatar, name, nameColor, time, own = false, children, className, style }: MessageGroupProps) {
  return (
    <div
      className={className}
      style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%", flexDirection: own ? "row-reverse" : "row", ...style }}
    >
      {!own && avatar && <span style={{ flexShrink: 0, marginTop: 2 }}>{avatar}</span>}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 4, alignItems: own ? "flex-end" : "flex-start" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
          <span className="text-sm font-bold" style={{ color: nameColor ?? (own ? "var(--gryt-accent-11)" : "var(--gryt-neutral-12)") }}>
            {name}
          </span>
          {time && (
            <span style={{ fontSize: 12, whiteSpace: "nowrap", userSelect: "none", color: "var(--gryt-neutral-11)" }}>{time}</span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
