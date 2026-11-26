// motor/kurallar.js · Drip Gallery (ilk hâli A4'te wireframe prototipinden ayrıldı, 26.11.2026)
import { CAP, PARTS, MIXER, mixOf } from "../veri/renkler.js";
import { LEVELS } from "../veri/seviyeler.js";

export const clone=s=>JSON.parse(JSON.stringify(s));
export function makeState(lv){const S=LEVELS[lv].start;return {lv,tubes:clone(S.tubes),painted:{},shelf:[],moves:S.moves??99,undo:S.undo??0,extra:S.extra??0,turp:S.turp??0,coins:S.coins??0,ready:S.ready??0,stars:S.stars??0,cont:0};}
export const RG=s=>LEVELS[s.lv].regions;
export const isOpen=(s,r)=>!s.painted[r.id]&&(!r.tape||s.painted[r.tape]);

export function preview(s,a,b){
  const src=s.tubes[a],dst=s.tubes[b];
  if(a===b||!src||!dst||!src.length||dst.length>=CAP) return null;
  const c=src[src.length-1]; let n=0; for(let i=src.length-1;i>=0&&src[i]===c;i--) n++;
  const top=dst[dst.length-1];
  if(!dst.length||top===c){const k=Math.min(n,CAP-dst.length);return {base:dst.slice(),ghost:Array(k).fill(c),take:k,mix:null};}
  if(MIXER.has(c)&&MIXER.has(top)){const m=mixOf(c,top); if(m) return {base:dst.slice(0,-1),ghost:[m,m],take:1,mix:m};}
  return null;
}
export function paint(s,id,ev){
  const REG=RG(s); s.painted[id]=true; ev.painted.push(id);
  REG.forEach(r=>{if(r.tape===id) ev.untaped.push(r.id);});
  let moved=true;
  while(moved){moved=false;
    for(let i=0;i<s.shelf.length;i++){const t=REG.find(r=>isOpen(s,r)&&r.need===s.shelf[i]);
      if(t){s.shelf.splice(i,1);s.painted[t.id]=true;ev.painted.push(t.id);moved=true;break;}}
  }
}
export function pour(s0,a,b){
  const p=preview(s0,a,b); if(!p) return null;
  const s=clone(s0); const ev={painted:[],untaped:[],mix:p.mix,shelf:false,shelfFull:false,flash:null,choice:null};
  for(let i=0;i<p.take;i++) s.tubes[a].pop();
  s.tubes[b]=p.base.concat(p.ghost); s.moves--;
  settle(s,b,ev); return {s,ev};
}
export function settle(s,b,ev){
  const t=s.tubes[b], REG=RG(s);
  if(t.length!==CAP||!t.every(x=>x===t[0])) return;
  const c=t[0], open=REG.filter(r=>isOpen(s,r)&&r.need===c);
  if(open.length===1){s.tubes[b]=[];ev.flash=b;paint(s,open[0].id,ev);}
  else if(open.length>1){ev.choice={tube:b,color:c,options:open.map(r=>r.id)};}
  else if(REG.some(r=>!s.painted[r.id]&&r.need===c)){
    if(s.shelf.length<2){s.tubes[b]=[];s.shelf.push(c);ev.shelf=true;ev.flash=b;} else ev.shelfFull=true;
  }
}
export const won=s=>RG(s).every(r=>s.painted[r.id]);
/* Terebentin: en üstteki 2 katman ara renk → ana renklerine ayrılır (●▲ sırası: alt kırmızı, üst sarı) */
export const SEC=new Set(["O","G","P"]);
export function splitPreview(s,i){const t=s.tubes[i]; if(!t||t.length<2) return null; const c=t[t.length-1];
  if(!SEC.has(c)||t[t.length-2]!==c) return null; return {base:t.slice(0,-2),ghost:PARTS[c].slice()};}
export const aimTargets=s=>s.tubes.map((t,i)=>splitPreview(s,i)?i:-1).filter(i=>i>=0);

