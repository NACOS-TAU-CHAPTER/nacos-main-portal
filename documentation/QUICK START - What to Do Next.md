# QUICK START - What to Do Next

**Updated**: August 3, 2026

---

## ✅ What Was Fixed

1. **Academic Resources** - Now uses `file_url` instead of `url`
2. **Career Paths** - Complete form handler implemented
3. **Database** - Category column added to academic_resources

---

## 🚀 Test These Features NOW

### Test 1: Academic Resources (2 minutes)

```
1. Open: http://localhost:5000/admin-dashboard.html
2. Login as admin
3. Click: "Resources" in sidebar
4. Click: "Add New" button
5. Fill in:
   - Title: Python Tutorial
   - Type: Tutorial
   - URL: https://docs.python.org
   - Category: Programming
   - Description: Official docs
6. Click: "Add Resource"
7. Expected: ✅ Success message, table shows new resource
```

### Test 2: Career Paths (3 minutes)

```
1. Still in admin dashboard
2. Click: "Career Paths" in sidebar
3. Click: "Add New" button
4. Fill in:
   - Title: Backend Developer
   - Category: Development
   - Description: Build server applications
   - Skills: JavaScript, Node.js
   - Tools: VS Code, Git
   
5. Add first resource:
   - Name: Node.js Docs
   - URL: https://nodejs.org
   
6. Click: "+ Add Another Resource" button

7. Add second resource:
   - Name: Express Guide
   - URL: https://expressjs.com
   
8. Click: "Add Career Path"
9. Expected: ✅ Success message, table shows new career
```

### Test 3: Past Questions Investigation (5 minutes)

```
1. Still in admin dashboard
2. Click: "Past Questions" in sidebar
3. Look at the table - what do you see?
   - Empty?
   - "No past questions"?
   - Error message?
4. Open Supabase SQL Editor
5. Run: SELECT COUNT(*) FROM past_questions;
6. Report the count
```

---

## 🔍 If Tests Fail

### Academic Resources Fails
**Error**: "Could not find 'category' column"

**Fix**:
```sql
-- Run in Supabase SQL Editor
ALTER TABLE academic_resources ADD COLUMN IF NOT EXISTS category TEXT;
```

### Career Paths Fails
**Error**: "Category is required"

**Check**: Did you select a category from dropdown?

**If dropdown is missing**: The file didn't save properly, re-apply fix

**For resources**: Don't need to fill resources if you don't have any - they're optional

### Past Questions Shows Nothing

**Run this SQL**:
```sql
-- Check if data exists
SELECT 
  id, 
  course_code, 
  course_name, 
  created_at 
FROM past_questions 
ORDER BY created_at DESC 
LIMIT 5;
```

**If empty**: Upload didn't save to database

**If has data but doesn't display**: RLS or frontend issue

---

## 📊 Quick SQL Checks

### Check Everything at Once

```sql
-- Copy this entire block and run in Supabase

-- 1. Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('academic_resources', 'career_paths', 'past_questions')
ORDER BY table_name;

-- 2. Check category column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'academic_resources' 
  AND column_name = 'category';

-- 3. Count records
SELECT 
  'academic_resources' as table_name, 
  COUNT(*) as record_count 
FROM academic_resources
UNION ALL
SELECT 'career_paths', COUNT(*) FROM career_paths
UNION ALL
SELECT 'past_questions', COUNT(*) FROM past_questions;

-- Expected Results:
-- 3 tables
-- 1 column (category)
-- Record counts (varies)
```

---

## 🎯 Report Back Format

**After testing, report using this format**:

```
✅ Academic Resources Test:
- Can add: YES/NO
- Displays: YES/NO
- Error: (if any)

✅ Career Paths Test:
- Can add: YES/NO
- Displays: YES/NO
- Error: (if any)

⚠️ Past Questions Test:
- Table shows: (empty/no data/error message)
- SQL count result: X records
- Browser console error: (if any)

📊 SQL Check Results:
- Tables found: X
- Category column: YES/NO
- Record counts:
  - academic_resources: X
  - career_paths: X
  - past_questions: X
```

---

## 📂 Files You Modified

If you need to revert or check changes:

1. **frontend/admin-dashboard.html**
   - Lines ~1020: Career path form
   - Lines ~1834: Academic resources insert
   - Lines ~1870-1950: Career path handler (NEW)
   - Lines ~2084: Academic resources display
   - Lines ~2203: Career paths display

2. **frontend/student-dashboard.html**
   - Line ~534: Academic resources display

---

## 🔄 If You Need to Deploy

### Frontend (Netlify)
```bash
cd frontend
git add .
git commit -m "Fix academic resources and career paths"
git push origin main
# Netlify auto-deploys
```

### Backend (Railway)
```bash
cd backend
git add .
git commit -m "Update CORS configuration"
git push origin main
# Railway auto-deploys
```

---

## 📞 What to Share If You Need Help

1. **Test Results** (use format above)
2. **Browser Console Screenshot** (F12 → Console tab)
3. **SQL Query Results** (from quick checks)
4. **Any Error Messages** (copy full text)

---

## ✨ Success Criteria

You'll know everything works when:

- ✅ Can add academic resources without errors
- ✅ Resources show in admin table with clickable links
- ✅ Students can see resources on their dashboard
- ✅ Can add career paths with category selection
- ✅ Career paths show title, category badge, description
- ✅ Past questions either display OR you know why they don't

---

**⏱️ ESTIMATED TIME**: 10-15 minutes to test everything

**🎯 PRIORITY**: Test in order (Resources → Career → Past Questions)

**❓ QUESTIONS**: Share test results and we'll debug any issues
