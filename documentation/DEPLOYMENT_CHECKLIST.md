# Complete Deployment Checklist - All Recent Fixes

## Summary of Changes

### 1. Student Directory Level Display Fix
- **Backend**: Query `students_with_current_level` view instead of `students` table
- **Backend**: Filter by `current_level` instead of `year_of_study`
- **Frontend**: Display `current_level` with graduation badge instead of raw `year_of_study`
- **Files**: `backend/routes/students.js`, `frontend/student-dashboard.html`

### 2. Validation Fix for year_of_study
- **Backend**: Changed validation from level values (100-500) to enrollment years (2020-2027)
- **Files**: `backend/middleware/validation.js`

### 3. Local Development Environment Fix
- **Local .env**: Set `NODE_ENV=development` (not production)
- **Local .env**: Fixed `FRONTEND_URL` double equals
- **Files**: `backend/.env` (local only, not for deployment)

## Backend Deployment to Railway

### Files Changed:
```
backend/routes/students.js
backend/middleware/validation.js
```

### Deployment Steps:

```bash
cd backend

# Check current changes
git status

# Add changed files
git add routes/students.js middleware/validation.js

# Commit with descriptive message
git commit -m "Fix student directory levels and year_of_study validation

- Query students_with_current_level view for accurate level display
- Filter by current_level instead of year_of_study
- Fix validation to accept enrollment years (2020-2027) not levels (100-500)
- Resolves profile update validation errors"

# Push to Railway
git push origin main
```

### Railway Auto-Deploy:
- Railway will detect the push and automatically deploy
- Check Railway logs for successful deployment
- Look for: "Build successful" and "Deployment live"

### Verify Deployment:
```bash
# Test health endpoint
curl https://nacos-tau-frontend.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","security":{...}}
```

## Frontend Deployment to Netlify

### Files Changed:
```
frontend/student-dashboard.html
```

### Deployment Steps:

```bash
cd frontend

# Check current changes
git status

# Add changed files
git add student-dashboard.html

# Commit with descriptive message
git commit -m "Display calculated levels in student directory

- Show current_level (300 Level, 400 Level) instead of year_of_study (2023L, 2024L)
- Add graduation badge (🎓) for graduated students
- Improve level display consistency across dashboard"

# Push to Netlify
git push origin main
```

### Netlify Auto-Deploy:
- Netlify will detect the push and automatically deploy
- Check Netlify dashboard for deployment status
- Look for: "Published" status

### Verify Deployment:
```
1. Visit: https://nacos-tau-portal.netlify.app
2. Login as a student
3. Navigate to "Student Directory" tab
4. Verify levels show correctly (300 Level, 400 Level, etc.)
```

## Local Development Setup

### Important: Do NOT commit these changes!

Your local `backend/.env` file should have:
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5000
ENABLE_CSRF=false
TRUST_PROXY=false
```

**Railway production** should keep:
```env
NODE_ENV=production
FRONTEND_URL=https://nacos-tau-portal.netlify.app
ENABLE_CSRF=true
TRUST_PROXY=true
```

### Restart Local Backend:
```bash
# In terminal where backend is running, press Ctrl+C

# Then restart:
cd backend
npm start

# You should see:
# 🔗 Server running on port 5000
# 🛡️  Security Features:
#    - HTTPS Enforcement: DISABLED (dev only)
```

## Testing Checklist

### After Backend Deployment (Railway):

- [ ] **Health Check**: `curl https://nacos-tau-frontend.onrender.com/api/health`
- [ ] **Directory Endpoint**: Test `/api/students/directory` returns `current_level` field
- [ ] **Profile Update**: Login and update profile (should not get validation error)
- [ ] **Level Filter**: Test filtering by level (100, 200, 300, 400) works correctly

### After Frontend Deployment (Netlify):

- [ ] **Login**: Can login successfully
- [ ] **Student Directory**: Levels display correctly (e.g., "300 Level", not "2024L")
- [ ] **Graduation Badge**: Graduated students show 🎓 emoji
- [ ] **Search**: Student search still works
- [ ] **Filter by Level**: Dropdown filter works (100, 200, 300, 400)
- [ ] **Filter by Department**: Department filter works
- [ ] **Profile Cards**: All student cards render properly
- [ ] **View Profile**: Clicking "View Profile" opens modal correctly

### After Local Backend Restart:

- [ ] **Server Starts**: No HTTPS enforcement errors
- [ ] **Frontend Loads**: Pages load without SSL errors
- [ ] **API Calls**: Fetch requests work on `http://localhost:5000`
- [ ] **CSRF**: CSRF token fetching works (if enabled)

## Rollback Plan (If Issues Occur)

### Backend Rollback:
```bash
cd backend
git revert HEAD
git push origin main
```

### Frontend Rollback:
```bash
cd frontend
git revert HEAD
git push origin main
```

### Emergency Fix:
If validation causes issues, temporarily disable it in Railway:
1. Go to Railway dashboard
2. Add environment variable: `SKIP_VALIDATION=true`
3. Redeploy

## Known Issues & Resolutions

### Issue 1: "year_of_study must be one of: 100, 200, 300, 400, 500"
- **Cause**: Old validation rule expecting levels
- **Fix**: Deploy backend with updated `validation.js` ✅

### Issue 2: Student directory showing "2023L", "2024L"
- **Cause**: Displaying raw `year_of_study` instead of calculated `current_level`
- **Fix**: Deploy frontend and backend fixes ✅

### Issue 3: Level filter not working
- **Cause**: Frontend sends levels (100-400) but backend filtered by years (2023-2024)
- **Fix**: Backend now filters by `current_level` ✅

### Issue 4: Local HTTPS errors
- **Cause**: Local `.env` had `NODE_ENV=production`
- **Fix**: Set to `development` and restart backend ✅

## Post-Deployment Monitoring

### Check Railway Logs:
```
1. Go to Railway dashboard
2. Click on backend service
3. Open "Deployments" tab
4. Check logs for errors
```

### Check Netlify Deploy Log:
```
1. Go to Netlify dashboard
2. Click on site
3. Open "Deploys" tab
4. Verify build succeeded
```

### Monitor Error Rates:
- Check Sentry (if configured) for error spikes
- Monitor Railway logs for 500 errors
- Check browser console for frontend errors

## Documentation Files Created

1. ✅ `FIX_STUDENT_DIRECTORY_LEVELS.md` - Student directory fixes
2. ✅ `FIX_VALIDATION_YEAR_OF_STUDY.md` - Validation rule fixes
3. ✅ `FIX_LOCAL_HTTPS_ERROR.md` - Local development setup
4. ✅ `DEPLOYMENT_CHECKLIST.md` - This file

## Summary

**Changes to Deploy:**
- Backend: 2 files (routes/students.js, middleware/validation.js)
- Frontend: 1 file (student-dashboard.html)

**Expected Results:**
- Student directory shows accurate calculated levels
- Profile updates work without validation errors
- Level filtering works correctly
- Graduated students show with 🎓 badge
- Local development works on HTTP without errors

**Deployment Time:**
- Backend: ~2-3 minutes (Railway auto-deploy)
- Frontend: ~1-2 minutes (Netlify auto-deploy)
- Total: ~5 minutes

**Risk Level:** 🟢 Low
- Changes are isolated to student directory feature
- No database migrations required
- Easy rollback if needed
- Backward compatible (old data still works)
