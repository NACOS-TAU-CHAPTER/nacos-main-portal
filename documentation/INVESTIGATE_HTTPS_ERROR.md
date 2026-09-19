# Investigation: HTTPS Protocol Error on Localhost

## Current Status

### Error Still Occurring:
```
GET https://localhost:5000/api/health net::ERR_SSL_PROTOCOL_ERROR
GET https://localhost:5000/api/students/directory net::ERR_SSL_PROTOCOL_ERROR
```

### Root Cause Identified:
**Backend server is still running with old environment variables** (NODE_ENV=production)

## Investigation Steps Completed

### 1. Checked `.env` File ✅
**Status**: FIXED
- `NODE_ENV=development` (correct)
- `FRONTEND_URL=http://localhost:5000` (correct)

### 2. Checked Backend Process ✅
**Status**: RUNNING ON OLD CONFIG
- Port 5000: Process ID **38236**
- Server started **before** .env changes
- Still using `NODE_ENV=production` in memory

### 3. Checked Frontend Configuration ✅
**Status**: CORRECT
- `env.js` uses `http://localhost:5000` for local
- `security.js` uses `window.API_URL`
- No hardcoded HTTPS URLs

## The Problem

The backend server **must be restarted** to load the new `.env` values. Environment variables are read **once** when the server starts, not dynamically.

### Current Situation:
```
Backend Memory:     NODE_ENV=production    (from initial start)
.env File:          NODE_ENV=development   (changed but not loaded)
```

### After Restart:
```
Backend Memory:     NODE_ENV=development   (loaded from .env)
.env File:          NODE_ENV=development   (unchanged)
```

## Solution: Restart Backend Server

### Option 1: Quick Restart (Recommended)

**Step 1: Kill the old process**
```cmd
taskkill /F /PID 38236
```

**Step 2: Start backend**
```cmd
cd backend
node server.js
```

**Expected Output:**
```
🔗 Server running on port 5000
🛡️  Security Features:
   - HTTPS Enforcement: DISABLED (dev only)   ← Should say DISABLED
   - CSRF Protection: ENABLED/DISABLED
   - Sentry Monitoring: DISABLED
```

### Option 2: Use Restart Script

We created a batch file that does it automatically:

```cmd
cd backend
restart-backend.bat
```

### Option 3: Use npm restart (if configured)

```cmd
cd backend
npm restart
```

## Verification Steps

### 1. Check Server Output
After restart, look for:
```
✅ HTTPS enforcement enabled (production only)
```

This should show "production only" which means it's **disabled** in development.

### 2. Test Health Endpoint

**In browser console:**
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Should return:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "security": {
    "csrf": false,
    "rateLimit": true
  }
}
```

### 3. Check Frontend
Refresh your page and you should see:
```
✅ 🌍 Loading environment variables...
✅ 🔒 Security module loaded
✅ ✅ Supabase client initialized
```

No more `ERR_SSL_PROTOCOL_ERROR` errors!

## Why This Happened

### Timeline of Events:
1. ✅ Backend started with `NODE_ENV=production` (initial setup)
2. ✅ Production security enabled (HTTPS redirect active)
3. ✅ We changed `.env` to `NODE_ENV=development`
4. ❌ Server **not restarted** - still using old config in memory
5. ❌ Frontend tries HTTP, but server redirects to HTTPS
6. ❌ HTTPS fails because no SSL certificate on localhost

### The Fix:
- Restart server → loads new `.env` → HTTPS redirect disabled → HTTP works!

## Common Mistakes

### ❌ Don't Do This:
```bash
# Editing .env and expecting immediate effect
nano .env         # Changed NODE_ENV
# ... server still running with old config
```

### ✅ Do This Instead:
```bash
# Edit .env
nano .env         # Change NODE_ENV

# Restart server
taskkill /F /PID <process_id>
node server.js    # Loads new .env
```

## Long-Term Solution: Use nodemon

Install nodemon for auto-restart on file changes:

```bash
# Install globally
npm install -g nodemon

# Start with nodemon
nodemon server.js
```

Or add to `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

Then use:
```bash
npm run dev   # Auto-restarts on file changes
```

## Additional Checks

### If Still Getting HTTPS Errors After Restart:

#### Check 1: Verify NODE_ENV
In your server.js, add temporary logging:
```javascript
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
```

Should print: `🔧 NODE_ENV: development`

#### Check 2: Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

#### Check 3: Check Browser Cache
The browser might have cached the HTTPS redirect:
```
1. Go to chrome://settings/content/all
2. Find localhost:5000
3. Clear site data
```

#### Check 4: Use Incognito Mode
Test in incognito/private browsing to bypass cache.

#### Check 5: Check .env is Being Loaded
Add to server.js (temporarily):
```javascript
require('dotenv').config();
console.log('📋 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL
});
```

## Prevention

### Best Practices:
1. **Always restart** server after changing `.env`
2. **Use nodemon** for development
3. **Check logs** for "HTTPS enforcement DISABLED"
4. **Use separate** `.env.development` and `.env.production` files
5. **Document** which env vars require restart

### .env File Comments:
Add comments to remind yourself:
```env
# ⚠️ REQUIRES SERVER RESTART TO TAKE EFFECT
NODE_ENV=development

# ⚠️ REQUIRES SERVER RESTART
PORT=5000
```

## Summary

### Current Issue:
- ❌ Backend running with old environment (NODE_ENV=production)
- ❌ HTTPS enforcement still active
- ❌ Localhost requests failing

### Fix Required:
1. ✅ Kill process 38236
2. ✅ Restart backend server
3. ✅ Verify "HTTPS enforcement DISABLED" in logs
4. ✅ Test HTTP endpoint works

### Expected Result:
- ✅ HTTP requests work on localhost
- ✅ No more SSL protocol errors
- ✅ Development mode active
- ✅ Frontend loads correctly

## Need Help?

If still having issues after restart:
1. Check exact server output logs
2. Verify process was actually killed
3. Confirm new process started
4. Test with curl: `curl http://localhost:5000/api/health`
5. Check if another service is using port 5000
