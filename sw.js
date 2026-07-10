const CACHE = 'beyond-failure-v4';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache Google APIs, Sheets, Scripts
  if (
    e.request.url.includes('googleapis') ||
    e.request.url.includes('gviz') ||
    e.request.url.includes('script.google') ||
    e.request.url.includes('googletagmanager') ||
    e.request.url.includes('drive.google')
  ) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Auto update check every 30 minutes
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
