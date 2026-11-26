// Uygulama ikonu ve favicon PNG'leri (A7.4): js/cizim/marka.js'den başsız Chrome ile çizilir → ikon/ + manifest.webmanifest
// Kullanım (oyun klasöründen): node araclar/ikon-uret.mjs   (internet gerekir: Fredoka/Nunito yazı tipleri Google Fonts'tan)
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./sunucu.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "ikon"); mkdirSync(OUT, { recursive: true });
const PORT = 5196, DBG = 9346;
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(existsSync);
if (!CHROME) { console.error("Chrome bulunamadı"); process.exit(2); }
const server = await startServer(PORT);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${DBG}`, `--user-data-dir=${join(process.env.TEMP || ROOT, "drip-ikon-profile")}`,
  "--hide-scrollbars", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json()).find(x => x.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map();
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); } });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/araclar/ikon-sayfa.html` });
for (let i = 0; i < 50 && !(await ev("!!window.hazir").catch(() => false)); i++) await sleep(100);
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } }); /* favicon saydam */

/* [dosya, tür, px] · ikon: saydamlık yok (iOS kuralı), tam kare; telefon köşeleri kendisi yuvarlar */
const LISTE = [["ikon-1024.png", "ikon", 1024], ["ikon-512.png", "ikon", 512], ["ikon-192.png", "ikon", 192], ["apple-touch-icon.png", "ikon", 180],
  ["favicon-48.png", "favicon", 48], ["favicon-32.png", "favicon", 32], ["favicon-16.png", "favicon", 16]];
for (const [ad, tur, px] of LISTE) {
  await send("Emulation.setDeviceMetricsOverride", { width: px, height: px, deviceScaleFactor: 1, mobile: false });
  const fontOk = await ev(`ciz(${JSON.stringify(tur)}, ${px})`); await sleep(120);
  if (!fontOk) console.warn("! yazı tipi yüklenmedi, yedek yazı tipiyle çizildi:", ad);
  const p = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: px, height: px, scale: 1 } });
  writeFileSync(join(OUT, ad), Buffer.from(p.data, "base64")); console.log("✓", ad);
}
writeFileSync(join(ROOT, "manifest.webmanifest"), JSON.stringify({
  name: "Drip Gallery", short_name: "Drip Gallery", lang: "tr", start_url: "./index.html", scope: "./", display: "standalone", orientation: "portrait",
  background_color: "#F6E2BE", theme_color: "#7A4521",
  icons: [{ src: "ikon/ikon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" }, { src: "ikon/ikon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }]
}, null, 2) + "\n");
console.log("✓ manifest.webmanifest");
ws.close(); chrome.kill(); server.close();
