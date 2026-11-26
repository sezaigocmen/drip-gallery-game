// veri/sablon.js · A5: geçici tablo şablonu. A6'da her seviyenin gerçek tablosu çizilene kadar kullanılır.
// Tablo alanı (312 × 168) bölge sayısına göre hücrelere bölünür: 1–3 bölge tek sıra, 4–6 bölge iki sıra.
// Her hücre: d = SVG yolu (hafif titrek kenarlı yuvarlak dikdörtgen), cx/cy = rozetin yeri.
const W = 312, H = 168, PAD = 12, GAP = 9;
function blob(x, y, w, h, k) {
  const r = Math.min(14, w / 4, h / 4), j = i => ((k * 37 + i * 53) % 7 - 3) * .6; /* sabit, rastgele görünen titreme */
  return `M${x + r} ${y + j(1)} C${x + w * .35} ${y - 2 + j(2)} ${x + w * .65} ${y + 2 + j(3)} ${x + w - r} ${y + j(4)} Q${x + w} ${y} ${x + w + j(5)} ${y + r}`
    + ` C${x + w + 2 + j(6)} ${y + h * .4} ${x + w - 2 + j(7)} ${y + h * .6} ${x + w + j(8)} ${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h + j(9)}`
    + ` C${x + w * .6} ${y + h + 2 + j(10)} ${x + w * .4} ${y + h - 2 + j(11)} ${x + r} ${y + h + j(12)} Q${x} ${y + h} ${x + j(13)} ${y + h - r}`
    + ` C${x - 2 + j(14)} ${y + h * .6} ${x + 2 + j(15)} ${y + h * .4} ${x + j(16)} ${y + r} Q${x} ${y} ${x + r} ${y + j(1)} Z`;
}
export function sablonCells(n) {
  const rows = n <= 3 ? [n] : [Math.ceil(n / 2), Math.floor(n / 2)], out = [];
  const rh = (H - 2 * PAD - GAP * (rows.length - 1)) / rows.length;
  rows.forEach((k, ri) => { const cw = (W - 2 * PAD - GAP * (k - 1)) / k;
    for (let i = 0; i < k; i++) { const x = PAD + i * (cw + GAP), y = PAD + ri * (rh + GAP);
      out.push({ d: blob(+x.toFixed(1), +y.toFixed(1), +cw.toFixed(1), +rh.toFixed(1), out.length + n), cx: Math.round(x + cw / 2), cy: Math.round(y + rh / 2), x, y, w: cw, h: rh }); } });
  return out;
}
