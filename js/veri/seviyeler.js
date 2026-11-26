// veri/seviyeler.js · 30 seviye (A5, 26.11.2026). Eğri: A · GDD'ye sadık (07-seviyeler/a5-oneri.html).
// Sv 1–2 (eğitim) ve Sv 11 (Göl evi, bant tanıtımı) el yapımı; diğerleri araclar/seviye-uret.mjs ile üretilir
// (seviye-listesi.js; her tahta çözücüyle denenmiş, hamle sınırı = en kısa çözüm + hamle payı).
// Tablolar A6'ya kadar geçici şablon (art:"sablon", veri/sablon.js); Sv 1, 2, 11 kendi çizimleriyle.
import { MIXBUB } from "../cizim/semboller.js";
import { URETILEN } from "./seviye-listesi.js";
import { sablonCells } from "./sablon.js";
import { TABLOLAR } from "./tablolar.js";

export const LEVELS={
  1:{name:"Seviye 1",ftue:true,art:"meyve",regions:[{id:"meyve",need:"R"}],spot:{meyve:[156,90]},
     start:{tubes:[["R","R"],["R","R"],["B","B"]]},next:2,
     steps:[{target:{tube:0},bubble:"Tüpe dokun",hand:0,expect:{sel:0}},
            {target:{tube:1},bubble:"Üstüne dök",hand:1,expect:{pour:[0,1]}},
            {target:{art:1},bubble:"Tablo boyandı!",expect:{auto:1700}}]},
  2:{name:"Seviye 2",ftue:true,art:"meyve",regions:[{id:"meyve",need:"O"}],spot:{meyve:[156,90]},
     start:{tubes:[["Y"],["R","R"],["Y"]]},next:3,hints:[[1,2],[2,0]],
     steps:[{target:{tube:1},bubble:"Kırmızıyı seç",hand:1,expect:{sel:1}},
            {target:{tube:0},bubble:MIXBUB,hand:0,expect:{pour:[1,0]}},
            {bubbleAt:1,bubble:"Şimdi sen dene",expect:{free:1}}]},
  /* Bant tanıtımı (Göl evi). A5: eski demo tahtası çok tuzaklıydı (ölümcül hamle %44); aynı renklerle en affedici dizilim seçildi
     (%28; bu renk takımında daha azı yok). En kısa çözüm 7 → %40 pay = 10 hamle. */
  11:{name:"Seviye 11",art:"manzara",next:12,reward:20,
     regions:[{id:"gok",need:"B"},{id:"gol",need:"B"},{id:"gunes",need:"O"},{id:"cati",need:"R",tape:"gunes"}],
     spot:{gok:[110,30],gunes:[250,40],gol:[236,140],cati:[77,90]},
     intro:{k:"rule",r:"tape"},
     start:{tubes:[["B","Y","R","B"],["B","B","B","R"],["R","R","R","Y"],["R","B","B","B"],[],[]],moves:10},
     min:7, fatal:.279, solPath:[[3,4],[2,3],[0,4,"gok"],[0,2],[1,0],[0,3],[0,1]]}
};
/* Seviyeye göre açılan booster'lar (GDD bölüm 4): Geri Al Sv 4 (3 bedava, sonra her seviyede 1), Ekstra Tüp Sv 7, Terebentin Sv 15.
   Açıldığı seviyede tanıtım kartı hediye verir; sonraki seviyelerde 1 tane. Kalıcı stok A10'da (kayıt). */
const boosters=lv=>({undo:lv<4?0:lv===4?3:1, extra:lv>7?1:0, turp:lv>15?1:0});
const INTRO={7:{k:"boost",b:"tube",n:2},15:{k:"boost",b:"turp",n:2}};
for(const [k,r] of Object.entries(URETILEN)){ const lv=+k, C=sablonCells(r.regions.length);
  LEVELS[lv]={name:`Seviye ${lv}`,art:"sablon",next:lv+1,hard:lv%10===0,reward:lv%10===0?50:20,
    noLimit:lv<=3, /* GDD: ilk 3 seviyede kaybetme yok (hamle sınırı gizli) */
    regions:r.regions, spot:Object.fromEntries(r.regions.map((g,i)=>[g.id,[C[i].cx,C[i].cy]])),
    ...(INTRO[lv]?{intro:INTRO[lv]}:{}),
    start:{tubes:r.tubes,moves:lv<=3?99:r.moves,...boosters(lv)}, min:r.min, exact:r.exact, fatal:r.fatal, solPath:r.path};
}
LEVELS[11].start={...LEVELS[11].start,...boosters(11)};
/* A6: gerçek tablosu çizilmiş seviyelerde rozet yerleri tablodan gelir (veri/tablolar.js) */
for(const [k,T] of Object.entries(TABLOLAR)) if(LEVELS[k]) Object.assign(LEVELS[k],{art:"guaj",spot:T.spot});
