# Railway Backend 404 Error - Complete Troubleshooting Guide

## Current Problem
```bash
curl https://nacos-backend.up.railway.app/api/health
# Returns: {"status":"error","code":404,"message":"Application not found"}
```

The Railway backend is completely unavailable. This is **NOT a CORS issue** - the server itself is not responding.

## Diagnosis: Railway Service Status

The 404 "Application not found" error indicates one of these scenarios:

1. **Service is stopped** - Railway paused/stopped the service
2. **Service was deleted** - The project was removed
3. **URL changed** - Railway assigned a new domain
4. **Deployment failed** - Last deployment crashed and didn't recover
5. **Railway is down** - Platform issue (unlikely)

## Step-by-Step Fix

### Step 1: Check Railway Dashboard (MOST IMPORTANT)

1. **Go to Railway Dashboard:**
   ```
   https://railway.app/dashboard
   ```

2. **Log in** with your account

3. **Find your NACOS Backend project:**
   - Look for project named "nacos-backend" or similar
   - Check if it exists in your projects list

4. **Check Service Status:**
   - Look for status indicator:
     - ✅ **Green/Running** - Service is running (go to Step 2)
     - ⚠️ **Yellow/Building** - Deployment in progress (wait)
     - 🔴 **Red/Failed** - Deployment failed (check logs)
     - ⏸️ **Stopped** - Service stopped (click "Start")
     - 🗑️ **Not Found** - Service deleted (go to Step 5)

### Step 2: Get Current Public URL

**The URL might have changed!**

1. In Railway Dashboard → Click your project
2. Click **Settings** tab
3. Look for **Domains** section
4. Check the **Public URL**:
   - Should look like: `https://nacos-backend.up.railway.app`
   - Or: `https://[something].railway.app`

5. **Copy the exact URL** and test it:
   ```bash
   curl https://[your-actual-url]/api/health
   ```

6. **If URL is different** from `https://nacos-backend.up.railway.app`:
   - Update `frontend/assets/js/env.js` (line 25)
   - Change to new URL
   - Commit and push to Netlify

### Step 3: Check Deployment Status

1. Railway Dashboard → Your Project
2. Click **Deployments** tab
3. Look at latest deployment:
   - **Success** ✅ - Service should be running
   - **Failed** ❌ - Click to see error logs
   - **Building** 🔄 - Wait for completion

4. **If deployment failed:**
   - Click on the failed deployment
   - Read error logs
   - Fix errors in code
   - Redeploy (see Step 4)

### Step 4: Redeploy / Restart Service

**Option A: If Service is Stopped**
1. Railway Dashboard → Your Project
2. Click **"Start"** or **"Resume"** button
3. Wait 30 seconds
4. Test: `curl https://[url]/api/health`

**Option B: If Service is Running But Not Responding**
1. Railway Dashboard → Your Project
2. Click **Settings** tab
3. Scroll to **"Restart"** button
4. Click **"Restart"**
5. Wait 1-2 minutes
6. Test: `curl https://[url]/api/health`

**Option C: Redeploy Latest Code**
1. Railway Dashboard → Your Project
2. Click **Deployments** tab
3. Click **"Redeploy"** on latest deployment
4. Wait 2-3 minutes
5. Test: `curl https://[url]/api/health`

**Option D: Push New Deployment (if connected to Git)**
```bash
cd backend
git add .
git commit -m "fix: trigger redeploy"
git push origin main
```
Railway will auto-deploy in 2-3 minutes.

### Step 5: If Service Was Deleted - Create New Railway Service

**This is more complex. Follow these steps:**

1. **Go to Railway Dashboard**
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your backend repository (or upload folder)
5. **Configure Environment Variables** (CRITICAL):

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nacos-tau-portal.netlify.app

SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-key-from-.env]
SUPABASE_ANON_KEY=[your-key-from-.env]

JWT_SECRET=[your-secret-from-.env]

RESEND_API_KEY=[your-key-from-.env]
EMAIL_FROM=onboarding@resend.dev

GLOBAL_RATE_LIMIT=100
TRUST_PROXY=true
```

6. **Get environment variable values:**
   ```bash
   # On your local machine
   cd backend
   type .env
   ```

7. **Set up custom domain** (optional):
   - Railway Settings → Domains
   - Click "Generate Domain"
   - Copy the new URL

8. **Update frontend:**
   - Edit `frontend/assets/js/env.js`
   - Change `API_URL` to new Railway URL
   - Commit and push to Netlify

### Step 6: Verify Environment Variables

Even if service is running, missing environment variables can cause issues.

1. Railway Dashboard → Your Project
2. Click **Variables** tab
3. **Verify all these exist:**
   - ✅ NODE_ENV
   - ✅ PORT
   - ✅ FRONTEND_URL
   - ✅ SUPABASE_URL
   - ✅ SUPABASE_SERVICE_ROLE_KEY
   - ✅ SUPABASE_ANON_KEY
   - ✅ JWT_SECRET
   - ✅ RESEND_API_KEY
   - ✅ EMAIL_FROM

4. **If any are missing:**
   - Click **"Add Variable"**
   - Get values from `backend/.env`
   - Click **"Redeploy"** after adding

### Step 7: Check Railway Logs

1. Railway Dashboard → Your Project
2. Click **Deployments** tab
3. Click on latest deployment
4. Look for **console logs**

**Expected logs:**
```
✅ Supabase clients initialized
✅ Resend email provider initialized
🚀 NACOS API Server running on port 5000
📡 Environment: Production
🔗 Frontend URL: https://nacos-tau-portal.netlify.app
```

**Bad signs:**
- ❌ Crash errors
- ❌ "Cannot find module" errors
- ❌ "Connection refused" errors
- ❌ Nothing (no logs = service not starting)

## Testing After Fix

### Test 1: Health Endpoint
```bash
curl https://nacos-backend.up.railway.app/api/health
```
**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-05T...",
  "environment": "production"
}
```

### Test 2: CORS Test from Browser

1. Open https://nacos-tau-portal.netlify.app
2. Open DevTools → Console
3. Run:
```javascript
fetch('https://nacos-backend.up.railway.app/api/events/upcoming')
  .then(res => res.json())
  .then(data => console.log('✅ CORS working!', data))
  .catch(err => console.error('❌ Failed:', err));
```

**Should see:** Event data ✅

### Test 3: Frontend Functionality

1. Go to https://nacos-tau-portal.netlify.app
2. Homepage should load events
3. No CORS errors in console
4. Try logging in
5. Check admin dashboard

## Common Railway Issues

### Issue: "Insufficient credits"
- **Cause:** Railway free tier expired
- **Solution:** Add payment method or upgrade plan

### Issue: "Build failed"
- **Cause:** Code errors, missing dependencies
- **Solution:** Check deployment logs, fix errors, redeploy

### Issue: "Service crashed"
- **Cause:** Runtime error in code
- **Solution:** Check Railway logs for crash reason

### Issue: "Port binding failed"
- **Cause:** App not listening on $PORT
- **Solution:** Ensure `server.js` uses `process.env.PORT`

## Alternative Solutions

### Option 1: Use Different Hosting Platform

If Railway continues having issues:

**Alternatives:**
- **Render** - Similar to Railway, free tier available
- **Heroku** - Classic PaaS (paid)
- **Vercel** - Can host Node.js backends (limited)
- **DigitalOcean App Platform** - $5/month

### Option 2: Run Backend Locally (Temporary)

While fixing Railway:

1. **Start local backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Use ngrok for public URL:**
   ```bash
   ngrok http 5000
   ```

3. **Update frontend temporarily:**
   - Change `API_URL` to ngrok URL
   - Only for testing!

## Prevention Tips

1. **Set up monitoring:**
   - Railway has built-in uptime monitoring
   - Enable email alerts for downtime

2. **Keep Railway project active:**
   - Free tier may pause after inactivity
   - Visit dashboard regularly

3. **Use custom domain:**
   - Railway-provided URLs can change
   - Custom domains are stable

4. **Enable auto-deploy:**
   - Connect Railway to GitHub
   - Auto-deploy on push to main branch

5. **Keep environment variables documented:**
   - Store them securely (1Password, etc.)
   - Easy to restore if service is recreated

## Contact Railway Support

If nothing works:

1. **Railway Discord:**
   - https://discord.gg/railway
   - Very responsive community

2. **Railway Status Page:**
   - https://status.railway.app
   - Check for platform issues

3. **Railway Documentation:**
   - https://docs.railway.app
   - Troubleshooting guides

## Summary Checklist

Before reaching out for help, complete this:

- [ ] Checked Railway dashboard - service exists
- [ ] Verified service status (Running/Stopped/Failed)
- [ ] Confirmed public URL hasn't changed
- [ ] Checked deployment logs for errors
- [ ] Verified all environment variables are set
- [ ] Tested health endpoint with correct URL
- [ ] Restarted/redeployed service
- [ ] Checked Railway status page for outages
- [ ] Tested local backend works fine

## Next Steps

**RIGHT NOW:**
1. Open Railway dashboard: https://railway.app/dashboard
2. Find your NACOS Backend project
3. Check the status and public URL
4. Report back what you see

**AFTER RAILWAY IS FIXED:**
1. Run migration 010 for audit logs RLS
2. Test audit logs functionality
3. Deploy payment integration (from PAYMENT_INTEGRATION_PLAN.md)

---

**Priority:** 🔴 URGENT - Blocks all frontend functionality
**Status:** Waiting for Railway dashboard check
**Time Required:** 5-15 minutes (if service just needs restart)
