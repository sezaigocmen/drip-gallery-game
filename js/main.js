// Giriş noktası: bütün modülleri yükler, ekranı telefona sığdırır, oyunu Seviye 1'den başlatır.
import * as m0 from "./veri/renkler.js";
import * as m1 from "./cizim/semboller.js";
import * as m2 from "./veri/seviyeler.js";
import * as m3 from "./motor/kurallar.js";
import * as m4 from "./cizim/tablo.js";
import * as m5 from "./cizim/tup.js";
import * as m6 from "./cizim/ikonlar.js";
import * as m7 from "./cizim/oyun-ekrani.js";
import * as m8 from "./ekranlar/egitim.js";
import * as m9 from "./cizim/mekanlar.js";
import * as m10 from "./cizim/ressam.js";
import * as m11 from "./ekranlar/sergi.js";
import * as m12 from "./ekranlar/bolum-sonu.js";
import * as m13 from "./ekranlar/siradaki-bolum.js";
import * as m14 from "./ekranlar/ayarlar.js";
import * as m15 from "./ekranlar/ressam-secimi.js";
import * as m16 from "./ekranlar/defterler.js";
import * as m17 from "./ekranlar/renk-defteri.js";
import * as m18 from "./ekranlar/magaza.js";
import * as m19 from "./akis.js";
import * as m20 from "./ses.js";
import * as m21 from "./kayit.js";
import { live, load, rmUygula } from "./akis.js";
import { ayarYukle, sesBaslat } from "./ses.js";
import { makeState } from "./motor/kurallar.js";
import { acilisGoster } from "./ekranlar/acilis.js";
import { kayittanBasla } from "./kayit.js";

/* Test ve hata ayıklama: konsoldan DG.live, DG.load(...) gibi erişim. Oyuncu bunu görmez. */
const MODS = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19, m20, m21];
window.DG = new Proxy({}, { get: (_, k) => { for (const m of MODS) if (k in m) return m[k]; } }); /* canlı: değişen değerler (busy gibi) her okumada güncel */

/* Ölçekleme: 360 × 640 ekran, oranı korunarak pencereye sığdırılır (telefonda kenardan kenara) */
function fit() {
  const w = document.getElementById("stagewrap"), dv = document.getElementById("device"), sc = live.el, narrow = innerWidth <= 760, pad = narrow ? 0 : 10, m = narrow ? 0 : 28;
  const k = Math.min((w.clientWidth - m * 2 - pad * 2) / 360, (w.clientHeight - m * 2 - pad * 2) / 640);
  sc.style.transform = `scale(${k})`; dv.style.width = (360 * k + pad * 2) + "px"; dv.style.height = (640 * k + pad * 2) + "px";
}
addEventListener("resize", fit); fit();
ayarYukle(live.set); sesBaslat(); /* A8: ayarlar hatırlanır, sesler yüklenir (ilk dokunuşta açılır) */
rmUygula(); /* A9: kayıtlı "Hareketleri azalt" hemen geçerli */
kayittanBasla(); /* A10: kayıt varsa Sergi'den (eğitimdeyse o seviyeden), yoksa Sv 1 */
acilisGoster(); /* A7.4: logolu açılış ekranı (~1,8 sn, dokununca geçer) */
/* A10 · 2 PWA: internetsiz açılma (sw.js). Sadece güvenli adreste (https/localhost) ve geliştirme parametresi yokken. */
if ("serviceWorker" in navigator && isSecureContext && !location.search)
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
