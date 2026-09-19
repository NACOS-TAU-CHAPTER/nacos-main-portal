# DEBUG - Past Questions Not Showing on Dashboards

**Date**: August 3, 2026  
**Issue**: Past questions upload successfully but don't display on admin or student dashboard

---

## What We Know

✅ **Upload Process Works**: Files upload to `past_questions` storage bucket  
✅ **Database Insert Works**: Records are created in `past_questions` table  
❌ **Display Doesn't Work**: Tables show empty or error

---

## Diagnostic Steps

### Step 1: Check if Data Actually Exists

**Run in Supabase SQL Editor**:
```sql
-- Check if table has any records
SELECT 
  id,
  title,
  course_code,
  course_name,
  level,
  semester,
  file_url,
  uploaded_by,
  created_at
FROM past_questions
ORDER BY created_at DESC
LIMIT 10;
```

**Expected**: Should show your recently uploaded past questions  
**If Empty**: The upload didn't actually save to database

---

### Step 2: Check RLS (Row Level Security) Policies

**Run in Supabase SQL Editor**:
```sql
-- Check what policies exist for past_questions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'past_questions';
```

**Current Policy** (from schema.sql):
```sql
CREATE POLICY "past_questions_select_authenticated" 
ON past_questions 
FOR SELECT 
TO authenticated 
USING (true);
```

This policy means:
- ✅ Authenticated users can read all past questions
- ❌ Anonymous (not logged in) users cannot read

---

### Step 3: Test With Service Role Key

**Run in Supabase SQL Editor** (uses service role, bypasses RLS):
```sql
SELECT COUNT(*) as total_records FROM past_questions;
```

**Then test with Anon Key** (simulates frontend):
```javascript
// In browser console on admin-dashboard.html
const { data, error } = await supabase
  .from('past_questions')
  .select('*')
  .limit(1);
  
console.log('Data:', data);
console.log('Error:', error);
```

---

### Step 4: Check Admin Dashboard Console

1. **Open Admin Dashboard** in browser
2. **Press F12** to open DevTools
3. **Go to Console tab**
4. **Look for errors** from `loadPastQuestions()`

**Common errors**:
```
[loadPastQuestions] table missing: ...
[loadPastQuestions] query error: ...
```

---

## Common Causes & Solutions

### Cause 1: Not Logged In
**Symptom**: RLS blocks read because user isn't authenticated  
**Check**: Look for "permission denied" errors in console  
**Fix**: Make sure you're logged in as admin

### Cause 2: Table Has No Data
**Symptom**: Shows "No past questions"  
**Check**: Run Step 1 above to verify data exists  
**Fix**: Upload more past questions

### Cause 3: File URL Broken
**Symptom**: Data exists but download links don't work  
**Check**: Click "View" button on a past question  
**Fix**: Verify storage bucket permissions

### Cause 4: Frontend Not Refreshing
**Symptom**: Data exists but dashboard doesn't update  
**Check**: Hard refresh browser (Ctrl+Shift+R)  
**Fix**: Clear cache and reload

### Cause 5: CORS Blocking API Calls
**Symptom**: Network errors in console  
**Check**: Look for "CORS policy" errors  
**Fix**: Already fixed in server.js (allows localhost:5000)

---

## Student Dashboard Past Questions

### Current Status
❌ **Student dashboard does NOT have past questions display**

**Evidence**: No code found in `student-dashboard.html` for:
- `loadPastQuestions()` function
- `past_questions` table queries
- Past questions section in HTML

### What Student Dashboard Has
✅ Only shows `academic_resources` (Tutorial/Documentation links)

### Recommendation
**Option 1**: Add past questions section to student dashboard  
**Option 2**: Use academic_resources for both (merge functionality)

---

## Quick Test SQL Queries

### Check Table Exists
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'past_questions';
```

### Check Column Structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'past_questions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Check Recent Uploads
```sql
SELECT 
  course_code,
  course_name,
  level,
  semester,
  file_type,
  created_at,
  uploaded_by
FROM past_questions
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

### Check File URLs
```sql
SELECT 
  course_code,
  file_url,
  LENGTH(file_url) as url_length,
  CASE 
    WHEN file_url LIKE 'https://pnusmlckowqagnlzjqbv.supabase.co/storage/v1/object/public/%' THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as url_status
FROM past_questions
ORDER BY created_at DESC
LIMIT 5;
```

---

## Expected File URL Format

```
https://pnusmlckowqagnlzjqbv.supabase.co/storage/v1/object/public/past-questions/{filename}
```

Example:
```
https://pnusmlckowqagnlzjqbv.supabase.co/storage/v1/object/public/past-questions/CSC101-2024-1st.pdf
```

---

## Next Steps

1. **Run Step 1 above** - Check if data exists
2. **Run Step 3 above** - Test with anon key
3. **Check browser console** - Look for JavaScript errors
4. **Share results** - Copy error messages or data output

**Most likely issue**: RLS policy or no data in table

---

## Files to Check

- `frontend/admin-dashboard.html` (line 1990-2020) - `loadPastQuestions()`
- `backend/routes/admin.js` (line 30) - past_questions CRUD
- `backend/database/schema.sql` (line 93-104) - table definition
- `backend/migrations/002_add_past_questions_payment_verification.sql` - table creation

---

**ACTION REQUIRED**: Run the diagnostic SQL queries above and share the results
