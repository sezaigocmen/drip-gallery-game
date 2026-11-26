// ekranlar/renk-defteri.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { live } from "../akis.js";
import { XICON } from "../cizim/ikonlar.js";
import { galArt } from "../cizim/mekanlar.js";
import { CHIP, DROP, TAPEILL } from "../cizim/oyun-ekrani.js";
import { symG, symW } from "../cizim/semboller.js";
import { P } from "../cizim/tablo.js";
import { canSVG } from "../cizim/tup.js";
import { artColors, artName } from "./defterler.js";
import { CNAME, COL, INK, PARTS } from "../veri/renkler.js";

/* ================= S41 Renk defteri (Defterler sekmesi, “Renk”) =================
   Tonlar (ana renkler + beyaz, karışımlar, açık tonlar) ve kurallar. Keşfedilmeyen ton = gri siluet + “?”, kilitli kural = gri satır.
   Bakılmamış yeni ton/kural: “Yeni” + kırmızı nokta (Sergi’deki Defterler sekmesi ve Eskiz’deyken “Renk” anahtarı); Renk defterinden çıkınca söner.
   Bilgi bitirilen seviyeden türer: G.next > lv ise öğrenildi. Oyun içinden açılmaz (S11c karışım hatırlatıcısı yeter). Booster’lar defterde yok. */
export const RK_TONES=[{c:"R",lv:1},{c:"Y",lv:2},{c:"B",lv:3},{c:"W",lv:21}];
export const RK_MIX=[{c:"O",lv:2},{c:"G",lv:3},{c:"P",lv:3}], RK_LIGHT=[{c:"PK",lv:21},{c:"CR",lv:21},{c:"LB",lv:21}];
export const RK_RULES=[
 {id:"dok",n:"Döküm",d:"Aynı rengin üstüne ya da boş tüpe",lv:1,t:"Aynı renk, aynı rengin üstüne ya da boş tüpe dökülür."},
 {id:"kutu",n:"Dolan tüp",d:"Tek renkle dolunca kutu olur",lv:1,t:"Tek renkle dolan tüp boya kutusuna dönüşür."},
 {id:"mix",n:"Karışım",d:"1 katman + 1 katman = 2 katman",lv:2,t:"Başka ana rengin üstüne 1 katman gider, 2 katman ara renk olur."},
 {id:"nomix",n:"Ara renk",d:"Karışım bir daha karışmaz",lv:3,t:"Ara renk sadece kendi renginin üstüne ya da boş tüpe dökülür."},
 {id:"bant",n:"Bant",d:"Yanını boya, bant sökülür",lv:11,t:"Yanını boya, bant sökülür."},
 {id:"raf",n:"Raf",d:"Kutu 2 yuvada bekleyebilir",lv:16,t:"Tabloya hemen gidemeyen kutu rafta bekler. Rafta 2 yuva var."},
 {id:"beyaz",n:"Beyaz",d:"Ana renk + beyaz = açık ton",lv:21,t:"Ana renk + beyaz = 2 katman açık ton. Açık ton bir daha karışmaz."}];
export const RK_ALLT=[...RK_TONES,...RK_MIX,...RK_LIGHT];
export const rkKnown=(G,lv)=>G.next>lv;
export const rkSeenOf=(G,view={})=>view.rkSeen!==undefined?view.rkSeen:(live.rkSeen??G.next-1);
export const rkIsNew=(G,lv,view)=>lv>1&&rkKnown(G,lv)&&lv>rkSeenOf(G,view);
export const rkHasNew=(G,view)=>G.next>2&&[...RK_ALLT,...RK_RULES].some(x=>rkIsNew(G,x.lv,view));
/* defterdeki damla: sembol büyük (küçük boyda okunur), beyazda koyu sembol */
export const RKDROP=c=>`<svg class="drop" viewBox="0 0 84 84" aria-hidden="true"><path d="M42 5 C55 25 72 37 72 55 A30 27 0 0 1 12 55 C12 37 29 25 42 5Z" fill="${COL[c]}" stroke="var(--wood-900)" stroke-width="4"/><path d="M24 44 A18 18 0 0 1 31 30" stroke="#fff" stroke-opacity=".6" stroke-width="4.5" fill="none" stroke-linecap="round"/><g transform="translate(${42-symW(c)*1.1} 46) scale(2.2)">${symG(c,c==="W"?INK.W:"#fff")}</g></svg>`;
export const RKNEW=`<span class="rknew">Yeni</span>`;
export const rkLockDrop=`<svg class="drop" viewBox="0 0 84 84" aria-hidden="true"><path d="M42 5 C55 25 72 37 72 55 A30 27 0 0 1 12 55 C12 37 29 25 42 5Z" fill="#E3D8C9" stroke="#9B8F80" stroke-width="3" stroke-dasharray="7 5"/><text x="42" y="66" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="30" fill="#8F8273">?</text></svg>`;
export function renkSum(G){const n=RK_ALLT.filter(t=>rkKnown(G,t.lv)).length;
  return `<div class="bksum">Tonlar<span class="bar"><i style="width:${n*10}%"></i></span><b>${n} / 10</b></div>`;}
export const RK_RI={
 dok:`<svg viewBox="0 0 34 34"><rect x="5" y="12" width="10" height="19" rx="3" fill="#fff" stroke="#3D220E" stroke-width="2"/><rect x="7" y="22" width="6" height="7" fill="${COL.B}"/><rect x="20" y="12" width="10" height="19" rx="3" fill="#fff" stroke="#3D220E" stroke-width="2"/><rect x="22" y="18" width="6" height="11" fill="${COL.B}"/><path d="M10 9c2-6 12-6 14 0" fill="none" stroke="#3D220E" stroke-width="2"/><path d="M21 6l3 3-4 1" fill="none" stroke="#3D220E" stroke-width="2" stroke-linejoin="round"/></svg>`,
 kutu:`<svg viewBox="0 0 34 34"><path d="M8 11h18v17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" fill="${COL.G}" stroke="#3D220E" stroke-width="2"/><ellipse cx="17" cy="11" rx="9" ry="3" fill="#E9E2D4" stroke="#3D220E" stroke-width="2"/><path d="M9 9c0-6 16-6 16 0" fill="none" stroke="#3D220E" stroke-width="2"/></svg>`,
 mix:`<svg viewBox="0 0 34 34"><circle cx="8" cy="10" r="5" fill="${COL.R}" stroke="#3D220E" stroke-width="1.6"/><path d="M17 7v6M14 10h6" stroke="#3D220E" stroke-width="2"/><circle cx="26" cy="10" r="5" fill="${COL.Y}" stroke="#3D220E" stroke-width="1.6"/><rect x="5" y="20" width="24" height="10" rx="3" fill="${COL.O}" stroke="#3D220E" stroke-width="1.6"/></svg>`,
 beyaz:`<svg viewBox="0 0 34 34"><circle cx="8" cy="10" r="5" fill="${COL.R}" stroke="#3D220E" stroke-width="1.6"/><path d="M17 7v6M14 10h6" stroke="#3D220E" stroke-width="2"/><circle cx="26" cy="10" r="5" fill="${COL.W}" stroke="#3D220E" stroke-width="1.6"/><rect x="5" y="20" width="24" height="10" rx="3" fill="${COL.PK}" stroke="#3D220E" stroke-width="1.6"/></svg>`, /* A5: eksikti (undefined yazıyordu) */
 nomix:`<svg viewBox="0 0 34 34"><path d="M17 3C15 7 7 15 7 21a10 10 0 0 0 20 0C27 15 19 7 17 3z" fill="${COL.O}" stroke="#3D220E" stroke-width="2"/><path d="M11 14l12 14M23 14L11 28" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M11 14l12 14M23 14L11 28" stroke="#D9281B" stroke-width="2.6" stroke-linecap="round"/></svg>`,
 bant:`<svg viewBox="0 0 34 34"><rect x="4" y="6" width="26" height="22" fill="${COL.B}" stroke="#3D220E" stroke-width="2"/><rect x="15" y="6" width="15" height="22" fill="#DCC8EE"/><path d="M12 3l20 12-4 6L8 9z" fill="#F3E3A6" stroke="#B8A26A" stroke-width="1.4"/></svg>`,
 raf:`<svg viewBox="0 0 34 34"><rect x="3" y="22" width="28" height="5" rx="1" fill="#C98444" stroke="#3D220E" stroke-width="1.8"/><rect x="6" y="12" width="9" height="10" rx="1.5" fill="${COL.P}" stroke="#3D220E" stroke-width="1.8"/><rect x="19" y="12" width="9" height="10" rx="1.5" fill="none" stroke="#8F8273" stroke-width="1.8" stroke-dasharray="3 2"/></svg>`,
 lock:`<svg viewBox="0 0 34 34"><rect x="8" y="15" width="18" height="14" rx="3" fill="#9A8E80"/><path d="M12 15v-4a5 5 0 0 1 10 0v4" fill="none" stroke="#9A8E80" stroke-width="3"/></svg>`};
/* S41 renk paleti (Öneri 10b · E, Sezai onayı): yuvarlak ahşap palet. Dış halkada 6 leke RYB sırasıyla; ana renkler büyük
   (66 px, kalın kontur, koyu etiket), karışımlar küçük (46 px, küçük etiket). Dış lekeler tek bir renk halkasıyla bağlı, her parça
   renk değiştirir (Kırmızı → Turuncu ← Sarı). İçte ana → açık ton → beyaz. Lekeye dokununca ton kartı açılır (seçim durumu yok).
   Altta "Son keşif" şeridi: en son bulunan tonun formülü. */
export const RK_OUT=[["R",0],["O",60],["Y",120],["G",180],["B",240],["P",300]], RK_INN=[["PK",0],["CR",120],["LB",240]];
export const RK_LV=c=>RK_ALLT.find(t=>t.c===c).lv, RK_BIG={R:1,Y:1,B:1};
export function rkPalette(G,view={}){
  const C=160, RO=106, RI=38, P=(r,a)=>[C+r*Math.sin(a*Math.PI/180),C-r*Math.cos(a*Math.PI/180)], kn=c=>rkKnown(G,RK_LV(c));
  let defs="", lines="", blobs="", tags="";
  const seg=(c1,c2,x1,y1,x2,y2,arc,w)=>{const d=arc?`M${x1.toFixed(1)} ${y1.toFixed(1)}A${RO} ${RO} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`:`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    if(!(kn(c1)&&kn(c2))) return `<path d="${d}" fill="none" stroke="#B08A5E" stroke-width="2.5" stroke-dasharray="5 5" stroke-linecap="round"/>`;
    const id=`rkg${c1}${c2}`; defs+=`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"><stop offset=".15" stop-color="${COL[c1]}"/><stop offset=".85" stop-color="${COL[c2]}"/></linearGradient>`;
    return `<path d="${d}" fill="none" stroke="#3D220E" stroke-width="${w+4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${id})" stroke-width="${w}" stroke-linecap="round"/>`;};
  RK_OUT.forEach(([c,a],i)=>{const n=RK_OUT[(i+1)%6][0], [x1,y1]=P(RO,a), [x2,y2]=P(RO,a+60); lines+=seg(c,n,x1,y1,x2,y2,true,8);});
  RK_INN.forEach(([c,a])=>{const pr=PARTS[c][0], [xa,ya]=P(RO,a), [xb,yb]=P(RI,a); lines+=seg(pr,c,xa,ya,xb,yb,false,6)+seg(c,"W",xb,yb,C,C,false,6);});
  const sym=(c,x,y,hh)=>{const k=hh/10, w=symW(c)*k; return `<g transform="translate(${(x-w/2).toFixed(1)} ${(y-hh/2).toFixed(1)}) scale(${k})">${symG(c,(c==="Y"||c==="W"||c==="CR")?INK[c]:"#fff")}</g>`;};
  const blob=(c,x,y,r,hh)=>{const lv=RK_LV(c), nw=rkIsNew(G,lv,view), al=`aria-label="${kn(c)?CNAME[c]:"Bulunmadı, Seviye "+lv+"’de açılır"}"`;
    const hit=`<circle cx="${x}" cy="${y}" r="${Math.max(r,24)}" fill="transparent"/>`;
    if(!kn(c)) return `<g class="rkw lk" data-act="rkton" data-c="${c}" role="button" ${al}>${hit}<circle cx="${x}" cy="${y}" r="${r}" fill="#E3D8C9" stroke="#A8957E" stroke-width="2" stroke-dasharray="5 4"/><text x="${x}" y="${y+(r>20?3:5)}" text-anchor="middle" font-family="Fredoka,sans-serif" font-weight="700" font-size="${r>20?18:13}" fill="#8F8273">?</text>${r>20?`<text x="${x}" y="${y+15}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="9" fill="#8F8273">Sv ${lv}</text>`:""}</g>`;
    return `<g class="rkw${nw?" nw":""}" data-act="rkton" data-c="${c}" role="button" ${al}>${hit}<circle cx="${x}" cy="${y+3}" r="${r}" fill="rgba(61,34,14,.28)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${COL[c]}" stroke="#3D220E" stroke-width="${RK_BIG[c]?3.5:2.5}"/><path d="M${(x-r*.55).toFixed(1)} ${(y-r*.25).toFixed(1)}a${(r*.6).toFixed(1)} ${(r*.6).toFixed(1)} 0 0 1 ${(r*.45).toFixed(1)} -${(r*.4).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>${sym(c,x,y+1,hh)}</g>`
      +(nw?`<g pointer-events="none" transform="translate(${(x+r*.45).toFixed(1)} ${(y-r-6).toFixed(1)})"><rect width="30" height="14" rx="6" fill="#D9281B" stroke="#fff" stroke-width="1.5"/><text x="15" y="10.5" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="9" fill="#fff">Yeni</text></g>`:"");};
  const tag=(c,x,y,big)=>{if(!kn(c)) return ""; const w=CNAME[c].length*(big?7.4:6.2)+(big?16:12), hh=big?18:14;
    return `<g pointer-events="none"><rect x="${(x-w/2).toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${hh}" rx="${hh/2}" fill="${big?"#3D220E":"#6A4A2E"}" stroke="#fff" stroke-width="${big?1.5:0}"/><text x="${x.toFixed(1)}" y="${(y+(big?13:10.5)).toFixed(1)}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="${big?12:9.5}" fill="#fff">${CNAME[c]}</text></g>`;};
  RK_OUT.forEach(([c,a])=>{const [x,y]=P(RO,a), big=!!RK_BIG[c], r=big?33:23; blobs+=blob(c,+x.toFixed(1),+y.toFixed(1),r,big?22:13); tags+=tag(c,x,y+r-(big?10:4),big);});
  RK_INN.forEach(([c,a])=>{const [x,y]=P(RI,a); blobs+=blob(c,+x.toFixed(1),+y.toFixed(1),14,9.5);});
  blobs+=blob("W",C,C,17,12);
  return `<svg class="rkpal" viewBox="0 0 320 320" role="group" aria-label="Renk paleti"><defs>${defs}</defs>
    <circle cx="${C}" cy="${C+4}" r="${C-1}" fill="rgba(61,34,14,.22)"/><circle cx="${C}" cy="${C}" r="${C-2}" fill="#E7BF85" stroke="#8A4F24" stroke-width="3"/><circle cx="${C}" cy="${C}" r="${C-12}" fill="none" stroke="#F6DDB2" stroke-width="2" opacity=".7"/>
    ${lines}${blobs}${tags}</svg>`;}
/* Son keşif şeridi: en son bulunan ton (aynı seviyede birden çoksa listede sonraki) */
export function rkStrip(G){
  const known=RK_ALLT.filter(t=>rkKnown(G,t.lv)); if(!known.length) return "";
  const t=known.reduce((a,b)=>b.lv>=a.lv?b:a), c=t.c, P2=PARTS[c];
  const dr=x=>`<span class="rkd">${RKDROP(x)}</span>`, op=x=>`<span class="op">${x}</span>`;
  const fx=P2.length===2?`${dr(P2[0])}${op("+")}${dr(P2[1])}${op("=")}${dr(c)}`:`${dr(c)}<span class="rkpr">Ana renk</span>`;
  return `<button class="rkstrip" type="button" data-act="rkton" data-c="${c}" aria-label="Son keşif: ${CNAME[c]}, ton kartını aç">${fx}<span class="nm"><small>Son keşif · Sv ${t.lv}</small>${CNAME[c]}</span><span class="go" aria-hidden="true">›</span></button>`;}
export function renkList(G,view={}){
  const nw=lv=>rkIsNew(G,lv,view);
  const nOf=a=>a.filter(t=>rkKnown(G,t.lv)).length;
  const tone=t=>rkKnown(G,t.lv)?`<button class="rkt${nw(t.lv)?" new":""}" type="button" data-act="rkton" data-c="${t.c}" aria-label="${CNAME[t.c]}">${RKDROP(t.c)}<span>${CNAME[t.c]}</span>${nw(t.lv)?RKNEW:""}</button>`
    :`<button class="rkt lk" type="button" data-act="rkton" data-c="${t.c}" aria-label="Bulunmadı, Seviye ${t.lv}’de açılır">${rkLockDrop}<span>Sv ${t.lv}</span></button>`;
  const frow=t=>{const [a,b]=PARTS[t.c];
    return `<button class="rkf${nw(t.lv)?" new":""}" type="button" data-act="rkton" data-c="${t.c}" aria-label="${CNAME[a]} artı ${CNAME[b]} eşittir ${CNAME[t.c]}">${RKDROP(a)}<span class="op">+</span>${RKDROP(b)}<span class="op">=</span>${RKDROP(t.c)}<span class="nm">${CNAME[t.c]}</span><span class="rklv">Sv ${t.lv}</span>${nw(t.lv)?RKNEW:""}</button>`;};
  const mix=RK_MIX.filter(t=>rkKnown(G,t.lv)), light=rkKnown(G,21);
  const rule=r=>rkKnown(G,r.lv)?`<button class="rkr${nw(r.lv)?" new":""}" type="button" data-act="rkrule" data-r="${r.id}"><span class="ric">${RK_RI[r.id]}</span><span class="t"><b>${r.n}</b><small>${r.d}</small></span><span class="rklv">Sv ${r.lv}</span>${nw(r.lv)?RKNEW:""}</button>`
    :`<button class="rkr lk" type="button" data-act="rkrule" data-r="${r.id}"><span class="ric">${RK_RI.lock}</span><span class="t"><b>${r.n}</b><small>???</small></span><span class="rklv">Seviye ${r.lv}’de açılır</span></button>`;
  return `<div class="bkch rkwrap${RK_ALLT.some(t=>nw(t.lv))?" new":""}">${rkPalette(G,view)}${rkStrip(G)}</div>
  <div class="bkch"><div class="bkh">Kurallar<small>${nOf(RK_RULES)} / ${RK_RULES.length}</small></div>${RK_RULES.map(rule).join("")}</div>`;}
export function rkIll(id){
  switch(id){
    case "dok": return `<div class="fx big">${CHIP("B")}<span class="op">→</span>${CHIP("B")}<span class="op"></span>${CHIP("B")}<span class="op">→</span><span class="chip empty"></span></div>`;
    case "kutu": return `<div class="fx big">${CHIP("G")}${CHIP("G")}${CHIP("G")}<span class="op">→</span>${canSVG("G")}</div>`;
    case "mix": return `<div class="fx big">${CHIP("R")}<span class="op">+</span>${CHIP("Y")}<span class="op">=</span>${CHIP("O")}${CHIP("O")}</div>`;
    case "nomix": return `<div class="fx big">${CHIP("O")}<span class="op">+</span>${CHIP("B")}<span class="op">=</span><span class="nox">✕</span></div>`;
    case "bant": return TAPEILL;
    case "raf": return `<div class="rkshelf">${canSVG("P")}<i></i></div>`;
    default: return `<div class="fx big">${CHIP("R")}<span class="op">+</span>${CHIP("W")}<span class="op">=</span>${CHIP("PK")}</div>`;}}
export function renkSubHTML(sub,G){
  const sign=t=>`<div class="sign size-l stroke"><span class="nail"></span>${t}<span class="nail"></span></div>`;
  const x=`<button class="btn danger icon close" type="button" data-act="bkclose" aria-label="Kapat">${XICON}</button>`;
  if(sub.k==="rkrule"){const R=RK_RULES.find(r=>r.id===sub.r);
    return `<div class="galsub"><div class="scrim" data-act="bkclose"></div><div class="popup panel newcard rkpop">${sign(R.n)}${x}
      <div class="body">${rkIll(R.id)}<p class="rks">${R.t}</p><p class="rkm">Seviye ${R.lv}’de öğrendin</p></div>
      <button class="btn primary size-l" type="button" data-act="rkok">Tamam</button></div></div>`;}
  const c=sub.c, T=RK_ALLT.find(t=>t.c===c), P=PARTS[c];
  const fx=P.length===2?`<div class="fx big" aria-label="${CNAME[P[0]]} artı ${CNAME[P[1]]}">${CHIP(P[0])}<span class="op">+</span>${CHIP(P[1])}<span class="op">=</span>${CHIP(c)}</div><p class="rkm k">${CNAME[P[0]]} + ${CNAME[P[1]]}</p>`
    :`<p class="rkm k">${c==="W"?"Başlangıç boyası":"Ana renk"}</p><p class="rkm">Karışımla elde edilmez</p>`;
  const used=[]; for(let lv=1;lv<G.next;lv++) if(artColors(lv).includes(c)) used.push(lv);
  const th=used.slice(-3).reverse().map(lv=>`<button class="bth paint" type="button" data-act="bkart" data-lv="${lv}" aria-label="${artName(lv)}, Seviye ${lv}">${galArt(lv)}</button>`).join("");
  return `<div class="galsub"><div class="scrim" data-act="bkclose"></div><div class="popup panel newcard rkpop">${sign(CNAME[c])}${x}
    <div class="body">${DROP(c)}${fx}<p class="rkm">Seviye ${T.lv}’de keşfettin</p>
    ${used.length?`<span class="lbl2">Bu tonla boyanan tablolar${used.length>3?` · ${used.length}`:""}</span><div class="rkthumbs">${th}</div>`:""}</div></div></div>`;}

