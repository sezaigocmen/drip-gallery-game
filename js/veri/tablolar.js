// veri/tablolar.js · A6: her seviyenin gerçek tablosu, C · Guaj stilinde (06-sanat/a2-stil.html, STY.C).
// Alan 312 × 168 (oyundaki tablo). Her tablo: ad, spot (rozet yerleri), ciz(g) → SVG parçaları.
// g yardımcıları (cizim/tablo.js → guajSVG):
//   g.f(d, renk, ek)      sabit kısım (baştan renkli, biraz soluk; ince kahve çizgi)
//   g.r(id, d, boyali)    oyuncunun boyadığı bölge; boyali = bölge boyanınca üstüne gelen ışık/gölge/fırça izi
//   g.on(id)              bölge boyandı mı
//   g.bant(id, cx, cy, w) bantlı bölgenin üstündeki çapraz bant (açan bölge boyanınca söker); her zaman en sonda çağrılır
// Kurallar (A2, A5): her bölge tek oyun rengi · sabit kısımlar soluk · bantlı bölge, onu açan bölgeye komşu (değer).
// Bölge id'leri seviye-listesi.js'ten (b1…b6); her tablonun başındaki yorum hangi id'nin hangi parça olduğunu yazar.

/* Sabit kısımların tonları (STY.C.fix + A6'da eklenenler); oyunun 10 renginden bilerek daha soluk */
export const SABIT={
  tepe:"#9DB59A", tepe2:"#B3C49C", cimen:"#CFD9A8", duvar:"#F2E8D5", kapi:"#7E5A40", cam:"#C6D9E6", baca:"#B0705A",
  yol:"#E6D2AE", agac:"#557F5B", govde:"#6E4E36", bulut:"#FBF7EE",
  ic:"#E9DCC3", ic2:"#DCE2DA", masa:"#C8A47E", masaOn:"#A98560", ortu:"#F4ECDC", yaprak:"#6E9467",
  gok:"#DDE7EA", gece:"#CBCFDD", toprak:"#C9AE8A", tas:"#CFC6B8", seramik:"#E8DFCF", kum:"#E8D9B8", koyu:"#5B4535", dag:"#B7B4C4"
};
export const KAGIT="#FBF6EC", CIZGI="#4A3626";

/* ---------- çizim yardımcıları ---------- */
const C=(x,y,r)=>`M${x-r} ${y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`;
const E=(x,y,rx,ry)=>`M${x-rx} ${y}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
const isik=(d,w=5,o=.45)=>`<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`;
const koyu=(d,o=.16)=>`<path d="${d}" fill="#2A1A10" fill-opacity="${o}"/>`;
const ciz=(d,c=CIZGI,w=1.2,o=.5)=>`<path d="${d}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const leke=(d,c,o=.35)=>`<path d="${d}" fill="${c}" fill-opacity="${o}"/>`;
/* bulut: sol alt köşe (x, y), ölçek s */
const bulut=(x,y,s=1)=>`M${x} ${y}c0 ${-8*s} ${10*s} ${-12*s} ${16*s} ${-8*s}c${4*s} ${-8*s} ${18*s} ${-8*s} ${22*s} 0c${8*s} ${-2*s} ${14*s} ${4*s} ${12*s} ${10*s}c0 ${4*s} ${-4*s} ${6*s} ${-8*s} ${6*s}h${-36*s}c${-4*s} 0 ${-6*s} ${-4*s} ${-6*s} ${-8*s}Z`;
/* çam: taban ortası (x, y), boy h */
const cam=(x,y,h)=>`M${x-h*.32} ${y}L${x} ${y-h}L${x+h*.32} ${y}Z`;
/* taç yapraklı çiçek: n yaprak, iç yarıçap r*.62 */
const cicek=(x,y,r,n=12)=>{let d="";for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+.5)/n*Math.PI*2,c=(i+1)/n*Math.PI*2,ri=r*.62;
  const p=(t,q)=>`${(x+Math.cos(t)*q).toFixed(1)} ${(y+Math.sin(t)*q).toFixed(1)}`;d+=(i?"":`M${p(a,ri)}`)+`Q${p(b-.12,r*1.08)} ${p(b,r)}Q${p(b+.12,r*1.08)} ${p(c,ri)}`;}return d+"Z";};
/* ağaç tacı / çalı: tek parça, tırtıklı kenar (iç içe daire çizgisi yok). Elips üstünde n tümsek, boyları hafif farklı */
const tac=(x,y,rx,ry,n=9)=>{const P=[...Array(n)].map((_,i)=>{const a=-Math.PI/2+i/n*Math.PI*2,k=1+((i*7)%3-1)*.06;return [x+Math.cos(a)*rx*k,y+Math.sin(a)*ry*k];});
  return `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`+P.map((_,i)=>{const [a,b]=P[i],[c,d]=P[(i+1)%n],r=Math.hypot(c-a,d-b)*.62;return `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${c.toFixed(1)} ${d.toFixed(1)}`;}).join("")+"Z";};
/* gelincik: dört yuvarlak taç yaprak */
const gelincik=(x,y,r)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>C(+(x+a*r*.36).toFixed(1),+(y+b*r*.36).toFixed(1),+(r*.6).toFixed(1))).join("");
/* ev cephesi pencereleri vb. tekrar eden sabitler */
const pencere=(x,y,w,h)=>`M${x} ${y}H${x+w}V${y+h}H${x}Z`;
/* natürmort arka planı: duvar (renk), fırça izleri, masa */
const naturmort=(g,duvar=SABIT.ic,masaY=114)=>`${g.f(`M0 0H312V${masaY+2}H0Z`,duvar)}
  <g fill="none" stroke="#fff" stroke-opacity=".28" stroke-linecap="round"><path d="M14 22C70 16 120 20 170 15" stroke-width="7"/><path d="M196 44C236 40 270 42 304 38" stroke-width="6"/><path d="M8 84C40 80 70 82 92 79" stroke-width="5"/><path d="M226 92C252 88 280 90 306 87" stroke-width="5"/></g>
  ${g.f(`M0 ${masaY}C80 ${masaY-2} 230 ${masaY-2} 312 ${masaY}V168H0Z`,SABIT.masa)}
  ${ciz(`M10 ${masaY+16}C40 ${masaY+14} 60 ${masaY+17} 86 ${masaY+15}M226 ${masaY+18}C256 ${masaY+16} 280 ${masaY+19} 304 ${masaY+17}`,"#6E4E36",1.4,.22)}
  ${g.f(`M0 154C90 152 220 152 312 154V168H0Z`,SABIT.masaOn)}`;
/* açık hava: soluk gökyüzü + bulutlar (gökyüzü bölge değilse) */
const sabitGok=(g,c=SABIT.gok,alt=110)=>g.f(`M0 0H312V${alt}H0Z`,c);
const firca=(ps,w=6,o=.2)=>`<g fill="none" stroke="#fff" stroke-opacity="${o}" stroke-linecap="round" stroke-width="${w}">${ps.map(d=>`<path d="${d}"/>`).join("")}</g>`;

export const TABLOLAR={
  /* Sv 1 · Kırmızı elma (1 bölge: R). FTUE: ilk dökme, ilk boyama. Sade natürmort: duvar, masa, örtü, tek elma. */
  1:{ad:"Kırmızı elma", spot:{meyve:[156,90]},
    ciz:g=>`${naturmort(g)}
      ${g.f("M74 124C120 118 196 116 236 120L262 150C200 156 110 156 50 152Z",SABIT.ortu)}
      ${ciz("M98 140C112 136 126 142 140 138M196 146C210 142 222 146 236 142","#B9A88C",1.2,.6)}
      <ellipse cx="162" cy="129" rx="50" ry="7" fill="${CIZGI}" fill-opacity=".2"/>
      ${g.r("meyve","M156 56C146 46 120 44 110 64C100 84 108 112 124 124C134 132 146 132 156 127C166 132 178 132 188 124C204 112 212 84 202 64C192 44 166 46 156 56Z",`
        ${koyu("M190 58C212 78 210 112 186 126C178 130 170 131 162 130C186 118 200 94 190 58Z",.2)}
        ${ciz("M144 58C150 62 162 62 168 58","#5A1A10",3,.3)}
        ${ciz("M120 102C128 116 142 124 160 124","#5A1A10",7,.12)}
        ${isik("M136 72C146 66 158 66 170 70",5,.12)}${isik("M124 80C126 70 132 63 142 60",5,.55)}${isik("M122 92C122 89 122 87 123 85",4,.45)}`)}
      <path d="M156 60C155 48 158 38 164 30" fill="none" stroke="${SABIT.govde}" stroke-width="3.6" stroke-linecap="round"/>
      ${g.f("M161 40C170 26 190 23 199 31C189 43 173 46 161 40Z",SABIT.yaprak)}
      ${ciz("M164 39C174 35 184 33 194 32","#3F5E3C",1,.5)}`},

  /* Sv 2 · Portakal (1 bölge: O). Karışım eğitimi. Mavi-gri duvar, seramik tabak, yapraklı portakal. */
  2:{ad:"Portakal", spot:{meyve:[156,90]},
    ciz:g=>`${naturmort(g,SABIT.ic2)}
      <ellipse cx="160" cy="134" rx="74" ry="9" fill="${CIZGI}" fill-opacity=".16"/>
      ${g.f("M80 124C80 116 232 116 232 124C232 136 196 142 156 142C116 142 80 136 80 124Z",SABIT.seramik)}
      ${ciz("M92 124C120 130 192 130 220 124","#B9A88C",1.4,.7)}
      ${g.r("meyve",C(156,86,40),`
        ${koyu("M186 58C206 80 202 112 176 124C166 128 154 128 146 126C176 118 194 92 186 58Z",.18)}
        <g fill="#8A3E0C" fill-opacity=".22">${[[140,70],[150,98],[170,84],[134,100],[176,106],[160,112],[124,84],[184,74]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6"/>`).join("")}</g>
        ${isik("M128 74C130 64 138 56 148 52",5,.55)}${isik("M124 88C124 85 124 83 125 81",4,.4)}${isik("M140 108C152 116 168 116 180 110",6,.1)}`)}
      ${g.f("M156 48C158 40 162 34 168 30L171 33C166 37 162 42 160 48Z",SABIT.govde)}
      ${g.f("M164 36C176 22 198 22 206 30C196 42 178 44 164 36Z",SABIT.yaprak)}
      ${g.f("M160 38C148 26 128 28 122 36C132 46 150 46 160 38Z",SABIT.agac)}
      ${ciz("M168 35C180 31 192 29 202 30M157 37C146 34 136 34 126 36","#3F5E3C",1,.5)}`},

  /* Sv 3 · Üzüm salkımı — b1 G yaprak, b2 P üzüm. İlk iki karışım (yeşil, mor). */
  3:{ad:"Üzüm salkımı", spot:{b1:[232,58], b2:[155,90]},
    ciz:g=>`${naturmort(g,SABIT.ic,120)}
      <ellipse cx="158" cy="136" rx="58" ry="7" fill="${CIZGI}" fill-opacity=".18"/>
      ${ciz("M158 56C160 46 166 38 174 32","#6E4E36",3.6,1)}
      ${ciz("M176 34C184 30 186 22 182 16C178 22 182 28 186 30",SABIT.agac,1.6,.8)}
      ${g.r("b1","M198 52C204 34 228 26 248 30C262 26 274 36 270 48C280 56 276 72 262 76C252 86 230 86 218 76C204 74 194 64 198 52Z",`
        ${ciz("M200 56C220 54 240 52 266 50M226 54C230 44 238 36 246 32M232 54C240 62 248 70 258 74",
          "#1F4A1C",1.3,.4)}${koyu("M262 76C252 86 230 86 218 76C236 80 252 78 266 68Z",.16)}${isik("M212 44C220 36 230 32 240 32",4,.35)}`)}
      ${g.r("b2",[[122,66],[144,64],[166,64],[188,68],[133,86],[155,86],[177,88],[144,106],[166,106],[155,124]].map(([x,y])=>C(x,y,12)).join(""),`
        ${[[122,66],[144,64],[166,64],[188,68],[133,86],[155,86],[177,88],[144,106],[166,106],[155,124]].map(([x,y])=>isik(`M${x-6} ${y-3}C${x-5} ${y-6} ${x-3} ${y-8} ${x} ${y-8}`,3,.55)).join("")}
        ${koyu("M178 96C190 100 186 114 172 118C178 110 180 104 178 96Z",.18)}`)}`},

  /* Sv 4 · Vazoda gelincik — b1 G yapraklar, b2 R çiçekler, b3 B vazo. Geri Al tanıtımı. */
  4:{ad:"Vazoda gelincik", spot:{b1:[124,79], b2:[156,30], b3:[156,128]},
    ciz:g=>`${naturmort(g,SABIT.ic2,140)}
      <ellipse cx="158" cy="150" rx="46" ry="5" fill="${CIZGI}" fill-opacity=".2"/>
      ${ciz("M154 94L112 50M156 94L156 34M158 94L202 52",SABIT.agac,3,.9)}
      ${g.r("b1","M150 84C132 66 112 66 98 76C114 92 136 92 150 84ZM162 82C180 64 202 64 214 74C198 90 176 90 162 82Z",`
        ${ciz("M104 77C120 78 136 80 148 84M208 75C192 76 176 78 164 82","#1F4A1C",1.2,.4)}${isik("M110 72C120 68 130 68 138 70",3,.35)}`)}
      ${g.r("b2",[[112,46,17],[156,30,18],[202,48,17]].map(([x,y,r])=>gelincik(x,y,r)).join(""),`
        ${[[112,46],[156,30],[202,48]].map(([x,y])=>isik(`M${x-11} ${y-4}C${x-9} ${y-10} ${x-4} ${y-13} ${x+2} ${y-13}`,3,.45)).join("")}`)}
      <g fill="#3A2A22" fill-opacity=".8"><circle cx="112" cy="46" r="4"/><circle cx="156" cy="30" r="4"/><circle cx="202" cy="48" r="4"/></g>
      ${g.r("b3","M144 92H168C168 100 164 104 176 110C196 118 196 140 178 150H134C116 140 116 118 136 110C148 104 144 100 144 92Z",`
        ${koyu("M178 112C194 122 192 142 176 150H164C180 140 184 124 178 112Z",.2)}${isik("M134 120C130 128 132 138 138 144",5,.45)}
        ${ciz("M126 126C146 132 166 132 186 126","#fff",2,.35)}`)}`},

  /* Sv 5 · Güneşli tepe — b1 B gökyüzü, b2 G tepe, b3 Y güneş. Nefes seviyesi. */
  5:{ad:"Güneşli tepe", spot:{b1:[86,40], b2:[100,134], b3:[240,40]},
    ciz:g=>`${g.r("b1","M0 0H312V104H0Z",firca(["M10 18C60 12 110 16 150 12","M120 60C170 54 220 58 300 52","M20 80C70 74 100 78 140 74"],7,.22))}
      ${g.r("b3",C(240,40,22),isik("M226 32A15 15 0 0 1 240 24",4,.5))}
      ${g.f(bulut(130,32,1.1),SABIT.bulut)}${g.f(bulut(30,72,.8),SABIT.bulut)}
      ${g.f("M180 100C210 80 260 76 312 84V112H180Z",SABIT.tepe)}
      ${g.r("b2","M0 104C60 70 140 66 200 88C240 102 280 98 312 92V168H0Z",`${koyu("M0 140C80 132 200 136 312 128V168H0Z",.1)}${firca(["M20 96C60 84 100 80 140 84","M180 108C220 104 260 104 300 100"],5,.2)}`)}
      ${g.f("M196 96H226V116H196Z",SABIT.duvar)}${g.f("M192 98L211 82L230 98Z",SABIT.baca)}${g.f(pencere(205,104,8,8),SABIT.cam)}
      ${g.f("M206 116C200 136 180 152 160 168H186C196 150 212 134 216 116Z",SABIT.yol)}
      ${g.f(cam(270,112,30),SABIT.agac)}${g.f(cam(290,116,24),SABIT.agac)}
      <g fill="#fff" fill-opacity=".7">${[[30,140],[52,150],[80,128],[250,140],[280,150],[120,150]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4"/>`).join("")}</g>`},

  /* Sv 6 · Mor dağlar — b1 R gelincikler, b2 G çayır, b3 P dağlar. */
  6:{ad:"Mor dağlar", spot:{b1:[204,138], b2:[96,114], b3:[150,70]},
    ciz:g=>`${sabitGok(g,SABIT.gok,104)}${g.f(bulut(40,40,1),SABIT.bulut)}${g.f(bulut(214,26,.8),SABIT.bulut)}
      ${g.r("b3","M0 96L54 42L96 78L148 30L210 86L250 56L312 92V110H0Z",`${koyu("M148 30L180 58L176 100H148Z",.14)}${koyu("M54 42L72 60L70 100H54Z",.12)}`)}
      ${g.f("M138 40L148 30L160 41L152 38L146 44Z",SABIT.bulut)}${g.f("M46 50L54 42L62 50L56 48Z",SABIT.bulut)}
      ${g.r("b2","M0 102C80 92 200 96 312 100V168H0Z",firca(["M10 120C60 114 110 116 160 112","M170 150C220 146 260 148 300 144"],6,.18))}
      ${g.r("b1",[[40,134,10],[76,152,11],[124,138,10],[204,138,14],[252,124,9],[282,152,11],[160,156,10],[16,154,8]].map(([x,y,r])=>gelincik(x,y,r)).join(""),
        [[40,134],[76,152],[124,138],[204,138],[252,124],[282,152],[160,156]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2" fill="#3A2A22" fill-opacity=".7"/>`).join(""))}`},

  /* Sv 7 · Yelkenli — b1 B deniz, b2 P tekne, b3 G ada, b4 Y yelken. Ekstra Tüp tanıtımı. */
  7:{ad:"Yelkenli", spot:{b1:[240,146], b2:[124,127], b3:[250,92], b4:[134,94]},
    ciz:g=>`${sabitGok(g,SABIT.gok,104)}${g.f(bulut(30,40,1),SABIT.bulut)}${g.f(bulut(196,28,.9),SABIT.bulut)}
      ${g.r("b3","M196 104C210 80 250 74 282 86C296 92 306 98 312 100V108H196Z",`${koyu("M250 76C276 80 296 92 312 100V108H262Z",.14)}`)}
      ${g.f("M262 84C262 72 264 64 268 58",SABIT.govde,`fill="none" stroke-width="2.4"`)}${g.f("M268 58C258 52 248 56 244 62C254 60 262 60 268 58ZM268 58C276 50 288 52 292 58C282 58 274 58 268 58Z",SABIT.agac)}
      ${g.r("b1","M0 100C80 96 220 98 312 100V168H0Z",`${ciz("M30 124q8-4 16 0M200 132q8-4 16 0M260 118q6-3 12 0M60 152q8-4 16 0M240 156q8-4 16 0","#fff",2.4,.6)}${koyu("M0 148C100 144 220 146 312 142V168H0Z",.12)}`)}
      ${ciz("M116 120V40","#6E4E36",2.4,1)}
      ${g.r("b4","M119 112V44L166 112ZM113 112V54L82 108Z",`${koyu("M140 76L166 112H140Z",.12)}${isik("M124 60C130 74 136 86 142 100",4,.45)}`)}
      ${g.f("M114 40L124 44L114 48Z",SABIT.baca)}
      ${g.r("b2","M66 112H174L160 136H82Z",`${koyu("M74 126H168L160 136H82Z",.2)}${isik("M80 116H160",3,.4)}`)}
      ${leke("M70 138C100 142 140 142 170 138",CIZGI,0)}${ciz("M72 140C100 144 140 144 168 140","#fff",2,.5)}`},

  /* Sv 8 · Sarı ev — b1 Y duvar, b2 B çatı, b3 G çalılar, b4 P kapı. */
  8:{ad:"Sarı ev", spot:{b1:[156,90], b2:[156,64], b3:[84,144], b4:[156,132]},
    ciz:g=>`${sabitGok(g,SABIT.gok,120)}${g.f(bulut(20,30,1),SABIT.bulut)}${g.f(bulut(240,22,.9),SABIT.bulut)}
      ${g.f("M0 118C80 112 230 112 312 118V168H0Z",SABIT.cimen)}
      ${g.f(cam(30,124,48),SABIT.agac)}${g.f(cam(282,122,52),SABIT.agac)}
      ${g.f("M184 40H198V62H184Z",SABIT.baca)}
      ${g.r("b1","M100 76H212V148H100Z",`${koyu("M190 76H212V148H190Z",.12)}${firca(["M108 84H150","M110 140H180"],5,.25)}`)}
      ${g.f(pencere(112,90,24,22),SABIT.cam)}${g.f(pencere(176,90,24,22),SABIT.cam)}${ciz("M124 90V112M112 101H136M188 90V112M176 101H200","#fff",1.6,.8)}
      ${g.r("b2","M86 80L156 32L226 80Z",`${koyu("M156 32L226 80H156Z",.16)}${ciz("M120 66L156 42M110 76L156 50","#fff",2.4,.3)}`)}
      ${g.r("b4","M144 148V114A12 12 0 0 1 168 114V148Z",`<circle cx="164" cy="132" r="1.8" fill="#F2E8D5"/>`)}
      ${g.f("M146 148C140 156 136 162 132 168H180C176 162 172 156 166 148Z",SABIT.yol)}
      ${g.r("b3",tac(86,146,24,13,7)+tac(226,146,24,13,7),firca(["M76 136C82 132 90 132 96 134","M216 136C222 132 230 132 236 134"],3,.4))}`},

  /* Sv 9 · Meyve tabağı (zirve) — b1 G armut, b2 P erik, b3 R elma, b4 O portakal. */
  9:{ad:"Meyve tabağı", spot:{b1:[164,74], b2:[161,112], b3:[118,96], b4:[208,98]},
    ciz:g=>`${naturmort(g,SABIT.ic,124)}
      <ellipse cx="158" cy="150" rx="80" ry="7" fill="${CIZGI}" fill-opacity=".18"/>
      ${ciz("M162 46C162 38 164 32 168 28","#6E4E36",3,1)}
      ${g.r("b1","M162 44C170 44 172 58 174 66C186 80 190 104 176 114C166 120 150 120 142 112C130 100 140 78 150 66C152 58 154 44 162 44Z",`${koyu("M174 66C188 82 188 106 172 116C178 100 180 82 174 66Z",.18)}${isik("M150 76C148 84 146 92 146 100",4,.45)}`)}
      ${g.r("b3","M118 78C110 70 92 72 88 88C84 104 94 118 108 120C114 121 118 119 120 118C122 119 126 121 132 120C146 118 154 104 150 88C146 72 126 70 118 78Z",`${koyu("M144 82C154 96 148 114 132 120C140 108 144 96 144 82Z",.18)}${isik("M96 88C98 82 102 78 108 76",4,.55)}`)}
      ${ciz("M118 78C118 72 120 68 122 64","#6E4E36",2.4,1)}
      ${g.r("b4",C(208,100,24),`${koyu("M224 82C236 98 230 118 212 124C222 112 226 98 224 82Z",.18)}${isik("M194 92C196 86 200 82 206 80",4,.55)}`)}
      ${g.r("b2",E(148,114,13,10)+E(174,116,13,10),`${isik("M140 110C142 107 145 106 148 106",3,.55)}${isik("M166 112C168 109 171 108 174 108",3,.55)}`)}
      ${g.f("M80 120H236C232 142 204 154 158 154C112 154 84 142 80 120Z",SABIT.seramik)}
      ${g.f("M80 120C80 114 236 114 236 120C236 126 80 126 80 120Z",SABIT.duvar)}
      ${ciz("M96 134C130 140 186 140 220 134","#B0705A",2,.5)}`},

  /* Sv 10 · Gün batımında köy (ZOR) — b1 O gökyüzü, b2 P tepeler, b3 Y güneş, b4 R çatılar, b5 G ağaçlar. */
  10:{ad:"Gün batımında köy", spot:{b1:[62,34], b2:[194,88], b3:[156,64], b4:[153,111], b5:[206,118]},
    ciz:g=>`${g.r("b1","M0 0H312V100H0Z",firca(["M10 20C60 14 110 18 150 14","M170 30C220 24 260 28 304 24","M20 60C70 54 100 58 140 54"],7,.2))}
      ${g.r("b3",C(156,80,26),isik("M140 70A18 18 0 0 1 156 60",4,.5))}
      ${g.f(bulut(220,58,.9),SABIT.bulut,`fill-opacity=".8"`)}
      ${g.r("b2","M0 84C40 70 90 72 130 86C170 74 220 66 260 78C280 82 300 80 312 78V122H0Z",koyu("M0 106C80 100 200 102 312 98V122H0Z",.12))}
      ${g.f("M0 118C80 110 230 110 312 116V168H0Z",SABIT.cimen)}
      ${g.f(pencere(44,120,34,28),SABIT.duvar)}${g.f(pencere(134,120,38,28),SABIT.duvar)}${g.f(pencere(232,122,32,26),SABIT.duvar)}
      ${g.f(pencere(54,128,8,8),SABIT.cam)}${g.f(pencere(146,128,8,8),SABIT.cam)}${g.f(pencere(156,132,10,16),SABIT.kapi)}${g.f(pencere(242,128,8,8),SABIT.cam)}
      ${g.r("b4","M38 122L61 100L84 122ZM128 122L153 98L178 122ZM226 124L248 102L270 124Z",`${koyu("M61 100L84 122H61ZM153 98L178 122H153ZM248 102L270 124H248Z",.16)}`)}
      ${ciz("M104 148V128M206 148V128M290 150V132","#6E4E36",4,1)}
      ${g.r("b5",tac(104,120,15,13,7)+tac(206,118,16,14,7)+tac(290,122,13,12,6),firca(["M96 112C100 108 106 108 110 110","M198 110C202 106 208 106 212 108","M284 114C288 110 292 110 296 112"],3,.35))}
      ${g.f("M150 148C146 156 140 162 136 168H168C166 160 164 154 162 148Z",SABIT.yol)}`},

  /* Sv 11 · Göl evi — gok B, gol B, gunes O, cati R (bantlı; güneş boyanınca söker — güneş çatının arkasında, çatıya değiyor). Bant tanıtımı. */
  11:{ad:"Göl evi", spot:{gok:[176,62], gol:[234,140], gunes:[96,32], cati:[81,78]},
    ciz:g=>`${g.r("gok","M0 0H312V106H0Z",firca(["M10 18C60 12 110 16 150 12","M120 60C170 54 220 58 300 52","M20 76C70 70 100 74 140 70"],7,.22))}
      ${g.r("gunes",C(96,38,18),isik("M84 30A12 12 0 0 1 96 24",4,.5))}
      ${g.f("M168 44C168 36 178 32 184 36C188 28 202 28 206 36C214 34 220 40 218 46C218 50 214 52 210 52H174C170 52 168 48 168 44Z",SABIT.bulut)}
      ${g.f("M240 24C240 18 248 15 253 18C256 12 266 12 269 18C275 17 279 21 278 26C278 29 275 31 272 31H244C241 31 240 28 240 24Z",SABIT.bulut)}
      ${g.f("M0 92C38 74 82 78 118 90C160 70 218 72 258 86C282 80 300 81 312 84V112H0Z",SABIT.tepe)}
      ${g.f("M0 100C50 88 96 92 140 100C190 90 240 92 312 98V112H0Z",SABIT.tepe2)}
      ${g.f("M0 102C60 95 140 97 200 101C250 99 290 99 312 101V168H0Z",SABIT.cimen)}
      ${g.f("M78 132C82 144 104 152 126 162L116 168H92C82 156 74 144 72 132Z",SABIT.yol)}
      ${g.r("gol","M138 134C148 114 228 106 290 112C308 115 312 119 312 123V152C288 161 222 165 172 156C148 151 131 145 138 134Z",firca(["M170 128C190 124 210 126 228 124","M226 142C246 138 270 140 292 136"],3,.4))}
      ${ciz("M146 136v-12M150 138v-16M154 137v-10M300 150v-10M304 151v-14",SABIT.agac,1.4,.8)}
      ${g.f("M16 116H22V126H16Z",SABIT.govde)}${g.f("M4 116L19 66L34 116Z",SABIT.agac)}${g.f("M138 112H144V120H138Z",SABIT.govde)}${g.f("M130 112L141 80L152 112Z",SABIT.agac)}
      ${g.f("M50 60H61V80H50Z",SABIT.baca)}${g.f("M48 84H114V132H48Z",SABIT.duvar)}
      ${g.f("M54 96H68V110H54Z",SABIT.cam)}${g.f("M95 96H108V109H95Z",SABIT.cam)}${g.f("M73 132V112A8 8 0 0 1 89 112V132Z",SABIT.kapi)}
      ${g.r("cati","M36 90L81 50L126 90Z",ciz("M56 82L84 58M70 86L94 64M92 86L106 74","#000",2,.12))}
      ${g.bant("cati",81,76,84)}`},

  /* Sv 12 · Ayçiçekleri — b1 B gökyüzü (bantlı ← b3 ayçiçekleri; başlar gökyüzüne uzanıyor), b2 P uzak tepeler, b3 Y ayçiçekleri, b4 G tarla. */
  12:{ad:"Ayçiçekleri", spot:{b1:[166,22], b2:[236,84], b3:[120,52], b4:[64,152]},
    ciz:g=>`${g.r("b1","M0 0H312V98H0Z",firca(["M10 16C60 10 110 14 150 10","M180 34C230 28 270 32 306 28"],7,.22))}
      ${g.r("b2","M0 84C60 64 120 70 170 82C220 66 270 64 312 78V104H0Z",koyu("M170 82C220 66 270 64 312 78V104H200Z",.1))}
      ${g.r("b4","M0 98C100 92 210 94 312 98V168H0Z",firca(["M10 116C60 110 110 112 160 108","M170 156C220 152 260 154 300 150"],5,.2))}
      ${ciz("M60 100V84M120 100V68M196 100V76M262 100V64","#3F5E3C",3.4,.9)}
      ${ciz("M120 86C110 80 104 82 100 88M196 90C206 84 212 86 216 92","#3F5E3C",2.4,.8)}
      ${g.r("b3",[[60,72,16],[120,52,19],[196,62,16],[262,48,17],[30,128,10],[100,140,11],[160,124,10],[230,140,11],[290,126,10]].map(([x,y,r])=>cicek(x,y,r,14)).join(""),
        [[60,72],[120,52],[196,62],[262,48]].map(([x,y])=>isik(`M${x-10} ${y-8}C${x-6} ${y-12} ${x-2} ${y-13} ${x+3} ${y-13}`,3,.4)).join(""))}
      <g fill="${SABIT.govde}" fill-opacity=".9">${[[60,72,6],[120,52,7],[196,62,6],[262,48,6],[30,128,4],[100,140,4],[160,124,4],[230,140,4],[290,126,4]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
      ${g.bant("b1",168,20,90)}`},

  /* Sv 13 · Lavanta tarlası — b1 G tepe (bantlı ← b2 lavanta; tepe tarlanın hemen arkasında), b2 P lavanta sıraları, b3 R çiftlik çatısı, b4 B gökyüzü. */
  13:{ad:"Lavanta tarlası", spot:{b1:[178,84], b2:[156,148], b3:[66,62], b4:[170,30]},
    ciz:g=>{const sira=[0,1,2,3,4,5,6].map(i=>{const cb=-60+i*72, ch=156+(cb-156)*.35;return `M${ch-7} 98H${ch+7}L${cb+26} 168H${cb-26}Z`;}).join("");
      return `${g.r("b4","M0 0H312V92H0Z",firca(["M10 16C60 10 110 14 150 10","M200 40C240 34 270 38 306 34"],7,.22))}
      ${g.f(bulut(230,30,.9),SABIT.bulut)}
      ${g.r("b1","M0 80C70 60 150 62 220 78C260 70 290 70 312 74V100H0Z",koyu("M220 78C260 70 290 70 312 74V100H240Z",.12))}
      ${g.f("M40 70H92V90H40Z",SABIT.duvar)}${g.f(pencere(50,76,8,8),SABIT.cam)}${g.f(pencere(72,78,8,12),SABIT.kapi)}
      ${g.r("b3","M32 72L66 48L100 72Z",koyu("M66 48L100 72H66Z",.16))}
      ${g.f("M262 46H272V80H262Z",SABIT.duvar)}${ciz("M267 46L250 30M267 46L284 30M267 46L250 62M267 46L284 62","#6E4E36",2.4,.9)}
      ${g.f("M0 96C100 94 210 94 312 96V168H0Z",SABIT.toprak)}
      ${g.r("b2",sira,ciz("M-40 160L140 100M60 166L150 100","#fff",2,.0))}
      ${g.bant("b1",178,84,90)}`;}},

  /* Sv 14 · Liman (zirve) — b1 P akşam göğü, b2 O tekne (bantlı ← b5 deniz), b3 G tepe (bantlı ← b4 deniz feneri), b4 R deniz feneri, b5 B deniz. */
  14:{ad:"Liman", spot:{b1:[110,40], b2:[105,133], b3:[218,92], b4:[257,52], b5:[200,148]},
    ciz:g=>`${g.r("b1","M0 0H312V100H0Z",firca(["M10 18C60 12 110 16 150 12","M120 70C170 64 220 68 300 62"],7,.2))}
      ${g.f(C(40,30,11),SABIT.bulut)}${g.f(bulut(150,56,.8),SABIT.bulut,`fill-opacity=".8"`)}
      ${g.r("b5","M0 98H312V168H0Z",`${ciz("M30 116q8-4 16 0M170 124q8-4 16 0M240 160q8-4 16 0M40 156q8-4 16 0","#fff",2.4,.6)}${koyu("M0 146H312V168H0Z",.12)}`)}
      ${g.r("b3","M196 100C206 74 240 62 276 66C296 68 308 78 312 84V104C270 108 230 106 196 100Z",koyu("M276 66C296 68 308 78 312 84V104H280Z",.14))}
      ${g.r("b4","M244 70L250 24H264L270 70Z",`${koyu("M257 24H264L270 70H257Z",.16)}`)}
      ${g.f("M245 46H269V52H245ZM247 34H267V40H247Z",SABIT.bulut)}
      ${g.f("M248 14H266V24H248Z",SABIT.cam)}${g.f("M246 14L257 6L268 14Z",SABIT.kapi)}
      ${ciz("M110 126V74","#6E4E36",2,1)}${g.f("M112 120V78L140 120Z",SABIT.bulut)}
      ${g.r("b2","M60 124H152L140 142H72Z",`${koyu("M66 134H146L140 142H72Z",.2)}${isik("M74 128H136",3,.4)}`)}
      ${g.bant("b2",106,133,96)}${g.bant("b3",222,90,74)}`},

  /* Sv 15 · Sıcak hava balonları (nefes) — b1 P gökyüzü (bantlı ← b4 turuncu balon), b2 Y balon, b3 R balon, b4 O büyük balon. Terebentin tanıtımı. */
  15:{ad:"Sıcak hava balonları", spot:{b1:[60,28], b2:[66,78], b3:[250,46], b4:[156,58]},
    ciz:g=>{const balon=(x,y,r)=>`M${x-r} ${y}a${r} ${r} 0 1 1 ${2*r} 0C${x+r} ${y+r*.6} ${x+r*.42} ${y+r*1.05} ${x+r*.24} ${y+r*1.3}H${x-r*.24}C${x-r*.42} ${y+r*1.05} ${x-r} ${y+r*.6} ${x-r} ${y}Z`;
      const sepet=(x,y,r)=>`${ciz(`M${x-r*.24} ${y+r*1.3}L${x-r*.2} ${y+r*1.55}M${x+r*.24} ${y+r*1.3}L${x+r*.2} ${y+r*1.55}`,"#6E4E36",1.2,.8)}${g.f(`M${x-r*.24} ${y+r*1.55}H${x+r*.24}V${y+r*1.8}H${x-r*.24}Z`,SABIT.masaOn)}`;
      const serit=(x,y,r)=>ciz(`M${x} ${y-r}V${y+r*1.3}M${x-r*.55} ${y-r*.82}C${x-r*.7} ${y} ${x-r*.4} ${y+r} ${x-r*.24} ${y+r*1.3}M${x+r*.55} ${y-r*.82}C${x+r*.7} ${y} ${x+r*.4} ${y+r} ${x+r*.24} ${y+r*1.3}`,CIZGI,1.1,.45);
      return `${g.r("b1","M0 0H312V136H0Z",firca(["M10 18C60 12 110 16 150 12","M170 100C220 94 260 98 304 94","M20 110C70 104 100 108 140 104"],7,.2))}
      ${g.f(bulut(196,104,1),SABIT.bulut,`fill-opacity=".85"`)}${g.f(bulut(10,58,.7),SABIT.bulut,`fill-opacity=".85"`)}
      ${g.f("M0 128C60 116 120 118 170 128C220 118 270 116 312 124V168H0Z",SABIT.tepe)}${g.f("M0 146C100 138 220 140 312 146V168H0Z",SABIT.cimen)}
      ${g.r("b4",balon(156,58,34),isik("M134 46C136 36 142 30 150 26",5,.45))}${serit(156,58,34)}${sepet(156,58,34)}
      ${g.r("b2",balon(66,80,22),isik("M52 74C54 68 58 64 62 62",4,.45))}${serit(66,80,22)}${sepet(66,80,22)}
      ${g.r("b3",balon(250,46,24),isik("M234 40C236 34 240 30 246 28",4,.45))}${serit(250,46,24)}${sepet(250,46,24)}
      ${g.bant("b1",60,28,90)}`;}},

  /* Sv 16 · Sirk çadırı (yeni: dolu raf) — b1 Y çadır gövdesi (bantlı ← b4 kırmızı çatı), b2 O bayrak (bantlı ← b3 gökyüzü), b3 P akşam göğü, b4 R çatı. */
  16:{ad:"Sirk çadırı", spot:{b1:[104,128], b2:[176,19], b3:[56,40], b4:[156,76]},
    ciz:g=>`${g.r("b3","M0 0H312V122H0Z",firca(["M10 18C60 12 110 16 150 12","M200 50C240 44 270 48 306 44"],7,.2))}
      <g fill="#fff" fill-opacity=".7">${[[30,70],[260,24],[290,80],[90,20],[230,96]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8"/>`).join("")}</g>
      ${g.f("M0 118C100 112 220 112 312 118V168H0Z",SABIT.cimen)}
      ${ciz("M156 36V6","#6E4E36",2.4,1)}
      ${g.r("b2","M158 6L202 18L158 32Z",isik("M164 12L184 17",2.4,.45))}
      ${g.r("b1","M76 96H236V150H76Z",`${koyu("M210 96H236V150H210Z",.12)}`)}
      ${ciz("M108 96V150M204 96V150","#B0705A",2,.5)}
      ${g.f("M140 150L156 112L172 150Z",SABIT.koyu)}
      ${g.r("b4","M64 98L156 34L248 98Q156 110 64 98Z",`${koyu("M156 34L248 98Q210 104 156 104Z",.15)}${isik("M120 66L150 44",3,.4)}`)}
      ${ciz("M64 98Q90 108 110 102Q132 112 156 104Q180 112 202 102Q222 108 248 98","#F2E8D5",2,.8)}
      ${ciz("M10 40Q40 52 70 40Q100 52 130 40","#F2E8D5",1.4,.6)}
      ${g.bant("b1",156,124,150)}${g.bant("b2",178,19,48)}`},

  /* Sv 17 · Göl kıyısı — b1 R kulübe, b2 O kayık (bantlı ← b3 göl), b3 B göl, b4 P dağlar, b5 G orman (bantlı ← b4 dağlar). */
  17:{ad:"Göl kıyısı", spot:{b1:[46,132], b2:[229,139], b3:[170,156], b4:[170,50], b5:[244,94]},
    ciz:g=>`${sabitGok(g,SABIT.gok,100)}${g.f(bulut(30,30,.9),SABIT.bulut)}${g.f(bulut(250,20,.8),SABIT.bulut)}
      ${g.r("b4","M0 86L60 34L110 70L170 22L236 74L276 46L312 70V104H0Z",`${koyu("M170 22L200 48L196 104H170Z",.14)}${koyu("M60 34L80 52L78 104H60Z",.12)}`)}
      ${g.f("M160 30L170 22L182 32L174 30L168 36Z",SABIT.bulut)}
      ${g.r("b5","M0 96H312V108H0Z"+[10,30,50,70,90,110,200,220,240,260,280,300].map((x,i)=>cam(x,100,26+(i%3)*6)).join(""),firca(["M20 102H120","M200 102H300"],2,.25))}
      ${g.f("M0 106H130C116 120 104 140 96 168H0Z",SABIT.cimen)}
      ${g.r("b3","M100 112C140 104 260 104 312 108V168H96C92 148 92 128 100 112Z",`${ciz("M150 126q8-4 16 0M270 120q6-3 12 0M180 160q8-4 16 0","#fff",2.4,.55)}${koyu("M100 150H312V168H96Z",.12)}`)}
      ${g.r("b1","M24 112H80V148H24Z",koyu("M64 112H80V148H64Z",.15))}
      ${g.f("M18 114L52 92L86 114Z",SABIT.kapi)}${g.f(pencere(62,122,10,10),SABIT.cam)}${g.f(pencere(30,128,10,20),SABIT.kapi)}
      ${g.r("b2","M196 132H262L252 146H206Z",isik("M206 135H248",2.4,.45))}
      ${g.bant("b5",244,94,90)}${g.bant("b2",229,139,64)}`},

  /* Sv 18 · Pencere önünde kedi — b1 G bitki, b2 O kedi, b3 R saksı, b4 P perdeler (bantlı ← kedi; kedi sağ perdeye yaslanıyor), b5 B pencere/gök (bantlı ← kedi). */
  18:{ad:"Pencere önünde kedi", spot:{b1:[132,60], b2:[202,84], b3:[120,94], b4:[72,58], b5:[160,30]},
    ciz:g=>`${g.f("M0 0H312V168H0Z",SABIT.ic)}
      ${g.f("M80 12H232V106H80Z",SABIT.duvar)}
      ${g.r("b5","M90 20H222V102H90Z",firca(["M96 40C130 34 160 38 200 34","M100 80C140 74 170 78 214 74"],6,.25))}
      ${g.f(bulut(110,60,.8),SABIT.bulut,`fill-opacity=".85"`)}
      ${ciz("M156 20V102M90 60H222","#F2E8D5",4,1)}
      ${g.r("b4","M54 6H98C92 40 102 72 86 116H54ZM214 6H258V116H232C214 76 222 40 214 6Z",`${ciz("M64 10C66 40 64 80 62 112M76 10C78 40 76 80 74 112M244 10C246 40 244 80 246 112","#2A1A10",1.6,.15)}`)}
      ${g.f("M66 104H246V116H66Z",SABIT.masa)}
      ${g.r("b3","M102 104L106 84H134L138 104Z",koyu("M126 84H134L138 104H128Z",.18))}
      ${g.r("b1","M120 84C104 72 98 54 104 42C114 54 120 68 120 84ZM120 84C124 64 134 48 148 42C146 60 136 74 120 84ZM120 84C112 72 100 68 88 70C96 80 108 84 120 84Z",ciz("M118 80C112 68 108 56 106 48M122 80C128 68 136 56 144 48","#1F4A1C",1,.4))}
      ${g.r("b2","M176 106C170 86 176 66 190 60L186 44L198 54C202 52 208 52 212 54L222 44L220 60C232 70 234 92 226 106ZM226 104C244 104 250 92 244 84C240 92 236 98 224 98Z",`${koyu("M216 66C230 76 232 94 226 106H212C222 94 222 80 216 66Z",.15)}${ciz("M184 78l8 2M184 84l8 0M220 78l-8 2M220 84l-8 0","#8A3E0C",1.2,.5)}`)}
      <g fill="${SABIT.koyu}"><circle cx="198" cy="66" r="2"/><circle cx="210" cy="66" r="2"/></g>
      ${g.bant("b4",72,58,44)}${g.bant("b5",136,56,110)}`},

  /* Sv 19 · Sonbahar gölü (zirve) — b1 O sağ ağaç, b2 P göğü (bantlı ← b4 sol ağaç), b3 G çayır (bantlı ← b5 göl), b4 O sol ağaç, b5 B göl. */
  19:{ad:"Sonbahar gölü", spot:{b1:[252,60], b2:[160,30], b3:[24,152], b4:[70,54], b5:[160,134]},
    ciz:g=>`${g.r("b2","M0 0H312V100H0Z",firca(["M10 18C60 12 110 16 150 12","M120 60C170 54 220 58 300 52"],7,.2))}
      ${g.f("M0 92C60 76 130 80 180 90C230 78 280 80 312 86V104H0Z",SABIT.dag)}
      ${g.r("b3","M0 98C100 92 220 94 312 98V168H0Z",firca(["M10 116C40 112 60 114 80 112","M260 150C280 148 296 148 308 146"],5,.2))}
      ${g.r("b5","M40 122C70 106 240 106 280 120C300 128 280 150 230 154C160 160 70 156 46 144C34 136 34 128 40 122Z",`${ciz("M90 126C110 122 130 124 150 122M180 140C200 136 224 138 244 134","#fff",3,.4)}${leke("M60 124C66 132 80 136 96 134",CIZGI,0)}`)}
      ${ciz("M70 100V68M252 104V76","#6E4E36",5,1)}
      ${g.r("b4",tac(70,58,40,28,10),`${koyu("M88 40C104 56 104 76 90 82C96 70 96 54 88 40Z",.16)}${firca(["M52 46C58 38 66 34 74 34"],4,.35)}`)}
      ${g.r("b1",tac(252,62,32,24,9),`${koyu("M268 46C282 60 282 78 270 84C274 72 274 58 268 46Z",.16)}${firca(["M236 52C242 44 248 40 256 40"],4,.35)}`)}
      <g fill="#D9472F" fill-opacity=".5">${[[110,90],[120,100],[220,96],[200,88],[34,96]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.6"/>`).join("")}</g>
      ${g.bant("b2",160,30,110)}${g.bant("b3",38,152,64)}`},

  /* Sv 20 · Kale (ZOR) — b1 G tepe, b2 Y ay, b3 O akşam göğü, b4 P dağlar (bantlı ← b6 kale), b5 R kule çatıları (bantlı ← b6 kale), b6 P kale. */
  20:{ad:"Akşam kalesi", spot:{b1:[64,144], b2:[56,34], b3:[256,24], b4:[44,84], b5:[156,30], b6:[156,86]},
    ciz:g=>`${g.r("b3","M0 0H312V104H0Z",firca(["M90 16C140 10 190 14 240 10","M180 40C230 34 270 38 306 34"],7,.2))}
      ${g.r("b2",C(56,34,16),isik("M46 28A10 10 0 0 1 56 22",3,.5))}
      ${g.r("b4","M0 96L44 60L84 84L126 52L170 86L214 54L262 82L312 60V108H0Z",`${koyu("M44 60L60 74L58 108H44Z",.12)}${koyu("M214 54L236 68L234 108H214Z",.12)}`)}
      ${g.r("b6","M110 70H202V124H110ZM96 50H122V124H96ZM190 50H216V124H190ZM140 40H172V70H140Z",`${ciz("M110 84H202M110 100H202M96 66H122M190 66H216","#2A1A10",1.2,.18)}${koyu("M202 70H216V124H202Z",.14)}`)}
      ${g.f("M146 124V104A10 10 0 0 1 166 104V124Z",SABIT.koyu)}
      ${g.f(pencere(105,64,8,12),SABIT.koyu)}${g.f(pencere(199,64,8,12),SABIT.koyu)}${g.f(pencere(151,50,10,12),SABIT.koyu)}
      ${g.r("b5","M92 52L109 24L126 52ZM186 52L203 24L220 52ZM136 42L156 12L176 42Z",koyu("M109 24L126 52H109ZM203 24L220 52H203ZM156 12L176 42H156Z",.16))}
      ${g.r("b1","M0 120C60 102 120 98 156 112C200 98 260 104 312 116V168H0Z",firca(["M10 136C60 130 110 132 150 128","M180 156C230 152 260 154 300 150"],5,.2))}
      ${g.f("M146 124C144 140 136 156 128 168H178C172 156 168 140 166 124Z",SABIT.yol)}
      ${g.bant("b4",44,82,72)}${g.bant("b5",156,34,140)}`},

  /* Sv 21 · Kumsal (yeni: beyaz → açık tonlar) — b1 Y kum, b2 LB gökyüzü, b3 B deniz, b4 G palmiye. */
  21:{ad:"Kumsal", spot:{b1:[200,148], b2:[210,30], b3:[220,100], b4:[68,40]},
    ciz:g=>`${g.r("b2","M0 0H312V86H0Z",firca(["M110 18C160 12 210 16 260 12","M140 60C190 54 240 58 306 54"],7,.25))}
      ${g.f(bulut(130,44,.9),SABIT.bulut)}${ciz("M250 40q5-5 10 0q5-5 10 0M270 58q4-4 8 0q4-4 8 0","#5B4535",1.4,.7)}
      ${g.r("b3","M0 82H312V120C220 112 100 116 0 124Z",`${ciz("M140 94q8-4 16 0M240 104q8-4 16 0M180 112q6-3 12 0","#fff",2.4,.6)}${koyu("M0 82H312V90H0Z",.12)}`)}
      ${g.r("b1","M0 122C100 114 220 112 312 118V168H0Z",`${firca(["M20 140C70 134 120 136 170 132","M150 160C200 156 250 158 300 154"],5,.3)}${koyu("M0 150C100 146 220 146 312 144V168H0Z",.08)}`)}
      ${g.f("M70 138C68 110 72 76 76 46L82 47C78 78 76 110 80 138Z",SABIT.govde)}
      ${g.r("b4","M78 44C60 30 38 30 24 42C42 40 58 42 78 48ZM78 44C66 24 70 10 84 4C82 18 82 30 80 46ZM80 44C96 26 118 24 132 34C114 34 98 38 82 48ZM80 46C98 40 118 46 126 62C110 52 96 48 80 48ZM78 46C62 46 46 54 40 68C54 58 66 52 78 48Z",ciz("M78 46C60 36 44 36 30 40M80 46C98 32 114 30 128 34","#1F4A1C",1,.4))}
      ${g.f("M226 150C226 138 250 132 262 140C268 144 268 150 262 152Z",SABIT.bulut)}${ciz("M244 152V120","#6E4E36",1.6,.9)}
      ${g.f("M214 124C224 110 264 110 274 124Z",SABIT.baca)}
      <g fill="#fff" fill-opacity=".8">${[[40,150],[120,156],[160,140]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.2"/>`).join("")}</g>`},

  /* Sv 22 · Hasat — b1 O balkabakları (bantlı ← b4 buğday; tarlada duruyorlar), b2 B gökyüzü, b3 G ağaç, b4 Y buğday tarlası, b5 CR bulutlar. */
  22:{ad:"Hasat", spot:{b1:[64,136], b2:[126,64], b3:[264,58], b4:[160,118], b5:[60,32]},
    ciz:g=>`${g.r("b2","M0 0H312V92H0Z",firca(["M110 18C160 12 210 16 240 12","M100 76C150 70 200 74 240 70"],7,.22))}
      ${g.r("b5",bulut(30,40,1.3)+bulut(170,32,1),firca(["M42 30C52 26 60 26 68 28","M178 24C186 20 194 20 200 22"],3,.6))}
      ${ciz("M264 96V70","#6E4E36",6,1)}
      ${g.r("b3",tac(264,58,38,26,10),`${koyu("M282 36C296 52 296 74 284 80C288 66 288 50 282 36Z",.16)}${firca(["M246 46C252 38 260 34 268 34"],4,.35)}`)}
      ${g.f("M190 64H226V94H190Z",SABIT.baca)}${g.f("M184 66L208 46L232 66Z",SABIT.kapi)}${g.f(pencere(202,76,12,18),SABIT.duvar)}
      ${g.r("b4","M0 92C100 86 220 88 312 94V168H0Z",ciz("M10 104l4-8M30 110l4-8M60 104l4-8M100 112l4-8M140 104l4-8M180 112l4-8M220 104l4-8M260 112l4-8M290 104l4-8M20 130l4-8M120 136l4-8M170 150l4-8M250 140l4-8M290 156l4-8","#8A6A10",1.6,.5))}
      ${g.f("M120 168C130 140 150 112 186 94H198C170 114 152 140 146 168Z",SABIT.yol)}
      ${g.r("b1",[E(64,136,20,15),E(102,148,14,11),E(222,142,18,13)].join(""),`${ciz("M56 124C52 136 54 146 58 150M72 124C76 136 74 146 70 150M216 132C212 140 214 150 218 154M228 132C232 140 230 150 226 154","#8A3E0C",1.4,.45)}${isik("M50 130C52 126 56 124 60 123",3,.45)}`)}
      ${ciz("M64 122V116M102 138V133M222 130V124","#3F5E3C",2.4,1)}
      ${g.bant("b1",80,140,110)}${g.bant("b1",222,142,48)}`},

  /* Sv 23 · Dondurma — b1 P üst top (erik), b2 O alt top (bantlı ← b4 külah), b3 PK orta top (çilek), b4 Y külah, b5 LB duvar. */
  23:{ad:"Dondurma", spot:{b1:[156,28], b2:[156,99], b3:[156,58], b4:[156,124], b5:[60,60]},
    ciz:g=>`${g.r("b5","M0 0H312V134H0Z",`<g fill="#fff" fill-opacity=".35">${[[30,20],[80,40],[40,96],[240,30],[280,80],[250,120],[100,110],[210,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5"/>`).join("")}</g>`)}
      ${g.f("M0 132H312V168H0Z",SABIT.masa)}${g.f("M0 156H312V168H0Z",SABIT.masaOn)}
      ${g.f("M236 70H274L268 140H242Z",SABIT.cam,`fill-opacity=".8"`)}${ciz("M244 80L262 130M254 76L270 120","#fff",3,.6)}${ciz("M262 70L276 40","#B0705A",3,.9)}
      <ellipse cx="156" cy="150" rx="22" ry="4" fill="${CIZGI}" fill-opacity=".18"/>
      ${g.r("b4","M132 96H180L156 158Z",ciz("M140 104L170 134M152 100L174 122M168 100L176 108M136 104L162 132M146 118L170 104M140 108L176 100","#8A6A10",1.2,.45))}
      ${g.r("b2",C(156,94,24),`${koyu("M172 78C184 92 180 112 164 118C172 108 174 92 172 78Z",.15)}${isik("M138 92C138 86 142 80 148 78",4,.45)}`)}
      ${g.r("b3",C(156,62,22),`${koyu("M170 46C182 58 180 78 164 84C172 74 174 60 170 46Z",.12)}${isik("M140 60C140 54 144 48 150 46",4,.5)}`)}
      ${g.r("b1",C(156,32,19),isik("M142 30C142 24 146 20 152 18",4,.5))}
      <g>${[[148,64,"#4E9A4A"],[164,54,"#2E64B0"],[160,72,"#EDB83A"],[146,52,"#7D4FA6"]].map(([x,y,c])=>`<rect x="${x}" y="${y}" width="6" height="2" rx="1" fill="${c}" fill-opacity=".6" transform="rotate(30 ${x} ${y})"/>`).join("")}</g>
      ${g.bant("b2",156,98,62)}`},

  /* Sv 24 · Kiraz çiçeği (zirve) — b1 LB gökyüzü, b2 O güneş (bantlı ← b5 dağ; dağın arkasından doğuyor), b3 PK çiçekli ağaç, b4 G çayır (bantlı ← b5), b5 P dağ. */
  24:{ad:"Kiraz çiçeği", spot:{b1:[150,30], b2:[222,56], b3:[80,48], b4:[200,142], b5:[272,88]},
    ciz:g=>`${g.r("b1","M0 0H312V110H0Z",firca(["M110 18C160 12 210 16 260 12","M100 76C150 70 200 74 240 70"],7,.25))}
      ${g.r("b2",C(222,68,22),isik("M208 60A14 14 0 0 1 222 52",4,.5))}
      ${g.r("b5","M120 106L196 54L232 78L262 50L312 82V114H120Z",`${koyu("M262 50L282 62L280 114H262Z",.14)}${koyu("M196 54L212 64L210 114H196Z",.12)}`)}
      ${g.f("M254 56L262 50L272 56L266 56L262 60Z",SABIT.bulut)}
      ${g.r("b4","M0 100C100 96 220 100 312 104V168H0Z",firca(["M120 120C170 114 220 116 270 112","M140 156C190 152 240 154 300 150"],5,.2))}
      ${g.f("M74 160C76 130 74 110 66 94L72 92C80 104 84 92 92 84L96 88C88 98 84 112 84 160Z",SABIT.govde)}
      ${g.r("b3",tac(72,62,54,38,12),`${koyu("M120 52C134 66 128 92 110 98C118 84 122 68 120 52Z",.12)}${firca(["M50 44C58 34 70 28 80 28","M90 30C98 28 106 30 112 36"],4,.4)}`)}
      <g fill="#E99AAE" fill-opacity=".7">${[[140,120],[160,138],[120,150],[30,120],[180,110],[46,140]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3" ry="2" transform="rotate(30 ${x} ${y})"/>`).join("")}</g>
      ${g.bant("b2",222,58,46)}${g.bant("b4",200,140,120)}`},

  /* Sv 25 · Kahvaltı (nefes) — b1 R domates, b2 O portakal suyu, b3 CR masa örtüsü, b4 P reçel kavanozu (bantlı ← b3 örtü; örtünün üstünde), b5 Y peynir. */
  25:{ad:"Kahvaltı", spot:{b1:[212,114], b2:[78,100], b3:[110,154], b4:[155,120], b5:[272,138]},
    ciz:g=>`${g.f("M0 0H312V110H0Z",SABIT.ic2)}${firca(["M14 22C70 16 120 20 170 15","M196 44C236 40 270 42 304 38"],7,.28)}
      ${g.f(pencere(220,14,70,60),SABIT.duvar)}${g.f(pencere(226,20,58,48),SABIT.cam)}${ciz("M255 20V68M226 44H284","#F2E8D5",3,1)}
      ${g.r("b3","M0 108C80 104 230 104 312 108V168H0Z",`${ciz("M0 124H312M0 144H312M40 108V168M120 108V168M200 108V168M280 108V168","#D9472F",2,.18)}${koyu("M0 156H312V168H0Z",.08)}`)}
      ${g.f("M58 56H98L92 132H64Z",SABIT.bulut,`fill-opacity=".6"`)}
      ${g.r("b2","M61 72H95L92 130H64Z",`${isik("M68 80V122",3,.45)}${koyu("M86 72H95L92 130H84Z",.12)}`)}
      ${g.f("M58 56H98L97 62H59Z",SABIT.bulut)}
      ${g.f("M136 82H174V92H136Z",SABIT.kapi)}
      ${g.r("b4","M134 92H176V134C176 138 172 140 168 140H142C138 140 134 138 134 134Z",`${koyu("M164 92H176V134C176 138 172 140 168 140H164Z",.15)}${isik("M140 100V130",3,.4)}`)}
      ${g.f(pencere(142,108,26,16),SABIT.duvar)}
      <ellipse cx="244" cy="140" rx="60" ry="12" fill="${SABIT.seramik}" stroke="${CIZGI}" stroke-opacity=".55" stroke-width="1.1"/>
      ${g.r("b1",C(212,118,18),`${koyu("M222 104C232 116 228 132 216 136C222 126 224 114 222 104Z",.16)}${isik("M200 112C202 108 204 106 208 104",3,.5)}`)}
      ${g.f("M206 101L212 96L218 101L212 104Z",SABIT.yaprak)}
      ${g.r("b5","M240 136L296 118V144L240 152Z",`<g fill="#8A6A10" fill-opacity=".25"><circle cx="258" cy="140" r="3"/><circle cx="276" cy="132" r="2.4"/><circle cx="284" cy="142" r="2"/></g>`)}
      ${g.bant("b4",155,116,58)}`},

  /* Sv 26 · Yayla — b1 LB gökyüzü, b2 P dağ, b3 G çayır, b4 CR karlı zirve (bantlı ← b2 dağ), b5 O yayla evi (bantlı ← b3 çayır). */
  26:{ad:"Yayla", spot:{b1:[260,28], b2:[136,76], b3:[72,140], b4:[130,42], b5:[230,134]},
    ciz:g=>`${g.r("b1","M0 0H312V104H0Z",firca(["M10 18C60 12 110 16 150 12","M170 50C220 44 270 48 306 44"],7,.25))}
      ${g.f(bulut(220,70,.8),SABIT.bulut)}
      ${g.r("b2","M10 104L130 26L184 70L226 44L312 100V112H10Z",`${koyu("M130 26L156 44L150 112H130Z",.14)}${koyu("M226 44L246 58L244 112H226Z",.12)}`)}
      ${g.r("b4","M100 46L130 26L160 46L148 44L138 54L128 44L114 54Z",isik("M116 44L130 32",3,.6))}
      ${g.f("M216 52L226 44L238 52L230 52L226 56Z",SABIT.bulut)}
      ${g.r("b3","M0 98C90 92 220 94 312 100V168H0Z",firca(["M10 116C60 110 110 112 160 108","M170 156C220 152 260 154 300 150"],5,.2))}
      ${g.f(cam(20,124,40),SABIT.agac)}${g.f(cam(40,128,30),SABIT.agac)}${g.f(cam(290,122,36),SABIT.agac)}
      ${g.r("b5","M208 118H254V150H208Z",koyu("M240 118H254V150H240Z",.14))}
      ${g.f("M200 120L231 96L262 120Z",SABIT.kapi)}${g.f(pencere(244,132,8,18),SABIT.kapi)}
      ${ciz("M150 150H196M150 140H196M156 136V156M176 136V156M190 136V156","#6E4E36",1.6,.7)}
      ${g.f("M226 150C222 158 216 164 212 168H236C236 162 236 156 234 150Z",SABIT.yol)}
      <g fill="#fff" fill-opacity=".85">${[[90,150],[110,140],[280,150]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="4"/>`).join("")}</g>
      ${g.bant("b4",130,42,56)}${g.bant("b5",230,134,60)}`},

  /* Sv 27 · Akdeniz kasabası — b1 O ev (merkez), b2 B deniz, b3 CR komşu ev (bantlı ← b1), b4 G ağaç (bantlı ← b1), b5 P begonviller, b6 LB gökyüzü. */
  27:{ad:"Akdeniz kasabası", spot:{b1:[157,96], b2:[272,89], b3:[86,128], b4:[222,116], b5:[70,92], b6:[60,30]},
    ciz:g=>`${g.r("b6","M0 0H312V80H0Z",firca(["M110 18C160 12 210 16 260 12","M100 56C150 50 200 54 260 50"],7,.25))}
      ${g.f(bulut(170,40,.8),SABIT.bulut)}
      ${g.r("b2","M0 78H312V104H0Z",`${ciz("M220 88q6-3 12 0M270 96q6-3 12 0M20 92q6-3 12 0","#fff",2,.6)}`)}
      ${g.f("M0 100C80 96 230 96 312 100V168H0Z",SABIT.kum)}
      ${g.f("M236 92H296V150H236Z",SABIT.duvar)}${g.f(pencere(248,104,10,12),SABIT.cam)}${g.f(pencere(274,104,10,12),SABIT.cam)}
      ${g.r("b3","M54 90H118V152H54Z",koyu("M104 90H118V152H104Z",.1))}
      ${g.f(pencere(64,106,12,14),SABIT.cam)}${g.f(pencere(90,124,14,28),SABIT.kapi)}
      ${g.r("b1","M118 70H196V152H118Z",`${koyu("M182 70H196V152H182Z",.12)}${firca(["M124 78H170","M126 144H180"],5,.25)}`)}
      ${g.f(pencere(130,84,14,16),SABIT.cam)}${g.f(pencere(170,84,14,16),SABIT.cam)}${g.f("M148 152V124A9 9 0 0 1 166 124V152Z",SABIT.kapi)}
      ${g.f("M114 66H200V72H114Z",SABIT.duvar)}${g.f("M50 86H122V92H50Z",SABIT.duvar)}
      ${ciz("M222 152V130","#6E4E36",5,1)}
      ${g.r("b4",tac(220,112,20,26,8),firca(["M208 92C212 88 218 86 222 86"],3,.4))}
      ${g.r("b5",tac(74,96,26,13,8),`<g fill="#fff" fill-opacity=".4">${[[66,90],[86,86],[54,104]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2"/>`).join("")}</g>`)}
      ${g.f("M140 152C136 158 132 164 128 168H186C180 162 176 158 172 152Z",SABIT.yol)}
      ${g.bant("b3",86,128,60)}${g.bant("b4",220,112,52)}`},

  /* Sv 28 · Kamp gecesi — b1 G orman (bantlı ← b3 sol dağ), b2 O çadır, b3 P sol dağ, b4 P sağ dağ, b5 LB göl (bantlı ← b2 çadır; çadır göl kıyısında), b6 CR ay. */
  28:{ad:"Kamp gecesi", spot:{b1:[56,98], b2:[124,132], b3:[70,72], b4:[222,72], b5:[244,130], b6:[250,32]},
    ciz:g=>`${g.f("M0 0H312V104H0Z",SABIT.gece)}
      <g fill="#fff" fill-opacity=".8">${[[30,20],[110,14],[160,36],[200,12],[290,50],[20,60],[140,62]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6"/>`).join("")}</g>
      ${g.r("b6",C(250,32,16),koyu("M256 18C266 26 266 40 256 46C260 38 260 26 256 18Z",.1))}
      ${g.r("b4","M128 100L214 44L312 100Z",koyu("M214 44L240 60L238 100H214Z",.14))}
      ${g.r("b3","M0 100L70 30L150 100Z",koyu("M70 30L90 50L88 100H70Z",.14))}
      ${g.f("M62 38L70 30L80 40L72 38L68 44Z",SABIT.bulut)}${g.f("M206 50L214 44L224 50L216 50Z",SABIT.bulut)}
      ${g.r("b1","M0 96H140V108H0Z"+[12,30,48,66,84,102,120].map((x,i)=>cam(x,100,28+(i%3)*6)).join(""),"")}
      ${g.f("M0 104H312V168H0Z",SABIT.tepe)}
      ${g.r("b5","M150 112C190 104 290 104 312 112V152C260 160 190 156 150 142C142 132 142 120 150 112Z",`${ciz("M190 120q8-4 16 0M250 140q8-4 16 0","#fff",2.4,.6)}${leke(C(250,128,8),"#fff",.25)}`)}
      ${g.r("b2","M90 148L122 100L156 148Z",`${koyu("M122 100L156 148H122Z",.18)}`)}
      ${g.f("M114 148L122 120L130 148Z",SABIT.koyu)}
      ${ciz("M50 150L70 142M52 142L70 150","#6E4E36",3,1)}${g.f("M56 142C54 132 60 126 62 120C66 128 70 132 66 142Z","#EFC27A")}
      ${g.bant("b1",56,96,90)}${g.bant("b5",236,128,100)}`},

  /* Sv 29 · Akvaryum (zirve) — b1 LB su (merkez), b2 PK mercan, b3 O balıklar (bantlı ← b1), b4 G yosunlar (bantlı ← b1), b5 CR kum (bantlı ← b1), b6 P taşlar. */
  29:{ad:"Akvaryum", spot:{b1:[160,24], b2:[272,108], b3:[110,62], b4:[30,96], b5:[200,154], b6:[120,140]},
    ciz:g=>{const balik=(x,y,s)=>`M${x-20*s} ${y}C${x-12*s} ${y-12*s} ${x+8*s} ${y-12*s} ${x+16*s} ${y}C${x+8*s} ${y+12*s} ${x-12*s} ${y+12*s} ${x-20*s} ${y}ZM${x+14*s} ${y}L${x+28*s} ${y-10*s}V${y+10*s}Z`;
      return `${g.r("b1","M0 0H312V168H0Z",`${firca(["M10 14C60 8 110 12 150 8","M170 40C220 34 270 38 306 34"],6,.25)}${koyu("M0 110H312V168H0Z",.06)}`)}
      <g fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.2">${[[150,60,4],[154,46,3],[148,34,2.4],[240,70,3],[244,56,2]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
      ${g.r("b5","M0 134C80 126 220 128 312 132V168H0Z",`<g fill="#8A6A10" fill-opacity=".25">${[[30,150],[80,160],[150,150],[230,160],[280,148]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6"/>`).join("")}</g>`)}
      ${g.r("b4","M20 134C10 110 30 96 18 70C30 84 36 100 28 134ZM36 134C34 116 48 104 44 84C54 100 50 116 44 134ZM290 134C286 120 296 110 292 94C302 106 300 120 296 134Z",firca(["M24 120C22 108 26 98 24 88"],2,.35))}
      ${g.r("b2","M256 134C254 118 246 108 250 96C256 104 258 112 262 116C262 104 266 92 274 86C276 98 272 108 270 118C276 110 284 104 290 106C284 114 276 124 274 134Z",isik("M262 112C262 106 264 100 266 96",2,.4))}
      ${g.r("b6",[E(120,140,22,11),E(90,148,14,8),E(170,146,16,9)].join(""),isik("M106 136C110 132 116 131 122 131",3,.35))}
      ${g.r("b3",balik(110,62,1.1)+balik(222,90,.8),`${ciz("M92 62C96 58 100 58 104 62M210 90C212 87 216 87 218 90","#fff",1.6,.5)}`)}
      <g fill="${SABIT.koyu}"><circle cx="96" cy="58" r="2"/><circle cx="211" cy="87" r="1.6"/></g>
      ${g.bant("b3",116,62,62)}${g.bant("b3",226,90,44)}${g.bant("b4",30,104,44)}${g.bant("b5",200,152,140)}`;}},

  /* Sv 30 · Çay bahçesi (ZOR, final) — b1 O tuğla yol, b2 G çimen (bantlı ← b1 yol), b3 CR bulutlar (bantlı ← b6 gök), b4 P leylak çalıları (bantlı ← b5 ağaç), b5 PK çiçekli ağaç, b6 LB gökyüzü. */
  30:{ad:"Çay bahçesi", spot:{b1:[180,140], b2:[268,144], b3:[128,24], b4:[72,116], b5:[80,42], b6:[160,72]},
    ciz:g=>`${g.r("b6","M0 0H312V106H0Z",firca(["M10 16C60 10 110 14 150 10","M170 84C220 78 270 82 306 78"],7,.25))}
      ${g.r("b3",bulut(100,32,1.3)+bulut(250,20,.8),firca(["M112 22C122 18 130 18 138 20"],3,.6))}
      ${g.f("M0 98C80 92 230 92 312 98V106H0Z",SABIT.tepe)}
      ${g.r("b2","M0 104C100 98 220 100 312 104V168H0Z",firca(["M10 130C40 126 60 128 90 126","M220 156C250 152 280 154 304 150"],5,.2))}
      ${ciz("M190 62V100M282 62V100","#B0705A",3,1)}${g.f("M180 100H292V106H180Z",SABIT.duvar)}
      ${g.f("M180 62L236 32L292 62Q236 68 180 62Z",SABIT.duvar)}${ciz("M236 32V26","#6E4E36",2,1)}
      ${g.f("M216 86H256V90H216Z",SABIT.masaOn)}${ciz("M222 90V100M250 90V100","#6E4E36",2,1)}
      ${g.r("b1","M140 168C150 140 170 120 200 106H222C206 124 196 148 200 168Z",ciz("M152 150H196M160 134H200M172 120H206M146 160L150 150M176 150L178 134M188 134L192 120","#8A3E0C",1.2,.4))}
      ${g.f("M78 160C80 130 78 110 70 92L76 90C84 102 88 92 96 84L100 88C92 98 88 112 88 160Z",SABIT.govde)}
      ${g.r("b5",tac(78,60,50,38,12),`${koyu("M120 52C134 66 128 90 110 96C118 82 122 68 120 52Z",.12)}${firca(["M54 42C62 32 72 26 82 26"],4,.4)}`)}
      ${g.r("b4",tac(46,118,30,15,7)+tac(104,118,28,15,7),`<g fill="#fff" fill-opacity=".35">${[[36,108],[66,112],[98,106]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4"/>`).join("")}</g>`)}
      <g fill="#E99AAE" fill-opacity=".7">${[[140,90],[150,120],[20,140],[130,150]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="3" ry="2" transform="rotate(30 ${x} ${y})"/>`).join("")}</g>
      ${g.bant("b2",268,142,70)}${g.bant("b3",126,24,72)}${g.bant("b3",262,14,40)}${g.bant("b4",74,116,96)}`}
};
