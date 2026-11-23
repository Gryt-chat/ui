/* The part of a picture or video that is kept, in its own pixels: w wide and w / aspect tall. */
export interface CropBox {
  x: number;
  y: number;
  w: number;
}

export type CropCorner = "nw" | "ne" | "sw" | "se";

/** The largest box of this shape the media holds, centred: its whole width or its whole height. */
export function initialBox(W: number, H: number, aspect: number): CropBox {
  const w = Math.min(W, H * aspect);
  return { x: (W - w) / 2, y: (H - w / aspect) / 2, w };
}

/** Moved, and kept inside the media. */
export function moveBox(b: CropBox, dx: number, dy: number, W: number, H: number, aspect: number): CropBox {
  return { w: b.w, x: Math.min(W - b.w, Math.max(0, b.x + dx)), y: Math.min(H - b.w / aspect, Math.max(0, b.y + dy)) };
}

/** Pulled by one corner while the opposite one stays put: same shape, inside the media, no narrower than `min`. */
export function resizeBox(b: CropBox, corner: CropCorner, dx: number, dy: number, W: number, H: number, aspect: number, min: number): CropBox {
  const sx = corner === "ne" || corner === "se" ? 1 : -1;
  const sy = corner === "sw" || corner === "se" ? 1 : -1;
  const h = b.w / aspect;
  const ax = sx > 0 ? b.x : b.x + b.w;
  const ay = sy > 0 ? b.y : b.y + h;
  const room = Math.min(sx > 0 ? W - ax : ax, (sy > 0 ? H - ay : ay) * aspect);
  const w = Math.max(Math.min(min, room), Math.min(room, b.w + (sx * dx + sy * dy * aspect) / 2));
  return { w, x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - w / aspect };
}

/** Grown or shrunk about its centre, for the keyboard. */
export function scaleBox(b: CropBox, by: number, W: number, H: number, aspect: number, min: number): CropBox {
  const most = Math.min(W, H * aspect);
  const w = Math.max(Math.min(min, most), Math.min(most, b.w + by));
  return moveBox({ w, x: b.x + (b.w - w) / 2, y: b.y + (b.w - w) / aspect / 2 }, 0, 0, W, H, aspect);
}

/** GIFs and videos can't be cut in the browser without re-encoding, so they keep their file and pass the box on. */
export const isAnimated = (file: File) => file.type === "image/gif" || file.type.startsWith("video/");

/** The kept part of a still picture at outW wide, as WebP where the browser can encode it. */
export async function renderCrop(img: HTMLImageElement, b: CropBox, aspect: number, outW: number, name: string): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = Math.round(outW / aspect);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't draw the picture.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, b.x, b.y, b.w, b.w / aspect, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.92));
  if (!blob) throw new Error("Couldn't save the picture.");
  // Safari has no WebP encoder and hands back a PNG instead.
  const type = blob.type || "image/png";
  return new File([blob], `${name}.${type === "image/webp" ? "webp" : "png"}`, { type });
}
