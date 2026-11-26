// ekranlar/bolum-sonu.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { RM, kivilcim, live } from "../akis.js";
import { COIN, COINIC, HAND } from "../cizim/ikonlar.js";
import { VENUES } from "../cizim/mekanlar.js";
import { lookOf, ressamSVG } from "../cizim/ressam.js";
import { P } from "../cizim/tablo.js";
import { galDraw, galWorld } from "./sergi.js";
import { coinVardi, efekt } from "../ses.js";

/* ================= S04 Bölüm sonu töreni (Öneri 15 onaylandı, 25.11.2026) =================
   Altın “Bölüm tamamlandı!” → g.sub={k:"s04",ph:"pull"|"party"|"card",open?}. İlerleme ve sandık coin'i tören başında yazılır (G.paid[bölüm]).
   pull 0,8 sn (kamera geri çekilir) → party 2,5 sn (konfeti, tabelada bölüm cümlesi) → card (tebrik kartı). Ekrana dokunmak atlatır.
   Hareketleri azalt (live.set.rm ya da sistem) → doğrudan kart. Sandık dokunarak açılır; açmadan “Sıradaki bölüm” de olur (coin zaten yazıldı). */
export const SENT=["Atölyen hazır!","Müdaviler bayıldı!","Açılış gecesi!","Bütün şehir konuşuyor!","Artık ünlüsün!"];
export const LOC=["Atölyem’de","Kafe Duvarı’nda","İlk Sergim’de","Meydan Sergisi’nde","Müze’de"];
export const CHEST_AMT=[100,150,200,300,300];
export const S04CONF=["#D9472F","#EDB83A","#4E9A4A","#2E64B0","#E77B2E","#7D4FA6","#FF6FA8"];
export const rnd=seed=>()=>((seed=(seed*16807)%2147483647)-1)/2147483646;
export const S04DROP=(x,y,c,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -14 C5 -5 9 0 9 5 A9 9 0 0 1 -9 5 C-9 0 -5 -5 0 -14Z" fill="${c}" stroke="#3D220E" stroke-width="2"/><ellipse cx="-3" cy="3" rx="2" ry="3" fill="rgba(255,255,255,.6)"/></g>`;
/* konfeti + boya damlaları (tohumlu, her çizimde aynı) */
export function confetti(seed,o={}){const r=rnd(seed), n=o.n||64, y0=o.y0||40, y1=o.y1||600; let h="";
  for(let i=0;i<n;i++){const x=r()*360,y=y0+r()*(y1-y0),c=S04CONF[i%7],a=(r()*360)|0,k=r();
    h+=k<.5?`<rect x="${(x-4).toFixed(1)}" y="${(y-2.5).toFixed(1)}" width="8" height="5" rx="1" fill="${c}" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`
      :k<.8?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${c}"/>`
      :`<path d="M${(x-6).toFixed(1)} ${y.toFixed(1)} q3 -5 6 0 t6 0" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" transform="rotate(${a} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;}
  if(o.drops!==false) [[34,150,0,1.1],[318,176,1,1],[22,300,3,.9],[340,330,2,1.2],[300,120,4,.8],[60,520,5,.9],[316,500,6,1]].forEach(([x,y,c,s])=>h+=S04DROP(x,y,S04CONF[c],s));
  return `<svg class="s04conf" viewBox="0 0 360 640" aria-hidden="true">${h}</svg>`;}
export const S04FLASH=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4Z" fill="#fff" stroke="#FFE27A" stroke-width="1.5"/><circle r="5" fill="#fff"/></g>`;
export const S04WAVE=`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 30 Q4 20 10 10 M16 34 Q10 20 18 6" fill="none" stroke="#FFE27A" stroke-width="3" stroke-linecap="round"/></svg>`;
/* sandık: closed | open (ışıklı) | empty (açık, boş) */
export function chestSVG(st){const band=x=>`<rect x="${x}" y="30" width="7" height="36" fill="#E8C150" stroke="#7A5A00" stroke-width="1.5"/>`;
  const body=`<rect x="6" y="30" width="68" height="36" rx="4" fill="#A8652E" stroke="#3D220E" stroke-width="3"/><path d="M8 44 H72 M8 55 H72" stroke="#7A4521" stroke-width="2"/>${band(14)}${band(59)}`;
  if(st==="closed") return `<svg class="cs" viewBox="0 0 80 70" aria-hidden="true"><ellipse cx="40" cy="67" rx="34" ry="4" fill="rgba(0,0,0,.3)"/>${body}<path d="M6 32 V22 Q40 0 74 22 V32Z" fill="#C07A3A" stroke="#3D220E" stroke-width="3"/><path d="M15 31 V16 M65 31 V16" stroke="#E8C150" stroke-width="7"/><path d="M15 31 V16 M65 31 V16" stroke="#7A5A00" stroke-width="1" opacity=".5"/><rect x="33" y="24" width="14" height="16" rx="2" fill="#E8C150" stroke="#7A5A00" stroke-width="1.8"/><circle cx="40" cy="30" r="2.4" fill="#3D220E"/><path d="M40 31 V36" stroke="#3D220E" stroke-width="2"/></svg>`;
  const coins=st==="open"?[[24,28],[34,24],[46,25],[56,29],[30,31],[41,30],[51,31]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="4.5" fill="#FFC21A" stroke="#A86A00" stroke-width="1.5"/>`).join(""):"";
  const glow=st==="open"?`<path d="M40 30 L10 -14 L26 -18 Z M40 30 L40 -22 L50 -20Z M40 30 L70 -14 L58 -20Z" fill="rgba(255,226,122,.55)"/><ellipse cx="40" cy="30" rx="34" ry="12" fill="rgba(255,236,150,.6)"/>`:"";
  return `<svg class="cs" viewBox="0 0 80 70" aria-hidden="true"><ellipse cx="40" cy="67" rx="34" ry="4" fill="rgba(0,0,0,.3)"/>${glow}<path d="M8 30 L12 6 Q40 -6 68 6 L72 30Z" fill="#6B3A17" stroke="#3D220E" stroke-width="3"/><path d="M14 8 Q40 -2 66 8" fill="none" stroke="#E8C150" stroke-width="4"/>${coins}${body}<rect x="33" y="30" width="14" height="9" rx="2" fill="#E8C150" stroke="#7A5A00" stroke-width="1.8"/></svg>`;}
export const LOCKBIG=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 30 V10 Q16 0 28 10 V30Z" fill="#7A4521" stroke="#FFE9C7" stroke-width="2"/><rect x="10" y="15" width="12" height="10" rx="2" fill="#FFE9C7"/><path d="M12.5 15 V12.5 a3.5 3.5 0 0 1 7 0 V15" fill="none" stroke="#FFE9C7" stroke-width="2"/></svg>`;
export const coinIc=(st="")=>COIN.replace('class="coin"',`class="s04fly" style="${st}"`);

/* Duvarın polaroidi: gerçek galWorld, ölçeklenmiş. iw×ih iç alan; duvarın y 140–450 bandı */
export function polaroid(G,s,iw,ih,cap,cls=""){const V=VENUES[G.v], k=Math.max(iw/V.W,ih/310), tx=iw/2-V.W/2*k, ty=-140*k;
  const w=galWorld(G,s,{mode:"snap",static:1}).replace(`style="width:${V.W}px`,`style="width:${V.W}px;transform:translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k.toFixed(4)})`);
  return `<figure class="s04pol ${cls}"><i class="tape"></i><div class="s04in" style="width:${iw}px;height:${ih}px">${w}</div><figcaption>${cap}</figcaption></figure>`;}
export const S04FULL=(v,o={})=>({v,next:VENUES[v].to+1,decor:[],sx:0,...o});

/* Tebrik kartı. o = {G, s, chest: closed|open|opening|done, last, hud(coin), hand, nofaces} */
export function cardHTML(o){const G=o.G, V=VENUES[G.v], ch=V.ch, L=lookOf(G), amt=CHEST_AMT[ch], last=ch===VENUES.length-1;
  const cst=o.chest||"closed", openNow=cst!=="closed";
  const chest=`<button type="button" data-act="s04chest" class="s04chest${cst==="closed"?" wob":""}" aria-label="Sandık, ${amt} coin${cst==="closed"?", dokun aç":""}">
      ${cst==="open"||cst==="opening"?`<span class="amt">${COIN}+${amt}</span>`:""}
      ${chestSVG(cst==="closed"?"closed":cst==="done"?"empty":"open")}
      <span class="tag${cst==="closed"?" gold":""}">${cst==="closed"?"Dokun, aç!":cst==="done"?`+${amt} coin ✓`:`Sandık · ${amt}`}</span>
      ${o.hand?`<div class="s03hand">${HAND}</div>`:""}</button>`;
  const nxt=!last&&!o.nofaces?`<div class="s04new"><b>Yeni kıyafetler açıldı</b><div class="s04faces">${[0,1,2].map(vi=>`<i>${ressamSVG(L.k,ch+1,vi,"face")}</i>`).join("")}</div><small>${LOC[ch+1]} seçeceksin</small></div>`
    :last?`<div class="s04soon">${LOCKBIG}<span><b>Diğer salonlar yakında</b>Yeni bölümler güncellemeyle gelir. Fuar ve Defterler açık.</span></div>`:"";
  const coins=o.hud!=null?o.hud:340;
  return `<div class="galsub s04sub"><div class="scrim"></div>
    <div class="s04hud"><div class="pill${o.bump?" bump":""}" data-pill="coin">${COINIC}<span>${coins}</span></div></div>
    <div class="popup panel s04card" role="dialog" aria-label="${ch+1}. Bölüm tamamlandı">
      <div class="sign size-l stroke"><span class="nail"></span>Tebrikler!<span class="nail"></span></div>
      <div class="s04title stroke">${ch+1}. Bölüm tamamlandı!</div>
      <div class="body s04row">${polaroid(G,o.s,124,92,V.name)}${chest}</div>
      ${nxt}
      <button class="btn primary size-l" type="button">${last?"Tamam":"Sıradaki bölüm"}</button>
    </div>${o.fly||""}</div>`;}

export function s04Card(g){const G=live.G, sb=g.sub, np=sb.shown; sb.shown=1;
  return cardHTML({G,s:live.s,chest:sb.open?"open":"closed",hand:!sb.open&&G.v===0,hud:sb.open?live.s.coins:live.s.coins-(sb.got||0),bump:sb.open})
    .replace(`<button class="btn primary size-l" type="button">`,`<button class="btn primary size-l" type="button" data-act="gnextv">`).replace("popup panel s04card",np?"popup panel s04card nopop":"popup panel s04card");}
/* Sandık açılışı (revize 25.11.2026): kart yeniden çizilmez; aynı kartta kapak açılır, coinler sol üstteki sayaca uçar, sayaç artar. */
export function chestAnimSVG(){const band=x=>`<rect x="${x}" y="30" width="7" height="36" fill="#E8C150" stroke="#7A5A00" stroke-width="1.5"/>`;
  const body=`<rect x="6" y="30" width="68" height="36" rx="4" fill="#A8652E" stroke="#3D220E" stroke-width="3"/><path d="M8 44 H72 M8 55 H72" stroke="#7A4521" stroke-width="2"/>${band(14)}${band(59)}`;
  const coins=[[24,28],[34,24],[46,25],[56,29],[30,31],[41,30],[51,31]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="4.5" fill="#FFC21A" stroke="#A86A00" stroke-width="1.5"/>`).join("");
  return `<svg class="cs" viewBox="0 0 80 70" aria-hidden="true"><ellipse cx="40" cy="67" rx="34" ry="4" fill="rgba(0,0,0,.3)"/>
    <g class="glow"><path d="M40 30 L10 -14 L26 -18 Z M40 30 L40 -22 L50 -20Z M40 30 L70 -14 L58 -20Z" fill="rgba(255,226,122,.55)"/><ellipse cx="40" cy="30" rx="34" ry="12" fill="rgba(255,236,150,.6)"/></g>
    <g class="blid"><path d="M8 30 L12 6 Q40 -6 68 6 L72 30Z" fill="#6B3A17" stroke="#3D220E" stroke-width="3"/><path d="M14 8 Q40 -2 66 8" fill="none" stroke="#E8C150" stroke-width="4"/></g>
    <g class="pile">${coins}</g>${body}<rect x="33" y="30" width="14" height="9" rx="2" fill="#E8C150" stroke="#7A5A00" stroke-width="1.8"/>
    <g class="lid"><path d="M6 32 V22 Q40 0 74 22 V32Z" fill="#C07A3A" stroke="#3D220E" stroke-width="3"/><path d="M15 31 V16 M65 31 V16" stroke="#E8C150" stroke-width="7"/><rect x="33" y="24" width="14" height="16" rx="2" fill="#E8C150" stroke="#7A5A00" stroke-width="1.8"/><circle cx="40" cy="30" r="2.4" fill="#3D220E"/><path d="M40 31 V36" stroke="#3D220E" stroke-width="2"/></g></svg>`;}
export function s04OpenChest(sb){const G=live.G, amt=CHEST_AMT[G.v], rm=RM||live.set.rm;
  const sub=live.el.querySelector(".s04sub"), btn=sub&&sub.querySelector(".s04chest"), pill=sub&&sub.querySelector('.s04hud [data-pill="coin"]');
  sb.open=1; efekt("sandik"); if(!btn||!pill) { galDraw(); return; }
  const num=pill.querySelector("span"), to=live.s.coins, from=to-(sb.got||0);
  btn.classList.remove("wob"); btn.querySelector(".s03hand")?.remove(); btn.setAttribute("aria-label",`Sandık açıldı, ${amt} coin`);
  btn.querySelector(".cs").outerHTML=chestAnimSVG(); btn.classList.add("opening");
  const tag=btn.querySelector(".tag"); tag.classList.remove("gold"); tag.textContent=`Sandık · ${amt}`;
  btn.insertAdjacentHTML("afterbegin",`<span class="amt">${COIN}+${amt}</span>`);
  if(rm){ num.textContent=to; pill.classList.add("bump"); return; }
  /* uçuş: sandıktan sayacın coin ikonuna, tek tek; her varışta sayaç artar */
  const R=sub.getBoundingClientRect(), k=sub.offsetWidth/R.width, cr=btn.querySelector(".cs").getBoundingClientRect(), ic=pill.querySelector("svg").getBoundingClientRect();
  const sx=(cr.left+cr.width/2-R.left)*k-12, sy=(cr.top+cr.height*.35-R.top)*k-12, tx=(ic.left+ic.width/2-R.left)*k-12, ty=(ic.top+ic.height/2-R.top)*k-12;
  const N=8, step=Math.ceil((to-from)/N);
  for(let i=0;i<N;i++){
    sub.insertAdjacentHTML("beforeend",coinIc(`left:${sx}px;top:${sy}px;opacity:0`)); const c=sub.lastElementChild;
    const dx=(i%2?1:-1)*(14+i*5), mx=(sx+tx)/2+dx*2-sx, my=ty+46-sy;
    const a=c.animate([{transform:"translate(0,0) scale(.6)",opacity:0},{transform:`translate(${dx}px,-26px) scale(1.1)`,opacity:1,offset:.25},{transform:`translate(${mx}px,${my}px) scale(1)`,opacity:1,offset:.6},{transform:`translate(${tx-sx}px,${ty-sy}px) scale(.7)`,opacity:1}],
      {duration:720,delay:420+i*70,easing:"cubic-bezier(.4,0,.6,1)",fill:"both"});
    a.onfinish=()=>{coinVardi(i); kivilcim(pill.querySelector("svg")); c.remove(); /* A9 · 5B */ num.textContent=Math.min(to,from+step*(i+1)); pill.classList.remove("hit"); void pill.offsetWidth; pill.classList.add("hit");
      if(i===N-1){ num.textContent=to; pill.classList.add("bump"); }};}}

export function s04Start(){const G=live.G, g=live.gal, amt=CHEST_AMT[G.v]; G.paid=G.paid||{};
  const got=G.paid[G.v]?0:amt; if(got){G.paid[G.v]=1; live.s.coins+=got;}
  const rm=RM||live.set.rm; g.sub={k:"s04",ph:rm?"card":"pull",got}; g.bubble=null;
  const sb=g.sub; if(!rm){ setTimeout(()=>{ if(g.sub===sb&&sb.ph==="pull"){sb.ph="party"; galDraw();} },800); setTimeout(()=>{ if(g.sub===sb&&sb.ph==="party"){sb.ph="card"; galDraw();} },3300); }}
export function s04Apply(){const sb=live.gal&&live.gal.sub; if(!sb||sb.k!=="s04") return; const gal=live.el.querySelector(".gal"); if(gal) s04Paint(gal,live.G,sb);}
/* tören katmanı: gal = .gal öğesi (canlı ya da sabit kart) */
export function s04Paint(gal,G,sb){
  const V=VENUES[G.v], k=Math.min(.84,344/V.W), tx=180-V.W/2*k, ty=300-300*k, w=gal.querySelector("[data-gw]"), gin=gal.querySelector(".gin");
  gal.classList.add("s04a"); if(w){w.style.scrollBehavior="auto"; w.scrollLeft=0;} gin.style.transform=`translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${k})`;
  const party=sb.ph!=="pull";
  if(party){const sign=gal.querySelector(".gsign .sign"); sign.classList.add("size-l"); sign.innerHTML=`<span class="nail"></span>${SENT[V.ch]}<span class="nail"></span>`;
    gal.querySelectorAll(".gpath i")[V.ch]?.classList.add("s04fill"); gal.querySelector(".gchar")?.classList.add("s02glow");}
  if(sb.ph==="card") return;
  const [px,py]=V.char||[4,316], sx=tx+px*k, sy=ty+py*k; let h="";
  if(party){ if(V.ch===2) h+=visitors(); h+=confetti(V.ch*7+3,V.ch===2?{n:40,y0:120,y1:380}:{});
    if(V.ch===4) h+=`<svg class="s04conf" viewBox="0 0 360 640" aria-hidden="true">${[[60,150,1.2],[300,140,1],[330,420,1.3],[40,430,.9],[300,560,.8]].map(([x,y,q])=>S04FLASH(x,y,q)).join("")}</svg><div class="s04note" style="top:440px">Müzede kendi salonun var!</div>`;
    if(k>.6) h+=`<div class="s04bub" style="left:${Math.max(8,sx+10*k)}px;top:${sy-38}px">${V.ch===2?"Hoş geldiniz!":"Yaşasın!"}</div>`;
    if(k>.6) h+=`<div class="s04wave" style="left:${sx+74*k}px;top:${sy+8*k}px;width:30px;height:30px">${S04WAVE}</div>`;}
  h+=`<div class="s04skip">Dokun, geç ›</div><button class="s04tap" type="button" data-act="s04skip" aria-label="Töreni geç"></button>`;
  gal.insertAdjacentHTML("beforeend",h);}
export function visitors(){const P=(x,c,g,s=1)=>`<g transform="translate(${x} 0) scale(${s} 1)" fill="${c}"><circle cx="0" cy="${408}" r="10"/><path d="M-13 ${468} Q-15 ${424} 0 ${420} Q15 ${424} 13 ${468}Z"/><rect x="-10" y="${466}" width="8" height="34" rx="3"/><rect x="2" y="${466}" width="8" height="34" rx="3"/>${g?`<path d="M14 ${440} l5 -12 h6 l-3 12 z M17.5 ${440} v8" stroke="${c}" stroke-width="2" fill="rgba(255,255,255,.35)"/>`:""}</g>`;
  return `<svg class="s04vis" viewBox="0 0 360 640" aria-hidden="true"><defs><linearGradient id="vsp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,236,170,.35)"/><stop offset="1" stop-color="rgba(255,236,170,0)"/></linearGradient></defs>
    <path d="M130 120 L96 470 H210Z M250 120 L210 470 H330Z" fill="url(#vsp)"/>
    ${P(140,"#2B2440",1)}${P(178,"#3A2F55",0,.95)}${P(226,"#2B2440",1,1.05)}${P(270,"#46365E",0)}${P(318,"#2B2440",1,.95)}</svg>`;}



