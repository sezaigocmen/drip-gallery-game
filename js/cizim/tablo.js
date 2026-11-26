// cizim/tablo.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { symG, symW } from "./semboller.js";
import { COL, ROZET } from "../veri/renkler.js";
import { LEVELS } from "../veri/seviyeler.js";
import { sablonCells } from "../veri/sablon.js";
import { TABLOLAR, KAGIT, CIZGI } from "../veri/tablolar.js";

/* ================= Çizim ================= */
export const P={ /* tablo şekilleri, viewBox 0 0 312 168 */
  ground:"M0 84 C70 94 120 78 170 86 C220 94 262 76 312 82 V168 H0 Z",
  gok:"M0 0 H312 V82 C262 76 220 94 170 86 C120 78 70 94 0 84 Z",
  gunes:"M226 40 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0 Z",
  gol:"M178 132 C184 116 238 110 272 117 C302 123 304 150 280 158 C246 168 196 164 182 154 C172 147 172 140 178 132 Z",
  wall:"M42 98 H112 V152 H42 Z",
  door:"M68 124 H86 V152 H68 Z",
  cati:"M30 100 L77 60 L124 100 Z",
  meyve:"M156 46 C128 32 104 56 108 90 C112 120 134 138 156 132 C178 138 200 120 204 90 C208 56 184 32 156 46 Z"
};
export function badge(x,y,c){const sw=symW(c)*1.1,w=sw+14;
  return `<g transform="translate(${x} ${y})"><rect x="${-w/2}" y="-10" width="${w}" height="20" rx="10" fill="#fff" fill-opacity=".92" stroke="${ROZET[c]}" stroke-width="2"/><g transform="translate(${-sw/2} -5.5) scale(1.1)">${symG(c,ROZET[c])}</g></g>`;}
export function regionSVG(id,c,state,opts={}){ /* state: bos | bantli | secilebilir | boyanmis */
  const d=opts.d||P[id], painted=state==="boyanmis";
  return `<g class="reg ${state==="secilebilir"?"pick":""} ${opts.just?"just":""}${opts.off?" off":""}" data-r="${id}">
    <path d="${d}" fill="var(--canvas)"/>
    <path class="fill pale" d="${d}" fill="${COL[c]}" opacity="${painted?1:.28}"/>
    ${painted?`<path d="${d}" fill="url(#brush)"/>`:""}
    <path class="outline" d="${d}" fill="none" stroke="${painted?"rgba(60,35,15,.45)":"var(--pencil)"}" stroke-width="1.4" stroke-linejoin="round"/>
    ${painted||opts.noBadge?"":badge(...(opts.spot||[60,46]),c)}
  </g>`;}
export function tapeSVG(peel){return `<g class="tape ${peel?"peel":""}"><rect x="20" y="70" width="112" height="13" fill="var(--tape)" stroke="rgba(0,0,0,.15)" transform="rotate(-13 76 76)"/><rect x="24" y="76" width="108" height="13" fill="var(--tape)" fill-opacity=".95" stroke="rgba(0,0,0,.15)" transform="rotate(11 78 82)"/></g>`;}
export const DEFS=`<defs><pattern id="brush" width="14" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><path d="M0 5 H14" stroke="#fff" stroke-opacity=".09" stroke-width="2.5"/></pattern></defs>`;
/* ================= A6 · Guaj tabloları (C stili, veri/tablolar.js) =================
   Bütün sahne titrek kenar filtresinden geçer (gj-ro), üstüne kâğıt tanesi (gj-gr). Rozetler filtresiz, net kalır.
   Boyanan bölge: tam renk + hafif hacim (gj-sh: üst açık, alt koyu) + tabloya özel ışık/gölge. (Sezai, A6: çizgili fırça deseni kaldırıldı, kâğıt tanesi .5 → .3, renkler daha canlı.)
   Aynı sayfada birden çok tablo olabilir: filtre tanımları her SVG'de aynı, id'ler ortak (ilk tanım kullanılır, hepsi eş). */
const GJDEFS=`<defs><filter id="gj-ro" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>
  <filter id="gj-gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .15  0 0 0 .55 0"/></filter>
  <linearGradient id="gj-sh" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#2A1A10" stop-opacity=".1"/></linearGradient></defs>`;
function guajSVG(s,ui,T,L){
  const REG=L.regions, need=Object.fromEntries(REG.map(r=>[r.id,r])), st=k=>s.painted[k]?"boyanmis":ui.pick&&ui.pick.includes(k)?"secilebilir":"bos";
  const ink=`stroke="${CIZGI}" stroke-opacity=".55" stroke-width="1.1" stroke-linejoin="round"`;
  const g={
    on:k=>!!s.painted[k],
    f:(d,c,ek="")=>`<path d="${d}" fill="${c}" ${ink} ${ek}/>`,
    r:(k,d,boyali="")=>{ const R=need[k]; if(!R) return ""; const state=st(k), done=state==="boyanmis";
      return `<g class="reg${state==="secilebilir"?" pick":""}${ui.just&&ui.just.includes(k)?" just":""}${ui.pick&&!ui.pick.includes(k)&&!done?" off":""}" data-r="${k}">
        <path d="${d}" fill="${KAGIT}"/><path class="fill pale" d="${d}" fill="${COL[R.need]}" opacity="${done?1:.3}"/>
        ${done?`<path d="${d}" fill="url(#gj-sh)"/>${boyali}`:""}
        <path class="outline" d="${d}" fill="none" ${ink}/></g>`;},
    bant:(k,cx,cy,w,a1=-12,a2=13)=>{ const R=need[k]; if(!R||!R.tape) return ""; const peel=ui.untaped&&ui.untaped.includes(k); if(s.painted[R.tape]&&!peel) return "";
      const strip=(a,dy,c)=>`<rect x="${cx-w/2}" y="${cy-6+dy}" width="${w}" height="12" fill="${c}" stroke="#C9B07A" stroke-width="1" transform="rotate(${a} ${cx} ${cy})"/>`;
      return `<g class="tape${peel?" peel":""}" opacity=".96">${strip(a1,-3,"#F3E3B8")}${strip(a2,3,"#F7E9C4")}</g>`;}
  };
  const bdg=REG.filter(r=>!s.painted[r.id]&&(!r.tape||s.painted[r.tape])).map(r=>badge(...T.spot[r.id],r.need)).join(""); /* bantlı bölgenin sembolü bant sökülünce görünür */
  return `<svg viewBox="0 0 312 168" preserveAspectRatio="none" role="img" aria-label="Tablo: ${T.ad}, ${REG.length} bölge">${GJDEFS}
    <rect width="312" height="168" fill="${KAGIT}"/><g filter="url(#gj-ro)">${T.ciz(g)}</g>
    <rect width="312" height="168" filter="url(#gj-gr)" opacity=".3" pointer-events="none"/>${bdg}</svg>`;}

export function paintingSVG(s,ui){
  const L=LEVELS[s.lv], REG=L.regions, SPOT=L.spot;
  if(TABLOLAR[s.lv]) return guajSVG(s,ui,TABLOLAR[s.lv],L);
  const st=r=>{ if(s.painted[r.id]) return "boyanmis"; if(ui.pick&&ui.pick.includes(r.id)) return "secilebilir"; return "bos"; };
  const reg=id=>{const r=REG.find(x=>x.id===id);return regionSVG(id,r.need,st(r),{just:ui.just&&ui.just.includes(id),noBadge:true,off:!!ui.pick&&!ui.pick.includes(id)&&!s.painted[id]});};
  const badges=REG.filter(r=>!s.painted[r.id]).map(r=>badge(...SPOT[r.id],r.need)).join("");
  if(L.art==="sablon"){ /* A6'ya kadar geçici tablo: bölge sayısına göre hücreler; bantlı hücrenin üstünde çapraz bant */
    const C=sablonCells(REG.length);
    const cells=REG.map((r,i)=>regionSVG(r.id,r.need,st(r),{d:C[i].d,just:ui.just&&ui.just.includes(r.id),noBadge:true,off:!!ui.pick&&!ui.pick.includes(r.id)&&!s.painted[r.id]})).join("");
    const tapes=REG.map((r,i)=>{ if(!r.tape) return ""; const peel=ui.untaped&&ui.untaped.includes(r.id); if(s.painted[r.tape]&&!peel) return "";
      const c=C[i], w=Math.min(c.w*.95,140); return `<g class="tape${peel?" peel":""}"><rect x="${c.cx-w/2}" y="${c.cy-7}" width="${w}" height="13" fill="var(--tape)" stroke="rgba(0,0,0,.15)" transform="rotate(-14 ${c.cx} ${c.cy})"/><rect x="${c.cx-w/2}" y="${c.cy-6}" width="${w}" height="13" fill="var(--tape)" fill-opacity=".95" stroke="rgba(0,0,0,.15)" transform="rotate(12 ${c.cx} ${c.cy})"/></g>`;}).join("");
    const bdg=REG.filter(r=>!s.painted[r.id]&&(!r.tape||s.painted[r.tape])).map(r=>badge(...SPOT[r.id],r.need)).join(""); /* bantlı bölgenin sembolü bant sökülünce görünür */
    return `<svg viewBox="0 0 312 168" preserveAspectRatio="none" role="img" aria-label="Tablo: ${REG.length} bölge">${DEFS}${cells}${tapes}${bdg}</svg>`;}
  if(L.art==="meyve") return `<svg viewBox="0 0 312 168" preserveAspectRatio="none" role="img" aria-label="Tablo: 1 bölge">${DEFS}
    <path d="M0 128 H312" stroke="var(--pencil)" stroke-width="1.4"/>
    <ellipse cx="156" cy="134" rx="56" ry="6" fill="rgba(107,90,72,.14)"/>
    ${reg("meyve")}
    <path d="M156 46 C157 36 160 28 166 22" fill="none" stroke="var(--pencil)" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M163 32 C176 20 194 22 199 30 C188 40 173 40 163 32 Z" fill="var(--canvas)" stroke="var(--pencil)" stroke-width="1.4" stroke-linejoin="round"/>
    ${badges}</svg>`;
  const cati=REG.find(r=>r.id==="cati"); const taped=!s.painted[cati.tape];
  return `<svg viewBox="0 0 312 168" preserveAspectRatio="none" role="img" aria-label="Tablo: 4 bölge">${DEFS}
    ${reg("gok")}
    <path d="${P.ground}" fill="var(--canvas)" stroke="var(--pencil)" stroke-width="1.4"/>
    <g stroke="var(--pencil)" stroke-opacity=".35" stroke-width="1"><path d="M20 120 l8 -4 M140 112 l10 -5 M150 150 l9 -4 M16 150 l8 -4 M130 136 l8 -4"/></g>
    ${reg("gunes")}${reg("gol")}
    <path d="${P.wall}" fill="var(--canvas)" stroke="var(--pencil)" stroke-width="1.4"/><path d="${P.door}" fill="none" stroke="var(--pencil)" stroke-width="1.2"/>
    ${reg("cati")}
    ${taped?tapeSVG(false):(ui.untaped&&ui.untaped.includes("cati")?tapeSVG(true):"")}
    ${badges}
  </svg>`;}
