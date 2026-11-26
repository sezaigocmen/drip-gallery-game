// ekranlar/magaza.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { RM, busy, done, draw, kivilcim, live, toast } from "../akis.js";
import { COIN, COINIC, ICON, STAR, XICON } from "../cizim/ikonlar.js";
import { GEAR, TABS } from "../cizim/mekanlar.js";
import { P } from "../cizim/tablo.js";
import { rkLeave } from "./defterler.js";
import { rel } from "./egitim.js";
import { CHECK, LOCK, galClick, galDraw } from "./sergi.js";
import { coinVardi, efekt } from "../ses.js";

/* ================= 5 · Mağaza (S20, S21, S22): çizim kodu =================
   Kaynak araclar/magaza.js (oneri17/18/19.js'in seçilen hâlleri). Sabit kartlar (bolum5-uret.mjs) window.MG'yi kullanır.
   S20 · B Vitrin + B Alt panel "Coin al" · S21 · A Sergi'ye dönünce + B 48 saat sayaç · S22 · B Nötr ödeme sayfası + A Ödül kartı "Topla". */
export const MG=(()=>{
const fmt=n=>n.toLocaleString("tr-TR");
const PK=[{id:"s",n:400,p:"34,99",b:0,k:1},{id:"m",n:1000,p:"74,99",b:17,k:2},{id:"l",n:2400,p:"149,99",b:40,k:3,best:1}];
const C1=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#FFC21A" stroke="#A86A00" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${r*.58}" fill="none" stroke="#E09A00" stroke-width="1.6"/>`;
const PILE={1:[[24,28,11],[38,24,11]],2:[[16,32,10],[30,34,10],[44,32,10],[23,20,10],[37,20,10]],3:[[10,36,9],[23,38,9],[37,38,9],[50,36,9],[16,26,9],[30,27,9],[44,26,9],[23,16,9],[37,16,9],[30,7,8]]};
const pile=(k,cls="pile")=>`<svg${cls?` class="${cls}"`:""} viewBox="0 0 60 48" aria-hidden="true">${PILE[k].map(c=>C1(...c)).join("")}</svg>`;
const GIFT=`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="21" width="36" height="23" rx="3" fill="#E8503A" stroke="#7A1F12" stroke-width="2.5"/><rect x="3" y="13" width="42" height="10" rx="3" fill="#FF6A4D" stroke="#7A1F12" stroke-width="2.5"/><rect x="21" y="13" width="6" height="31" fill="#FFC21A" stroke="#A86A00" stroke-width="2"/><path d="M24 13c-3-8-13-9-12-3 1 3 8 3 12 3zM24 13c3-8 13-9 12-3-1 3-8 3-12 3z" fill="#FFC21A" stroke="#A86A00" stroke-width="2" stroke-linejoin="round"/></svg>`;
const NOAD=`<svg viewBox="0 0 54 40" aria-hidden="true"><rect x="8" y="5" width="38" height="28" rx="5" fill="#5BA8E8" stroke="#1E4E7A" stroke-width="2.5"/><path d="M23 12v14l12-7z" fill="#fff"/><path d="M12 36L42 2" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M12 36L42 2" stroke="#D93A2B" stroke-width="4.5" stroke-linecap="round"/></svg>`;
const TMR=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8.5" fill="#fff" stroke="#B3261E" stroke-width="2.4"/><path d="M12 8.5V13l3 2" fill="none" stroke="#B3261E" stroke-width="2.4" stroke-linecap="round"/><path d="M9 2.5h6" stroke="#B3261E" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const WIFI=`<svg class="ic" viewBox="0 0 48 48" aria-hidden="true"><path d="M6 19a26 26 0 0 1 36 0M12 26a17 17 0 0 1 24 0M18 33a8 8 0 0 1 12 0" fill="none" stroke="#8A6A4A" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="39" r="3.5" fill="#8A6A4A"/><path d="M10 8l28 34" stroke="#fff" stroke-width="8" stroke-linecap="round"/><path d="M10 8l28 34" stroke="#D93A2B" stroke-width="4.5" stroke-linecap="round"/></svg>`;
const BUY=(p,k)=>`<button class="btn primary size-s sp-buy" type="button" data-act="mgbuy" data-k="${k}">₺${p}</button>`;
const ITEMS=`<div class="s21grid"><span class="s21it">${COIN}500 coin</span><span class="s21it">${ICON.undo}Geri Al ×3</span><span class="s21it">${ICON.tube}Tüp ×3</span><span class="s21it">${ICON.turp}Terebentin ×3<em>Sv 15</em></span></div>`;

/* ===== S20 Mağaza (B vitrin). data-tmr: canlı sayaç saniyede bir güncellenir ===== */
function starterHTML(tm){return `<div class="sp-start panel">
  <div class="sp-top"><b class="stroke">Başlangıç paketi</b><span class="sp-once sp-tmr" data-tmr="hms">${TMR}${tm||"46:12:05"}</span></div>
  <div class="sp-in">${GIFT}<div class="sp-chips"><span class="sp-chip">${COIN}<b>500</b></span><span class="sp-chip">${ICON.undo}<b>×3</b></span><span class="sp-chip">${ICON.tube}<b>×3</b></span><span class="sp-chip">${ICON.turp}<b>×3</b></span></div>
    <div class="sp-pay">${BUY("39,99","st")}<small>~3 kat değer</small></div></div></div>`;}
function gridHTML(fit){return `<div class="sp-grid">${PK.map(k=>`<div class="sp-card${k.best?" best":""}${fit===k.id?" fit":""}">${fit===k.id?`<span class="sp-fit">Yeter</span>`:k.best?`<span class="sp-rib">En iyi değer</span>`:""}${pile(k.k)}<b>${fmt(k.n)}</b><small>coin${k.b?`<i class="sp-bon">+%${k.b}</i>`:""}</small>${BUY(k.p,k.id)}</div>`).join("")}</div>`;}
function adRow(own){return `<div class="sp-row${own?" own":""}">${NOAD}<div class="t"><b>Reklamsız</b><small>Ara reklamlar kalkar</small></div>${own?`<span class="sp-own">${CHECK}Alındı</span>`:BUY("99,99","ad")}</div>`;}
/* o: {starter:bool, tm:"sa:dk:sn", own:bool, sub:"html (galsub içine)"} */
function shopHTML(s,o={}){
  return `<div class="gal book shop" aria-label="Mağaza">
    <div class="hud">
      <div class="pill" data-pill="coin" aria-label="Coin ${s.coins}" style="padding-right:12px">${COINIC}<span>${fmt(s.coins)}</span></div>
      <div class="pill" data-pill="star" style="padding-right:12px" aria-label="Yıldız ${s.stars}">${STAR}<span>${s.stars}</span></div>
      <button class="btn secondary icon" type="button" data-act="mgset" aria-label="Ayarlar">${GEAR}</button>
    </div>
    <div class="gsign"><div class="sign stroke"><span class="nail"></span>Mağaza<span class="nail"></span><span class="sp-demo">DEMO</span></div></div>
    <div class="shl">${o.starter?starterHTML(o.tm):""}<div class="sp-h">Coin paketleri</div>${gridHTML()}${adRow(o.own)}</div>
    <nav class="nav" aria-label="Alt menü">
      <div class="tab active" aria-current="page"><div class="tb">${TABS.shop}</div>Mağaza</div>
      <button class="tab" type="button" data-act="mgsergi">${TABS.gal}Sergi</button>
      <button class="tab" type="button" data-act="mgbook">${TABS.book}Defterler</button>
    </nav>
    ${o.sub?`<div class="galsub">${o.sub}</div>`:""}
  </div>`;}
/* seviye içinden: alt panel "Coin al" (B). o: {item, need, fit, starter, hrs} */
function sheetHTML(o){return `<div class="scrim soft" data-act="mgclose"></div><div class="sp-sheet panel" role="dialog" aria-label="Coin al"><span class="grab"></span>
  <div class="sign size-l stroke"><span class="nail"></span>Coin al<span class="nail"></span></div>
  <button class="btn danger icon sp-x" type="button" data-act="mgclose" aria-label="Kapat">${XICON}</button>
  <p class="sp-need">${COIN}<span>${o.item} için <b>${o.need} coin</b> eksik</span></p>
  ${gridHTML(o.fit)}
  ${o.starter?`<div class="sp-mini">${GIFT}<div class="t"><b>Başlangıç paketi <i class="sp-hrs" data-tmr="h">${o.hrs||46} sa</i></b><small>500 coin + 9 booster</small></div>${BUY("39,99","st")}</div>`:""}
  <p class="sp-dnote">DEMO · gerçek ödeme alınmaz</p></div>`;}

/* ===== S21 Başlangıç paketi teklifi (A Sergi'ye dönünce, B 48 saat sayaç) ===== */
function s21HTML(tm){return `<div class="scrim"></div><div class="popup panel s21" role="dialog" aria-label="Başlangıç paketi teklifi">
  <div class="sign size-l stroke"><span class="nail"></span>Başlangıç paketi<span class="nail"></span></div>
  <button class="btn danger icon close" type="button" data-act="mglater" aria-label="Kapat">${XICON}</button>
  <span class="hardtag stroke">TEK SEFERLİK</span>
  <div class="body">
    <p class="s21new">Mağaza açıldı!</p>
    <div class="s21gift">${GIFT}</div>
    ${ITEMS}
    <p class="s21val">Ayrı ayrı ~1.310 coin · <b>~3 kat değer</b></p>
    <p class="s21tmr" data-tmr="kaldi">${TMR}${tm||"47:59:12"} kaldı</p>
  </div>
  <button class="btn primary size-l" type="button" data-act="mgbuy" data-k="st">₺39,99</button>
  <p class="s21note">Süre bitince teklif kaybolur</p>
  <button class="btn-text" type="button" data-act="mglater">Belki sonra</button></div>`;}

/* ===== S22 Satın alma onayı (B nötr ödeme sayfası) ===== */
const PROD={s:{n:"400 coin",p:"34,99",k:1,c:400},m:{n:"1.000 coin",p:"74,99",k:2,c:1000},l:{n:"2.400 coin",p:"149,99",k:3,c:2400},st:{n:"Başlangıç paketi",p:"39,99",c:500},ad:{n:"Reklamsız",p:"99,99",c:0}};
const prodIc=P=>P.k?pile(P.k,""):P===PROD.ad?NOAD:GIFT;
function s22bHTML(o={}){const P=PROD[o.k||"m"]; return `<div class="s22scrim"></div><div class="s22sys" role="dialog" aria-label="Ödeme sayfası (demo)"><span class="grab"></span>
  <div class="hd"><b>Ödeme<span class="s22tag">DEMO</span></b><span class="x" data-act="mgno" role="button" aria-label="Kapat">✕</span></div>
  <div class="prod"><span class="ap">${prodIc(P)}</span><span class="t"><b>${P.n}</b><small>Drip Gallery · oyun içi ürün</small></span><span class="pr">₺${P.p}</span></div>
  <div class="rows"><div><span>Ödeme yöntemi</span>Yok (demo)</div><div><span>Ödenecek</span>₺0,00</div></div>
  <button class="ok${o.busy?" busy":""}" type="button" data-act="mgok">${o.busy?`<i class="s22spin"></i>İşleniyor…`:"Onayla (demo)"}</button>
  <span class="no${o.busy?" off":""}" data-act="mgno" role="button">Vazgeç</span>
  <p class="note">Gerçek ödeme alınmaz. Yayındaki oyunda bu adımda telefonun kendi mağaza ödeme sayfası açılır.</p></div>`;}
/* A: ödül kartı "Topla". k: "st" Başlangıç paketi | "s" | "m" | "l" coin paketi | "ad" Reklamsız */
function s22rwHTML(k="st"){const P=PROD[k]; return `<div class="scrim"></div><div class="popup panel s04card s22rw nopop" role="dialog" aria-label="Satın alındı">
  <div class="sign size-l stroke"><span class="nail"></span>Satın alındı!<span class="nail"></span></div>
  <div class="body">${k==="st"?`<div class="s21gift">${GIFT}</div>${ITEMS}<p class="s22ok">Hepsi hesabına eklendi</p>`
    :k==="ad"?`<div class="s21gift">${NOAD}</div><p class="s22n">Reklamsız</p><p class="s22ok">Ara reklamlar kalktı</p>`
    :`${pile(P.k)}<p class="s22n">${P.n}</p><p class="s22ok">Hesabına eklendi</p>`}</div>
  <button class="btn primary size-l" type="button" data-act="mgtopla">${k==="ad"?"Tamam":"Topla"}</button></div>`;}
function s22errHTML(){return `<div class="scrim"></div><div class="popup panel s22err" role="dialog" aria-label="Ödeme alınmadı">
  <div class="sign size-l stroke"><span class="nail"></span>Ödeme alınmadı<span class="nail"></span></div>
  <div class="body">${WIFI}<p>Bağlantı koptu.</p><p class="s22e2">Paran çekilmedi, coin eklenmedi.<br>Hazır olunca tekrar deneyebilirsin.</p></div>
  <button class="btn primary size-l" type="button" data-act="mgok">Tekrar dene</button>
  <button class="btn-text" type="button" data-act="mgno">Vazgeç</button></div>`;}
/* sabit kart için: coinler yay çizerek sayaca uçar (donmuş kare) */
function fly(sc,from){const p=sc.querySelector(".hud .pill[data-pill=coin]"); if(!p) return; p.classList.add("s22bump");
  const r=sc.getBoundingClientRect(), q=p.getBoundingClientRect(), tx=q.left-r.left+8, ty=q.top-r.top+4, [fx,fy]=from;
  const cx=(fx+tx)/2+60, cy=Math.min(fy,ty)+40;
  sc.insertAdjacentHTML("beforeend",`<svg class="s22arc" viewBox="0 0 360 640"><path d="M${fx+12} ${fy+12}Q${cx} ${cy} ${tx+12} ${ty+12}" fill="none" stroke="rgba(255,226,122,.9)" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/></svg>`);
  [.2,.45,.7].forEach(t=>{const x=(1-t)**2*fx+2*(1-t)*t*cx+t*t*tx, y=(1-t)**2*fy+2*(1-t)*t*cy+t*t*ty;
    sc.insertAdjacentHTML("beforeend",`<span class="s22fly" style="left:${x}px;top:${y}px">${COIN}</span>`);});}
return {shopHTML,sheetHTML,s21HTML,s22bHTML,s22rwHTML,s22errHTML,fly,fmt,PK,PROD};
})();
window.MG=MG;

/* ================= 5 · Mağaza: canlı akış =================
   Mağaza Seviye 12'ye ulaşınca açılır (öncesi: sekme kilitli, sayaçta "+" yok, S11b/S13'te "Mağazaya git" yerine nasıl coin kazanılacağı).
   live.shop = {v:"full"|"sheet"|"s21", pay:{k,busy}|null, rw:k|null, item, price, ret}: oyun ya da Sergi'nin üstüne çizilen katman.
   live.st = {t0, clk, bought, noads, s21, dot, bonus}: Başlangıç paketi sayacı (gerçek saat + Ayarlar'daki "1 gün ileri sar"). */
export const SHOP_LV=12, ST_MS=48*3600e3;
export const shopOpenAt=lv=>lv>=SHOP_LV;
export const mgSt=()=>live.st||(live.st={t0:null,clk:0,bought:false,noads:false,s21:false,dot:false,bonus:null});
export const mgNow=()=>Date.now()+mgSt().clk;
export const stLeft=()=>{const t=mgSt(); return t.t0==null?ST_MS:Math.max(0,ST_MS-(mgNow()-t.t0));};
export const stActive=()=>!mgSt().bought&&stLeft()>0;
export const stStart=()=>{const t=mgSt(); if(t.t0==null) t.t0=mgNow();};
export const hms=ms=>{const s=Math.ceil(ms/1000), p=n=>String(n).padStart(2,"0"); return `${p(Math.floor(s/3600))}:${p(Math.floor(s/60)%60)}:${p(s%60)}`;};
export const stHrs=()=>Math.max(1,Math.ceil(stLeft()/3600e3));
/* Sergi alt menüsü ve coin sayacı (galleryHTML ve bookHTML ortak) */
export function shopTabHTML(G0){const lk=!shopOpenAt(G0.next), dot=!lk&&live.st&&live.st.dot&&stActive();
  return `<button class="tab${lk?" locked":""}" type="button" data-act="gshop"${lk?' aria-label="Mağaza, kilitli"':""}>${TABS.shop}${lk?`<span class="tlock">${LOCK}</span>`:dot?`<span class="tdot" aria-label="Yeni"></span>`:""}Mağaza</button>`;}
export function coinPillHTML(s,G0){const lk=!shopOpenAt(G0.next);
  return `<button class="pill" type="button" data-act="gshop" data-pill="coin" aria-label="Coin ${s.coins}${lk?"":", mağaza"}"${lk?' style="padding-right:12px"':""}>${COINIC}<span>${s.coins}</span>${lk?"":`<span class="plus">+</span>`}</button>`;}
export const SHOP_EARN=`<p class="sp-earn">Her kazanılan seviye +20 coin.<br>Mağaza Seviye ${SHOP_LV}’de açılır.</p>`;
export function shopLayerHTML(){const sh=live.shop, s=live.s, st=stActive(); let h="";
  if(st&&sh.v!=="sheet") stStart();
  if(sh.v==="full") h=MG.shopHTML(s,{starter:st,tm:hms(stLeft()),own:mgSt().noads});
  else if(sh.v==="sheet"){const need=Math.max(0,sh.price-s.coins), fit=(MG.PK.find(k=>k.n>=need)||MG.PK[2]).id;
    h=MG.sheetHTML({item:sh.item,need,fit,starter:st&&mgSt().t0!=null,hrs:stHrs()});}
  else if(sh.v==="s21") h=`<div class="galsub">${MG.s21HTML(hms(stLeft()))}</div>`;
  if(sh.pay) h+=MG.s22bHTML({k:sh.pay.k,busy:sh.pay.busy});
  if(sh.rw) h+=MG.s22rwHTML(sh.rw);
  return `<div class="mglayer">${h}</div>`;}
/* Sergi'den tam ekran Mağaza */
export function openShopFull(){const G=live.G; if(!shopOpenAt(G.next)){toast(`Mağaza Seviye ${SHOP_LV}’de açılır`); return false;}
  mgSt().dot=false; live.gal.bubble=null; live.shop={v:"full",pay:null,rw:null}; return true;}
/* seviye içinden: alt panel "Coin al"; ret = kapanınca altta duran kartı yeniden çizer (S11b ya da S13) */
export function openSheet(item,price,ret){ if(!shopOpenAt(live.s.lv)) return; live.shop={v:"sheet",item,price,ret,pay:null,rw:null}; draw();}
export function s21Check(){const g=live.gal;
  if(!g||!g.won21||!live.G||!shopOpenAt(live.G.next)||mgSt().s21||!stActive()) return;
  clearTimeout(live.s21T); live.s21T=setTimeout(()=>{const g2=live.gal; if(!g2||g2!==g||g2.pick||g2.sub||g2.book||live.shop||mgSt().s21||busy) return;
    mgSt().s21=true; g2.won21=false; g2.bubble=null; live.ui.toast=null; live.shop={v:"s21",pay:null,rw:null}; draw();},RM?0:2200);} /* “Tablon asıldı” notu bittikten sonra */
export function shopGrant(k){const P=MG.PROD[k], s=live.s, t=mgSt();
  if(k==="ad"){t.noads=true; return;}
  s.coins+=P.c;
  if(k==="st"){t.bought=true; t.dot=false; if(live.gal) t.bonus={undo:3,extra:3,turp:3}; else {s.undo+=3; s.extra+=3; s.turp+=3;}}}
export function coinFly(fr,sel){const t=live.el.querySelector(sel); if(!t) return; if(!fr||RM||live.set.rm) efekt("coin"); else for(let j=0;j<6;j++) setTimeout(()=>{coinVardi(j); kivilcim(t);},560+j*70); /* A9 · 5B */ (t.closest(".pill,.bal")||t).classList.add("s22bump");
  if(!fr||RM||live.set.rm) return; const tr=rel(t,live.el);
  for(let j=0;j<6;j++){const el=document.createElement("div"); el.className="flycoin"; el.style.zIndex=60; el.innerHTML=COINIC.replace('class="ic"','style="width:26px;height:26px"'); live.el.appendChild(el);
    done(el.animate([{transform:`translate(${fr.x+fr.w/2-13+(j%3-1)*14}px,${fr.y-6}px) scale(1.2)`},{transform:`translate(${tr.x+tr.w/2-13}px,${tr.y+tr.h/2-13}px) scale(.7)`}],
      {duration:560,delay:j*70,easing:"cubic-bezier(.5,0,.75,0)",fill:"both"}),1000+j*70).then(()=>el.remove());}}
export function shopClose(fr){const sh=live.shop; live.shop=null; if(sh&&sh.ret) sh.ret();
  if(live.gal) galDraw(); else draw();
  if(fr){ if(live.gal) coinFly(fr,'[data-pill="coin"] .ic');
    else {const b=live.el.querySelector(".popup .bal"); if(b){b.classList.add("sp-glow"); coinFly(fr,".popup .bal .coin");}}}}
/* Topla: ödül kartı kapanır, ödül şimdi yazılır (sayaç Topla'ya kadar değişmez), coinler sayaca uçar */
export function shopCollect(){const sh=live.shop, k=sh.rw, b=live.el.querySelector(".s22rw .btn"), fr=b?rel(b,live.el):null; sh.rw=null; shopGrant(k);
  if(sh.v!=="full"){ if(sh.v==="s21"&&k==="st") toast("Paket hesabında · booster’lar sıradaki seviyede",2600); shopClose(k==="ad"?null:fr); return; } /* not önce: kapanış çizimiyle görünür */
  draw(); if(k!=="ad") coinFly(fr,'.mglayer [data-pill="coin"] .ic');}
export function shopClick(pa,act){const sh=live.shop;
  if(sh.rw){ if(pa==="mgtopla") shopCollect(); return; }
  if(sh.pay){ if(sh.pay.busy) return; /* işlenirken her şey kilitli: çift satın alma olmaz */
    if(pa==="mgno"){ sh.pay=null; draw(); }
    if(pa==="mgok"){ sh.pay.busy=1; draw(); setTimeout(()=>{ if(live.shop!==sh||!sh.pay) return; sh.rw=sh.pay.k; sh.pay=null; draw(); },RM?0:800); }
    return; }
  if(pa==="mgbuy"){ const k=act.dataset.k; if(k==="ad"&&mgSt().noads) return; if(k==="st"&&!stActive()) return; sh.pay={k}; draw(); return; }
  if(sh.v==="full"){const g=live.gal;
    if(pa==="mgsergi"){ if(g.book){rkLeave(); live.bkSeen=live.G.next-1; g.book=null; g.sub=null;} shopClose(); }
    if(pa==="mgbook"){ shopClose(); if(!g.book) galClick("gbook",act); }
    if(pa==="mgset"){ shopClose(); g.sub={k:"s50"}; galDraw(); }
    return; }
  if(sh.v==="sheet"){ if(pa==="mgclose") shopClose(); return; }
  if(sh.v==="s21"&&pa==="mglater"){ mgSt().dot=true; toast("Paket 48 saat Mağaza’da",2600); shopClose(); }}
/* sayaç: görünen [data-tmr] saniyede bir güncellenir; süre bitince paket sessizce kalkar */
setInterval(()=>{ if(typeof live==="undefined"||!live.st) return; const els=live.el.querySelectorAll("[data-tmr]"); if(!els.length) return;
  if(!stActive()){ if(live.shop&&live.shop.pay&&live.shop.pay.k==="st") return; if(live.shop&&live.shop.v==="s21") live.shop=null; if(live.gal&&!live.shop) galDraw(); else draw(); return; }
  const L=stLeft(); els.forEach(e=>{const f=e.dataset.tmr; e.lastChild.textContent=f==="h"?stHrs()+" sa":hms(L)+(f==="kaldi"?" kaldı":"");});},1000);

