const CACHE_NAME = 'chessmaster-pro-v1'

const PRECACHE_URLS = [
  '/',
  '/pieces/classic/wK.svg',
  '/pieces/classic/wQ.svg',
  '/pieces/classic/wR.svg',
  '/pieces/classic/wB.svg',
  '/pieces/classic/wN.svg',
  '/pieces/classic/wP.svg',
  '/pieces/classic/bK.svg',
  '/pieces/classic/bQ.svg',
  '/pieces/classic/bR.svg',
  '/pieces/classic/bB.svg',
  '/pieces/classic/bN.svg',
  '/pieces/classic/bP.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Cache-first for static assets (pieces, fonts, stockfish)
  if (
    url.pathname.startsWith('/pieces/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/stockfish/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // Network-first for API calls and pages (always fresh)
  if (url.pathname.startsWith('/api/') || request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  // Stale-while-revalidate for Next.js JS chunks
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
          return response
        })
        return cached || fetchPromise
      })
    )
  }
})
