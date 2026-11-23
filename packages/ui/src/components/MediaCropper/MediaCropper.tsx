import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

import { Button } from "../Button/Button";
import { Dialog } from "../Dialog/Dialog";
import { type CropBox, type CropCorner, initialBox, isAnimated, moveBox, renderCrop, resizeBox, scaleBox } from "./cropBox";

export interface MediaCropResult {
  /** A still picture comes back cropped. A GIF or video comes back as it was, with `box` saying what to keep. */
  file: File;
  box: CropBox;
  animated: boolean;
}

export interface MediaCropperProps {
  /** Open while set. */
  file: File | null;
  /** Width over height of what's kept: 1 for an avatar or server picture. */
  aspect?: number;
  /** Shows a circle inside the square, for pictures drawn round. */
  round?: boolean;
  /** Width of the cropped still, in pixels. */
  outW?: number;
  /** File name of the cropped still, without the extension. */
  name?: string;
  title?: string;
  hint?: string;
  maxBytes?: number;
  onCancel: () => void;
  onUse: (result: MediaCropResult) => void;
  /** Why the file can't be framed. The dialog closes through `onCancel` after it. */
  onError?: (message: string) => void;
}

const FRAME_W = 340, FRAME_H = 300, PAD = 10, PREVIEW = 168, SMALL = 40;
const CORNERS: CropCorner[] = ["nw", "ne", "sw", "se"];
const MAX_PIXELS = 100_000_000;

type Media = { file: File; el: HTMLImageElement | HTMLVideoElement; w: number; h: number; url: string };

/** Frames a picture, GIF or video: the whole thing shows, the box on it is what's kept, and the preview beside it follows live. */
export function MediaCropper({ file, aspect = 1, round = true, outW = 256, name = "picture", title = "Frame your picture", hint, maxBytes = 25 * 1024 * 1024, onCancel, onUse, onError }: MediaCropperProps) {
  const [loaded, setLoaded] = useState<Media | null>(null);
  const [kept, setBox] = useState<CropBox | null>(null);
  // What's loaded belongs to one file; a new file shows nothing until it has loaded.
  const media = loaded && loaded.file === file ? loaded : null;
  const box = media ? kept : null;
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ corner: CropCorner | null; x: number; y: number } | null>(null);
  const big = useRef<HTMLCanvasElement>(null);
  const small = useRef<HTMLCanvasElement>(null);
  const animated = !!file && isAnimated(file);

  useEffect(() => {
    if (!file) return;
    const refuse = (why: string) => {
      onError?.(why);
      onCancel();
    };
    if (file.size > maxBytes) return refuse(`That file is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`);
    const url = URL.createObjectURL(file);
    let live = true;
    const ready = (el: HTMLImageElement | HTMLVideoElement, w: number, h: number) => {
      if (!live) return;
      if (w * h > MAX_PIXELS) return refuse("That picture has too many pixels to open.");
      if (Math.min(w, h * aspect) * Math.min((FRAME_W - 2 * PAD) / w, (FRAME_H - 2 * PAD) / h) < 24) return refuse("That picture is too narrow to frame.");
      setLoaded({ file, el, w, h, url });
      setBox(initialBox(w, h, aspect));
    };
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true });
      v.onloadedmetadata = () => {
        ready(v, v.videoWidth, v.videoHeight);
        void v.play().catch(() => {});
      };
      v.onerror = () => live && refuse("Couldn't open that video.");
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => ready(img, img.naturalWidth, img.naturalHeight);
      img.onerror = () => live && refuse("Couldn't open that picture.");
      img.src = url;
    }
    return () => {
      live = false;
      URL.revokeObjectURL(url);
    };
    // The callbacks change every render of the parent; only the file matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, aspect, maxBytes]);

  // Both previews draw the kept part of whatever frame is showing, so a GIF or video moves in them too.
  useEffect(() => {
    if (!media || !box) return;
    let id = 0;
    const paint = () => {
      for (const c of [big.current, small.current]) {
        const ctx = c?.getContext("2d");
        if (!c || !ctx) continue;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(media.el, box.x, box.y, box.w, box.w / aspect, 0, 0, c.width, c.height);
      }
      if (animated) id = requestAnimationFrame(paint);
    };
    paint();
    return () => cancelAnimationFrame(id);
  }, [media, box, aspect, animated]);

  const W = media?.w ?? 1, H = media?.h ?? 1;
  const k = Math.min((FRAME_W - 2 * PAD) / W, (FRAME_H - 2 * PAD) / H);
  const left = (FRAME_W - W * k) / 2, top = (FRAME_H - H * k) / 2;
  const min = Math.min(W, H * aspect) * 0.1;

  const start = (e: PointerEvent, corner: CropCorner | null) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { corner, x: e.clientX, y: e.clientY };
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) / k, dy = (e.clientY - d.y) / k;
    d.x = e.clientX;
    d.y = e.clientY;
    setBox((b) => b && (d.corner ? resizeBox(b, d.corner, dx, dy, W, H, aspect, min) : moveBox(b, dx, dy, W, H, aspect)));
  };
  const end = () => {
    drag.current = null;
  };
  const onKey = (e: KeyboardEvent) => {
    const step = (e.shiftKey ? 0.05 : 0.01) * Math.min(W, H * aspect);
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) setBox((b) => b && moveBox(b, ...moves[e.key], W, H, aspect));
    else if (e.key === "+" || e.key === "=") setBox((b) => b && scaleBox(b, step * 2, W, H, aspect, min));
    else if (e.key === "-") setBox((b) => b && scaleBox(b, -step * 2, W, H, aspect, min));
    else return;
    e.preventDefault();
  };

  const use = async () => {
    if (!file || !media || !box || busy) return;
    if (animated) return onUse({ file, box, animated: true });
    setBusy(true);
    try {
      onUse({ file: await renderCrop(media.el as HTMLImageElement, box, aspect, outW, name), box, animated: false });
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Couldn't crop the picture.");
    } finally {
      setBusy(false);
    }
  };

  const b = box && { x: left + box.x * k, y: top + box.y * k, w: box.w * k, h: (box.w / aspect) * k };
  const shade = "rgba(10, 11, 15, 0.68)";
  const hole = b && round ? `radial-gradient(circle at ${b.x + b.w / 2}px ${b.y + b.h / 2}px, transparent ${b.w / 2}px, ${shade} ${b.w / 2 + 1}px)` : undefined;
  const previewH = Math.round(PREVIEW / aspect);
  const mediaStyle = { left, top, width: W * k, height: H * k };

  return (
    <Dialog.Root open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup className="gryt-media-cropper flex w-[38rem] max-w-[calc(100vw-2rem)] flex-col gap-3 p-4">
          <Dialog.Title className="text-lg">{title}</Dialog.Title>
          <Dialog.Description className="text-xs text-gryt-muted">
            {hint ?? `Drag the ${round ? "circle" : "box"} to move it, pull a corner to resize. ${round ? "The circle" : "The box"} is what everyone sees.`}
          </Dialog.Description>
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="relative shrink-0 touch-none overflow-hidden rounded-(--gryt-radius-lg) bg-gryt-surface select-none"
              style={{ width: FRAME_W, height: FRAME_H, maxWidth: "100%" }}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            >
              {media &&
                (media.el instanceof HTMLVideoElement ? (
                  <video src={media.url} autoPlay muted loop playsInline className="pointer-events-none absolute max-w-none" style={mediaStyle} />
                ) : (
                  <img src={media.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none" style={mediaStyle} />
                ))}
              {b && box && (
                <>
                  {hole && <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: hole }} />}
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label="Framing. Arrow keys move it, plus and minus resize it."
                    aria-valuenow={Math.round((box.w / Math.min(W, H * aspect)) * 100)}
                    aria-valuemin={10}
                    aria-valuemax={100}
                    className="absolute cursor-move outline-offset-2 focus-visible:outline-2 focus-visible:outline-gryt-accent"
                    style={{ left: b.x, top: b.y, width: b.w, height: b.h, boxShadow: round ? "inset 0 0 0 1px rgba(255, 255, 255, 0.55)" : `0 0 0 9999px ${shade}, inset 0 0 0 2px rgba(255, 255, 255, 0.95)` }}
                    onPointerDown={(e) => start(e, null)}
                    onDoubleClick={() => media && setBox(initialBox(W, H, aspect))}
                    onKeyDown={onKey}
                  >
                    {round && <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.95)" }} />}
                    {CORNERS.map((c) => (
                      <span
                        key={c}
                        aria-hidden="true"
                        className="absolute h-3.5 w-3.5 rounded-[3px] bg-white"
                        style={{
                          left: c.endsWith("w") ? -7 : undefined,
                          right: c.endsWith("e") ? -7 : undefined,
                          top: c.startsWith("n") ? -7 : undefined,
                          bottom: c.startsWith("s") ? -7 : undefined,
                          cursor: c === "nw" || c === "se" ? "nwse-resize" : "nesw-resize",
                        }}
                        onPointerDown={(e) => start(e, c)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
              <span className="self-start text-[11px] font-bold tracking-wider text-gryt-muted uppercase">Preview</span>
              <canvas ref={big} width={PREVIEW * 2} height={previewH * 2} aria-label="How it will look" role="img" className="bg-gryt-surface" style={{ width: PREVIEW, height: previewH, borderRadius: round ? "50%" : "var(--gryt-radius-lg)" }} />
              <div className="flex items-center gap-2 text-xs text-gryt-muted">
                <canvas ref={small} width={SMALL * 2} height={Math.round(SMALL / aspect) * 2} aria-hidden="true" className="bg-gryt-surface" style={{ width: SMALL, height: Math.round(SMALL / aspect), borderRadius: round ? "50%" : "var(--gryt-radius-sm)" }} />
                In a list
              </div>
              {animated && <span className="text-xs text-gryt-muted">It stays animated.</span>}
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="small" tone="neutral" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="small" onClick={() => void use()}>
              {busy ? "Saving…" : "Use this"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
