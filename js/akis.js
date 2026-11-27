// akis.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { COIN, COINIC, HAND, ICON, STAR } from "./cizim/ikonlar.js";
import { ensureLevel } from "./cizim/mekanlar.js";
import { DROP, OFFER, SHOP, adHTML, buyCardHTML, loseHTML, newHTML, offerHTML, pauseHTML, preHTML, readyColor, readyOpen, screenHTML, winHTML } from "./cizim/oyun-ekrani.js";
import { canSVG } from "./cizim/tup.js";
import { addCoach, coachSpec, guidedUI, rel } from "./ekranlar/egitim.js";
import { openSheet, shopClick, shopLayerHTML } from "./ekranlar/magaza.js";
import { galAfter, galClick, galDraw, openGallery } from "./ekranlar/sergi.js";
import { RG, aimTargets, clone, isOpen, makeState, paint, pour, preview, splitPreview, won } from "./motor/kurallar.js";
import { COL, NAME } from "./veri/renkler.js";
import { damla, parilti, patlat, rnd } from "./cizim/parcacik.js";
import { LEVELS } from "./veri/seviyeler.js";
import { kaydet } from "./kayit.js";
import { ayarDegisti, coinVardi, dokmeSesi, efekt, jingle, muzik, titret } from "./ses.js";

/* ================= Canlı prototip ================= */
export const STATES=[["idle","Boşta"],["sel","Tüp seçili"],["pick","Bölge seçimi"],["aim","Nişan modu"],["popup","Pop-up"]];
export const live={el:document.getElementById("live"),seen:{},newc:null,regHand:null,set:{mus:true,snd:true,vib:true,mv:60},pause:null,pauseQ:false,s:makeState(1),step:0,hist:[],ui:{},mode:"idle",pending:null,tt:null,idleT:null,autoT:null,showHint:false};
export const curStep=()=>(LEVELS[live.s.lv].steps||[])[live.step]||null;
export const isGuided=()=>{const st=curStep();return !!st&&!st.expect.free&&live.mode!=="popup";};
export function chips(){const el=document.getElementById("stateChips"); if(el) el.innerHTML=STATES.map(([k,t])=>`<span class="${live.mode===k?"on":""}">${t}</span>`).join("")+
  `<span class="${isGuided()?"on coach-chip":""}">Eğitim adımı</span>`;}
export function draw(){
  const acik=!!live.ui.overlay&&!live.win&&!live.lose&&!live.offer, once=ovAcik, kopya=once&&!acik?popCikisKopya():null;
  muzik(live.gal?"menu":"oyun"); popSesi(acik);
  live.el.innerHTML=screenHTML(live.s,guidedUI(live.s,live.shop&&live.shop.v==="sheet"?{...live.ui,overlay:null}:live.ui,live.step)); /* Coin al paneli açıkken altındaki kart gizlenir */
  if(live.mode!=="popup") addCoach(live.el,coachSpec(live.s,live.ui,live.step,live.showHint));
  if(live.mode!=="popup"&&live.regHand) addRegHand(live.el,live.regHand);
  chips(); live.ui={sel:live.ui.sel,pick:live.ui.pick,pickCan:live.ui.pickCan,aim:live.ui.aim,toast:live.ui.toast,toastLow:live.ui.toastLow,overlay:live.ui.overlay};
  schedule(); kaydet(); /* A10: ilerleme her çizimde (değiştiyse) kaydedilir */
  if(live.gal) galAfter();
  if(live.shop){ live.el.insertAdjacentHTML("beforeend",shopLayerHTML()); const t=live.el.querySelector(".toast"); if(t){t.style.zIndex=50; live.el.appendChild(t);} }
  if(acik&&!once) popGiris(); popCikis(kopya); /* A9 · 6B */
}
/* A8: pop-up açılınca/kapanınca kısa "pop" (kazanma/kaybetme kartlarında jingle çalar, pop yok) */
let ovAcik=false;
export function popSesi(acik){ if(acik!==ovAcik){ ovAcik=acik; efekt(acik?"popup-ac":"popup-kapa"); } }
export function schedule(){
  const L=LEVELS[live.s.lv], st=curStep();
  if(st&&st.expect.auto&&!live.autoT&&live.mode!=="popup") live.autoT=setTimeout(()=>{live.autoT=null;live.step++;if(live.mode!=="popup"&&!busy)draw();},st.expect.auto);
  clearTimeout(live.idleT);
  const freeZone=L.hints&&(!st||st.expect.free);
  if(freeZone&&!live.showHint&&live.mode!=="popup"&&!won(live.s)) live.idleT=setTimeout(()=>{live.showHint=true;if(!busy)draw();},5000);
}
export function toast(msg,ms=1800,low=false){live.ui.toast=msg;live.ui.toastLow=low;clearTimeout(live.tt);live.tt=setTimeout(()=>{live.ui.toast=null;const t=live.el.querySelector(".toast");t&&t.classList.remove("on");},ms);}
export function load(s,step=0){busy=false;live.gal=null;live.offer=null;live.lose=null;clearTimeout(live.offT);clearWinT();live.win=null;live.el.classList.remove("clearing");live.newc=null;live.regHand=null;live.pause=null;live.pre=null;live.pauseQ=false;clearTimeout(live.autoT);live.autoT=null;live.s=clone(s);live.step=step;live.showHint=false;live.hist=[];live.mode="idle";live.pending=null;live.buy=null;live.ui={};draw();}
/* ================= S15 ================= */
export function addRegHand(root,id){const g=root.querySelector(`.reg[data-r="${id}"] .outline`); if(!g) return; const r=rel(g,root);
  const el=document.createElement("div"); el.className="reghand"; el.innerHTML=HAND; el.style.left=(r.x+r.w/2-9)+"px"; el.style.top=(r.y+r.h-12)+"px"; root.appendChild(el);}
export const seenKey=n=>n.k+":"+(n.c||n.r||n.b);
export function openNew(n){live.seen[seenKey(n)]=true; live.newc={...n,ready:false}; live.mode="popup"; live.ui.sel=null; live.showHint=false; clearTimeout(live.idleT);
  live.ui.overlay=newHTML(n,true);
  clearTimeout(live.newT); live.newT=setTimeout(()=>{ if(!live.newc) return; live.newc.ready=true; live.ui.overlay=newHTML(live.newc,false);
    const b=live.el.querySelector('.newcard [data-act="newok"]'); b&&b.classList.remove("wait"); },RM?0:600);} /* giriş kilidi */
export function introCheck(){const n=LEVELS[live.s.lv].intro; if(n&&!live.seen[seenKey(n)]&&live.mode!=="popup"){openNew(n); draw();}}
export async function closeNew(){const n=live.newc; if(!n||!n.ready) return; live.newc=null; live.mode="idle"; live.ui.overlay=null;
  if(n.k==="boost") live.s[n.b==="tube"?"extra":n.b]+=n.n; /* Ekstra Tüp stoğu s.extra alanında */
  const from=live.el.querySelector(n.k==="color"?".newcard .drop":".newcard .bigb"), fr=from?rel(from,live.el):null;
  draw();
  if(n.k==="rule"){ live.regHand=LEVELS[live.s.lv].regions.find(r=>r.id===n.r||r.tape)?.tape||null; draw();
    clearTimeout(live.rhT); live.rhT=setTimeout(()=>{live.regHand=null; if(!busy&&live.mode!=="popup") draw();},3200); return; } /* söyle → göster (bir kez) → bırak */
  const tgt=live.el.querySelector(n.k==="color"?'[data-act="pause"]':`[data-act="${n.b}"]`); if(!tgt) return;
  if(fr&&!RM){const tr=rel(tgt,live.el), el=document.createElement("div"); el.className="flydrop";
    el.innerHTML=n.k==="color"?DROP(n.c).replace('class="drop "','style="width:40px;height:40px"'):`<div class="bigb" style="width:40px;height:40px;border-radius:11px">${ICON[n.b]}</div>`;
    live.el.appendChild(el);
    await done(el.animate([{transform:`translate(${fr.x+fr.w/2-20}px,${fr.y+fr.h/2-20}px) scale(1.6)`},{transform:`translate(${tr.x+tr.w/2-20}px,${tr.y+tr.h/2-20}px) scale(.6)`,opacity:.85}],{duration:560,easing:"cubic-bezier(.5,0,.75,0)",fill:"forwards"}),900);
    el.remove();}
  const t2=live.el.querySelector(n.k==="color"?'[data-act="pause"]':`[data-act="${n.b}"]`); t2&&t2.classList.add("ping");}
/* Geri Al: tahtayı bir önceki hamleye döndürür; coin, booster stokları ve eklenen tüp korunur */
export function doUndo(){const k={coins:live.s.coins,undo:live.s.undo,extra:live.s.extra,turp:live.s.turp,seenOrange:live.s.seenOrange};
  const n=live.hist.pop(), add=live.s.tubes.length-n.tubes.length; live.s=n; Object.assign(live.s,k); for(let i=0;i<add;i++) live.s.tubes.push([]);}
/* S11c: hangi moddan açıldıysa Devam'da oraya dönülür */
export function openPause(){
  live.pause={prev:{mode:live.mode,sel:live.ui.sel,aim:live.ui.aim,pick:live.ui.pick,pickCan:live.ui.pickCan},confirm:null};
  live.mode="popup"; live.showHint=false; live.ui.toast=null; live.ui.overlay=pauseHTML(live.s,live.set,null);}
export function resume(){const p=live.pause.prev; live.pause=null; live.mode=p.mode; Object.assign(live.ui,{sel:p.sel,aim:p.aim,pick:p.pick,pickCan:p.pickCan,overlay:null}); draw();}
export function askConfirm(kind){
  if(!live.hist.length){ kind==="exit"?goGallery():load(makeState(live.s.lv)); return; } /* hamle yoksa kaybedilecek bir şey yok */
  live.pause.confirm=kind; live.ui.overlay=pauseHTML(live.s,live.set,kind); draw();}
export function goGallery(note,o={}){live.pause=null; live.win=null; live.offer=null; live.lose=null; live.pre=null; live.buy=null; live.shop=null; openGallery(o); if(o.won!=null) live.gal.won21=true; if(note) toast(note,3400); galDraw();}
/* S12: Kazanma töreni. Ödül hemen kayda yazılır; sayaçlar tören bitince yeni değeri gösterir. */
export function winData(s,instant){const L=LEVELS[s.lv], ft=!!L.ftue;
  return {reward:ft?0:(L.reward||20),star:ft?0:1,coins:s.coins,stars:s.stars,x2:(!ft&&s.lv>=11)?1:0,anim:!instant,ready:!!instant,t0:Date.now(),T:[]};}
export function clearWinT(){ if(live.win) live.win.T.forEach(clearTimeout); }
export async function openWin(o={}){
  const w=winData(live.s,o.instant); if(!o.instant) jingle("kazanma"); live.win=w; live.mode="popup"; live.ui.sel=null; live.ui.toast=null; clearTimeout(live.idleT); live.showHint=false;
  live.s.coins+=w.reward; live.s.stars+=w.star;
  if(o.instant){w.coins=live.s.coins; w.stars=live.s.stars; live.ui.overlay=winHTML(live.s,w); draw(); return;}
  busy=true; if(!RM){live.el.classList.add("clearing"); await wait(460);} live.el.classList.remove("clearing"); busy=false; /* declutter: tüpler iner, HUD söner */
  if(live.win!==w) return;
  live.ui.overlay=winHTML(live.s,w); draw(); w.t0=Date.now();
  if(RM){finishWin(); return;}
  w.T.push(setTimeout(()=>{ if(live.win===w) boyaKonfeti(); },330)); /* A9 · 4A: çerçeve inerken, Steel 10 ile */
  w.T.push(setTimeout(()=>flyReward(w),1350));
  w.T.push(setTimeout(()=>finishWin(),2300));}
export function flyReward(w){ /* ödül simgeleri sayaçlara uçar, sayılar artar */
  const ft=!!LEVELS[live.s.lv].ftue; if(ft||live.win!==w) return;
  [["star",STAR],["coin",COINIC]].forEach(([k,ic],i)=>{const a=live.el.querySelector(`[data-rw="${k}"] svg`), b=live.el.querySelector(`[data-pill="${k}"] .ic`); if(!a||!b) return;
    const ra=rel(a,live.el), rb=rel(b,live.el);
    for(let j=0;j<(k==="coin"?4:1);j++){const el=document.createElement("div"); el.className="flycoin"; el.style.zIndex=11; el.innerHTML=ic.replace('class="ic"','style="width:26px;height:26px"'); live.el.appendChild(el);
      done(el.animate([{transform:`translate(${ra.x+7}px,${ra.y+7}px) scale(1.3)`},{transform:`translate(${rb.x+6}px,${rb.y+6}px) scale(.8)`}],{duration:520,delay:i*120+j*70,easing:"cubic-bezier(.5,0,.75,0)",fill:"forwards"}),900+j*70).then(()=>el.remove());}
    w.T.push(setTimeout(()=>{const p=live.el.querySelector(`[data-pill="${k}"]`); if(!p||live.win!==w) return; p.querySelector("span").textContent=k==="coin"?live.s.coins:live.s.stars; p.classList.add("bump");},560+i*120+(k==="coin"?210:0)));
    for(let j=0;j<(k==="coin"?4:1);j++) w.T.push(setTimeout(()=>{ if(live.win!==w) return; if(k==="coin") coinVardi(j); kivilcim(live.el.querySelector(`[data-pill="${k}"] .ic`)); },520+i*120+j*70));});} /* A9 · 5B */
export function finishWin(){const w=live.win; if(!w||w.ready) return; clearWinT(); w.ready=true; w.anim=false; w.coins=live.s.coins; w.stars=live.s.stars;
  live.el.querySelectorAll(".flycoin").forEach(e=>e.remove()); live.ui.overlay=winHTML(live.s,w); draw();}
export async function winNext(){const w=live.win, L=LEVELS[live.s.lv]; clearWinT();
  const f=live.el.querySelector(".win .frame");
  if(f&&!RM){busy=true; await done(f.animate([{transform:"none"},{transform:"translate(0,-260px) scale(.3)",opacity:0}],{duration:520,easing:"cubic-bezier(.5,0,.75,0)",fill:"forwards"}),800); busy=false;} /* tablo sergiye gider */
  live.win=null;
  if(L.ftue){ load(makeState(L.next)); introCheck(); return; }
  goGallery(null,{won:live.s.lv});} /* A7.3: "interstitial" tasarım notu kaldırıldı */
export function watchAd(){const w=live.win; let n=3; const box=document.createElement("div"); box.innerHTML=adHTML(n); live.el.appendChild(box.firstChild); busy=true;
  const tick=()=>{n--; const b=live.el.querySelector(".adov b"); if(n>0){ if(b) b.textContent=n; w.T.push(setTimeout(tick,RM?0:800)); return; }
    busy=false; live.s.coins+=w.reward; w.x2=2; w.coins=live.s.coins-w.reward; live.ui.overlay=winHTML(live.s,w); draw();
    flyReward2(w);};
  w.T.push(setTimeout(tick,RM?0:800));}
export function flyReward2(w){const a=live.el.querySelector('[data-rw="coin"] svg'), b=live.el.querySelector('[data-pill="coin"] .ic'); if(!a||!b||RM){finishX2(w);return;}
  const ra=rel(a,live.el), rb=rel(b,live.el);
  for(let j=0;j<4;j++){w.T.push(setTimeout(()=>{coinVardi(j); kivilcim(live.el.querySelector('[data-pill="coin"] .ic'));},520+j*70)); const el=document.createElement("div"); el.className="flycoin"; el.style.zIndex=11; el.innerHTML=COINIC.replace('class="ic"','style="width:26px;height:26px"'); live.el.appendChild(el);
    done(el.animate([{transform:`translate(${ra.x+7}px,${ra.y+7}px) scale(1.3)`},{transform:`translate(${rb.x+6}px,${rb.y+6}px) scale(.8)`}],{duration:520,delay:j*70,easing:"cubic-bezier(.5,0,.75,0)",fill:"forwards"}),900).then(()=>el.remove());}
  w.T.push(setTimeout(()=>finishX2(w),780));}
export function finishX2(w){if(live.win!==w) return; w.coins=live.s.coins; const p=live.el.querySelector('[data-pill="coin"]'); if(p){p.querySelector("span").textContent=w.coins; p.classList.add("bump");} live.ui.overlay=winHTML(live.s,w);}
/* S13: hamle bitti → (en fazla 2 kez) devam teklifi → Vazgeç → S14 */
export function openOffer(){
  jingle("kaybetme");
  if(live.s.cont>=2){ loseLevel(); draw(); return; } /* üçüncü teklif yok */
  const o={n:live.s.cont+1,ready:false}; live.offer=o; live.mode="popup"; live.ui.sel=null; live.ui.toast=null; clearTimeout(live.idleT); live.showHint=false;
  live.ui.overlay=`<div class="scrim soft"></div><div class="obeat"><div class="sign size-l stroke"><span class="nail"></span>Hamle bitti<span class="nail"></span></div></div>`; draw();
  clearTimeout(live.offT); live.offT=setTimeout(()=>{ if(live.offer!==o) return; live.ui.overlay=offerHTML(live.s,{n:o.n,wait:true}); draw();
    live.offT=setTimeout(()=>{ if(live.offer!==o) return; o.ready=true; live.ui.overlay=offerHTML(live.s,{n:o.n}); live.el.querySelectorAll(".offercard .wait").forEach(b=>b.classList.remove("wait")); },RM?0:600); },RM?0:700);}
export function giveMoves(msg){efekt("booster"); live.s.moves+=5; live.s.cont++; live.offer=null; live.mode="idle"; live.ui.overlay=null; live.ui.movePing=true; toast(msg); draw();}
export function offerAd(){const o=live.offer; let n=3; const box=document.createElement("div"); box.innerHTML=adHTML(n); live.el.appendChild(box.firstChild); busy=true;
  const tick=()=>{n--; const b=live.el.querySelector(".adov b"); if(n>0){ if(b) b.textContent=n; setTimeout(tick,RM?0:800); return; } busy=false; if(live.offer===o) giveMoves("+5 hamle · reklam için teşekkürler");};
  setTimeout(tick,RM?0:800);}
export function loseLevel(){live.offer=null; live.lastP=RG(live.s).filter(r=>live.s.painted[r.id]).length; const o={ready:false}; live.lose=o; live.mode="popup";
  live.ui.overlay=loseHTML(live.s,{wait:true});
  clearTimeout(live.offT); live.offT=setTimeout(()=>{ if(live.lose!==o) return; o.ready=true; live.ui.overlay=loseHTML(live.s); live.el.querySelectorAll(".losecard .wait").forEach(b=>b.classList.remove("wait")); },RM?0:600);}
/* S10: seviye öncesi kartı. Sadece zor seviyede ve (Hazır Kutu açıksa) tekrar denemede açılır */
export function openPre(o={}){live.pre={last:o.last??null,sel:false}; live.mode="popup"; live.ui.sel=null; live.ui.overlay=preHTML(live.s,live.pre);}
export function carry(lv){const ns=makeState(lv); ns.coins=live.s.coins; ns.ready=live.s.ready; ns.stars=live.s.stars;
  const bn=live.st&&live.st.bonus; if(bn){ns.undo+=bn.undo; ns.extra+=bn.extra; ns.turp+=bn.turp; live.st.bonus=null;} return ns;} /* coin ve Hazır Kutu stoğu seviyeler arası korunur */
export function startLevel(lv,o={}){ensureLevel(lv);load(o.keep?carry(lv):makeState(lv));
  if(LEVELS[lv].hard||(o.last!=null&&readyOpen(lv))){openPre(o); draw();} else introCheck();}
export function playPre(){const p=live.pre; live.pre=null; live.mode="idle"; live.ui.overlay=null;
  if(p.sel&&live.s.ready>0){efekt("booster"); live.s.ready--; live.s.shelf.push(readyColor(live.s.lv)); live.ui.shelfPop=true; live.ui.readyGlow=true; toast("Hazır Kutu rafta",1800,true);}
  draw();}
/* Raftaki kutuya dokununca açık bölgesine gider (birden çok bölge varsa S11a bölge seçimi) */
export async function shelfPaint(i,c,id){busy=true; live.hist.push(clone(live.s)); live.el.innerHTML=screenHTML(live.s,{}); await flyCan({shelf:i},c,{region:id}); busy=false;
  live.s.shelf.splice(i,1); const ev={painted:[],untaped:[]}; paint(live.s,id,ev);
  live.mode="idle"; live.ui.pick=null; live.pending=null; live.ui.toast=null; afterEvent({...ev,flash:null}); draw();}
export function openBuy(key){live.mode="popup";live.buy=key;live.ui.sel=null;live.ui.overlay=buyCardHTML(live.s,key);}
export function closePopup(){live.buy=null; if(live.pre){live.mode="popup";live.ui.overlay=preHTML(live.s,live.pre);draw();return;} live.mode="idle";live.ui.overlay=null;draw();}
export function buy(key){const b=SHOP[key]; if(live.s.coins<b.p) return;
  if(key==="ready"){live.s.coins-=b.p; live.s.ready++; live.buy=null; live.pre.sel=true; live.ui.overlay=preHTML(live.s,live.pre); draw(); return;} /* alınca yuva seçili gelir */
  live.s.coins-=b.p; live.mode="idle"; live.buy=null; live.ui.overlay=null;
  if(key==="undo"){doUndo();toast(`-${b.p} coin · son hamle geri alındı`);}
  if(key==="tube"){live.s.tubes.push([]);toast(`-${b.p} coin · boş tüp eklendi`);}
  if(key==="turp"){live.s.turp++;live.mode="aim";live.ui.aim=true;toast(`-${b.p} coin · karışımı seç`);}
  draw(); flyCoin(key);}
export function flyCoin(key){
  efekt("coin");
  if(RM) return; const t=live.el.querySelector(`[data-act="${key}"]`)||live.el.querySelector(".modebar"); if(!t) return;
  const r=rel(t,live.el), el=document.createElement("div"); el.className="flycoin"; el.innerHTML=COIN.replace('class="coin"','class="coin" style="width:26px;height:26px"'); live.el.appendChild(el);
  const tx=r.x+r.w/2-13, ty=r.y+r.h/2-13;
  done(el.animate([{transform:"translate(167px,330px) scale(1.4)",opacity:1},{transform:`translate(${tx}px,${ty}px) scale(.7)`,opacity:.9}],{duration:520,easing:"ease-in",fill:"forwards"}),800).then(()=>el.remove());}
export function afterEvent(ev){
  const ft=!!LEVELS[live.s.lv].ftue;
  /* ilk kez yapılan ve tablonun istediği renk → "Yeni renk!" kartı (eğitimde her zaman) */
  if(ev.mix&&!live.seen["color:"+ev.mix]&&(ft||LEVELS[live.s.lv].regions.some(r=>r.need===ev.mix))){live.s.seenOrange=true; openNew({k:"color",c:ev.mix});}
  else if(ev.mix&&!ft&&!LEVELS[live.s.lv].regions.some(r=>r.need===ev.mix)) toast(`${NAME[ev.mix][0].toUpperCase()+NAME[ev.mix].slice(1)} yaptın, bu tablonun ihtiyacı yok. Geri Al’ı dene.`,2400);
  if(ev.shelf) toast("Kutu rafa kondu, gideceği bölge henüz kapalı");
  if(ev.shelfFull){live.ui.shelfShake=true;toast("Raf dolu! Önce açık bir bölgeyi boya");}
  if(ev.untaped.length){ toast("Bant söküldü!"); efekt("bant",{at:.15}); }
  if(ev.painted.length){ efekt("boyama"); titret("boyama"); bolgeParilti(ev.painted); } /* A9 · 3C */
  live.ui.just=ev.painted; live.ui.untaped=ev.untaped; live.ui.flash=ev.flash; live.ui.shelfPop=ev.shelf;
  if(ev.choice){live.mode="pick";live.pending=ev.choice;live.ui.pick=ev.choice.options;live.ui.pickCan={tube:ev.choice.tube,color:ev.choice.color};}
  if(won(live.s)){const lv=live.s.lv; setTimeout(()=>{ if(live.s.lv===lv&&won(live.s)&&!live.win) openWin(); },ft?1900:700);}
  else if(!ft&&!LEVELS[live.s.lv].noLimit&&live.s.moves<=0&&!ev.choice){const lv=live.s.lv; setTimeout(()=>{ if(live.s.lv===lv&&live.s.moves<=0&&!won(live.s)&&live.mode!=="popup") openOffer(); },600);}
}
/* ---------- animasyon (juice) ---------- */
/* Hareketleri azalt = sistem ayarı YA DA oyundaki Ayarlar anahtarı (live.set.rm). A9: önceden sadece sistem ayarına bakılıyordu.
   RM canlı bağlantıdır (export let): rmUygula() değiştirince bütün modüller yeni değeri görür; kökte .rm sınıfı CSS animasyonlarını kapatır. */
const RM_SISTEM=matchMedia("(prefers-reduced-motion: reduce)").matches;
export let RM=RM_SISTEM;
export function rmUygula(){ RM=RM_SISTEM||!!live.set.rm; document.documentElement.classList.toggle("rm",RM); }
/* ---------- A9 efektleri (parçacıklar ekranın üstündeki ayrı katmanda: draw() ekranı yeniden çizse de silinmez) ---------- */
let fxEl=null;
export function fxKap(){ const sc=live.el;
  if(!fxEl||!fxEl.isConnected){ fxEl=document.createElement("div"); fxEl.className="fxkat"; fxEl.setAttribute("aria-hidden","true"); sc.parentNode.appendChild(fxEl); }
  fxEl.style.cssText=`position:absolute;left:${sc.offsetLeft}px;top:${sc.offsetTop}px;width:${sc.offsetWidth}px;height:${sc.offsetHeight}px;transform:${sc.style.transform||"none"};transform-origin:0 0;pointer-events:none;overflow:hidden;z-index:30;border-radius:${getComputedStyle(sc).borderRadius};font-family:var(--f-game);color:var(--ink-900)`;
  return fxEl; }
const merkez=el=>{const r=rel(el,live.el); return [r.x+r.w/2,r.y+r.h/2];};
/* 1A: katman tüpe inince yüzeyden damlalar sıçrar */
function damlaSicrat(x,y,c){ if(RM) return; const k=fxKap();
  patlat(k,Array.from({length:8},()=>({x:x+rnd(-10,10),y:y+2,vx:rnd(-80,80),vy:rnd(-210,-110),g:950,life:rnd(.42,.6),w:rnd(8,12),s0:1,s1:.6,fade:.3,html:damla(c)}))); }
/* 2B: tüp tamamlanınca çevresinde altın yıldızlar */
function tupYildiz(g){ if(RM||!g) return; const r=rel(g,live.el), cx=r.x+r.w/2;
  patlat(fxKap(),Array.from({length:7},(_,i)=>({x:cx+(i%2?1:-1)*rnd(26,40),y:r.y+10+i*22+rnd(-6,6),w:rnd(12,20),s0:.1,s1:1,grow:.45,life:.7,delay:i*.06,fade:.5,vr:160,html:parilti()}))); }
/* 3C: boyanan bölgenin rozet yerinde üç parıltı (bölge bugünkü gibi .7 sn'de dolar) */
function bolgeParilti(ids){ if(RM||!ids.length) return; const cvEl=live.el.querySelector(".cv"); if(!cvEl) return; const c=rel(cvEl,live.el), S=LEVELS[live.s.lv].spot;
  patlat(fxKap(),ids.flatMap(id=>{ const p=S[id]; if(!p) return []; const px=c.x+p[0]*c.w/312, py=c.y+p[1]*c.h/168;
    return Array.from({length:3},(_,i)=>({x:px+rnd(-26,26),y:py+rnd(-14,14),w:rnd(13,19),s0:.1,s1:1,grow:.5,life:.65,delay:.15+i*.12,fade:.5,vr:140,html:parilti()})); })); }
/* 4A: "Tamamlandı!" çerçevenin iki üst köşesinden guaj boya konfetisi */
const KONFETI=["R","Y","B","O","G","P","PK","LB"].map(k=>COL[k]);
function boyaKonfeti(){ if(RM) return; const f=live.el.querySelector(".win .frame"); if(!f) return; const r=rel(f,live.el), k=fxKap();
  for(const [x0,yon] of [[r.x+8,1],[r.x+r.w-8,-1]])
    patlat(k,Array.from({length:18},(_,i)=>({x:x0,y:r.y+6,vx:yon*rnd(40,250),vy:rnd(-520,-250),g:950,drag:.35,life:rnd(1.2,1.8),w:rnd(10,18),r:rnd(0,360),vr:rnd(-300,300),fade:.3,html:damla(KONFETI[i%KONFETI.length])}))); }
/* 5B: coin (ya da yıldız) sayaca varınca küçük altın kıvılcımlar */
export function kivilcim(el){ if(RM||!el) return; const [cx,cy]=merkez(el);
  patlat(fxKap(),Array.from({length:5},(_,i)=>{ const a=i/5*6.283+rnd(-.3,.3), v=rnd(90,150); return {x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:.9,life:.5,w:rnd(11,15),s0:1,s1:.3,vr:360,fade:.5,html:parilti()}; })); }
/* 6B: pop-up yayla açılır; kapanırken kopyası üst katmanda küçülerek söner */
const POP_AC=[{opacity:0,transform:"scale(.5)"},{opacity:1,transform:"scale(1.07)",offset:.55},{transform:"scale(.98)",offset:.8},{opacity:1,transform:"none"}];
const POP_KA=[{opacity:1,transform:"none"},{opacity:1,transform:"scale(1.05)",offset:.3},{opacity:0,transform:"scale(.6)"}];
function popGiris(){ if(RM) return; live.el.querySelectorAll(".popup").forEach(p=>p.animate(POP_AC,{duration:380,easing:"linear"})); live.el.querySelectorAll(".scrim").forEach(s=>s.animate([{opacity:0},{opacity:1}],{duration:200})); }
function popCikisKopya(){ if(RM) return null; const ps=[...live.el.querySelectorAll(".scrim,.popup")]; if(!ps.length) return null;
  return ps.map(p=>{ const r=rel(p,live.el), c=p.cloneNode(true); c.style.cssText+=`;position:absolute;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;right:auto;bottom:auto;margin:0`; return c; }); }
function popCikis(kopya){ if(!kopya) return; const k=fxKap(); kopya.forEach(c=>{ k.appendChild(c);
  const an=c.classList.contains("popup")?c.animate(POP_KA,{duration:220,easing:"ease-in",fill:"forwards"}):c.animate([{opacity:1},{opacity:0}],{duration:220,fill:"forwards"});
  done(an,500).then(()=>c.remove()); }); }
/* 6B: düğme bırakınca yaylanır (basılı hâli temel.css .btn:active) */
const BTN_YAY=[{transform:"translateY(3px) scale(.92)"},{transform:"scale(1.06)",offset:.45},{transform:"scale(.98)",offset:.75},{transform:"none"}];
live.el.addEventListener("pointerup",e=>{ if(RM) return; const b=e.target.closest(".btn"); if(!b||b.classList.contains("wait")||b.disabled) return; b.animate(BTN_YAY,{duration:340,easing:"ease-out"}); },true);
export const wait=ms=>new Promise(r=>setTimeout(r,RM?0:ms));
export let busy=false;
/* Animasyon bitişi + emniyet süresi: sekme arka plandayken animasyon olayı gelmezse oyun kilitlenmesin */
export const done=(an,ms)=>Promise.race([an.finished,new Promise(r=>setTimeout(r,ms))]).catch(()=>{});
export function flyLayers(a,b,p){
  if(RM) return Promise.resolve();
  const G=live.el.querySelectorAll(".glass"), lys=[...G[a].querySelectorAll(".ly")], moving=lys.slice(-p.take), st=rel(G[b].querySelector(".stack"),live.el);
  return Promise.all(moving.map((ly,k)=>{
    const r0=rel(ly,live.el), c=ly.cloneNode(true); c.classList.add("fly"); c.style.width=r0.w+"px"; c.style.height=r0.h+"px"; c.style.borderRadius="4px";
    live.el.appendChild(c); ly.style.visibility="hidden";
    const order=moving.length-1-k, land=p.mix?p.base.length+1:p.base.length+order;
    const ty=st.y+st.h-(land+1)*36-land*2, tx=st.x+(st.w-r0.w)/2, apex=Math.min(r0.y,ty)-34;
    return done(c.animate([{transform:`translate(${r0.x}px,${r0.y}px)`},{transform:`translate(${r0.x}px,${apex}px)`,offset:.3},{transform:`translate(${tx}px,${apex}px)`,offset:.7},{transform:`translate(${tx}px,${ty}px)`}],
      {duration:440,delay:order*70,easing:"ease-in-out",fill:"forwards"}),700+order*70).then(()=>damlaSicrat(tx+r0.w/2,ty,ly.style.getPropertyValue("--c"))); /* A9 · 1A */
  }));
}
export function flyCan(ti,color,target){
  if(RM) return Promise.resolve();
  let s0,tx,ty;
  if(typeof ti==="object"){const sl=live.el.querySelectorAll(".slot")[ti.shelf]; s0=rel(sl,live.el); const cn=sl.querySelector(".can"); if(cn) cn.style.visibility="hidden";} /* raftan kalkış */
  else {const g=live.el.querySelectorAll(".glass")[ti], hc=g.parentElement.querySelector(".hovercan"); s0=rel(hc||g,live.el); if(hc) hc.style.visibility="hidden"; g.querySelector(".stack").style.visibility="hidden";}
  if(target.region){const cv=rel(live.el.querySelector(".cv"),live.el),[x,y]=LEVELS[live.s.lv].spot[target.region];tx=cv.x+x*cv.w/312;ty=cv.y+y*cv.h/168;}
  else {const sl=rel(live.el.querySelectorAll(".slot")[target.shelf],live.el);tx=sl.x+sl.w/2;ty=sl.y+sl.h/2;}
  const el=document.createElement("div"); el.className="fly"; el.innerHTML=canSVG(color); live.el.appendChild(el);
  const sx=s0.x+s0.w/2-16, sy=s0.y+s0.h/2-17; tx-=16; ty-=17;
  return done(el.animate([{transform:`translate(${sx}px,${sy}px) scale(.4)`},{transform:`translate(${sx}px,${sy-46}px) scale(1.35)`,offset:.3},{transform:`translate(${tx}px,${ty}px) scale(.8)`}],
    {duration:640,easing:"cubic-bezier(.45,0,.3,1)",fill:"forwards"}),900);
}
export async function animatePour(a,b,r){
  busy=true; const prev=live.s, p=preview(prev,a,b);
  live.el.innerHTML=screenHTML(prev,{sel:a,noGhost:true});
  dokmeSesi(p.take,p.mix); await flyLayers(a,b,p);
  const mid=clone(prev); for(let k=0;k<p.take;k++) mid.tubes[a].pop(); mid.tubes[b]=p.base.concat(p.ghost); mid.moves--;
  live.el.innerHTML=screenHTML(mid,{mixPop:p.mix?b:null,flash:r.ev.flash});
  await wait(p.mix?420:120);
  const ev=r.ev;
  if(ev.flash!=null||ev.choice){ efekt("tup-tamam"); titret("tup_tamam"); tupYildiz(live.el.querySelectorAll(".glass")[b]); } /* tüp tek renkle doldu · A9 2B */
  if(ev.flash!=null&&(ev.painted.length||ev.shelf)){ await wait(250); await flyCan(b,mid.tubes[b][0],ev.painted.length?{region:ev.painted[0]}:{shelf:r.s.shelf.length-1}); }
  live.hist.push(clone(prev)); live.s=r.s; live.mode="idle"; live.ui.sel=null; afterEvent(ev); live.ui.flash=null; busy=false; draw();
  if(live.pauseQ){live.pauseQ=false; if(live.mode!=="popup"){openPause(); draw();}} /* animasyon sırasında basılan Duraklat */
}
live.el.addEventListener("click",e=>{ const b=e.target.closest("button,[data-act]"); if(b&&!b.closest("[data-t],[data-shelf]")) efekt("dugme"); },true); /* A8 */
live.el.addEventListener("click",async e=>{
  if(busy){ if(e.target.closest('[data-act="pause"]')) live.pauseQ=true; return; }
  const reg=e.target.closest(".reg"), tb=e.target.closest("[data-t]"), act=e.target.closest("[data-act]");
  live.showHint=false;
  if(live.shop){ shopClick(act&&act.dataset.act,act); return; } /* 5 · Mağaza katmanı */
  if(act&&act.dataset.act==="pause"&&live.mode!=="popup"){ openPause(); draw(); return; }
  if(live.mode==="popup"){
    const pa=act&&act.dataset.act;
    if(live.gal){ galClick(pa,act); return; } /* S01 Sergi */
    if(live.newc){ if(pa==="newok") await closeNew(); return; } /* S15: arka plan kapatmaz */
    if(live.win){ /* S12: tören sırasında dokunuş animasyonu sona atlatır (0,6 sn giriş kilidinden sonra) */
      if(!live.win.ready){ if(Date.now()-live.win.t0>600) finishWin(); return; }
      if(pa==="wnext") await winNext();
      if(pa==="wx2"&&live.win.x2===1) watchAd();
      return; }
    if(live.lose){ /* S14: × yok, arka plan kapatmaz */
      if(!live.lose.ready) return;
      if(pa==="lretry"){ live.lose=null; startLevel(live.s.lv,{keep:1,last:live.lastP}); }
      if(pa==="lgal"){ live.lose=null; goGallery(); }
      return; }
    if(live.offer){ /* S13: × yok, arka plan kapatmaz; ilk 0,6 sn butonlar kilitli */
      const o=live.offer; if(!o.ready) return;
      if(pa==="obuy"){const p=OFFER[o.n]; if(live.s.coins>=p){live.s.coins-=p; giveMoves(`-${p} coin · +5 hamle`);}}
      if(pa==="oad") offerAd();
      if(pa==="ogive"){ loseLevel(); draw(); }
      if(pa==="ostore") openSheet("5 hamle",OFFER[o.n],()=>{ live.ui.overlay=offerHTML(live.s,{n:o.n}); }); /* Coin al paneli → aynı karta dönülür */
      if(pa==="closecard"){ live.ui.overlay=offerHTML(live.s,{n:o.n}); draw(); }
      return; }
    if(live.pause){
      if(pa==="resume") resume();
      if(pa==="qs"){const k=act.dataset.k; live.set[k]=!live.set[k]; ayarDegisti(); live.ui.overlay=pauseHTML(live.s,live.set,null); draw();}
      if(pa==="askrestart") askConfirm("restart");
      if(pa==="askexit") askConfirm("exit");
      if(pa==="dorestart") load(carry(live.s.lv)); /* Baştan başla S10'u atlar: oyuncu zaten onay verdi */
      if(pa==="doexit") goGallery();
      return;
    }
    if(live.pre&&!live.buy){ /* S10 */
      if(pa==="preslot"&&readyOpen(live.s.lv)){
        if(live.pre.sel) live.pre.sel=false; else if(live.s.ready>0) live.pre.sel=true; else {openBuy("ready"); draw(); return;}
        live.ui.overlay=preHTML(live.s,live.pre); draw();}
      if(pa==="preplay") playPre();
      if(pa==="preclose"){live.pre=null; goGallery();}
      if(pa==="store"&&live.buy) openSheet(SHOP[live.buy].n,SHOP[live.buy].p,()=>{ live.ui.overlay=buyCardHTML(live.s,live.buy); });
      if(pa==="closecard") closePopup();
      return;
    }
    if(pa==="replay") startLevel(live.s.lv,{keep:1});
    if(pa==="retry") startLevel(live.s.lv,{keep:1,last:live.lastP});
    if(pa==="gplay") startLevel(12,{keep:1});
    if(pa==="ghard") startLevel(20,{keep:1});
    if(pa==="gnew"){ load({...carry(12),turp:0}); openNew({k:"boost",b:"turp",n:2}); draw(); } /* sıklık sınırı: aynı seviyede tek tanıtım */
    if(pa==="next"){ load(makeState(LEVELS[live.s.lv].next)); introCheck(); }
    if(pa==="closecard") closePopup();
    if(pa==="buy") buy(live.buy);
    if(pa==="store"&&live.buy) openSheet(SHOP[live.buy].n,SHOP[live.buy].p,()=>{ live.ui.overlay=buyCardHTML(live.s,live.buy); }); /* Coin al paneli → aynı S11b kartı, aynı tahta */
    return;
  }
  /* Eğitim: yönlendirmeli adımda sadece gösterilen hamle kabul edilir; başka dokunuşta el tekrar oynar */
  const st=curStep();
  if(isGuided()){
    const i=tb?+tb.dataset.t:-1;
    if(st.expect.sel!=null&&i===st.expect.sel){efekt("tup-sec"); live.ui.sel=i;live.mode="sel";live.step++;draw();return;}
    if(st.expect.pour&&i===st.expect.pour[1]&&live.ui.sel===st.expect.pour[0]){
      const r=pour(live.s,live.ui.sel,i); live.step++; animatePour(st.expect.pour[0],i,r); return;}
    draw(); return;
  }
  if(live.mode==="pick"){
    if(live.pending.shelf!=null){ /* raftaki kutu için bölge seçimi */
      if(reg&&live.pending.options.includes(reg.dataset.r)){live.ui.pick=null; await shelfPaint(live.pending.shelf,live.pending.color,reg.dataset.r);}
      else { live.ui.signShake=true; draw(); live.ui.signShake=false; }
      return;
    }
    if(reg&&live.pending.options.includes(reg.dataset.r)){
      busy=true; live.ui.pick=null; live.el.innerHTML=screenHTML(live.s,{pickCan:live.ui.pickCan}); live.ui.pickCan=null;
      await flyCan(live.pending.tube,live.pending.color,{region:reg.dataset.r}); busy=false;
      const ev={painted:[],untaped:[]}; live.s.tubes[live.pending.tube]=[]; paint(live.s,reg.dataset.r,ev);
      live.mode="idle"; live.ui.pick=null; const pt=live.pending.tube; live.pending=null; live.ui.toast=null;
      afterEvent({...ev,flash:pt}); draw();
    } else { live.ui.signShake=true; draw(); live.ui.signShake=false; }
    return;
  }
  if(live.mode==="aim"){
    if(act&&act.dataset.act==="cancel"){live.mode="idle";live.ui.aim=false;draw();return;}
    if(tb){const i=+tb.dataset.t, sp=splitPreview(live.s,i);
      if(sp){live.hist.push(clone(live.s)); live.s.tubes[i]=sp.base.concat(sp.ghost); live.s.turp--; live.mode="idle"; live.ui.aim=false; live.ui.mixPop=i; efekt("booster"); toast("Karışım ayrıldı"); draw(); return;}
      live.ui.shake=i; efekt("yanlis"); titret("yanlis"); toast("Bu tüpte ayrılacak karışım yok"); draw(); return;}
    draw(); return;
  }
  if(act){ const a=act.dataset.act; live.ui.sel=null; live.mode="idle";
    if(a==="turp"){ if(!aimTargets(live.s).length) toast("Ayrılacak karışım yok"); else if(live.s.turp<=0) openBuy("turp"); else {live.mode="aim"; live.ui.aim=true;} }
    if(a==="undo"){
      if(!live.hist.length) toast("Geri alınacak hamle yok");
      else if(live.s.undo<=0) openBuy("undo");
      else {live.s.undo--; doUndo(); efekt("booster"); toast("Son hamle geri alındı, hamle iade edildi");}
    }
    if(a==="tube"){
      if(live.s.tubes.length>=7) toast("Bu seviyede ekstra tüp kullanıldı");
      else if(live.s.extra<=0) openBuy("tube");
      else {live.s.tubes.push([]); live.s.extra--; efekt("booster"); toast("Boş tüp eklendi");}
    }
    draw(); return;
  }
  const sh=e.target.closest("[data-shelf]");
  if(sh){ const i=+sh.dataset.shelf, c=live.s.shelf[i]; live.ui.sel=null; live.mode="idle";
    const opts=RG(live.s).filter(r=>isOpen(live.s,r)&&r.need===c).map(r=>r.id);
    if(!opts.length){efekt("yanlis"); titret("yanlis"); live.ui.shelfShake=true; toast("Bu kutunun bölgesi henüz kapalı"); draw(); return;}
    if(opts.length>1){live.mode="pick"; live.pending={shelf:i,color:c,options:opts}; live.ui.pick=opts; draw(); return;}
    await shelfPaint(i,c,opts[0]); return;
  }
  if(tb){ const i=+tb.dataset.t, sel=live.ui.sel;
    if(sel==null){ if(live.s.tubes[i].length){efekt("tup-sec"); live.ui.sel=i;live.mode="sel";} else {efekt("yanlis"); titret("yanlis"); live.ui.shake=i;} }
    else if(sel===i){ efekt("tup-birak"); live.ui.sel=null; live.mode="idle"; }
    else { const r=pour(live.s,sel,i);
      if(r){ if(st&&st.expect.free) live.step++; animatePour(sel,i,r); return; }
      live.ui.sel=null; live.mode="idle"; live.ui.shake=i; efekt("yanlis"); titret("yanlis"); toast("Buraya dökülemez"); }
    draw(); return;
  }
  if(live.ui.sel!=null){live.ui.sel=null;live.mode="idle";}
  draw();
});
