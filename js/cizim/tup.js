// cizim/tup.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { symG, symSVG, symW } from "./semboller.js";
import { COL, INK, NAME } from "../veri/renkler.js";

export function canSVG(c,cls=""){return `<svg class="can ${cls}" viewBox="0 0 32 34" aria-label="${NAME[c]} boya kutusu"><path d="M9 7 C9 1 23 1 23 7" fill="none" stroke="#6B5233" stroke-width="2"/><rect x="4" y="8" width="24" height="24" rx="4" fill="${COL[c]}" stroke="#3D220E" stroke-width="2"/><ellipse cx="16" cy="9" rx="12" ry="3.5" fill="#E9E2D4" stroke="#3D220E" stroke-width="2"/><rect x="4" y="18" width="24" height="8" fill="rgba(255,255,255,.85)"/><g transform="translate(${16-symW(c)*.3} 19.5) scale(.6)">${symG(c,INK[c])}</g></svg>`;}
export function tubeHTML(layers,o={}){
  const ly=(c,g,sw)=>`<i class="ly${g?" ghost":""}${sw?" swirl":""}" style="--c:${COL[c]}">${symSVG(c,c==="Y"?"rgba(60,35,0,.65)":"#fff",11)}</i>`;
  return `${o.hoverCan?`<span class="hovercan">${canSVG(o.hoverCan)}</span>`:""}<div class="glass${o.sel?" sel":""}${o.shake?" shake":""}${o.flash?" flash":""}${o.target?" target":""}"><div class="stack">${layers.map((c,k)=>ly(c,0,o.swirl&&k>=layers.length-2)).join("")}${(o.ghost||[]).map(c=>ly(c,1)).join("")}</div>${o.mix?`<span class="mixplus" aria-hidden="true">+</span>`:""}</div>`;}
