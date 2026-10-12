# Fix CORS Error on Vercel Deployment

## 🔴 Error

```
Access to fetch at 'https://naco-tau-backend.vercel.app/api/payments/bachs-session' 
from origin 'https://nacosportal.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## 🎯 Root Causes

1. **Missing Environment Variable**: `FRONTEND_URL` not set on Vercel
2. **Vercel Serverless Functions**: Different behavior than regular Node.js server
3. **Security Headers**: Helmet or other middleware blocking OPTIONS requests

---

## ✅ Solution 1: Set Vercel Environment Variables (MOST LIKELY)

### Step 1: Add Environment Variable

1. Go to https://vercel.com/dashboard
2. Select your backend project: `naco-tau-backend`
3. Go to **Settings** → **Environment Variables**
4. Add the following:

```bash
Variable Name: FRONTEND_URL
Value: https://nacosportal.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

### Step 2: Also Set These Variables

```bash
Variable Name: NODE_ENV
Value: production
Environments: ✅ Production

Variable Name: ALLOW_LOCAL_CORS
Value: false
Environments: ✅ Production
```

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click latest deployment → **3 dots menu** → **Redeploy**
3. Wait 2 minutes for redeploy

### Step 4: Test

Visit https://nacosportal.vercel.app and try the payment again.

---

## ✅ Solution 2: Update Backend Code (DONE ✅)

I've already updated your `backend/server.js` with better CORS handling:

**Changes Made:**
- ✅ Added support for comma-separated `FRONTEND_URL` values
- ✅ Added `.pages.dev` (Cloudflare) support
- ✅ Better error messages for debugging
- ✅ Logging of allowed origins

**Now commit and push:**

```bash
cd "c:\Users\HP\Documents\nacos website"
git add backend/server.js
git commit -m "fix: improve CORS configuration for Vercel deployment"
git push origin master
```

Vercel will auto-deploy your backend in ~2 minutes.

---

## ✅ Solution 3: Create Vercel Configuration File

Create `backend/vercel.json` to ensure proper CORS headers:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "https://nacosportal.vercel.app",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-CSRF-Token",
        "Access-Control-Allow-Credentials": "true"
      }
    }
  ]
}
```

---

## ✅ Solution 4: Temporary Quick Fix (IF URGENT)

If you need an immediate fix, temporarily allow all Vercel domains:

**In `backend/server.js`, change the origin function:**

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Temporarily allow all Vercel deployments
    if (!origin || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Rest of your code...
  },
  // ... rest of options
};
```

**⚠️ WARNING**: This is less secure. Only use temporarily!

---

## 🧪 Testing Commands

### Test 1: Check Backend Health

```bash
curl -I https://naco-tau-backend.vercel.app/api/health
```

Expected:
```
HTTP/2 200
access-control-allow-origin: https://nacosportal.vercel.app
```

### Test 2: Test OPTIONS Preflight

```bash
curl -X OPTIONS https://naco-tau-backend.vercel.app/api/payments/bachs-session \
  -H "Origin: https://nacosportal.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

Expected:
```
HTTP/2 200
access-control-allow-origin: https://nacosportal.vercel.app
access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Test 3: Browser Console Test

On https://nacosportal.vercel.app, open console:

```javascript
fetch('https://naco-tau-backend.vercel.app/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ CORS Working!', d))
  .catch(e => console.error('❌ Still blocked:', e));
```

---

## 🔍 Debugging Steps

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Backend Project
2. Click **"Deployments"**
3. Click latest deployment
4. Click **"Functions"** tab
5. Look for CORS-related errors

### Check Browser Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try the failing request
4. Look for:
   - **OPTIONS** request (preflight)
   - Check response headers
   - Look for `Access-Control-Allow-Origin` header

### Common Issues

**Issue**: No `Access-Control-Allow-Origin` header in response
**Fix**: Environment variable not set OR CORS middleware not working

**Issue**: `Access-Control-Allow-Origin: null`
**Fix**: Origin is being blocked, check logs

**Issue**: OPTIONS request returns 404
**Fix**: Route not properly handling OPTIONS method

---

## 📋 Checklist

- [ ] Set `FRONTEND_URL` environment variable on Vercel
- [ ] Set `NODE_ENV=production` on Vercel
- [ ] Commit and push updated `server.js`
- [ ] Wait for Vercel to redeploy (2 minutes)
- [ ] Test with curl (OPTIONS request)
- [ ] Test in browser console
- [ ] Try actual payment flow
- [ ] Check Vercel logs if still failing

---

## 🎯 Expected Resolution Time

- **Solution 1** (Env vars): 5 minutes
- **Solution 2** (Code update): 10 minutes (including git push + Vercel deploy)
- **Solution 3** (vercel.json): 15 minutes
- **Solution 4** (Temporary): 5 minutes

---

## 🆘 If Still Not Working

### Option A: Check if Backend is Actually on Vercel

Your error shows: `https://naco-tau-backend.vercel.app`

Is this the correct URL? Check:
1. Vercel Dashboard → Deployments
2. Look for the actual domain

### Option B: Check if You Deployed to Render Instead

I see your `render.yaml` file. Did you deploy backend to **Render** instead of Vercel?

If so, the URL would be: `https://nacos-backend.onrender.com`

**Update frontend to use correct URL:**
```javascript
// In frontend/assets/js/api-config.js
const API_URL = 'https://nacos-backend.onrender.com/api'; // NOT naco-tau-backend.vercel.app
```

### Option C: Use Render for Backend (Recommended!)

Since you have `render.yaml` configured, I recommend using **Render** for backend instead of Vercel:

**Why?**
- ✅ Better for Node.js APIs
- ✅ No serverless quirks
- ✅ Free tier includes 750 hours
- ✅ Easier CORS configuration

**Deploy to Render**:
1. Go to https://render.com
2. New Web Service
3. Connect GitHub → `nacos-main-portal`
4. Root Directory: `backend`
5. Deploy!

---

## 📝 Summary

**Most Likely Fix**: Set `FRONTEND_URL=https://nacosportal.vercel.app` in Vercel environment variables and redeploy.

**Alternative**: Deploy backend to Render instead of Vercel (recommended for APIs).

**Code Changes**: Already done ✅ - just commit and push.

---

**Created**: September 19, 2026  
**Status**: Solutions provided, waiting for implementation  
**Priority**: HIGH - Blocks payment functionality

