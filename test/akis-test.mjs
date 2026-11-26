// Akış testi (başsız Chrome). Oyunu gerçek dokunuşlarla oynar, her adımı ✓/✗ yazar, ekran görüntülerini test/cikti/ klasörüne koyar.
// Kullanım (oyun klasöründen): node test/akis-test.mjs
// Kapsam: açılış, FTUE Seviye 1–2, yeni renk kartı, Seviye 12 kural kartı, kazanma → Sergi, kaybetme (S13 → S14 → S10),
//         Sergi + Defterler, Mağaza satın alma, C paleti + rozet kuralı, JS hatası yok.
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "../araclar/sunucu.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
/* Herkese açık depoda müzik dosyaları yok (Pixabay lisansı): o zaman müzik kontrolleri atlanır. */
const MUZIK_YOK = !existsSync(join(ROOT, "ses", "muzik-oyun.aac"));
const OUT = join(ROOT, "test", "cikti"); mkdirSync(OUT, { recursive: true });
const PORT = 5199, DBG = 9343;
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(existsSync);
if (!CHROME) { console.error("Chrome bulunamadı"); process.exit(2); }

const server = await startServer(PORT);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${DBG}`, `--user-data-dir=${join(process.env.TEMP || ROOT, "drip-akistest-profile")}`,
  "--hide-scrollbars", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json()).find(x => x.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(200); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map(), errs = [];
ws.addEventListener("message", e => { const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
  else if (m.method === "Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errs.push(m.params.args.map(a => a.value ?? a.description).join(" "));
  else if (m.method === "Log.entryAdded" && m.params.entry.level === "error" && !/fonts\.g/.test(m.params.entry.url || "") && !(MUZIK_YOK && /\/ses\/muzik-/.test(m.params.entry.url || ""))) errs.push(m.params.entry.text + " " + (m.params.entry.url || "")); });
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = await send("Runtime.evaluate", { expression: `(async()=>{${H}${x}})()`, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };

/* Sayfa içi yardımcılar: L = oyun durumu, C(seçici) = dokun, T(i) = i. tüpe dokun, U(koşul) = koşul gerçekleşene kadar bekle */
const H = `const L=DG.live, W=ms=>new Promise(r=>setTimeout(r,ms));
const U=async(f,ms=6000)=>{const t=Date.now(); while(Date.now()-t<ms){ try{ if(f()) return true; }catch(e){} await W(60);} return false;};
const C=async(sel)=>{ if(!await U(()=>L.el.querySelector(sel),3000)) throw new Error("bulunamadı: "+sel); L.el.querySelector(sel).click(); await W(150); };
const T=async i=>{ await U(()=>!DG.busy,4000); await C('[data-t="'+i+'"]'); };
`;
const results = []; let fails = 0;
const ok = async (name, fn) => { let r, info = ""; try { r = await fn(); } catch (e) { r = false; info = e.message.split("\n")[0]; }
  if (!r) fails++; results.push(`${r ? "✓" : "✗"} ${name}${info ? " · " + info : ""}`); console.log(results.at(-1)); };
const shot = async name => { const p = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(OUT, `${name}.png`), Buffer.from(p.data, "base64")); };

await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 693, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
for (let i = 0; i < 50; i++) { if (await send("Runtime.evaluate", { expression: "!!window.DG", returnByValue: true }).then(r => r.result.value)) break; await sleep(100); }
/* A10: önceki çalıştırmanın kaydı silinir, oyun sıfırdan açılır */
await send("Runtime.evaluate", { expression: "localStorage.removeItem('dg-kayit')" }); await send("Page.reload"); await sleep(300);
for (let i = 0; i < 50; i++) { if (await send("Runtime.evaluate", { expression: "!!window.DG", returnByValue: true }).then(r => r.result.value)) break; await sleep(100); }
await sleep(400);

// 0) Açılış ekranı (A7.4)
await ok("Açılış ekranı: logo + damlalar görünür, ~2 sn içinde kendiliğinden kalkar", () => ev(`const a=document.querySelector(".acilis"); if(!a) return false;
  const d=await U(()=>a.querySelectorAll(".drip").length===16,3000); return d && await U(()=>!a.isConnected,5000);`));

// 1) Açılış
await ok("Açılış: Seviye 1, 3 tüp, eğitim balonu", () => ev(`return L.s.lv===1 && L.el.querySelectorAll('[data-t]').length===3 && !!L.el.querySelector('.coach');`));
await shot("01-acilis");

// 2) FTUE Seviye 1: elin gösterdiğini yap
await ok("Sv 1: yanlış tüpe dokunmak cezasız (adım ilerlemez)", () => ev(`await T(2); return L.step===0 && L.ui.sel==null;`));
await ok("Sv 1: tüp 1'i seç, tüp 2'ye dök → tablo boyanır", () => ev(`await T(0); await T(1); return await U(()=>L.s.painted.meyve);`));
await ok("Sv 1: kazanma töreni → Devam → Seviye 2", () => ev(`await U(()=>L.win&&L.win.ready,9000); await C('[data-act=wnext]'); return await U(()=>L.s.lv===2&&!L.win);`));
await shot("02-sv2-baslangic");

// 3) FTUE Seviye 2: ilk karışım → Yeni renk kartı → serbest bölüm
await ok("Sv 2: kırmızıyı sarıya dök → turuncu, Yeni renk kartı", () => ev(`await T(1); await T(0); return await U(()=>L.newc&&L.newc.k==="color"&&L.newc.c==="O");`));
await shot("03-yeni-renk-karti");
await ok("Sv 2: Harika! → kart kapanır, 'Şimdi sen dene'", () => ev(`await U(()=>L.newc&&L.newc.ready,3000); await C('[data-act=newok]'); return await U(()=>!L.newc&&L.mode!=="popup");`));
await ok("Sv 2: kendin çöz (2 hamle) → kazan → Seviye 3 (hamle sayacı gizli)", () => ev(`await U(()=>!DG.busy,4000); await W(300);
  await T(1); await T(2); await U(()=>!DG.busy,4000); await T(2); await T(0);
  await U(()=>L.win&&L.win.ready,9000); await C('[data-act=wnext]'); return await U(()=>L.s.lv===3&&!L.win) && !L.el.querySelector('.movebox');`));
await shot("04-sv3");
await ok("Sv 3: ilk yeşil ya da mor karışım → Yeni renk kartı", () => ev(`for(const [a,b] of DG.LEVELS[3].solPath){ await T(a); await T(b); await U(()=>!DG.busy,4000); if(L.newc) break; }
  return await U(()=>L.newc&&L.newc.k==="color"&&["G","P"].includes(L.newc.c));`));
await shot("04b-sv3-yeni-renk");
await ok("Sv 11: Bant kuralı kartı → Anladım → tahta, 10 hamle", () => ev(`L.newc=null; DG.startLevel(11); if(!await U(()=>L.newc&&L.newc.k==="rule")) throw new Error("kart yok");
  await U(()=>L.newc&&L.newc.ready,3000); await C('[data-act=newok]'); return await U(()=>!L.newc&&L.s.moves===10);`));
await shot("05-sv11-tahta");

// 4) Kazanma → Sergi
await ok("Kazanma: son kırmızıyı dök → Sv 11 töreni → Devam → Sergi", () => ev(`
  DG.load({...DG.clone(DG.makeState(11)),tubes:[["R","R","R"],["R"],[],[],[],[]],painted:{gok:true,gol:true,gunes:true},moves:4,seenOrange:true}); await W(200);
  await T(1); await T(0); if(!await U(()=>L.win&&L.win.ready,9000)) throw new Error("tören bitmedi");
  const coin=!!L.el.querySelector('[data-act=wnext]'); await C('[data-act=wnext]'); return coin && await U(()=>!!L.gal&&!!L.el.querySelector('.gal'),5000);`));
await shot("06-sergi");

// 5) Kaybetme: S13 teklif → Vazgeç → S14 → Tekrar dene (Sv 11: Hazır Kutu henüz yok → doğrudan tahta) · Zor seviye 20: S10 → Oyna
await ok("Kaybetme: son hamle → S13 devam teklifi", () => ev(`
  DG.load({...DG.clone(DG.makeState(11)),tubes:[["R","R"],["B","R"],["R"],[],[],[]],painted:{gok:true,gol:true,gunes:true},moves:1,coins:360,stars:11,seenOrange:true}); await W(200);
  await T(1); await T(3); return await U(()=>L.offer&&L.offer.ready,6000) && !!L.el.querySelector('[data-act=ogive]');`));
await shot("07-s13-teklif");
await ok("S13 Vazgeç → S14 Kaybedildi", () => ev(`await C('[data-act=ogive]'); return await U(()=>L.lose&&L.lose.ready,6000) && !!L.el.querySelector('[data-act=lretry]');`));
await shot("08-s14-kaybedildi");
await ok("S14 Tekrar dene → Sv 11 tahtası baştan, 10 hamle", () => ev(`await C('[data-act=lretry]'); return await U(()=>!L.pre&&!L.lose&&L.mode==="idle"&&L.s.lv===11&&L.s.moves===10);`));
await ok("Zor seviye 20 → S10 seviye öncesi → Oyna → tahta", () => ev(`DG.startLevel(20,{keep:1}); if(!await U(()=>L.pre&&L.el.querySelector('[data-act=preplay]'))) throw new Error("S10 yok");
  await C('[data-act=preplay]'); return await U(()=>!L.pre&&L.mode==="idle"&&L.s.lv===20&&L.s.moves===DG.LEVELS[20].start.moves);`));

// 6) Sergi + Defterler
await ok("Sergi → Defterler → Renk defteri (palet + şerit)", () => ev(`L.st=null; L.shop=null; L.G=null; DG.ensureLevel(18); DG.load(DG.carry(18)); DG.goGallery(); await U(()=>L.el.querySelector('.gal'));
  L.bkLast=null; await C('.nav [data-act=gbook]'); /* defter son sekmede ya da yenilik varsa Renk'te açılır; ikisi de doğru */
  const eskiz=await U(()=>L.el.querySelector('[data-act=bkrenk], [data-act=bkeskiz]'));
  if(L.el.querySelector('[data-act=bkrenk]')) await C('[data-act=bkrenk]'); await W(300);
  const r={eskiz, tonlar:/Tonlar/.test(L.el.textContent), palet:!!L.el.querySelector('.rkpal, .rkstrip')};
  if(!(r.eskiz&&r.tonlar&&r.palet)) throw new Error(JSON.stringify(r)); return true;`));
await shot("09-renk-defteri");

// 7) Mağaza: Sergi → Mağaza → Orta paket → Onayla → Topla
await ok("Mağaza: Orta paket satın al → +1.000 coin", () => ev(`L.st=null; L.shop=null; L.G=null; DG.ensureLevel(13); DG.load({...DG.carry(13),coins:310}); DG.goGallery(); await U(()=>L.el.querySelector('.gal'));
  await C('.nav [data-act=gshop]'); if(!await U(()=>L.shop&&L.shop.v==="full")) throw new Error("mağaza açılmadı");
  await C('.mglayer .sp-card [data-k=m]'); await C('.s22sys [data-act=mgok]'); await U(()=>L.el.querySelector('.s22rw [data-act=mgtopla]'),3000);
  await C('.s22rw [data-act=mgtopla]'); return await U(()=>L.s.coins===1310);`));
await shot("10-magaza");

// 8) C paleti ve rozet kuralı
await ok("C paleti: 10 renk A2 kararıyla aynı", () => ev(`const want={R:"#D9472F",Y:"#EDB83A",B:"#2E64B0",O:"#E77B2E",G:"#4E9A4A",P:"#7D4FA6",W:"#F6F1E6",PK:"#E99AAE",CR:"#F1D98E",LB:"#93B9DE"};
  return Object.keys(want).every(k=>DG.COL[k]===want[k]) && Object.keys(DG.COL).length===10;`));
await ok("Rozet kuralı: sembol ve çizgi bölge renginde, açık renklerde koyu ton", () => ev(`
  return ["R","Y","B","O","G","P","W","PK","CR","LB"].every(c=>{const b=DG.badge(0,0,c), col=DG.ROZET[c];
    return b.split(col).length>=3 && (["Y","CR","W","LB","PK"].includes(c) ? col!==DG.COL[c] : col===DG.COL[c]);});`));

// 9) A8 sesler
await ok("A8 sesler oyun anlarına bağlı (seç, dök, tüp tamam, boya, kazan, kaybet, pop-up, düğme, coin)", () => ev(`const want=["tup-sec","dokme","tup-tamam","boyama","kazanma","kaybetme","popup-ac","popup-kapa","dugme","coin-ucus","~kazanma"];
  const miss=want.filter(k=>!DG.sesGoruldu.has(k)); if(miss.length) throw new Error("eksik: "+miss.join(", ")+" · görülen: "+[...DG.sesGoruldu].join(" ")); return true;`));
await ok("A8 ses dosyaları: hepsi yükleniyor ve çözülüyor", () => ev(`const SL=(await import("./js/veri/ses-listesi.js")).SESLER, ks=Object.keys(SL); if(ks.length<20) throw new Error("liste kısa: "+ks.length);
  for(const k of ks){ if(${MUZIK_YOK} && k.startsWith("muzik-")) continue; const b=await (await fetch("ses/"+k+".aac")).arrayBuffer(); const d=await new OfflineAudioContext(1,44100,44100).decodeAudioData(b); if(Math.abs(d.duration-SL[k].d)>.15) throw new Error(k+" süre "+d.duration); } return true;`));
await ok("A8 Ayarlar: Müzik/Ses/Titreşim kaydedilir", () => ev(`const S=L.set; S.mus=false; S.vib=false; DG.ayarDegisti(); const v=JSON.parse(localStorage.getItem("dg-ayar"));
  const ok1=v.mus===false&&v.vib===false&&v.snd===true; const o={}; DG.ayarYukle(o); S.mus=true; S.vib=true; DG.ayarDegisti(); DG.ayarYukle(S); return ok1&&o.mus===false&&o.vib===false;`));
/* A9: efektler oyun anlarına bağlı; oyundaki "Hareketleri azalt" anahtarı hepsini kapatır */
const A9 = `const n=()=>document.querySelectorAll(".fxkat .pfx i").length, tepe=async ms=>{let m=0; const t=Date.now(); while(Date.now()-t<ms){ m=Math.max(m,n()); await W(25);} return m;};
  L.shop=null; DG.load(DG.makeState(11)); await W(300); if(L.newc){ /* önceki testten Mağaza katmanı açık kalmış olabilir */ await U(()=>L.newc&&L.newc.ready,3000); await C('[data-act="newok"]'); }
  await T(3); await T(4); const dok=await tepe(900);
  DG.openWin(); const kaz=await tepe(1800); DG.finishWin();`;
await ok("A9 efektler: dökme damlası, kazanma konfetisi, kıvılcım, yaylı pop-up", () => ev(`${A9}
  L.win=null; DG.load(DG.makeState(11)); await W(300); if(L.newc){ await U(()=>L.newc.ready,3000); await C('[data-act="newok"]'); } DG.openPause(); DG.draw(); const pa=[...L.el.querySelectorAll(".popup")].some(p=>p.getAnimations().length);
  if(!(dok>=8&&kaz>=36&&pa)) throw new Error("dök "+dok+" · kazanma "+kaz+" · pop-up "+pa); DG.resume(); return true;`));
await ok("A9 Hareketleri azalt (oyun ayarı): kökte .rm, parçacık ve pop-up animasyonu yok", () => ev(`L.set.rm=true; DG.rmUygula(); try{ ${A9}
  DG.openPause(); DG.draw(); const pa=[...L.el.querySelectorAll(".popup")].some(p=>p.getAnimations().length); DG.resume(); L.win=null;
  const kok=document.documentElement.classList.contains("rm"); if(!(kok&&dok===0&&kaz===0&&!pa)) throw new Error("kök "+kok+" · dök "+dok+" · kazanma "+kaz+" · pop-up "+pa); return true;
  } finally { L.set.rm=false; DG.rmUygula(); }`));

// A10 · kayıt: sayfa yenilenince (oyunu kapatıp açmak gibi) Sergi'den açılır, ilerleme korunur
await ok("A10 Kayıt: yeniden açılınca Sergi'den; coin, yıldız, sıradaki seviye, asılı tablolar korunur", async () => {
  const once = await ev(`DG.kaydet(); return JSON.stringify({c:L.s.coins, s:L.s.stars, n:L.G&&L.G.next, a:L.G&&L.G.slots});`);
  await send("Page.reload"); await sleep(300);
  for (let i = 0; i < 50; i++) { if (await send("Runtime.evaluate", { expression: "!!window.DG", returnByValue: true }).then(r => r.result.value)) break; await sleep(100); }
  const sonra = await ev(`await U(()=>L.gal,3000); return JSON.stringify({c:L.s.coins, s:L.s.stars, n:L.G&&L.G.next, a:L.G&&L.G.slots});`);
  if (once !== sonra) throw new Error(once + " ≠ " + sonra); return JSON.parse(once).n > 1; });
await shot("11-kayit-sergi");

await ok("JS hatası yok", async () => { if (errs.length) throw new Error(errs.slice(0, 3).join(" | ")); return true; });
// A10 · 2 PWA: servis çalışanı kurulunca sunucu tamamen kapatılır, sayfa yenilenir → oyun önbellekten açılmalı
await ok("A10 PWA: sunucu kapalıyken (internetsiz) oyun önbellekten açılır, Sergi hazır", async () => {
  const hazir = await ev(`if(!await U(()=>navigator.serviceWorker.controller,8000)) return "denetleyici yok";
    for(let i=0;i<80;i++){ if(await caches.match("ses/muzik-menu.aac")) return "tamam"; await W(100);} return "müzik önbellekte yok";`);
  if (hazir !== "tamam") throw new Error(hazir);
  await new Promise(r => { server.close(r); server.closeAllConnections(); });
  await send("Page.reload"); await sleep(300);
  for (let i = 0; i < 50; i++) { if (await send("Runtime.evaluate", { expression: "!!window.DG", returnByValue: true }).then(r => r.result.value)) break; await sleep(100); }
  return await ev(`return await U(()=>L.gal,4000);`);
});
console.log(`\n${results.length - fails} / ${results.length} geçti · ekran görüntüleri: test/cikti/`);
ws.close(); chrome.kill(); server.close();
process.exit(fails ? 1 : 0);
