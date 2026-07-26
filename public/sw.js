const CACHE = 'quickg76-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch('/');
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = [...doc.querySelectorAll('link[rel="stylesheet"], link[rel="preload"], link[as]')];
        const scripts = [...doc.querySelectorAll('script[src]')];
        const urls = [];
        links.forEach((el) => { if (el.href) urls.push(el.href); });
        scripts.forEach((el) => { if (el.src) urls.push(el.src); });
        const allAssets = [...new Set([...ASSETS, ...urls])];
        await cache.addAll(allAssets);
        console.log('[SW] Cached', allAssets.length, 'assets');
      } catch {
        await cache.addAll(ASSETS);
      }
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request);
      if (cached) {
        fetch(e.request).then((res) => {
          if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE).then((c) => c.put(e.request, res));
          }
        }).catch(() => {});
        return cached;
      }
      try {
        const res = await fetch(e.request);
        if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      } catch {
        const fallback = await caches.match('/');
        if (fallback) return fallback;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
