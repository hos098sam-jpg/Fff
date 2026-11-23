const CACHE_NAME = 'youtube-spell-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-First with graceful fallback (never return HTML for JS/API requests)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept non-GET or API or external requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // Network first for all navigation and assets to avoid stale bundle crashes
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful local static assets (like logo, manifest, fonts)
        if (networkResponse && networkResponse.status === 200 && (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.json'))) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Only return cached response if network completely fails
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/') || fetch('/');
          }
          return new Response('Network error', { status: 408 });
        });
      })
  );
});
