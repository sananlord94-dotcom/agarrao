/* Agarrao · service worker: la app funciona sin conexión y solo se actualiza cuando tú lo dices. */
const CACHE='agarrao-1.1.0-5d6d1ee034';
const SHELL=['./','index.html','app.css','app.js','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){e.respondWith(caches.match('index.html').then(x=>x||fetch(r)));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(x=>x||fetch(r).then(res=>{if(res.ok&&/\.(woff2|ttf|png)$/.test(u.pathname)){const cl=res.clone();caches.open(CACHE).then(c=>c.put(r,cl))}return res})));
});
