const VERSION = 'coverage-v7';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const APP_SHELL = [
  '/', '/index.html', '/offline.html', '/manifest.webmanifest',
  '/assets/app.js', '/assets/app.css',
  '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
  '/assets/coverage-ceramic.webp', '/privacy/', '/terms/'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(APP_SHELL);
    const response = await fetch('/index.html');
    const html = await response.clone().text();
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
    await cache.put('/index.html', response);
    await cache.addAll([...new Set(builtAssets)]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => await caches.match(event.request, { ignoreVary: true }) || await caches.match('/', { ignoreVary: true }) || caches.match('/offline.html')));
    return;
  }

  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
