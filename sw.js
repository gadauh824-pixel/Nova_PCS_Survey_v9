const CACHE='pcs-v9-2';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    // Drop any old caches so a redeploy always serves fresh files
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.open(CACHE).then(async c=>{
      const r = await c.match(e.request);
      try{
        const net = await fetch(e.request);
        if(net.ok) c.put(e.request,net.clone());
        return net;
      }catch(_){ return r || new Response('offline',{status:503}); }
    })
  );
});
