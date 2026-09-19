# CURRENT STATUS - Database Schema Issues

**Date**: August 3, 2026  
**Issues**: Past Questions not displaying, Academic Resources insert failing

---

## ISSUE 1: Academic Resources Table - Missing Columns

### Problem
When admin tries to add academic resources, getting errors:
```
Could not find the 'category' column of 'academic_resources' in the schema cache
Could not find the 'url' column of 'academic_resources' in the schema cache
```

### Root Cause
The `academic_resources` table in Supabase is missing columns that the frontend expects:
- ❌ Missing: `url` (TEXT)
- ❌ Missing: `category` (TEXT)

### What the Code Sends
Admin dashboard (`admin-dashboard.html:1832`) sends:
```javascript
{
  title: "...",
  resource_type: "Tutorial",
  url: "https://...",        // ❌ MISSING IN DB
  category: "Programming",    // ❌ MISSING IN DB
  description: "...",
  uploaded_by: admin_id
}
```

### What Student Dashboard Expects
Student dashboard (`student-dashboard.html:534`) tries to display:
```html
<a href="${resource.url}">   <!-- ❌ MISSING IN DB -->
```

### Solution
Run migration file: `backend/migrations/005_fix_academic_resources_schema.sql`

This migration will:
1. Add `category` column (TEXT)
2. Add `url` column (TEXT)
3. Fix `uploaded_by` foreign key to reference `admin_users` instead of `students`
4. Add indexes for performance

---

## ISSUE 2: Past Questions Not Displaying

### Problem
User reports: "Past questions is uploading now but it's not displaying on the dashboards admin and student"

### Upload Process (Working ✅)
1. File uploaded to `past_questions` storage bucket ✅
2. Record inserted into `past_questions` table ✅

### Display Process (Not Working ❌)
**Admin Dashboard** (`admin-dashboard.html:1991`):
```javascript
async function loadPastQuestions() {
  const { data, error } = await supabase
    .from('past_questions')
    .select('*')
    .order('created_at', { ascending: false });
  // Display in table
}
```

**Student Dashboard**:
- ❌ No past questions display code found!
- Student dashboard only shows `academic_resources`, not `past_questions`

### Possible Causes
1. **RLS (Row Level Security) blocking reads**
   - Check if anonymous key can read from `past_questions` table
2. **No data in table**
   - Verify records actually exist in `past_questions` table
3. **Student dashboard doesn't have past questions section**
   - Feature may not be implemented on student side

### Verification Steps
Run these in Supabase SQL Editor:

```sql
-- 1. Check if past_questions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'past_questions';

-- 2. Check if there's any data
SELECT id, course_code, course_name, level, semester, created_at
FROM past_questions
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'past_questions';

-- 4. Test if anon key can read (run with ANON KEY, not service role)
-- This simulates what the frontend sees
SELECT count(*) FROM past_questions;
```

---

## IMMEDIATE ACTIONS REQUIRED

### Action 1: Run Migration for Academic Resources ⚠️ CRITICAL
**File**: `backend/migrations/005_fix_academic_resources_schema.sql`

**Steps**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire contents of `backend/migrations/005_fix_academic_resources_schema.sql`
4. Paste and click "Run"
5. Verify output shows:
   - `Added category column to academic_resources`
   - `Added url column to academic_resources`

### Action 2: Verify Past Questions Table
**Run in Supabase SQL Editor**:
```sql
-- Check structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'past_questions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check data
SELECT * FROM past_questions ORDER BY created_at DESC LIMIT 5;
```

**Expected columns**:
- id (uuid)
- title (text)
- course_code (text)
- course_name (text)
- level (text)
- semester (text)
- file_url (text)
- file_type (text)
- uploaded_by (uuid, FK to admin_users)
- created_at (timestamptz)

### Action 3: Test RLS Policies
**In Supabase SQL Editor**, test with ANON key (not service role):
```sql
-- This simulates what frontend sees
SELECT * FROM past_questions LIMIT 1;
```

If you get `permission denied` or `0 rows`, the RLS policy is too restrictive.

**Fix if needed**:
```sql
-- Allow authenticated users to read past questions
DROP POLICY IF EXISTS "past_questions_select_authenticated" ON past_questions;

CREATE POLICY "past_questions_select_authenticated" 
ON past_questions 
FOR SELECT 
TO authenticated 
USING (true);
```

---

## EXPECTED RESULTS AFTER FIXES

### After Running Migration 005
✅ Admin can add academic resources with URL and category  
✅ Student dashboard can display resource URLs  
✅ No more "column not found" errors

### After Verifying Past Questions
✅ Past questions show in admin dashboard table  
✅ Can verify if student dashboard needs past questions feature added

---

## NEXT STEPS

1. **Run migration 005** ⚠️ Do this first!
2. **Check past_questions table** - verify data exists
3. **Test RLS policies** - ensure frontend can read data
4. **Report back results** - share any errors or success messages
5. **Consider adding past questions to student dashboard** (if not there)

---

## FILES INVOLVED

### Migration Files
- `backend/migrations/005_fix_academic_resources_schema.sql` ⚠️ **RUN THIS**
- `backend/database/schema.sql` (reference only)

### Frontend Files
- `frontend/admin-dashboard.html` (lines 1654-2020 for past questions)
- `frontend/student-dashboard.html` (lines 520-560 for resources)

### Backend Files
- `backend/routes/admin.js` (handles past_questions CRUD)
- `backend/routes/resources.js` (handles academic_resources)
- `backend/server.js` (CORS configuration)

---

## DEBUGGING TIPS

### If Admin Dashboard Still Shows "No Past Questions"
1. Open browser DevTools Console (F12)
2. Look for error message from `loadPastQuestions()`
3. Check Network tab for failed API calls
4. Look for RLS permission denied errors

### If Academic Resources Still Fail
1. Verify migration ran successfully
2. Check column exists:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'academic_resources' 
     AND column_name IN ('url', 'category');
   ```
3. Should return 2 rows (url and category)

---

**STATUS**: Waiting for user to run migration 005 and verify past_questions data
