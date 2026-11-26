// cizim/parcacik.js · A9 (26.11.2026). Küçük parçacık motoru: DOM + SVG, tek requestAnimationFrame döngüsü.
// Kullanım: patlat(kap, [{x,y,vx,vy,...}]) → Promise (hepsi bitince). Koordinatlar kap'a göre px; hızlar px/sn.
// Parçacık: x,y · vx,vy · g (yerçekimi px/sn²) · drag (0..1 sn başına hız kaybı) · life (sn) · delay (sn)
//   r (başlangıç açısı °), vr (°/sn) · s0→s1 (ölçek, ease-out) · a0→a1 (opaklık, son %fade kısmında) · fade (0..1, varsayılan .35)
//   sway {a: px, f: Hz} yanlara salınım (kâğıt konfeti) · flip f (Hz, kâğıdın dönüp yassılaşması) · html (SVG/HTML) · w,h (kutu)
// "Hareketleri azalt" kararı çağıranda: azaltılmışsa patlat çağrılmaz (bkz. akis.js azalt()).

let aktif = new Map(); /* kap → {katman, list} */
let calisiyor = false;
let olcek = 1; /* test/inceleme: ağır çekim (2 = iki kat yavaş) */
export const zamanOlcegi = k => { olcek = k > 0 ? k : 1; };

function katman(kap) {
  let k = aktif.get(kap);
  if (k && k.el.isConnected) return k;
  const el = document.createElement("div"); el.className = "pfx";
  el.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;z-index:20;pointer-events:none";
  kap.appendChild(el); k = { el, list: [] }; aktif.set(kap, k); return k;
}

export function patlat(kap, parts) {
  if (!kap || !parts.length) return Promise.resolve();
  const k = katman(kap), t0 = performance.now();
  const sozler = parts.map(p => new Promise(bitti => {
    const el = document.createElement("i"), w = p.w || 12, h = p.h || w;
    el.style.cssText = `position:absolute;left:${-w / 2}px;top:${-h / 2}px;width:${w}px;height:${h}px;display:block;opacity:0;will-change:transform,opacity`;
    el.innerHTML = p.html || ""; k.el.appendChild(el);
    k.list.push({ ...p, el, t0: t0 + (p.delay || 0) * 1000 * olcek,x0: p.x, y0: p.y, bitti });
  }));
  if (!calisiyor) { calisiyor = true; requestAnimationFrame(adim); }
  return Promise.all(sozler);
}

const eo = t => 1 - Math.pow(1 - t, 3);
function adim(now) {
  let kalan = 0;
  for (const [kap, k] of aktif) {
    if (!k.el.isConnected) { k.list.forEach(p => p.bitti()); aktif.delete(kap); continue; }
    k.list = k.list.filter(p => {
      const t = (now - p.t0) / 1000 / olcek;
      if (t < 0) return true;
      const life = p.life || 1;
      if (t >= life) { p.el.remove(); p.bitti(); return false; }
      /* konum: sürtünmeli hız + yerçekimi (kapalı form, kare hızından bağımsız) */
      const d = p.drag || 0, g = p.g || 0;
      let x, y;
      if (d > 0) { const k2 = -Math.log(1 - Math.min(d, .99)), e = (1 - Math.exp(-k2 * t)) / k2; x = p.x0 + (p.vx || 0) * e; y = p.y0 + (p.vy || 0) * e + .5 * g * t * t; }
      else { x = p.x0 + (p.vx || 0) * t; y = p.y0 + (p.vy || 0) * t + .5 * g * t * t; }
      if (p.sway) x += Math.sin(t * p.sway.f * 6.283 + (p.sway.ph || 0)) * p.sway.a;
      const u = t / life, s0 = p.s0 ?? 1, s1 = p.s1 ?? s0, sc = s0 + (s1 - s0) * eo(Math.min(1, u / (p.grow || 1)));
      const fade = p.fade ?? .35, a0 = p.a0 ?? 1, a = u < 1 - fade ? a0 : a0 * (1 - (u - (1 - fade)) / fade);
      const r = (p.r || 0) + (p.vr || 0) * t, fy = p.flip ? Math.cos(t * p.flip * 6.283) : 1;
      p.el.style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${sc},${sc * fy})`;
      p.el.style.opacity = Math.max(0, Math.min(1, a));
      return true;
    });
    kalan += k.list.length;
    if (!k.list.length) { k.el.remove(); aktif.delete(kap); }
  }
  if (kalan) requestAnimationFrame(adim); else calisiyor = false;
}

/* ---------- şekiller (guaj paletiyle uyumlu, kontursuz) ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
/* Boya damlası: hafif düzensiz yuvarlak + üstte küçük ışık */
export function damla(renk) {
  const n = 9, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * 6.283, r = 10 * rnd(.82, 1.08); pts.push([12 + Math.cos(a) * r, 12 + Math.sin(a) * r]); }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) { const p = pts[(i + 1) % n], q = pts[i], mx = (q[0] + p[0]) / 2, my = (q[1] + p[1]) / 2; d += ` Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`; }
  return `<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;overflow:visible"><path d="${d}Z" fill="${renk}"/><ellipse cx="9" cy="8.5" rx="3" ry="2" fill="#fff" opacity=".45"/></svg>`;
}
/* Guaj lekesi: damla + çevresinde iki küçük sıçrantı (tüp tamamlandı) */
export function leke(renk) {
  return `<svg viewBox="0 0 30 30" width="100%" height="100%" style="display:block;overflow:visible"><path d="M15 3 C21 4 27 9 26 15 C27 21 21 27 15 26 C9 28 3 22 4 15 C2 9 8 2 15 3Z" fill="${renk}"/><circle cx="27" cy="5" r="2.4" fill="${renk}"/><circle cx="3" cy="26" r="1.8" fill="${renk}"/><ellipse cx="11" cy="10" rx="4" ry="2.6" fill="#fff" opacity=".35"/></svg>`;
}
/* Parıltı: 4 kollu yıldız */
export function parilti(renk = "#FFF6C9", kenar = "#FFC21A") {
  return `<svg viewBox="0 0 24 24" width="100%" height="100%" style="display:block;overflow:visible"><path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill="${renk}" stroke="${kenar}" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
}
/* Kâğıt konfeti: küçük dikdörtgen */
export function kagit(renk) {
  return `<svg viewBox="0 0 10 14" width="100%" height="100%" style="display:block"><rect width="10" height="14" rx="1.5" fill="${renk}"/><rect width="10" height="4" fill="#fff" opacity=".25"/></svg>`;
}
/* Halka: genişleyen ince çember (dalga, parlama) */
export function halka(renk = "#fff", kalin = 2) {
  return `<svg viewBox="0 0 40 40" preserveAspectRatio="none" width="100%" height="100%" style="display:block;overflow:visible"><ellipse cx="20" cy="20" rx="19" ry="19" fill="none" stroke="${renk}" stroke-width="${kalin}" vector-effect="non-scaling-stroke"/></svg>`;
}
export { rnd };
