// version-manager.js - Handle cache busting and updates
class VersionManager {
  constructor() {
    this.currentVersion = '1.0.1';
    this.storageKey = 'evernet-version';
  }
  
  // Check if update is needed
  async checkForUpdates() {
    const storedVersion = localStorage.getItem(this.storageKey);
    
    if (storedVersion !== this.currentVersion) {
      console.log(`🔄 EVERNET: New version detected (${storedVersion} → ${this.currentVersion})`);
      
      // Clear all caches and reload
      await this.clearCaches();
      localStorage.setItem(this.storageKey, this.currentVersion);
      
      // Force reload if user is online
      if (navigator.onLine) {
        window.location.reload(true);
      }
      
      return true;
    }
    
    return false;
  }
  
  // Clear all caches
  async clearCaches() {
    try {
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ EVERNET: All caches cleared');
      }
      
      // Clear localStorage (optional - be careful)
      // localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
    } catch (error) {
      console.error('❌ EVERNET: Error clearing caches', error);
    }
  }
  
  // Add version parameter to URLs
  static versionUrl(url) {
    const version = new VersionManager().currentVersion;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${version}`;
  }
}

// Initialize version manager
const versionManager = new VersionManager();

// Check for updates when page loads
document.addEventListener('DOMContentLoaded', () => {
  versionManager.checkForUpdates();
});