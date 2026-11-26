// ekranlar/acilis.js · Drip Gallery · açılış ekranı (A7.4 · 4 A "Damlalar akar", 26.11.2026)
// Oyun açılırken bir kez: logo gelir, damlalar akar, GALLERY levhası yaylanır, dört renkli çubuk dolar (~1,8 sn), sonra söner.
// Dokununca hemen geçer. Hareketleri azalt açıkken hareket yok: logo tam hâliyle 0,8 sn görünür, solmadan kalkar.
// Oyun ekranının (live.el) kardeşi olarak durur; draw() ekranı yeniden çizse de silinmez. Adres satırında parametre varsa
// (?mekan1 gibi geliştirme/öneri adresleri) gösterilmez.
import { logoCiz, fontlarHazir } from "../cizim/marka.js";
import { live, RM } from "../akis.js";

export function acilisGoster() {
  if (location.search) return null;
  const sc = live.el, d = document.createElement("div");
  d.className = "acilis"; d.setAttribute("role", "img"); d.setAttribute("aria-label", "Drip Gallery");
  d.innerHTML = `<svg class="lg"></svg><div class="yuk" aria-hidden="true"><i></i></div>`;
  const yerlestir = () => Object.assign(d.style, { left: sc.offsetLeft + "px", top: sc.offsetTop + "px", width: sc.offsetWidth + "px", height: sc.offsetHeight + "px",
    transform: sc.style.transform || "none", borderRadius: getComputedStyle(sc).borderRadius });
  sc.parentNode.appendChild(d); yerlestir(); addEventListener("resize", yerlestir);
  let bitti = false;
  const kapat = () => { if (bitti) return; bitti = true; removeEventListener("resize", yerlestir);
    if (RM) { d.remove(); return; } d.classList.add("cik"); setTimeout(() => d.remove(), 350); };
  d.addEventListener("click", kapat);
  /* yazı tipi gelmeden harfler ölçülemez; en fazla 1,5 sn beklenir */
  Promise.race([fontlarHazir(), new Promise(r => setTimeout(r, 1500))]).then(() => {
    if (bitti) return; logoCiz(d.querySelector("svg.lg"));
    requestAnimationFrame(() => d.classList.add("go")); setTimeout(kapat, RM ? 800 : 1800); });
  return d;
}
