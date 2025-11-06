// evernet-cache.js - EVERNET Cache Busting Utility
// Version: 1.0.1

/**
 * EVERNET Cache Management System
 * Use this to force cache clearing after updates
 */

// Quick cache buster - call this after updates
function quickCacheBuster() {
  console.log('🔄 EVERNET: Starting cache clearance...');
  
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('🗑️ EVERNET: Deleted cache', name);
      });
    });
  }
  
  // Force reload with cache-busting parameter
  const newUrl = window.location.href.split('?')[0] + '?forceReload=' + Date.now();
  console.log('🚀 EVERNET: Reloading with cache bust', newUrl);
  window.location.href = newUrl;
}

// Auto-check on load
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('forceReload')) {
    console.log('🔄 EVERNET: Force reload detected - Cache cleared successfully');
    
    // Remove the forceReload parameter from URL (clean URL)
    const cleanUrl = window.location.href.split('?')[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }
});

// Make function globally available for console use
window.evernetClearCache = quickCacheBuster;


console.log('✅ EVERNET Cache Manager loaded - Use evernetClearCache() to force refresh');
