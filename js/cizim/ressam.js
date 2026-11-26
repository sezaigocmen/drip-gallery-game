// cizim/ressam.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)

/* ================= Ressam karakteri · Stil 1 Çizgi film (cel shading) · Sezai kararı 25.11.2026 =================
   2 ana karakter: kadın (kıvırcık kızıl saç, çil) ve erkek (beyaz ten, kısa kahve saç, sakalsız). Yüzleri hiç değişmez.
   Her bölümde 3 kıyafet seçeneği (şapka + kıyafet + aksesuar) → seçim ekranında 6 seçenek (3 kadın + 3 erkek).
   Bölüm değişince aynı iki kişi, o bölümün yeni 3 kıyafetiyle gelir.
   Stil kuralları: büyük kafa, iri parlak göz, renkli kontur (parçanın koyusu), dış hat kalın / iç ayrıntı ince,
   sağ altta tek tonluk sert gölge, saç ve şapkada açık renkli parlama çizgisi.
   ressamSVG(kişi "f"|"m", bölüm 0–4, kıyafet 0–2, mod)  mod: "full" (140×180) | "wall" (96×124) | "face" (portre). */
export const RS=(()=>{
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("");};
const dk=(c,t)=>mix(c,"#24121A",t), lt=(c,t)=>mix(c,"#FFFFFF",t);
const circ=(x,y,r)=>`M${x-r} ${y} a${r} ${r} 0 1 0 ${2*r} 0 a${r} ${r} 0 1 0 ${-2*r} 0Z`;
const S={
  head:"M-29 0 C-30 -22 -16 -32 1 -32 C18 -32 30 -21 29 0 C28 20 16 31 0 31 C-16 31 -29 20 -29 0Z",
  earL:"M-27 -3 C-36 -5 -37 10 -26 10Z", earR:"M27 -3 C36 -5 37 10 26 10Z",
  curlBack:"M-34 -8 C-46 -14 -42 -36 -28 -36 C-24 -48 -6 -50 2 -42 C12 -50 30 -46 32 -34 C44 -30 46 -12 38 -4 C46 6 42 24 30 26 C30 36 18 40 12 32 L-12 32 C-18 40 -32 36 -30 26 C-44 22 -44 2 -34 -8Z",
  curlBang:"M-29 -6 C-30 -24 -14 -36 2 -34 C20 -34 32 -22 30 -4 C26 -14 18 -18 12 -14 C8 -22 -2 -24 -8 -16 C-14 -22 -24 -18 -29 -6Z",
  curlTex:"M-39 0 C-35 -3 -31 1 -33 6 M37 0 C33 -3 29 1 31 6 M-33 18 C-29 15 -25 19 -27 24 M31 18 C27 15 23 19 25 24 M-38 -22 C-34 -25 -30 -21 -32 -16",
  short:"M-31 -2 C-35 -24 -20 -40 2 -40 C24 -40 35 -24 31 -2 C29 -12 24 -18 18 -19 C10 -27 -6 -27 -12 -20 C-20 -20 -28 -14 -31 -2Z",
  quiff:"M-14 -22 C-12 -38 14 -42 22 -28 C12 -33 0 -30 -14 -22Z",
  /* şapkalar */
  beret:"M-32 -22 C-38 -40 -12 -52 10 -50 C32 -48 40 -36 35 -24 C26 -16 -20 -14 -32 -22Z", stem:"M5 -49 C4 -56 10 -59 13 -53 C11 -51 8 -50 5 -49Z",
  bandana:"M-31 -8 C-32 -30 -14 -41 2 -41 C20 -41 33 -30 31 -8 C22 -16 -20 -16 -31 -8Z", knot:"M29 -16 L41 -24 L39 -11Z M29 -13 L41 -5 L34 -2Z",
  bucketTop:"M-26 -17 C-27 -40 -12 -47 0 -47 C12 -47 27 -40 26 -17Z", bucketBrim:"M-38 -16 C-38 -23 38 -23 38 -16 C38 -9 -38 -9 -38 -16Z",
  capTop:"M-31 -14 C-34 -34 -12 -46 8 -45 C28 -44 38 -32 33 -15 C20 -19 -18 -19 -31 -14Z", capVisor:"M-27 -16 C-22 -6 18 -6 25 -16 C12 -12 -14 -12 -27 -16Z",
  strawTop:"M-23 -19 C-24 -43 24 -43 23 -19Z", strawBrim:"M-46 -17 C-46 -26 46 -26 46 -17 C46 -9 -46 -9 -46 -17Z",
  fedoraTop:"M-22 -19 C-24 -42 -8 -46 0 -39 C8 -46 24 -42 22 -19Z", fedoraBrim:"M-38 -17 C-38 -24 38 -24 38 -17 C38 -11 -38 -11 -38 -17Z",
  /* gövde */
  neck:"M-7 -8 H7 V6 H-7Z",
  torso:"M-19 0 C-24 14 -25 36 -23 52 L23 52 C25 36 24 14 19 0 C10 -4 -10 -4 -19 0Z",
  pants:"M-23 42 L23 42 L24 56 L-24 56Z",
  armR:"M15 4 C25 6 31 20 31 32 L23 35 C22 25 18 16 11 11Z",
  armL:"M-15 4 C-25 4 -33 -4 -37 -14 L-30 -18 C-26 -10 -21 -4 -12 -1Z",
  over:"M-14 19 L14 19 L15 36 C20 37 24 40 24 46 L24 56 L-24 56 L-24 46 C-24 40 -20 37 -15 36Z",
  apron:"M-15 13 C-15 11 15 11 15 13 L18 54 L-18 54Z",
  jacketL:"M-19 0 C-24 14 -25 36 -23 52 L-3 52 L-3 22 L-11 1Z", jacketR:"M19 0 C24 14 25 36 23 52 L3 52 L3 22 L11 1Z",
  scarf:"M-17 -3 C-8 6 8 6 17 -3 L17 6 C8 15 -8 15 -17 6Z", scarfTail:"M5 9 L13 33 L3 31Z",
  turtle:"M-10 -7 H10 V4 C4 7 -4 7 -10 4Z",
  bow:"M-9 -1 L0 3 L-9 7Z M9 -1 L0 3 L9 7Z",
  palette:"M17 33 C17 25 33 23 41 29 C47 33 45 43 37 45 C31 46 29 41 25 43 C19 45 17 39 17 33Z",
  brush:"M-31 -6 L-46 -44", tip:"M-48 -45 C-51 -53 -46 -57 -44.5 -50 C-44 -48 -45 -45 -46.5 -44Z"};
const LEG=14;
const legL=`M-15 54 H-3 V${54+LEG} H-15Z`, legR=`M3 54 H15 V${54+LEG} H3Z`;
const shoeL=`M-18 ${56+LEG} C-18 ${49+LEG} -2 ${49+LEG} -1 ${56+LEG} C-1 ${60+LEG} -18 ${60+LEG} -18 ${56+LEG}Z`;
const shoeR=`M1 ${56+LEG} C2 ${49+LEG} 18 ${49+LEG} 19 ${56+LEG} C19 ${60+LEG} 1 ${60+LEG} 1 ${56+LEG}Z`;
/* 2 ana karakter: yüz, saç, ten sabit */
const CHARS={f:{k:"f",skin:"#F7C6A3",hair:"#C2522B",bw:1},m:{k:"m",skin:"#F3CFB3",hair:"#6B3F22",bw:1.06}};
/* Bölüm başına 3 kıyafet. fit = gövde kalıbı; hat = [tür, renk]; acc = aksesuar; m/f = kişiye özel fark. */
const OUTFITS=[
  /* 1 Atölyem: tulum */
  [{fit:"tulum",top:"#FFF4E0",stripe:"#2C4C8C",lay:"#3FA56B",hat:["bere","#E2462E"]},
   {fit:"tulum",top:"#FFD35A",lay:"#4A78B8",hat:["bandana","#D8452B"],f:{acc:["kupe"]}},
   {fit:"tulum",top:"#2C4C8C",lay:"#EFE6D6",splat:1,hat:["kova","#5FA05A"],acc:["gozluk"],m:{hat:["kasket","#5FA05A"]}}],
  /* 2 Kafe Duvarı: önlük */
  [{fit:"onluk",top:"#FFF6E8",lay:"#D8452B",legs:"#4A3A5A",hat:["bere","#E2462E"]},
   {fit:"onluk",top:"#FFF4E0",stripe:"#D8452B",lay:"#2F7D5B",legs:"#3A3A48",hat:["kasket","#8A6440"]},
   {fit:"onluk",top:"#FFD35A",lay:"#6B4226",legs:"#4A3A5A",hat:["bandana","#2E64B0"],acc:["kalem"],f:{acc:["kalem","kupe"]}}],
  /* 3 İlk Sergim: ceket */
  [{fit:"ceket",top:"#FFFFFF",lay:"#2A3F7A",legs:"#2A3F7A",hat:["bere","#E2462E"]},
   {fit:"ceket",top:"#FFFFFF",lay:"#8E2A3A",legs:"#3A2A30",hat:["fotr","#3A3A3A"],acc:["papyon"],f:{acc:["papyon","kupe"]}},
   {fit:"ceket",top:"#F2E6D0",lay:"#3E7A5A",legs:"#4A3A2A",hat:["kasket","#C9A46A"],acc:["gozluk"]}],
  /* 4 Meydan Sergisi: kazak + şal */
  [{fit:"sal",top:"#C77A3E",lay:"#D9472F",legs:"#5A3A24",hat:["bere","#E2462E"]},
   {fit:"sal",top:"#4A78B8",lay:"#EDB83A",legs:"#3A3A48",hat:["kova","#D9472F"]},
   {fit:"sal",top:"#5FA05A",lay:"#E77B2E",legs:"#5A3A24",hat:["hasir","#E9C98A"],f:{acc:["cicek"]},m:{acc:["gozluk"]}}],
  /* 5 Müze: şık */
  [{fit:"sik",top:"#2E2B2C",lay:"#E8C150",legs:"#77706B",hat:["bere","#2E2B2C"],f:{acc:["kupe"]}},
   {fit:"ceket",top:"#FFFFFF",lay:"#1E1E22",legs:"#1E1E22",hat:["fotr","#1E1E22"],acc:["papyon"]},
   {fit:"sik",top:"#8A8580",lay:"#E8C150",legs:"#3A3A40",hat:["kasket","#5A5550"],acc:["gozluk"]}]];
const outfit=(ck,ch,vi)=>{const o=OUTFITS[Math.max(0,Math.min(4,ch))][vi]||OUTFITS[0][0]; return {...o,...(o[ck]||{})};};
let UID=0;
function svg(ck,ch,vi,mode="full"){
  const L=CHARS[ck]||CHARS.f, O=outfit(ck,ch,vi), u="rs"+(++UID), defs=[]; let n=0; const id=()=>u+"_"+(++n);
  const fk=O.fit, top=O.top, lay=O.lay, legs=O.legs||lay, sleeve=fk==="ceket"?lay:top, shoe=O.shoe||dk(legs,.45), acc=O.acc||[];
  const fill=p=>{const c=id(); defs.push(`<clipPath id="${c}"><path d="${p.d}"/></clipPath>`);
    return `<path d="${p.d}" fill="${dk(p.f,.24)}"/><g clip-path="url(#${c})"><path d="${p.d}" fill="${p.f}" transform="translate(-3.5 -3)"/>${p.extra||""}${p.hl?`<path d="${p.hl}" fill="none" stroke="${lt(p.f,.5)}" stroke-width="2.4" stroke-linecap="round"/>`:""}${p.tex?`<path d="${p.tex}" fill="none" stroke="${dk(p.f,.4)}" stroke-width="1.4" stroke-linecap="round"/>`:""}</g><path d="${p.d}" fill="none" stroke="${dk(p.f,.62)}" stroke-width="${p.w||2.2}" stroke-linejoin="round"/>`;};
  const line=p=>`<path d="${p.d}" stroke="${dk(p.f,.62)}" stroke-width="${p.w+2.4}" stroke-linecap="round" fill="none"/><path d="${p.d}" stroke="${p.f}" stroke-width="${p.w}" stroke-linecap="round" fill="none"/>`;
  const R=list=>list.map(p=>p.raw!=null?p.raw:p.ln?line(p):fill(p)).join("");
  const ink=(d,c,w)=>({raw:`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`});
  const sk=L.skin, hr=L.hair;
  const stripes=O.stripe?[6,13,20,27].map(y=>`<path d="M-30 ${y} H30" stroke="${O.stripe}" stroke-width="3"/>`).join(""):"";
  const gold=(x,y,r=1.9)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#F2C230" stroke="#9A6A10" stroke-width=".8"/>`;
  const dot=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${dk(c,.5)}" stroke-width=".9"/>`;
  const dabs=dot(24,30,2.7,"#D9472F")+dot(31,28,2.7,"#EDB83A")+dot(38,32,2.7,"#2E64B0")+dot(37,39,2.7,"#4E9A4A");
  const splat=O.splat?`<circle cx="-8" cy="44" r="2.4" fill="#D9472F"/><circle cx="9" cy="28" r="2" fill="#2E64B0"/><circle cx="-16" cy="50" r="1.6" fill="#EDB83A"/><circle cx="16" cy="47" r="2.2" fill="#4E9A4A"/>`:"";
  const layer={
    tulum:[{d:S.over,f:lay,w:2.6,extra:splat},{d:"M-12 20 L-16 1",f:lay,ln:1,w:3.4},{d:"M12 20 L16 1",f:lay,ln:1,w:3.4},{raw:gold(-12,21)+gold(12,21)},ink("M-7 25 H7 V33 H-7Z",dk(lay,.35),1.3)],
    onluk:[{d:S.apron,f:lay,w:2.4},ink("M-10 12 L-13 0 M10 12 L13 0",dk(lay,.35),2.2),ink("M-8 30 H8 V40 H-8Z",dk(lay,.4),1.3)],
    ceket:[{d:S.jacketL,f:lay,w:2.4},{d:S.jacketR,f:lay,w:2.4},ink("M-11 1 L-4 16 L-8 18 M11 1 L4 16 L8 18",lt(lay,.35),1.4),{raw:gold(6,30,1.6)+gold(6,40,1.6)}],
    sal:[ink("M-20 47 H20 M-20 50 H20",dk(top,.3),1),{d:S.scarf,f:lay,w:2.2},{d:S.scarfTail,f:lay,w:2}],
    sik:[{d:S.turtle,f:top,w:2},{raw:`<path d="M9 14 l2.6 2.6 -2.6 2.6 -2.6 -2.6Z" fill="${lay}" stroke="${dk(lay,.5)}" stroke-width=".8"/>`}]}[fk];
  if(acc.includes("papyon")) layer.push({d:S.bow,f:"#D8452B",w:1.6},{raw:dot(0,3,1.8,"#D8452B")});
  if(acc.includes("kalem")) layer.push({d:"M-6 27 L-4 38",f:"#EDB83A",ln:1,w:2.4},{d:"M2 27 L1 38",f:"#2E64B0",ln:1,w:2.4});
  const back=[
    {d:legL,f:legs},{d:legR,f:legs},{d:shoeL,f:shoe},{d:shoeR,f:shoe},
    {d:S.armR,f:sleeve,extra:sleeve===top?stripes:""},{d:circ(26,38,5.5),f:sk},
    {d:S.neck,f:dk(sk,.12)},
    {d:S.torso,f:top,w:2.6,extra:stripes},
    ...(fk==="tulum"?[]:[{d:S.pants,f:legs,w:2.4}]),
    ...layer,
    {d:S.palette,f:"#E8B878"},{raw:dabs},
    {d:S.armL,f:sleeve,extra:sleeve===top?stripes:""}];
  const front=[{d:S.brush,f:"#8A5A2E",ln:1,w:3.4},{d:S.tip,f:"#D9472F"},{d:circ(-35.5,-16,5.5),f:sk}];
  /* yüz (hiç değişmez) */
  const F=L.k==="f";
  let face=[-17,17].map(x=>`<ellipse cx="${x}" cy="12" rx="5" ry="3" fill="#F2707A" opacity=".45"/>`).join("");
  face+=[-11,11].map(x=>`<ellipse cx="${x}" cy="2" rx="4.2" ry="5.6" fill="#2B1B1E"/><circle cx="${x-1.4}" cy="-.4" r="1.7" fill="#fff"/><circle cx="${x+1.5}" cy="4.2" r=".75" fill="#fff"/>${F?`<path d="M${x+(x<0?-3.4:3.4)} -2 l${x<0?-2.8:2.8} -2.4" stroke="#2B1B1E" stroke-width="1.6" stroke-linecap="round"/>`:""}`).join("");
  face+=F?`<path d="M-15 -8 Q-11 -11.5 -7 -9 M15 -8 Q11 -11.5 7 -9" stroke="${dk(hr,.3)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
    :`<path d="M-16 -7 Q-11 -11.5 -6 -9 L-6.5 -7.4 Q-11 -9 -15.5 -5.4Z M16 -7 Q11 -11.5 6 -9 L6.5 -7.4 Q11 -9 15.5 -5.4Z" fill="${hr}" stroke="${dk(hr,.3)}" stroke-width="1" stroke-linejoin="round"/>`;
  face+=`<path d="M-1.6 8 Q1 10.4 2 7.6" stroke="${dk(sk,.45)}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  face+=`<path d="M-6 14.5 Q0 23 6 14.5 Q0 17 -6 14.5Z" fill="#7A2630" stroke="${dk(sk,.6)}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-3 19 Q0 17.4 3 19 Q0 20.8 -3 19Z" fill="#E86A6A"/>`;
  if(F) face+=[[-19,8],[-16.5,10],[-21,11],[19,8],[16.5,10],[21,11]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9" fill="${dk(sk,.38)}"/>`).join("");
  if(acc.includes("gozluk")) face+=`<g fill="rgba(255,255,255,.22)" stroke="#3A2A2A" stroke-width="1.8"><circle cx="-11" cy="2" r="7"/><circle cx="11" cy="2" r="7"/></g><path d="M-4 1 Q0 -1 4 1 M-18 0 L-27 -3 M18 0 L27 -3" stroke="#3A2A2A" stroke-width="1.6" fill="none"/>`;
  const extraHead=[];
  if(acc.includes("kupe")) extraHead.push({raw:dot(-31,13,2.4,"#F2C230")+dot(31,13,2.4,"#F2C230")});
  if(acc.includes("kalem")) extraHead.push({d:"M24 -8 L40 -22",f:"#EDB83A",ln:1,w:3});
  /* şapka */
  const [hk,hc]=O.hat||["bere","#E2462E"];
  const hat={
    bere:[{d:S.beret,f:hc,w:2.6,hl:"M-24 -34 C-16 -42 -4 -45 6 -45"},{d:S.stem,f:hc}],
    bandana:[{d:S.knot,f:hc,w:2},{d:S.bandana,f:hc,w:2.6,hl:"M-22 -28 C-14 -36 -4 -38 6 -38",extra:[[-16,-26],[-2,-32],[12,-28],[-8,-20],[8,-20],[22,-20]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8" fill="#FFF4E0"/>`).join("")}],
    kova:[{d:S.bucketTop,f:hc,w:2.6,hl:"M-18 -34 C-12 -42 -4 -44 4 -44"},{d:S.bucketBrim,f:hc,w:2.4},ink("M-25 -22 H25",dk(hc,.35),1.4)],
    kasket:[{d:S.capTop,f:hc,w:2.6,hl:"M-22 -34 C-14 -42 -4 -44 6 -44",tex:"M2 -44 L0 -18 M-16 -40 L-14 -19 M18 -40 L16 -19"},{d:S.capVisor,f:dk(hc,.15),w:2.2},{raw:dot(2,-45,2.2,hc)}],
    hasir:[{d:S.strawTop,f:hc,w:2.4,hl:"M-16 -34 C-10 -40 -2 -41 4 -41",tex:"M-22 -30 H22 M-23 -36 H20"},{d:"M-23 -24 H23 V-19 H-23Z",f:"#D8452B",w:1.6},{d:S.strawBrim,f:hc,w:2.4,tex:"M-40 -18 H40"}],
    fotr:[{d:S.fedoraTop,f:hc,w:2.4,hl:"M-16 -34 C-12 -40 -6 -42 -2 -41"},{d:"M-22 -25 H22 V-20 H-22Z",f:lt(hc,.3),w:1.4},{d:S.fedoraBrim,f:hc,w:2.4}]}[hk];
  if(acc.includes("cicek")) hat.push({raw:[0,72,144,216,288].map(a=>dot(+(26+4*Math.cos(a*Math.PI/180)).toFixed(1),+(-20+4*Math.sin(a*Math.PI/180)).toFixed(1),2.8,"#FF6FA8")).join("")+dot(26,-20,2,"#EDB83A")});
  const hairBack=F?[{d:S.curlBack,f:hr,w:2.6,tex:S.curlTex,hl:"M-36 -16 C-37 -24 -32 -31 -25 -32"}]:[];
  const hairFront=F?[{d:S.curlBang,f:hr,hl:"M-20 -24 C-14 -30 -6 -32 2 -32"}]:[{d:S.short,f:hr,hl:"M-24 -18 C-20 -28 -10 -33 -2 -34"},{d:S.quiff,f:hr}];
  const head=[...hairBack,{d:S.earL,f:sk},{d:S.earR,f:sk},{d:S.head,f:sk,w:2.6},{raw:face},...hairFront,...extraHead,...hat];
  const bt=`translate(70 96) scale(${L.bw} 1)`, ht="translate(70 70)";
  const body=`<g transform="${bt}">${R(back)}</g><g transform="${ht}">${R(head)}</g><g transform="${bt}">${R(front)}</g>`;
  const shadow=mode==="face"?"":`<ellipse cx="70" cy="171" rx="${28*L.bw}" ry="4.5" fill="#3A2010" opacity=".25"/>`;
  const vb=mode==="face"?"14 12 112 112":"0 0 140 180";
  return `<svg viewBox="${vb}"${mode==="wall"?' width="96" height="124"':""} aria-hidden="true"><defs>${defs.join("")}</defs>${shadow}${body}</svg>`;}
/* bölümün 6 seçeneği: 3 kadın + 3 erkek */
const options=()=>[["f",0],["f",1],["f",2],["m",0],["m",1],["m",2]];
return {svg,CHARS,OUTFITS,options};})();
export const ressamSVG=RS.svg;
/* Sergi'deki küçük ressam: oyuncunun seçtiği kişi (G.look.k) + bu bölümün kıyafeti (G.look.vi). Varsayılan: kadın, kıyafet 1. */
export const LOOK0={k:"f",vi:0}, lookOf=G=>(G&&G.look)||LOOK0, S06OPT=RS.options();
export const lookIdx=L=>Math.max(0,S06OPT.findIndex(([k,v])=>k===L.k&&v===L.vi));
export function painterSVG(V,G){const L=lookOf(G); return ressamSVG(L.k,V.ch||0,L.vi,"wall");}
export const DECOR={
  lamba:(V,d)=>{ if(V.id==="meydan"){const n=Math.round(d.w/34), pts=[]; for(let i=0;i<=n;i++){const x=i*d.w/n; pts.push(`${x.toFixed(1)} ${i%2?20:4}`);}
      const cols=["#EDB83A","#D9472F","#4E9A4A","#2E64B0","#E77B2E"];
      return `<svg viewBox="0 0 ${d.w} ${d.h}" preserveAspectRatio="none"><path d="M${pts.join(" L")}" fill="none" stroke="#3D220E" stroke-width="2"/>${pts.slice(1,-1).map((p,i)=>{const [x,y]=p.split(" ");return `<circle cx="${x}" cy="${+y+5}" r="5" fill="${cols[i%5]}" stroke="#3D220E" stroke-width="1.2"/>`;}).join("")}</svg>`;}
    const cols=[...new Set(V.frames.map(f=>f[0]))];
    return cols.map(x=>{const cx=x+V.fw/2-d.x; return `<i class="lfix" style="left:${cx-14}px"></i><i class="lcone" style="left:${cx-V.fw/2-8}px;width:${V.fw+16}px"></i>`;}).join("");},
  bank:()=>`<svg viewBox="0 0 110 46" preserveAspectRatio="none"><rect x="4" y="8" width="102" height="10" rx="3" fill="#B97C45" stroke="#5B3217" stroke-width="2"/><rect x="4" y="21" width="102" height="9" rx="3" fill="#A86B39" stroke="#5B3217" stroke-width="2"/><rect x="12" y="30" width="7" height="16" fill="#3D220E"/><rect x="91" y="30" width="7" height="16" fill="#3D220E"/></svg>`,
  bitki:()=>`<svg viewBox="0 0 50 96" preserveAspectRatio="xMidYMax meet"><path d="M25 60 C10 50 4 30 12 14 C20 26 24 40 25 60Z" fill="#4E9A4A" stroke="#2F6E0E" stroke-width="2"/><path d="M25 60 C40 48 46 30 40 10 C30 24 26 40 25 60Z" fill="#5FC85A" stroke="#2F6E0E" stroke-width="2"/><path d="M25 62 C22 40 26 22 25 4 C30 22 30 42 25 62Z" fill="#3E9E3B" stroke="#2F6E0E" stroke-width="2"/><path d="M10 62 H40 L36 94 H14Z" fill="#D8452B" stroke="#8E2412" stroke-width="2"/></svg>`,
  afis:()=>`<svg viewBox="0 0 70 96"><rect x="3" y="4" width="64" height="88" rx="2" fill="#FFF9EE" stroke="#5B3217" stroke-width="2.5"/><circle cx="35" cy="34" r="15" fill="#E77B2E"/><rect x="12" y="58" width="46" height="6" rx="3" fill="#2E64B0"/><rect x="18" y="70" width="34" height="5" rx="2.5" fill="#7D4FA6"/><rect x="26" y="0" width="18" height="9" fill="#F1E6C2" stroke="rgba(0,0,0,.15)"/></svg>`,
  zemin:()=>`<svg viewBox="0 0 380 36" preserveAspectRatio="none"><rect x="2" y="2" width="376" height="32" rx="16" fill="#C9473A" stroke="#8E2412" stroke-width="3"/><rect x="14" y="9" width="352" height="18" rx="9" fill="none" stroke="#EDB83A" stroke-width="2" stroke-dasharray="8 6"/></svg>`};
export const decorOwned=(G,id)=>G.decor.includes(id);
