# Fix Missing Tables - Past Questions & Payment Verification

## Problem Summary

The `past_questions` and `payment_verification` tables are missing from your Supabase database. This causes:
- **404 errors** when loading past questions in admin/student dashboards
- **Upload success but no display** - files upload to storage buckets successfully but records can't be saved to the database
- **Empty tables** on both admin and student dashboards

## Root Cause

The tables were never created in your Supabase database. While the code expects them to exist, they were missing from the initial schema setup.

## Solution

### Option 1: Run the Migration SQL (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the entire contents** of this file:
   ```
   backend/migrations/002_add_past_questions_payment_verification.sql
   ```

4. **Click "Run"** (bottom right corner)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - Run this verification query:
   ```sql
   SELECT tablename 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('past_questions', 'payment_verification');
   ```
   - You should see both tables listed

### Option 2: Use Supabase Table Editor

If you prefer using the UI:

#### Create past_questions table:

1. Go to **Table Editor** → **New table**
2. Table name: `past_questions`
3. Enable RLS: ✅ Yes
4. Add columns:
   - `id` (uuid, primary key, default: `gen_random_uuid()`)
   - `title` (text, nullable)
   - `course_code` (text, required)
   - `course_name` (text, nullable)
   - `level` (text, nullable)
   - `semester` (text, nullable)
   - `file_url` (text, required)
   - `file_type` (text, nullable)
   - `uploaded_by` (uuid, foreign key to `admin_users.id`, nullable)
   - `created_at` (timestamptz, default: `now()`)

5. **Add RLS Policy:**
   - Go to Authentication → Policies → `past_questions`
   - New Policy → "Enable read access for authenticated users"
   - Policy name: `past_questions_select_authenticated`
   - Policy definition:
   ```sql
   CREATE POLICY "past_questions_select_authenticated" 
     ON public.past_questions 
     FOR SELECT 
     TO authenticated 
     USING (true);
   ```

#### Create payment_verification table:

1. Go to **Table Editor** → **New table**
2. Table name: `payment_verification`
3. Enable RLS: ✅ Yes
4. Add columns:
   - `id` (uuid, primary key, default: `gen_random_uuid()`)
   - `student_id` (uuid, foreign key to `students.id`)
   - `event_id` (uuid, foreign key to `events.id`)
   - `amount` (numeric(10,2), nullable)
   - `payment_reference` (text, nullable)
   - `proof_url` (text, nullable)
   - `status` (text, default: `'pending'`)
   - `created_at` (timestamptz, default: `now()`)

5. **Add RLS Policies:**
   ```sql
   -- Allow students to read their own payment verifications
   CREATE POLICY "payment_verification_select_own" 
     ON public.payment_verification 
     FOR SELECT 
     USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

   -- Allow students to insert their own payment verifications
   CREATE POLICY "payment_verification_insert_own" 
     ON public.payment_verification 
     FOR INSERT 
     WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
   ```

## After Running the Migration

### Test the Fix

1. **Refresh your admin dashboard** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Upload a past question:**
   - Go to "Past Questions" tab
   - Click "Add Past Question"
   - Fill in: course code, course name, level, semester
   - Select a file
   - Click "Upload"

3. **Verify it displays:**
   - The uploaded past question should now appear in the table
   - Check console logs - no more 404 errors
   - Students should also see it in their dashboard

### Expected Console Output (Success)

After the fix, you should see:
```
✅ Environment loaded
🔗 Supabase URL: https://pnusmlckowqagnlzjqbv.supabase.co
📦 Dedicated Buckets: past-questions, timetables, resources, ...
[loadPastQuestions] loaded 1 row(s)  // Instead of 404 error
```

### What Was Fixed

1. ✅ **Added missing tables to `backend/database/schema.sql`**
2. ✅ **Created migration file: `002_add_past_questions_payment_verification.sql`**
3. ✅ **Added Row Level Security (RLS) policies**
4. ✅ **Added indexes for performance**
5. ✅ **Updated schema with proper foreign key relationships**

## Storage Buckets Status

Your storage buckets are already properly configured:
- ✅ `past-questions` bucket exists
- ✅ `payment-proofs` bucket exists
- ✅ All 7 dedicated buckets are provisioned

The only issue was the missing **database tables** for storing the metadata.

## Common Issues

### Issue: "Permission denied for schema public"
**Solution:** Make sure you're logged in as the project owner in Supabase dashboard, or run the SQL as a superuser.

### Issue: "Relation already exists"
**Solution:** The table already exists! Just verify it has the correct schema by running:
```sql
\d past_questions
\d payment_verification
```

### Issue: Still getting 404 errors after migration
**Solution:**
1. Hard refresh your browser (Ctrl+Shift+R)
2. Check Supabase → Table Editor to confirm tables exist
3. Verify RLS policies are enabled
4. Check browser console for new error messages

## Files Modified

1. `backend/database/schema.sql` - Added past_questions & payment_verification tables
2. `backend/migrations/002_add_past_questions_payment_verification.sql` - New migration file
3. This guide document

## Next Steps

After running the migration:
1. Test uploading past questions ✅
2. Test payment verification flow ✅
3. Verify students can view past questions ✅
4. Verify admin can manage payment verifications ✅

---

**Need Help?**
- Check Supabase logs: Dashboard → Logs → Postgres Logs
- Check browser console for any remaining errors
- Verify your Supabase project is on a paid plan (if RLS issues persist)
