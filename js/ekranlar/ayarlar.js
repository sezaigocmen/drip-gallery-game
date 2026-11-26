// ekranlar/ayarlar.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { live, rmUygula, startLevel, toast } from "../akis.js";
import { QS, XICON } from "../cizim/ikonlar.js";
import { VENUES } from "../cizim/mekanlar.js";
import { lookIdx, lookOf, ressamSVG } from "../cizim/ressam.js";
import { stActive, stHrs } from "./magaza.js";
import { ayarDegisti } from "../ses.js";

/* ================= S50 Ayarlar (Öneri 11 · A, Sezai onayı) =================
   Sergi ve Defterler HUD'undaki dişliden açılır. Popup/Default. Üstte S11c ile AYNI hızlı ayarlar (live.set, tek kaynak),
   Hareketleri azalt, Görünüm, Yardım/Gizlilik (bilgi kartı), kesik çizgili DEMO kutusu (paket sayacı + 1 gün ileri sar, her şeyi sıfırla),
   sürüm satırı. Anında kaydolur, Kaydet yok. Semboller ayarı yok (her zaman açık). Sıfırla onayı S11c kalıbı. */
/* A7.3 (26.11.2026, Sezai: DEMO işaretleri kalır · A): Sanat Fuarı plandan çıktığı için fuar sayacı kalktı; DEMO kutusunda sadece
   Başlangıç paketi sayacı (açıksa, "1 gün ileri sar" ile) ve "Her şeyi sıfırla". Dil satırı kalktı (çeviri planda yok).
   Yardım ve Gizlilik küçük bilgi kartı açar (info: "help" | "privacy"). Sürüm satırı: "Sürüm 0.1 · Portfolyo sürümü". */
const INFO={
  help:["Nasıl oynanır",`<p>Bir tüpe dokun, sonra dökeceğin tüpe dokun.</p><p class="sm">Boya aynı rengin üstüne ya da boş tüpe dökülür; iki ana renk üst üste gelince karışır.</p><p class="sm">Tüp tek renkle dolunca boya kutusu tabloya uçar ve bölgeyi boyar. Tabloyu bitir, Sergi'ye as.</p>`],
  privacy:["Gizlilik",`<p>Oyun kişisel veri toplamaz ve hiçbir yere göndermez.</p><p class="sm">İlerlemen ve ayarların yalnızca bu cihazda, bu tarayıcıda saklanır; tarayıcı verilerini silersen ilerleme de silinir. Reklam ve ödeme ekranları örnektir: gerçek reklam gösterilmez, ödeme alınmaz.</p>`]};
export function settingsHTML(G,set,confirm,info){
  const sign=t=>`<div class="sign size-l stroke"><span class="nail"></span>${t}<span class="nail"></span></div>`;
  if(info&&INFO[info]) return `<div class="galsub"><div class="scrim" data-act="sback"></div><div class="popup panel s50 s50c">${sign(INFO[info][0])}
    <div class="body s50i">${INFO[info][1]}</div>
    <button class="btn primary size-l" type="button" data-act="sback">Tamam</button></div></div>`;
  if(confirm) return `<div class="galsub"><div class="scrim"></div><div class="popup panel s50 s50c">${sign("Her şey silinsin mi?")}
    <div class="body"><p>Tablolar, coin, yıldız ve dekor silinir.</p><p class="sm">Seviye 1’den, ilk açılış gibi başlarsın.</p></div>
    <button class="btn primary size-l" type="button" data-act="sback">Vazgeç</button>
    <button class="btn-text red" type="button" data-act="sdoreset">Yine de sıfırla</button></div></div>`;
  const toggles=`<div class="qset">${QS.map(([k,t,ic])=>`<div class="q"><button class="btn secondary icon${set[k]?"":" off"}" type="button" data-act="sqs" data-k="${k}" aria-pressed="${set[k]}" aria-label="${t}">${ic}</button><span>${t}</span></div>`).join("")}</div>`;
  const stOn=live.st&&live.st.t0!=null&&stActive();
  const fair=stOn?`<div class="s50f"><span>Başlangıç paketi</span><b>${stHrs()} sa kaldı</b></div><button class="btn secondary size-s" type="button" data-act="sday">1 gün ileri sar</button>`:"";
  return `<div class="galsub"><div class="scrim" data-act="setclose"></div><div class="popup panel s50">${sign("Ayarlar")}
    <button class="btn danger icon close" type="button" data-act="setclose" aria-label="Kapat">${XICON}</button>
    <div class="body">${toggles}<div class="pz-hr"></div>
      <div class="s50r"><span>Hareketleri azalt<small>Uçuşlar ve parlamalar sadeleşir</small></span><button class="sw${set.rm?" on":""}" type="button" role="switch" aria-checked="${!!set.rm}" aria-label="Hareketleri azalt" data-act="srm"></button></div>
      <div class="s50r"><span>Görünüm<small>Ressam · bedava</small></span><button class="s50lang s06set" type="button" data-act="slook" aria-label="Görünümü değiştir"><i class="mini">${ressamSVG(lookOf(G).k,(VENUES[G.v||0]||VENUES[0]).ch||0,lookOf(G).vi,"face")}</i>Değiştir</button></div></div>
    <div class="pz-row"><button class="btn secondary size-s" type="button" data-act="shelp">Yardım</button><button class="btn secondary size-s" type="button" data-act="sprivacy">Gizlilik</button></div>
    <div class="s50demo"><span class="dt">DEMO</span>${fair}<button class="btn-text red" type="button" data-act="sreset">Her şeyi sıfırla</button></div>
    <p class="s50v">Sürüm 0.1 · Portfolyo sürümü</p></div></div>`;}
export function s50Click(pa,act,g){
  switch(pa){
    case "sqs": {const k=act.dataset.k; live.set[k]=!live.set[k]; ayarDegisti(); break;}
    case "srm": live.set.rm=!live.set.rm; ayarDegisti(); rmUygula(); toast(live.set.rm?"Hareketler sadeleşti":"Hareketler normal"); break;
    case "shelp": g.sub={k:"s50",info:"help"}; break;
    case "sprivacy": g.sub={k:"s50",info:"privacy"}; break;
    case "sday": { if(live.st) live.st.clk+=864e5; /* Başlangıç paketi sayacı 1 gün ilerler */
      toast(live.st&&live.st.t0!=null&&!stActive()&&!live.st.bought?"Zaman 1 gün ileri alındı · Başlangıç paketi kalktı":"Zaman 1 gün ileri alındı",2600); break;}
    case "slook": {const i=lookIdx(lookOf(live.G)); g.sub={k:"s06",set:1,sel:i,used:i}; break;}
    case "sreset": g.sub={k:"s50",confirm:1}; break;
    case "sback": g.sub={k:"s50"}; break;
    case "setclose": g.sub=null; break;
    case "sdoreset": live.G=null; live.gal=null; live.st=null; live.shop=null; live.seen={}; live.rkSeen=undefined; live.bkSeen=undefined; live.bkLast=undefined; live.wonArt=undefined;
      startLevel(1); toast("Her şey sıfırlandı · Seviye 1",2600); return true;
    default: return false; }
  return true;}
export const G_LAST=()=>live.G.v>=VENUES.length-1;
