// sw.js · Drip Gallery · servis çalışanı (A10 · 2 PWA, 26.11.2026)
// Amaç: oyun bir kez internetle açıldıktan sonra internetsiz de açılsın.
// Yöntem "önce ağ": internet varsa her dosya ağdan gelir (her zaman en yeni sürüm) ve kopyası önbelleğe yazılır;
// internet yoksa önbellekteki kopya verilir. Bu yüzden yeni sürüm çıkınca önbellek adını değiştirmek gerekmez.
// Sadece güvenli adreslerde çalışır (https ya da localhost); aynı Wi-Fi'deki http://192.168… adresinde tarayıcı bunu açmaz.
const ONBELLEK = "drip-gallery-v1";
/* Kurulurken baştan alınanlar: kabuk (şart) + iki müzik (müzik ilk dokunuşta yüklendiği için önden alınır).
   Müzik "varsa al, yoksa geç": herkese açık vitrin deposunda müzik dosyaları yok (Pixabay lisansı), kurulum yine de tamamlanır.
   JS modülleri, efekt sesleri ve yazı tipleri ilk açılışta zaten yüklenir; o sırada önbelleğe girer. */
const ONDEN = ["./", "./index.html", "./manifest.webmanifest", "./css/temel.css", "./css/oyun.css", "./css/ekranlar.css",
  "./ikon/favicon-32.png", "./ikon/favicon-16.png", "./ikon/apple-touch-icon.png", "./ikon/ikon-192.png", "./ikon/ikon-512.png"];
const MUZIK = ["./ses/muzik-oyun.aac", "./ses/muzik-menu.aac"];
const YAZI_TIPI = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener("install", e => { e.waitUntil(caches.open(ONBELLEK).then(c => c.addAll(ONDEN).then(() => Promise.all(MUZIK.map(m => c.add(m).catch(() => {}))))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== ONBELLEK).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || r.headers.has("range")) return; /* parça istekleri (ses ileri sarma) tarayıcıya kalır */
  if (u.origin !== location.origin && !YAZI_TIPI.test(r.url)) return;
  if (u.origin === location.origin && u.search) return; /* ?mekan1 gibi geliştirme adresleri önbelleğe karışmaz */
  e.respondWith(fetch(r).then(yanit => {
    if (yanit.ok || yanit.type === "opaque") { const kopya = yanit.clone(); caches.open(ONBELLEK).then(c => c.put(r, kopya)); }
    return yanit;
  }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("./index.html") : Response.error()))));
});
