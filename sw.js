/* A&L Estimate Lab 用 Service Worker。画面はネット優先（更新がすぐ届く）、オフライン時は保存済みの画面を表示。為替APIはキャッシュしない。 */
const V='mq-v28';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/estilab-180.png','./icons/estilab-192.png','./icons/estilab-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(/frankfurter|er-api/.test(u.hostname))return;
  const put=r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(req,cp))}return r};
  if(u.origin===self.location.origin){
    e.respondWith(fetch(req).then(put).catch(()=>caches.match(req).then(m=>m||caches.match('./index.html'))));return}
  if(/cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u.hostname)){
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(put)))}
});
