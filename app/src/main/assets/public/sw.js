// Service worker: la app completa funciona sin internet una vez instalada.
const CACHE="rp-__VERSION__",PDF="__PDFURL__",CORE=["./","index.html","app.js","app.css","logo.png","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png"__EXTRA__];
self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);
 if(PDF.startsWith("http")){try{await c.put(PDF,await fetch(PDF,{mode:"no-cors"}))}catch(_){}}self.skipWaiting()})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith("rp-")&&k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{const u=new URL(e.request.url);
  if(res&&(res.ok||res.type==="opaque")&&(u.origin===location.origin||u.href===PDF)){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return res})
  .catch(()=>e.request.mode==="navigate"?caches.match("index.html"):Response.error())))});
