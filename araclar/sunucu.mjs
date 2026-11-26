// Yerel önizleme sunucusu (bağımlılık yok). ES modülleri dosyaya çift tıklayınca çalışmadığı için gerekli.
// Kullanım (oyun klasöründen): node araclar/sunucu.mjs [port]   → http://localhost:5173
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// İsteğe bağlı 2. argüman: başka bir kök klasör (ör. ses seçim sayfası için `..` = oyunlar/)
const ARG3 = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "";
const ROOT = normalize(join(dirname(fileURLToPath(import.meta.url)), "..", ARG3));
// --ag: aynı Wi-Fi'deki telefondan açılabilsin diye bütün ağ arayüzlerinde dinler (A10 telefon testi). Yoksa sadece bu bilgisayar.
const AG = process.argv.includes("--ag");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".aac": "audio/aac", ".m4a": "audio/mp4", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };

export function startServer(port = 5173) {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      const head = { "Content-Type": TYPES[extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "Accept-Ranges": "bytes" };
      // Ses/müzik için parça okuma (Range): tarayıcı ileri sarabilsin ve süreyi bilsin
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      if (m) {
        const start = m[1] ? +m[1] : Math.max(0, body.length - +m[2]), end = m[1] && m[2] ? Math.min(+m[2], body.length - 1) : body.length - 1;
        if (start > end || start >= body.length) { res.writeHead(416, { "Content-Range": `bytes */${body.length}` }).end(); return; }
        res.writeHead(206, { ...head, "Content-Range": `bytes ${start}-${end}/${body.length}`, "Content-Length": end - start + 1 }).end(body.subarray(start, end + 1));
        return;
      }
      res.writeHead(200, { ...head, "Content-Length": body.length }).end(body);
    } catch { res.writeHead(404).end("bulunamadı"); }
  });
  return new Promise(r => server.listen(port, AG ? "0.0.0.0" : "127.0.0.1", () => r(server)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const port = +process.argv[2] || 5173;
  await startServer(port);
  console.log(`Drip Gallery: http://localhost:${port}`);
  if (AG) { const { networkInterfaces } = await import("node:os");
    for (const a of Object.values(networkInterfaces()).flat()) if (a && a.family === "IPv4" && !a.internal) console.log(`Telefondan (aynı Wi-Fi): http://${a.address}:${port}/`); }
}
