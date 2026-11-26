// kayit.js · Drip Gallery · ilerleme kaydı (A10 · 1, karar 1A: tekrar açılınca Sergi'den, 26.11.2026)
// Ne saklanır: seviye, coin, yıldız, Hazır Kutu stoğu, Sergi (bölüm, sıradaki seviye, asılı tablolar, dekor, ressam kıyafeti),
// Başlangıç paketi, "görüldü" kartları, defter yenilikleri. Yarım tahta SAKLANMAZ: seviye baştan başlar.
// Yer: bu tarayıcının localStorage'ı ("dg-kayit"); ayarlar ayrıca "dg-ayar"da (ses.js).
// Adres satırında parametre varsa (?mekan1, ?a10A gibi öneri/geliştirme adresleri) kayıt ne okunur ne yazılır.
import { live, load, goGallery, introCheck } from "./akis.js";
import { ensureLevel } from "./cizim/mekanlar.js";
import { makeState } from "./motor/kurallar.js";
import { LEVELS } from "./veri/seviyeler.js";

export const KAYIT_ANAHTAR = "dg-kayit";
const SURUM = 1, ACIK = !location.search;
let son = "";

/* O anki ilerlemeyi yazar (değişmediyse yazmaz). draw() ve galDraw() her çizimde çağırır. */
export function kaydet() {
  if (!ACIK || !live.s) return;
  const s = live.s, w = live.win;
  const v = { v: SURUM, lv: s.lv, coins: s.coins, stars: s.stars, ready: s.ready,
    won: w ? s.lv : null, /* kazanma töreni sırasında kapatılırsa: ödül verildi, tablo açılışta asılır */
    G: live.G || null, st: live.st || null, seen: live.seen || {}, wonArt: live.wonArt || null,
    rkSeen: live.rkSeen ?? null, bkSeen: live.bkSeen ?? null, bkLast: live.bkLast ?? null };
  const j = JSON.stringify(v); if (j === son) return;
  try { localStorage.setItem(KAYIT_ANAHTAR, j); son = j; } catch (e) {}
}
export function kayitOku() {
  if (!ACIK) return null;
  try { const v = JSON.parse(localStorage.getItem(KAYIT_ANAHTAR) || "null"); return v && v.v === SURUM && LEVELS[1] ? v : null; } catch (e) { return null; }
}

/* Açılış: kayıt yoksa Sv 1 eğitimi; eğitim seviyesindeyse (Sv 1–2) o seviye baştan; değilse Sergi. */
export function kayittanBasla() {
  const v = kayitOku();
  if (!v) { load(makeState(1)); return "yeni"; }
  const eko = lv => { ensureLevel(lv); const s = makeState(lv); s.coins = v.coins ?? s.coins; s.stars = v.stars ?? s.stars; s.ready = v.ready ?? s.ready; return s; };
  live.seen = v.seen || {}; live.st = v.st || null; live.wonArt = v.wonArt || undefined;
  live.rkSeen = v.rkSeen ?? undefined; live.bkSeen = v.bkSeen ?? undefined; live.bkLast = v.bkLast ?? undefined;
  const L = LEVELS[v.won ?? v.lv];
  /* eğitim: kazanılmış eğitim seviyesi → sıradaki; yarım eğitim seviyesi → o seviye */
  if (L && L.ftue) { const lv = v.won != null ? L.next : v.lv; if (LEVELS[lv]?.ftue || !v.G) { load(eko(lv)); introCheck(); return "egitim"; } }
  live.G = v.G || null;
  if (v.won != null) { load(eko(v.won)); goGallery(null, { won: v.won }); return "sergi-asma"; } /* tören yarıda kaldı: tablo şimdi asılır */
  load(eko(live.G ? live.G.next : v.lv)); goGallery(); return "sergi";
}

addEventListener("pagehide", kaydet);
addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") kaydet(); });
