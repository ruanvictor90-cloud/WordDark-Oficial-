const CACHE="worddark-hub-v18";
const CORE=["./","./index.html","./central.html","./app.css?v=20261016.5","./app.js?v=20261016.5","./manifest.webmanifest","./engine/darkhub-engine.js","./app-icon.svg?v=20261016.3"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("worddark-hub-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
 const requestUrl=new URL(event.request.url);
 const isNavigation=event.request.mode==="navigate"||requestUrl.pathname.endsWith("/hub/")||requestUrl.pathname.endsWith("/hub/index.html");
 if(isNavigation){
  const fallbackPath=requestUrl.pathname.endsWith("/central.html")?"./central.html":"./index.html";
  event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(fallbackPath,copy));}
   return response;
  }).catch(()=>caches.match(fallbackPath)));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
  return response;
 }).catch(()=>caches.match("./index.html"))));
});
