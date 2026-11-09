const CACHE='groundwell-v19';
const CORE=['./','./index.html','./style.css','./app.js','./body-atlas.js','./data/body.js','./routine.js','./data/atlas.js','./data/monographs.js','./data/volume2.js','./data/volume3.js','./data/timing.js','./data/fieldguides.js','./data/fieldguides2.js','./data/fieldnotes.js','./data/fieldguides3.js','./data/fieldguides4.js','./gut-log.js','./field-extra.js','./field-ui.js','./data/interactions.js','./data/library.json','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
});
