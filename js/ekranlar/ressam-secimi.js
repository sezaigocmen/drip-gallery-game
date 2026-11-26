// ekranlar/ressam-secimi.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { RM, live, toast } from "../akis.js";
import { XICON } from "../cizim/ikonlar.js";
import { S06OPT, ressamSVG } from "../cizim/ressam.js";
import { CHECK, GSTAR, galDraw } from "./sergi.js";

/* ================= S06 Ressam ve kıyafet seçimi (Öneri 14 · A Ayna sahnesi) =================
   Her bölümün başında (S04 + S05'ten sonra) yeni bölümün duvarında açılır: duvar söner, oval ayna, büyük ressam, altta 6 portre
   (kadının 3 kıyafeti | boşluk | erkeğin 3 kıyafeti), sağa kaydırılan şerit. Önceki kişinin 1. kıyafeti seçili gelir. × yok.
   Ayarlar → “Görünüm · Değiştir” aynı ekranı açar (sub.set): “Kullanılıyor” etiketi, × ve “Kaydet”, bedava.
   sub = {k:"s06", sel, used?, set?, first?, done?, sl? (şerit kaydırması), shift? (sabit kartta kaydırma)} */
export const S06PX=i=>18+i*80+(i>=3?10:0);
export function s06Sign(o){return o.done?"Bu sensin!":o.set?"Görünümün":o.first?"Ressamını seç":"Yeni kıyafetin";}
export function s06HTML(V,o){const [ck,vi]=S06OPT[o.sel], ch=V.ch||0;
  const strip=`<div class="s06row" data-s06row role="radiogroup" aria-label="Ressam ve kıyafet, sağa kaydır"><div class="s06strip"${o.shift?` style="transform:translateX(${-o.shift*80}px)"`:""}>${S06OPT.map(([k,v],i)=>`<button class="s06p${i===o.sel?" sel":""}${i===3?" s06gap":""}" type="button" role="radio" data-act="s06p" data-i="${i}" aria-checked="${i===o.sel}" aria-label="${k==="f"?"Kadın":"Erkek"} ressam, kıyafet ${v+1}${i===o.used?", kullanılıyor":""}"><span class="face">${ressamSVG(k,ch,v,"face")}</span>${i===o.sel?`<i class="ok">${CHECK}</i>`:""}${i===o.used?"<em>Kullanılıyor</em>":""}</button>`).join("")}</div></div>`;
  let h=o.done?"":`<div class="s06sub">${o.set?"Değiştirmek bedava":o.first?"Dokun, ressamın değişsin":"Bu bölümün kıyafetleri"}</div>`;
  h+=`<i class="s06mir" aria-hidden="true"></i><div class="s06big${o.done?" s02glow spin":""}" role="img" aria-label="${ck==="f"?"Kadın":"Erkek"} ressam, kıyafet ${vi+1}">${ressamSVG(ck,ch,vi,"full")}</div>`;
  if(o.done) h+=`<div class="s06done" role="status">Bölüm başlıyor…</div>`+GSTAR(84,190,11)+GSTAR(276,170,9)+GSTAR(80,330,8)+GSTAR(282,300,10)+GSTAR(180,128,7);
  else h+=strip+`<button class="btn primary size-l s06go" type="button" data-act="s06go">${o.set?"Kaydet":"Bu benim!"}</button>`;
  if(o.set&&!o.done) h+=`<button class="btn danger icon s02x s06x" type="button" data-act="s06x" aria-label="Kapat">${XICON}</button>`;
  return h;}
/* Canlı şerit: yeniden çizimde kaydırma korunur; ilk açılışta seçili portre görünür; fare tekerleği ve sürükleme ile kayar */
export function s06Bind(){const sb=live.gal&&live.gal.sub; if(!sb||sb.k!=="s06"||sb.done) return; const r=live.el.querySelector("[data-s06row]"); if(!r) return;
  r.scrollLeft=sb.sl??Math.max(0,S06PX(sb.sel)+66+18-r.clientWidth);
  r.addEventListener("scroll",()=>{sb.sl=r.scrollLeft;},{passive:true});
  r.addEventListener("wheel",e=>{ if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){ r.scrollLeft+=e.deltaY; e.preventDefault(); } },{passive:false});
  let d=null;
  r.addEventListener("pointerdown",e=>{ if(e.pointerType==="mouse") d={x:e.clientX,s:r.scrollLeft,m:false}; });
  r.addEventListener("pointermove",e=>{ if(!d) return; const dx=e.clientX-d.x; if(Math.abs(dx)>6) d.m=true; if(d.m) r.scrollLeft=d.s-dx; });
  r.addEventListener("pointerup",()=>{ if(d&&d.m){ live.galMoved=true; setTimeout(()=>{live.galMoved=false;},0); } d=null; });
  r.addEventListener("pointerleave",()=>{ d=null; });}
export function s06Click(pa,act,g){const G=live.G, sb=g.sub; if(sb.done) return;
  if(pa==="s06p"){ sb.sel=+act.dataset.i; galDraw(); return; }
  if(pa==="s06x"){ g.sub=null; galDraw(); return; }
  if(pa!=="s06go") return;
  const [k,vi]=S06OPT[sb.sel];
  if(sb.set){ const ch=sb.sel!==sb.used; G.look={k,vi}; g.sub=null; if(ch) toast("Görünüm değişti · bedava"); galDraw(); return; }
  G.look={k,vi}; sb.done=1; galDraw();
  setTimeout(()=>{ if(live.gal!==g||g.sub!==sb) return; g.sub=null; if(sb.msg) toast(sb.msg,2600); galDraw(); },RM?500:1800);}
