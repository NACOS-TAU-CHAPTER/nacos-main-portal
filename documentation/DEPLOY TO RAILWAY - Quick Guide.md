# Deploy Backend to Railway - Quick Guide

## What Needs to be Deployed

The CORS fix in `backend/server.js` that allows your Netlify frontend to communicate with the Railway backend.

## Quick Deploy Steps

### Option 1: Git Push (If Railway Auto-Deploy is Enabled)

```bash
# Navigate to backend folder
cd backend

# Add the changed file
git add server.js

# Commit with descriptive message
git commit -m "fix: Update CORS to allow nacos-tau-portal.netlify.app origin"

# Push to main/master branch
git push origin main
```

**Railway will automatically:**
1. Detect the push
2. Start building
3. Deploy new version
4. Restart server with new code

**Wait:** 2-3 minutes for deployment to complete

### Option 2: Manual Deploy via Railway Dashboard

If auto-deploy isn't set up or you want to trigger manually:

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Login to your account
   - Select your backend project

2. **Trigger Redeploy**
   - Click **"Deployments"** tab
   - Click **"Deploy"** button (top right)
   - Or click **"•••"** on latest deployment → **"Redeploy"**

3. **Wait for Completion**
   - Watch the build logs
   - Green checkmark = successful deployment
   - Typically takes 2-3 minutes

## Verify Environment Variables

While waiting for deployment, check your Railway environment variables:

1. **In Railway Dashboard** → Your Project → **"Variables"** tab

2. **Ensure these are set:**

```
FRONTEND_URL=https://nacos-tau-portal.netlify.app
NODE_ENV=production
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-secret-key>
SUPABASE_ANON_KEY=<your-public-key>
ADMIN_EMAILS=nacos@tau.edu.ng
TRUST_PROXY=true
```

3. **Add FRONTEND_URL if missing:**
   - Click **"New Variable"**
   - Variable: `FRONTEND_URL`
   - Value: `https://nacos-tau-portal.netlify.app`
   - Click **"Add"**

## Test the Deployment

### 1. Check Health Endpoint

Open in browser or use curl:
```
https://nacos-backend.up.railway.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-07-27T12:34:56.789Z",
  "environment": "production"
}
```

### 2. Test from Frontend

1. Go to `https://nacos-tau-portal.netlify.app/admin-login.html`
2. Login to admin dashboard
3. Open browser DevTools → Console
4. **Check for:**
   - ✅ No CORS errors
   - ✅ API calls succeed (200 OK)
   - ✅ Data loads correctly

### 3. Verify Specific Endpoints

**Storage buckets:**
```
POST https://nacos-backend.up.railway.app/api/storage/ensure-buckets
→ Should return 200 OK
```

**Student list:**
```
GET https://nacos-backend.up.railway.app/api/students?page=1&limit=500&status=active
→ Should return 200 OK with student data
```

## Troubleshooting

### Deployment Failed

**Check Railway Logs:**
1. Railway Dashboard → Your Project
2. Click **"Logs"** tab
3. Look for error messages during build/start

**Common issues:**
- Missing dependencies → Run `npm install` locally first
- Syntax errors → Check server.js file
- Missing environment variables → Add them in Variables tab

### Deployment Succeeded But Still Getting CORS Errors

**Possible causes:**

1. **Browser cache:**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or open in Incognito/Private window

2. **Wrong branch deployed:**
   - Check Railway settings → which Git branch is connected?
   - Make sure you pushed to the correct branch

3. **Environment variable not set:**
   - Double-check FRONTEND_URL in Railway Variables tab
   - Should be: `https://nacos-tau-portal.netlify.app`

4. **Old deployment still running:**
   - Wait 5 minutes
   - Check Railway shows latest deployment is "Active"

### Railway Build Logs Show Errors

**Check these:**
- ✅ `package.json` has all dependencies
- ✅ Node version compatible (Railway uses Node 18+)
- ✅ No typos in server.js
- ✅ All `require()` statements point to existing files

## Railway Deployment Checklist

- [ ] Code changes committed to Git
- [ ] Pushed to correct branch (main/master)
- [ ] Railway detected the push (or manual deploy triggered)
- [ ] Build completed successfully (green checkmark)
- [ ] Deployment shows "Active" status
- [ ] Health endpoint returns 200 OK
- [ ] FRONTEND_URL environment variable set
- [ ] All required environment variables present
- [ ] Frontend refreshed with hard reload (Ctrl+Shift+R)
- [ ] No CORS errors in console
- [ ] API calls return 200 OK
- [ ] Admin dashboard loads data correctly

## Quick Commands Reference

```bash
# Check current branch
git branch

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "fix: Update CORS configuration"

# Push to main
git push origin main

# View recent commits
git log --oneline -5
```

## Expected Timeline

| Step | Time |
|------|------|
| Git commit and push | 30 seconds |
| Railway detects push | 10-30 seconds |
| Railway builds app | 1-2 minutes |
| Railway deploys | 30 seconds |
| **Total** | **2-3 minutes** |

## After Successful Deployment

Once CORS is fixed, you should see:

**Console (before):**
```
❌ net::ERR_FAILED
❌ CORS policy blocked
```

**Console (after):**
```
✅ POST /api/storage/ensure-buckets 200 OK
✅ GET /api/students 200 OK
✅ [storage] verified buckets cached (7): event-images, past-questions, ...
✅ [loadStudents] (active) backend returned 2 row(s)
```

## Need Help?

**Railway Dashboard:** https://railway.app  
**Railway Docs:** https://docs.railway.app  
**Railway Status:** https://railway.statuspage.io

---

**Status:** Ready to deploy  
**Time Required:** 5 minutes  
**Complexity:** Low (single file change)  
**Risk:** Low (only CORS config, no database changes)
