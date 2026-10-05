# Frontend Deployment - Railway URL Update

## Current Status

✅ **File Updated**: `frontend/assets/js/env.js` now uses `naco-tau-backend-production.up.railway.app`
✅ **Railway Backend**: Working correctly (health endpoint responds)
❌ **Problem**: Netlify is still serving the OLD URL (`nacos-backend.up.railway.app`)

## Why This Is Happening

The `env.js` file in your Git repository already has the correct new URL, but Netlify is either:
1. **Still serving an old deployment** 
2. **Hasn't redeployed yet**
3. **Browser is caching the old file**

## Solution: Force Netlify Redeploy

### Option 1: Trigger Redeploy from Netlify Dashboard (FASTEST)

1. **Go to Netlify**: https://app.netlify.com
2. **Click on your site**: `nacos-tau-portal`
3. **Go to Deploys** tab
4. **Click "Trigger deploy"** button (top right)
5. **Select "Deploy site"**
6. **Wait 1-2 minutes** for deployment to complete
7. **Clear browser cache** and hard refresh: `Ctrl + Shift + R`

### Option 2: Push a Small Change to Git

Since Git already has the correct URL, we need to make a tiny change to trigger a new deployment:

```bash
cd "c:\Users\HP\Documents\nacos website\frontend"

# Add a comment to trigger redeploy
echo. >> assets/js/env.js
echo // Updated: 2026-08-22 >> assets/js/env.js

git add assets/js/env.js
git commit -m "chore: trigger redeploy with updated Railway URL"
git push origin main
```

Then wait 2 minutes for Netlify to auto-deploy.

### Option 3: Clear Netlify Cache

1. Netlify Dashboard → Your Site
2. Click **Site settings**
3. Go to **Build & deploy** → **Post processing**
4. Click **Clear cache and retry deploy**

## Verification Steps

After redeployment:

### Step 1: Check Netlify Deployment

1. Go to https://app.netlify.com
2. Click your site
3. Check **Deploys** tab
4. Latest deploy should show:
   - ✅ Green checkmark
   - Recent timestamp (within last 5 minutes)

### Step 2: Test The Deployed File

Open browser console on https://nacos-tau-portal.netlify.app and run:

```javascript
// Check what URL the site is using
console.log('API URL:', window.API_URL);

// Should show: https://nacos-tau-frontend.onrender.com/api
```

**Expected**: `https://nacos-tau-frontend.onrender.com/api`
**If you see**: `https://nacos-backend.up.railway.app/api` → Cache issue (see Step 3)

### Step 3: Clear Browser Cache

**Hard Refresh:**
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Or Clear All Cache:**
1. Press `F12` (DevTools)
2. Right-click refresh button
3. Select **"Empty Cache and Hard Reload"**

### Step 4: Test API Connection

In browser console on https://nacos-tau-portal.netlify.app:

```javascript
fetch(window.API_URL + '/events/upcoming')
  .then(r => r.json())
  .then(d => console.log('✅ Working!', d))
  .catch(e => console.error('❌ Failed:', e));
```

**Expected**: Array of events, NO CORS errors ✅

### Step 5: Check Homepage

1. Go to https://nacos-tau-portal.netlify.app
2. Events section should load
3. No errors in console
4. If you see CORS errors, check what URL it's trying to reach

## Quick Fix Script

I'll create a batch file to push a change and force redeploy:

```batch
@echo off
cd "c:\Users\HP\Documents\nacos website\frontend"

echo.
echo ========================================
echo   Force Netlify Redeploy
echo ========================================
echo.

echo Adding timestamp comment to env.js...
echo. >> assets\js\env.js
echo // Force redeploy: %date% %time% >> assets\js\env.js

echo.
echo Committing changes...
git add assets\js\env.js
git commit -m "chore: force Netlify redeploy with updated Railway URL"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Netlify should start deploying in ~10 seconds
echo Check: https://app.netlify.com
echo.
echo Wait 2 minutes, then:
echo 1. Go to https://nacos-tau-portal.netlify.app
echo 2. Hard refresh: Ctrl+Shift+R
echo 3. Check console - should see NO CORS errors
echo.
pause
```

## Common Issues

### Issue: "Still seeing old URL after redeploy"

**Cause**: Browser cache or CDN cache

**Solutions**:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear all browser cache
3. Try incognito/private window
4. Try different browser
5. Wait 5 minutes for CDN cache to expire

### Issue: "Netlify not deploying"

**Causes & Solutions**:

1. **Build failed**:
   - Check Netlify deploy logs
   - Look for error messages
   - Fix errors and push again

2. **Auto-deploy disabled**:
   - Netlify Dashboard → Site settings → Build & deploy
   - Check "Continuous deployment" is enabled
   - Check branch is set to `main`

3. **GitHub hook broken**:
   - Netlify Dashboard → Site settings → Build & deploy → Deploy notifications
   - Click "Add notification" → GitHub commit status
   - Reconnect GitHub integration

### Issue: "CORS errors still appearing"

**Check these**:

1. **Is Netlify using the new code?**
   ```javascript
   console.log(window.API_URL);
   // Must show: naco-tau-backend-production.up.railway.app
   ```

2. **Is Railway backend responding?**
   ```bash
   curl https://nacos-tau-frontend.onrender.com/api/health
   # Should return: {"status":"healthy",...}
   ```

3. **Is CORS configured in Railway backend?**
   - Check Railway environment variables
   - `FRONTEND_URL` should be set to `https://nacos-tau-portal.netlify.app`
   - If changed, restart Railway service

## Timeline

| Action | Time |
|--------|------|
| Trigger Netlify redeploy | 1 min |
| Netlify builds and deploys | 1-2 min |
| CDN propagation | 0-5 min |
| Clear browser cache | 10 sec |
| Test functionality | 1 min |
| **TOTAL** | **3-10 minutes** |

## Next Steps After Fix

Once frontend is working:

1. ✅ Verify events load on homepage
2. ✅ Test login functionality
3. ✅ Check admin dashboard access
4. ✅ Run migration 010 for audit logs (when Supabase is accessible)
5. ✅ Complete audit logs feature testing
6. ✅ Implement payment integration

---

**Status**: ✅ Backend URL updated in code, waiting for Netlify redeploy
**Action**: Trigger Netlify redeploy via dashboard or Git push
**Priority**: High - Blocks all frontend API calls
