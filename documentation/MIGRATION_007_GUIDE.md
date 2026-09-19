# 🚀 Quick Start: Run Migration 007

## What This Does
Adds social media fields, interests, privacy controls, and academic information to enable the Student Networking & Directory feature.

## Prerequisites Checklist
- [ ] Node.js installed
- [ ] Backend `.env` file configured with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- [ ] Terminal/Command Prompt open

## Steps to Run

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Run the Migration
```bash
npm run migrate:007
```

### 3. Expected Output
You should see:
```
🚀 Running Migration 007: Student Networking & Directory Fields
📡 Connected to: https://your-project.supabase.co

⚙️  Altering students table...
   ✅ Success
📊 Creating index: idx_students_visibility...
   ✅ Success
...

🎉 Migration 007 completed successfully!
```

### 4. Verify Success
Check in Supabase Dashboard:
1. Go to **Table Editor** → **students** table
2. Look for new columns:
   - twitter
   - instagram  
   - portfolio_url
   - interests
   - year_of_study
   - graduation_year
   - visibility
   - privacy_settings

## Troubleshooting

### ❌ Error: "Cannot find module"
**Solution**: Install dependencies first
```bash
npm install
```

### ❌ Error: "SUPABASE_URL is not defined"
**Solution**: Check your `.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
```

### ❌ Error: "Permission denied"
**Solution**: Make sure you're using the **SERVICE KEY** (not ANON KEY)

### ⚠️ "Already exists" warnings
**Solution**: This is normal if running migration multiple times. Migration is idempotent.

## Alternative: Manual SQL Execution

If the script doesn't work, run SQL manually:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy contents from: `backend/migrations/007_add_student_networking_fields.sql`
3. Click **Run**

## Next Steps After Migration

1. ✅ Database is ready
2. 🔜 Implement backend API endpoints (Phase 2)
3. 🔜 Update frontend forms (Phase 3)

## Rollback (If Needed)

⚠️ **WARNING**: This will delete all data in new columns!

```bash
cd backend
psql $DATABASE_URL -f migrations/007_rollback_student_networking_fields.sql
```

Or run `007_rollback_student_networking_fields.sql` in Supabase SQL Editor.

## Need Help?

- Check: `backend/migrations/README_007.md` for detailed documentation
- Check: `.kiro/specs/student-networking/` for feature spec
- Review migration file: `backend/migrations/007_add_student_networking_fields.sql`

---

**Ready?** Run `npm run migrate:007` from the backend directory! 🚀
