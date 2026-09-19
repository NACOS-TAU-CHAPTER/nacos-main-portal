# Deploy Backend to Railway - Complete Guide

## Current Issue
CORS error on Netlify frontend:
```
Access to fetch at 'https://nacos-backend.up.railway.app/api/events/upcoming' 
from origin 'https://nacos-tau-portal.netlify.app' has been blocked by CORS policy
```

## Solution
Redeploy the backend to Railway with the latest CORS fixes.

## Prerequisites
- ✅ Backend code with CORS fixes (you have this)
- ✅ Railway account
- ✅ Railway project connected to your backend

## Deployment Options

### Option 1: GitHub Push (EASIEST if connected) ⭐

**If your backend is connected to GitHub:**

1. **Commit latest changes:**
   ```bash
   cd backend
   git add .
   git commit -m "fix: Update CORS config and add audit logs routes"
   git push origin main
   ```

2. **Railway auto-deploys:**
   - Railway detects the push
   - Automatically rebuilds
   - Deploys in 2-3 minutes

3. **Verify deployment:**
   - Check Railway dashboard for deployment status
   - Look for green checkmark ✅

### Option 2: Railway CLI

**If CLI is installed:**

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Deploy:**
   ```bash
   railway up
   ```

3. **Wait for deployment:**
   - Railway uploads and builds
   - Should complete in 2-3 minutes

### Option 3: Manual Redeploy (Railway Dashboard)

**If nothing else works:**

1. Go to **Railway Dashboard**: https://railway.app
2. Click on your **NACOS Backend** project
3. Go to **Deployments** tab
4. Click **"Redeploy"** on the latest deployment
5. Wait for green checkmark ✅

### Option 4: Force Rebuild

**If code hasn't changed but you need to restart:**

1. Railway Dashboard → Your Project
2. Click **Settings** tab
3. Scroll down to **"Danger Zone"**
4. Click **"Restart"** or **"Redeploy"**

## Environment Variables to Verify

After deployment, verify these are set in Railway:

```bash
# Required
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nacos-tau-portal.netlify.app

# Supabase
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# JWT
JWT_SECRET=your-jwt-secret

# Email (Resend)
RESEND_API_KEY=your-resend-key
EMAIL_FROM=onboarding@resend.dev

# Optional
GLOBAL_RATE_LIMIT=100
TRUST_PROXY=true
```

**To check/set environment variables:**
1. Railway Dashboard → Your Project
2. Click **Variables** tab
3. Add any missing variables
4. Click **"Redeploy"** to apply changes

## Verify Deployment Success

### Step 1: Check Health Endpoint
```bash
curl https://nacos-backend.up.railway.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-04T...",
  "environment": "production"
}
```

### Step 2: Test CORS from Browser Console

Open https://nacos-tau-portal.netlify.app and run in console:

```javascript
fetch('https://nacos-backend.up.railway.app/api/events/upcoming')
  .then(res => res.json())
  .then(data => console.log('✅ CORS working!', data))
  .catch(err => console.error('❌ CORS failed:', err));
```

**Should see:** Event data, NO CORS errors ✅

### Step 3: Check Railway Logs

1. Railway Dashboard → Your Project
2. Click **Deployments** tab
3. Click on latest deployment
4. Check logs for:
   - ✅ `🚀 NACOS API Server running on port 5000`
   - ✅ `📡 Environment: production`
   - ✅ `🔗 Frontend URL: https://nacos-tau-portal.netlify.app`
   - ❌ NO CORS warnings or errors

### Step 4: Test on Actual Frontend

1. Go to https://nacos-tau-portal.netlify.app
2. Check homepage loads events
3. Open DevTools → Console
4. Should see NO CORS errors
5. Events should display

## Common Issues & Solutions

### Issue: "Build Failed"

**Check:**
- Railway logs for error messages
- package.json is valid JSON
- All dependencies are listed
- Node version compatibility

**Solution:**
- Fix errors in code
- Commit and push again

### Issue: Still Getting CORS Errors

**Solutions:**

1. **Hard refresh frontend:**
   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)

2. **Check Railway logs:**
   ```
   ⚠️ CORS blocked origin: https://nacos-tau-portal.netlify.app
   ```
   - If you see this, FRONTEND_URL env variable might be wrong

3. **Verify environment variables:**
   - Railway Dashboard → Variables
   - Ensure `FRONTEND_URL=https://nacos-tau-portal.netlify.app`
   - No trailing slashes!

4. **Check backend is actually updated:**
   - Railway logs should show latest commit message
   - Deployment timestamp should be recent

### Issue: "Cannot find module"

**Cause:** New dependencies not installed

**Solution:**
1. Check `package.json` includes all dependencies
2. Railway should auto-install via `npm install`
3. If not, check Railway build logs

### Issue: Backend Running But Not Responding

**Solutions:**
1. Check Railway logs for crash/errors
2. Verify `PORT` environment variable
3. Restart: Railway Dashboard → Restart

## Railway Configuration Files

### Procfile (optional but recommended)
Create `backend/Procfile`:
```
web: node server.js
```

### railway.json (optional)
Create `backend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Rollback if Needed

If deployment breaks something:

1. Railway Dashboard → Deployments
2. Find last working deployment
3. Click **"Redeploy"**
4. Railway restores that version

## Post-Deployment Checklist

After successful deployment:

- [ ] Health endpoint responds
- [ ] CORS test passes
- [ ] Frontend loads without CORS errors
- [ ] Events display on homepage
- [ ] Admin dashboard accessible
- [ ] Login works
- [ ] Audit logs page accessible (if completed)
- [ ] No errors in Railway logs
- [ ] No errors in browser console

## Performance Optimization

**After deployment, consider:**

1. **Enable Railway's CDN** for faster responses
2. **Set up domain** (custom domain looks more professional)
3. **Monitor logs** for errors
4. **Set up alerts** for downtime

## Estimated Deployment Time

- **Git push method**: 2-3 minutes
- **Railway CLI**: 2-3 minutes  
- **Manual redeploy**: 1-2 minutes

## Need Help?

**Railway Support:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app
- Status: https://status.railway.app

**Check if Railway is down:**
- https://status.railway.app
- If red, wait for them to fix issues

---

## Quick Command Reference

```bash
# Check if backend is running locally
cd backend
node server.js

# Deploy with Railway CLI
railway up

# View Railway logs
railway logs

# Check health
curl https://nacos-backend.up.railway.app/api/health

# Test CORS from command line
curl -H "Origin: https://nacos-tau-portal.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     --verbose \
     https://nacos-backend.up.railway.app/api/events/upcoming
```

---

**Status**: Ready to deploy
**Priority**: High (blocks frontend functionality)
**Time Required**: 3-5 minutes
