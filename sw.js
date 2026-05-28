/* ============================================================
   OYA Plant Watch — Service Worker
   Provides offline support and "Add to Home Screen" capability.
   Bump CACHE_VERSION when you ship updated content.
   ============================================================ */

const CACHE_VERSION = 'oya-portraits-v12-phase2-batch6-2026-05';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

// Install — pre-cache the shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Use addAll but tolerate single-asset failures
      return Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            // If a CDN asset can't be cached at install, we'll try again at runtime
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//  - Same-origin & app shell: cache-first, fall back to network
//  - API calls (iNat, GBIF, IUCN): network-first, fall back to cache
//  - Map tiles: stale-while-revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isApi =
    url.hostname.includes('inaturalist.org') ||
    url.hostname.includes('gbif.org') ||
    url.hostname.includes('iucnredlist.org');
  const isTile = url.hostname.includes('tile.openstreetmap.org');

  if (isApi) {
    // Network-first for fresh data
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  if (isTile) {
    // Stale-while-revalidate for map tiles
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            caches.open(CACHE_VERSION).then((c) => c.put(req, res.clone())).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: cache-first for the app shell
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
