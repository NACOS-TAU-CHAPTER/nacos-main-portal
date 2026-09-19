# Fix: Gbolahan's Matric Number (22 → 23)

## Issue
Gbolahan Olufemi-Abiodun's matric number is stored as `22/10MSC014` but the correct number is `23/10MSC014`.

**Impact:**
- Shows as **graduated** (400 Level 🎓) when should be **final year** (400 Level)
- Incorrect enrollment year (2022 vs 2023)
- Incorrect graduation year (2026 vs 2027)

## Fix

Run this SQL in **Supabase SQL Editor**:

```sql
-- Fix Gbolahan's matric number
UPDATE students
SET matric_no = '23/10MSC014',
    year_of_study = 2023,
    graduation_year = 2027,
    program_duration = 4
WHERE email = 'gbolahan@st.tau.edu.ng'
   OR matric_no = '22/10MSC014';

-- Verify the fix
SELECT 
  first_name,
  last_name,
  email,
  matric_no,
  year_of_study,
  graduation_year,
  program_duration
FROM students
WHERE email = 'gbolahan@st.tau.edu.ng';

-- Check calculated level
SELECT 
  first_name || ' ' || last_name as name,
  matric_no,
  year_of_study,
  current_level,
  is_graduated,
  CASE 
    WHEN is_graduated THEN current_level || ' Level 🎓 (Graduated)'
    ELSE current_level || ' Level (Final Year)'
  END as display
FROM students_with_current_level
WHERE email = 'gbolahan@st.tau.edu.ng';
```

## Expected Result After Fix

### Before
```
Name: Gbolahan Olufemi-Abiodun
Matric: 22/10MSC014
year_of_study: 2022
current_level: 400
is_graduated: true
Display: 400 Level 🎓 (Graduated)
```

### After
```
Name: Gbolahan Olufemi-Abiodun
Matric: 23/10MSC014
year_of_study: 2023
current_level: 400
is_graduated: false
Display: 400 Level (Final Year)
```

## Calculation Verification

**Current Year:** 2026

| Matric | year_of_study | Years Elapsed | Calculation | Level | Graduated? |
|--------|---------------|---------------|-------------|-------|------------|
| **22**/10MSC014 | 2022 | 2026-2022+1=**5** | 5 > 4 | 400 | ✅ Yes |
| **23**/10MSC014 | 2023 | 2026-2023+1=**4** | 4 ≤ 4 | 400 | ❌ No |

The fix changes from **5 years** (graduated) to **4 years** (final year).

## How to Apply

### Option 1: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/pnusmlckowqagnlzjqbv/editor
2. Paste the SQL above
3. Click **Run**
4. Verify the results show correct data

### Option 2: Via Profile Edit (Manual)
If you have admin access to edit student profiles:
1. Go to Admin Dashboard
2. Find Gbolahan's profile
3. Change matric number from `22/10MSC014` to `23/10MSC014`
4. Save changes

## After Fix

Gbolahan should see:
- **Matric:** 23/10MSC014
- **Level:** 400 Level (no graduation badge)
- **Status:** Final year student, will graduate in 2027

## Related Issues

This was likely a typo during registration or manual data entry. The fix ensures:
- ✅ Correct matric number
- ✅ Correct enrollment year (2023)
- ✅ Correct graduation year (2027)
- ✅ Correct level calculation (400, not graduated)
- ✅ Graduation badge removed

---

**Status:** Ready to apply  
**Priority:** Medium (affects 1 student)  
**Date:** 2026-08-24
