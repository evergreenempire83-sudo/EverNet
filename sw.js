// sw.js - EVERNET Service Worker
const CACHE_NAME = 'evernet-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/About Us.html',
  '/music.html',
  '/sign-in.html',
  '/sign-up.html',
  '/dashboard.html',
  '/learn more.html',
  '/Terms of Service.html',
  '/Privacy policy.html',
  '/Creator Agreement.html',
  '/admin.html'
];

// Install event - cache all essential files
self.addEventListener('install', event => {
  console.log('🚀 EVERNET Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 EVERNET Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ EVERNET Service Worker: All files cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.log('❌ EVERNET Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔥 EVERNET Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ EVERNET Service Worker: Removing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ EVERNET Service Worker: Ready to handle fetches');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and Chrome extensions
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if found
        if (response) {
          console.log('📂 EVERNET Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        // Otherwise fetch from network
        console.log('🌐 EVERNET Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Add to cache for future visits
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('💾 EVERNET Service Worker: Cached new resource', event.request.url);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.log('❌ EVERNET Service Worker: Network failed', error);
            // You could return a custom offline page here
            return new Response('EVERNET is offline. Please check your connection.', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('👋 EVERNET Service Worker: Loaded successfully');