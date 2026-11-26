// ekranlar/defterler.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { chips, done, live, toast } from "../akis.js";
import { STAR, XICON } from "../cizim/ikonlar.js";
import { GEAR, TABS, VENUES, galArt, miniArt, venueOf } from "../cizim/mekanlar.js";
import { symSVG } from "../cizim/semboller.js";
import { coinPillHTML, openShopFull, shopTabHTML } from "./magaza.js";
import { RK_ALLT, RK_RULES, renkList, renkSum, rkHasNew, rkKnown } from "./renk-defteri.js";
import { LOCK, galDraw } from "./sergi.js";
import { CNAME, COL } from "../veri/renkler.js";
import { LEVELS } from "../veri/seviyeler.js";
import { TABLOLAR } from "../veri/tablolar.js";

export const ARTN=["Güneşli tepe","Sarı ev","Meyve tabağı","Yelkenli","Gelincik","Kareler"], ROMAN=["","II","III","IV","V","VI"];
export function artName(lv){ if(TABLOLAR[lv]) return TABLOLAR[lv].ad; if(lv===1) return "Kırmızı elma"; if(lv===2) return "Portakal"; if(lv===11) return "Göl evi";
  const k=Math.floor(lv/6); return ARTN[lv%6]+(k?" "+ROMAN[k]:"");}
export const isReal=lv=>[1,2,11].includes(lv)||!!(live.wonArt&&live.wonArt[lv]);
export function artColors(lv){ if(isReal(lv)&&LEVELS[lv]) return [...new Set(LEVELS[lv].regions.map(r=>r.need))];
  const hex=Object.fromEntries(Object.entries(COL).map(([k,v])=>[v,k])); return [...new Set((miniArt(lv).match(/#[0-9A-F]{6}/g)||[]).map(h=>hex[h]).filter(Boolean))];}
export const artRegions=lv=>isReal(lv)&&LEVELS[lv]?LEVELS[lv].regions.length:Math.min(6,2+venueOf(lv));
/* kurşun kalem eskiz: arka plan kalkar, şekiller boyasız kesik çizgi */
export const sketchArt=lv=>miniArt(lv).replace(/<rect width="100"[^>]*\/>/,"").replace(/ (fill|stroke|stroke-width)="[^"]*"/g,"")
  .replace('aria-hidden="true">','aria-hidden="true"><g fill="none" stroke="#A89B8A" stroke-width="1.8" stroke-dasharray="5 2.5" stroke-linejoin="round">').replace("</svg>","</g></svg>");
/* liste ölçüleri (canlıda scrollTop, sabit kartta translate için aynı hesap) */
export const BK={pad:12,hdr:30,gap:8,th:56,row:14,sec:16,view:376};
export const bkRows=V=>Math.ceil(V.frames.length/4);
export const bkSecH=(i,G)=>i>G.v?BK.hdr+BK.sec:BK.hdr+BK.gap+bkRows(VENUES[i])*BK.th+(bkRows(VENUES[i])-1)*BK.row+BK.sec;
export function bkTopFor(G){ let y=BK.pad; for(let i=0;i<G.v;i++) y+=bkSecH(i,G); let tot=BK.pad; VENUES.forEach((_,i)=>tot+=bkSecH(i,G));
  return Math.max(0,Math.min(tot+BK.pad-BK.view,y-(G.v?46:BK.pad)));}
export function bookHTML(G,s,view={}){
  const tab=view.tab||(view.book&&view.book.tab)||"eskiz";
  if(tab==="renk") return bookShell(G,s,view,"renk",renkSum(G),renkList(G,view),view.static?(view.rkTop||0):0);
  const done=G.next-1, total=VENUES[VENUES.length-1].to, newLv=view.newLv!==undefined?view.newLv:((live.bkSeen??0)<done?done:null);
  const sec=VENUES.map((V,i)=>{
    if(i>G.v) return `<div class="bkch lock" data-ch="${i}"><div class="bkh">${i+1} · ${V.name}<small>${LOCK}Seviye ${V.from}’te açılır</small></div></div>`;
    const n=Math.max(0,Math.min(V.frames.length,G.next-V.from)), full=n>=V.frames.length;
    const th=V.frames.map((_,k)=>{const lv=V.from+k;
      if(lv<G.next) return `<button class="bth paint" type="button" data-act="bkart" data-lv="${lv}" aria-label="${artName(lv)}, Seviye ${lv}">${galArt(lv)}${lv===newLv?`<span class="bnew">Yeni</span>`:""}</button>`;
      if(lv===G.next) return `<button class="bth sk next" type="button" data-act="bkart" data-lv="${lv}" aria-label="Sıradaki tablo, Seviye ${lv}">${sketchArt(lv)}<span class="blbl">Sv ${lv}</span></button>`;
      return `<button class="bth sk faint" type="button" data-act="bkart" data-lv="${lv}" aria-label="Eskiz, Seviye ${lv}">${sketchArt(lv)}</button>`;}).join("");
    return `<div class="bkch" data-ch="${i}"><div class="bkh">${i+1} · ${V.name}<small>${n} / ${V.frames.length}${full?" ✓":""}</small></div><div class="bkg">${th}</div></div>`;}).join("");
  const top=view.static?(view.bkTop??bkTopFor(G)):0;
  return bookShell(G,s,view,"eskiz",`<div class="bksum">Koleksiyon<span class="bar"><i style="width:${Math.round(done/total*100)}%"></i></span><b>${done} / ${total}</b></div>`,sec,top);}
export function bookShell(G,s,view,tab,sum,list,top){
  const dot=tab==="eskiz"&&rkHasNew(G,view)?` class="dot"`:"";
  const seg=tab==="eskiz"?`<span class="on" role="tab" aria-selected="true">Eskiz</span><button type="button" role="tab" aria-selected="false" data-act="bkrenk"><b${dot}>Renk</b></button>`
    :`<button type="button" role="tab" aria-selected="false" data-act="bkeskiz">Eskiz</button><span class="on" role="tab" aria-selected="true">Renk</span>`;
  return `<div class="gal book" aria-label="Defterler: ${tab==="eskiz"?"Eskiz":"Renk"} defteri">
    <div class="hud">
      ${coinPillHTML(s,G)}
      <div class="pill" data-pill="star" style="padding-right:12px" aria-label="Yıldız ${s.stars}">${STAR}<span>${s.stars}</span></div>
      <button class="btn secondary icon" type="button" data-act="gset" aria-label="Ayarlar">${GEAR}</button>
    </div>
    <div class="bkseg" role="tablist" aria-label="Defter">${seg}</div>
    ${sum}
    <div class="bkl" data-bkl><div class="bkin"${top?` style="transform:translateY(${-top}px)"`:""}>${list}</div></div>
    <nav class="nav" aria-label="Alt menü">
      ${shopTabHTML(G)}
      <button class="tab" type="button" data-act="bkgal">${TABS.gal}Sergi</button>
      <div class="tab active" aria-current="page"><div class="tb">${TABS.book}</div>Defterler</div>
    </nav>
  </div>${view.sub||""}`;}
export function bookSubHTML(sub,G){const lv=sub.lv, V=VENUES[venueOf(lv)];
  const meta=`<p class="bkm">Seviye ${lv} · ${artRegions(lv)} bölge</p>`;
  if(sub.k==="bknext"){const hard=lv%10===0;
    return `<div class="galsub"><div class="scrim" data-act="bkclose"></div><div class="popup panel bkpop"><div class="sign size-l stroke"><span class="nail"></span>Sıradaki tablo<span class="nail"></span></div>
      <button class="btn danger icon close" type="button" data-act="bkclose" aria-label="Kapat">${XICON}</button>
      <div class="body"><div class="bkbig sk">${sketchArt(lv)}</div>${meta}<p class="bks">Boyayınca sergiye asılır</p></div>
      <button class="btn primary size-l" type="button" data-act="gplay">Seviye ${lv}${hard?`<span class="ghard">ZOR</span>`:""}</button></div></div>`;}
  const chips=artColors(lv).map(c=>`<span class="bkchip"><i style="background:${COL[c]}"></i>${CNAME[c]} ${symSVG(c,"#fff",11)}</span>`).join("");
  return `<div class="galsub"><div class="scrim" data-act="bkclose"></div><div class="popup panel bkpop"><div class="sign size-l stroke"><span class="nail"></span>${artName(lv)}<span class="nail"></span></div>
    <button class="btn danger icon close" type="button" data-act="bkclose" aria-label="Kapat">${XICON}</button>
    <div class="body"><div class="bkbig paint">${galArt(lv)}</div>${meta}<p class="bks">${V.ch+1}. Bölüm · ${V.name}</p><div class="bkchips">${chips}</div></div>
    ${sub.wall?"":`<button class="btn secondary size-l" type="button" data-act="bkgo">Sergide gör</button>`}</div></div>`;}
export function bookAfter(){const L=live.el.querySelector("[data-bkl]"), g=live.gal; if(!L) return;
  if(g.book.tab==="renk"){ if(g.rkTop==null){const n=L.querySelector(".new"); g.rkTop=n?Math.max(0,n.offsetTop-120):0;}
    L.scrollTop=g.rkTop; L.addEventListener("scroll",()=>{g.rkTop=L.scrollTop;},{passive:true}); return; }
  L.scrollTop=g.bkTop??bkTopFor(live.G); L.addEventListener("scroll",()=>{g.bkTop=L.scrollTop;},{passive:true});}
export const rkLeave=()=>{const g=live.gal; if(g&&g.book&&g.book.tab==="renk") live.rkSeen=live.G.next-1;};
export function bookClick(pa,act){const G=live.G, g=live.gal;
  switch(pa){
    case "bkart": {const lv=+act.dataset.lv; if(lv<G.next) g.sub={k:"bkart",lv}; else if(lv===G.next) g.sub={k:"bknext",lv}; else toast(`Önce Seviye ${G.next}`); break;}
    case "bkrenk": live.bkLast="renk"; g.book={tab:"renk"}; g.rkTop=null; break;
    case "bkeskiz": rkLeave(); live.bkLast="eskiz"; g.book={tab:"eskiz"}; break;
    case "rkton": {const c=act.dataset.c, T=RK_ALLT.find(t=>t.c===c)||{lv:0}; if(!rkKnown(G,T.lv)){toast(`Seviye ${T.lv}’de açılır`); break;} g.sub={k:"rkton",c}; break;}
    case "rkrule": {const R=RK_RULES.find(r=>r.id===act.dataset.r); if(!rkKnown(G,R.lv)){toast(`Seviye ${R.lv}’de açılır`); break;} g.sub={k:"rkrule",r:R.id}; break;}
    case "bkgal": rkLeave(); live.bkSeen=G.next-1; g.book=null; g.sub=null; break;
    case "gshop": openShopFull(); break;
    case "gset": g.sub={k:"s50"}; break;
    default: return; }
  galDraw();}
/* "Sergide gör": defter kapanır, tablonun bölümü açılır (geçmiş bölümse ◀ ▶ bakış modu), kamera tabloya kayar, çerçeve parlar */
export function bookGoWall(lv){const G=live.G, g=live.gal, vi=venueOf(lv), sv=G.slots&&G.slots[vi], i=sv&&sv.includes(lv)?sv.indexOf(lv):lv-VENUES[vi].from;
  rkLeave(); live.bkSeen=G.next-1; g.book=null; g.sub=null; g.vv=vi===G.v?null:vi; g.spot=i; g.focus=i; galDraw();
  clearTimeout(live.spotT); live.spotT=setTimeout(()=>{ if(live.gal) live.gal.spot=null; },3600);}

