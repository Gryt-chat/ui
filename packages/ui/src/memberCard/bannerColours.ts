/**
 * Colours read off a banner picture, so the card can be coloured to run into it.
 * The pixel maths is pure; only `readBannerColours` touches a canvas.
 */

export interface BannerColours {
  /** The average of the bottom rows, where the banner meets the card. */
  bottom: string;
  /** Whether those rows are close to one flat colour, so no long fade is needed. */
  flat: boolean;
  /** A few colours that take up the most of the picture, most first, none close to another. */
  palette: string[];
}

const hex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

const apart = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** RGBA pixels, row by row from the top, as a canvas hands them over. */
export function analyseBanner(data: ArrayLike<number>, width: number, height: number): BannerColours {
  const from = Math.max(0, height - Math.max(1, Math.round(height * 0.15)));
  const sum = [0, 0, 0];
  let count = 0;
  for (let y = from; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2];
      count += 1;
    }
  }
  const mean = count ? sum.map((v) => v / count) : [0, 0, 0];
  let spread = 0;
  for (let y = from; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] >= 128) spread += apart([data[i], data[i + 1], data[i + 2]], mean);
    }
  }
  const flat = count > 0 && spread / count < 22;

  // Sixteen steps a channel: near-identical shades land in one bucket and are averaged there.
  const buckets = new Map<number, [number, number, number, number]>();
  for (let i = 0; i < width * height * 4; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const b = buckets.get(key) ?? [0, 0, 0, 0];
    b[0] += data[i]; b[1] += data[i + 1]; b[2] += data[i + 2]; b[3] += 1;
    buckets.set(key, b);
  }
  const ranked = [...buckets.values()].sort((a, b) => b[3] - a[3]).map((b) => [b[0] / b[3], b[1] / b[3], b[2] / b[3]]);
  const picked: number[][] = [];
  for (const c of ranked) {
    if (picked.length === 3) break;
    if (apart(c, mean) > 48 && picked.every((p) => apart(p, c) > 64)) picked.push(c);
  }
  return { bottom: hex(mean[0], mean[1], mean[2]), flat, palette: picked.map((c) => hex(c[0], c[1], c[2])) };
}

/** Reads a picture the page may read: an object URL, or one served with CORS. Null when it can't. */
export function readBannerColours(url: string): Promise<BannerColours | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const width = 64;
        const height = Math.max(8, Math.round((img.naturalHeight / Math.max(1, img.naturalWidth)) * width));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(analyseBanner(ctx.getImageData(0, 0, width, height).data, width, height));
      } catch {
        // A picture from another origin without CORS taints the canvas; the swatches just don't show.
        resolve(null);
      }
    };
    img.src = url;
  });
}
