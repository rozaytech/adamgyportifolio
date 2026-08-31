const CACHE_NAME = 'adamgy-portfolio-v2';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './cv.html',
  './login.html',
  './dashboard.html',
  './dash-style.css',
  './dash-script.js',
  './termos.html',
  './privacidade.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});