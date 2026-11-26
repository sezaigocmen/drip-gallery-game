// veri/renkler.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)

/* ================= Motor (GDD bölüm 1-2) ================= */
export const CAP=4, PRIM=new Set(["R","Y","B"]);
/* Karışabilen boyalar: 3 ana renk + beyaz (GDD 5. kural, A5 adım 1). Ara renk ve açık ton tekrar karışmaz. */
export const MIXER=new Set(["R","Y","B","W"]);
/* Oyunun 10 rengi: A2 kararı C · Guaj paleti (Sezai, 26.11.2026). Tüpler, boya kutuları ve tablolar bu paletten. */
export const COL={R:"#D9472F",Y:"#EDB83A",B:"#2E64B0",O:"#E77B2E",G:"#4E9A4A",P:"#7D4FA6",W:"#F6F1E6",PK:"#E99AAE",CR:"#F1D98E",LB:"#93B9DE"};
/* Mürekkep: aynı rengin koyusu, açık zemin üstündeki semboller için (eski paletle aynı koyuluk, yeni tonlar) */
export const INK={R:"#9A2E1C",Y:"#825F0C",B:"#224A82",O:"#A85113",G:"#3C7639",P:"#573774",W:"#8E7A4F",PK:"#B1274A",CR:"#866A11",LB:"#2B5D8E"};
/* Sembol kuralı (Sezai, A2): tablodaki bölge rozetinde sembol VE çevresindeki çizgi bölgenin hedef renginde.
   Açık renklerde beyaz rozet üstünde okunsun diye aynı rengin bir ton koyusu (beyaza karşı en az 3:1). */
export const ROZET={...COL,Y:"#B88611",CR:"#9B853E",W:"#9B8E73",LB:"#5A94CD",PK:"#DF6A87"};
export const SHAPE={R:'<circle cx="5" cy="5" r="4.7"/>',Y:'<path d="M5 .3 L9.9 9.6 H.1 Z"/>',B:'<rect x=".5" y=".5" width="9" height="9" rx="1.2"/>',W:'<path d="M5 9.7C1.4 7.1.2 5.1.2 3.3A2.6 2.6 0 0 1 5 2.1a2.6 2.6 0 0 1 4.8 1.2c0 1.8-1.2 3.8-4.8 6.4z"/>'};
/* Sembol kuralı (S41, Sezai): her sembol içi dolu ve aynı boyda, tek fark şekil. Ana boya tek sembol (● ▲ ■, beyaz ♥), karışım iki sembol. */
export const PARTS={R:["R"],Y:["Y"],B:["B"],O:["R","Y"],G:["Y","B"],P:["R","B"],W:["W"],PK:["R","W"],CR:["Y","W"],LB:["B","W"]};
export const NAME={R:"kırmızı",Y:"sarı",B:"mavi",O:"turuncu",G:"yeşil",P:"mor",W:"beyaz",PK:"pembe",CR:"krem",LB:"açık mavi"};
/* 1 + 1 = 2 katman. Ana + ana = ara renk; ana + beyaz = açık ton (sıra fark etmez). Beyaz + beyaz karışım değil, normal döküm. */
export const mixOf=(a,b)=>({RY:"O",YR:"O",YB:"G",BY:"G",RB:"P",BR:"P",RW:"PK",WR:"PK",YW:"CR",WY:"CR",BW:"LB",WB:"LB"})[a+b];
/* ================= S40 Eskiz defteri (Defterler sekmesi) =================
   Bütün tablolar bölüm bölüm. Boyanan = çerçeveli renkli (galArt), sıradaki = turuncu çerçeveli eskiz, şimdiki bölümün kalanı = soluk eskiz,
   gelecek bölümler = kilitli satır. Açılınca şimdiki bölüme kayar. Tabloya dokun → tablo kartı (Sergide gör). Sıradaki eskiz → oyna kısa yolu. */
export const CNAME={R:"Kırmızı",Y:"Sarı",B:"Mavi",O:"Turuncu",G:"Yeşil",P:"Mor",W:"Beyaz",PK:"Pembe",CR:"Krem",LB:"Açık mavi"};
