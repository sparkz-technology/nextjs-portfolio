const CACHE_NAME = "offline-app-cache-v1";
const urlsToCache = [
  "/",           // Homepage
  "/favicon.ico" // Favicon
];

// Install event - cache initial assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate worker immediately after installation
});

// Fetch event - cache-first for safe requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // ⛔️ Skip NextAuth & API routes + non-GET requests
  if (
    url.pathname.startsWith("/api/auth") ||
    url.pathname.startsWith("/api/") ||
    event.request.method !== "GET"
  ) {
    return; // Let the browser handle it directly
  }

  // ✅ Cache-first strategy with fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful basic responses
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback for navigation requests
          if (event.request.mode === "navigate") {
            const offlinePage = await caches.match("/");
            return offlinePage || new Response("Offline page not available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "text/plain" },
            });
          }

          // Offline fallback for other requests
          return new Response("You are offline", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim(); // Take control of all open tabs
});
