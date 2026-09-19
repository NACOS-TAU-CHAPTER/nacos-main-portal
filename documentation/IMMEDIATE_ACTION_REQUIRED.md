# 🚨 IMMEDIATE ACTION REQUIRED - Railway Backend Down

## Current Situation
Your Railway backend at `https://nacos-backend.up.railway.app` is returning **404 "Application not found"**.

This means:
- ❌ Frontend cannot load events
- ❌ Users cannot log in
- ❌ Admin dashboard is broken
- ❌ All API calls fail

## What You Need To Do RIGHT NOW

### Step 1: Open Railway Dashboard (2 minutes)

1. **Go to:** https://railway.app/dashboard
2. **Log in** with your account
3. **Look for** your NACOS Backend project
4. **Check status:**
   - Is it there?
   - Is it running? (Green status)
   - Is it stopped? (Red/paused status)
   - Is it missing? (Deleted)

### Step 2: Get The Correct URL (1 minute)

1. **Click on your project** in Railway
2. **Go to Settings → Domains**
3. **Copy the public URL**
4. **Test it:**
   ```bash
   curl [paste-url-here]/api/health
   ```

### Step 3A: If Service Is Stopped

1. Click **"Start"** or **"Resume"** button
2. Wait 30 seconds
3. Test again: `curl [url]/api/health`

### Step 3B: If Service Is Running But URL Changed

1. **Copy the new URL** from Railway
2. **Open:** `frontend/assets/js/env.js`
3. **Find line 25:**
   ```javascript
   window.API_URL = isLocal 
       ? 'http://localhost:5000/api'
       : 'https://nacos-backend.up.railway.app/api';  // ← Change this
   ```
4. **Replace with new URL:**
   ```javascript
   window.API_URL = isLocal 
       ? 'http://localhost:5000/api'
       : 'https://[new-url-here]/api';  // ← Your new URL
   ```
5. **Save and commit:**
   ```bash
   cd frontend
   git add assets/js/env.js
   git commit -m "fix: update Railway backend URL"
   git push origin main
   ```
6. **Wait 2 minutes** for Netlify to redeploy
7. **Hard refresh:** Ctrl+Shift+R on your Netlify site

### Step 3C: If Service Is Missing/Deleted

You need to create a new Railway service. Follow the guide in `DEPLOY_TO_RAILWAY.md`.

**Quick version:**
1. Railway → New Project → Deploy from GitHub
2. Add ALL environment variables from `backend/.env`
3. Get new public URL
4. Update `frontend/assets/js/env.js` with new URL

### Step 4: Verify It Works (30 seconds)

```bash
# Test health endpoint
curl https://[your-url]/api/health

# Should return:
# {"status":"healthy","timestamp":"...","environment":"production"}
```

**Then test frontend:**
1. Go to https://nacos-tau-portal.netlify.app
2. Open DevTools (F12) → Console
3. Run:
   ```javascript
   fetch(window.API_URL + '/events/upcoming')
     .then(r => r.json())
     .then(d => console.log('✅ Works!', d))
   ```
4. Should see event data, NO errors

## Quick Fixes by Scenario

### Scenario A: "Service is running fine in Railway"
→ URL probably changed
→ Update `frontend/assets/js/env.js` with correct URL

### Scenario B: "Service shows as stopped/paused"
→ Click "Start" button
→ Wait 30 seconds
→ Test health endpoint

### Scenario C: "Service deployment failed (red X)"
→ Click on deployment to see logs
→ Fix the error shown in logs
→ Click "Redeploy"

### Scenario D: "Service doesn't exist / was deleted"
→ Create new Railway service (see DEPLOY_TO_RAILWAY.md)
→ Add environment variables
→ Update frontend URL

### Scenario E: "I don't have Railway access"
→ Check who created the Railway project
→ Get invited to the project
→ OR create your own Railway account and new project

## Environment Variables You'll Need

If recreating service, copy these from `backend/.env`:

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nacos-tau-portal.netlify.app
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[from .env]
SUPABASE_ANON_KEY=[from .env]
JWT_SECRET=[from .env]
RESEND_API_KEY=[from .env]
EMAIL_FROM=onboarding@resend.dev
GLOBAL_RATE_LIMIT=100
TRUST_PROXY=true
```

## Expected Timeline

| Action | Time |
|--------|------|
| Check Railway dashboard | 2 min |
| Restart service | 1 min |
| Update URL in frontend | 3 min |
| Test and verify | 2 min |
| **TOTAL** | **8 minutes** |

## What To Report Back

After checking Railway, tell me:

1. **Does the project exist?** (Yes/No)
2. **What is the status?** (Running/Stopped/Failed/Building)
3. **What is the public URL?** (Copy from Railway)
4. **Any errors in logs?** (Copy first 10 lines)

## After Railway Is Fixed

Once backend is working again:

1. ✅ Test frontend loads events
2. ✅ Test login works
3. ✅ Run migration 010 for audit logs (when Supabase is accessible)
4. ✅ Complete audit logs testing
5. ✅ Move to payment integration

---

**Status:** 🔴 BLOCKING - Fix this FIRST before anything else
**Priority:** P0 - Highest
**Time Estimate:** 5-15 minutes
**Help:** See RAILWAY_TROUBLESHOOTING.md for detailed guide
