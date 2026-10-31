// Red Letter offline support. Pages come from the network first (so updates show up), everything else from the cache.
const CACHE = 'red-letter-7131e551f7';
const FILES = ["./", "index.html", "manifest.webmanifest", "og.png", "icons/apple-touch-icon.png", "icons/favicon-64.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "fonts/archivo.woff", "fonts/bodoni-moda-italic.woff", "fonts/spectral-italic.woff", "fonts/spectral-medium.woff", "fonts/spectral-regular.woff", "fonts/spectral-semibold.woff"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
