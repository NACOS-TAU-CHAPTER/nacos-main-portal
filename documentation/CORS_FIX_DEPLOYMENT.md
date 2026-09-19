# CORS Fix - Railway Deployment Guide

## Issue
Frontend (`https://nacos-tau-portal.netlify.app`) getting CORS errors when accessing Railway backend API:
```
Access to fetch at 'https://nacos-backend.up.railway.app/api/...' from origin 'https://nacos-tau-portal.netlify.app' has been blocked by CORS policy
```

## Root Cause
The Railway backend wasn't properly handling CORS preflight OPTIONS requests from the Netlify frontend.

## Fix Applied
Updated `backend/server.js`:
1. Added explicit OPTIONS handler: `app.options('*', cors())`
2. Added `exposedHeaders` to CORS config
3. Ensured Netlify URL is in `allowedOrigins` list

## Deployment Steps

### Step 1: Verify Environment Variables on Railway
Go to your Railway project settings and ensure these environment variables are set:

```bash
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nacos-tau-portal.netlify.app

# Supabase credentials
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>

# JWT Secret
JWT_SECRET=<your-jwt-secret>

# Email configuration (Resend)
RESEND_API_KEY=<your-resend-api-key>
EMAIL_FROM=onboarding@resend.dev

# Rate limiting
GLOBAL_RATE_LIMIT=100

# Proxy trust (for Railway)
TRUST_PROXY=true
```

### Step 2: Deploy to Railway

**Option A: Using Railway CLI**
```bash
cd backend
railway up
```

**Option B: Git Push (if connected to GitHub)**
```bash
git add .
git commit -m "fix: Add explicit CORS preflight handler for Railway deployment"
git push origin main
```

Railway will automatically detect the push and redeploy.

**Option C: Manual Deploy from Railway Dashboard**
1. Go to Railway dashboard
2. Select your project
3. Click "Deploy" or "Redeploy"

### Step 3: Verify Deployment

After deployment completes, test the CORS fix:

1. **Check health endpoint:**
   ```bash
   curl https://nacos-backend.up.railway.app/api/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-08-04T...",
     "environment": "production"
   }
   ```

2. **Test CORS preflight from browser console:**
   Open `https://nacos-tau-portal.netlify.app`, then in browser console:
   ```javascript
   fetch('https://nacos-backend.up.railway.app/api/health', {
     method: 'OPTIONS',
     headers: {
       'Origin': 'https://nacos-tau-portal.netlify.app',
       'Access-Control-Request-Method': 'GET',
       'Access-Control-Request-Headers': 'Content-Type'
     }
   }).then(res => console.log('OPTIONS Response:', res.status, res.headers.get('Access-Control-Allow-Origin')))
   ```
   Should log: `OPTIONS Response: 200 https://nacos-tau-portal.netlify.app`

3. **Test actual API call:**
   ```javascript
   fetch('https://nacos-backend.up.railway.app/api/events/upcoming')
     .then(res => res.json())
     .then(data => console.log('Events:', data))
     .catch(err => console.error('Error:', err));
   ```
   Should return events data without CORS errors.

### Step 4: Clear Browser Cache

After deployment, clear browser cache or do a hard refresh:
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

## Troubleshooting

### If CORS errors persist:

1. **Check Railway logs:**
   ```bash
   railway logs
   ```
   Look for:
   - `⚠️ CORS blocked origin: https://nacos-tau-portal.netlify.app`
   - Any startup errors

2. **Verify environment variables:**
   Make sure `FRONTEND_URL` is set correctly on Railway

3. **Check if backend is running:**
   ```bash
   curl https://nacos-backend.up.railway.app/api/health
   ```

4. **Verify the deployed code:**
   - Check Railway dashboard to see deployment status
   - Ensure the latest commit was deployed
   - Check build logs for any errors

5. **Test from Postman:**
   - Send OPTIONS request to any endpoint
   - Check for `Access-Control-Allow-Origin` header in response

### Common Issues

**Issue**: "Origin not allowed by CORS policy"
**Solution**: Add the origin to `allowedOrigins` array in `server.js` and redeploy

**Issue**: "No Access-Control-Allow-Origin header present"
**Solution**: Ensure `app.options('*', cors())` is present and Railway has restarted

**Issue**: 502 Bad Gateway
**Solution**: Check Railway logs for server startup errors, verify all env vars are set

## Success Indicators

✅ No CORS errors in browser console
✅ API calls from Netlify frontend work properly
✅ Student directory loads without errors
✅ Event listing loads correctly
✅ Upload functionality works

## Notes

- Railway automatically rebuilds on git push if connected to GitHub
- Changes to environment variables require manual restart: Settings → Restart
- CORS is configured to allow credentials (cookies, auth tokens)
- Rate limiting is set to 100 requests per 15 minutes per IP
