# CORS Error Fix - Railway Backend

## Problem

Your frontend on Netlify is getting blocked by CORS when trying to call your Railway backend:

```
Access to fetch at 'https://nacos-backend.up.railway.app/api/...' 
from origin 'https://nacos-tau-portal.netlify.app' 
has been blocked by CORS policy
```

## Root Cause

The backend's CORS configuration was set to only allow:
```javascript
origin: 'https://nacos-tau-chapter.netlify.app'
```

But your actual frontend URL is:
```
https://nacos-tau-portal.netlify.app
```

**Result:** Backend rejects all requests from your frontend.

## Fix Applied

### 1. Updated `backend/server.js`

**Changed from:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://nacos-tau-chapter.netlify.app',
  credentials: true,
  optionsSuccessStatus: 200
}));
```

**Changed to:**
```javascript
const allowedOrigins = [
  'https://nacos-tau-portal.netlify.app',       // Current frontend
  'https://nacos-tau-chapter.netlify.app',      // Legacy (if still used)
  'http://localhost:5500',                       // Live Server
  'http://localhost:8080',                       // http-server
  'http://localhost:3000',                       // Dev server
  'http://127.0.0.1:5500',
  'http://127.0.0.1:8080',
];

// Add custom FRONTEND_URL from env
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
```

**Benefits:**
- ✅ Supports multiple frontend URLs
- ✅ Works for local development AND production
- ✅ Logs blocked origins for debugging
- ✅ Explicitly lists allowed methods and headers
- ✅ Allows credentials (cookies, auth headers)

### 2. Railway Environment Variable (Optional)

Set this in your **Railway dashboard** → **Variables**:

```
FRONTEND_URL=https://nacos-tau-portal.netlify.app
```

This ensures the environment variable matches your actual frontend.

## Deployment Steps

### Step 1: Commit and Push Backend Changes

```bash
cd backend
git add server.js
git commit -m "fix: Update CORS to allow nacos-tau-portal.netlify.app"
git push
```

### Step 2: Deploy to Railway

**Option A: Automatic (if Railway GitHub integration is set up)**
- Railway will auto-deploy when you push to main branch
- Wait 2-3 minutes for deployment

**Option B: Manual Deploy**
1. Go to Railway dashboard
2. Select your backend project
3. Click **"Deploy"** or **"Redeploy"**
4. Wait for deployment to complete

### Step 3: Verify Environment Variables

In Railway Dashboard → Your Project → **Variables** tab:

Ensure these are set:
```
NODE_ENV=production
FRONTEND_URL=https://nacos-tau-portal.netlify.app
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>
ADMIN_EMAILS=<your-admin-emails>
TRUST_PROXY=true
```

### Step 4: Test the Fix

1. **Wait 2-3 minutes** after Railway deployment completes
2. **Hard refresh your frontend** (Ctrl+Shift+R)
3. **Open admin dashboard**
4. **Check console** - CORS errors should be gone ✅
5. **Test functionality:**
   - Upload past question
   - Load students
   - View events
   - Check payment verification

## Verification Checklist

After deploying:

- [ ] Railway shows deployment successful
- [ ] FRONTEND_URL environment variable set correctly
- [ ] Frontend refreshed with hard reload
- [ ] No CORS errors in console
- [ ] Backend API calls succeed
- [ ] Student list loads
- [ ] Past questions upload works
- [ ] Storage buckets verified
- [ ] No "net::ERR_FAILED" errors

## Console Output - Before vs After

### Before (CORS Error):
```
❌ Access to fetch at 'https://nacos-backend.up.railway.app/api/storage/ensure-buckets' 
   from origin 'https://nacos-tau-portal.netlify.app' 
   has been blocked by CORS policy

❌ POST https://nacos-backend.up.railway.app/api/storage/ensure-buckets 
   net::ERR_FAILED
```

### After (Fixed):
```
✅ POST https://nacos-backend.up.railway.app/api/storage/ensure-buckets 200 OK
✅ GET https://nacos-backend.up.railway.app/api/students?page=1&limit=500 200 OK
✅ [loadStudents] (active) backend returned 2 row(s)
```

## Troubleshooting

### Issue: Still getting CORS errors after deploy

**Possible Causes:**
1. Railway deployment not complete
2. Browser cached old response
3. Environment variable not set

**Fix:**
1. Check Railway dashboard - is deployment done?
2. Hard refresh browser (Ctrl+Shift+R)
3. Check Railway Variables tab - FRONTEND_URL set?
4. Wait 5 minutes and try again

### Issue: CORS works but other errors appear

**This is progress!** CORS is fixed, now we're seeing the real errors.

Common next issues:
- Missing database tables → Run migrations (see earlier guides)
- Missing environment variables → Check Railway Variables
- Authentication errors → Check Supabase keys

### Issue: Localhost works but production doesn't

**Cause:** Forgot to deploy backend changes to Railway

**Fix:**
1. Verify changes are committed and pushed to Git
2. Check Railway is connected to correct Git repo/branch
3. Manually trigger redeploy in Railway dashboard

### Issue: Railway logs show errors

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click your project
3. Click **"Logs"** tab
4. Look for errors during startup

Common startup errors:
- Missing environment variables
- Invalid Supabase keys
- Port binding issues

## Railway Configuration

### Required Environment Variables

```bash
# Server
PORT=5000  # Railway sets this automatically, but you can specify
NODE_ENV=production
TRUST_PROXY=true

# Frontend
FRONTEND_URL=https://nacos-tau-portal.netlify.app

# Supabase
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<secret>
SUPABASE_ANON_KEY=<public>

# Admin
ADMIN_EMAILS=nacos@tau.edu.ng
ADMIN_PASSWORD=<secure-password>

# Rate Limiting (optional)
GLOBAL_RATE_LIMIT=100
```

### Health Check

Test if your backend is running:

```bash
# Browser or curl
https://nacos-backend.up.railway.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-27T...",
  "environment": "production"
}
```

## Additional CORS Origins

If you have multiple frontend URLs (staging, preview, etc.), add them to the `allowedOrigins` array in server.js:

```javascript
const allowedOrigins = [
  'https://nacos-tau-portal.netlify.app',              // Production
  'https://deploy-preview-123--nacos-tau.netlify.app', // Netlify preview
  'https://staging-nacos.netlify.app',                 // Staging
  'http://localhost:5500',                             // Local dev
  // ... more URLs
];
```

Then redeploy to Railway.

## Files Modified

1. ✅ `backend/server.js` - Updated CORS configuration

## Next Steps After CORS Fix

Once CORS is resolved, you may need to:

1. ✅ Run database migrations (if tables are missing)
2. ✅ Verify Supabase RLS policies
3. ✅ Test all API endpoints
4. ✅ Check storage bucket permissions
5. ✅ Verify admin authentication

---

**Status:** Code fixed, deployment required  
**Action Required:** Deploy backend to Railway  
**Estimated Time:** 5 minutes (deploy + verification)  
**Priority:** High (blocks all backend functionality)
