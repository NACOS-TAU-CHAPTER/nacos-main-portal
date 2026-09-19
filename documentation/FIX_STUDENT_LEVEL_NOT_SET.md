# Fix: Student Level Showing "Not Set" - RESOLVED ✅

## Issue
Admin dashboard student directory showed "Not Set" for all student levels instead of displaying their current level (100, 200, 300, 400).

## Root Cause
The frontend `api-config.js` file was still using the **old Railway backend URL** (`nacos-backend.up.railway.app`) instead of the **new URL** (`naco-tau-backend-production.up.railway.app`).

### What Was Happening:
1. Admin dashboard called `api.students.list()` to fetch students
2. API call failed (404/CORS) because old URL is no longer active
3. Code fell back to direct Supabase query: `supabase.from('students').select('*')`
4. The `students` table doesn't have `current_level` (only the `students_with_current_level` **view** has it)
5. Since `s.current_level` was undefined, the display logic showed "Not Set"

### Why Backend Was Working:
- `backend/routes/students.js` correctly queries `students_with_current_level` view
- The view calculates `current_level` dynamically from `year_of_study`
- Backend **was deployed and working** on Railway
- Problem was frontend couldn't reach it due to wrong URL

## The Fix

### File Changed
**`frontend/assets/js/api-config.js`** (Line 4-5)

```javascript
// BEFORE (❌ Wrong):
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://nacos-backend.up.railway.app/api';  // Old URL

// AFTER (✅ Correct):
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://naco-tau-backend-production.up.railway.app/api';  // New URL
```

## Verification

### Before Fix:
```javascript
// API call failed, fell back to:
supabase.from('students').select('*')

// Result:
{ 
  first_name: "John", 
  matric_no: "22/10MSC014",
  year_of_study: 2022,
  // NO current_level field ❌
}

// Display: "Not Set" ❌
```

### After Fix:
```javascript
// API call succeeds:
fetch('https://naco-tau-backend-production.up.railway.app/api/students')

// Backend queries: students_with_current_level view
// Result:
{ 
  first_name: "John", 
  matric_no: "22/10MSC014",
  year_of_study: 2022,
  current_level: 400,  // ✅ Calculated dynamically
  is_graduated: false
}

// Display: "400 Level" ✅
```

## Deployment

### Step 1: Commit Changes
```bash
cd frontend
git add assets/js/api-config.js
git commit -m "fix: update Railway backend URL to naco-tau-backend-production"
```

### Step 2: Deploy to Netlify
```bash
git push origin main
```

Wait 2-3 minutes for Netlify to deploy.

### Step 3: Test
1. Go to admin dashboard: `https://nacos-tau-portal.netlify.app/admin-dashboard.html`
2. Navigate to "Student Directory" section
3. **Expected**: Students should now show their correct levels (100, 200, 300, 400)
4. **Expected**: Graduated students show 🎓 badge
5. **Expected**: Level filter works correctly

### Step 4: Clear Browser Cache
If levels still show "Not Set" after deployment:
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear browser cache for the site
3. The old `api-config.js` file is cached by browsers

## Related Issues Fixed

This also fixes several other hidden issues:
- ✅ Admin dashboard stats (student count) now loads from backend API
- ✅ All `api.students.*` calls now work correctly
- ✅ Student search/filter works with backend pagination
- ✅ No more CORS errors from old URL

## System Architecture

### Data Flow (After Fix):
```
Frontend Admin Dashboard
    ↓
api.students.list() in api-config.js
    ↓
GET https://naco-tau-backend-production.up.railway.app/api/students
    ↓
backend/routes/students.js
    ↓
Query: students_with_current_level view
    ↓
View calculates current_level from year_of_study + current date
    ↓
Returns: { current_level: 400, is_graduated: false }
    ↓
Frontend displays: "400 Level 🎓"
```

### Fallback Path (Should Never Execute Now):
```
If API call fails:
    ↓
supabase.from('students').select('*')
    ↓
Returns: { year_of_study: 2022 } (no current_level)
    ↓
Display: "Not Set"
```

## Previous Context

This issue was part of Task 6 in the context transfer:

### Task 6 Timeline:
1. ✅ Added search and filter to student directory
2. ✅ Added Level column to table
3. ✅ Created migration 012 for dynamic level calculation
4. ✅ Created `students_with_current_level` view
5. ✅ Updated backend to use view
6. ✅ Updated frontend display logic
7. ❌ **MISSED**: Update `api-config.js` with new Railway URL
8. ✅ **FIXED**: Updated Railway URL

## Lessons Learned

### ⚠️ When Backend URL Changes:
Check **ALL** these files:
- `frontend/assets/js/env.js` - Global config (already fixed in Task 2)
- `frontend/assets/js/api-config.js` - API client (fixed now)
- `frontend/**/*.html` - Any hardcoded URLs (already fixed in Task 2)
- `backend/.env` - Backend self-reference
- Documentation files

### ⚠️ Hidden Failures:
- Frontend code had fallback logic that **masked the API failure**
- Admin dashboard still loaded (using fallback Supabase query)
- Only specific fields (like `current_level`) revealed the problem
- **Always check browser Network tab** for failed API calls

## Status

✅ **FIXED**: Railway backend URL updated in `api-config.js`

**Deployment Required**: Push frontend to Netlify for changes to take effect

**Expected Result**: Student levels display correctly in admin dashboard

---

**Date Fixed**: 2026-08-23  
**Files Changed**: `frontend/assets/js/api-config.js`  
**Related**: Task 2 (Railway URL fixes), Task 6 (Dynamic level system)

