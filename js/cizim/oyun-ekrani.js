// cizim/oyun-ekrani.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { done, wait } from "../akis.js";
import { BOOK, BULB, COIN, COINIC, ICON, PLAY, QS, RETRY, SPLAT, SPLATS, STAR, XICON, bdg } from "./ikonlar.js";
import { MIXBUB, symG, symSVG, symW } from "./semboller.js";
import { paintingSVG } from "./tablo.js";
import { canSVG, tubeHTML } from "./tup.js";
import { SHOP_EARN, shopOpenAt } from "../ekranlar/magaza.js";
import { RG, SEC, preview, splitPreview } from "../motor/kurallar.js";
import { COL, INK, NAME, PARTS } from "../veri/renkler.js";
import { LEVELS } from "../veri/seviyeler.js";

/* S11b: fiyatlar GDD bölüm 5 */
export const SHOP={undo:{n:"Geri Al",d:"Son hamleyi geri alır.",p:60},tube:{n:"Ekstra Tüp",d:"Bu seviye için 1 boş tüp.",p:120},turp:{n:"Terebentin",d:"Bir karışımı ana renklerine ayırır.",p:90},ready:{n:"Hazır Kutu",d:"Seviyeye rafta 1 hazır kutuyla başla.",p:100}};
export function buyCardHTML(s,key){const b=SHOP[key], ok=s.coins>=b.p, lk=!shopOpenAt(s.lv);
  return `<div class="scrim"></div><div class="popup panel buycard"><div class="sign size-l stroke"><span class="nail"></span>${b.n}<span class="nail"></span></div>
  <button class="btn danger icon close" type="button" data-act="closecard" aria-label="Kapat">${XICON}</button>
  <div class="body"><div class="bigb">${ICON[key]}</div><p>${b.d}</p><p class="bal${ok?"":" bad"}">${COIN}<span>${ok?`Sende ${s.coins} coin`:`Sende ${s.coins} / gereken ${b.p}`}</span></p>${!ok&&lk?SHOP_EARN:""}</div>
  ${ok?`<button class="btn primary size-l" type="button" data-act="buy">Kullan<span class="price">${COIN}${b.p}</span></button>`:lk?`<button class="btn primary size-l" type="button" data-act="closecard">Tamam</button>`:`<button class="btn primary size-l" type="button" data-act="store">Mağazaya git</button>`}
  ${!ok&&lk?"":`<button class="btn-text" type="button" data-act="closecard">Vazgeç</button>`}</div>`;}
export function pauseHTML(s,set,confirm){
  const L=LEVELS[s.lv], ft=!!L.ftue, n=L.regions.length, p=L.regions.filter(r=>s.painted[r.id]).length;
  const prog=sub=>`<div class="pz-prog"><span class="pz-thumb">${paintingSVG(s,{})}</span><span class="t"><p>${p} / ${n} bölge</p><p class="sm">${sub}</p></span></div>`;
  const sign=t=>`<div class="sign size-l stroke"><span class="nail"></span>${t}<span class="nail"></span></div>`;
  if(confirm){const ex=confirm==="exit";
    return `<div class="scrim"></div><div class="popup panel pausecard">${sign(ex?"Sergiye dön?":"Baştan başla?")}
    <div class="body">${prog(ex?"tablo yarım kalır":"tablo sıfırlanır")}<p class="warn">Kullandığın booster’lar geri gelmez.</p></div>
    <button class="btn primary size-l" type="button" data-act="resume">Oynamaya devam</button>
    <button class="btn-text" type="button" data-act="${ex?"doexit":"dorestart"}">${ex?"Yine de çık":"Yine de baştan başla"}</button></div>`;}
  const toggles=`<div class="qset">${QS.map(([k,t,ic])=>`<div class="q"><button class="btn secondary icon${set[k]?"":" off"}" type="button" data-act="qs" data-k="${k}" aria-pressed="${set[k]}" aria-label="${t}">${ic}</button><span>${t}</span></div>`).join("")}</div>`;
  return `<div class="scrim"></div><div class="popup panel pausecard${ft?" ft":""}">${sign("Mola")}
    <button class="btn danger icon close" type="button" data-act="resume" aria-label="Kapat ve devam et">${XICON}</button>
    <div class="body">${ft?toggles:`${prog(L.noLimit?"acele yok":`${s.moves} hamle kaldı`)}<div class="pz-hr"></div>${toggles}<div class="pz-hr"></div><div class="pz-mix" aria-label="Kırmızı artı sarı eşittir turuncu">${MIXBUB}</div>`}</div>
    <button class="btn primary size-l" type="button" data-act="resume">Devam</button>
    ${ft?"":`<div class="pz-row"><button class="btn secondary size-s" type="button" data-act="askrestart">Baştan başla</button><button class="btn secondary size-s" type="button" data-act="askexit">Sergiye dön</button></div>`}</div>`;}
/* S10: Seviye öncesi. o = {last: geçen seferki bölge sayısı | null, sel: Hazır Kutu seçili mi} */
export const readyColor=lv=>{const R=LEVELS[lv].regions;return (R.find(r=>SEC.has(r.need))||R[0]).need;}; /* en çok karışım isteyen bölgenin tonu */
export const readyOpen=lv=>lv>=20||!!LEVELS[lv].demoReady;
export function preHTML(s,o){
  const L=LEVELS[s.lv], c=readyColor(s.lv), n=L.regions.length;
  let cls="", b, t1="Hazır Kutu", t2;
  if(!readyOpen(s.lv)){cls=" locked"; b=`<span class="badge lock">${ICON.lock}</span>`; t2="Seviye 20’de açılır";}
  else if(o.sel){cls=" on"; b=`<span class="badge ok">✓</span>`; t1="Rafta hazır:"; t2=`${NAME[c]} kutu ${symSVG(c,INK[c],12)}`;}
  else if(s.ready>0){b=`<span class="badge">${s.ready}</span>`; t2="Dokun, seç";}
  else {b=`<span class="badge plus">+</span>`; t2=`${COIN}100 coin`;}
  return `<div class="scrim"></div><div class="popup panel precard"><div class="sign size-l stroke"><span class="nail"></span>${L.name}<span class="nail"></span></div>
  ${L.hard?`<span class="hardtag stroke">ZOR SEVİYE</span>`:""}
  <button class="btn danger icon close" type="button" data-act="preclose" aria-label="Kapat, Sergiye dön">${XICON}</button>
  <div class="body"><span class="pre-thumb">${paintingSVG(s,{})}</span>
    <p>${n} bölge · ${s.moves} hamle</p>
    ${L.hard?`<p class="rw">${COIN}Kazanırsan +${L.reward} coin</p>`:""}
    ${o.last!=null?`<p class="sm">Geçen sefer: ${o.last} / ${n} bölge</p>`:""}
    <div class="pz-hr"></div>
    <div class="pre-row"><button class="booster pre-slot${cls}" type="button" data-act="preslot" aria-pressed="${!!o.sel}" aria-label="Hazır Kutu">${canSVG(c)}${b}</button>
      <span class="t"><b>${t1}</b><span>${t2}</span></span></div></div>
  <button class="btn primary size-l" type="button" data-act="preplay">Oyna</button></div>`;}
/* S15: yeni renk / yeni kural / yeni booster. n = {k:"color",c} | {k:"rule",r:"tape"} | {k:"boost",b:"turp",n:2}; wait = giriş kilidi (0,6 sn) */
export const DROP=(c,cls="")=>`<svg class="drop ${cls}" viewBox="0 0 84 84" aria-hidden="true"><path d="M42 5 C55 25 72 37 72 55 A30 27 0 0 1 12 55 C12 37 29 25 42 5Z" fill="${COL[c]}" stroke="var(--wood-900)" stroke-width="3.5"/><path d="M27 40 A15 15 0 0 1 33 28" stroke="#fff" stroke-opacity=".7" stroke-width="4" fill="none" stroke-linecap="round"/><g transform="translate(${42-symW(c)*0.8} 47) scale(1.6)">${symG(c,c==="W"?INK.W:"#fff")}</g></svg>`;
export const CHIP=c=>`<span class="chip" style="background:${COL[c]}">${symSVG(c,c==="W"?INK.W:"#fff",13)}</span>`;
/* Bant kuralı: önce (çatı bantlı, güneş boş) → sonra (güneş boyandı, bant sökülüyor) */
export const TAPEILL=(()=>{const pan=(x,done)=>`<g transform="translate(${x} 0)"><rect x="1" y="1" width="108" height="78" rx="4" fill="var(--canvas)" stroke="var(--wood-900)" stroke-width="2"/>
  <circle cx="84" cy="24" r="13" fill="${COL.O}" opacity="${done?1:.28}" stroke="var(--pencil)" stroke-width="1.2"/>
  <path d="M14 56 L40 34 L66 56 Z" fill="${COL.R}" opacity=".28" stroke="var(--pencil)" stroke-width="1.2"/><rect x="20" y="56" width="40" height="18" fill="none" stroke="var(--pencil)" stroke-width="1.2"/>
  ${done?`<g transform="translate(46 30) rotate(-38)"><rect x="0" y="0" width="30" height="9" fill="var(--tape)" stroke="rgba(0,0,0,.25)"/></g>`:`<rect x="8" y="40" width="64" height="10" fill="var(--tape)" stroke="rgba(0,0,0,.25)" transform="rotate(-12 40 45)"/>`}
  ${done?"":`<circle cx="84" cy="24" r="17" fill="none" stroke="#FFC21A" stroke-width="3" stroke-dasharray="4 3"/>`}</g>`;
  return `<svg class="ill" viewBox="0 0 250 80" aria-hidden="true">${pan(0,false)}<path d="M116 40h16m-7-7 7 7-7 7" stroke="var(--wood-900)" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${pan(140,true)}</svg>`;})();
export function newHTML(n,wait){
  const sign=t=>`<div class="sign size-l stroke"><span class="nail"></span>${t}<span class="nail"></span></div>`;
  const btn=(t)=>`<button class="btn primary size-l${wait?" wait":""}" type="button" data-act="newok">${t}</button>`;
  let s,b,t;
  if(n.k==="color"){const [a,c2]=PARTS[n.c]; s="Yeni renk!"; t="Harika!";
    b=`${DROP(n.c,wait?"pop":"")}<span class="nm">${NAME[n.c][0].toLocaleUpperCase("tr")+NAME[n.c].slice(1)}</span>
    <div class="fx" aria-label="${NAME[a]} artı ${NAME[c2]} eşittir ${NAME[n.c]}">${CHIP(a)}<span>+</span>${CHIP(c2)}<span>=</span>${CHIP(n.c)}</div>
    <div class="pz-hr"></div><p class="nb">${BOOK}Renk defterine eklendi</p>`;}
  else if(n.k==="rule"){s="Yeni: Bant"; t="Anladım";
    b=`${TAPEILL}<p>Yanını boya, bant sökülür.</p>`;}
  else {const B=SHOP[n.b]; s="Yeni araç"; t="Al";
    b=`<div class="bigb">${ICON[n.b]}</div><span class="nm">${B.n}</span>
    ${n.b==="turp"?`<div class="fx" aria-label="turuncu, kırmızı ve sarıya ayrılır">${CHIP("O")}<span>→</span>${CHIP("R")}${CHIP("Y")}</div>`:""}
    <p class="sm">${B.d}</p><span class="gift stroke">Hediye: ${n.n}</span>`;}
  return `<div class="scrim"></div><div class="popup panel newcard">${sign(s)}<div class="body">${b}</div>${btn(t)}</div>`;}
export function winHTML(s,w){
  const L=LEVELS[s.lv], ft=!!L.ftue, cols=L.regions.map(r=>r.need);
  const splats=SPLATS.map(([x,y,k,r],i)=>SPLAT(cols[k%cols.length]).replace('class="splat"',`class="splat" style="left:${x}px;top:${y}px;transform:rotate(${r}deg);animation-delay:${.6+i*.06}s"`)).join("");
  const coinChip=`<div class="rwchip" data-rw="coin">${COINIC.replace('class="ic"','')}<b class="stroke">+${w.reward*(w.x2===2?2:1)}</b>${w.x2===2?`<span class="x2">×2</span>`:""}</div>`;
  return `<div class="win${w.anim?" anim":""}" role="dialog" aria-label="Seviye tamamlandı">
  <div class="wtop"><div class="sign stroke"><span class="nail"></span>${L.name}<span class="nail"></span></div>
    ${ft?"":`<div class="cur"><div class="pill" data-pill="star">${STAR}<span>${w.stars}</span></div><div class="pill" data-pill="coin">${COINIC}<span>${w.coins}</span></div></div>`}</div>
  <div class="wsign"><div class="sign size-l stroke"><span class="nail"></span>Tamamlandı!<span class="nail"></span></div></div>
  ${splats}
  <div class="frame"><div class="cv">${paintingSVG(s,{})}</div></div>
  ${L.hard?`<span class="hardtag stroke">ZOR SEVİYE</span>`:""}
  ${ft?`<p class="wnote">Tablon sergiye asılıyor</p>`:`<div class="wrw"><div class="rwchip" data-rw="star">${STAR.replace('class="ic"','')}<b class="stroke">+${w.star}</b></div>${coinChip}</div>`}
  ${w.ready===false?"":`<div class="wbtns"><button class="btn primary size-l" type="button" data-act="wnext">Devam</button>
    ${w.x2===1?`<button class="btn secondary size-m" type="button" data-act="wx2">${PLAY}×2 coin · Reklam izle</button>`:w.x2===2?`<span class="wdone">✓ ×2 alındı</span>`:""}</div>`}
  </div>`;}
export function adHTML(n){return `<div class="adov" role="dialog" aria-label="Reklam, demo"><span class="adtag">REKLAM · DEMO</span><b>${n}</b><p>Gerçek oyunda burada 15–30 sn’lik bir reklam oynar. Bitince ödül verilir.</p></div>`;}
/* S13: Devam teklifi. o = {n: 1 ilk | 2 son teklif, wait: giriş kilidi} */
export const OFFER=[0,150,300];
export function offerHTML(s,o){
  const R=RG(s), n=R.length, p=R.filter(r=>s.painted[r.id]).length, left=n-p, price=OFFER[o.n], ok=s.coins>=price, ad=o.n===1&&s.lv>=11, wt=o.wait?" wait":"";
  const near=left<=n/2?`Sadece ${left} bölge kaldı!`:`${p} / ${n} bölge boyandı`; /* dürüst dil: "sadece" yalnızca gerçekten az kaldıysa */
  return `<div class="scrim soft"></div><div class="popup panel offercard" role="dialog" aria-label="Devam teklifi"><div class="sign size-l stroke"><span class="nail"></span>Hamle bitti<span class="nail"></span></div>
  ${o.n===2?`<span class="hardtag lasttag stroke">SON TEKLİF</span>`:""}
  <div class="body"><span class="pre-thumb">${paintingSVG(s,{pick:R.filter(r=>!s.painted[r.id]).map(r=>r.id)})}</span>
    <p class="near">${near}</p>
    <div class="orow"><div class="panel movebox"><small>HAMLE</small><b class="stroke">+5</b></div><span>5 hamle daha</span></div>
    ${o.n===2?`<p class="up">Son teklif: fiyat 150 → 300 coin</p>`:""}
    <p class="bal${ok?"":" bad"}">${COIN}<span>${ok?`Sende ${s.coins} coin`:`Sende ${s.coins} / gereken ${price}`}</span></p>${!ok&&!shopOpenAt(s.lv)?SHOP_EARN:""}</div>
  ${ok?`<button class="btn primary size-l${wt}" type="button" data-act="obuy">Devam et<span class="price">${COIN}${price}</span></button>`
     :shopOpenAt(s.lv)?`<button class="btn primary size-l${wt}" type="button" data-act="ostore">Mağazaya git</button>`:""}
  ${ad?`<button class="btn secondary size-m${wt}" type="button" data-act="oad">${PLAY}Reklam izle · +5 hamle</button>`:""}
  <button class="btn-text${wt}" type="button" data-act="ogive">Vazgeç</button></div>`;}
export function loseTip(s){const R=RG(s), n=R.length, p=R.filter(r=>s.painted[r.id]).length;
  if(n-p>n/2) return "Önce ana renkleri tek tüpte topla.";
  if(s.turp>0&&s.tubes.some(t=>t.some(c=>SEC.has(c)))) return "Terebentin yanlış karışımı ana renklerine ayırır.";
  if(s.shelf.length>=2) return "Raf dolunca önce açık bir bölgeyi boya.";
  return "Geri Al hamleyi de iade eder. Takılınca bir adım geri git.";}
export function loseHTML(s,o={}){const L=LEVELS[s.lv], R=RG(s), n=R.length, p=R.filter(r=>s.painted[r.id]).length, wt=o.wait?" wait":"";
  return `<div class="scrim soft"></div><div class="popup panel losecard" role="dialog" aria-label="Seviye kaybedildi"><div class="sign size-l stroke"><span class="nail"></span>Bu sefer olmadı<span class="nail"></span></div>
  ${L.hard?`<span class="hardtag stroke">ZOR SEVİYE</span>`:""}
  <div class="body"><span class="pre-thumb">${paintingSVG(s,{})}</span>
    <p class="near">${p} / ${n} bölge boyandı</p>
    <p class="free">${RETRY}Tekrar denemek bedava</p>
    ${L.hard?`<p class="sm">Zor seviyeler birkaç deneme sürer.</p>`:""}
    <div class="pz-hr"></div>
    <p class="tip">${BULB}<span>${loseTip(s)}</span></p></div>
  <button class="btn primary size-l${wt}" type="button" data-act="lretry">Tekrar dene</button>
  <button class="btn secondary size-m${wt}" type="button" data-act="lgal">Sergiye dön</button></div>`;}

export function screenHTML(s,ui={}){
  const L=LEVELS[s.lv], ft=!!L.ftue, sel=ui.sel;
  const tubes=s.tubes.map((t,i)=>{
    let o={sel:sel===i,shake:ui.shake===i,flash:ui.flash===i,swirl:ui.mixPop===i};
    if(sel!=null&&sel!==i&&!ui.noGhost&&(ui.onlyGhost==null||ui.onlyGhost===i)){const p=preview(s,sel,i); if(p){o.ghost=p.ghost;o.mix=p.mix;t=p.base;}}
    if(ui.aim){const sp=splitPreview(s,i); if(sp){o.target=true;o.ghost=sp.ghost;t=sp.base;} else o.off=true;}
    if(ui.pick) o.off=true;
    if(ui.pickCan&&ui.pickCan.tube===i){o.hoverCan=ui.pickCan.color;o.off=false;}
    const desc=t.length?t.map(c=>NAME[c]).join(", "):"boş";
    return `<button class="tube-hit${o.off?" off":""}" type="button" data-t="${i}" aria-label="Tüp ${i+1}: ${desc}">${tubeHTML(t,o)}</button>`;}).join("");
  const slots=[0,1].map(i=>{const c=s.shelf[i]; if(!c) return `<div class="slot"></div>`;
    const k=(ui.shelfPop&&i===s.shelf.length-1?"pop":"")+(ui.readyGlow&&i===0?" glow":"");
    return `<div class="slot tap" role="button" tabindex="0" data-shelf="${i}" aria-label="Raftaki ${NAME[c]} kutu">${canSVG(c,k)}</div>`;}).join("");
  return `
  <div class="hud">
    ${ft||L.noLimit?`<div style="width:64px" aria-hidden="true"></div>`:`<div class="panel movebox${s.moves<=3?" low":""}${ui.movePing?" ping":""}" aria-label="Kalan hamle ${s.moves}"><small>HAMLE</small><b class="stroke">${s.moves}</b></div>`}
    <div class="sign stroke"><span class="nail"></span>${L.name}<span class="nail"></span></div>
    <button class="btn secondary icon" type="button" data-act="pause" aria-label="Duraklat">${ICON.pause}</button>
  </div>
  <div class="frame"><div class="cv">${paintingSVG(s,ui)}</div></div>
  ${ft?"":`<div class="shelf panel${ui.shelfShake?" shake":""}" aria-label="Boya rafı, 2 yuva">${slots}</div>`}
  <div class="tubes${s.tubes.length<=3?" few":""}">${tubes}</div>
  ${ui.pick?`<div class="picksign${ui.signShake?" shake":""}"><div class="sign stroke"><span class="nail"></span>Bölge seç<span class="nail"></span></div></div>`:""}
  ${ft?"":ui.aim?`<div class="booster-bar panel modebar"><b class="stroke">Karışımı seç</b><button class="btn secondary size-s" type="button" data-act="cancel">İptal</button></div>`:`<div class="booster-bar panel${ui.pick?" off":""}">
    <button class="booster" type="button" data-act="undo" aria-label="Geri Al">${ICON.undo}${bdg(s.undo)}<span class="blabel">Geri Al</span></button>
    <button class="booster${s.tubes.length>=7?" disabled":""}" type="button" data-act="tube" aria-label="Ekstra Tüp">${ICON.tube}${bdg(s.extra)}<span class="blabel">Tüp</span></button>
    <button class="booster" type="button" data-act="turp" aria-label="Terebentin">${ICON.turp}${bdg(s.turp)}<span class="blabel">Terebentin</span></button>
  </div>`}
  <div class="toast${ui.toast?" on":""}${ui.toastLow?" low":""}" role="status">${ui.toast||""}</div>
  ${ui.overlay||""}`;}

