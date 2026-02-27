// === VERSUS — Service Worker v3 ===
const CACHE_NAME = ‘versus-v3’;
const BASE = ‘/versus/’;
const ASSETS = [
BASE,
BASE + ‘index.html’,
BASE + ‘css/style.css’,
BASE + ‘js/questions.js’,
BASE + ‘js/storage.js’,
BASE + ‘js/app.js’,
BASE + ‘manifest.json’,
BASE + ‘icons/icon-192.png’,
BASE + ‘icons/icon-512.png’,
];

self.addEventListener(‘install’, (e) => {
e.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
);
self.skipWaiting();
});

self.addEventListener(‘activate’, (e) => {
e.waitUntil(
caches.keys().then((keys) =>
Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
)
);
self.clients.claim();
});

// Network first — always get latest when online
self.addEventListener(‘fetch’, (e) => {
e.respondWith(
fetch(e.request)
.then((response) => {
if (e.request.method === ‘GET’) {
const clone = response.clone();
caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
}
return response;
})
.catch(() => {
return caches.match(e.request).then((cached) => {
return cached || caches.match(BASE + ‘index.html’);
});
})
);
});
