# Run Migration 010 - Fix Audit Logs RLS

## Problem
The `audit_logs` table has Row Level Security (RLS) enabled, but there's no policy allowing INSERT operations. This causes 500 errors when trying to log admin actions:

```
Error: new row violates row-level security policy for table "audit_logs" | 42501
```

## Solution
Run migration 010 which adds proper RLS policies:
1. Allow service_role (backend) to INSERT/UPDATE/DELETE audit logs
2. Allow authenticated users to read their own logs
3. Allow admins to read all logs

## How to Run

### Option 1: Supabase Dashboard SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `backend/migrations/010_fix_audit_logs_rls.sql`
5. Paste into the SQL editor
6. Click **Run** (bottom right)
7. Wait for "Success" message

### Option 2: Using Node.js Script

```bash
cd backend
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = fs.readFileSync('./migrations/010_fix_audit_logs_rls.sql', 'utf8');

(async () => {
  const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    console.error('❌ Migration failed:', error);
  } else {
    console.log('✅ Migration 010 completed successfully');
  }
})();
"
```

### Option 3: Using psql Command Line

If you have PostgreSQL client installed:

```bash
# Get your connection string from Supabase dashboard > Project Settings > Database
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f backend/migrations/010_fix_audit_logs_rls.sql
```

## What This Migration Does

1. **Drops old restrictive policy**
   ```sql
   DROP POLICY IF EXISTS "audit_logs_no_anon" ON public.audit_logs;
   ```

2. **Creates service_role policy** (allows backend to write logs)
   ```sql
   CREATE POLICY "audit_logs_service_role_all" 
   ON public.audit_logs FOR ALL TO service_role
   USING (true) WITH CHECK (true);
   ```

3. **Creates user read policy** (users can see their own logs)
   ```sql
   CREATE POLICY "audit_logs_read_own" 
   ON public.audit_logs FOR SELECT TO authenticated
   USING (user_id = auth.uid());
   ```

4. **Creates admin read policy** (admins can see all logs)
   ```sql
   CREATE POLICY "audit_logs_admin_read_all" 
   ON public.audit_logs FOR SELECT TO authenticated
   USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));
   ```

## Verification

After running the migration, verify it worked:

1. **Check policies exist:**
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'audit_logs';
   ```
   
   Should show 3 policies:
   - `audit_logs_service_role_all`
   - `audit_logs_read_own`
   - `audit_logs_admin_read_all`

2. **Test audit log creation** by performing an admin action in the dashboard
   - Should see no more RLS errors in console
   - Audit logs should be created successfully

3. **Check audit logs table:**
   ```sql
   SELECT COUNT(*) FROM audit_logs;
   ```
   
   Should show logs being created

## Troubleshooting

### Issue: "permission denied for table audit_logs"
**Solution:** Make sure you're running the SQL with service_role key or as postgres user

### Issue: "policy already exists"
**Solution:** The migration uses `DROP POLICY IF EXISTS` so this shouldn't happen, but if it does, manually drop the policy first

### Issue: Still getting RLS errors
**Solution:** 
1. Verify migration ran successfully
2. Restart backend server
3. Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env`
4. Verify backend is using service_role client for audit operations

## After Migration

Once the migration completes successfully:
- ✅ Admin actions will be logged without errors
- ✅ Audit logs API will work correctly
- ✅ Admin dashboard will stop showing RLS errors
- ✅ Audit logs page will display data properly

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove new policies
DROP POLICY IF EXISTS "audit_logs_service_role_all" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_read_own" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_read_all" ON public.audit_logs;

-- Restore old restrictive policy
CREATE POLICY "audit_logs_no_anon" ON audit_logs 
FOR SELECT USING (false);
```

---

**Status**: Ready to run
**Priority**: High (blocks audit logging functionality)
**Estimated Time**: < 1 minute
