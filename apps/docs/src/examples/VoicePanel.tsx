import {
  Avatar,
  Button,
  Chip,
  IconButton,
  Meter,
  Popover,
  Slider,
  Tooltip
} from "@gryt/ui";
import {
  Microphone,
  MicrophoneSlash,
  Monitor,
  PhoneDisconnect,
  SlidersHorizontal,
  SpeakerHigh,
  SpeakerSlash,
  VideoCamera,
  VideoCameraSlash
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

/**
 * A voice channel while you are in it: who is connected, and the controls for
 * your own device.
 *
 * Someone can be muted by themselves, deafened, speaking, or sharing a screen,
 * and those are independent — deafened implies muted, but muted says nothing
 * about deafened. Each gets its own mark rather than being folded into a single
 * "status", because folding them is how a muted person looks offline.
 *
 * The speaking ring is on the avatar and nothing else moves. A tile that grows
 * or reorders when someone talks makes a busy channel unreadable.
 */

interface Participant {
  name: string;
  muted?: boolean;
  deafened?: boolean;
  sharing?: boolean;
  /** 0-100. Drives the ring only; there is no live audio here. */
  level: number;
}

const PARTICIPANTS: Participant[] = [
  { name: "sivert", level: 0 },
  { name: "kasper", level: 0, sharing: true },
  { name: "nora", level: 0 },
  { name: "tobias", level: 0, muted: true },
  { name: "ida", level: 0, muted: true, deafened: true }
];

export function VoicePanel() {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [camera, setCamera] = useState(false);
  const [levels, setLevels] = useState<number[]>(() =>
    PARTICIPANTS.map(() => 0)
  );

  // Stands in for the real level meter, which reads the analyser node. Anyone
  // muted stays at zero, since that is the one thing the ring must never lie
  // about.
  useEffect(() => {
    const id = window.setInterval(() => {
      setLevels(
        PARTICIPANTS.map((participant, index) =>
          participant.muted || (index === 0 && muted)
            ? 0
            : Math.max(0, Math.round(Math.random() * 120 - 40))
        )
      );
    }, 480);

    return () => window.clearInterval(id);
  }, [muted]);

  return (
    <div className="flex h-full flex-col gap-4 bg-gryt-bg p-4">
      <header className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-semibold text-gryt-text">
            General
          </p>
          <p className="m-0 truncate text-xs text-gryt-muted">
            Gryt · eu-north
          </p>
        </div>
        <Chip className="ml-auto" label="42 ms" tone="success" />
      </header>

      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
        {PARTICIPANTS.map((participant, index) => (
          <li key={participant.name}>
            <Tile
              participant={{
                ...participant,
                muted: index === 0 ? muted : participant.muted,
                deafened: index === 0 ? deafened : participant.deafened,
                level: levels[index] ?? 0
              }}
              you={index === 0}
            />
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-2 rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface p-2">
        <Tooltip title={muted ? "Unmute" : "Mute"}>
          <IconButton
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
            tone={muted ? "danger" : "neutral"}
            onClick={() => setMuted((value) => !value)}
          >
            {muted ? <MicrophoneSlash size={18} /> : <Microphone size={18} />}
          </IconButton>
        </Tooltip>

        {/* Deafening mutes you too — it would be dishonest to keep sending
            audio to a room you have stopped listening to. */}
        <Tooltip title={deafened ? "Undeafen" : "Deafen"}>
          <IconButton
            aria-label={deafened ? "Undeafen" : "Deafen"}
            aria-pressed={deafened}
            tone={deafened ? "danger" : "neutral"}
            onClick={() => {
              setDeafened((value) => {
                if (!value) setMuted(true);
                return !value;
              });
            }}
          >
            {deafened ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
          </IconButton>
        </Tooltip>

        <Tooltip title={camera ? "Stop camera" : "Start camera"}>
          <IconButton
            aria-label={camera ? "Stop camera" : "Start camera"}
            aria-pressed={camera}
            tone={camera ? "primary" : "neutral"}
            onClick={() => setCamera((value) => !value)}
          >
            {camera ? (
              <VideoCamera size={18} />
            ) : (
              <VideoCameraSlash size={18} />
            )}
          </IconButton>
        </Tooltip>

        <Popover.Root>
          <Popover.Trigger render={<IconButton aria-label="Audio settings" />}>
            <SlidersHorizontal size={18} />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="top">
              <Popover.Popup className="w-56">
                <Popover.Title>Output</Popover.Title>
                <div className="mt-3 flex flex-col gap-3">
                  <Slider defaultValue={80} aria-label="Output volume" />
                  <Meter value={62} label="Bandwidth" showValue />
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        <Button
          className="ml-auto"
          tone="danger"
          size="small"
          startIcon={<PhoneDisconnect size={16} />}
        >
          Leave
        </Button>
      </div>
    </div>
  );
}

function Tile({
  participant,
  you
}: {
  participant: Participant;
  you: boolean;
}) {
  const speaking = participant.level > 20 && !participant.muted;

  return (
    <div className="flex flex-col items-center gap-2 rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface px-3 py-4">
      <span
        className={[
          "rounded-(--gryt-radius-full) p-0.5 transition-[box-shadow,background-color] duration-150",
          speaking ? "bg-gryt-success/20 ring-2 ring-gryt-success" : "ring-0"
        ].join(" ")}
      >
        <Avatar size="large">{participant.name.slice(0, 1).toUpperCase()}</Avatar>
      </span>

      <span className="flex max-w-full items-center gap-1.5">
        <span className="truncate text-sm text-gryt-text">
          {participant.name}
        </span>
        {you ? <span className="text-xs text-gryt-muted">(you)</span> : null}
      </span>

      <span className="flex h-5 items-center gap-1.5 text-gryt-muted">
        {participant.deafened ? (
          <SpeakerSlash aria-label="Deafened" className="text-gryt-danger-11" size={15} />
        ) : null}
        {participant.muted ? (
          <MicrophoneSlash aria-label="Muted" className="text-gryt-danger-11" size={15} />
        ) : null}
        {participant.sharing ? (
          <Monitor aria-label="Sharing a screen" className="text-gryt-accent-11" size={15} />
        ) : null}
      </span>
    </div>
  );
}
