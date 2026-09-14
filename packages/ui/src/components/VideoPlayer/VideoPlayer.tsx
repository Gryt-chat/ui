import { Slider as BaseSlider } from "@base-ui/react/slider";
import {
  ArrowCounterClockwise,
  CornersIn,
  CornersOut,
  FilmStrip,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  WarningCircle
} from "@phosphor-icons/react";
import type { ReactElement, ReactNode, SyntheticEvent } from "react";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Spinner } from "../Progress/Progress";
import { Slider } from "../Slider/Slider";
import { Tooltip } from "../Tooltip/Tooltip";
import { cn } from "../utils/cn";
import { focusRing, focusRingWithin } from "../utils/styles";
import { formatTime } from "./formatTime";
import { useVideoPlayer } from "./useVideoPlayer";
import type { VideoPlayerController } from "./useVideoPlayer";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  fileName?: string | null;
  /** Attach `src` straight away. Off by default, so nothing is fetched until play is pressed. */
  autoLoad?: boolean;
  /** 0 to 100. Leave it out and the player keeps its own. */
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  /**
   * The video failed to load or play. Pass a new `src` to recover: the player loads it and carries
   * on from the same spot, once, and shows the error only if that fails too.
   */
  onError?: (event: SyntheticEvent<HTMLVideoElement>) => void;
  className?: string;
}

// Over footage the theme's ink can be dark, so these swap it for light underneath.
const onMedia =
  "text-white [--color-gryt-text:#fff] [--color-gryt-muted:rgb(255_255_255/0.7)] [--color-gryt-surface-raised:rgb(255_255_255/0.28)]";

const fade =
  "transition-opacity duration-200 motion-reduce:transition-none data-hidden:pointer-events-none data-hidden:opacity-0";

const centred = "pointer-events-none absolute inset-0 grid place-items-center";

export function VideoPlayer({
  src,
  poster,
  fileName,
  autoLoad,
  volume,
  onVolumeChange,
  onError,
  className
}: VideoPlayerProps) {
  const p = useVideoPlayer({ src, autoLoad, volume, onVolumeChange, onError });
  const chrome = p.loaded && p.state !== "error";
  const hidden = !p.controlsShown || undefined;
  const atStart = p.state === "idle" || (p.state === "paused" && p.currentTime === 0);

  return (
    <div
      {...p.rootProps}
      role="group"
      aria-label={fileName ?? "Video"}
      className={cn(
        "gryt-video-player @container relative isolate overflow-hidden bg-black select-none",
        "rounded-(--gryt-radius-md) data-fullscreen:rounded-none",
        p.playing && !p.controlsShown && "cursor-none",
        focusRing,
        className
      )}
    >
      <video
        {...p.videoProps}
        poster={poster}
        className="block w-full in-data-fullscreen:h-full in-data-fullscreen:object-contain"
      />
      {!p.loaded &&
        (poster ? (
          <img src={poster} alt="" className="block w-full object-cover" draggable={false} />
        ) : (
          <div className="grid aspect-video w-full place-items-center bg-gryt-surface-raised text-gryt-muted">
            <FilmStrip size={40} aria-hidden />
          </div>
        ))}
      {chrome && (
        <div aria-hidden data-testid="video-surface" className="absolute inset-0" {...p.surfaceProps} />
      )}

      {(fileName || chrome) && (
        <div
          data-hidden={(p.loaded && hidden) || undefined}
          className={cn("pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2", onMedia, fade)}
        >
          {fileName ? <Pill className="min-w-0 truncate">{fileName}</Pill> : <span />}
          {chrome && (
            <Pill className="shrink-0 font-mono tabular-nums">
              {formatTime(p.currentTime)}
              <span className="opacity-60"> / {formatTime(p.duration)}</span>
            </Pill>
          )}
        </div>
      )}

      {chrome && !atStart && p.state !== "loading" && p.state !== "ended" && (
        <div data-hidden={hidden} className={cn(centred, "data-hidden:*:pointer-events-none", fade)}>
          <BigButton label={p.playing ? "Pause" : "Play"} onClick={p.togglePlay} quiet>
            {p.playing ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
          </BigButton>
        </div>
      )}

      {(atStart || p.state === "ended") && (
        <div className={centred}>
          <BigButton label={p.state === "ended" ? "Play again" : "Play video"} onClick={p.togglePlay}>
            {p.state === "ended" ? (
              <ArrowCounterClockwise size={26} weight="bold" />
            ) : (
              <Play size={24} weight="fill" />
            )}
          </BigButton>
        </div>
      )}

      {p.state === "loading" && (
        <div className={centred}>
          <Spinner size={40} aria-label="Loading video" className="text-white" />
        </div>
      )}

      {p.state === "error" && (
        <div
          role="alert"
          className={cn("absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 p-4 text-center", onMedia)}
        >
          <WarningCircle size={32} aria-hidden />
          <p className="m-0 text-sm">This video couldn't be played.</p>
          <Button size="xsmall" tone="neutral" onClick={p.retry}>
            Try again
          </Button>
        </div>
      )}

      {chrome && (
        <>
          <div
            data-hidden={hidden}
            className={cn("absolute right-2 bottom-8 flex items-center rounded-(--gryt-radius-full) bg-black/60 px-1", onMedia, fade)}
            onPointerEnter={() => p.setPinned(true)}
            onPointerLeave={() => p.setPinned(false)}
          >
            <ControlButton
              label={p.silent ? "Unmute" : "Mute"}
              shortcut="M"
              onClick={p.toggleMute}
            >
              <VolumeIcon player={p} />
            </ControlButton>
            <div className="w-16 pr-2 @max-xs:hidden">
              <Slider
                aria-label="Volume"
                min={0}
                max={100}
                value={p.silent ? 0 : p.level}
                onValueChange={(value) => p.setVolume(value as number)}
              />
            </div>
            {p.canFullscreen && (
              <ControlButton
                label={p.fullscreen ? "Exit fullscreen" : "Fullscreen"}
                shortcut="F"
                onClick={p.toggleFullscreen}
              >
                {p.fullscreen ? <CornersIn size={18} /> : <CornersOut size={18} />}
              </ControlButton>
            )}
          </div>
          <SeekBar player={p} thin={!p.controlsShown} />
        </>
      )}
    </div>
  );
}

function VolumeIcon({ player: p }: { player: VideoPlayerController }) {
  const Icon = p.silent ? SpeakerX : p.level < 50 ? SpeakerLow : SpeakerHigh;
  return <Icon size={18} weight="fill" />;
}

function BigButton({
  label,
  onClick,
  quiet = false,
  children
}: {
  label: string;
  onClick: () => void;
  quiet?: boolean;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      className={cn(
        "pointer-events-auto h-14 w-14",
        quiet
          ? "bg-black/60 text-white hover:not-data-disabled:bg-black/75 hover:not-data-disabled:text-white"
          : "bg-gryt-accent text-gryt-on-accent hover:not-data-disabled:bg-gryt-accent-light hover:not-data-disabled:text-gryt-on-accent"
      )}
      onClick={onClick}
    >
      {children}
    </IconButton>
  );
}

function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("rounded-(--gryt-radius-full) bg-black/60 px-2.5 py-1 text-xs", className)}>
      {children}
    </span>
  );
}

function ControlButton({
  label,
  shortcut,
  onClick,
  children
}: {
  label: string;
  shortcut: string;
  onClick: () => void;
  children: ReactElement;
}) {
  return (
    <Tooltip title={`${label} (${shortcut})`}>
      <IconButton
        size="xsmall"
        aria-label={label}
        className="text-white hover:not-data-disabled:bg-white/15 hover:not-data-disabled:text-white"
        onClick={onClick}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

// Its own slider rather than Slider: that one springs the thumb, which lags behind playback.
function SeekBar({ player: p, thin }: { player: VideoPlayerController; thin: boolean }) {
  return (
    <BaseSlider.Root
      className={cn(
        "gryt-video-seek absolute",
        // Inset by the thumb's radius and lifted off the corner, so the whole thumb shows at both ends.
        thin ? "inset-x-0 bottom-0" : "inset-x-2 bottom-2"
      )}
      data-thin={thin || undefined}
      value={p.currentTime}
      min={0}
      max={p.duration > 0 ? p.duration : 1}
      step={1}
      largeStep={10}
      disabled={!(p.duration > 0)}
      onValueChange={(value) => p.scrubTo(value)}
      onValueCommitted={p.endScrub}
    >
      <BaseSlider.Control
        className={cn(
          "flex w-full cursor-pointer touch-none items-center select-none data-disabled:cursor-default",
          thin ? "h-1" : "h-4 px-2"
        )}
      >
        <BaseSlider.Track
          className={cn(
            "relative w-full bg-white/25 transition-[height] duration-200 motion-reduce:transition-none",
            thin ? "h-1" : "h-1.5 rounded-(--gryt-radius-full)"
          )}
        >
          <div
            aria-hidden
            data-testid="video-buffered"
            className="absolute inset-y-0 left-0 rounded-[inherit] bg-white/35"
            style={{ width: `${p.bufferedPercent}%` }}
          />
          <BaseSlider.Indicator className="h-full rounded-[inherit] bg-gryt-accent" />
          <BaseSlider.Thumb
            aria-label="Seek"
            getAriaValueText={(_, value) => `${formatTime(value)} of ${formatTime(p.duration)}`}
            className={cn(
              "group rounded-(--gryt-radius-full) select-none data-disabled:invisible",
              thin ? "h-0 w-0" : "h-4 w-4",
              focusRingWithin
            )}
          >
            <span
              className={cn(
                "block h-full w-full rounded-(--gryt-radius-full) bg-white",
                "transition-[scale] duration-(--gryt-dur-spring) ease-spring",
                "motion-safe:group-hover:scale-[1.12] motion-safe:group-active:scale-[0.94] motion-reduce:transition-none"
              )}
            />
          </BaseSlider.Thumb>
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
