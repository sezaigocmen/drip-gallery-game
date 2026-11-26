// ekranlar/siradaki-bolum.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { RM, live } from "../akis.js";
import { FRAMEIC, LAMPIC, VENUES } from "../cizim/mekanlar.js";
import { lookOf, ressamSVG } from "../cizim/ressam.js";
import { galDraw } from "./sergi.js";

/* ================= S05 Sıradaki bölüm (Öneri 16 · A Perde açılır + A otomatik, Sezai seçimi 25.11.2026) =================
   S04 kartı “Sıradaki bölüm” (gnextv) → G.v++ → g.sub={k:"s05",ph,dur,nx}. Yeni bölümün boş duvarı perdenin arkasında.
   ph "cur" 1,2 sn: kapalı perde, tabela “n. BÖLÜM · ad” iner, kariyer yolunda ressam rozeti bir sonraki noktaya yürür.
   ph "open" 2,5 sn (Meydan 3,5): perde iki yana toplanır, boş duvar + bilgi paneli (cümle, tablo · dekor · seviye çipleri, kariyer yolu), süre çizgisi.
   Süre dolunca ya da ekrana dokununca → aynı duvarda S06 aynası (perde kenarda kalır, sub.cur). Hareketleri azalt → ph "rm": perde yok, sabit 1,5 sn.
   Yardımcılar oneri16.js'ten (ad çakışmasın diye s05/S05 önekli). */
export const S05INFO=[
  {tag:"Senin atölyen, ilk duvarın!",dek:2},
  {tag:"Duvarın artık bir kafede!",dek:3},
  {tag:"Kendi sergin açılıyor!",dek:3},
  {tag:"Şehir meydanında, açık havada!",dek:4,rib:"Duvar kayar"},
  {tag:"Büyük salon seni bekliyor!",dek:3,rib:"Kariyerin son durağı",last:1}];
export const S05LVIC=`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 15V1.5" stroke="#FFE9C7" stroke-width="2" stroke-linecap="round"/><path d="M4 2h9l-2.2 3.2L13 8.5H4z" fill="#FFE9C7"/></svg>`;
export const S05DUR=v=>v===3?3500:2500;
/* perde kumaşı: gizli SVG defs (bir kez) */
document.body.insertAdjacentHTML("afterbegin",`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="s05f" x1="0" x2="1"><stop offset="0" stop-color="#6E0C18"/><stop offset=".3" stop-color="#B91F31"/><stop offset=".5" stop-color="#D9384A"/><stop offset=".72" stop-color="#A81A2B"/><stop offset="1" stop-color="#6E0C18"/></linearGradient>
  <pattern id="s05p" width="30" height="640" patternUnits="userSpaceOnUse"><rect width="30" height="640" fill="url(#s05f)"/></pattern>
  <pattern id="s05q" width="18" height="640" patternUnits="userSpaceOnUse"><rect width="18" height="640" fill="url(#s05f)"/></pattern>
  <linearGradient id="s05g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#C9961A"/></linearGradient></defs></svg>`);
export const s05Fringe=w=>{let p=""; for(let x=0;x<w;x+=8) p+=`<path d="M${x} 618 l4 14 l4 -14" fill="#E8C150" stroke="#7A5A00" stroke-width="1"/>`; return p;};
/* st: closed | open; cls: ek sınıf (out = açılırken kayıp gider, in = toplanmış perde belirir) */
export function s05Curtain(st,cls=""){
  if(st==="closed") return [0,1].map(i=>`<svg class="s05cur ${i?"r":"l"} ${cls}" width="184" height="640" viewBox="0 0 184 640" aria-hidden="true"><path d="M0 0 H184 Q176 320 184 610 H0Z" fill="url(#s05p)"/><path d="M184 0 Q176 320 184 610" fill="none" stroke="rgba(40,0,6,.55)" stroke-width="6"/><rect x="0" y="610" width="184" height="9" fill="url(#s05g)" stroke="#7A5A00" stroke-width="1"/>${s05Fringe(184)}</svg>`).join("");
  return [0,1].map(i=>`<svg class="s05cur ${i?"r":"l"} ${cls}" width="100" height="640" viewBox="0 0 100 640" aria-hidden="true">
    <path d="M0 0 H92 Q66 210 30 380 Q52 500 78 610 H0Z" fill="url(#s05q)"/><path d="M92 0 Q66 210 30 380 Q52 500 78 610" fill="none" stroke="rgba(40,0,6,.5)" stroke-width="4"/>
    <rect x="0" y="610" width="78" height="9" fill="url(#s05g)" stroke="#7A5A00" stroke-width="1"/>${s05Fringe(76)}
    <path d="M0 372 Q20 386 40 374" fill="none" stroke="url(#s05g)" stroke-width="6" stroke-linecap="round"/><circle cx="38" cy="376" r="6" fill="#E8C150" stroke="#7A5A00" stroke-width="1.5"/>
    <path d="M38 382 l-5 26 h10z" fill="#E8C150" stroke="#7A5A00" stroke-width="1.2"/></svg>`).join("");}
export function s05Valance(){let s=""; for(let i=0;i<9;i++){const x=i*40; s+=`<path d="M${x} 30 Q${x+20} 52 ${x+40} 30" fill="url(#s05p)" stroke="#E8C150" stroke-width="3"/>`;}
  let t=""; for(let i=1;i<9;i++) t+=`<path d="M${i*40} 30 v8" stroke="#E8C150" stroke-width="2"/><path d="M${i*40-4} 38 h8 l-2 12 h-4z" fill="#E8C150" stroke="#7A5A00" stroke-width="1"/>`;
  return `<svg class="s05val" viewBox="0 0 360 58" aria-hidden="true"><rect x="0" y="0" width="360" height="32" fill="url(#s05p)"/>${s}<rect x="0" y="0" width="360" height="6" fill="#5B3217"/>${t}</svg>`;}
/* tabela: “n. BÖLÜM” + ad; altında şerit (YENİ / SON). o = {drop, anim} */
export function s05Board(v,y,o={}){const V=VENUES[v], I=S05INFO[v];
  return `<div class="s05hang${o.anim?" anim":o.up?" up":""}" style="top:${y}px"><i class="rope l"></i><i class="rope r"></i>
    ${o.drop?`<svg class="s05drop" viewBox="0 0 160 26" aria-hidden="true"><path d="M20 2 v20 M50 0 v24 M110 0 v24 M140 2 v20" stroke="rgba(255,236,170,.7)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 5"/></svg>`:""}
    <div class="s05board${I.last?" gold":""}" role="heading" aria-level="2"><i class="nl"></i><i class="nr"></i><small>${V.ch+1}. BÖLÜM</small><b class="stroke">${V.name}</b></div>
    ${I.rib?`<div class="s05rib"><em>${I.last?"SON":"YENİ"}</em>${I.rib}</div>`:""}</div>`;}
export const s05Chips=v=>{const V=VENUES[v], I=S05INFO[v];
  return `<div class="s05chips"><span class="s05chip">${FRAMEIC}${V.frames.length} tablo</span><span class="s05chip">${LAMPIC}${I.dek} dekor</span><span class="s05chip">${S05LVIC}Seviye ${V.from}–${V.to}</span></div>`;};
/* kariyer yolu: ph "walk" (sabit kart: rozet yolda, ayak izleri) | "arrive" (yeni noktada) | "anim" (canlı: önceki noktadan yürüyerek gelir) */
export function s05Path(G,v,ph){const X=i=>18+i*48, prev=v-1, bx=ph==="walk"?(X(prev)+X(v))/2+6:X(v), a=ph==="anim"?" anim":"";
  let h=`<i class="ln"></i><i class="ln done${a}" style="width:${(ph==="walk"?bx:X(v))-18}px;--w0:${X(prev)-18}px"></i>`;
  for(let i=0;i<5;i++) h+=`<i class="d ${i<v?"done":i===v?(ph==="walk"?"next":"now"+a):""}" style="left:${X(i)}px"></i>`;
  if(ph==="walk") [0.25,0.5,0.75].forEach(t=>h+=`<i class="ft" style="left:${(X(prev)+(bx-X(prev))*t-2).toFixed(1)}px"></i>`);
  const L=lookOf(G);
  h+=`<span class="s05who${a}" style="left:${bx}px">${ressamSVG(L.k,Math.max(0,v-1),L.vi,"face")}</span><i class="tip${a}" style="left:${bx}px"></i>`;
  return `<div class="s05path" role="img" aria-label="Kariyer yolu: ${v+1}. bölüm / 5">${h}</div>`;}
export const s05Info=(G,v,ph,anim)=>`<div class="s05info${anim?" anim":""}" style="top:404px"><p class="s05tag">${S05INFO[v].tag}</p>${s05Chips(v)}${s05Path(G,v,ph)}</div>`;
/* Perde katmanı. gal = .gal öğesi (canlı ya da sabit kart). sb = {ph: cur|open|rm, dur?, tm? (sabit kartta süre çizgisi 0–1)} */
export function s05Paint(gal,G,sb){const v=G.v, live1=sb.tm==null; let h="";
  gal.classList.add("s05a"); if(v===3&&sb.ph!=="cur") gal.classList.add("s05slide");
  if(sb.ph==="cur") h+=s05Curtain("closed")+`<i class="s05spot"></i>`+s05Valance()+s05Board(v,96,{drop:1,anim:live1})
    +`<div class="s05pill" style="top:548px">${s05Path(G,v,live1?"anim":"walk")}</div>`;
  else if(sb.ph==="open") h+=(live1?s05Curtain("closed","out"):"")+s05Curtain("open",live1?"in":"")+`<i class="s05vig"></i>`+s05Valance()+s05Board(v,58,{up:live1})+s05Info(G,v,"arrive",live1);
  else h+=`<i class="s05vig"></i>`+s05Board(v,58)+s05Info(G,v,"arrive");
  if(sb.ph!=="cur") h+=`<div class="s05timer" aria-hidden="true"><i${live1?` class="anim" style="--d:${sb.dur}ms"`:` style="width:${sb.tm*100}%"`}></i></div>`;
  h+=`<div class="s05skip">Dokun, geç ›</div><button class="s05tap" type="button" data-act="s05skip" aria-label="${VENUES[v].ch+1}. Bölüm, ${VENUES[v].name}. Geç"></button>`;
  gal.insertAdjacentHTML("beforeend",h);}
/* S06 aynası S05'ten geldiyse perde kenarda kalır (aynı sahne) */
export function s05Frame(gal){gal.classList.add("s05a"); gal.insertAdjacentHTML("beforeend",s05Curtain("open")+s05Valance());}
export function s05Start(nx){const g=live.gal, v=live.G.v, rm=RM||live.set.rm, sb={k:"s05",ph:rm?"rm":"cur",dur:rm?1500:S05DUR(v),nx}; g.sub=sb;
  if(!rm) setTimeout(()=>{ if(live.gal===g&&g.sub===sb&&sb.ph==="cur"){sb.ph="open"; galDraw(); sb.t=setTimeout(()=>s05Go(g,sb),sb.dur);} },1200);
  else sb.t=setTimeout(()=>s05Go(g,sb),sb.dur);}
export function s05Go(g,sb){ if(live.gal!==g||g.sub!==sb) return; clearTimeout(sb.t); g.sub={...sb.nx,cur:sb.ph!=="rm"}; galDraw();}
export function s05Apply(){const sb=live.gal&&live.gal.sub; if(!sb||(sb.k!=="s05"&&!(sb.k==="s06"&&sb.cur))) return; const gal=live.el.querySelector(".gal"); if(!gal) return;
  if(sb.k==="s05") s05Paint(gal,live.G,sb); else s05Frame(gal);}

