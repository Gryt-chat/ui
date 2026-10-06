// Link previews that show what was shared (GRYT-1673): a card, an owl or an egg. Per kind, /card?…
// answers the page with og:image at /og/card.jpg?…, a screenshot of /card/og?… in this Chromium.
// No npm dependencies: Chromium is driven over its DevTools socket with Node's own WebSocket.

/* global process, fetch, setTimeout, WebSocket, Buffer, console, URL */

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 8080);
// The site as this container reaches it, and as the rest of the internet does.
const UI_ORIGIN = (process.env.UI_ORIGIN ?? "http://proxy:8084").replace(/\/$/, "");
const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN ?? "https://ui.gryt.chat").replace(/\/$/, "");
const CACHE_DIR = process.env.CACHE_DIR ?? "/cache";
// Bytes. The cache is meant to sit on a tmpfs, so this is RAM, and the Pi's SD card sees no writes.
const CACHE_MAX_BYTES = Number(process.env.CACHE_MAX_BYTES ?? 64 * 1024 * 1024);
const CHROMIUM = process.env.CHROMIUM ?? "/usr/bin/chromium";
const DEBUG_PORT = Number(process.env.DEBUG_PORT ?? 9222);
const WIDTH = 1200;
const HEIGHT = 630;

/** A card's code is short and URL-safe; anything else isn't one, and isn't rendered. */
export function cardQuery(search) {
  const q = search.startsWith("?") ? search.slice(1) : search;
  if (!q || q.length > 1024 || !/^[A-Za-z0-9=&_.%+-]+$/.test(q)) return null;
  return q;
}

/**
 * What can be shared: the page a link opens, the page drawn for its preview, and that preview's
 * path. A card keeps its old cache keys; the others are prefixed so the three can't collide.
 */
export const KINDS = {
  card: { page: "/card", og: "/card/og", image: "/og/card.jpg", alt: "A Gryt member card", key: "" },
  owl: { page: "/avatars", og: "/avatars/og", image: "/og/owl.jpg", alt: "A Gryt owl", key: "owl:" },
  egg: { page: "/eggs", og: "/eggs/og", image: "/og/egg.jpg", alt: "A Gryt egg", key: "egg:" },
};

/** The prerendered page with its preview swapped for the one this link describes. */
export function withImage(html, kind, query) {
  const k = KINDS[kind];
  const image = `${PUBLIC_ORIGIN}${k.image}?${query}`.replace(/&/g, "&amp;");
  const page = `${PUBLIC_ORIGIN}${k.page}?${query}`.replace(/&/g, "&amp;");
  return html
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${page}$2`)
    .replace(/(<meta property="og:image:type" content=")[^"]*(")/, `$1image/jpeg$2`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${k.alt}$2`);
}

/** The card's own, kept for anything that imported it before owls and eggs. */
export const withCardImage = (html, query) => withImage(html, "card", query);

/* ── Chromium ─────────────────────────────────────────────────────────── */

let browser = null;

async function devtools() {
  if (browser) return browser;
  const child = spawn(CHROMIUM, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    // Docker gives /dev/shm 64 MB; /tmp is a tmpfs on the Pi, so this stays off the SD card too.
    "--disable-dev-shm-usage",
    `--remote-debugging-port=${DEBUG_PORT}`,
    "--user-data-dir=/tmp/og-chromium",
    "about:blank",
  ], { stdio: "ignore" });
  child.on("exit", () => { browser = null; });
  for (let i = 0; i < 50; i++) {
    try {
      const version = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).json();
      browser = { child, url: version.webSocketDebuggerUrl };
      return browser;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  child.kill();
  throw new Error("chromium did not start");
}

async function screenshot(path) {
  const { url } = await devtools();
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const n = ++id;
      pending.set(n, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
      ws.send(JSON.stringify({ id: n, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  try {
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] }, sessionId);
    await send("Page.enable", {}, sessionId);
    await send("Page.navigate", { url: `${UI_ORIGIN}${path}` }, sessionId);
    const deadline = Date.now() + 15_000;
    for (;;) {
      const r = await send("Runtime.evaluate", { expression: "document.body?.dataset.ogReady === '1'", returnByValue: true }, sessionId);
      if (r.result?.value === true) break;
      if (Date.now() > deadline) throw new Error("the page never said it was ready");
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    // JPEG: a gradient card is about 250 KB as a PNG and a fraction of that here.
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 85, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } }, sessionId);
    return Buffer.from(shot.data, "base64");
  } finally {
    await send("Target.closeTarget", { targetId }).catch(() => {});
    ws.close();
  }
}

/* One render at a time, and a short line: the Pi has four cores and other sites to serve,
   and every new query is a render, so a flood of made-up ones is turned away here. */
const QUEUE_MAX = 8;
let waiting = 0;
let queue = Promise.resolve();
function render(path) {
  if (waiting >= QUEUE_MAX) return Promise.reject(Object.assign(new Error("busy"), { busy: true }));
  waiting++;
  const next = queue.then(() => screenshot(path)).finally(() => { waiting--; });
  queue = next.catch(() => {});
  return next;
}

/* ── Cache ────────────────────────────────────────────────────────────── */

async function cached(key, make) {
  const file = join(CACHE_DIR, `${createHash("sha256").update(key).digest("hex")}.jpg`);
  try {
    return await readFile(file);
  } catch {
    const jpg = await make();
    // A cache that can't be written to costs a re-render later, not this answer.
    await writeFile(file, jpg).then(() => trim(), (err) => console.error(`cache: ${err.message}`));
    return jpg;
  }
}

/** Oldest first until the folder is back under its size. */
async function trim() {
  const names = (await readdir(CACHE_DIR)).filter((n) => n.endsWith(".jpg"));
  const files = await Promise.all(names.map(async (n) => {
    const s = await stat(join(CACHE_DIR, n));
    return { n, t: s.mtimeMs, size: s.size };
  }));
  let total = files.reduce((sum, f) => sum + f.size, 0);
  files.sort((a, b) => a.t - b.t);
  for (const f of files) {
    if (total <= CACHE_MAX_BYTES) break;
    await unlink(join(CACHE_DIR, f.n)).catch(() => {});
    total -= f.size;
  }
}

/* ── HTTP ─────────────────────────────────────────────────────────────── */

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://og");
  try {
    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "text/plain" }).end("ok");
      return;
    }
    const query = cardQuery(url.search);
    for (const [kind, k] of Object.entries(KINDS)) {
      if (url.pathname === k.image && query) {
        const jpg = await cached(k.key + query, () => render(`${k.og}?${query}`));
        // A link's picture never changes, so Cloudflare and the unfurlers can keep it a day.
        res.writeHead(200, { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" }).end(jpg);
        return;
      }
      if ((url.pathname === k.page || url.pathname === `${k.page}/`) && query) {
        const page = await fetch(`${UI_ORIGIN}${k.page}/index.html`);
        if (!page.ok) throw new Error(`the site answered ${page.status}`);
        res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
        res.end(withImage(await page.text(), kind, query));
        return;
      }
    }
    res.writeHead(404, { "content-type": "text/plain" }).end("not found");
  } catch (err) {
    if (err?.busy) {
      res.writeHead(503, { "content-type": "text/plain", "retry-after": "10" }).end("busy");
      return;
    }
    console.error(`${url.pathname}: ${err instanceof Error ? err.message : err}`);
    res.writeHead(502, { "content-type": "text/plain" }).end("could not render");
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  await mkdir(CACHE_DIR, { recursive: true });
  server.listen(PORT, () => console.log(`og listening on ${PORT}, rendering ${UI_ORIGIN}`));
}
