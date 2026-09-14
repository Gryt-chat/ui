import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  SyntheticEvent
} from "react";

export type VideoPlayerState =
  | "idle"
  | "loading"
  | "paused"
  | "playing"
  | "ended"
  | "error";

export interface VideoPlayerOptions {
  src: string;
  autoLoad?: boolean;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onError?: (event: SyntheticEvent<HTMLVideoElement>) => void;
}

interface Failure {
  src: string;
  time: number;
  play: boolean;
  // An automatic retry was already spent when this one failed.
  retried: boolean;
}

interface Resume {
  time: number;
  play: boolean;
}

const HIDE_AFTER_MS = 2500;
const SEEK_STEP = 5;
const UNMUTE_TO = 50;

// iPhone Safari has no element fullscreen, only the video's own native player.
interface WebkitVideo extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
}

function bufferedEnd(video: HTMLVideoElement): number {
  const { buffered, currentTime } = video;
  for (let i = 0; i < buffered.length; i++) {
    if (buffered.start(i) <= currentTime + 0.5 && currentTime <= buffered.end(i)) {
      return buffered.end(i);
    }
  }
  return 0;
}

function clampVolume(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

/** Everything a VideoPlayer layout needs: the media state, and what to wire to what. */
export function useVideoPlayer({
  src,
  autoLoad = false,
  volume,
  onVolumeChange,
  onError
}: VideoPlayerOptions) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<WebkitVideo | null>(null);
  const hideTimer = useRef<number | null>(null);
  const surfacePress = useRef(false);
  // A new load rewinds the element to 0 before it can fail, which would lose where it was.
  const emptied = useRef(false);

  const [loaded, setLoaded] = useState(autoLoad);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  // Where the last automatic retry picked up from, until playback gets past it.
  const [spentAt, setSpentAt] = useState<number | null>(null);
  const [lastSrc, setLastSrc] = useState(src);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [ownVolume, setOwnVolume] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [awake, setAwake] = useState(true);
  const [pinned, setPinned] = useState(false);

  const level = clampVolume(volume ?? ownVolume);
  const silent = muted || level === 0;
  const failed = failure !== null;

  // A new src after a failure is the parent's fix, so pick up where it failed instead of erroring.
  if (src !== lastSrc) {
    setLastSrc(src);
    if (failure && !failure.retried) {
      setFailure(null);
      setResume({ time: failure.time, play: failure.play });
      setSpentAt(failure.time);
      setLoading(failure.play);
    }
  }

  // Not a prop: React setting src again, even to the same value, restarts the load.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !loaded || failure || video.getAttribute("src") === src) return;
    video.src = src;
    if (resume?.play) void video.play()?.catch(() => setLoading(false));
  }, [failure, loaded, resume, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = level / 100;
      video.muted = muted;
    }
  }, [level, muted]);

  useEffect(() => {
    setCanFullscreen(
      Boolean(document.fullscreenEnabled) ||
        typeof videoRef.current?.webkitEnterFullscreen === "function"
    );
    const onChange = () => {
      setFullscreen(
        document.fullscreenElement !== null &&
          document.fullscreenElement === rootRef.current
      );
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(
    () => () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    },
    []
  );

  const wake = useCallback(() => {
    setAwake(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setAwake(false), HIDE_AFTER_MS);
  }, []);

  const setVolume = useCallback(
    (next: number) => {
      const value = clampVolume(next);
      if (volume === undefined) setOwnVolume(value);
      if (value > 0) setMuted(false);
      onVolumeChange?.(value);
    },
    [onVolumeChange, volume]
  );

  const toggleMute = useCallback(() => {
    if (level === 0) {
      setVolume(UNMUTE_TO);
    } else {
      setMuted((value) => !value);
    }
  }, [level, setVolume]);

  const start = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // Synchronous, inside the press: Safari only lets play() have sound from a gesture.
    if (video.getAttribute("src") !== src) video.src = src;
    setLoaded(true);
    setFailure(null);
    setLoading(true);
    void video.play()?.catch(() => setLoading(false));
  }, [src]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (!loaded) {
      start();
    } else if (ended) {
      video.currentTime = 0;
      setEnded(false);
      void video.play()?.catch(() => undefined);
    } else if (video.paused) {
      void video.play()?.catch(() => undefined);
    } else {
      video.pause();
    }
    wake();
  }, [ended, failed, loaded, start, wake]);

  const seekTo = useCallback(
    (time: number) => {
      const video = videoRef.current;
      if (!video || !(duration > 0)) return;
      const next = Math.max(0, Math.min(duration, time));
      video.currentTime = next;
      setCurrentTime(next);
      if (next < duration) setEnded(false);
    },
    [duration]
  );

  const scrubTo = useCallback(
    (time: number) => {
      setScrub(time);
      seekTo(time);
    },
    [seekTo]
  );

  const endScrub = useCallback(() => setScrub(null), []);

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else if (root && document.fullscreenEnabled) {
      void root.requestFullscreen().catch(() => undefined);
    } else if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  }, []);

  const retry = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // Loading again rewinds to 0, so the position is put back once the metadata is in.
    setResume({ time: failure?.time ?? 0, play: true });
    setFailure(null);
    setSpentAt(null);
    setLoading(true);
    if (video.getAttribute("src") !== src) video.src = src;
    else video.load();
    void video.play()?.catch(() => setLoading(false));
  }, [failure, src]);

  const state: VideoPlayerState = failed
    ? "error"
    : !loaded
      ? "idle"
      : ended
        ? "ended"
        : loading
          ? "loading"
          : playing
            ? "playing"
            : "paused";

  const controlsShown =
    loaded && !failed && (!playing || awake || pinned || scrub !== null);

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    const onButton = target.closest("button") !== null;
    const onSlider = target.tagName === "INPUT";

    switch (event.key) {
      case " ":
        if (onButton || onSlider) return;
        event.preventDefault();
        togglePlay();
        break;
      case "k":
      case "K":
        event.preventDefault();
        togglePlay();
        break;
      case "ArrowLeft":
      case "ArrowRight":
        if (onSlider || !loaded) return;
        event.preventDefault();
        seekTo(currentTime + (event.key === "ArrowLeft" ? -SEEK_STEP : SEEK_STEP));
        break;
      case "m":
      case "M":
        event.preventDefault();
        toggleMute();
        break;
      case "f":
      case "F":
        if (!canFullscreen) return;
        event.preventDefault();
        toggleFullscreen();
        break;
      default:
        if (event.key === "Tab") wake();
        return;
    }
    wake();
  }

  const rootProps = {
    ref: rootRef,
    tabIndex: 0,
    "data-state": state,
    "data-fullscreen": fullscreen || undefined,
    onKeyDown,
    onFocus: wake,
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      // A finger moves a little during a tap, which would wake the controls and make it a pause.
      if (event.pointerType !== "touch") wake();
    },
    onPointerLeave: () => {
      if (playing) setAwake(false);
    }
  };

  const onDuration = (event: SyntheticEvent<HTMLVideoElement>) =>
    setDuration(event.currentTarget.duration);

  const videoProps = {
    ref: videoRef,
    hidden: !loaded,
    preload: loaded ? "metadata" : "none",
    playsInline: true,
    onPlay: () => {
      setPlaying(true);
      setEnded(false);
      wake();
    },
    onPause: () => setPlaying(false),
    onPlaying: () => setLoading(false),
    onWaiting: () => setLoading(true),
    onCanPlay: () => setLoading(false),
    onSeeked: () => setLoading(false),
    onEnded: () => {
      setPlaying(false);
      setEnded(true);
    },
    onError: (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      setFailure({
        src: video.getAttribute("src") ?? src,
        time: resume?.time ?? (video.currentTime || currentTime),
        play: playing || !video.paused,
        retried: spentAt !== null
      });
      setResume(null);
      setLoading(false);
      setPlaying(false);
      onError?.(event);
    },
    onEmptied: () => {
      emptied.current = true;
    },
    onLoadedMetadata: (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      emptied.current = false;
      onDuration(event);
      if (resume && resume.time > 0) video.currentTime = resume.time;
      setCurrentTime(video.currentTime);
      setResume(null);
    },
    onDurationChange: onDuration,
    onTimeUpdate: (event: SyntheticEvent<HTMLVideoElement>) => {
      if (emptied.current) return;
      const time = event.currentTarget.currentTime;
      setCurrentTime(time);
      if (spentAt !== null && time > spentAt + 1) setSpentAt(null);
      setBuffered(bufferedEnd(event.currentTarget));
    },
    onProgress: (event: SyntheticEvent<HTMLVideoElement>) =>
      setBuffered(bufferedEnd(event.currentTarget))
  } as const;

  const surfaceProps = {
    onPointerDown: () => {
      surfacePress.current = true;
    },
    onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
      if (!surfacePress.current || event.button !== 0) return;
      surfacePress.current = false;
      // A tap on a phone brings hidden controls back first; a mouse already did by moving.
      if (event.pointerType !== "mouse" && playing && !controlsShown) {
        wake();
        return;
      }
      togglePlay();
    }
  };

  return {
    state,
    loaded,
    playing,
    currentTime: scrub ?? currentTime,
    duration,
    bufferedPercent: duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0,
    level,
    silent,
    fullscreen,
    canFullscreen,
    controlsShown,
    rootProps,
    videoProps,
    surfaceProps,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    setVolume,
    scrubTo,
    endScrub,
    retry,
    setPinned
  };
}

export type VideoPlayerController = ReturnType<typeof useVideoPlayer>;
