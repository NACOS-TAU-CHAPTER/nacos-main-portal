# Fix Local Server HTTPS Protocol Error

## Problem
```
GET https://localhost:5000/api/health net::ERR_SSL_PROTOCOL_ERROR
GET https://localhost:5000/api/events/past net::ERR_SSL_PROTOCOL_ERROR
```

## Root Cause
The local `.env` file had `NODE_ENV=production`, which activated:
- HTTPS enforcement middleware
- Production security headers (HSTS, upgrade-insecure-requests)
- Strict CSP policies
- Production-only redirects

Since localhost doesn't have SSL certificates, all HTTPS requests failed with `ERR_SSL_PROTOCOL_ERROR`.

## Solution

### Fixed `.env` Issues:
1. **NODE_ENV**: Changed from `production` → `development`
2. **FRONTEND_URL**: Fixed malformed `==` → `=`

### Changes Made (`backend/.env`):
```diff
PORT=5000
- NODE_ENV=production
+ NODE_ENV=development

# CORS Configuration
- FRONTEND_URL==http://localhost:5000
+ FRONTEND_URL=http://localhost:5000
```

## Why This Matters

### Development Mode (`NODE_ENV=development`):
✅ HTTPS redirect: **DISABLED**  
✅ Secure cookies: **DISABLED** (allows HTTP)  
✅ HSTS headers: **DISABLED**  
✅ CSP upgrade-insecure-requests: **DISABLED**  
✅ Works on localhost with HTTP  

### Production Mode (`NODE_ENV=production`):
🔒 HTTPS redirect: **ENABLED**  
🔒 Secure cookies: **ENABLED** (HTTPS only)  
🔒 HSTS headers: **ENABLED**  
🔒 CSP upgrade-insecure-requests: **ENABLED**  
❌ Breaks on localhost without SSL certificates  

## How to Restart Backend

### Option 1: Stop and Start
```bash
# Find the process
netstat -ano | findstr :5000

# Kill process (replace 2280 with your PID)
taskkill /PID 2280 /F

# Start backend
cd backend
npm start
```

### Option 2: Use nodemon (auto-restart)
```bash
cd backend
npm install -g nodemon
nodemon server.js
```

## Verification

After restarting, you should see:
```
🔗 Server running on port 5000
🛡️  Security Features:
   - HTTPS Enforcement: DISABLED (dev only)
   - CSRF Protection: ENABLED/DISABLED
   - Sentry Monitoring: DISABLED
```

Then test in browser console:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
// Should return: { status: 'ok', timestamp: '...', security: {...} }
```

## About mkcert

**Do you need mkcert?** → **NO, not necessary**

### Why mkcert exists:
- Allows localhost to use HTTPS with trusted certificates
- Useful when testing OAuth, service workers, or APIs that require HTTPS

### Why you DON'T need it:
- Your app works fine on HTTP in development
- Production uses Railway's SSL (already working)
- Adding mkcert adds complexity for no benefit
- You'd need to install and configure certificates for every developer

### When you WOULD need it:
- Testing browser features that require HTTPS (service workers, web push, etc.)
- Testing OAuth providers that require HTTPS redirect URLs
- Matching production environment exactly in development

## Current Setup (Recommended)

### Local Development:
- **Backend**: `http://localhost:5000` (NODE_ENV=development)
- **Frontend**: Open HTML files directly or use Live Server
- **Security**: Basic security enabled, HTTPS enforcement disabled

### Production:
- **Backend**: `https://nacos-tau-frontend.onrender.com` (NODE_ENV=production)
- **Frontend**: `https://nacos-tau-portal.netlify.app`
- **Security**: Full security suite enabled (HTTPS, HSTS, CSRF, CSP, etc.)

## Environment Variables Summary

### `.env` (Local Development):
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000
ENABLE_CSRF=false           # Optional: disable for easier local testing
TRUST_PROXY=false          # No proxy in local development
```

### Railway (Production):
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://nacos-tau-portal.netlify.app
ENABLE_CSRF=true           # CSRF protection enabled
TRUST_PROXY=true          # Railway is behind proxy
SENTRY_DSN=...            # Error monitoring
```

## Troubleshooting

### If you still see HTTPS errors:
1. Verify backend is running: `netstat -ano | findstr :5000`
2. Check `.env` file: `NODE_ENV` must be `development`
3. Restart backend server completely
4. Clear browser cache and hard refresh (Ctrl+Shift+R)
5. Check browser console for actual API URL being used

### If CORS errors appear:
1. Verify `FRONTEND_URL` in `.env` matches your frontend
2. If opening files directly, use: `FRONTEND_URL=*` (development only!)
3. Better: Use a local server (Live Server extension in VS Code)

### If CSRF errors appear:
1. Set `ENABLE_CSRF=false` in local `.env`
2. Or implement CSRF token handling in frontend (already done)
3. Restart backend after changing

## Related Files
- `backend/.env` - Environment configuration
- `backend/server.js` - Server setup
- `backend/config/security.js` - Security middleware (HTTPS redirect logic)
- `frontend/assets/js/env.js` - Frontend API URL configuration

## Security Note
**Never commit `.env` files!** They contain secrets (API keys, JWT secrets, etc.)

The `.gitignore` should have:
```
.env
.env.local
.env.*.local
```
