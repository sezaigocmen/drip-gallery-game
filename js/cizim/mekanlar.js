// cizim/mekanlar.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { live } from "../akis.js";
import { STAR } from "./ikonlar.js";
import { paintingSVG } from "./tablo.js";
import { LEVELS } from "../veri/seviyeler.js";

/* ================= S01 Sergi (3. bölüm) =================
   Mekân = tek duvar (cepheden). W = dünya genişliği: 360 tek ekran, fazlası yatay kayar.
   Kural: bir mekândaki dekorların toplam yıldız fiyatı = o mekânda kazanılabilecek yıldız (Sv 1–2 eğitim, yıldız vermez).
   Kalıcı ilerleme live.G = {v: mekân, next: sıradaki seviye, decor: [alınanlar], sx: kaydırma}; görünüm live.gal. */
export const VENUES=(()=>{ /* 5 bölüm (24.11.2026 revizyonu, arka planlar Sezai'nin seçimi). Kat = 400 px'te başlar. Dekor yerleri (S02): şimdilik Atölyem'de Bitki + Halı; diğer bölümlerin listesi PROJE-DURUMU'nda. */
const SV=(W,inner)=>'<svg width="'+W+'" height="544" viewBox="0 0 '+W+' 544" style="position:absolute;left:0;top:0" aria-hidden="true">'+inner+'</svg>';
const rect=(x,y,w,h,f,o='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'" '+o+'/>';
const planks=(W,y,h,c1,c2,step=40)=>{let s=rect(0,y,W,h,c1); for(let x=step;x<W;x+=step) s+='<path d="M'+x+' '+y+' V'+(y+h)+'" stroke="'+c2+'" stroke-width="2"/>'; return s+'<path d="M0 '+y+' H'+W+'" stroke="rgba(0,0,0,.2)" stroke-width="5"/>';};
const pat=(id,w,h,inner)=>'<defs><pattern id="'+id+'" width="'+w+'" height="'+h+'" patternUnits="userSpaceOnUse">'+inner+'</pattern></defs>';
const stanch=(xs,y,rope)=>{let s=''; for(let i=0;i<xs.length-1;i++){const a=xs[i],b=xs[i+1]; s+='<path d="M'+a+' '+(y+6)+' Q'+((a+b)/2)+' '+(y+26)+' '+b+' '+(y+6)+'" fill="none" stroke="'+rope+'" stroke-width="5" stroke-linecap="round"/>';}
  return s+xs.map(x=>rect(x-3,y,6,46,'#C9961A','rx="2"')+'<circle cx="'+x+'" cy="'+y+'" r="6" fill="#E8C150" stroke="#7A5A00" stroke-width="1.5"/><ellipse cx="'+x+'" cy="'+(y+47)+'" rx="12" ry="4" fill="#7A5A00"/>').join('');};
const bench=(x,y)=>rect(x,y,110,10,'#B97C45','rx="3" stroke="#5B3217" stroke-width="2"')+rect(x,y+13,110,9,'#A86B39','rx="3" stroke="#5B3217" stroke-width="2"')+rect(x+8,y+22,7,16,'#3D220E')+rect(x+95,y+22,7,16,'#3D220E');
const spot=(cx,top,bottom,half)=>'<path d="M'+(cx-6)+' '+top+' h12 l4 12 h-20z" fill="#2B2B2B"/><path d="M'+(cx-14)+' '+(top+12)+' L'+(cx-half)+' '+bottom+' H'+(cx+half)+' L'+(cx+14)+' '+(top+12)+'Z" fill="rgba(255,236,170,.30)"/>';
const DAMASK=pat('dmz',28,28,rect(0,0,28,28,'#7A1E2C')+'<path d="M14 4 L22 14 L14 24 L6 14Z" fill="#8E2A3A"/>');
const V=[
 {id:"atolye",name:"Atölyem",from:1,to:4,W:360,outfit:"#3E9E6B",fit:"tulum",
  frames:[[14,176,74,58],[100,184,74,58],[186,184,74,58],[272,176,74,58]],
  bg:W=>SV(W,rect(0,0,W,400,'#E2ECD0')+
    rect(132,262,212,124,'#FFFFFF','rx="4" stroke="#7A4521" stroke-width="5"')+rect(138,268,200,112,'#BFE6FF')+'<circle cx="300" cy="292" r="14" fill="#FFD43B"/><path d="M138 360 Q170 320 204 346 Q236 312 270 342 Q300 318 338 340 V380 H138Z" fill="#4E9A4A"/><path d="M138 372 Q190 352 240 368 T338 362 V380 H138Z" fill="#3E9E3B"/><path d="M238 268 V380 M138 324 H338" stroke="#FFFFFF" stroke-width="5"/>'+
    '<path d="M0 168 Q180 200 360 168" fill="none" stroke="#6B5A48" stroke-width="2.5"/>'+[42,128,214,300].map((x,i)=>rect(x-3,(i%3?176:170),6,12,'#D99556','rx="1.5" stroke="#5B3217" stroke-width="1"')).join('')+
    pat('tat',36,36,'<rect width="36" height="36" fill="#C8714B"/><rect width="34" height="34" fill="#D4825A"/>')+rect(0,400,W,144,'url(#tat)')+'<path d="M0 400 H'+W+'" stroke="rgba(0,0,0,.2)" stroke-width="5"/>'+
    ''),
  decor:[{id:"bitki",n:"Bitki",p:1,x:290,y:296,w:60,h:104},{id:"hali",n:"Halı",p:1,x:106,y:404,w:196,h:40}]},
 {id:"kafe",name:"Kafe Duvarı",from:5,to:8,W:360,outfit:"#D8452B",fit:"onluk",
  frames:[[164,176,112,82],[292,176,58,82],[164,280,70,50],[250,280,100,50]],
  bg:W=>SV(W,rect(0,0,W,400,'#CFEBE3')+rect(0,342,W,58,'#FFFFFF')+(()=>{let s='';for(let x=10;x<W;x+=22)s+='<path d="M'+x+' 346 V398" stroke="#D9E6E1" stroke-width="3"/>';return s;})()+'<path d="M0 342 H'+W+'" stroke="#9CC8BB" stroke-width="5"/>'+
    rect(14,176,136,124,'#FFFFFF','rx="4" stroke="#5B8F80" stroke-width="5"')+rect(20,182,124,112,'#D9F1FF')+rect(20,248,124,46,'#2E64B0')+'<circle cx="112" cy="218" r="14" fill="#EDB83A"/><path d="M50 246 h22 l-4 -18z" fill="#FFF9EE" stroke="#6B5A48" stroke-width="1"/><path d="M82 182 V294 M20 238 H144" stroke="#FFFFFF" stroke-width="4"/>'+
    '<path d="M8 152 H156 L150 174 H14Z" fill="#D9472F"/>'+[0,1,2,3,4,5].map(i=>'<path d="M'+(20+i*24)+' 152 h12 l-1 22 h-12z" fill="#FFFFFF"/>').join('')+
    planks(W,400,144,'#D9B48A','#B9926A',44)+'<ellipse cx="246" cy="398" rx="40" ry="7" fill="#FFFFFF" stroke="#5B8F80" stroke-width="3"/><path d="M246 404 V440 M232 442 H260" stroke="#5B8F80" stroke-width="4"/><path d="M190 410 v32 M212 410 v32 M186 410 h30" stroke="#C9473A" stroke-width="4"/><path d="M282 410 v32 M304 410 v32 M278 410 h30" stroke="#C9473A" stroke-width="4"/>')},
 {id:"ilksergi",name:"İlk Sergim",from:9,to:14,W:360,outfit:"#2A3F7A",fit:"ceket",
  frames:[[20,168,72,54],[20,236,72,54],[112,166,128,92],[112,276,128,50],[258,170,84,64],[258,250,84,64]],
  bg:W=>SV(W,rect(0,0,W,400,'#2F5D4E')+rect(0,336,W,64,'#7A4A2A')+(()=>{let s='';for(let x=0;x<W;x+=60)s+=rect(x+6,344,48,48,'none','stroke="#5B3217" stroke-width="2"');return s;})()+'<path d="M0 336 H'+W+'" stroke="#C9961A" stroke-width="4"/>'+
    '<text x="236" y="374" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="20" fill="#E8C150" stroke="#7A5A00" stroke-width=".8">İLK SERGİM</text>'+
    planks(W,400,144,'#5B3217','#3D220E',30)+stanch([124,232,340],390,'#B3261E'))},
 {id:"meydani",name:"Meydan Sergisi",from:15,to:24,W:700,outfit:"#8A4F24",fit:"sal",
  frames:[0,1,2,3,4].flatMap(i=>[[104+i*112,172,92,70],[104+i*112,262,92,70]]),
  bg:W=>{let b='';const hs=[90,140,70,160,110,80,150,100,130,90,170,120];let x=0;hs.forEach((h,i)=>{const w=58+(i*13)%30;b+=rect(x,400-h-120,w,h+120,i%2?'#8C5A7A':'#A86F8A');for(let wy=400-h-100;wy<380;wy+=26)for(let wx=x+8;wx<x+w-14;wx+=18)b+=rect(wx,wy,8,12,(wx+wy)%3?'#FFD27A':'#6E4560');x+=w+2;});
    let lights='';for(let i=0;i<=20;i++){const lx=i*W/20,ly=i%2?172:152;lights+=(i?'L':'M')+lx+' '+ly+' ';}
    return SV(W,'<defs><linearGradient id="gmy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8F6B"/><stop offset=".55" stop-color="#FFC48A"/><stop offset="1" stop-color="#FFE7B8"/></linearGradient><pattern id="cmy" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#8E6E58"/><circle cx="10" cy="10" r="8.5" fill="#B08C6E"/></pattern></defs>'+rect(0,0,W,400,'url(#gmy)')+'<circle cx="600" cy="250" r="44" fill="#FFE27A" opacity=".85"/>'+b+
      [0,1,2,3,4].map(i=>rect(96+i*112,158,108,242,'#B97C45','rx="5" stroke="#5B3217" stroke-width="3"')).join('')+
      '<path d="'+lights+'" fill="none" stroke="#3D220E" stroke-width="2"/>'+Array.from({length:19},(_,i)=>'<circle cx="'+((i+1)*W/20)+'" cy="'+((i+1)%2?177:157)+'" r="5" fill="'+['#EDB83A','#D9472F','#4E9A4A','#2E64B0','#E77B2E'][i%5]+'" stroke="#3D220E" stroke-width="1.2"/>').join('')+
      rect(0,400,W,144,'url(#cmy)')+'<path d="M0 400 H'+W+'" stroke="rgba(0,0,0,.25)" stroke-width="5"/>'+bench(214,410)+bench(442,410)+rect(670,250,6,190,'#3D220E')+'<circle cx="673" cy="246" r="12" fill="#FFE27A" stroke="#3D220E" stroke-width="3"/>');}},
 {id:"muze",name:"Müze",from:25,to:30,W:820,outfit:"#2B2B2B",fit:"sik",
  frames:Array.from({length:6},(_,i)=>[124+i*112,200,100,78]),
  bg:W=>{const vis=(x,c)=>'<circle cx="'+x+'" cy="312" r="13" fill="'+c+'"/><rect x="'+(x-15)+'" y="326" width="30" height="62" rx="12" fill="'+c+'"/><rect x="'+(x-12)+'" y="384" width="9" height="50" fill="'+c+'"/><rect x="'+(x+3)+'" y="384" width="9" height="50" fill="'+c+'"/>';
    const plaque=x=>rect(x,292,52,18,'#E8C150','rx="2" stroke="#7A5A00" stroke-width="1.5"')+rect(x+8,297,36,2.5,'#5B3217')+rect(x+12,303,28,2,'#7A5A00');
    return SV(W,DAMASK+rect(0,0,W,400,'url(#dmz)')+rect(0,138,W,8,'#C9961A')+rect(0,146,W,3,'#7A5A00')+rect(110,152,W-150,5,'#2B2B2B')+
      Array.from({length:6},(_,i)=>spot(174+i*112,157,286,58)+plaque(148+i*112)).join('')+rect(0,386,W,14,'#3D220E')+
      rect(0,400,W,144,'#CFCBC4')+'<path d="M0 400 H'+W+'" stroke="rgba(0,0,0,.18)" stroke-width="5"/>'+rect(0,404,W,30,'rgba(255,255,255,.25)')+rect(440,400,150,12,'#2B2B2B','rx="3"')+rect(452,412,8,26,'#2B2B2B')+rect(570,412,8,26,'#2B2B2B')+vis(372,'#9A958C')+vis(660,'#B3ADA3'));}}];
return V.map((v,i)=>({...v,ch:i,fw:92,fh:70,decor:v.decor||[],bg:v.bg(v.W)}));})();
export const venueOf=lv=>{const i=VENUES.findIndex(V=>lv>=V.from&&lv<=V.to); return i<0?(lv<1?0:VENUES.length-1):i;};
/* 30 seviye veri/seviyeler.js'te (A5). 30'dan sonrası (prototip sonu): Seviye 30 tahtasının kopyası. */
export function ensureLevel(n){ if(LEVELS[n]) return; const hard=n%10===0;
  LEVELS[n]={...LEVELS[30],name:`Seviye ${n}`,next:n,intro:null,hard,reward:hard?50:20};}
export const SMSTAR=STAR.replace('class="ic"','');
export const FRAMEIC=`<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="#FFE9C7" stroke-width="2"/><path d="M4 11l3-3 2 2 1.5-1.5L12 11z" fill="#FFE9C7"/></svg>`;
export const LAMPIC=`<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="6.5" r="5" fill="#FFE9C7"/><rect x="5.5" y="11" width="5" height="4" rx="1" fill="#FFE9C7"/></svg>`;
export const SPARK=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" fill="#fff"/></svg>`;
export const CHEV=d=>`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d==="l"?"M10.5 2.5L5 8l5.5 5.5":"M5.5 2.5L11 8l-5.5 5.5"}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const GEAR=`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-dasharray="3.4 1.7"/><circle cx="12" cy="12" r="2.5" fill="#fff"/></svg>`;
export const TABS={
  shop:`<svg viewBox="0 0 24 24"><path d="M3 4h3l2 11h11l2-8H7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.8" fill="currentColor"/><circle cx="17" cy="19" r="1.8" fill="currentColor"/></svg>`,
  gal:`<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="#FFD43B" stroke="#7A4A00" stroke-width="2"/><rect x="6.5" y="7.5" width="11" height="9" fill="#5FB0FF"/><path d="M6.5 16.5l4-4 3 3 2-2 2 3z" fill="#3DBB62"/></svg>`,
  book:`<svg viewBox="0 0 24 24"><path d="M4 5h7v15H4zM13 5h7v15h-7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`};
/* Henüz oynanmamış (prototipte olmayan) seviyelerin tablosu için basit yer tutucu resimler */
export const MA=[
  c=>`<rect width="100" height="76" fill="#BFE3FF"/><circle cx="74" cy="20" r="10" fill="${c[1]}"/><path d="M0 56 Q30 34 60 52 T100 48 V76 H0Z" fill="${c[2]}"/>`,
  c=>`<rect width="100" height="76" fill="#FFF1D6"/><rect x="30" y="34" width="40" height="30" fill="${c[1]}"/><path d="M24 36 L50 14 L76 36Z" fill="${c[0]}"/><rect x="45" y="48" width="10" height="16" fill="#5B3217"/>`,
  c=>`<rect width="100" height="76" fill="#F6E2BE"/><rect y="56" width="100" height="20" fill="#A86B39"/><circle cx="38" cy="46" r="12" fill="${c[1]}"/><circle cx="60" cy="44" r="7" fill="#7D4FA6"/><circle cx="68" cy="51" r="7" fill="#7D4FA6"/><circle cx="60" cy="56" r="6" fill="#7D4FA6"/>`,
  c=>`<rect width="100" height="44" fill="#D9F1FF"/><rect y="44" width="100" height="32" fill="${c[2]}"/><path d="M30 46 H70 L62 56 H38Z" fill="${c[0]}"/><path d="M50 16 V44 H33Z" fill="#FFF9EE" stroke="#6B5A48" stroke-width="1"/>`,
  c=>`<rect width="100" height="76" fill="#FFF3DA"/><path d="M50 76 V40" stroke="#4E9A4A" stroke-width="4"/>${[0,72,144,216,288].map(a=>`<circle cx="${(50+13*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(32+13*Math.sin(a*Math.PI/180)).toFixed(1)}" r="7" fill="${c[0]}"/>`).join("")}<circle cx="50" cy="32" r="7" fill="#EDB83A"/>`,
  c=>`<rect width="100" height="76" fill="#FFF9EE"/><rect x="8" y="8" width="40" height="34" fill="${c[0]}"/><rect x="54" y="8" width="38" height="20" fill="${c[1]}"/><rect x="54" y="34" width="38" height="34" fill="${c[2]}"/><rect x="8" y="48" width="40" height="20" fill="#EDB83A"/>`];
export const PALS=[["#D9472F","#EDB83A","#4E9A4A"],["#7D4FA6","#E77B2E","#2E64B0"],["#D9472F","#E77B2E","#2E64B0"],["#2E64B0","#EDB83A","#7D4FA6"]];
export const miniArt=n=>`<svg viewBox="0 0 100 76" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${MA[n%6](PALS[(n>>1)%4])}</svg>`;
/* Gerçek tablosu olan seviyelerde (1, 2, 12 ve bu oturumda kazanılanlar) duvardaki tablo, oyuncunun gerçekten boyadığı tablodur */
export function galArt(lv){const L=LEVELS[lv]; if(!L||!([1,2,11].includes(lv)||(live.wonArt&&live.wonArt[lv]))) return miniArt(lv);
  const all={}; L.regions.forEach(r=>all[r.id]=true);
  return paintingSVG({lv,painted:all,shelf:[],tubes:[]},{}).replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid slice"');}
