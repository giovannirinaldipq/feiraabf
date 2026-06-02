const CACHE = 'avend-abf-v3';
self.addEventListener('install', e => {
  self.skipWaiting();
  // Limpar todos os caches antigos na instalação
  e.waitUntil(
    caches.keys().then(ks =>
      Promise.all(ks.map(k => caches.delete(k)))
    )
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;

  // Network-first para HTML e JS — sempre pega versão mais nova
  if (e.request.url.includes('.html') ||
      e.request.url.includes('config-feirab') ||
      e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first para outros assets
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
