// EVERNET Service Worker v1.0.2 - Complete Page Coverage
const CACHE_NAME = 'evernet-v1.0.8';
const DYNAMIC_CACHE = 'evernet-dynamic-v1.0.8';

// ALL YOUR PAGES AND ASSETS
const STATIC_ASSETS = [
  // Main Pages
  '/',
  '/index.html',
  
  // Dashboard Section
  '/dashboard/',
  '/dashboard/index.html',
  
  // About Section
  '/about/',
  '/about/index.html',
  
  // Authentication Pages
  '/sign-in/',
  '/sign-in/index.html',
  '/sign-up/',
  '/sign-up/index.html',
  
  // Content Pages
  '/music/',
  '/music/index.html',
  '/learn-more/',
  '/learn-more/index.html',
  
  // Legal Pages
  '/terms-of-service/',
  '/terms-of-service/index.html',
  '/privacy-policy/',
  '/privacy-policy/index.html',
  '/creator-agreement/',
  '/creator-agreement/index.html',
  
  // Admin Pages
  '/admin/',
  '/admin/index.html',
  
  // PWA Assets
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  
  // External Dependencies
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@700;800;900&display=swap',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
];

// Install event - cache ALL assets
self.addEventListener('install', (event) => {
  console.log('🚀 EVERNET Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching ALL EVERNET pages and assets');
        return cache.addAll(STATIC_ASSETS.map(url => {
          // Ensure proper URLs for GitHub Pages
          return new Request(url, { mode: 'no-cors' });
        }));
      })
      .then(() => {
        console.log('✅ ALL EVERNET assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Cache installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 EVERNET Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that's not current
          if (!cacheName.startsWith('evernet-v1.0.2') && !cacheName.startsWith('evernet-dynamic-v1.0.2')) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ EVERNET Service Worker fully activated');
      return self.clients.claim();
    })
  );
});

// Enhanced Fetch Strategy - Smart Caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || 
      request.url.startsWith('chrome-extension://') ||
      request.url.includes('browser-sync') ||
      request.url.includes('live-reload')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Always return from cache first for instant loading
        if (cachedResponse) {
          // Update cache in background
          fetchAndCache(request);
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, serve offline page
            if (request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('EVERNET is offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Helper function to fetch and cache in background
function fetchAndCache(request) {
  fetch(request)
    .then((response) => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => {
            cache.put(request, responseClone);
          });
      }
    })
    .catch(() => {
      // Silent fail - we already have cached version
    });
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending background tasks
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'BACKGROUND_SYNC_COMPLETE',
      timestamp: new Date().toISOString()
    });
  });
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  const data = event.data;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_STATUS':
      caches.keys().then((cacheNames) => {
        const status = {
          totalCaches: cacheNames.length,
          cacheNames: cacheNames,
          version: '1.0.2'
        };
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'CHECK_FOR_UPDATES':
      // Force update check
      self.registration.update();
      event.ports[0].postMessage({ checking: true });
      break;
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New update from EVERNET',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open EVERNET'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'EVERNET', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

console.log('🎯 EVERNET Service Worker loaded - All pages covered');







