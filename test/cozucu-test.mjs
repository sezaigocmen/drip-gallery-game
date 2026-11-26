// test/cozucu-test.mjs · Çözücünün hızlı kural kopyası, oyunun gerçek kural koduyla aynı mı?
// Rastgele tahtalarda binlerce rastgele hamle: her hamlede iki motorun sonucu (tüpler, boyanan bölgeler, raf, seçim) karşılaştırılır.
// Çalıştırma (oyun klasöründen): node test/cozucu-test.mjs
import { LEVELS } from "../js/veri/seviyeler.js";
import { clone, pour, paint } from "../js/motor/kurallar.js";
import { model, step, startOf, solve, TO1, FROM1 } from "../araclar/cozucu.mjs";

let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = a => a[Math.floor(rnd() * a.length)];
const COLS = ["R", "Y", "B", "W", "O", "G", "P", "PK"];
const enc = s => ({ T: s.tubes.map(t => t.map(c => TO1[c]).join("")), shelf: s.shelf.map(c => TO1[c]).join("") });

let checks = 0, errors = 0;
for (let g = 0; g < 300; g++) {
  /* rastgele seviye: 2–5 bölge, bazıları bantlı; 3–6 tüp */
  const nr = 2 + Math.floor(rnd() * 4), regions = [];
  for (let i = 0; i < nr; i++) regions.push({ id: "r" + i, need: pick(COLS), ...(i > 0 && rnd() < .35 ? { tape: "r" + Math.floor(rnd() * i) } : {}) });
  const nt = 3 + Math.floor(rnd() * 4), tubes = [];
  for (let i = 0; i < nt; i++) { const L = Math.floor(rnd() * 5); tubes.push(Array.from({ length: L }, () => pick(COLS.slice(0, 4).concat(regions.map(r => r.need))))); }
  LEVELS[8888] = { regions, spot: {}, start: { tubes, moves: 999 } };
  const M = model(LEVELS[8888]);
  let s = { lv: 8888, tubes: clone(tubes), painted: {}, shelf: [], moves: 999 }, f = startOf(LEVELS[8888]);
  for (let k = 0; k < 40; k++) {
    const a = Math.floor(rnd() * nt), b = Math.floor(rnd() * nt);
    const r1 = pour(s, a, b), r2 = step(M, f, a, b); checks++;
    if (!r1 !== !r2) { errors++; console.log("✗ geçerlilik farklı", JSON.stringify(s.tubes), a, b); break; }
    if (!r1) continue;
    let ns = r1.s;
    if (r1.ev.choice) { /* oyuncu bir bölge seçer: aynısını iki motorda da seç */
      const opts = r1.ev.choice.options, want = r2.map(x => M.ids[x.pick]).sort().join();
      if (opts.slice().sort().join() !== want) { errors++; console.log("✗ seçim seçenekleri farklı"); break; }
      const id = pick(opts); ns = clone(r1.s); ns.tubes[b] = []; paint(ns, id, { painted: [], untaped: [] });
      f = r2.find(x => M.ids[x.pick] === id);
    } else { if (r2.length !== 1) { errors++; console.log("✗ seçim beklenmiyordu"); break; } f = r2[0]; }
    s = ns;
    const e = enc(s), p = M.ids.reduce((m, id, i) => m | (s.painted[id] ? 1 << i : 0), 0);
    if (JSON.stringify(e.T) !== JSON.stringify(f.T) || e.shelf !== f.shelf || p !== f.p) { errors++; console.log("✗ durum farklı", JSON.stringify({ e, p, f })); break; }
  }
}
delete LEVELS[8888];
console.log(`${checks} hamle karşılaştırıldı · ${errors ? errors + " FARK ✗" : "hepsi aynı ✓"}`);

/* Bilinen tahtalar: demo seviyesi çözülmeli; açıkça çözülemez bir tahta çözülemez çıkmalı */
/* eski demo tahtası (Göl evi, A4): en kısa çözümü elle de doğrulanmış 11 hamle */
const DEMO = { regions: LEVELS[11].regions, start: { tubes: [["Y","R","B","R"],["B","R","Y","B"],["R","B","B","R"],["B","B","R","B"],[],[]] } };
const demo = solve(DEMO);
console.log(`${demo.solvable && demo.min === 11 ? "✓" : "✗"} demo tahtası (Göl evi) çözülür, en kısa 11 hamle (bulunan: ${demo.min})`);
const imp = solve({ regions: [{ id: "a", need: "O" }], start: { tubes: [["R", "R", "R", "R"], ["Y", "Y", "Y", "Y"]] } });
console.log(`${!imp.solvable ? "✓" : "✗"} boş yeri olmayan tahta çözülemez`);
/* çözüm yolu oyunun gerçek kurallarıyla oynanınca seviye kazanılmalı */
let s = { lv: 11, tubes: clone(DEMO.start.tubes), painted: {}, shelf: [], moves: 99 }, okPath = true;
for (const [a, b, id] of demo.path) { const r = pour(s, a, b); if (!r) { okPath = false; break; } s = r.s;
  if (r.ev.choice) { if (!id) { okPath = false; break; } s.tubes[b] = []; paint(s, id, { painted: [], untaped: [] }); } }
const allPainted = LEVELS[11].regions.every(r => s.painted[r.id]);
console.log(`${okPath && allPainted ? "✓" : "✗"} çözüm yolu gerçek kurallarla oynanınca tablo biter`);
process.exit(errors || !demo.solvable || demo.min !== 11 || imp.solvable || !(okPath && allPainted) ? 1 : 0);
