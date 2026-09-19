# Fix: Missing Student Profile After Registration

## Issue
Student `agasu.wisdom.2035@st.tau.edu.ng` registered successfully (has auth account and session) but their profile record is missing from the `students` table.

**Error Logs:**
```
Profile update error: PGRST116
The result contains 0 rows
Cannot coerce the result to a single JSON object
```

## Root Cause
The registration process created the Supabase auth user but failed to create the corresponding record in the `students` table.

This can happen if:
1. Database constraint violation (e.g., duplicate matric number)
2. RLS policy blocking the insert
3. Registration code error that wasn't caught

## Immediate Fix

### Step 1: Check if Student Record Exists

Run in **Supabase SQL Editor**:

```sql
-- Check auth user
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'agasu.wisdom.2035@st.tau.edu.ng';

-- Check student profile
SELECT *
FROM students
WHERE email = 'agasu.wisdom.2035@st.tau.edu.ng';
```

### Step 2: Create Missing Profile

If the auth user exists but the student profile doesn't:

```sql
-- Get the auth user_id first
SELECT id FROM auth.users WHERE email = 'agasu.wisdom.2035@st.tau.edu.ng';

-- Create the missing student profile
-- Replace 'USER_ID_HERE' with the actual UUID from above
INSERT INTO students (
  user_id,
  email,
  first_name,
  last_name,
  name,
  matric_no,
  department,
  course,
  status,
  year_of_study,
  graduation_year,
  program_duration,
  created_at
) VALUES (
  'USER_ID_HERE',  -- Replace with actual user_id
  'agasu.wisdom.2035@st.tau.edu.ng',
  'Wisdom',  -- Update if you know the actual name
  'Agasu',   -- Update if you know the actual name
  'Wisdom Agasu',
  NULL,  -- Matric number not provided yet
  'Computer Science',  -- Default, can be updated by student
  'Computer Science',
  'active',
  NULL,  -- Will be calculated when matric number is added
  NULL,
  4,
  NOW()
);

-- Verify it was created
SELECT * FROM students WHERE email = 'agasu.wisdom.2035@st.tau.edu.ng';
```

### Step 3: Automated Fix Script

Or use this combined script:

```sql
-- Fix missing student profile for agasu.wisdom.2035@st.tau.edu.ng
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'agasu.wisdom.2035@st.tau.edu.ng';
BEGIN
  -- Get user_id from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found for email: %', v_email;
  END IF;
  
  -- Check if student profile already exists
  IF EXISTS (SELECT 1 FROM students WHERE user_id = v_user_id) THEN
    RAISE NOTICE 'Student profile already exists for %', v_email;
  ELSE
    -- Create missing student profile
    INSERT INTO students (
      user_id,
      email,
      first_name,
      last_name,
      name,
      department,
      course,
      status,
      program_duration,
      created_at
    ) VALUES (
      v_user_id,
      v_email,
      'Wisdom',
      'Agasu',
      'Wisdom Agasu',
      'Computer Science',
      'Computer Science',
      'active',
      4,
      NOW()
    );
    
    RAISE NOTICE 'Created student profile for %', v_email;
  END IF;
END $$;

-- Verify
SELECT 
  s.user_id,
  s.email,
  s.first_name,
  s.last_name,
  s.matric_no,
  s.status
FROM students s
WHERE s.email = 'agasu.wisdom.2035@st.tau.edu.ng';
```

## Prevention

### Code Fixes Made

1. **Profile Update Endpoint** (`routes/students.js`)
   - Changed `.single()` to `.maybeSingle()`
   - Returns helpful 404 error if profile doesn't exist

2. **Profile Picture Upload** (`routes/students.js`)
   - Changed `.single()` to `.maybeSingle()`
   - Returns helpful 404 error if profile doesn't exist

### Registration Monitoring

Add to `routes/auth.js` registration endpoint to log if profile creation fails:

```javascript
const { error: profileError } = await supabase
  .from('students')
  .insert([{ /* ... */ }]);

if (profileError) {
  console.error('⚠️  CRITICAL: Profile creation failed for:', email);
  console.error('Profile error details:', profileError);
  // ... existing error handling
}
```

## Generic Fix for Any User

If this happens to other students:

```sql
-- Generic fix script - replace email
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'STUDENT_EMAIL_HERE@st.tau.edu.ng';  -- Change this
  v_first_name TEXT := 'FirstName';  -- Change this
  v_last_name TEXT := 'LastName';    -- Change this
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user not found';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM students WHERE user_id = v_user_id) THEN
    INSERT INTO students (
      user_id, email, first_name, last_name, name,
      department, course, status, program_duration, created_at
    ) VALUES (
      v_user_id, v_email, v_first_name, v_last_name, v_first_name || ' ' || v_last_name,
      'Computer Science', 'Computer Science', 'active', 4, NOW()
    );
    RAISE NOTICE 'Fixed profile for %', v_email;
  END IF;
END $$;
```

## After Fix

The student should be able to:
1. ✅ Update their profile
2. ✅ Upload profile picture
3. ✅ See their dashboard
4. ✅ Access all features

They should complete their profile by adding:
- Matric number
- Phone number
- Bio
- Other details

Once they add their matric number, the level will be calculated automatically.

---

**Status**: Ready to apply  
**Priority**: High (blocks user from using the system)  
**Date**: 2026-08-24
