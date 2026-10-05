# Quick Start: Migrate to Vercel

## TL;DR - 5 Minute Migration

### Step 1: Deploy to Vercel (2 minutes)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select your repository
5. Set Root Directory: `frontend`
6. Click **"Deploy"**
7. Wait 60 seconds → Get your URL

### Step 2: Update Backend (1 minute)

1. Go to Railway dashboard
2. Select your backend
3. Update `FRONTEND_URL`: `https://your-project.vercel.app`
4. Save (auto-restarts)

### Step 3: Test (2 minutes)

1. Visit your Vercel URL
2. Check browser console - no CORS errors
3. Test login
4. Done! ✅

---

## Files Already Created

✅ `frontend/vercel.json` - Configuration ready
✅ `frontend/deploy-vercel.bat` - Deployment script
✅ `frontend/.gitignore` - Updated for Vercel

---

## What Changes?

**Your URL changes from:**
```
https://nacos-tau-portal.netlify.app
```

**To:**
```
https://your-project-name.vercel.app
```

**Everything else stays the same:**
- Railway backend URL (unchanged)
- Supabase database (unchanged)
- Code (unchanged)
- Features (unchanged)

---

## Benefits You Get

✅ **2x faster deployments** (30s vs 2min)
✅ **Unlimited build minutes** (was 300/month)
✅ **Free analytics** (was $9/month on Netlify)
✅ **Better performance** (33% faster TTFB)
✅ **Better developer experience**

---

## Full Documentation

- **Step-by-step guide**: `documentation/MIGRATE_NETLIFY_TO_VERCEL.md`
- **Comparison**: `documentation/NETLIFY_VS_VERCEL_COMPARISON.md`

---

## Need Help?

**Common Issues**:
- CORS errors → Update Railway `FRONTEND_URL`
- Site blank → Check root directory is `frontend`
- Assets not loading → Check file paths are relative

**Rollback**: Just keep Netlify running until you're confident!

---

**Time**: 5 minutes
**Difficulty**: Easy
**Risk**: None (can run both)
