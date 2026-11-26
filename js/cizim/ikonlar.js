// cizim/ikonlar.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { COL } from "../veri/renkler.js";

export const ICON={
  pause:`<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4.5" height="16" rx="1.5" fill="#fff"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.5" fill="#fff"/></svg>`,
  undo:`<svg viewBox="0 0 24 24"><path d="M9 5L4 10l5 5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10h9a5 5 0 0 1 0 10h-3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
  tube:`<svg viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="20" rx="4" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="2.4"/><path d="M9.3 13h5.4v3.8a2.7 2.7 0 0 1-5.4 0z" fill="#7CF07A"/></svg>`,
  turp:`<svg viewBox="0 0 24 24"><path d="M12 2S5 10.5 5 15a7 7 0 0 0 14 0C19 10.5 12 2 12 2z" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="2.4"/></svg>`,
  ready:`<svg viewBox="0 0 24 24"><path d="M8 7C8 2.5 16 2.5 16 7" fill="none" stroke="#fff" stroke-width="2"/><rect x="4" y="7" width="16" height="15" rx="3" fill="rgba(255,255,255,.35)" stroke="#fff" stroke-width="2.4"/><rect x="5.2" y="12" width="13.6" height="5" fill="#E77B2E"/></svg>`,
  lock:`<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2" fill="#fff"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#fff" stroke-width="3"/></svg>`
};
export const HAND=`<svg viewBox="0 0 34 40" aria-hidden="true"><path d="M12 3c2 0 3 1.5 3 3.5V17l1-.3c0-1.8 1.2-3 2.8-3s2.7 1.2 2.7 3v1c.4-1.4 1.6-2.2 2.9-2.2 1.6 0 2.6 1.2 2.6 3v1.2c.4-1 1.4-1.6 2.4-1.6 1.5 0 2.6 1.3 2.6 3V29c0 5.5-4.4 10-10 10h-3.5c-3.3 0-6.2-1.7-8-4.5L3.6 26.8c-.9-1.4-.5-3.2.9-4s3-.4 3.9.9L9 25V6.5C9 4.5 10 3 12 3z" fill="#fff" stroke="#3D220E" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
export const bdg=n=>n>0?`<span class="badge">${n}</span>`:`<span class="badge plus">+</span>`;
export const COIN=`<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#FFC21A" stroke="#A86A00" stroke-width="2"/><circle cx="12" cy="12" r="6" fill="none" stroke="#FFE27A" stroke-width="2"/></svg>`;
export const XICON=`<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`;
/* S11c: Duraklat (Mola). confirm: null | "exit" | "restart" */
export const QS=[["mus","Müzik",`<svg viewBox="0 0 24 24"><path d="M9 18V5l11-2v13" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="3" fill="#fff"/><circle cx="17.5" cy="16" r="3" fill="#fff"/></svg>`],
  ["snd","Ses",`<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`],
  ["vib","Titreşim",`<svg viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M4 8v8M20 8v8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`]];
export const BOOK=`<svg width="18" height="15" viewBox="0 0 18 15" aria-hidden="true"><path d="M1 2.5c2.6-1.4 5.2-1.4 8 0v11c-2.8-1.4-5.4-1.4-8 0zM17 2.5c-2.6-1.4-5.2-1.4-8 0v11c2.8-1.4 5.4-1.4 8 0z" fill="#FFF3DA" stroke="#8A6A4A" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
/* S12: Kazanma töreni. w = {reward, star, coins, stars (sayaçta görünen), x2: 0 yok | 1 teklif | 2 alındı, anim, ready} */
export const STAR=`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" fill="#FFD43B" stroke="#B07A00" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
export const COINIC=COIN.replace('class="coin"','class="ic"');
export const PLAY=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="4" fill="rgba(255,255,255,.3)" stroke="#fff" stroke-width="2.2"/><path d="M10 8.5v7l6-3.5z" fill="#fff"/></svg>`;
export const SPLAT=c=>`<svg class="splat" viewBox="0 0 26 26" aria-hidden="true"><path d="M13 2 C17 8 22 11 22 16 A9 8.5 0 0 1 4 16 C4 11 9 8 13 2Z" fill="${COL[c]}" stroke="var(--wood-900)" stroke-width="2"/></svg>`;
export const SPLATS=[[38,94,0,-14],[292,96,1,18],[20,352,2,-24],[310,354,3,20]];
/* S14: Kaybedildi. Suçlamasız dil, gerçek ilerleme, bağlama göre tek ipucu; satış ve reklam yok */
export const BULB=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z" fill="#FFD43B" stroke="#8A5E00" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 21h6" stroke="#8A5E00" stroke-width="2" stroke-linecap="round"/></svg>`;
export const RETRY=`<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" fill="none" stroke="#2F6E0E" stroke-width="2.8" stroke-linecap="round"/><path d="M20 4v5h-5" fill="none" stroke="#2F6E0E" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
