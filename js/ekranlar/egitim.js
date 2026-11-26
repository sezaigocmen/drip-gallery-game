// ekranlar/egitim.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { HAND } from "../cizim/ikonlar.js";
import { preview } from "../motor/kurallar.js";
import { LEVELS } from "../veri/seviyeler.js";

/* ================= Eğitim katmanı (S11t) ================= */
export function rel(el,root){const a=root.getBoundingClientRect(),b=el.getBoundingClientRect(),k=a.width/root.offsetWidth||1;return {x:(b.left-a.left)/k,y:(b.top-a.top)/k,w:b.width/k,h:b.height/k};}
export function hintTube(s,sel){const L=LEVELS[s.lv];
  for(const [a,b] of L.hints||[]){ if(preview(s,a,b)&&(sel==null||sel===a)) return sel===a?b:a; } return null;}
/* Bir ekran durumu için koç katmanının tarifi */
export function coachSpec(s,ui,stepIdx,showHint){
  const L=LEVELS[s.lv]; if(!L.ftue) return null;
  const st=L.steps[stepIdx];
  const hint=showHint?hintTube(s,ui.sel):null;
  if(st&&!st.expect.free) return {target:st.target,bubble:st.bubble,hand:st.hand};
  if(st&&st.expect.free) return {bubble:st.bubble,bubbleAt:st.bubbleAt,hand:hint,faint:true};
  if(hint!=null) return {hand:hint,faint:true};
  return null;
}
export function guidedUI(s,ui,stepIdx){const st=(LEVELS[s.lv].steps||[])[stepIdx]; return (st&&st.expect.pour)?{...ui,onlyGhost:st.expect.pour[1]}:ui;}
export function addCoach(root,spec){
  if(!spec) return;
  const G=root.querySelectorAll(".glass"), R=el=>rel(el,root);
  let tr=null,kind=null;
  if(spec.target&&spec.target.tube!=null){tr=R(G[spec.target.tube]);kind="tube";}
  else if(spec.target&&spec.target.art){tr=R(root.querySelector(".frame"));kind="art";}
  const box=document.createElement("div"); box.className="coach"; let h="";
  if(tr){const p=kind==="tube"?5:4; h+=`<div class="spot${kind==="tube"?" tube":""}" style="left:${tr.x-p}px;top:${tr.y-p}px;width:${tr.w+p*2}px;height:${tr.h+p*2}px"></div>`;}
  if(spec.bubble){
    let bx,by,below=false;
    if(kind==="art"){bx=tr.x+tr.w/2;by=tr.y+tr.h+16;below=true;}
    else {const gi=spec.target&&spec.target.tube!=null?spec.target.tube:spec.bubbleAt; const g=G[gi], r=R(g); bx=r.x+r.w/2; by=r.y-(g.querySelector(".mixplus")?44:16);}
    h+=`<div class="cbub${below?" below":""}" style="left:${bx}px;top:${by}px">${spec.bubble}</div>`;
  }
  if(spec.hand!=null){const r=R(G[spec.hand]); h+=`<div class="chand${spec.faint?" faint":""}" style="left:${r.x+r.w-16}px;top:${r.y+r.h-44}px">${HAND}</div>`;}
  box.innerHTML=h; root.appendChild(box);
  const b=box.querySelector(".cbub"); if(b){const w=b.offsetWidth/2+8, W=root.offsetWidth; b.style.left=Math.max(w,Math.min(W-w,parseFloat(b.style.left)))+"px";}
}

