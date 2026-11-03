// Sync Room — Service Worker
// Provides basic offline caching for the app shell

// Unregister and clear all caches immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Direct network pass-through (No caching!)
  event.respondWith(fetch(event.request));
});
