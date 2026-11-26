// cizim/marka.js · Drip Gallery · logo (A7.4 · 1 A Oyuncak boya) ve uygulama ikonu (A7.4 · 2 A Damlayan D)
// İkisi de SVG'yi DOM üzerinde kurar: harf ölçüleri (damla yerleri) yazı tipi yüklendikten sonra ölçülür.
// Kullanan yerler: açılış ekranı (akis.js), ikon/favicon üretici (araclar/ikon-uret.mjs), seçenek sayfaları (10-arayuz/a74-*.html).
const NS = "http://www.w3.org/2000/svg", INK = "#3D220E";
const C = { R: "#D9472F", Y: "#EDB83A", B: "#2E64B0", G: "#4E9A4A" };
export const MARKA_FONTLAR = ["700 150px Fredoka", "900 36px Nunito"];
export const fontlarHazir = () => Promise.all(MARKA_FONTLAR.map(f => document.fonts.load(f))).catch(() => {});

function el(t, a, p) { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
/* Damla: üstte gövde, altta biraz şişkin uç */
export function damlaYolu(x, y, w, len) { const r = w / 2, R = w * .62, yb = y + len;
  return `M${x - r},${y} V${yb - R} C${x - r},${yb - R * .4} ${x - R},${yb - R * .5} ${x - R},${yb} A${R},${R} 0 0 0 ${x + R},${yb} C${x + R},${yb - R * .5} ${x + r},${yb - R * .4} ${x + r},${yb - R} V${y} Z`; }
let uid = 0;

/* Yazı logosu. svg boş bir <svg> olmalı ve belgeye bağlı olmalı (ölçüm için). opt.damlaGecikme: ilk damlanın gecikmesi (sn). */
export function logoCiz(svg, opt = {}) {
  svg.innerHTML = ""; const id = "dgw" + (++uid), g0 = opt.damlaGecikme ?? .15;
  el("defs", {}, svg).innerHTML = `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D99556"/><stop offset="1" stop-color="#BB783B"/></linearGradient>`;
  const root = el("g", {}, svg), cols = [C.R, C.Y, C.B, C.G];
  const lev = el("g", { class: "lg-levha" }, root), shadow = el("g", { transform: "translate(0,8)" }, root), strokes = el("g", {}, root), fills = el("g", {}, root), shine = el("g", {}, root);
  const yaz = (p, fill, stroke) => { const t = el("text", { x: 0, y: 150, "font-family": "Fredoka", "font-weight": 700, "font-size": 150, "letter-spacing": 2,
      ...(stroke ? { stroke: INK, "stroke-width": 16, "stroke-linejoin": "round", fill: INK } : {}) }, p);
    "Drip".split("").forEach((c, i) => { el("tspan", { fill: fill || cols[i] }, t).textContent = c; }); return t; };
  yaz(shadow, INK, true); yaz(strokes, INK, true);
  const tf = yaz(fills, null, false), tw = tf.getBBox();
  /* damlalar: D (iki), r, p'nin göbeği · [harf, harf içindeki yer, kalınlık, boy] */
  [[0, .3, 13, 62], [1, .26, 12, 48], [0, .66, 11, 34], [3, .76, 11, 30]].forEach(([i, f, w, l], n) => {
    const b = tf.getExtentOfChar(i), x = b.x + b.width * f, y = 126, dl = { class: "drip", style: `animation-delay:${(g0 + n * .13).toFixed(2)}s` }, k = { stroke: INK, "stroke-width": 16, "stroke-linejoin": "round" };
    el("path", { d: damlaYolu(x, y, w, l), fill: INK, ...k, ...dl }, shadow); el("path", { d: damlaYolu(x, y, w, l), fill: INK, ...k, ...dl }, strokes);
    el("path", { d: damlaYolu(x, y, w, l), fill: cols[i], ...dl }, fills); el("path", { d: damlaYolu(x - w * .18, y + l - 2, w * .16, 6), fill: "rgba(255,255,255,.65)", ...dl }, shine); });
  const lw = tw.width + 24, lx = tw.x - 12, ly = 200;
  el("rect", { x: lx, y: ly + 6, width: lw, height: 58, rx: 16, fill: INK }, lev);
  el("rect", { x: lx, y: ly, width: lw, height: 58, rx: 16, fill: `url(#${id})`, stroke: INK, "stroke-width": 6 }, lev);
  el("rect", { x: lx + 8, y: ly + 6, width: lw - 16, height: 6, rx: 3, fill: "rgba(255,230,190,.55)" }, lev);
  el("text", { x: tw.x + tw.width / 2, y: ly + 43, "text-anchor": "middle", "font-family": "Nunito", "font-weight": 900, "font-size": 36, "letter-spacing": 9, fill: "#fff",
    stroke: INK, "stroke-width": 7, "stroke-linejoin": "round", "paint-order": "stroke" }, lev).textContent = "GALLERY";
  const b = root.getBBox(), p = 14; svg.setAttribute("viewBox", `${b.x - p} ${b.y - p} ${b.width + p * 2} ${b.height + p * 2}`);
  svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Drip Gallery");
  return svg;
}

/* Uygulama ikonu: 1024 × 1024 kare (köşeleri telefon yuvarlar). opt.zemin=false → saydam zemin (favicon için). */
export function ikonCiz(svg, opt = {}) {
  svg.innerHTML = ""; svg.setAttribute("viewBox", "0 0 1024 1024"); const id = "dgi" + (++uid);
  const katman = (shapes, sw, dy) => { const sh = el("g", { transform: `translate(0,${dy})` }, svg), st = el("g", {}, svg), fi = el("g", {}, svg);
    shapes.forEach(s => [[sh, INK, 1], [st, INK, 1], [fi, s.fill, 0]].forEach(([g, f, k]) => { el(s.t, { ...s.a, fill: f, ...(k ? { stroke: INK, "stroke-width": sw, "stroke-linejoin": "round" } : {}) }, g).textContent = s.txt || ""; }));
    return fi; };
  if (opt.zemin !== false) {
    el("defs", {}, svg).innerHTML = `<radialGradient id="${id}" cx=".5" cy=".4" r=".85"><stop offset="0" stop-color="#FFF3DC"/><stop offset=".5" stop-color="#F6E2BE"/><stop offset="1" stop-color="#EBCB98"/></radialGradient>`;
    el("rect", { width: 1024, height: 1024, fill: `url(#${id})` }, svg);
    el("rect", { y: 836, width: 1024, height: 14, fill: "#C98E55" }, svg); el("rect", { y: 850, width: 1024, height: 174, fill: "#A86B39" }, svg);
  }
  const A = { x: 512, y: 670, "text-anchor": "middle", "font-family": "Fredoka", "font-weight": 700, "font-size": 600 };
  const probe = el("text", A, svg); probe.textContent = "D"; const b = probe.getBBox(); probe.remove();
  const d = (f, w, l) => ({ t: "path", fill: C.R, a: { d: damlaYolu(b.x + b.width * f, 600, w, l) } });
  const fi = katman([{ t: "text", txt: "D", fill: C.R, a: A }, d(.24, 56, 190), d(.5, 46, 120), d(.76, 48, 80)], 56, 30);
  el("ellipse", { cx: b.x + b.width * .3, cy: 250, rx: 46, ry: 22, fill: "rgba(255,255,255,.55)", transform: `rotate(-20 ${b.x + b.width * .3} 250)` }, fi);
  [[.24, 190], [.5, 120], [.76, 80]].forEach(([f, l]) => el("ellipse", { cx: b.x + b.width * f - 12, cy: 600 + l - 6, rx: 9, ry: 14, fill: "rgba(255,255,255,.6)" }, fi));
  if (opt.damlacik !== false) katman([[C.Y, 770, 230, 36], [C.B, 836, 300, 28], [C.G, 782, 370, 24]].map(([c, x, y, r]) => ({ t: "path", fill: c,
    a: { d: `M${x},${y - r * 2.1} C${x + r * .5},${y - r * 1.2} ${x + r},${y - r * .6} ${x + r},${y} A${r},${r} 0 0 1 ${x - r},${y} C${x - r},${y - r * .6} ${x - r * .5},${y - r * 1.2} ${x},${y - r * 2.1}Z` } })), 22, 10);
  svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Drip Gallery");
  return svg;
}

/* Favicon (A7.4 · 3 B Sadece D): zeminsiz D + damlalar, renkli damlacık yok; kareye en büyük hâliyle sığar. */
export function faviconCiz(svg) {
  ikonCiz(svg, { zemin: false, damlacik: false });
  const b = svg.getBBox(), p = 30, w = Math.max(b.width, b.height) + p * 2;
  svg.setAttribute("viewBox", `${b.x + b.width / 2 - w / 2} ${b.y - p} ${w} ${w}`);
  return svg;
}
