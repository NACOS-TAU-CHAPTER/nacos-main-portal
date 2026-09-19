# Railway URL Issue - Internal vs Public Domain

## Problem Identified

You found: `naco-tau-backend.railway.internal`

This is an **INTERNAL** domain that only works within Railway's network. It's NOT accessible from:
- ❌ Public internet
- ❌ Your Netlify frontend
- ❌ Your browser
- ❌ Your local machine

## What You Need

You need the **PUBLIC** domain, which looks like:
- `https://nacos-tau-backend.up.railway.app` (old URL)
- OR `https://[project-name]-production.up.railway.app`
- OR `https://[random-name].railway.app`

## How To Find Your Public URL

### Step 1: In Railway Dashboard

1. Go to https://railway.app/dashboard
2. Click on your **NACOS Backend** project
3. Look for **"Settings"** tab (left sidebar)
4. Scroll to **"Networking"** or **"Domains"** section
5. You'll see something like:

   ```
   Public Domain:
   https://nacos-tau-backend.up.railway.app
   
   Private Domain:
   naco-tau-backend.railway.internal (Internal only)
   ```

6. **Copy the PUBLIC domain** (the one starting with `https://`)

### Step 2: Test The Public URL

```bash
curl https://[your-public-url]/api/health
```

**Expected result:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-05T...",
  "environment": "production"
}
```

## If You Don't See A Public Domain

This means Railway hasn't generated one yet or it was removed.

### Generate New Public Domain

1. Railway Dashboard → Your Project
2. Click **"Settings"** tab
3. Find **"Networking"** or **"Domains"** section
4. Click **"Generate Domain"** button
5. Railway will create: `https://[random-name].railway.app`
6. Copy this URL

## Update Frontend With Correct URL

Once you have the correct public URL:

### Step 1: Update env.js

Open: `frontend/assets/js/env.js`

Find this section (around line 22-25):

```javascript
window.API_URL = isLocal 
    ? 'http://localhost:5000/api'
    : 'https://nacos-backend.up.railway.app/api';  // ← OLD URL
```

Replace with your NEW public URL:

```javascript
window.API_URL = isLocal 
    ? 'http://localhost:5000/api'
    : 'https://[YOUR-NEW-PUBLIC-URL]/api';  // ← Replace this
```

### Step 2: Save and Deploy

```bash
cd frontend
git add assets/js/env.js
git commit -m "fix: update Railway public domain URL"
git push origin main
```

Wait 2 minutes for Netlify to redeploy.

### Step 3: Test

1. Go to https://nacos-tau-portal.netlify.app
2. Hard refresh: **Ctrl + Shift + R**
3. Open DevTools → Console
4. Should see NO CORS errors
5. Events should load

## Common Railway Domain Patterns

Railway generates domains in these formats:

1. **Custom subdomain** (if you set one):
   - `https://nacos-backend.up.railway.app`
   - `https://nacos-tau-backend.up.railway.app`

2. **Auto-generated**:
   - `https://nacos-tau-backend-production.up.railway.app`
   - `https://web-production-a1b2.up.railway.app`

3. **New format**:
   - `https://[project-name]-[service]-[environment].railway.app`

## Verification Checklist

After finding the public URL:

- [ ] Public URL starts with `https://`
- [ ] URL ends with `.railway.app` or `.up.railway.app`
- [ ] Health endpoint responds: `curl [url]/api/health`
- [ ] Returns `{"status":"healthy",...}`
- [ ] Updated `frontend/assets/js/env.js` with new URL
- [ ] Committed and pushed to Git
- [ ] Netlify redeployed (check https://app.netlify.com)
- [ ] Hard refreshed frontend (Ctrl+Shift+R)
- [ ] No CORS errors in browser console
- [ ] Events load on homepage

## Quick Test Commands

Replace `[YOUR-URL]` with your actual public domain:

```bash
# Test health
curl https://[YOUR-URL]/api/health

# Test events
curl https://[YOUR-URL]/api/events/upcoming

# Test CORS from browser console (on Netlify site)
fetch(window.API_URL + '/events/upcoming')
  .then(r => r.json())
  .then(d => console.log('✅', d))
  .catch(e => console.error('❌', e))
```

## What To Do Next

1. **Find your public URL** in Railway Dashboard
2. **Test it** with curl
3. **Update** `frontend/assets/js/env.js`
4. **Push to Git** → Netlify auto-deploys
5. **Test frontend** - should work!

Then we can:
- ✅ Run migration 010 for audit logs
- ✅ Complete audit logs testing
- ✅ Move to payment integration

---

**Status:** Waiting for your public Railway URL
**Action Required:** Check Railway Dashboard → Settings → Domains
**Time:** 2 minutes to find URL, 5 minutes to update and deploy
