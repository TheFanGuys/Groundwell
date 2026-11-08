const cacheName = 'groundwell-shell-v2';
const files = ['./','./index.html','./style.css','./app.js','./dispatch.json','./app.webmanifest','./vendor/chart.umd.js','./sample-label.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(files))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('groundwell-shell-')&&key!==cacheName).map(key=>caches.delete(key))))));
self.addEventListener('fetch', event=>{
  const vendorPath = new URL('./vendor/',self.registration.scope).href;
  if(event.request.method==='GET' && event.request.url.startsWith(vendorPath)){
    event.respondWith(caches.open(cacheName).then(async cache=>{
      const hit=await cache.match(event.request);
      if(hit)return hit;
      const response=await fetch(event.request);
      if(response.ok)await cache.put(event.request,response.clone());
      return response;
    }));
    return;
  }
  if(event.request.method!=='GET'||!files.some(path=>new URL(path,self.registration.scope).href===event.request.url))return;
  event.respondWith(caches.open(cacheName).then(async cache=>{
    if(event.request.url.endsWith('/dispatch.json')){
      try{const response=await fetch(event.request);if(response.ok){await cache.put(event.request,response.clone());return response;}}catch{}
    }
    return await cache.match(event.request)||fetch(event.request);
  }));
});
