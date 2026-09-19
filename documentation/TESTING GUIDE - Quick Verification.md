# TESTING GUIDE - Quick Verification

**Date**: August 3, 2026  
**Purpose**: Verify all fixes are working correctly

---

## Pre-Testing Checklist

- [ ] Backend server is running on `localhost:5000`
- [ ] You're logged in as admin on admin dashboard
- [ ] Browser DevTools Console is open (F12)
- [ ] Supabase database is accessible

---

## Test 1: Academic Resources ✅ FIXED

### Step 1: Add New Resource

1. **Open**: `http://localhost:5000/admin-dashboard.html`
2. **Navigate**: Click "Resources" in sidebar
3. **Click**: "Add New" button
4. **Fill in form**:
   ```
   Title: Test Python Tutorial
   Type: Tutorial
   URL: https://docs.python.org/3/tutorial/
   Category: Programming
   Description: Official Python tutorial for beginners
   ```
5. **Click**: "Add Resource"

**Expected Result**:
- ✅ Success message: "Resource added successfully!"
- ✅ Modal closes
- ✅ Table refreshes and shows new resource
- ✅ URL column shows the link

**If it fails**:
- Check console for errors
- Verify `category` column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'academic_resources' AND column_name = 'category';`

### Step 2: Verify Student Can See It

1. **Open**: Student dashboard (logged in as student)
2. **Scroll**: To "Resources" section
3. **Verify**: Test resource appears
4. **Click**: The resource link

**Expected Result**:
- ✅ Resource shows in list
- ✅ Clicking link opens https://docs.python.org/3/tutorial/ in new tab

---

## Test 2: Career Paths ✅ FIXED

### Step 1: Add New Career Path

1. **Open**: `http://localhost:5000/admin-dashboard.html`
2. **Navigate**: Click "Career Paths" in sidebar
3. **Click**: "Add New" button
4. **Fill in form**:
   ```
   Title: Backend Developer
   Category: Development
   Description: Build scalable server-side applications using Node.js, databases, and APIs. Handle business logic, authentication, and data management.
   Skills: JavaScript, Node.js, PostgreSQL, RESTful APIs, Docker
   Tools: VS Code, Git, Postman, pgAdmin
   Resources: [{"name":"Node.js Docs","url":"https://nodejs.org/docs"},{"name":"Express Guide","url":"https://expressjs.com/guide"}]
   ```
5. **Click**: "Add Career Path"

**Expected Result**:
- ✅ Success message: "Career path added successfully!"
- ✅ Modal closes
- ✅ Table refreshes and shows new career
- ✅ Shows Title, Category badge, and Description (truncated)

**If it fails**:
- Check console for "career path add error"
- Verify category dropdown exists in form
- Check if backend API `/api/career` is accessible

### Step 2: Test Invalid JSON

1. **Click**: "Add New" again
2. **Fill in**:
   ```
   Title: Test Career
   Category: Design
   Description: Test description
   Resources: This is not valid JSON
   ```
3. **Click**: "Add Career Path"

**Expected Result**:
- ❌ Error message: "Invalid JSON format for resources. Expected format: [...]"
- ✅ Form stays open for correction

### Step 3: Test Required Fields

1. **Click**: "Add New" again
2. **Leave category blank**
3. **Click**: "Add Career Path"

**Expected Result**:
- ❌ Error message: "Title, description, and category are required"

---

## Test 3: Past Questions Investigation ⚠️ NEEDS INVESTIGATION

### Step 1: Verify Upload Works

1. **Open**: Admin dashboard
2. **Navigate**: "Past Questions"
3. **Click**: "Add New"
4. **Fill in**:
   ```
   Course Code: CSC101
   Course Name: Introduction to Computer Science
   Level: 100
   Semester: First
   Title: 2024 First Semester Exam
   ```
5. **Select**: Any PDF file
6. **Click**: "Upload"

**Expected Result**:
- ✅ Success message: "Past question uploaded successfully!"

### Step 2: Check if Data Exists in Database

**Run in Supabase SQL Editor**:
```sql
-- Check if records exist
SELECT 
  id,
  course_code,
  course_name,
  level,
  semester,
  title,
  file_url,
  created_at
FROM past_questions
ORDER BY created_at DESC
LIMIT 5;
```

**Expected**: Should see your uploaded past questions

**If empty**: Upload didn't save to database

### Step 3: Check Browser Console

1. **Refresh admin dashboard**
2. **Open DevTools Console (F12)**
3. **Look for**:
   ```
   [loadPastQuestions] table missing: ...
   [loadPastQuestions] query error: ...
   ```

**If you see errors**: Copy and share the error message

### Step 4: Test RLS Policy

**Run in Supabase SQL Editor** (switch to using ANON key, not service role):
```sql
-- This simulates what the frontend sees
SELECT * FROM past_questions LIMIT 1;
```

**Expected**: Should return 1 row

**If "permission denied"**: RLS policy is blocking reads

**Fix RLS if needed**:
```sql
-- Allow authenticated users to read
DROP POLICY IF EXISTS "past_questions_select_authenticated" ON past_questions;

CREATE POLICY "past_questions_select_authenticated" 
ON past_questions 
FOR SELECT 
TO authenticated 
USING (true);
```

### Step 5: Check if Table Shows in Dashboard

1. **Scroll to**: Past Questions section
2. **Look at table**: Does it show "No past questions" or is it empty?

**Expected states**:
- "No past questions" = Table exists, but no data
- "Table missing" = Table doesn't exist
- Blank/loading = JavaScript error

---

## Test 4: Storage Buckets

### Verify Bucket Configuration

**Run in Supabase SQL Editor**:
```sql
-- This won't work (no direct SQL for storage), use Supabase UI instead
```

**In Supabase Dashboard**:
1. Go to **Storage**
2. **Verify these buckets exist**:
   - `past-questions`
   - `timetables`
   - `resources`
   - `event-images`
   - `payment-proofs`
   - `profile-pictures`
   - `voting-photos`

**For each bucket**:
- Check **Public** is enabled (if files should be publicly accessible)
- Check **File size limit** (recommend 10MB)
- Verify files exist in buckets after upload

---

## Test 5: CORS (Backend API)

### Check Backend Logs

**Look for** in backend console:
```
⚠️ CORS blocked origin: http://localhost:5000
```

**If you see this**: CORS is blocking frontend requests

**Quick fix** (already applied to server.js):
```javascript
const allowedOrigins = [
  'http://localhost:5000',  // ✅ Already added
  'https://nacos-tau-portal.netlify.app',  // ✅ Already added
  // ... other origins
];
```

**Test CORS**:
1. Open admin dashboard in browser
2. Try to load students or events
3. Check Network tab for CORS errors

---

## Common Issues & Solutions

### Issue 1: "Column 'url' not found in academic_resources"
**Cause**: Old code still trying to use `url` instead of `file_url`  
**Fix**: ✅ Already fixed - code now uses `file_url`

### Issue 2: "Category is required" when adding career path
**Cause**: Category dropdown missing from form  
**Fix**: ✅ Already fixed - dropdown added

### Issue 3: Career path button does nothing
**Cause**: Form submit handler missing  
**Fix**: ✅ Already fixed - handler added

### Issue 4: Past questions upload but don't display
**Cause**: Unknown - needs investigation  
**Diagnosis steps**:
1. Check database for records (Test 3, Step 2)
2. Check RLS policies (Test 3, Step 4)
3. Check browser console (Test 3, Step 3)
4. Verify table exists in Supabase

### Issue 5: "permission denied" errors
**Cause**: RLS (Row Level Security) blocking access  
**Fix**: Update RLS policy to allow authenticated users

---

## SQL Diagnostic Queries

### Check all table structures
```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'students', 'admin_users', 'events', 'past_questions',
    'timetables', 'academic_resources', 'career_paths',
    'payment_verification', 'payments'
  )
ORDER BY table_name;
```

### Check for missing columns
```sql
-- Check academic_resources columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'academic_resources'
  AND column_name IN ('category', 'file_url', 'url')
ORDER BY column_name;

-- Expected: category (text), file_url (text)
-- NOT expected: url
```

### Check RLS policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('past_questions', 'academic_resources', 'career_paths')
ORDER BY tablename, policyname;
```

### Count records in each table
```sql
SELECT 
  'students' as table_name, COUNT(*) as records FROM students
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'past_questions', COUNT(*) FROM past_questions
UNION ALL
SELECT 'timetables', COUNT(*) FROM timetables
UNION ALL
SELECT 'academic_resources', COUNT(*) FROM academic_resources
UNION ALL
SELECT 'career_paths', COUNT(*) FROM career_paths
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
ORDER BY table_name;
```

---

## After Testing - Report Template

**Copy this and fill in your results**:

```
## Test Results

### Academic Resources
- [ ] Can add new resource: _____ (YES/NO)
- [ ] Resource displays in admin table: _____ (YES/NO)
- [ ] Link works: _____ (YES/NO)
- [ ] Student can see resource: _____ (YES/NO)
- [ ] Error messages (if any): _____

### Career Paths
- [ ] Can add new career: _____ (YES/NO)
- [ ] All fields validate: _____ (YES/NO)
- [ ] Career displays in table: _____ (YES/NO)
- [ ] Category badge shows: _____ (YES/NO)
- [ ] Error messages (if any): _____

### Past Questions
- [ ] Upload succeeds: _____ (YES/NO)
- [ ] Records in database: _____ (YES/NO)
- [ ] Display in admin dashboard: _____ (YES/NO)
- [ ] Display in student dashboard: _____ (YES/NO)
- [ ] Console errors: _____
- [ ] RLS test passed: _____ (YES/NO)

### Database Checks
- [ ] Category column exists: _____ (YES/NO)
- [ ] past_questions table has data: _____ (row count: ___)
- [ ] academic_resources table has data: _____ (row count: ___)
- [ ] career_paths table has data: _____ (row count: ___)

### Storage Buckets
- [ ] All 7 buckets exist: _____ (YES/NO)
- [ ] Buckets are public: _____ (YES/NO)
- [ ] Files visible in buckets: _____ (YES/NO)

### CORS
- [ ] No CORS errors in console: _____ (YES/NO)
- [ ] Backend API accessible: _____ (YES/NO)
```

---

**Next Steps**: Run through all tests and report results
