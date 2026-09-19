# QUICK FIX - Add URL Column to academic_resources

**Date**: August 3, 2026  
**Status**: ⚠️ URGENT - Academic resources cannot be added without this

---

## Current Situation

✅ **GOOD NEWS**: `category` column was successfully added  
❌ **ISSUE**: `url` column is still missing from `academic_resources` table

### What Admin Dashboard Requires
When adding an academic resource, the code sends:
```javascript
{
  title: "...",
  resource_type: "Tutorial",
  url: "https://...",        // ❌ STILL MISSING
  category: "Programming",    // ✅ NOW EXISTS
  description: "...",
  uploaded_by: admin_id
}
```

### Current Error
```
Could not find the 'url' column of 'academic_resources' in the schema cache | PGRST204
```

---

## SOLUTION - Run This SQL Now

**File**: `backend/migrations/006_add_url_to_academic_resources.sql`

**Copy and run in Supabase SQL Editor**:

```sql
-- Add 'url' column to academic_resources table
ALTER TABLE public.academic_resources 
ADD COLUMN IF NOT EXISTS url TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_academic_resources_url 
ON public.academic_resources(url);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'academic_resources' 
  AND table_schema = 'public'
  AND column_name = 'url';
```

---

## Expected Result

After running the SQL, you should see:
```json
[{
  "column_name": "url",
  "data_type": "text",
  "is_nullable": "YES"
}]
```

---

## Test After Adding Column

1. **Go to Admin Dashboard**
2. **Click "Add New" under Academic Resources**
3. **Fill in the form**:
   - Title: "Test Resource"
   - Type: "Tutorial"
   - URL: "https://example.com"
   - Category: "Programming"
   - Description: "Test"
4. **Click "Add Resource"**
5. **Should see**: ✅ "Resource added successfully!"

---

## Why Did This Happen?

The migration file `005_fix_academic_resources_schema.sql` has complex PL/pgSQL logic that may have failed silently. This simpler approach uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` which is more reliable.

---

## Next Steps After This Fix

Once the `url` column is added:
1. ✅ Academic resources can be added from admin dashboard
2. ✅ Student dashboard can display resource links
3. 🔍 Still need to investigate why past questions aren't displaying

---

**ACTION REQUIRED**: Run the SQL above in Supabase SQL Editor now
