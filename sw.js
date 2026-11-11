/* Fee Hisab service worker: offline-first app shell. Bump VERSION on every deploy. */
const VERSION='fee-v5',SHELL=['./','./index.html','./manifest.json','./privacy.html','./terms.html','./icon-192.png','./icon-512.png','./maskable-192.png','./maskable-512.png','./apple-touch-icon.png','./favicon-32.png','./shortcut-collect.png','./shortcut-students.png','./shortcut-reports.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VERSION).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;           // Google APIs always go straight to the network
  if(r.mode==='navigate'&&(u.pathname.endsWith('/')||u.pathname.endsWith('/index.html'))){   // open instantly from cache, refresh in background
    e.respondWith(caches.match('./index.html').then(c=>{const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',cp))}return res}).catch(()=>c);return c||net}));
    return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>{const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(x=>x.put(r,cp))}return res}).catch(()=>c||caches.match('./index.html'));return c||net}))});
/* Optional background hooks (no data is sent anywhere): refresh the cached shell when the browser allows it. */
self.addEventListener('periodicsync',e=>{if(e.tag==='fh-refresh')e.waitUntil(caches.open(VERSION).then(c=>c.add('./index.html')).catch(()=>{}))});
self.addEventListener('sync',e=>{if(e.tag==='fh-refresh')e.waitUntil(caches.open(VERSION).then(c=>c.add('./index.html')).catch(()=>{}))});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch{}if(d&&d.title)e.waitUntil(self.registration.showNotification(String(d.title).slice(0,80),{body:String(d.body||'').slice(0,200),icon:'./icon-192.png'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('./'))});
