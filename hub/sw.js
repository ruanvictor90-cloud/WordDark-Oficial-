const CACHE="ruan-hub-v14";
const CORE=["./","./index.html","./central.html","./darknet.html","./darknet.js","./app.css?v=20261014-1","./app.js?v=20261014-1","./manifest.webmanifest","./app-icon.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("ruan-hub-")&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
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
