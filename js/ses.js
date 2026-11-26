// ses.js · A8 (26.11.2026). Ses kesiti çalıcı (Web Audio), müzik döngüleri, kısma (ducking), titreşim, ayarların hatırlanması.
// Sezai'nin A8 kararları (08-ses/a8-secenekler.html): 1A kazanma/kaybetmede müzik kısılır (%20) ve geri açılır ·
// 2A döngü 2 sn çapraz geçişle · 3A müzik %30, efektler %100 · 4A titreşim az ve anlamlı.
// Sesler: oyun/ses/*.aac (node araclar/ses-hazirla.mjs üretir), liste js/veri/ses-listesi.js.
import { SESLER } from "./veri/ses-listesi.js";

const MUZIK_DUZEY = .3, KISIK = .2, CAPRAZ = 2, GECIS = .8;
const TITRESIM = { yanlis: [30, 60, 30], tup_tamam: [25], boyama: [15], kazanma: [40, 80, 40, 80, 60], kaybetme: [120] }; /* 4A */
const AYAR_ANAHTAR = "dg-ayar";

let set = { mus: true, snd: true, vib: true };
let AC = null, efektG = null, muzikG = null, kisG = null;
const BUF = {}, bekleyen = {};
/* Test ve hata ayıklama: çalınan efekt ve titreşimlerin son 50'si (oyuncu görmez) */
export const sesLog = [];
export const sesGoruldu = new Set(); /* oturumda en az bir kez çalınanlar */
const logla = x => { sesLog.push(x); sesGoruldu.add(x); if (sesLog.length > 50) sesLog.shift(); };

/* Ayarlar: tarayıcıda hatırlanır (gizli pencerede ya da depolama kapalıysa sessizce varsayılan) */
export function ayarYukle(hedef) {
  try { const v = JSON.parse(localStorage.getItem(AYAR_ANAHTAR) || "null"); if (v && typeof v === "object") for (const k of ["mus", "snd", "vib", "rm"]) if (typeof v[k] === "boolean") hedef[k] = v[k]; } catch (e) {}
  set = hedef; uygula(); return hedef;
}
/* Ayarlar değişince çağrılır: kaydeder ve hemen uygular */
export function ayarDegisti() {
  try { localStorage.setItem(AYAR_ANAHTAR, JSON.stringify({ mus: !!set.mus, snd: !!set.snd, vib: !!set.vib, rm: !!set.rm })); } catch (e) {}
  uygula();
}
function uygula() {
  if (!AC) return; const t = AC.currentTime;
  efektG.gain.setTargetAtTime(set.snd ? 1 : 0, t, .02);
  muzikG.gain.setTargetAtTime(set.mus ? MUZIK_DUZEY : 0, t, .08);
  if (set.mus && istenen && !cal) muzikBaslat(istenen);
}

/* Ses motoru: AudioContext hemen kurulur (askıda), sesler indirilip çözülür; ilk dokunuşta açılır (tarayıcı kuralı) */
function kur() {
  if (AC) return true;
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
  AC = new C(); efektG = AC.createGain(); muzikG = AC.createGain(); kisG = AC.createGain();
  efektG.connect(AC.destination); kisG.connect(muzikG).connect(AC.destination);
  efektG.gain.value = set.snd ? 1 : 0; muzikG.gain.value = set.mus ? MUZIK_DUZEY : 0;
  return true;
}
function yukle(ad) {
  if (BUF[ad]) return Promise.resolve(BUF[ad]);
  return bekleyen[ad] || (bekleyen[ad] = fetch(new URL(`../ses/${ad}.aac`, import.meta.url)).then(r => r.arrayBuffer())
    .then(b => new Promise((ok, no) => AC.decodeAudioData(b, ok, no))).then(b => (BUF[ad] = b)).catch(() => null));
}
export function sesBaslat() {
  if (!kur()) return;
  Object.keys(SESLER).filter(k => !k.startsWith("muzik-")).forEach(yukle); /* efektler küçük: hepsi önden */
  const ac = () => { if (AC.state !== "running") AC.resume().catch(() => {}); };
  for (const e of ["pointerdown", "touchend", "keydown"]) addEventListener(e, ac, { capture: true, passive: true });
  /* Uygulama arka plana geçince ses durur, dönünce devam eder */
  document.addEventListener("visibilitychange", () => { if (document.hidden) AC.suspend().catch(() => {}); else if (acildi) AC.resume().catch(() => {}); });
  addEventListener("pointerdown", () => { acildi = true; }, { capture: true, once: true });
}
let acildi = false;

/* ---------- efektler ----------
   efekt(ad, {at: gecikme sn, r: hız/perde, g: ses düzeyi}). Ses kapalıysa ya da ses henüz yüklenmediyse sessizce geçer. */
export function efekt(ad, o = {}) {
  logla(ad);
  if (!AC || !set.snd || AC.state !== "running") return;
  const b = BUF[ad]; if (!b) { yukle(ad); return; }
  const src = AC.createBufferSource(); src.buffer = b; src.playbackRate.value = o.r || 1;
  let hedef = efektG; if (o.g != null && o.g !== 1) { hedef = AC.createGain(); hedef.gain.value = o.g; hedef.connect(efektG); }
  src.connect(hedef); src.start(AC.currentTime + (o.at || 0));
}
/* Dökme: katman sayısı kadar "gulu", 0,11 sn arayla, her biri biraz ince (tüp doluyor). Karışımda sonuna damla. */
export function dokmeSesi(katman, karisim) {
  for (let i = 0; i < Math.max(1, Math.min(4, katman)); i++) efekt("dokme", { at: i * .11, r: 1.15 + i * .07 });
  if (karisim) efekt("karisim", { at: .3 });
}
/* Coin uçuşu: i. coin sayaca varınca çağrılır; her biri biraz daha ince */
export const coinVardi = i => efekt("coin-ucus", { r: 1 + i * .06, g: .85 });

/* ---------- titreşim (4A: az ve anlamlı). iPhone tarayıcısında API yok: sessizce geçer. ---------- */
export function titret(olay) {
  const p = TITRESIM[olay]; if (!p) return; logla("~" + olay);
  if (set.vib && acildi && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {}
}

/* ---------- müzik ----------
   muzik("oyun" | "menu" | null). Parçalar arası 0,8 sn çapraz geçiş; parça sonunda 2 sn çapraz geçişle başa döner (2A). */
let istenen = null, cal = null, dongu = 0;
export function muzik(ad) {
  if (ad === istenen) return; istenen = ad;
  if (!AC) return;
  if (cal) { const eski = cal; cal = null; sondur(eski, GECIS); }
  if (ad && set.mus) muzikBaslat(ad);
}
export const caliyor = () => istenen;
/* Test: motorun durumu (açık mı, kaç ses yüklü, şu an çalan müzik ve kısma düzeyi) */
export const sesDurum = () => ({ durum: AC?.state, yuklu: Object.keys(BUF).length, muzik: cal?.ad || null, kisma: kisG ? +kisG.gain.value.toFixed(2) : null });
function sondur(k, sn) { const t = AC.currentTime; k.g.gain.cancelScheduledValues(t); k.g.gain.setValueAtTime(k.g.gain.value, t); k.g.gain.linearRampToValueAtTime(0, t + sn); try { k.src.stop(t + sn + .05); } catch (e) {} }
async function muzikBaslat(ad) {
  const n = ++dongu, b = await yukle("muzik-" + ad); if (!b || n !== dongu || istenen !== ad || cal) return;
  parca(b, ad, n, GECIS);
}
function parca(b, ad, n, giris) {
  const t = AC.currentTime + .02, src = AC.createBufferSource(), g = AC.createGain(); src.buffer = b;
  g.gain.setValueAtTime(giris ? 0 : 1, t); if (giris) g.gain.linearRampToValueAtTime(1, t + giris);
  src.connect(g).connect(kisG); src.start(t);
  const k = { src, g, ad, son: t + b.duration }; cal = k;
  /* döngü: bitişe CAPRAZ sn kala yeni kopya başlar. Zamanlayıcı AudioContext saatine bakar (arka planda askıdayken kaymaz). */
  const bak = () => {
    if (cal !== k || n !== dongu) return;
    if (AC.currentTime >= k.son - CAPRAZ - .05) { sondur(k, CAPRAZ); cal = null; parca(b, ad, n, CAPRAZ); return; }
    k.t = setTimeout(bak, 250);
  };
  bak();
}
/* Kazanma/kaybetme (1A): müzik jingle boyunca %20'ye kısılır, bitince 1,4 sn'de geri açılır. Jingle'ı da çalar. */
export function jingle(ad) {
  efekt(ad, { at: .25 }); titret(ad);
  if (!AC) return; const d = SESLER[ad]?.d || 1, t = AC.currentTime, kg = kisG.gain;
  kg.cancelScheduledValues(t); kg.setValueAtTime(kg.value, t); kg.linearRampToValueAtTime(KISIK, t + .25);
  kg.setValueAtTime(KISIK, t + .25 + d + .5); kg.linearRampToValueAtTime(1, t + .25 + d + 1.9);
}
