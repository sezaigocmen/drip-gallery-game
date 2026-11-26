// cizim/semboller.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { INK, PARTS, SHAPE } from "../veri/renkler.js";

export const symW=c=>PARTS[c].length*10+(PARTS[c].length-1)*3;
export const symG=(c,fill)=>`<g fill="${fill}">${PARTS[c].map((k,i)=>`<g transform="translate(${i*13} 0)">${SHAPE[k]}</g>`).join("")}</g>`;
export const symSVG=(c,fill,h=10)=>`<svg width="${symW(c)*h/10}" height="${h}" viewBox="0 0 ${symW(c)} 10" aria-hidden="true">${symG(c,fill)}</svg>`;
export const MIXBUB=`${symSVG("R",INK.R,15)}<span>+</span>${symSVG("Y",INK.Y,15)}<span>=</span>${symSVG("O",INK.O,15)}`;

