const CACHE = "shadoweb-shell-v1";
const SHELL = ["./", "./index.html", "./shadoweb.css", "./app.js", "./runtime.js", "./contracts.js", "./address.js", "./audit.js", "./gate.js", "./connectors.js", "./bridge.js", "./plugin-manager.js", "./knowledge.js", "./manifest.webmanifest", "./icon.svg"];
self.addEventListener("install", event => event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL);await self.skipWaiting();})()));
self.addEventListener("activate", event => event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("shadoweb-shell-")&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener("fetch", event => {
  const request=event.request;
  if(request.method!=="GET") return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith((async()=>{const cached=await caches.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok&&response.type==="basic"){const cache=await caches.open(CACHE);cache.put(request,response.clone());}return response;}catch{return new Response("Este recurso ainda não está disponível offline.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});}})());
});
