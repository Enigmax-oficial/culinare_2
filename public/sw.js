// Basic Service Worker to enable PWA installability
self.addEventListener('fetch', (event) => {
  // Pass through requests to network
  event.respondWith(fetch(event.request));
});