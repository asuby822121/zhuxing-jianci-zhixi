// 諸行漸次止息 service worker
// 只快取 App 自己的檔案，讓手機離線也能打開。
// 不處理、不傳送任何記憶資料（記憶只在 localStorage）。
const CACHE = 'zhuxing-v2';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/tailwind-3.4.17.js',
  './vendor/lucide-0.460.0.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 先用網路拿最新版，拿不到（離線）就用快取
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
