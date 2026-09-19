# Run Migration 010 - Using Node.js Script

## Quick Start (3 methods)

Since Supabase dashboard is down, use this Node.js script instead!

### Method 1: Double-Click (Easiest - Windows)

1. Navigate to `backend` folder
2. **Double-click** `run-migration-010.bat`
3. Wait for "✅ Migration 010 completed successfully!"
4. Press any key to close

### Method 2: Command Line

```bash
cd backend
node scripts/migrate-010-audit-logs.js
```

### Method 3: npm Script (if you prefer)

```bash
cd backend
npm run migrate:010
```

*(Note: You'll need to add this to package.json scripts first)*

## What This Script Does

The script automatically:
1. ✅ Connects to your Supabase database
2. ✅ Drops old restrictive policy
3. ✅ Creates service_role policy (backend can write)
4. ✅ Creates user read policy (users see own logs)
5. ✅ Creates admin read policy (admins see all logs)
6. ✅ Enables RLS on audit_logs table
7. ✅ Verifies all policies were created

## Requirements

- ✅ Node.js installed (you already have this)
- ✅ `.env` file in `backend/` with:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Expected Output

```
🚀 Starting Migration 010: Fix Audit Logs RLS Policies...

📝 Step 1: Removing old restrictive policy...
   ✅ Old policy dropped (if existed)

📝 Step 2: Creating service_role policy...
   ✅ Service role policy created

📝 Step 3: Creating user read policy...
   ✅ User read policy created

📝 Step 4: Creating admin read policy...
   ✅ Admin read policy created

📝 Step 5: Verifying RLS is enabled...
   ✅ RLS enabled

📝 Step 6: Verifying policies...
   ✅ Policies verified:
      - audit_logs_service_role_all (ALL)
      - audit_logs_read_own (SELECT)
      - audit_logs_admin_read_all (SELECT)

============================================================
✅ Migration 010 completed successfully!
============================================================

Next steps:
1. Restart your backend server
2. Test audit logging by performing an admin action
3. Check that no RLS errors appear in console
```

## Troubleshooting

### Error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"

**Solution**: Check your `backend/.env` file has both variables:
```env
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Error: "Cannot find module '@supabase/supabase-js'"

**Solution**: Install dependencies first:
```bash
cd backend
npm install
```

### Error: "exec_sql" function doesn't exist

**Solution**: The script automatically handles this. If it still fails:
1. Wait for Supabase dashboard to come back online
2. Run the SQL from `backend/migrations/010_fix_audit_logs_rls.sql` manually

### Script fails but shows SQL output

**This is OK!** The script will print the SQL you need. Copy it and:
1. Wait for Supabase to come back
2. Go to SQL Editor
3. Paste and run

## After Running Successfully

1. **Restart backend server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Test audit logging:**
   - Login as admin
   - Delete a student or create an event
   - Check browser console - should see **NO RLS errors** ✅

3. **Verify in database** (when Supabase is back):
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'audit_logs';
   ```
   
   Should show:
   - `audit_logs_service_role_all` (ALL)
   - `audit_logs_read_own` (SELECT)
   - `audit_logs_admin_read_all` (SELECT)

## Manual SQL (if script completely fails)

If the script doesn't work at all, here's the SQL to run manually when Supabase is back:

```sql
-- Drop old policy
DROP POLICY IF EXISTS "audit_logs_no_anon" ON public.audit_logs;

-- Create service_role policy
CREATE POLICY "audit_logs_service_role_all" 
ON public.audit_logs FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Create user read policy
CREATE POLICY "audit_logs_read_own" 
ON public.audit_logs FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Create admin read policy
CREATE POLICY "audit_logs_admin_read_all" 
ON public.audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

## Files Created

1. ✅ `backend/scripts/migrate-010-audit-logs.js` - Main migration script
2. ✅ `backend/run-migration-010.bat` - Windows double-click runner
3. ✅ `backend/migrations/010_fix_audit_logs_rls.sql` - SQL migration file

## Next Steps After Migration

Once the migration completes:

1. ✅ Backend can write audit logs (no RLS errors)
2. ✅ Admin dashboard actions are logged
3. ✅ Audit logs page works correctly
4. ✅ Users can see their own logs
5. ✅ Admins can see all logs

---

**Status**: Ready to run
**Estimated Time**: < 1 minute
**Difficulty**: Easy (just run the script!)
