const CACHE_NAME = "offline-app-cache-v1"
const HOME_URL = self.location.origin + "/" // Exact homepage URL

// Install event - cache only the homepage
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.add(HOME_URL) // Only cache the homepage
    }),
  )
  self.skipWaiting() // Activate worker immediately after installation
})

// Fetch event - special handling for homepage
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // ⛔️ Skip NextAuth & API routes + non-GET requests
  if (url.pathname.startsWith("/api/auth") || url.pathname.startsWith("/api/") || event.request.method !== "GET") {
    return // Let the browser handle it directly
  }

  // Check if this is the homepage request
  const isHomepage = url.pathname === "/" && url.origin === self.location.origin

  if (isHomepage) {
    // For homepage, use cache-first strategy with network update
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Start a network fetch in the background to update cache
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update the cache with the new version
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache)
              })
            }
            return networkResponse
          })
          .catch(() => {
            console.log("Failed to fetch homepage from network")
            // If both cache and network fail, return a simple offline message
            if (!cachedResponse) {
              return new Response("Homepage is not available offline", {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "text/plain" },
              })
            }
          })

        // Return the cached response immediately if available
        // This ensures fast loading of the homepage
        if (cachedResponse) {
          // Still update the cache in the background
          fetchPromise
          return cachedResponse
        }

        // If not in cache, wait for the network response
        return fetchPromise
      }),
    )
  } else if (event.request.mode === "navigate") {
    // For all other navigation requests, use network-only with offline fallback
    event.respondWith(
      fetch(event.request).catch(async () => {
        // If offline, serve the homepage as fallback for navigation
        const cachedHome = await caches.match(HOME_URL)
        return (
          cachedHome ||
          new Response("You are offline. Please try again later.", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          })
        )
      }),
    )
  }
  // For all other requests (assets, etc.), let the browser handle them normally
  // This ensures they don't get cached by this service worker
})

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  self.clients.claim() // Take control of all open tabs
})
