// sw.js - EVERNET Service Worker with Cache Busting
const APP_VERSION = '1.0.1';
const CACHE_NAME = `evernet-${APP_VERSION}`;

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
  console.log(`🚀 EVERNET Service Worker v${APP_VERSION}: Installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 EVERNET Service Worker: Caching app shell');
        return cache.addAll(urlsToCache.map(url => `${url}?v=${APP_VERSION}`));
      })
      .then(() => {
        console.log('✅ EVERNET Service Worker: All files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('❌ EVERNET Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log(`🔥 EVERNET Service Worker v${APP_VERSION}: Activated`);
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (!cache.includes(APP_VERSION)) {
            console.log('🗑️ EVERNET Service Worker: Removing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ EVERNET Service Worker: Ready to handle fetches');
      return self.clients.claim();
    })
  );
});

// Fetch event with cache busting
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        const fetchRequest = event.request.clone();
        
        // If cached version exists, return it but update in background
        if (response) {
          console.log('📂 EVERNET Service Worker: Serving from cache', event.request.url);
          
          // Update cache in background
          fetch(fetchRequest).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                  console.log('🔄 EVERNET Service Worker: Cache updated', event.request.url);
                });
            }
          }).catch(() => {
            console.log('⚠️ EVERNET Service Worker: Background update failed');
          });
          
          return response;
        }
        
        // Otherwise fetch from network
        console.log('🌐 EVERNET Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('💾 EVERNET Service Worker: Cached new resource', event.request.url);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.log('❌ EVERNET Service Worker: Network failed', error);
            return new Response('EVERNET is offline. Please check your connection.', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle version updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(APP_VERSION);
  }
});

console.log(`👋 EVERNET Service Worker v${APP_VERSION}: Loaded successfully`);