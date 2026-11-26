// araclar/seviye-uret.mjs · A5 adım 3: 30 seviyeyi üretir.
// Plan: A · GDD'ye sadık eğri (07-seviyeler/a5-oneri.html, Sezai onayı 26.11.2026).
// Her seviye için çok sayıda rastgele tahta dener, çözücüyle (cozucu.mjs) çözer, eğrideki yerine uyanı seçer.
// Hamle sınırı = en kısa çözüm + hamle payı (yukarı yuvarlanır).
// Çıktı: 07-seviyeler/seviye-veri/sv-NN.json (her seviye; çözüm yolu ve ölçüler) + js/veri/seviye-listesi.js (oyun bunu okur).
// Kullanım (oyun klasöründen):  node araclar/seviye-uret.mjs            → hepsi
//                               node araclar/seviye-uret.mjs 21 22      → sadece bu seviyeler (öncekiler korunur)
//                               node araclar/seviye-uret.mjs yaz        → üretmeden, rapordan seviye-listesi.js'i yeniden yaz
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { solve } from "./cozucu.mjs";
import { PARTS } from "../js/veri/renkler.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTJS = join(ROOT, "js", "veri", "seviye-listesi.js");

import { PLAN, targetFatal } from "./seviye-plani.mjs";
export { PLAN };

let seed = 1;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* bölge renkleri: ara renkler, açık tonlar, kalanlar ana renk; mümkün olduğunca farklı */
function colorsFor(lv, [b, m, l]) {
  if (lv === 3) return shuffle(["G", "P"]); /* GDD: Sv 3 yeşil ve mor */
  const sec = shuffle(["O", "G", "P"]), lig = shuffle(["PK", "CR", "LB"]), pri = shuffle(["R", "Y", "B"]);
  const out = [];
  for (let i = 0; i < m; i++) out.push(sec[i % 3]);
  for (let i = 0; i < l; i++) out.push(lig[i % 3]);
  for (let i = 0; out.length < b; i++) out.push(pri[i % 3]);
  return shuffle(out);
}
/* bir aday tahta */
function candidate(lv, spec) {
  const [b, m, l, t, e] = spec, need = colorsFor(lv, spec);
  const regions = need.map((c, i) => ({ id: "b" + (i + 1), need: c }));
  /* bant: t bölge, her biri bantsız başka bir bölge boyanınca açılır */
  const order = shuffle(regions.map((_, i) => i)), taped = order.slice(0, t), free = order.slice(t);
  taped.forEach(i => { regions[i].tape = regions[free[Math.floor(rnd() * free.length)]].id; });
  /* boya: her bölge 4 katman. Ana renk 4 kat; ara renk / açık ton 2 + 2 (karışımla yapılır) */
  const layers = []; need.forEach(c => { const p = PARTS[c]; if (p.length === 1) layers.push(c, c, c, c); else layers.push(p[0], p[0], p[1], p[1]); });
  shuffle(layers);
  const tubes = []; for (let i = 0; i < b; i++) tubes.push(layers.slice(i * 4, i * 4 + 4));
  for (let i = 0; i < e; i++) tubes.push([]);
  return { regions, start: { tubes } };
}
const tooEasy = c => c.start.tubes.some(t => t.length === 4 && t.every(x => x === t[0])); /* hazır dolu tüp: başlangıçta bedava kutu */

function build(lv, tries) {
  const spec = PLAN[lv], pay = spec[5];
  const cands = []; let attempts = 0;
  seed = lv * 7919 + 13;
  while (cands.length < tries && attempts < tries * 6) {
    attempts++;
    const c = candidate(lv, spec); if (tooEasy(c)) continue;
    const r = solve(c);
    if (!r.solvable || r.capped) continue;
    cands.push({ ...c, r });
  }
  if (!cands.length) throw new Error(`Sv ${lv}: çözülebilir tahta bulunamadı`);
  const tf = targetFatal(lv);
  cands.sort((a, b) => Math.abs(a.r.fatal - tf) - Math.abs(b.r.fatal - tf) || a.r.min - b.r.min);
  const pick = cands[0];
  const moves = pay == null ? 99 : Math.ceil(pick.r.min * (1 + pay / 100));
  const fs_ = cands.map(c => c.r.fatal);
  return { lv, spec, regions: pick.regions, tubes: pick.start.tubes, min: pick.r.min, exact: pick.r.exact, moves, fatal: pick.r.fatal, target: tf, states: pick.r.states,
    path: pick.r.path, tried: cands.length, range: [Math.min(...fs_), Math.max(...fs_)] };
}

const only = process.argv.slice(2).map(Number).filter(Boolean);
/* her seviye ayrı dosyada (07-seviyeler/seviye-veri/sv-NN.json): seviyeler aynı anda birkaç pencerede üretilebilir */
const DIR = join(ROOT, "..", "07-seviyeler", "seviye-veri"); mkdirSync(DIR, { recursive: true });
const fileOf = lv => join(DIR, `sv-${String(lv).padStart(2, "0")}.json`);
for (const lv of Object.keys(PLAN).map(Number)) {
  if (process.argv.includes("yaz") || (only.length && !only.includes(lv))) continue;
  const t0 = Date.now(), tries = PLAN[lv][0] >= 6 ? 6 : PLAN[lv][0] >= 5 ? 10 : 16;
  const r = build(lv, tries);
  console.log(`Sv ${String(lv).padStart(2)} · ${r.regions.map(x => x.need + (x.tape ? "▭" : "")).join(" ")} · en kısa ${r.min}${r.exact ? "" : "≈"} → sınır ${r.moves} · ölümcül %${Math.round(r.fatal * 100)} hedef %${Math.round(r.target * 100)} (aday ${r.tried}, %${Math.round(r.range[0] * 100)}–${Math.round(r.range[1] * 100)}) · ${((Date.now() - t0) / 1000).toFixed(1)} sn`);
  writeFileSync(fileOf(lv), JSON.stringify(r, null, 1)); /* her seviyeden sonra kaydet */
}
const out = {}; for (const lv of Object.keys(PLAN).map(Number)) if (existsSync(fileOf(lv))) out[lv] = JSON.parse(readFileSync(fileOf(lv), "utf8"));
/* oyunun okuyacağı veri */
const lines = Object.values(out).sort((a, b) => a.lv - b.lv).map(r =>
  `  ${r.lv}:{regions:${JSON.stringify(r.regions)},tubes:${JSON.stringify(r.tubes)},min:${r.min},exact:${r.exact!==false},moves:${r.moves},fatal:${r.fatal},path:${JSON.stringify(r.path)}}`);
writeFileSync(OUTJS, `// veri/seviye-listesi.js · OTOMATİK ÜRETİLDİ (araclar/seviye-uret.mjs). Elle değiştirme; betiği yeniden çalıştır.
// Her seviye: bölgeler (need = istenen ton, tape = hangi bölge boyanınca bant sökülür), başlangıç tüpleri,
// min = en kısa çözüm, moves = hamle sınırı, fatal = ölümcül hamle oranı, path = çözücünün bulduğu çözüm [kaynak, hedef, bölge?].
export const URETILEN={
${lines.join(",\n")}
};
`);
console.log("→ js/veri/seviye-listesi.js yazıldı");
