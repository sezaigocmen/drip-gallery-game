// ekranlar/sergi.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { RM, draw, live, startLevel, toast } from "../akis.js";
import { kaydet } from "../kayit.js";
import { HAND, STAR, XICON } from "../cizim/ikonlar.js";
import { CHEV, FRAMEIC, GEAR, LAMPIC, SMSTAR, SPARK, TABS, VENUES, ensureLevel, galArt, venueOf } from "../cizim/mekanlar.js";
import { DECOR, decorOwned, lookOf, painterSVG } from "../cizim/ressam.js";
import { G_LAST, s50Click, settingsHTML } from "./ayarlar.js";
import { CHEST_AMT, s04Apply, s04Card, s04OpenChest, s04Start } from "./bolum-sonu.js";
import { bookAfter, bookClick, bookGoWall, bookHTML, bookSubHTML } from "./defterler.js";
import { coinPillHTML, openShopFull, s21Check, shopTabHTML } from "./magaza.js";
import { renkSubHTML, rkHasNew } from "./renk-defteri.js";
import { s06Bind, s06Click, s06HTML, s06Sign } from "./ressam-secimi.js";
import { s05Apply, s05Go, s05Start } from "./siradaki-bolum.js";
import { efekt, muzik } from "../ses.js";

/* ================= S02 Dekor (Öneri 13 · A Alt panel) =================
   Her dekor yerinin 3 stili var. Alınan dekorun stili G.sty[id] (yoksa 0). Konmuş dekora dokununca aynı panel, stil değiştirmek bedava.
   Bölüm değişince alınanlar G.arch[bölüm] = {decor, sty} olarak saklanır (geçmiş bölüme bakınca görünür). */
export const B0=DECOR.bitki();
export const tulip=(x,y,c)=>`<path d="M${x-6} ${y} C${x-6} ${y+9} ${x+6} ${y+9} ${x+6} ${y} L${x+3} ${y-5} L${x} ${y-1} L${x-3} ${y-5}Z" fill="${c}" stroke="#3D220E" stroke-width="1.4"/>`;
export const STYLES={
  bitki:[
    {n:"Paşa kılıcı",svg:B0},
    {n:"Kaktüs",svg:`<svg viewBox="0 0 50 96" preserveAspectRatio="xMidYMax meet"><path d="M20 47 H12 a4 4 0 0 1 -4 -4 V32 a3.5 3.5 0 0 1 7 0 V40 H20Z" fill="#5FB35A" stroke="#2F6E0E" stroke-width="2"/><path d="M30 41 H38 a4 4 0 0 0 4 -4 V27 a3.5 3.5 0 0 0 -7 0 V34 H30Z" fill="#5FB35A" stroke="#2F6E0E" stroke-width="2"/><path d="M18 64 V22 a7 7 0 0 1 14 0 V64Z" fill="#5FB35A" stroke="#2F6E0E" stroke-width="2"/><path d="M25 18 V62" stroke="#2F6E0E" stroke-width="1.2" opacity=".5"/><circle cx="25" cy="14" r="4.5" fill="#FF6FA8" stroke="#B3265E" stroke-width="1.5"/><path d="M11 64 H39 L36 94 H14Z" fill="#2E64B0" stroke="#1B3F8A" stroke-width="2"/><rect x="8" y="60" width="34" height="8" rx="2" fill="#4A86E8" stroke="#1B3F8A" stroke-width="2"/></svg>`},
    {n:"Lale",svg:`<svg viewBox="0 0 50 96" preserveAspectRatio="xMidYMax meet"><path d="M18 62 C17 46 15 36 13 26 M25 62 V18 M32 62 C33 48 35 38 37 28" stroke="#2F6E0E" stroke-width="2.5" fill="none"/><path d="M25 62 C14 56 9 46 11 37 C20 43 24 52 25 62Z" fill="#4E9A4A" stroke="#2F6E0E" stroke-width="1.6"/><path d="M25 62 C36 56 41 46 39 37 C30 43 26 52 25 62Z" fill="#4E9A4A" stroke="#2F6E0E" stroke-width="1.6"/>${tulip(13,24,"#D9472F")}${tulip(25,16,"#EDB83A")}${tulip(37,26,"#7D4FA6")}<path d="M10 62 H40 L36 94 H14Z" fill="#EDB83A" stroke="#A86A00" stroke-width="2"/><path d="M12 72 H38" stroke="#A86A00" stroke-width="1.5"/></svg>`}],
  hali:[
    {n:"Kilim",svg:`<svg viewBox="0 0 200 40" preserveAspectRatio="xMidYMid meet">${[8,12,16,20,24,28,32].map(y=>`<path d="M0 ${y} H6 M194 ${y} H200" stroke="#E9D3A8" stroke-width="1.6"/>`).join("")}<rect x="5" y="4" width="190" height="32" rx="3" fill="#C9473A" stroke="#8E2412" stroke-width="2.5"/><rect x="13" y="9" width="174" height="22" fill="none" stroke="#FFE9C7" stroke-width="2"/>${[40,80,120,160].map(x=>`<path d="M${x} 12 L${x+11} 20 L${x} 28 L${x-11} 20Z" fill="#EDB83A" stroke="#3D220E" stroke-width="1.2"/><circle cx="${x}" cy="20" r="2.4" fill="#2E64B0"/>`).join("")}</svg>`},
    {n:"Örgü",svg:`<svg viewBox="0 0 200 40" preserveAspectRatio="xMidYMid meet"><ellipse cx="100" cy="20" rx="96" ry="18" fill="#2E64B0" stroke="#1B3F8A" stroke-width="2.5"/><ellipse cx="100" cy="20" rx="78" ry="13.5" fill="#FFF3DA"/><ellipse cx="100" cy="20" rx="60" ry="10" fill="#5FB0FF"/><ellipse cx="100" cy="20" rx="40" ry="6.5" fill="#FFF3DA"/><ellipse cx="100" cy="20" rx="20" ry="3.2" fill="#2E64B0"/></svg>`},
    {n:"Çizgili",svg:`<svg viewBox="0 0 200 40" preserveAspectRatio="xMidYMid meet">${[9,14,19,24,29].map(y=>`<path d="M0 ${y} H7 M193 ${y} H200" stroke="#B9926A" stroke-width="1.6"/>`).join("")}<rect x="6" y="5" width="188" height="30" rx="2" fill="#FFF3DA" stroke="#5B3217" stroke-width="2"/>${Array.from({length:11},(_,i)=>i%2?"":`<rect x="${8+i*16.7}" y="6" width="16.7" height="28" fill="${["#4E9A4A","#EDB83A","#E77B2E"][(i/2)%3]}"/>`).join("")}<rect x="6" y="5" width="188" height="30" rx="2" fill="none" stroke="#5B3217" stroke-width="2"/></svg>`}]};
export const CHECK=`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const GSTAR=(x,y,r)=>`<svg class="s02spark" style="left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="#FFE27A" stroke="#A86A00" stroke-width="1.2"/></svg>`;
export const BIGSTAR=SMSTAR.replace("<svg",'<svg style="width:24px;height:24px"');
export const decSty=(G,id)=>(G.sty&&G.sty[id])||0;
export function decorSVG(V,d,G,sel){const st=STYLES[d.id]; return st?st[sel!=null?sel:decSty(G,d.id)].svg:DECOR[d.id](V,d);}
export function optsHTML(id,sel,used){return `<div class="s02opts">${STYLES[id].map((st,i)=>`<button class="s02opt${i===sel?" sel":""}" type="button" data-act="s02opt" data-i="${i}" aria-pressed="${i===sel}" aria-label="${st.n}${i===used?", kullanılıyor":""}"><span class="th ${id}">${st.svg}</span><b>${st.n}</b>${i===used?`<em>Kullanılıyor</em>`:""}${i===sel?`<i class="ok">${CHECK}</i>`:""}</button>`).join("")}</div>`;}
/* Alt panel. o = {id, sel, used?} (used varsa konmuş dekor: “Değiştir · Bedava”). Panelin kendisi data-act="s02noop": içine dokunmak kapatmaz. */
export function s02SheetHTML(V,o){const d=V.decor.find(x=>x.id===o.id), free=o.used!=null;
  return `<div class="s02sheet panel" role="dialog" aria-label="${d.n} stili seç" data-act="s02noop"><i class="grab"></i>
    <div class="s02top"><div class="sign stroke"><span class="nail"></span>${d.n}<span class="nail"></span></div><span class="s02hint">${free?"Değiştirmek bedava":"Dokun, duvarda dene"}</span>
      <button class="btn danger icon s02x" type="button" data-act="gsubclose" aria-label="Kapat">${XICON}</button></div>
    ${optsHTML(o.id,o.sel,o.used)}
    ${free?`<button class="btn primary size-l" type="button" data-act="gput"${o.sel===o.used?" disabled":""}>Değiştir · Bedava</button>`
      :`<button class="btn primary size-l" type="button" data-act="gput">Koy · ${BIGSTAR}${d.p}</button>`}
  </div>`;}
/* S03: hangi çerçevede hangi seviye asılı. Kayıt yoksa sırayla (eski davranış, geçmiş bölümler). */
export function galSlots(G){const V=VENUES[G.v], sv=G.slots&&G.slots[G.v]; if(sv&&sv.length===V.frames.length) return sv;
  const n=Math.max(0,Math.min(V.frames.length,G.next-V.from)); return V.frames.map((_,i)=>i<n?V.from+i:null);}
export function galStats(G,s){const V=VENUES[G.v], hung=galSlots(G).filter(x=>x!=null).length, dec=V.decor.filter(d=>decorOwned(G,d.id)).length;
  return {V,hung,dec,full:hung>=V.frames.length,afford:V.decor.some(d=>!decorOwned(G,d.id)&&s.stars>=d.p)};}
export function galHint(G,s){const t=galStats(G,s); return t.full?(t.afford?"İstersen önce dekor alabilirsin":"Bölüm tamam! Kutlayalım."):t.afford?"Bir dekor alabilirsin!":`Sıradaki tablo: Seviye ${G.next}`;}
export function skyline(W){let x=0,h="",i=0; while(x<W){const w=40+((i*37)%50), y=60+((i*53)%70); h+=`<rect x="${x}" y="${y}" width="${w}" height="${150-y}" fill="${i%2?"#9DB7CF":"#B4C9DC"}"/>`; x+=w+4; i++;}
  return `<svg class="gsky" width="${W}" height="150" viewBox="0 0 ${W} 150" aria-hidden="true">${h}</svg>`;}
/* Dünya katmanı: kaydırılan her şey (duvar, çerçeveler, dekor, karakter) */
export function galWorld(G,s,view={}){
  const {V}=galStats(G,s), sl=galSlots(G);
  const frames=V.frames.map(([x,y,fw=V.fw,fh=V.fh],i)=>{const lv=sl[i], on=lv!=null;
    return `<button class="gframe${on?"":" empty"}${view.pick&&view.pick.target===i?" target":""}${view.fresh===i?" fresh":""}${view.spot===i?" spot":""}" type="button" data-act="gframe" data-i="${i}" style="left:${x}px;top:${y}px;width:${fw}px;height:${fh}px" aria-label="${on?`Seviye ${lv} tablosu`:"Boş çerçeve"}">${on?`<span class="gart">${galArt(lv)}</span>`:""}</button>`;}).join("");
  const look=view.mode&&view.mode!=="now", pv=view.s02;
  /* S02: zemindeki dekor (Halı) alt panelin altında kalmasın diye duvar yukarı kayar */
  const pd=pv&&V.decor.find(x=>x.id===pv.id), lift=pd?Math.max(0,pd.y+pd.h-388):0;
  const dec=V.decor.map(d=>{const st=`left:${d.x}px;top:${d.y}px;width:${d.w}px;height:${d.h}px`;
    if(pv&&pv.id===d.id) return `<div class="gdec on s02prev ${d.id}" style="${st}">${decorSVG(V,d,G,pv.sel)}<span class="s02tag">Önizleme</span></div>`;
    if(decorOwned(G,d.id)){const fr=view.freshDec===d.id, inner=decorSVG(V,d,G);
      if(look||!STYLES[d.id]) return `<div class="gdec on ${d.id}${fr?" fresh s02glow":""}" style="${st}">${inner}</div>`;
      return `<button class="gdec on ${d.id}${fr?" fresh s02glow":""}" type="button" data-act="gdecor" data-id="${d.id}" style="${st}" aria-label="${d.n}: ${STYLES[d.id][decSty(G,d.id)].n}, stil değiştir">${inner}</button>`;}
    if(look) return "";
    const can=s.stars>=d.p;
    return `<button class="gdec slot ${d.id}" type="button" data-act="gdecor" data-id="${d.id}" style="${st}" aria-label="${d.n}: ${d.p} yıldız${can?", alınabilir":""}"><span class="ghost">${decorSVG(V,d,G,STYLES[d.id]?0:null)}</span>${can?`<span class="gbuy">+ ${SMSTAR}${d.p}</span>`:`<span class="gprice">${SMSTAR}${d.p}</span>`}</button>`;});
  const floorDec=V.decor.filter(d=>d.id==="zemin"), other=V.decor.filter(d=>d.id!=="zemin"&&d.id!=="lamba");
  const pick=list=>list.map(d=>dec[V.decor.indexOf(d)]).join("");
  return `<div class="gin ${V.id}${view.mode&&view.mode!=="now"?" "+view.mode:""}" style="width:${V.W}px${(view.static&&view.sx)||lift?`;transform:translate(${view.static?-(view.sx||0):0}px,${-lift}px)`:""}">
    ${V.bg!=null?V.bg:`<div class="gbg"></div>${V.id==="meydan"?skyline(V.W):""}${V.id==="kahve"?`<div class="gwain"></div>`:""}<div class="gfl"></div>`}
    ${V.id==="meydan"?[...new Set(V.frames.map(f=>f[0]))].map(x=>`<i class="gboard" style="left:${x-10}px;width:${V.fw+20}px"></i>`).join(""):""}
    ${pick(floorDec)}${pick(other)}${frames}${pick(V.decor.filter(d=>d.id==="lamba"))}
    ${view.mode&&view.mode!=="now"?"":`<button class="gchar" type="button" data-act="gchar" aria-label="Ressam"${V.char?` style="left:${V.char[0]}px;top:${V.char[1]}px"`:""}>${painterSVG(V,G)}</button>`}
    ${view.bubble?`<div class="gbub" role="status">${view.bubble}</div>`:""}
    ${view.decHand&&!pv?(()=>{const d=V.decor.find(x=>x.id===view.decHand); return d&&!decorOwned(G,d.id)?`<div class="s03hand" style="left:${d.x+d.w/2-2}px;top:${d.y+d.h-40}px">${HAND}</div>`:"";})():""}
    ${view.freshDec&&!pv?(()=>{const d=V.decor.find(x=>x.id===view.freshDec); if(!d) return ""; const cx=d.x+d.w/2, cy=d.y+d.h/2;
      return GSTAR(cx-26,cy-16,9)+GSTAR(cx+30,cy+6,7)+GSTAR(cx-28,cy+28,6)+GSTAR(cx+26,cy-40,6);})():""}
  </div>`;}
/* Ekran katmanı: sabit duran HUD, tabela, ana eylem, alt menü */
/* view.vv = göz atılan bölüm (tabeladaki ◀ ▶). Geçmiş bölüm: dolu duvar, salt bakış. Gelecek bölüm: kilitli, duvar belli belirsiz. */
export const TRI=d=>`<svg viewBox="0 0 20 24" aria-hidden="true"><path d="${d==="l"?"M17 3 L3 12 L17 21Z":"M3 3 L17 12 L3 21Z"}" fill="#FFE9C7" stroke="#3D220E" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
export const LOCK=`<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="7" width="11" height="8" rx="2" fill="#FFE9C7"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="#FFE9C7" stroke-width="2"/></svg>`;
export function galMode(G,view){const vv=view.vv??G.v; return {vv,mode:vv<G.v?"past":vv>G.v?"locked":"now"};}
export function galleryHTML(G0,s,view={}){
  const {vv,mode}=galMode(G0,view), now=mode==="now";
  const AR=mode==="past"&&G0.arch&&G0.arch[vv]||{};
  const G=now?G0:{v:vv,next:mode==="past"?VENUES[vv].to+1:VENUES[vv].from,decor:AR.decor||[],sty:AR.sty||{},sx:0,slots:G0.slots};
  const {V,hung,dec,full}=galStats(G,s), pk=now&&view.pick, sx=pk?0:(view.sx||0), scroll=V.W>360;
  if(pk) view={...view,sx:0};
  if(!now||pk) view={...view,s02:null,s06:null};
  const zk=pk&&V.W>360?360/V.W:1, zh=Math.round(544*zk), zt=150+Math.round((280-zh)/2);
  const hard=G.next%10===0;
  const main=!now?`<button class="btn secondary size-l" type="button" data-act="gback">Bölümüme dön</button>`
    :view.main!=null?view.main:full?`<button class="btn gold size-l gopen" type="button" data-act="gopen" style="white-space:nowrap;font-size:20px;min-width:264px">${SPARK}Bölüm tamamlandı!</button>`
    :`<button class="btn primary size-l" type="button" data-act="gplay">Seviye ${G.next}${hard?`<span class="ghard">ZOR</span>`:""}</button>`;
  const count=mode==="locked"?`<span class="gpc" aria-label="Kilitli">${LOCK}Kilitli</span>`
    :`<span class="gpc" aria-label="Tablo ${hung} / ${V.frames.length}">${FRAMEIC}${hung}/${V.frames.length}${mode==="past"?" ✓":""}</span>${V.decor.length?`<span class="gpc" aria-label="Dekor ${dec} / ${V.decor.length}">${LAMPIC}${dec}/${V.decor.length}</span>`:""}`;
  const cur=G0.v;
  return `<div class="gal ${mode}${pk?" pick":""}${view.s02?" s02a":""}${view.s06?" s06a":""}${zk<1?" zoom":""}"${zk<1?` style="--zk:${zk.toFixed(4)};--zt:${zt}px;--zh:${zh}px"`:""} aria-label="Sergi: ${V.name}${mode==="locked"?", kilitli":""}${pk?", çerçeve seç":""}">
    <div class="gwall${view.static?" fixed":""}" data-gw>${galWorld(G,s,{...view,mode})}</div>
    ${mode==="locked"?`<div class="glock" role="status"><b>${LOCK}${V.ch+1}. Bölüm</b><span>Seviye ${V.from}’te açılır</span></div>`:""}
    ${scroll?`<button class="gchev l${sx<=4?" off":""}" type="button" data-act="gleft" aria-label="Sola kaydır">${CHEV("l")}</button><button class="gchev r${sx>=V.W-364?" off":""}" type="button" data-act="gright" aria-label="Sağa kaydır">${CHEV("r")}</button>`:""}
    <div class="hud">
      ${coinPillHTML(s,G0)}
      <div class="pill" data-pill="star" style="padding-right:12px" aria-label="Yıldız ${s.stars}">${STAR}<span>${s.stars}</span></div>
      <button class="btn secondary icon" type="button" data-act="gset" aria-label="Ayarlar">${GEAR}</button>
    </div>
    <div class="gsign"><div class="gsrow">
      ${V.ch>0?`<button class="gtri" type="button" data-act="gprevch" aria-label="Önceki bölüm: ${VENUES[V.ch-1].name}">${TRI("l")}</button>`:`<i class="gtri off"></i>`}
      <div class="sign stroke"><span class="nail"></span>${pk?(pk.last?"Son tablo!":"Çerçeve seç"):view.s06?s06Sign(view.s06):V.name+count}<span class="nail"></span></div>
      ${V.ch<VENUES.length-1?`<button class="gtri" type="button" data-act="gnextch" aria-label="Sonraki bölüm: ${VENUES[V.ch+1].name}">${TRI("r")}</button>`:`<i class="gtri off"></i>`}
    </div>${V.ch!=null?`<div class="gpath" aria-label="Kariyer: ${cur+1}. bölüm / 5${now?"":`, bakılan: ${vv+1}. bölüm`}">${[0,1,2,3,4].map(i=>`<i class="${i<cur?"done":i===cur?"now":""}${i===vv&&!now?" view":""}"></i>`).join("<b></b>")}</div>`:""}</div>
    <div class="gmain">${main}</div>${pk?pickHTML(G,V,pk,zk,zt):""}
    <nav class="nav" aria-label="Alt menü">
      ${shopTabHTML(G0)}
      <div class="tab active" aria-current="page"><div class="tb">${TABS.gal}</div>Sergi</div>
      <button class="tab${G0.next<=2?" locked":""}" type="button" data-act="gbook"${G0.next<=2?' aria-label="Defterler, kilitli"':""}>${TABS.book}${G0.next<=2?`<span class="tlock">${LOCK}</span>`:rkHasNew(G0,view)?`<span class="tdot" aria-label="Yeni"></span>`:""}Defterler</button>
    </nav>${view.s02?s02SheetHTML(V,view.s02):""}${view.s06?s06HTML(V,view.s06):""}
  </div>${view.sub||""}`;}
export function galSubHTML(g){const V=VENUES[live.G.v]; if(!g.sub) return "";
  if(g.sub.k==="bkart"||g.sub.k==="bknext") return bookSubHTML(g.sub,live.G);
  if(g.sub.k==="rkton"||g.sub.k==="rkrule") return renkSubHTML(g.sub,live.G);
  if(g.sub.k==="s50") return settingsHTML(live.G,live.set,g.sub.confirm,g.sub.info);
  if(g.sub.k==="s06") return ""; /* S06 ayna sahnesini galleryHTML çizer (view.s06) */
  if(g.sub.k==="s02") return ""; /* S02 alt paneli galleryHTML çizer (view.s02) */
  if(g.sub.k==="s04") return g.sub.ph==="card"?s04Card(g):"";
  return "";}
export function galDraw(){kaydet(); muzik("menu");live.ui.toastLow=true; const sk=live.gal.sub&&live.gal.sub.k, v={...live.gal,sub:galSubHTML(live.gal),s02:sk==="s02"?live.gal.sub:null,s06:sk==="s06"?live.gal.sub:null}; live.ui.overlay=live.gal.book?bookHTML(live.G,live.s,v):galleryHTML(live.G,live.s,v); draw(); s06Bind(); s04Apply(); s05Apply(); s21Check();}
export function galFirstEmpty(){const sl=galSlots(live.G), i=sl.indexOf(null); return i<0?sl.length-1:i;}
/* S03: havada bekleyen tablo + (Seviye 2) el ikonu. Kuş bakışında çerçeve konumu zk ile küçülür. */
export function pickHTML(G,V,pk,zk,zt){const sl=galSlots(G);
  let hand="";
  if(pk.lv===2&&!pk.last){const i=sl.indexOf(null), f=V.frames[i]; if(f){const fw=f[2]||V.fw, fh=f[3]||V.fh, oy=zk<1?zt:0;
    hand=`<div class="s03hand" style="left:${Math.round((f[0]+fw/2)*zk-10)}px;top:${Math.round(oy+(f[1]+fh)*zk-18)}px">${HAND}</div>`;}}
  return `<div class="s03hold" aria-hidden="true"><div class="pic"><span class="gart">${galArt(pk.lv)}</span></div><span class="s03tag">Seviye ${pk.lv} · yeni tablon</span></div>${hand}`;}
/* S03: tablo seçilen çerçeveye uçar, asılır, Sergi normal hâline döner */
export function galPlace(i){const g=live.gal, G=live.G; if(!g||!g.pick||g.pick.flying) return; const pk=g.pick, sc=live.el;
  pk.flying=true; pk.target=i;
  const fin=()=>{ if(live.gal!==g) return; const sl=galSlots(G).slice(); sl[i]=pk.lv; G.slots={...(G.slots||{}),[G.v]:sl};
    g.pick=null; g.fresh=i; g.focus=i; const t=galStats(G,live.s);
    efekt("sergi"); toast(`Tablon asıldı · ${t.hung}/${t.V.frames.length}`,2000); galDraw(); if(t.afford||t.full) setTimeout(()=>galBubble(),RM?0:1800);
    clearTimeout(live.galT); live.galT=setTimeout(()=>{ if(live.gal) live.gal.fresh=null; },3400);
    if(t.afford||t.full) setTimeout(()=>galBubble(),RM?0:1500); };
  galDraw();
  const hold=sc.querySelector(".s03hold"), pic=hold&&hold.querySelector(".pic"), fr=sc.querySelectorAll(".gframe")[i];
  if(RM||!hold||!fr){fin(); return;}
  sc.querySelector(".gal")?.classList.add("fly");
  const k=sc.getBoundingClientRect().width/360||1, a=pic.getBoundingClientRect(), b=fr.getBoundingClientRect();
  hold.style.transformOrigin=`${pic.offsetLeft+pic.offsetWidth/2}px ${pic.offsetTop+pic.offsetHeight/2}px`;
  requestAnimationFrame(()=>{ hold.classList.add("fly");
    hold.style.transform=`translate(${(b.left+b.width/2-a.left-a.width/2)/k}px,${(b.top+b.height/2-a.top-a.height/2)/k}px) scale(${b.width/a.width},${b.height/a.height})`; });
  setTimeout(fin,650);}
/* o.won = az önce kazanılan seviye → tablo sıradaki çerçeveye asılır (S03 çerçeve seçimi 4. bölümde) */
export function openGallery(o={}){
  const lv=live.s.lv;
  if(!live.G){const v=venueOf(lv); live.G={v,next:Math.max(lv,VENUES[v].from),decor:[],sx:0};}
  let fresh=null, pick=null;
  if(o.won!=null&&live.rkSeen==null) live.rkSeen=o.won-1; /* S41: bu kazanmayla gelen ton/kural “Yeni” olur */
  if(o.won!=null){const vi=venueOf(o.won); (live.wonArt||(live.wonArt={}))[o.won]=1;
    if(vi!==live.G.v) live.G={v:vi,next:o.won,decor:[],sx:0,slots:live.G.slots};
    if(o.won>=live.G.next){const sl=galSlots(live.G).slice(); live.G.slots={...(live.G.slots||{}),[vi]:sl}; live.G.next=o.won+1;
      const em=sl.map((x,i)=>x==null?i:-1).filter(i=>i>=0);
      /* S03: Seviye 1 kendiliğinden asılır; tek boş çerçeve kaldıysa seçim sorulmaz (“Son tablo!”, kendiliğinden uçar) */
      if(o.won===1||em.length<=1){ if(em.length===1&&o.won!==1) pick={lv:o.won,last:1,target:em[0]}; else {const i=em.length?em[0]:sl.length-1; sl[i]=o.won; fresh=i;} }
      else pick={lv:o.won};}}
  live.gal={bubble:null,fresh,freshDec:null,sub:null,pick,focus:pick?null:(fresh??galFirstEmpty())};
  {const V=VENUES[live.G.v], d=V.decor.find(x=>!decorOwned(live.G,x.id)&&live.s.stars>=x.p); if(d&&!live.seen["decor:hand"]) live.gal.decHand=d.id;}
  if(pick&&pick.last&&!o.static){const g=live.gal; setTimeout(()=>{ if(live.gal===g&&g.pick) galPlace(g.pick.target); },RM?300:900);}
  live.mode="popup"; live.ui.sel=null; live.ui.aim=false; live.ui.pick=null; live.ui.pickCan=null; clearTimeout(live.idleT); live.showHint=false;
  if(fresh!=null){ clearTimeout(live.galT); live.galT=setTimeout(()=>{ if(live.gal) live.gal.fresh=null; },3400);
    if(galStats(live.G,live.s).afford||galStats(live.G,live.s).full) setTimeout(()=>galBubble(),RM?0:1500); }}
export function galBubble(txt){const g=live.gal; if(!g||g.sub) return; g.bubble=txt||galHint(live.G,live.s); galDraw();
  clearTimeout(live.bubT); const b=g.bubble; live.bubT=setTimeout(()=>{ if(live.gal&&live.gal.bubble===b){live.gal.bubble=null; live.el.querySelector(".gbub")?.remove();} },2800);}
/* Çizimden sonra: kaydırma konumu geri gelir, kamera odaklanır, fare ile sürükleme ve tekerlek */
export function galAfter(){ if(live.gal&&live.gal.book){bookAfter(); return;}
  const w=live.el.querySelector("[data-gw]"); if(!w||!live.gal) return; const G=live.G, g=live.gal, V=VENUES[g.vv??G.v];
  w.style.scrollBehavior="auto"; w.scrollLeft=(g.vv!=null&&g.vv!==G.v)||g.pick?0:(G.sx||0); w.style.scrollBehavior="";
  if(g.pick) return;
  const upd=()=>{if(g.vv==null||g.vv===G.v) G.sx=w.scrollLeft; const l=live.el.querySelector(".gchev.l"), r=live.el.querySelector(".gchev.r");
    l&&l.classList.toggle("off",w.scrollLeft<=4); r&&r.classList.toggle("off",w.scrollLeft>=w.scrollWidth-w.clientWidth-4);};
  w.addEventListener("scroll",upd,{passive:true}); upd();
  w.addEventListener("wheel",e=>{ if(w.scrollWidth>w.clientWidth&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){ w.scrollLeft+=e.deltaY; e.preventDefault(); } },{passive:false});
  let d=null;
  w.addEventListener("pointerdown",e=>{ if(e.pointerType==="mouse") d={x:e.clientX,s:w.scrollLeft,m:false}; });
  w.addEventListener("pointermove",e=>{ if(!d) return; const dx=e.clientX-d.x; if(Math.abs(dx)>6){d.m=true; w.style.scrollBehavior="auto";} if(d.m) w.scrollLeft=d.s-dx; });
  w.addEventListener("pointerup",()=>{ if(d&&d.m){ live.galMoved=true; setTimeout(()=>{live.galMoved=false;},0); } w.style.scrollBehavior=""; d=null; });
  w.addEventListener("pointerleave",()=>{ d=null; w.style.scrollBehavior=""; });
  if(g.focus!=null){const f=V.frames[g.focus]; g.focus=null;
    if(f){const fw=f[2]||V.fw, vis=f[0]>=w.scrollLeft+8&&f[0]+fw<=w.scrollLeft+w.clientWidth-8;
      if(!vis){const t=Math.max(0,Math.min(w.scrollWidth-w.clientWidth,f[0]+fw/2-180)); setTimeout(()=>w.scrollTo({left:t,behavior:RM?"auto":"smooth"}),RM?0:250);}}}}
export function galClick(pa,act){const G=live.G, g=live.gal, V=VENUES[G.v];
  if(live.galMoved) return;
  if(g.pick){ if(pa==="gframe"&&!g.pick.last){const i=+act.dataset.i; if(galSlots(G)[i]==null) galPlace(i);} return; } /* S03: yanlış dokunuş cezasız, başka hiçbir şey çalışmaz */
  if(g.sub){
    if(g.sub.k==="s05"){ if(pa==="s05skip") s05Go(g,g.sub); return; }
    if(g.sub.k==="s06"){ s06Click(pa,act,g); return; }
    if(g.sub.k==="s04"&&pa!=="gnextv"){ const sb=g.sub; if(pa==="s04skip"&&sb.ph!=="card"){sb.ph="card"; galDraw();} else if(pa==="s04chest"&&!sb.open) s04OpenChest(sb); return; }
    if(g.sub.k==="s02"){const d=V.decor.find(x=>x.id===g.sub.id), sb=g.sub, nm=STYLES[d.id][sb.sel].n;
      if(pa==="s02noop") return;
      if(pa==="s02opt"){ sb.sel=+act.dataset.i; galDraw(); return; }
      if(pa==="gput"){ if(sb.used!=null){ if(sb.sel===sb.used) return; G.sty={...(G.sty||{}),[d.id]:sb.sel}; g.sub=null; toast(`${nm} kondu · bedava`); }
        else if(live.s.stars>=d.p){ live.s.stars-=d.p; G.decor.push(d.id); G.sty={...(G.sty||{}),[d.id]:sb.sel}; g.freshDec=d.id; g.sub=null; toast(`${nm} kondu · −${d.p} yıldız`);
          clearTimeout(live.decT); live.decT=setTimeout(()=>{ if(live.gal&&live.gal.freshDec===d.id){live.gal.freshDec=null; if(!live.gal.sub&&!live.gal.book) galDraw();} },1400);
          if(galStats(G,live.s).full&&!galStats(G,live.s).afford) setTimeout(()=>galBubble(),RM?0:900); } }
      else g.sub=null; /* ×, duvar ya da başka bir yere dokunmak paneli kapatır, hiçbir şey harcanmaz */
      galDraw(); return; }
    else if(pa==="gsubclose"||pa==="closecard"||pa==="bkclose") g.sub=null;
    else if(pa==="bkgo"){ bookGoWall(g.sub.lv); return; }
    else if(pa==="bkart"){ g.sub={k:"bkart",lv:+act.dataset.lv}; }
    else if(pa==="rkok") g.sub=null;
    else if(g.sub.k==="s50"){ if(!s50Click(pa,act,g)) return; if(!live.gal) return; }
    else if(pa==="gplay"){ g.sub=null; g.book=null; ensureLevel(G.next); startLevel(G.next,{keep:1}); return; }
    else if(pa==="gnextv"){ g.sub=null;
      if(G_LAST()) toast("Bütün salonlar tamamlandı · tebrikler!",2600);
      else {G.arch={...(G.arch||{}),[G.v]:{decor:G.decor.slice(),sty:{...(G.sty||{})}}}; const amt=CHEST_AMT[G.v]; G.v++; G.decor=[]; G.sty={}; G.sx=0;
        /* S05 perde (yeni bölümün boş duvarı) → S06 ayna (önceki kişinin 1. kıyafeti seçili, × yok); bildirim seçimden sonra */
        s05Start({k:"s06",sel:lookOf(G).k==="m"?3:0,first:!G.look,msg:`${G.v+1}. Bölüm · ${VENUES[G.v].name} · sandık +${amt} coin`});}}
    else return;
    galDraw(); return; }
  const w=live.el.querySelector("[data-gw]");
  if(g.book){ bookClick(pa,act); return; }
  if(g.vv!=null&&g.vv!==G.v&&pa==="gframe"){const VV=VENUES[g.vv]; if(g.vv<G.v){const sv=G.slots&&G.slots[g.vv]; g.sub={k:"bkart",lv:sv&&sv.length===VV.frames.length?sv[+act.dataset.i]:VV.from+(+act.dataset.i),wall:1};} else toast(`Bu bölüm Seviye ${VV.from}’te açılır`); galDraw(); return;}
  switch(pa){
    case "gplay": ensureLevel(G.next); startLevel(G.next,{keep:1}); return;
    case "gopen": s04Start(); break;
    case "gdecor": {const d=V.decor.find(x=>x.id===act.dataset.id);
      g.decHand=null; live.seen["decor:hand"]=true; g.bubble=null;
      if(decorOwned(G,d.id)) g.sub={k:"s02",id:d.id,sel:decSty(G,d.id),used:decSty(G,d.id)};
      else if(live.s.stars>=d.p) g.sub={k:"s02",id:d.id,sel:0}; else toast(`${d.p} yıldız gerek · seviye kazan`); break;}
    case "gframe": {const i=+act.dataset.i, lv=galSlots(G)[i];
      if(lv!=null) g.sub={k:"bkart",lv,wall:1}; else toast("Bir seviye kazan, tablonu buraya as"); break;}
    case "gprevch": case "gnextch": {const n=Math.max(0,Math.min(VENUES.length-1,(g.vv??G.v)+(pa==="gnextch"?1:-1))); g.vv=n===G.v?null:n; g.bubble=null; break;}
    case "gback": g.vv=null; break;
    case "gchar": galBubble(); return;
    case "gset": g.sub={k:"s50"}; break;
    case "gshop": openShopFull(); break;
    case "gbook": if(G.next<=2){toast("Defterler Seviye 2’den sonra açılır"); break;} g.book={tab:rkHasNew(G)?"renk":(live.bkLast||"eskiz")}; g.bkTop=null; g.rkTop=null; g.bubble=null; g.vv=null; break;
    case "gleft": if(w) w.scrollBy({left:-220,behavior:RM?"auto":"smooth"}); return;
    case "gright": if(w) w.scrollBy({left:220,behavior:RM?"auto":"smooth"}); return;
    default: return; }
  galDraw();}

