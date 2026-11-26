// araclar/cozucu.mjs · A5 adım 2: seviye çözücü (Node, tarayıcısız).
// Bütün hamle ağacını genişlikte arama (BFS) ile tarar. Hız için kuralların sıkıştırılmış bir kopyasını kullanır
// (her tüp bir metin: "RRYB"); bu kopyanın oyunun gerçek kural koduyla (motor/kurallar.js) birebir aynı sonucu verdiği
// test/cozucu-test.mjs'te rastgele binlerce hamleyle denenir.
// Verdiği bilgiler:
//   min     en kısa çözüm (hamle; bölge seçimi ayrı hamle sayılmaz, oyundaki gibi)
//   states  ulaşılabilen farklı tahta durumu
//   fatal   ölümcül hamle oranı: hâlâ çözülebilir bir tahtada yapılabilecek hamlelerin yüzde kaçı tahtayı çözülemez yapıyor
//   path    en kısa çözüm [[kaynak, hedef, seçilen bölge?], …]
import { CAP, MIXER, mixOf } from "../js/veri/renkler.js";

/* tek harfli renk kodu (PK, CR, LB iki harfli) */
export const TO1 = { R: "R", Y: "Y", B: "B", O: "O", G: "G", P: "P", W: "W", PK: "K", CR: "C", LB: "L" };
export const FROM1 = Object.fromEntries(Object.entries(TO1).map(([k, v]) => [v, k]));
const MIX1 = {}; for (const a of MIXER) for (const b of MIXER) { const m = mixOf(a, b); if (m) MIX1[TO1[a] + TO1[b]] = TO1[m]; }

/* seviye → çözücü modeli */
export function model(level) {
  const R = level.regions, ids = R.map(r => r.id);
  return { need: R.map(r => TO1[r.need]), tape: R.map(r => r.tape ? ids.indexOf(r.tape) : -1), ids, full: (1 << R.length) - 1 };
}
const isOpen = (M, p, i) => !(p >> i & 1) && (M.tape[i] < 0 || (p >> M.tape[i] & 1));

/* paint (kurallar.js paint ile aynı): bölge boyanır, sonra raftaki kutular sırayla açık bölgelere gider */
function paintM(M, p, shelf, i) {
  p |= 1 << i; let moved = true;
  while (moved) { moved = false;
    for (let k = 0; k < shelf.length; k++) { const c = shelf[k];
      const t = M.need.findIndex((n, j) => n === c && isOpen(M, p, j));
      if (t >= 0) { shelf = shelf.slice(0, k) + shelf.slice(k + 1); p |= 1 << t; moved = true; break; } } }
  return [p, shelf];
}
/* tek hamle: kaynak a → hedef b. Dönen: geçersizse null, yoksa olası sonuç durumları [{T,p,shelf,pick}] */
export function step(M, st, a, b) {
  const src = st.T[a], dst = st.T[b];
  if (a === b || !src.length || dst.length >= CAP) return null;
  const c = src[src.length - 1]; let n = 0; for (let i = src.length - 1; i >= 0 && src[i] === c; i--) n++;
  const top = dst[dst.length - 1]; let nsrc, ndst;
  if (!dst.length || top === c) { const k = Math.min(n, CAP - dst.length); nsrc = src.slice(0, src.length - k); ndst = dst + c.repeat(k); }
  else { const m = MIX1[c + top]; if (!m) return null; nsrc = src.slice(0, -1); ndst = dst.slice(0, -1) + m + m; }
  const T = st.T.slice(); T[a] = nsrc; T[b] = ndst;
  /* settle (kurallar.js settle ile aynı) */
  if (ndst.length !== CAP || ndst !== ndst[0].repeat(CAP)) return [{ T, p: st.p, shelf: st.shelf }];
  const col = ndst[0], open = []; M.need.forEach((x, i) => { if (x === col && isOpen(M, st.p, i)) open.push(i); });
  if (open.length === 1) { T[b] = ""; const [p, shelf] = paintM(M, st.p, st.shelf, open[0]); return [{ T, p, shelf }]; }
  if (open.length > 1) return open.map(i => { const T2 = T.slice(); T2[b] = ""; const [p, shelf] = paintM(M, st.p, st.shelf, i); return { T: T2, p, shelf, pick: i }; });
  if (M.need.some((x, i) => x === col && !(st.p >> i & 1)) && st.shelf.length < 2) { T[b] = ""; return [{ T, p: st.p, shelf: st.shelf + col }]; }
  return [{ T, p: st.p, shelf: st.shelf }];
}
const keyOf = st => st.T.slice().sort().join("|") + "#" + st.p + "#" + [...st.shelf].sort().join("");
const homog = t => t.length > 0 && t === t[0].repeat(t.length);
export const startOf = level => ({ T: level.start.tubes.map(t => t.map(c => TO1[c]).join("")), p: 0, shelf: "" });

/* Tam tarama: bütün durumlar (küçük tahtalar ve test için; ölümcül oranı kesin) */
export function solveFull(level, { maxStates = 3_000_000 } = {}) {
  const M = model(level), s0 = startOf(level);
  const idx = new Map([[keyOf(s0), 0]]), S = [s0], parent = [-1], pmove = [null], dist = [0], E = [];
  let goal = -1, capped = false;
  for (let i = 0; i < S.length; i++) {
    const s = S[i], e = []; E.push(e);
    if (s.p === M.full) { if (goal < 0) goal = i; continue; }
    const n = s.T.length;
    for (let a = 0; a < n; a++) { if (!s.T[a].length) continue;
      for (let b = 0; b < n; b++) { if (a === b || (!s.T[b].length && homog(s.T[a]))) continue;
        const res = step(M, s, a, b); if (!res) continue;
        for (const s2 of res) { const k = keyOf(s2); let j = idx.get(k);
          if (j === undefined) { if (S.length >= maxStates) { capped = true; continue; }
            j = S.length; idx.set(k, j); S.push(s2); parent.push(i); pmove.push(s2.pick != null ? [a, b, M.ids[s2.pick]] : [a, b]); dist.push(dist[i] + 1); }
          e.push(j); } } }
  }
  /* çözüme ulaşabilen durumlar (geriye doğru) */
  const rev = S.map(() => []); E.forEach((e, i) => e.forEach(j => rev[j].push(i)));
  const good = new Uint8Array(S.length), q = [];
  S.forEach((s, i) => { if (s.p === M.full) { good[i] = 1; q.push(i); } });
  while (q.length) { const j = q.pop(); for (const i of rev[j]) if (!good[i]) { good[i] = 1; q.push(i); } }
  let mv = 0, bad = 0; E.forEach((e, i) => { if (good[i] && S[i].p !== M.full) for (const j of e) { mv++; if (!good[j]) bad++; } });
  const path = []; if (goal >= 0) for (let i = goal; parent[i] >= 0; i = parent[i]) path.unshift(pmove[i]);
  return { solvable: goal >= 0, min: goal >= 0 ? dist[goal] : null, states: S.length, fatal: mv ? +(bad / mv).toFixed(3) : 0, path, capped };
}


/* ---------- Büyük tahtalar için: A* (en kısa çözüm) + hafızalı derinlik araması (çözülebilir mi?) ---------- */
const SECONDARY = new Set(["O", "G", "P", "K", "C", "L"]);
/* alt sınır: kalan her tüp tamamlama ayrı bir hamle; ara renk/açık ton için gereken karışım da hamle; bir hamle tek renge yarar */
function hOf(M, st) {
  const k = {}; M.need.forEach((c, i) => { if (!(st.p >> i & 1)) k[c] = (k[c] || 0) + 1; });
  for (const c of st.shelf) if (k[c]) k[c]--;
  let h = 0;
  for (const c in k) { if (!k[c]) continue; let need = k[c];
    if (SECONDARY.has(c)) { let L = 0; for (const t of st.T) for (const x of t) if (x === c) L++; need = Math.max(need, Math.ceil(Math.max(0, 4 * k[c] - L) / 2)); }
    h += need; }
  return h;
}
function* moves(M, s) {
  const n = s.T.length;
  for (let a = 0; a < n; a++) { if (!s.T[a].length) continue;
    for (let b = 0; b < n; b++) { if (a === b || (!s.T[b].length && homog(s.T[a]))) continue;
      const res = step(M, s, a, b); if (res) for (const s2 of res) yield [s2.pick != null ? [a, b, M.ids[s2.pick]] : [a, b], s2]; } }
}
/* çözülebilir mi? (paylaşılan hafıza: aynı tahta iki kez aranmaz) */
function makeCan(M, cap) {
  const memo = new Map(); let budget = 0;
  const go = s => { const k = keyOf(s); const m = memo.get(k); if (m !== undefined) return m;
    if (s.p === M.full) { memo.set(k, true); return true; }
    if (--budget < 0) return null; /* bütçe bitti: bilinmiyor */
    memo.set(k, false); /* döngüye karşı geçici */
    const next = [...moves(M, s)].map(x => x[1]).sort((x, y) => hOf(M, x) - hOf(M, y));
    let unknown = false;
    for (const s2 of next) { const r = go(s2); if (r === true) { memo.set(k, true); return true; } if (r === null) unknown = true; }
    if (unknown) { memo.delete(k); return null; }
    return false; };
  return s => { budget = cap; return go(s); };
}
const fromKey = k => { const [T, p, shelf] = k.split("#"); return { T: T.split("|"), p: +p, shelf }; };
export function solve(level, { maxStates = 150_000, samples = 6, dfsBudget = 400_000, probeBudget = 8_000 } = {}) {
  const T0 = Date.now(), ms = {};
  const M = model(level), s0 = startOf(level);
  /* 1) çözülebilir mi? (hızlı derinlik araması; çözülemeyen tahta A* aramasına hiç girmez) */
  const can = makeCan(M, dfsBudget), ok0 = can(s0);
  if (ok0 !== true) return { solvable: ok0 === false ? false : null, min: null, states: 0, fatal: null, path: [], capped: ok0 === null };
  /* 2) A*: f = g + w·h, kova kuyruğu; bellek için sadece anahtarlar saklanır (anahtar = tahta).
        Önce kesin (w = 1); tahta çok büyükse ağırlıklı (w > 1): hızlı, çözüm en kısaya çok yakın ama kesin değil. */
  const astar = (w, cap) => {
    const k0 = keyOf(s0), g = new Map([[k0, 0]]), par = new Map([[k0, null]]), B = []; let n = 0;
    const F = (gg, s) => Math.round((gg + w * hOf(M, s)) * 4);
    (B[F(0, s0)] ||= []).push(k0);
    let f = 0; /* en düşük dolu kova (ağırlıklı aramada f geri düşebilir) */
    while (true) { while (f < B.length && !(B[f] && B[f].length)) f++; if (f >= B.length) break;
      const k = B[f].pop(), s = fromKey(k), gs = g.get(k);
      if (F(gs, s) !== f) continue; /* eski kayıt */
      if (s.p === M.full) return { found: k, par, n };
      if (++n > cap) return { found: null, par, n };
      for (const [, s2] of moves(M, s)) { const k2 = keyOf(s2), g2 = gs + 1, o = g.get(k2);
        if (o === undefined || g2 < o) { g.set(k2, g2); par.set(k2, [k]); const i = F(g2, s2); (B[i] ||= []).push(k2); if (i < f) f = i; } } }
    return { found: null, par, n };
  };
  ms.dfs = Date.now() - T0;
  let A = astar(1, maxStates), exact = true;
  for (const w of [1.5, 2.5, 4]) { if (A.found) break; exact = false; A = astar(w, maxStates); }
  if (!A.found) return { solvable: true, min: null, states: A.n, fatal: null, path: [], capped: true };
  const found = A.found, par = A.par, n = A.n;
  /* A* sıralı tüplerle çalışır; çözüm yolu gerçek tüp sırasıyla yeniden oynanarak bulunur */
  const keys = []; for (let k = found; par.get(k); k = par.get(k)[0]) keys.unshift(k);
  const path = [], line = [s0];
  for (const k of keys) { const hit = [...moves(M, line.at(-1))].find(([, s2]) => keyOf(s2) === k); path.push(hit[0]); line.push(hit[1]); }
  /* ölümcül hamle oranı: çözüm yolundaki ve rastgele "iyi" yürüyüşlerdeki tahtalarda, hamlelerin yüzde kaçı tahtayı çözülemez yapıyor */
  ms.astar = Date.now() - T0 - ms.dfs;
  const canP = makeCan(M, probeBudget); let tot = 0, bad = 0, unk = 0;
  const probe = s => { const nx = [...moves(M, s)]; const ok = [];
    for (const [, s2] of nx) { const r = canP(s2); if (r === null) { unk++; continue; } tot++; if (!r) bad++; else ok.push(s2); } return ok; };
  line.slice(0, -1).forEach(probe);
  let sd = path.length * 31 + 7; const rnd = () => (sd = (sd * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let w = 0; w < samples; w++) { let s = s0; for (let d = 0; d < 60 && s.p !== M.full; d++) { const ok = probe(s); if (!ok.length) break; s = ok[Math.floor(rnd() * ok.length)]; } }
  return { solvable: true, min: path.length, exact, states: n, fatal: tot ? +(bad / tot).toFixed(3) : 0, path, capped: false, unknown: unk, ms: { ...ms, fatal: Date.now() - T0 - ms.dfs - ms.astar } };
}

/* Doğrudan çalıştırılırsa: oyundaki seviyeleri çöz.  node araclar/cozucu.mjs */
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const { LEVELS } = await import("../js/veri/seviyeler.js");
  for (const lv of Object.keys(LEVELS).map(Number).sort((a, b) => a - b)) {
    const L = LEVELS[lv]; if (!L.regions) continue;
    const t0 = Date.now(), r = solve(L);
    console.log(`Sv ${String(lv).padStart(2)} · ${r.solvable ? "çözülür" : "ÇÖZÜLMEZ"} · en kısa ${r.min} · ${r.states} durum · ölümcül hamle %${Math.round(r.fatal * 100)} · ${Date.now() - t0} ms${r.capped ? " · SINIRA TAKILDI" : ""}`);
  }
}
