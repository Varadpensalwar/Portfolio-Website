// sw.js
const CACHE_NAME = 'my-pwa-cache-v1';

// Core assets to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/offline\offline.html', // Create this fallback page
    '/offline\assets\css\styles.css',
    '/offline\assets\js\main.js',
    '/offline\assets\js\scrollreveal.min.js',
    '/offline\assets\scss\base\_base.scss',
    '/offline\assets\scss\components\_breakpoints.scss',
    '/offline\assets\scss\components\_header.scss',
    '/offline\assets\scss\components\_home.scss',
    '/offline\assets\scss\config\_variables.scss',
    '/offline\assets\scss\styles.scss',
    '/offline\assets\img\ghost-img.png',
    '/styles/main.css',
    '/scripts/main.js',
    '/manifest.json'
];

// Install event - cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {  
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if URL should be cached
function shouldCache(url) {
  const cacheableExtensions = [
    '.html', '.css', '.js', '.json', '.woff', '.woff2', 
    '.ttf', '.otf', '.eot', '.svg', '.png', '.jpg', 
    '.jpeg', '.gif', '.ico', '.webp'
  ];
  
  const noCachePatterns = [
    '/api/', '/analytics/', '/socket.io/', 
    'google-analytics.com', 'gtag', 'facebook.net'
  ];
  
  // Skip if matches no-cache patterns
  for (const pattern of noCachePatterns) {
    if (url.includes(pattern)) return false;
  }
  
  // Cache if has cacheable extension
  for (const ext of cacheableExtensions) {
    if (url.endsWith(ext)) return true;
  }
  
  // Cache root and directory URLs
  if (url === self.location.origin || url.endsWith('/')) return true;
  
  return false;
}

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Handle only GET requests
  if (event.request.method !== 'GET') return;
  
  // Network-first strategy for HTML pages
  if (event.request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached HTML or offline page
              return cachedResponse || caches.match('/offline/offline.html');
            });
        })
    );
    return;
  }
  
  // Cache-first strategy for other assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Asset found in cache
          return cachedResponse;
        }
        
        // Asset not found in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Check if we should cache this URL
            if (shouldCache(event.request.url)) {
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // For image requests, maybe return a placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/offline/offline-assets/ghost-img.png');
            }
            
            // For other requests, let the error propagate
            return new Response('Resource not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});