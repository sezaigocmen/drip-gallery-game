// test/kural-test.mjs · Motor kuralları (tarayıcısız). Çalıştırma (oyun klasöründen): node test/kural-test.mjs
import { LEVELS } from "../js/veri/seviyeler.js";
import { makeState, preview, pour, won } from "../js/motor/kurallar.js";

let ok = 0, bad = 0;
const check = (name, cond) => { if (cond) { ok++; console.log("✓", name); } else { bad++; console.log("✗", name); } };
const P = (tubes, a, b) => preview({ tubes }, a, b);

// Ana + ana (eski kural bozulmadı)
check("kırmızı → sarı = 2 turuncu", JSON.stringify(P([["R"], ["Y"]], 0, 1)) === JSON.stringify({ base: [], ghost: ["O", "O"], take: 1, mix: "O" }));
check("mavi → sarı = yeşil", P([["B"], ["Y"]], 0, 1)?.mix === "G");
check("kırmızı → mavi = mor", P([["R"], ["B"]], 0, 1)?.mix === "P");
// Ana + beyaz = açık ton, iki yönde de
check("kırmızı → beyaz = 2 pembe", JSON.stringify(P([["R"], ["W"]], 0, 1)?.ghost) === '["PK","PK"]');
check("beyaz → kırmızı = pembe", P([["W"], ["R"]], 0, 1)?.mix === "PK");
check("sarı ↔ beyaz = krem", P([["Y"], ["W"]], 0, 1)?.mix === "CR" && P([["W"], ["Y"]], 0, 1)?.mix === "CR");
check("mavi ↔ beyaz = açık mavi", P([["B"], ["W"]], 0, 1)?.mix === "LB" && P([["W"], ["B"]], 0, 1)?.mix === "LB");
check("karışımda sadece 1 katman gider", P([["W", "W"], ["R"]], 0, 1)?.take === 1);
// Beyaz + beyaz normal döküm
const ww = P([["W", "W"], ["W"]], 0, 1);
check("beyaz → beyaz normal döküm (2 katman, karışım yok)", ww?.mix === null && ww.take === 2);
// Açık ton ve ara renk tekrar karışmaz
check("pembe → beyaz geçersiz", P([["PK"], ["W"]], 0, 1) === null);
check("beyaz → pembe geçersiz", P([["W"], ["PK"]], 0, 1) === null);
check("turuncu → beyaz geçersiz", P([["O"], ["W"]], 0, 1) === null);
check("beyaz → yeşil geçersiz", P([["W"], ["G"]], 0, 1) === null);
check("pembe → pembe normal döküm", P([["PK"], ["PK"]], 0, 1)?.mix === null);
// Dolu hedefe karışım yok
check("dolu hedefe karışım yapılamaz", P([["R"], ["W", "W", "W", "W"]], 0, 1) === null);

// Uçtan uca: pembe isteyen tek bölgeli tablo, beyazla boyanır
LEVELS[901] = { name: "test", art: "meyve", regions: [{ id: "meyve", need: "PK" }], spot: { meyve: [0, 0] },
  start: { tubes: [["R", "W"], ["R", "W"], [], []], moves: 20 } };
let s = makeState(901);
const step = (a, b) => { const r = pour(s, a, b); if (!r) throw new Error(`geçersiz hamle ${a}→${b}`); s = r.s; return r.ev; };
const e1 = step(0, 2); // W → boş
const e2 = step(0, 2); // R → W = PK PK
check("akış: R üstüne beyaz sonucu tüpte 2 pembe", e2.mix === "PK" && JSON.stringify(s.tubes[2]) === '["PK","PK"]');
step(1, 3); const e4 = step(1, 3); // ikinci tüp: PK PK
step(3, 2); // PK PK → PK PK = 4 pembe → boya kutusu
check("akış: 4 pembe tüp tabloyu boyar, seviye kazanılır", won(s) && s.painted.meyve === true);
delete LEVELS[901];

console.log(`\n${ok}/${ok + bad} ✓`);
process.exit(bad ? 1 : 0);
