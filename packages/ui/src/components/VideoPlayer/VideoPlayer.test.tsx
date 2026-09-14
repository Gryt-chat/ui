import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { formatTime } from "./formatTime";
import { VideoPlayer } from "./VideoPlayer";
import type { VideoPlayerProps } from "./VideoPlayer";

const SRC = "https://example.test/clip.mp4";

function renderPlayer(props: Partial<VideoPlayerProps> = {}) {
  const result = render(
    <GrytProvider>
      <VideoPlayer src={SRC} fileName="clip.mp4" {...props} />
    </GrytProvider>
  );
  const video = result.container.querySelector("video")!;
  const root = screen.getByRole("group", { name: "clip.mp4" });
  // The pill holding mute and fullscreen, which hides with the rest of the controls.
  const controls = () =>
    screen.getByRole("button", { name: /^(Mute|Unmute)$/ }).parentElement!;
  return { ...result, video, root, controls };
}

function setDuration(video: HTMLVideoElement, seconds: number) {
  Object.defineProperty(video, "duration", { configurable: true, value: seconds });
  fireEvent.durationChange(video);
}

function setTime(video: HTMLVideoElement, seconds: number) {
  video.currentTime = seconds;
  fireEvent.timeUpdate(video);
}

// happy-dom's media element plays nothing, so play and pause only flip paused and fire events.
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement
  ) {
    Object.defineProperty(this, "paused", { configurable: true, value: false });
    fireEvent.play(this);
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement
  ) {
    Object.defineProperty(this, "paused", { configurable: true, value: true });
    fireEvent.pause(this);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("VideoPlayer", () => {
  it("fetches nothing until play is pressed", () => {
    const { container, video, root } = renderPlayer({ poster: "/poster.png" });

    expect(video).not.toHaveAttribute("src");
    expect(video).toHaveAttribute("preload", "none");
    expect(container.querySelector("img")).toHaveAttribute("src", "/poster.png");
    expect(root).toHaveAttribute("data-state", "idle");
    expect(screen.queryByRole("slider", { name: "Seek" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Play video" }));

    expect(video).toHaveAttribute("src", SRC);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-state", "loading");

    fireEvent.canPlay(video);
    expect(root).toHaveAttribute("data-state", "playing");
  });

  it("attaches the source straight away with autoLoad", () => {
    const { video, root } = renderPlayer({ autoLoad: true });

    expect(video).toHaveAttribute("src", SRC);
    expect(video).toHaveAttribute("preload", "metadata");
    expect(root).toHaveAttribute("data-state", "paused");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("plays and pauses from the centre button", () => {
    const { video, root } = renderPlayer({ autoLoad: true });
    setDuration(video, 30);

    fireEvent.click(screen.getByRole("button", { name: "Play video" }));
    setTime(video, 2);
    expect(root).toHaveAttribute("data-state", "playing");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(root).toHaveAttribute("data-state", "paused");
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("seeks from the seek bar and shows the time", () => {
    const { video } = renderPlayer({ autoLoad: true });
    setDuration(video, 100);
    setTime(video, 10);

    const seek = screen.getByRole("slider", { name: "Seek" });
    expect(seek).toHaveAttribute("aria-valuetext", "0:10 of 1:40");

    fireEvent.keyDown(seek, { key: "ArrowRight" });
    expect(video.currentTime).toBe(11);
    expect(screen.getByText("0:11")).toBeInTheDocument();
  });

  it("shows the buffered range on the seek bar", () => {
    const { video } = renderPlayer({ autoLoad: true });
    setDuration(video, 100);
    Object.defineProperty(video, "buffered", {
      configurable: true,
      value: { length: 1, start: () => 0, end: () => 25 }
    });
    fireEvent.progress(video);

    expect(screen.getByTestId("video-buffered")).toHaveStyle({ width: "25%" });
  });

  it("applies a controlled volume and reports changes from the slider", () => {
    const onVolumeChange = vi.fn();
    const { video } = renderPlayer({ autoLoad: true, volume: 40, onVolumeChange });

    expect(video.volume).toBeCloseTo(0.4);
    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider).toHaveValue("40");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onVolumeChange).toHaveBeenCalledWith(41);
    // Controlled: nothing moves until the parent passes the new value back.
    expect(video.volume).toBeCloseTo(0.4);
  });

  it("keeps its own volume when none is passed", () => {
    const { video } = renderPlayer({ autoLoad: true });
    const slider = screen.getByRole("slider", { name: "Volume" });

    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider).toHaveValue("99");
    expect(video.volume).toBeCloseTo(0.99);
  });

  it("mutes with the button and with m, without touching the volume", () => {
    const onVolumeChange = vi.fn();
    const { video, root } = renderPlayer({ autoLoad: true, volume: 70, onVolumeChange });

    fireEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(video.muted).toBe(true);

    fireEvent.keyDown(root, { key: "m" });
    expect(video.muted).toBe(false);
    expect(onVolumeChange).not.toHaveBeenCalled();
  });

  it("unmutes to a volume you can hear when the volume was zero", () => {
    const onVolumeChange = vi.fn();
    renderPlayer({ autoLoad: true, volume: 0, onVolumeChange });

    fireEvent.click(screen.getByRole("button", { name: "Unmute" }));
    expect(onVolumeChange).toHaveBeenCalledWith(50);
  });

  it("toggles playback with space and k", () => {
    const { root } = renderPlayer({ autoLoad: true });

    fireEvent.keyDown(root, { key: " " });
    expect(root).toHaveAttribute("data-state", "playing");

    fireEvent.keyDown(root, { key: "k" });
    expect(root).toHaveAttribute("data-state", "paused");
  });

  it("leaves space to a focused button so it is not pressed twice", () => {
    const { root } = renderPlayer({ autoLoad: true });

    fireEvent.keyDown(screen.getByRole("button", { name: "Mute" }), { key: " " });
    expect(root).toHaveAttribute("data-state", "paused");
  });

  it("seeks five seconds with the arrow keys", () => {
    const { video, root } = renderPlayer({ autoLoad: true });
    setDuration(video, 60);

    fireEvent.keyDown(root, { key: "ArrowRight" });
    expect(video.currentTime).toBe(5);

    fireEvent.keyDown(root, { key: "ArrowLeft" });
    fireEvent.keyDown(root, { key: "ArrowLeft" });
    expect(video.currentTime).toBe(0);
  });

  it("offers a replay once the video ends", () => {
    const { video, root } = renderPlayer({ autoLoad: true });
    setDuration(video, 10);

    fireEvent.ended(video);
    expect(root).toHaveAttribute("data-state", "ended");

    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(video.currentTime).toBe(0);
    expect(root).toHaveAttribute("data-state", "playing");
  });

  it("says so when the video cannot be played, and can try again", () => {
    const { video, root } = renderPlayer({ autoLoad: true });
    const load = vi.spyOn(video, "load").mockImplementation(() => undefined);

    fireEvent.error(video);
    expect(root).toHaveAttribute("data-state", "error");
    expect(screen.getByRole("alert")).toHaveTextContent("This video couldn't be played.");
    expect(screen.queryByRole("slider", { name: "Seek" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(load).toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(root).toHaveAttribute("data-state", "loading");
  });

  it("hides the controls while playing and brings them back on movement", () => {
    vi.useFakeTimers();
    const { root, controls } = renderPlayer({ autoLoad: true });

    fireEvent.keyDown(root, { key: "k" });
    expect(controls()).not.toHaveAttribute("data-hidden");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(controls()).toHaveAttribute("data-hidden");
    expect(screen.getByRole("slider", { name: "Seek" }).closest(".gryt-video-seek")).toHaveAttribute("data-thin");

    fireEvent.pointerMove(root, { pointerType: "mouse" });
    expect(controls()).not.toHaveAttribute("data-hidden");
  });

  it("keeps the controls up while paused", () => {
    vi.useFakeTimers();
    const { root, controls } = renderPlayer({ autoLoad: true });

    fireEvent.keyDown(root, { key: "k" });
    fireEvent.keyDown(root, { key: "k" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(controls()).not.toHaveAttribute("data-hidden");
  });

  it("brings the controls back on a tap instead of pausing", () => {
    vi.useFakeTimers();
    const { root, controls } = renderPlayer({ autoLoad: true });
    const surface = screen.getByTestId("video-surface");

    fireEvent.keyDown(root, { key: "k" });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(controls()).toHaveAttribute("data-hidden");

    // A finger drifting during the tap must not count as the mouse moving.
    fireEvent.pointerDown(surface, { pointerType: "touch", button: 0 });
    fireEvent.pointerMove(root, { pointerType: "touch" });
    fireEvent.pointerUp(surface, { pointerType: "touch", button: 0 });
    expect(controls()).not.toHaveAttribute("data-hidden");
    expect(root).toHaveAttribute("data-state", "playing");

    fireEvent.pointerDown(surface, { pointerType: "touch", button: 0 });
    fireEvent.pointerUp(surface, { pointerType: "touch", button: 0 });
    expect(root).toHaveAttribute("data-state", "paused");
  });

  it("pauses on a mouse click on the video", () => {
    const { root } = renderPlayer({ autoLoad: true });
    const surface = screen.getByTestId("video-surface");

    fireEvent.keyDown(root, { key: "k" });
    fireEvent.pointerDown(surface, { pointerType: "mouse", button: 0 });
    fireEvent.pointerUp(surface, { pointerType: "mouse", button: 0 });
    expect(root).toHaveAttribute("data-state", "paused");
  });
});

describe("formatTime", () => {
  it("formats minutes and hours", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(65.4)).toBe("1:05");
    expect(formatTime(3725)).toBe("1:02:05");
    expect(formatTime(Number.NaN)).toBe("0:00");
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00");
  });
});
