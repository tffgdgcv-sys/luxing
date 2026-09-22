const CACHE_NAME = 'luxing-ui-v36';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './fonts/gelasio-numerals.woff2', './fonts/latin-serif-400.woff2', './fonts/latin-serif-700.woff2', './fonts/serif-sc-200.woff2', './fonts/serif-sc-300.woff2', './fonts/serif-sc-600.woff2'];
const NETWORK_FIRST = /\.(?:html|css|js|webmanifest)$|sw\.js/;
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim().then(() => caches.keys()).then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (NETWORK_FIRST.test(new URL(event.request.url).pathname)) {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  })));
});
