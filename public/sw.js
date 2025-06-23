// Service Worker para MIMI Landing - Cache y Performance
const CACHE_NAME = 'mimi-landing-v1'
const STATIC_CACHE = 'mimi-static-v1'
const DYNAMIC_CACHE = 'mimi-dynamic-v1'

// Recursos para cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/images/mimi-logo-new.png',
  '/images/alfajor-chocolate-blanco.jpg',
  '/images/alfajor-chocolate-negro.jpg',
  '/images/alfajor-blanco-producto.jpg',
  '/images/alfajor-negro-producto.jpg',
  '/_next/static/css/',
  '/_next/static/js/',
]

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Solo cachear requests GET
  if (request.method !== 'GET') return

  // Estrategia para diferentes tipos de recursos
  if (url.pathname.startsWith('/_next/static/')) {
    // Assets estáticos - Cache First
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (url.pathname.startsWith('/images/')) {
    // Imágenes - Cache First con fallback
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  } else if (url.pathname.startsWith('/api/')) {
    // APIs - Network First
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
  } else {
    // Páginas - Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE))
  }
})

// Estrategia Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('📦 Cache hit:', request.url)
      return cachedResponse
    }
    
    console.log('🌐 Cache miss, fetching:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('❌ Cache First failed:', error)
    throw error
  }
}

// Estrategia Network First
async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 Network first:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url)
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Fetch en background para actualizar cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  })
  
  // Devolver cache si existe, sino esperar network
  if (cachedResponse) {
    console.log('📦 Serving from cache, updating in background:', request.url)
    return cachedResponse
  }
  
  console.log('🌐 No cache, waiting for network:', request.url)
  return fetchPromise
}

// Limpiar cache viejo periódicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName)
      })
    })
  }
}) 