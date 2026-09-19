# Deployment Checklist: Student Level Fix

## Quick Summary
Admin dashboard showing "Not Set" for student levels because `api-config.js` has old Railway URL.

## Fix Applied
Updated `frontend/assets/js/api-config.js`:
- Changed Railway URL from `nacos-backend.up.railway.app` to `naco-tau-backend-production.up.railway.app`

---

## Deployment Steps

### 1️⃣ Check Database (Optional - Data Looks Good)
The sample data you provided shows levels are calculating correctly:
- Philemon (24/10MSS048): `year_of_study: 2024`, `current_level: 300` ✅
- Temitayo (23/10MSC061): `year_of_study: 2023`, `current_level: 400` ✅
- Khadijah (24/10MSC021): `year_of_study: 2024`, `current_level: 300` ✅

**Note**: Gbolahan shows `year_of_study: 400` which is incorrect (should be `2022`). If you want to fix this, run migration 013 in Supabase SQL Editor:
```sql
-- File: backend/migrations/013_fix_year_of_study_data.sql
-- This will re-extract year from all matric numbers
```

But the main issue is the frontend URL, not the data.

### 2️⃣ Deploy Frontend to Netlify

```bash
cd frontend
git add assets/js/api-config.js
git commit -m "fix: update Railway backend URL to naco-tau-backend-production"
git push origin main
```

**Wait**: 2-3 minutes for Netlify deployment

### 3️⃣ Verify the Fix

#### Step 1: Check Deployment
1. Go to Netlify dashboard
2. Wait for build to complete (green checkmark)
3. Note the deploy time

#### Step 2: Test Admin Dashboard
1. Open: `https://nacos-tau-portal.netlify.app/admin-dashboard.html`
2. Login with admin credentials
3. Navigate to "Student Directory" section

#### Step 3: Check Network Tab (Critical!)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for this request:
   ```
   GET https://naco-tau-backend-production.up.railway.app/api/students?status=active&page=1&limit=500
   ```
5. **Expected**: Status 200 ✅
6. **Bad**: Status 404 or CORS error ❌

#### Step 4: Check Student Levels
Look at the Level column in student directory:
- **Expected**: "100 Level", "200 Level", "300 Level", "400 Level"
- **Bad**: "Not Set"

#### Step 5: Check Console Logs
Look for these console messages:
```
✅ Good: "[loadStudents] (active) backend returned 6 row(s)"
❌ Bad: "[loadStudents] (active) backend path failed, falling back to anon supabase"
```

### 4️⃣ Clear Browser Cache If Needed

If you still see "Not Set" after deployment:

**Option 1: Hard Refresh**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Option 2: Clear Cache**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option 3: Incognito Window**
- Open the site in a new incognito/private window
- No cache, should show correct data immediately

---

## Troubleshooting

### Issue: Still Shows "Not Set"

#### Check 1: Did Netlify Deploy?
```bash
# Check latest commit on Netlify
# Should match your local commit
git log -1 --oneline
```

#### Check 2: Is API URL Correct?
Open DevTools console and run:
```javascript
console.log(window.api);
// Should show the api object
// Check the API_URL constant (may not be exposed)
```

#### Check 3: Is Backend Running?
Test the API directly:
```bash
curl https://naco-tau-backend-production.up.railway.app/api/students
```

Expected: JSON response (may need auth header)
Bad: Connection refused, 404, or CORS error

#### Check 4: Check Browser Console
Look for these error patterns:
```
❌ "Failed to fetch" - Network issue or wrong URL
❌ "CORS policy" - Backend not allowing frontend origin
❌ "404 Not Found" - Wrong endpoint or URL
```

### Issue: Some Students Show "Not Set"

This means `year_of_study` is NULL for those students. Two options:

**Option A: Run Migration 013**
```sql
-- In Supabase SQL Editor:
-- backend/migrations/013_fix_year_of_study_data.sql
```

**Option B: Manually Update**
```sql
-- For specific student:
UPDATE students 
SET year_of_study = 2022,
    graduation_year = 2026
WHERE matric_no = '22/10MSC014';
```

### Issue: Levels are Wrong

If `current_level` shows wrong values:

**Check 1: Verify Current Date**
The view uses `CURRENT_DATE` to calculate level:
```sql
SELECT CURRENT_DATE;  -- Should show 2026-08-23
```

**Check 2: Check Calculation**
```sql
SELECT 
  matric_no,
  year_of_study,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER AS current_year,
  (EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - year_of_study + 1) AS years_elapsed,
  (EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - year_of_study + 1) * 100 AS calculated_level,
  current_level
FROM students_with_current_level
WHERE matric_no = '24/10MSC021';
```

For matric `24/10MSC021` (started 2024):
- Current year: 2026
- Years elapsed: 2026 - 2024 + 1 = 3
- Current level: 3 * 100 = 300 ✅

---

## Expected Results

### Student Data After Fix:

| Name | Matric | Year Started | Current Level | Status |
|------|--------|--------------|---------------|--------|
| Gbolahan | 22/10MSC014 | 2022 | 400 Level | 🎓 |
| Philemon | 24/10MSS048 | 2024 | 300 Level | Active |
| Temitayo | 23/10MSC061 | 2023 | 400 Level | Active |
| Khadijah | 24/10MSC021 | 2024 | 300 Level | Active |
| Victor | 24/10MSC037 | 2024 | 300 Level | Active |
| Joshua | 24/10MSC043 | 2024 | 300 Level | Active |

### Admin Dashboard Features:
- ✅ Search by name/email/matric
- ✅ Filter by department
- ✅ Filter by level (100, 200, 300, 400)
- ✅ All filters work together
- ✅ Results count shows "X of Y students"
- ✅ Graduated students show 🎓 badge

---

## Post-Deployment

### Announce to Users (Optional)
After successful deployment, you can inform admins:
```
📢 Update: Student directory now shows current level automatically!
- No more manual updates needed each year
- Levels calculate based on enrollment year
- Graduated students marked with 🎓 badge
```

### Monitor for Issues
Watch for:
- User reports of incorrect levels
- Students with "Not Set" (missing year_of_study)
- Performance issues (view should be fast)

---

## Files Changed

### Frontend:
- ✅ `frontend/assets/js/api-config.js` - Updated Railway URL

### Backend (Already Deployed):
- ✅ `backend/routes/students.js` - Uses `students_with_current_level` view

### Database (Already Run):
- ✅ Migration 012: Created view and functions

### Pending (Optional):
- ⏳ Migration 013: Fix incorrect `year_of_study` data

---

## Success Criteria

✅ Admin dashboard loads without errors  
✅ Network tab shows 200 response from new Railway URL  
✅ Student directory displays levels (not "Not Set")  
✅ Level filter dropdown works  
✅ Search and department filter work  
✅ No console errors  

**Time Estimate**: 5 minutes (3 min deploy + 2 min testing)

---

**Created**: 2026-08-23  
**Priority**: High - Affects admin dashboard functionality  
**Risk**: Low - Only updating a URL string

