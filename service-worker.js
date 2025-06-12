const CACHE_NAME = 'smilemarket-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/main.js',
  '/productos.js',
  '/manifest.json',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/Logo.jpg',
  'https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
