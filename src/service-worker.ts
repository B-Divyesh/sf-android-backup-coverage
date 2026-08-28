const worker = globalThis as unknown as {
  addEventListener(type: string, listener: (event: any) => void): void;
  clients: { claim(): Promise<void> };
  skipWaiting(): Promise<void>;
};

const VERSION = `coverage-${__BUILD_ID__}`;
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const APP_SHELL = [
  '/', '/index.html', '/offline.html', '/manifest.webmanifest',
  '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png', '/social-card.webp', '/legal.css', '/privacy/', '/terms/', '/demo', '/404.html',
];

async function precacheAppShell() {
  const cache = await caches.open(STATIC_CACHE);
  const response = await fetch('/index.html', { cache: 'no-cache' });
  const html = await response.clone().text();
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
  await cache.put('/index.html', response);
  await cache.addAll([...new Set([...APP_SHELL, ...builtAssets])]);
}

worker.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell());
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))),
    worker.clients.claim(),
  ]));
});

worker.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void worker.skipWaiting();
});

worker.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        void caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => await caches.match(event.request, { ignoreVary: true }) || caches.match('/offline.html')));
    return;
  }

  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) void caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
