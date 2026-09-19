# QUICK FIX: Past Questions Not Displaying

## The Problem
✅ Files upload successfully to storage  
❌ "Upload successful" message shows
❌ Nothing displays in the dashboard  
❌ Console shows column errors

## The Causes (4 Issues Found)

### Issue 1: Missing past_questions Table
The `past_questions` table doesn't exist in your database.

### Issue 2: payment_verification Schema Mismatch - MAJOR
Your existing `payment_verification` table has different column names than the code expects:
- Your table has: `user_id`, `payment_proof_url`, `submitted_at`
- Code expects: `student_id`, `proof_url`, `created_at`

### Issue 3: audit_logs Schema Mismatch  
Your `audit_logs` table is missing several columns the code needs.
- **Error:** `Could not find the 'admin_id' column of 'audit_logs'`

### Issue 4: Missing created_at on payment_verification
The admin dashboard tries to order by `created_at` but your table uses `submitted_at`.

## The Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in left sidebar

### Step 2: Run Migration #1 - Create past_questions Table
Click **"New Query"**, then copy/paste **entire contents** of:

```
backend/migrations/002_add_past_questions_payment_verification.sql
```

Click **"Run"** → Should see: **"Success. No rows returned"**

**Note:** This will try to create payment_verification but it already exists - that's fine, the `IF NOT EXISTS` will skip it.

### Step 3: Run Migration #2 - Fix audit_logs Schema
Click **"New Query"**, then copy/paste **entire contents** of:

```
backend/migrations/003_fix_schema_mismatches.sql
```

Click **"Run"** → Should see **NOTICE** messages confirming columns were added.

### Step 4: Run Migration #3 - Align payment_verification Columns
Click **"New Query"**, then copy/paste **entire contents** of:

```
backend/migrations/004_align_payment_verification_schema.sql
```

Click **"Run"** → Should see **NOTICE** messages about adding student_id, created_at, payment_reference, proof_url.

**This is the critical one!** It adds the columns the code needs while keeping your existing columns intact, and creates triggers to keep them synced.

### Step 5: Verify Everything Works
Run this verification query in a **new query**:

```sql
-- Check all required columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('past_questions', 'payment_verification', 'audit_logs')
  AND column_name IN (
    'id', 'created_at', 'student_id', 'proof_url', 'payment_reference',
    'admin_id', 'entity_type', 'entity_id', 'course_code', 'file_url'
  )
ORDER BY table_name, column_name;
```

You should see all the key columns listed.

### Step 6: Test Upload
1. **Hard refresh your browser** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Go to admin dashboard** → Past Questions tab
3. **Upload a past question**
4. **It should now display immediately** ✅
5. **Check console** - no more column errors ✅
6. **Check Payment Verification tab** - should load without errors ✅

## What Each Migration Does

### Migration 002 (Create past_questions)
- ✅ Creates `past_questions` table with proper schema
- ✅ Skips `payment_verification` since it already exists
- ✅ Adds RLS policies
- ✅ Adds indexes

### Migration 003 (Fix audit_logs)
- ✅ Adds `admin_id` to `audit_logs`
- ✅ Adds `entity_type`, `entity_id`, `user_agent` to `audit_logs`
- ✅ Adds missing indexes

### Migration 004 (Align payment_verification) - CRITICAL
- ✅ Adds `student_id` (keeps existing `user_id`)
- ✅ Adds `created_at` (keeps existing `submitted_at`)
- ✅ Adds `proof_url` (keeps existing `payment_proof_url`)
- ✅ Adds `payment_reference` (keeps existing `transaction_id`)
- ✅ Creates triggers to sync old ↔️ new columns automatically
- ✅ Updates RLS policies to work with both column sets

**Important:** This doesn't break your existing data! Both old and new column names work, and they stay synced via triggers.

## Console Errors - Before vs After

### Before:
```
❌ GET .../payment_verification?...&order=created_at.desc 400 (Bad Request)
❌ column payment_verification.created_at does not exist
❌ POST .../audit_logs 500 (Internal Server Error)
❌ Could not find the 'admin_id' column of 'audit_logs'
❌ Nothing displays in dashboard
```

### After:
```
✅ Environment loaded
✅ Supabase client initialized  
✅ User signed in
✅ [loadPastQuestions] loaded X row(s)
✅ [loadPayments] loaded X row(s)
✅ Past questions display immediately
✅ Payment verification tab loads
```

## Why Your Schema Was Different

You likely created the `payment_verification` table manually or copied it from the `payments` table structure. The admin dashboard code expects a simpler schema focused on event payment verification only.

The migration creates **compatibility** - both schemas now work together via:
- New columns for what the code needs
- Old columns preserved for backward compatibility
- Triggers that keep them in sync automatically

## Need More Details?

See the full guide: **"Fix Missing Tables Guide.md"**

## Still Having Issues After Running All 3 Migrations?

Check:
1. ✅ All 3 migration files were run in order
2. ✅ No errors in Supabase SQL Editor output
3. ✅ Verification query shows all required columns
4. ✅ Browser was hard-refreshed (Ctrl+Shift+R)
5. ✅ Console shows no 400/500 errors
6. ✅ Check Supabase → Logs → Postgres Logs for any errors

---

**Important:** Run ALL THREE migrations in order:
1. `002_add_past_questions_payment_verification.sql`
2. `003_fix_schema_mismatches.sql`
3. `004_align_payment_verification_schema.sql` ← **Critical for payment_verification**

This should fix everything completely! 🎉
