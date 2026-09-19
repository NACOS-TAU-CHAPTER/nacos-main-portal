# Fix: Level Showing "2023L" Instead of "400L"

## Problem
Students in the admin dashboard show levels like "2023L" instead of "400L".

**Example:**
- ❌ David Oluebubechi: "2023L" 
- ✅ Should be: "400L"

## Root Cause
The `current_level` field from the database view is returning the `year_of_study` value (2023) instead of the calculated level (400).

## Diagnosis

### Run Diagnostic Script
```bash
cd backend
node scripts/diagnose-level-issue.js
```

This will show:
- How many students have correct vs suspicious levels
- Which students have problems
- Sample data from the database

## Solution

### Option 1: Run Migration 014 (Recommended)

**In Supabase SQL Editor:**

```sql
-- Run this in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- Copy and paste the contents of:
-- backend/migrations/014_fix_level_display_issue.sql
```

**What it does:**
1. Cleans invalid `year_of_study` values
2. Re-extracts years from matric numbers
3. Recalculates graduation years
4. Verifies the view is working correctly

### Option 2: Quick Manual Fix

If you know which students have the issue:

```sql
-- Fix specific student
UPDATE students
SET year_of_study = extract_year_from_matric(matric_no)
WHERE matric_no = '23/10MSC061';  -- Replace with actual matric number

-- Recalculate graduation year
UPDATE students
SET graduation_year = year_of_study + program_duration
WHERE matric_no = '23/10MSC061';
```

### Option 3: Fix All Students

```sql
-- Re-extract all year_of_study values from matric numbers
UPDATE students
SET year_of_study = extract_year_from_matric(matric_no)
WHERE matric_no IS NOT NULL;

-- Recalculate all graduation years
UPDATE students
SET graduation_year = year_of_study + COALESCE(program_duration, 4)
WHERE year_of_study IS NOT NULL;
```

## Verification

### 1. Check in Supabase
```sql
SELECT 
  first_name,
  last_name,
  matric_no,
  year_of_study,
  current_level,
  is_graduated
FROM students_with_current_level
WHERE current_level > 1000 OR current_level IS NULL
ORDER BY matric_no;
```

**Expected Result:** No rows (all levels should be 100-500)

### 2. Check Sample Data
```sql
SELECT 
  first_name || ' ' || last_name as name,
  matric_no,
  year_of_study,
  current_level,
  CASE 
    WHEN is_graduated THEN '🎓 Graduated'
    ELSE current_level || ' Level'
  END as display
FROM students_with_current_level
WHERE matric_no LIKE '23/%'
ORDER BY matric_no
LIMIT 10;
```

**Expected Output:**
```
Name                 | Matric        | year_of_study | current_level | display
---------------------|---------------|---------------|---------------|-------------
David Oluebubechi    | 23/10MSC061   | 2023          | 400           | 400 Level
Temitayo Bamiro      | 23/10MSC062   | 2023          | 400           | 400 Level
```

### 3. Test in Admin Dashboard
1. Go to admin dashboard
2. Student Directory tab
3. Check students with matric numbers starting with "23/"
4. Should show **"400 Level"** (they're in their 4th year in 2026)

## Understanding the Calculation

### How It Works

**Current Year:** 2026

| Matric Format | year_of_study | Years Elapsed | Current Level |
|---------------|---------------|---------------|---------------|
| 22/10MSC014   | 2022          | 2026-2022+1=5 | 400 (graduated 🎓) |
| 23/10MSC061   | 2023          | 2026-2023+1=4 | 400 |
| 24/10MSC037   | 2024          | 2026-2024+1=3 | 300 |
| 25/10MSC001   | 2025          | 2026-2025+1=2 | 200 |
| 26/10MSC001   | 2026          | 2026-2026+1=1 | 100 |

**Formula:**
```
current_level = (CURRENT_YEAR - year_of_study + 1) × 100
```

**Graduation:**
```
If current_level > (program_duration × 100), then graduated
```

## Common Issues

### Issue 1: "2023L" Instead of "400L"
**Cause:** `year_of_study` is correct (2023) but view calculation might be failing  
**Fix:** Run migration 014 or verify view exists

### Issue 2: "Not Set"
**Cause:** `year_of_study` is NULL  
**Fix:** 
```sql
UPDATE students
SET year_of_study = extract_year_from_matric(matric_no)
WHERE matric_no IS NOT NULL AND year_of_study IS NULL;
```

### Issue 3: Wrong Level (e.g., 100 when should be 400)
**Cause:** `year_of_study` has wrong value  
**Fix:** Re-run extraction function on that student

## Prevention

### For New Registrations
The registration endpoint was already fixed to populate `year_of_study` automatically from matric numbers (see `FIX_NEW_STUDENT_LEVEL_CALCULATION.md`).

**Location:** `backend/routes/auth.js` (registration endpoint)

New students will have the correct `year_of_study` set automatically.

### For Existing Students
Run migration 014 periodically if you notice data issues.

## Files

### Created
- `backend/migrations/014_fix_level_display_issue.sql` - Fix migration
- `backend/scripts/diagnose-level-issue.js` - Diagnostic script
- `documentation/FIX_LEVEL_DISPLAY_2023L.md` - This file

### Related
- `backend/migrations/012_replace_level_with_year_of_study.sql` - Original view
- `backend/migrations/013_fix_year_of_study_data.sql` - Previous fix attempt
- `backend/routes/auth.js` - Registration fix
- `documentation/FIX_NEW_STUDENT_LEVEL_CALCULATION.md` - Registration fix docs

## Summary

✅ **Quick Fix:** Run migration 014 in Supabase  
✅ **Verify:** Use diagnostic script  
✅ **Test:** Check admin dashboard  
✅ **Prevention:** Registration endpoint already fixed for new students  

---

**Status:** Ready to deploy  
**Priority:** High (user-facing issue)  
**Date:** 2026-08-24
