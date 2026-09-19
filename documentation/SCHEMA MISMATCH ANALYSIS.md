# Schema Mismatch Analysis - Complete Diagnosis

## Executive Summary

Your past questions are uploading to storage successfully but not displaying because of **schema mismatches** between what the code expects and what exists in your Supabase database.

**3 Migrations Required** to fix everything completely.

---

## Detailed Problem Analysis

### Problem 1: Missing past_questions Table ❌
**Status:** Table doesn't exist  
**Error:** `404 Not Found` when querying `/rest/v1/past_questions`  
**Impact:** Past questions can't be saved or displayed  
**Solution:** Migration 002

### Problem 2: payment_verification Column Mismatch ❌❌❌ CRITICAL
**Status:** Table exists but has wrong column names

#### What Your Database Has:
```
payment_verification:
  - user_id (UUID)
  - payment_proof_url (TEXT)
  - submitted_at (TIMESTAMPTZ)
  - transaction_id (TEXT)
  - payment_type, verified_by, verified_at, notes, updated_at
```

#### What The Code Expects:
```
payment_verification:
  - student_id (UUID) ← MISSING
  - proof_url (TEXT) ← MISSING
  - created_at (TIMESTAMPTZ) ← MISSING
  - payment_reference (TEXT) ← MISSING
```

**Error:** `column payment_verification.created_at does not exist`  
**Impact:** Payment verification tab crashes, can't load or display payments  
**Root Cause:** You likely created this table manually or copied from `payments` table  
**Solution:** Migration 004 (adds new columns + sync triggers)

### Problem 3: audit_logs Column Mismatch ❌
**Status:** Table exists but missing columns

#### What Your Database Has:
```
audit_logs:
  - id, action, user_id, user_email, details, ip_address, timestamp
```

#### What The Code Expects (in addition):
```
audit_logs:
  - admin_id (UUID) ← MISSING
  - entity_type (TEXT) ← MISSING
  - entity_id (UUID) ← MISSING
  - user_agent (TEXT) ← MISSING
```

**Error:** `Could not find the 'admin_id' column of 'audit_logs'`  
**Impact:** Audit logging fails with 500 error, but upload continues  
**Solution:** Migration 003

---

## The Fix: 3-Step Migration Process

### Migration 002: Create past_questions Table
**File:** `backend/migrations/002_add_past_questions_payment_verification.sql`

**What it does:**
- Creates `past_questions` table with proper schema
- Attempts to create `payment_verification` (will be skipped since it exists)
- Adds RLS policies
- Adds indexes

**Safe to run:** Yes - uses `IF NOT EXISTS` guards

---

### Migration 003: Fix audit_logs Schema
**File:** `backend/migrations/003_fix_schema_mismatches.sql`

**What it does:**
- Adds `admin_id` column to `audit_logs`
- Adds `entity_type` column to `audit_logs`
- Adds `entity_id` column to `audit_logs`
- Adds `user_agent` column to `audit_logs`
- Adds performance indexes

**Safe to run:** Yes - checks if columns exist before adding

---

### Migration 004: Align payment_verification Schema (CRITICAL)
**File:** `backend/migrations/004_align_payment_verification_schema.sql`

**What it does:**
1. **Adds new columns** the code needs:
   - `student_id` (references `students.id`)
   - `created_at` (TIMESTAMPTZ)
   - `proof_url` (TEXT)
   - `payment_reference` (TEXT)

2. **Migrates existing data:**
   - Copies `user_id` → looks up matching `student_id`
   - Copies `submitted_at` → `created_at`
   - Copies `payment_proof_url` → `proof_url`
   - Copies `transaction_id` → `payment_reference`

3. **Creates sync triggers:**
   - Automatically keeps old ↔️ new columns in sync
   - Allows both column sets to work together
   - No data loss, full backward compatibility

4. **Updates RLS policies:**
   - Works with both `user_id` and `student_id`
   - Secure access control maintained

**Safe to run:** Yes - preserves all existing data and columns

---

## Why This Happened

Your `payment_verification` table was likely:
1. Created manually via Supabase Table Editor
2. Copied from the `payments` table structure
3. Created by an old migration that had different column names

The admin dashboard code expects a **simpler event-payment-verification** schema, while your table has a **general-purpose payment** schema.

Migration 004 creates **compatibility** between both schemas.

---

## Execution Instructions

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in sidebar

### Step 2: Run Migrations in Order

#### Run Migration 002
- Click "New Query"
- Copy/paste entire contents of `002_add_past_questions_payment_verification.sql`
- Click "Run"
- Should see: "Success. No rows returned"

#### Run Migration 003
- Click "New Query"
- Copy/paste entire contents of `003_fix_schema_mismatches.sql`
- Click "Run"
- Should see NOTICE messages about columns added

#### Run Migration 004
- Click "New Query"
- Copy/paste entire contents of `004_align_payment_verification_schema.sql`
- Click "Run"
- Should see NOTICE messages about student_id, created_at, proof_url, payment_reference added

### Step 3: Verify
Run this query:
```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('past_questions', 'payment_verification', 'audit_logs')
  AND column_name IN (
    'student_id', 'created_at', 'proof_url', 'payment_reference',
    'admin_id', 'entity_type', 'entity_id', 'course_code', 'file_url'
  )
ORDER BY table_name, column_name;
```

You should see all these columns listed.

### Step 4: Test
1. Hard refresh browser (Ctrl+Shift+R)
2. Upload a past question
3. Should display immediately ✅
4. Payment verification tab should load ✅
5. No console errors ✅

---

## Expected Results

### Before Migrations:
```
❌ past_questions: 404 Not Found
❌ payment_verification: 400 Bad Request (column created_at does not exist)
❌ audit_logs: 500 Internal Server Error (column admin_id does not exist)
❌ Dashboard: Empty, nothing displays
❌ Uploads: Success message but data lost
```

### After All 3 Migrations:
```
✅ past_questions: Loads and displays uploaded files
✅ payment_verification: Loads with both old and new column names
✅ audit_logs: Accepts all expected fields
✅ Dashboard: Displays all data correctly
✅ Uploads: Save to database AND display immediately
✅ Console: Zero 400/404/500 errors
```

---

## Backward Compatibility Guarantee

**Your existing data is safe!**

Migration 004 does NOT:
- ❌ Delete any columns
- ❌ Remove any data
- ❌ Break existing queries
- ❌ Require app downtime

Migration 004 DOES:
- ✅ Add new columns alongside old ones
- ✅ Copy existing data to new columns
- ✅ Keep both column sets synced via triggers
- ✅ Allow old code to keep working
- ✅ Allow new code to work too

---

## Files Created/Modified

### New Migration Files:
1. `backend/migrations/002_add_past_questions_payment_verification.sql`
2. `backend/migrations/003_fix_schema_mismatches.sql`
3. `backend/migrations/004_align_payment_verification_schema.sql` ← **Most important**

### Updated Schema:
1. `backend/database/schema.sql` - Updated to reflect correct schema

### Documentation:
1. `QUICK FIX - Past Questions Not Showing.md` - Step-by-step guide
2. `Fix Missing Tables Guide.md` - Detailed troubleshooting
3. `SCHEMA MISMATCH ANALYSIS.md` - This document

---

## Support

If you still see errors after running all 3 migrations:

1. Check Supabase → Logs → Postgres Logs
2. Verify all migrations ran without errors
3. Run the verification query above
4. Check browser console for specific error messages
5. Ensure hard refresh was done (Ctrl+Shift+R)

---

**Status:** Ready to deploy  
**Risk Level:** Low (all migrations are non-destructive)  
**Estimated Time:** 5 minutes total  
**Rollback Plan:** Not needed (columns are added, not removed)
