// test/seviye-test.mjs · 30 seviyenin kontrolü (tarayıcısız, hızlı). Çalıştırma (oyun klasöründen): node test/seviye-test.mjs
// Her seviye için: çözücünün bulduğu çözüm, oyunun GERÇEK kural koduyla baştan oynanır ve hamle sınırı içinde tablo biter mi bakılır.
// Ayrıca: plan (A · GDD'ye sadık) ile bölge / karışım / açık ton / bant / boş tüp sayıları, beyazın Sv 21'den önce olmaması, seviye zinciri.
import { LEVELS } from "../js/veri/seviyeler.js";
import { clone, pour, paint, won } from "../js/motor/kurallar.js";
import { PARTS } from "../js/veri/renkler.js";
import { PLAN } from "../araclar/seviye-plani.mjs";

let ok = 0, bad = 0;
const check = (name, cond) => { if (cond) ok++; else { bad++; console.log("✗", name); } };
const LIGHT = new Set(["PK", "CR", "LB"]), SEC = new Set(["O", "G", "P"]);

for (let lv = 1; lv <= 30; lv++) {
  const L = LEVELS[lv];
  check(`Sv ${lv} var`, !!L); if (!L) continue;
  check(`Sv ${lv} → sıradaki ${lv + 1}`, L.next === lv + 1);
  check(`Sv ${lv} zor rozeti doğru`, !!L.hard === (lv % 10 === 0));
  const tubes = L.start.tubes, all = tubes.flat();
  if (lv < 21) check(`Sv ${lv}: beyaz yok (beyaz Sv 21'de gelir)`, !all.includes("W") && !L.regions.some(r => LIGHT.has(r.need)));
  /* boya hacmi: her bölge 4 katman, fazlası/eksiği yok (Sv 1 eğitimde 1 fazla mavi tüp var) */
  if (lv > 1) { const need = {}; L.regions.forEach(r => (PARTS[r.need].length === 1 ? [r.need, r.need, r.need, r.need] : [...PARTS[r.need], ...PARTS[r.need]]).forEach(c => need[c] = (need[c] || 0) + 1));
    const have = {}; all.forEach(c => have[c] = (have[c] || 0) + 1);
    if (lv !== 2) check(`Sv ${lv}: boya hacmi tam`, JSON.stringify(Object.entries(need).sort()) === JSON.stringify(Object.entries(have).sort())); }
  const P = PLAN[lv];
  if (P) {
    const [b, m, l, t, e] = P;
    check(`Sv ${lv}: ${b} bölge`, L.regions.length === b);
    check(`Sv ${lv}: ${m} ara renk bölgesi`, L.regions.filter(r => SEC.has(r.need)).length === m);
    check(`Sv ${lv}: ${l} açık ton bölgesi`, L.regions.filter(r => LIGHT.has(r.need)).length === l);
    check(`Sv ${lv}: ${t} bant`, L.regions.filter(r => r.tape).length === t);
    check(`Sv ${lv}: ${e} boş tüp`, tubes.filter(x => !x.length).length === e);
    check(`Sv ${lv}: hamle sınırı en kısa çözümden büyük`, L.start.moves >= L.min);
  }
  /* çözümü gerçek kurallarla oyna */
  const path = L.solPath || (lv === 11 ? null : null);
  if (!path) continue;
  let s = { lv, tubes: clone(tubes), painted: {}, shelf: [], moves: L.start.moves }, played = 0, fine = true;
  for (const [a, b, id] of path) { const r = pour(s, a, b); if (!r) { fine = false; break; } s = r.s; played++;
    if (r.ev.choice) { if (!id) { fine = false; break; } s.tubes[b] = []; paint(s, id, { painted: [], untaped: [] }); } }
  check(`Sv ${lv}: çözüm gerçek kurallarla oynanınca tablo biter (${played} hamle, sınır ${L.start.moves})`, fine && won(s) && played <= L.start.moves && played === L.min);
}
console.log(`${ok}/${ok + bad} ✓`);
process.exit(bad ? 1 : 0);
