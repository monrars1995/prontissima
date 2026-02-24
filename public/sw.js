// Prontíssima Service Worker — Offline Shell Caching
const CACHE_NAME = 'prontissima-v1'
const SHELL_ASSETS = [
    '/',
    '/dashboard',
    '/manifest.json',
    '/apple-icon.png',
]

// Install: cache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(SHELL_ASSETS).catch(() => {
                // Silently fail for assets that can't be cached during install
                console.log('[SW] Some shell assets not available for caching')
            })
        })
    )
    self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    )
    self.clients.claim()
})

// Fetch: network-first with cache fallback for navigation
self.addEventListener('fetch', (event) => {
    const { request } = event

    // Skip non-GET and API requests
    if (request.method !== 'GET') return
    if (request.url.includes('/api/')) return

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses
                if (response.ok && response.type === 'basic') {
                    const clone = response.clone()
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
                }
                return response
            })
            .catch(() => {
                // Fallback to cache when offline
                return caches.match(request).then((cached) => {
                    if (cached) return cached
                    // For navigation requests, serve the cached shell
                    if (request.mode === 'navigate') {
                        return caches.match('/dashboard')
                    }
                })
            })
    )
})
