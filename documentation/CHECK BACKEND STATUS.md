# Backend 500 Error - Diagnostic Guide

## Current Issue

Your backend is running on `localhost:5000` but returning **500 Internal Server Error** for:
- `POST /api/storage/ensure-buckets` → 500
- `POST /api/admin/academic_resources` → 500

This means the backend server is **crashing** when processing these requests.

## Most Likely Causes

### 1. Missing Environment Variables (Most Common)

The backend needs these environment variables in `backend/.env`:

```env
# Required for storage operations
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-secret-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>

# Required for admin operations
ADMIN_EMAILS=your-admin-email@tau.edu.ng
```

**Without `SUPABASE_SERVICE_ROLE_KEY`, storage admin operations will fail!**

### 2. Missing Database Tables

The migrations we created earlier need to be run in Supabase:
- `002_add_past_questions_payment_verification.sql`
- `003_fix_schema_mismatches.sql`
- `004_align_payment_verification_schema.sql`

## Quick Fix Steps

### Step 1: Check Backend Console/Terminal

Look at your backend terminal window. You should see error messages like:

**If missing env vars:**
```
Error: SUPABASE_SERVICE_ROLE_KEY is not defined
```

**If tables missing:**
```
relation "academic_resources" does not exist
```

**Copy the exact error message** - it will tell us what's wrong!

### Step 2: Check Your .env File

1. **Navigate to:** `c:\Users\HP\Documents\nacos website\backend`
2. **Check if `.env` file exists**
3. **If missing:** Copy `.env.example` to `.env`
4. **Open `.env`** and fill in the values:

```env
# Copy these from your Supabase Dashboard → Project Settings → API
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (SECRET - from Supabase dashboard)
SUPABASE_ANON_KEY=eyJhbGciOi... (PUBLIC - from Supabase dashboard)

ADMIN_EMAILS=your-email@tau.edu.ng
NODE_ENV=development
PORT=5000
```

### Step 3: Get Your Supabase Keys

1. **Go to** https://supabase.com/dashboard
2. **Select your project**
3. **Click "Project Settings"** (⚙️ icon in left sidebar)
4. **Click "API"** tab
5. **Copy these values:**
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** (SECRET!) → `SUPABASE_SERVICE_ROLE_KEY`

**IMPORTANT:** The `service_role` key is SECRET - never commit it to Git!

### Step 4: Restart Backend Server

After updating `.env`:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
cd backend
npm start
```

### Step 5: Test Again

After restart:
1. Refresh admin dashboard
2. Check console for errors
3. Should now see 200 OK instead of 500

## Checking What's Wrong

### View Backend Logs

Your backend terminal should show:
```
🚀 NACOS API Server running on port 5000
📡 Environment: development
🔗 Frontend URL: ...
```

**If you see errors during startup**, that's the problem!

### Common Error Messages

#### "SUPABASE_SERVICE_ROLE_KEY is not defined"
**Fix:** Add the key to `backend/.env`

#### "relation does not exist"
**Fix:** Run the database migrations in Supabase SQL Editor

#### "Cannot find module"
**Fix:** Run `npm install` in backend folder

#### "EADDRINUSE: address already in use :::5000"
**Fix:** Another process is using port 5000. Either:
- Stop the other process
- Change PORT in `.env` to 5001

## Complete .env Template

```env
# ============================================
# NACOS TAU Chapter — Backend Environment
# ============================================

# Server
PORT=5000
NODE_ENV=development
TRUST_PROXY=true

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5500

# Supabase (GET THESE FROM DASHBOARD)
SUPABASE_URL=https://pnusmlckowqagnlzjqbv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECRET!)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (PUBLIC)

# Admin Access
ADMIN_EMAILS=your-email@st.tau.edu.ng,admin@tau.edu.ng
ADMIN_PASSWORD=NacosAdmin2024!

# Rate Limiting
GLOBAL_RATE_LIMIT=100
```

## After Fixing

Once `.env` is configured and backend restarted:

**Console should show:**
```
✅ POST /api/storage/ensure-buckets 200 OK
✅ POST /api/admin/academic_resources 200 OK
✅ Data loads correctly
```

## Still Getting 500 Errors?

Share the **exact error message** from your backend terminal/console. It will show:
- What line failed
- What the error was
- Stack trace

This will tell us exactly what to fix!

---

**Next Step:** Check your backend terminal for error messages and update `.env` file with Supabase keys.
