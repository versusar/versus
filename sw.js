// === VERSUS — Service Worker v3 ===
// IMPORTANT: Change CACHE_NAME version when you update files
const CACHE_NAME = ‘versus-v3’;
const ASSETS = [
‘./’,
‘./index.html’,
‘./css/style.css’,
‘./js/questions.js’,
‘./js/storage.js’,
‘./js/app.js’,
‘./manifest.json’,
‘./icons/icon-192.png’,
‘./icons/icon-512.png’,
];

// Install — cache all assets
self.addEventListener(‘install’, (e) => {
e.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
);
self.skipWaiting();
});

// Activate — delete ALL old caches
self.addEventListener(‘activate’, (e) => {
e.waitUntil(
caches.keys().then((keys) =>
Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
)
);
self.clients.claim();
});

// Fetch — NETWORK FIRST (always get latest when online)
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
return cached || caches.match(’./index.html’);
});
})
);
});
