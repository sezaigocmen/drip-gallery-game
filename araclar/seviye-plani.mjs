// araclar/seviye-plani.mjs · A5 seviye planı: A · GDD'ye sadık eğri (Sezai onayı 26.11.2026, 07-seviyeler/a5-oneri.html).
// Sv 1, 2 (eğitim) ve 11 (Göl evi, bant tanıtımı) el yapımı, planda yok.
/* [bölge, karışım (ara renk bölgesi), açık ton bölgesi, bant, boş tüp, hamle payı % (null = gizli), tür, not] */
export const PLAN = {
  3: [2, 2, 0, 0, 2, null, "yeni", "Yeşil ve mor"],
  4: [3, 1, 0, 0, 2, 40, "zirve", "Hamle sayacı + Geri Al görünür"],
  5: [3, 1, 0, 0, 2, 40, "nefes", ""],
  6: [3, 2, 0, 0, 2, 35, "", ""],
  7: [4, 2, 0, 0, 2, 35, "", "Ekstra Tüp açılır"],
  8: [4, 2, 0, 0, 2, 30, "", ""],
  9: [4, 3, 0, 0, 2, 25, "zirve", "Renkler dağınık"],
  10: [5, 3, 0, 0, 2, 20, "zor", ""],
  /* 11: el yapımı (Göl evi, bant tanıtımı) */
  12: [4, 2, 0, 1, 2, 35, "", "Mağaza açılır"],
  13: [4, 2, 0, 1, 2, 30, "", ""],
  14: [5, 3, 0, 2, 2, 25, "zirve", ""],
  15: [4, 2, 0, 1, 2, 40, "nefes", "Terebentin açılır"],
  16: [4, 2, 0, 2, 2, 35, "yeni", "Raf dolabilir"],
  17: [5, 3, 0, 2, 2, 30, "", ""],
  18: [5, 3, 0, 2, 2, 30, "", "Sanat Fuarı açılır"],
  19: [5, 4, 0, 2, 1, 20, "zirve", ""],
  20: [6, 4, 0, 2, 1, 15, "zor", "Hazır Kutu açılır"],
  21: [4, 1, 1, 0, 2, 40, "yeni", "Beyaz boya: açık ton"],
  22: [5, 2, 1, 1, 2, 35, "", ""],
  23: [5, 2, 2, 1, 2, 30, "", ""],
  24: [5, 3, 2, 2, 1, 25, "zirve", ""],
  25: [5, 2, 1, 1, 2, 40, "nefes", ""],
  26: [5, 3, 2, 2, 2, 30, "", "Hepsi birlikte"],
  27: [6, 3, 2, 2, 2, 30, "", ""],
  28: [6, 4, 2, 2, 1, 25, "", ""],
  29: [6, 3, 3, 3, 1, 20, "zirve", ""],
  30: [6, 3, 3, 3, 1, 15, "zor", "Final"]
};

/* eğrideki yer → hedef "ölümcül hamle oranı" (hamlelerin yüzde kaçı tahtayı çözülemez yapar).
   Taban Sv 3'te %12, Sv 30'da %32'ye çıkar; yeni mekanik ve nefes seviyeleri tabanın altında, zirve ve zor üstünde (testere dişi). */
const OFFSET = { yeni: -.07, nefes: -.07, "": 0, zirve: .07, zor: .12 };
export const targetFatal = lv => +(.12 + .20 * (lv - 3) / 27 + OFFSET[PLAN[lv][6]]).toFixed(3);
