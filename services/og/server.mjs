// Link previews that show the shared card (GRYT-1673). Two routes, both for links that carry
// a card in their query: /card?… answers the page with og:image pointing at /og/card.png?…,
// and that PNG is /card/og?… screenshotted in the Chromium this container runs.
// No npm dependencies: Chromium is driven over its DevTools socket with Node's own WebSocket.

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
const CACHE_MAX = Number(process.env.CACHE_MAX ?? 2000);
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

/** The prerendered /card page with its image swapped for this card's. */
export function withCardImage(html, query) {
  const image = `${PUBLIC_ORIGIN}/og/card.png?${query}`.replace(/&/g, "&amp;");
  const page = `${PUBLIC_ORIGIN}/card?${query}`.replace(/&/g, "&amp;");
  return html
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${page}$2`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1A Gryt member card$2`);
}

/* ── Chromium ─────────────────────────────────────────────────────────── */

let browser = null;

async function devtools() {
  if (browser) return browser;
  const child = spawn(CHROMIUM, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
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
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 } }, sessionId);
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
  const file = join(CACHE_DIR, `${createHash("sha256").update(key).digest("hex")}.png`);
  try {
    return await readFile(file);
  } catch {
    const png = await make();
    await writeFile(file, png);
    void trim();
    return png;
  }
}

async function trim() {
  const names = (await readdir(CACHE_DIR)).filter((n) => n.endsWith(".png"));
  if (names.length <= CACHE_MAX) return;
  const aged = await Promise.all(names.map(async (n) => ({ n, t: (await stat(join(CACHE_DIR, n))).mtimeMs })));
  aged.sort((a, b) => a.t - b.t);
  for (const { n } of aged.slice(0, names.length - CACHE_MAX)) await unlink(join(CACHE_DIR, n)).catch(() => {});
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
    if (url.pathname === "/og/card.png" && query) {
      const png = await cached(query, () => render(`/card/og?${query}`));
      res.writeHead(200, { "content-type": "image/png", "cache-control": "public, max-age=86400" }).end(png);
      return;
    }
    if ((url.pathname === "/card" || url.pathname === "/card/") && query) {
      const page = await fetch(`${UI_ORIGIN}/card/index.html`);
      if (!page.ok) throw new Error(`the site answered ${page.status}`);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
      res.end(withCardImage(await page.text(), query));
      return;
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
