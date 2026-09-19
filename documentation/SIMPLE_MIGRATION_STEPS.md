# Simple Migration Steps - Since Supabase is Down

Since Supabase dashboard is currently down, here's the simplest approach:

## Option 1: Wait for Supabase & Use SQL Editor (EASIEST)

When Supabase comes back online:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Migration 010: Fix Audit Logs RLS Policies

-- Drop old restrictive policy
DROP POLICY IF EXISTS "audit_logs_no_anon" ON public.audit_logs;

-- Create service_role policy (allows backend to write audit logs)
CREATE POLICY "audit_logs_service_role_all" 
ON public.audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create user read policy (users can see their own logs)
CREATE POLICY "audit_logs_read_own" 
ON public.audit_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create admin read policy (admins can see all logs)
CREATE POLICY "audit_logs_admin_read_all" 
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

4. Click **"Run"** ▶️
5. Done! ✅

## Option 2: Try Node Script (if you want to try now)

1. **Install PostgreSQL client:**
   ```bash
   cd backend
   npm install pg
   ```

2. **Run the migration script:**
   ```bash
   node scripts/migrate-010-direct.js
   ```

3. If it works: Great! ✅
4. If it fails: No problem, just use Option 1 when Supabase is back

## What This Migration Does

Fixes the RLS (Row Level Security) error you're seeing:
```
Error: new row violates row-level security policy for table "audit_logs"
```

By creating these policies:
- ✅ **service_role** - Allows your backend to INSERT/UPDATE/DELETE audit logs
- ✅ **read_own** - Users can see their own audit logs  
- ✅ **admin_read_all** - Admins can see ALL audit logs

## After Running Migration

1. **Restart backend server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Test it:**
   - Login as admin
   - Try deleting a student or creating an event
   - Check console - NO MORE RLS ERRORS! ✅

3. **Check audit logs page:**
   - Should work without errors
   - Clean action names
   - Filters working

## Temporary Workaround (Until Migration Runs)

The audit logs page will still work for READING logs. The RLS error only affects WRITING new logs.

So you can:
- ✅ View existing audit logs
- ✅ Filter and search logs
- ✅ Export to CSV
- ❌ New admin actions won't be logged (until migration runs)

## Files Reference

- **SQL Migration**: `backend/migrations/010_fix_audit_logs_rls.sql`
- **Node Script**: `backend/scripts/migrate-010-direct.js`
- **This Guide**: `SIMPLE_MIGRATION_STEPS.md`

---

**Recommendation**: Just wait for Supabase to come back and use Option 1 (SQL Editor). It's the simplest and most reliable method. Should take < 1 minute when Supabase is accessible.

**Status**: Waiting for Supabase dashboard
**Priority**: Medium (affects new log creation, not reading)
**Time**: < 1 minute when Supabase is back
