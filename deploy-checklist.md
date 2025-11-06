# EVERNET Deployment Checklist

## Before Deploying Updates:
1. ✅ Update version number in:
   - sw.js (APP_VERSION constant)
   - All HTML files (meta tags and script)
   - version-manager.js

2. ✅ Test locally
3. ✅ Commit changes with version tag
4. ✅ Push to GitHub

## After Deployment:
1. ✅ Force clear cache for testing:
   ```javascript
   forceClearCache();