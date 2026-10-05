# Deploy Frontend URL Fix - Step-by-Step Guide

## What Changed

✅ **Updated:** `frontend/assets/js/env.js`
- **Old URL:** `https://nacos-backend.up.railway.app/api`
- **New URL:** `https://nacos-tau-frontend.onrender.com/api`

## Step 1: Test Railway Backend (IMPORTANT)

Before deploying, verify the Railway backend is responding:

```bash
# Run the test script
test-new-railway-url.bat

# OR manually test
curl https://nacos-tau-frontend.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-08-05T...",
  "environment": "production"
}
```

**If you get 404 or error:**
- Railway backend might still be down
- Go to Railway dashboard and click "Restart"
- Wait 30 seconds and test again

## Step 2: Commit Frontend Changes

```bash
cd frontend
git add assets/js/env.js
git commit -m "fix: update Railway backend URL to production domain"
```

**Alternative (if not in frontend folder):**
```bash
git add frontend/assets/js/env.js
git commit -m "fix: update Railway backend URL to production domain"
```

## Step 3: Push to GitHub/Repository

```bash
git push origin main
```

**OR if your branch is different:**
```bash
git push origin master
# or
git push origin your-branch-name
```

## Step 4: Verify Netlify Deployment

1. **Go to Netlify Dashboard:**
   - https://app.netlify.com

2. **Find your NACOS site:**
   - Look for "nacos-tau-portal" or similar

3. **Check deployment status:**
   - Should see "Building..." → "Published" (takes 1-2 minutes)
   - Look for green checkmark ✅

4. **Deployment failed?**
   - Click on the failed deployment
   - Read error logs
   - Usually just needs a retry (click "Retry deploy")

## Step 5: Test Frontend (After Netlify Deploys)

### Test A: Hard Refresh Browser

1. Go to: https://nacos-tau-portal.netlify.app
2. Press: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
3. Open DevTools (F12) → Console tab
4. Look for:
   - ✅ NO CORS errors
   - ✅ `🌍 Loading environment variables...`
   - ✅ Events loading on homepage

### Test B: Verify API URL in Console

In browser console (on Netlify site):

```javascript
// Check current API URL
console.log('API URL:', window.API_URL);
// Should show: https://nacos-tau-frontend.onrender.com/api

// Test connection
fetch(window.API_URL + '/events/upcoming')
  .then(r => r.json())
  .then(d => console.log('✅ Backend connected!', d))
  .catch(e => console.error('❌ Connection failed:', e));
```

### Test C: Check Homepage Events

1. Homepage should display events
2. Both hardcoded featured events AND database events
3. No error messages or "Failed to load" warnings

### Test D: Test Admin Login

1. Go to: https://nacos-tau-portal.netlify.app/admin-login.html
2. Try logging in with admin credentials
3. Should redirect to admin dashboard
4. Check if audit logs link appears in navigation

## Troubleshooting

### Issue: CORS Errors Still Appearing

**Solution 1: Cache Issue**
- Hard refresh: Ctrl + Shift + R
- OR clear browser cache completely
- OR open in Incognito/Private window

**Solution 2: Verify Netlify Deployed**
- Check Netlify dashboard shows "Published"
- Check deployment timestamp is recent (within last 5 minutes)

**Solution 3: Check env.js Was Updated**
- Go to: https://nacos-tau-portal.netlify.app/assets/js/env.js
- Should see new URL in the code
- If still showing old URL, Netlify didn't deploy yet

### Issue: "Failed to Fetch" Errors

**Cause:** Railway backend is down or not responding

**Solution:**
1. Test backend directly: `curl https://nacos-tau-frontend.onrender.com/api/health`
2. If fails, go to Railway dashboard
3. Click "Restart" or "Redeploy"
4. Wait 1-2 minutes
5. Test again

### Issue: Events Not Loading

**Check in DevTools Console:**

```javascript
// 1. Verify API URL is correct
console.log(window.API_URL);

// 2. Test endpoint directly
fetch(window.API_URL + '/events/upcoming')
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Data:', d))
  .catch(e => console.error('Error:', e));
```

**Look for:**
- Status: 200 ✅ (good)
- Status: 404 ❌ (endpoint not found)
- Status: 500 ❌ (backend error)
- Network error ❌ (CORS or connection issue)

### Issue: Netlify Not Auto-Deploying

**Manual Deploy:**
1. Netlify Dashboard → Your Site
2. Click "Deploys" tab
3. Click "Trigger deploy" → "Deploy site"
4. Wait 2 minutes
5. Test again

## Verification Checklist

After deployment:

- [ ] Railway backend health check passes
- [ ] Railway backend returns events data
- [ ] Frontend committed and pushed to Git
- [ ] Netlify shows "Published" status
- [ ] Netlify deployment timestamp is recent
- [ ] Browser hard-refreshed (Ctrl+Shift+R)
- [ ] No CORS errors in browser console
- [ ] `window.API_URL` shows correct URL
- [ ] Homepage loads events without errors
- [ ] Admin login works
- [ ] Admin dashboard accessible

## Expected Timeline

| Step | Time |
|------|------|
| Test Railway backend | 30 sec |
| Commit changes | 30 sec |
| Push to Git | 10 sec |
| Netlify auto-deploy | 1-2 min |
| Hard refresh and test | 1 min |
| **TOTAL** | **4-5 minutes** |

## After Everything Works

Once frontend is loading correctly:

### Priority 1: Fix Audit Logs RLS Issue

The audit logs page exists but can't INSERT due to RLS policy error.

**Next steps:**
1. Wait for Supabase dashboard to be accessible
2. Run migration 010: `backend/migrations/010_fix_audit_logs_rls.sql`
3. OR install `pg` module and run: `node backend/scripts/migrate-010-direct.js`
4. Test audit logs page works

### Priority 2: Clean Up Audit Log Action Names

Currently showing ugly names like `auto_POST__register`.

**Already fixed in code, needs testing:**
- `backend/middleware/audit.js` maps to clean names
- After RLS is fixed, verify shows nice names like "Student Registration"

### Priority 3: Payment Integration

Implement Paystack payment system (plan already created in `PAYMENT_INTEGRATION_PLAN.md`).

## Quick Commands Reference

```bash
# Test Railway backend
curl https://nacos-tau-frontend.onrender.com/api/health

# Commit and push
git add frontend/assets/js/env.js
git commit -m "fix: update Railway backend URL"
git push origin main

# Test from browser console (on Netlify site)
fetch(window.API_URL + '/health').then(r => r.json()).then(console.log)

# Check API URL
console.log(window.API_URL)
```

## Need Help?

**Railway Issues:**
- Dashboard: https://railway.app/dashboard
- Status: https://status.railway.app
- Discord: https://discord.gg/railway

**Netlify Issues:**
- Dashboard: https://app.netlify.com
- Status: https://www.netlifystatus.com
- Docs: https://docs.netlify.com

**Supabase Issues:**
- Dashboard: https://supabase.com/dashboard
- Status: https://status.supabase.com

---

**Status:** Ready to deploy
**Priority:** High - Blocks all frontend functionality
**Time Required:** 4-5 minutes
