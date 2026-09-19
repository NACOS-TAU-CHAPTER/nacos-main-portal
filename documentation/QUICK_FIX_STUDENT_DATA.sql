-- QUICK FIX: Run this in Supabase SQL Editor
-- Fixes all known student data issues

-- 1. Fix Gbolahan's matric number (22 → 23)
UPDATE students
SET matric_no = '23/10MSC014',
    year_of_study = 2023,
    graduation_year = 2027
WHERE matric_no = '22/10MSC014';

-- 2. Fix Farouk (has 400 instead of 2023)
UPDATE students
SET year_of_study = 2023,
    graduation_year = 2027
WHERE matric_no = '23/10MSS041' AND year_of_study = 400;

-- 3. Fix Praise (NULL year_of_study)
UPDATE students
SET year_of_study = 2023,
    graduation_year = 2027
WHERE matric_no = '23/10MSC015' AND year_of_study IS NULL;

-- 4. Fix Onitomiwa (NULL year_of_study)
UPDATE students
SET year_of_study = 2023,
    graduation_year = 2027
WHERE matric_no = '23/10MSS043' AND year_of_study IS NULL;

-- Verify the fixes
SELECT 
  first_name || ' ' || last_name as name,
  matric_no,
  year_of_study,
  current_level,
  is_graduated,
  CASE 
    WHEN is_graduated THEN current_level || ' Level 🎓'
    ELSE current_level || ' Level'
  END as display
FROM students_with_current_level
WHERE matric_no IN (
  '23/10MSC014',  -- Gbolahan (fixed)
  '23/10MSS041',  -- Farouk
  '23/10MSC015',  -- Praise
  '23/10MSS043'   -- Onitomiwa
)
ORDER BY matric_no;
