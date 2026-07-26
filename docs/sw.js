const BASE = '/QuickG76';
const CACHE = 'quickg76-v1';
const ASSETS = ["/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/QuickG76/assets/node_modules/@react-navigation/elements/lib/module/assets/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/QuickG76/favicon.ico","/QuickG76/icon-192.png","/QuickG76/icon-512.png","/QuickG76/icon-maskable-192.png","/QuickG76/icon-maskable-512.png","/QuickG76/icon.svg","/QuickG76/index.html","/QuickG76/manifest.json","/QuickG76/_expo/static/js/web/index-1cc67a1392ae6b5997f55f527256cbd3.js","/QuickG76/_expo/static/js/web/index-a1ec1273d53c47d35c87b126711b26c7.js","/QuickG76/_expo/static/js/web/index-bb2243ac3559f10fb17cc3cd677a81ae.js"];

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ASSETS);
      console.log('[SW] Cached', ASSETS.length, 'assets');
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
      try {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      } catch {
        const fallback = await caches.match(BASE + '/');
        if (fallback) return fallback;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
