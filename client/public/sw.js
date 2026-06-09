/**
 * Service Worker for Inheritance Pro
 * Enables offline functionality and improves app reliability
 * 
 * Features:
 * - Cache HTML/CSS/JS bundles
 * - Offline fallback page
 * - Background sync for analytics
 * - Network-first strategy for API calls
 * - Cache-first strategy for static assets
 */

const CACHE_NAME = 'inheritance-pro-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/main.css',
];

// Cache strategies
const NETWORK_FIRST_PATHS = [
  '/api/',
  '/__manus__/',
];

const CACHE_FIRST_PATHS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/,
];

/**
 * Install event: Cache essential assets
 */
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Gracefully handle missing assets during install
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch event: Implement caching strategy
 */
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determine strategy based on path
  if (isNetworkFirstPath(url.pathname)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isCacheFirstPath(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(defaultStrategy(request));
  }
});

/**
 * Network-first strategy: Try network, fallback to cache
 * Used for API calls and dynamic content
 */
async function networkFirstStrategy(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    // Update cache with fresh response
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page as last resort
    return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
  }
}

/**
 * Cache-first strategy: Try cache, fallback to network
 * Used for static assets (JS, CSS, images, fonts)
 */
async function cacheFirstStrategy(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Default strategy: Network with cache fallback
 * Used for HTML pages
 */
async function defaultStrategy(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page
    return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
  }
}

/**
 * Check if request should use network-first strategy
 */
function isNetworkFirstPath(pathname: string): boolean {
  return NETWORK_FIRST_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Check if request should use cache-first strategy
 */
function isCacheFirstPath(pathname: string): boolean {
  return CACHE_FIRST_PATHS.some((pattern) => pattern.test(pathname));
}

/**
 * Message handler for communication with app
 */
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});
