# Reset Password Redirect Issue - Fix Guide

## Problem

The password reset email link goes to:
```
http://localhost:3000/#access_token=...&type=recovery
```

But the `reset-password.html` page is on a different URL (your frontend).

## Why This Happens

Supabase uses the **Site URL** configured in your project settings to generate the redirect URL in password reset emails. If the Site URL is set to your backend (`localhost:3000`) instead of your frontend, users end up on the wrong page.

## Solution: Configure Supabase Site URL

### Step 1: Identify Your Frontend URL

**For Local Development:**
- Using **Live Server** extension? → `http://localhost:5500` or `http://127.0.0.1:5500`
- Using **http-server**? → `http://localhost:8080`
- Using **python -m http.server**? → `http://localhost:8000`
- Open your frontend in browser and check the address bar

**For Production (Deployed):**
- Your Netlify URL: `https://nacos-tau-portal.netlify.app`

### Step 2: Update Supabase Configuration

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to URL Configuration**
   - Click **Authentication** (left sidebar)
   - Click **URL Configuration** (under Authentication menu)

3. **Set Site URL**
   
   **For Local Testing:**
   ```
   Site URL: http://localhost:5500
   ```
   (Replace `5500` with your actual frontend port)

   **For Production:**
   ```
   Site URL: https://nacos-tau-portal.netlify.app
   ```

4. **Add Redirect URLs**
   
   Click **"Add a redirect URL"** and add these:

   **For Local Testing:**
   ```
   http://localhost:5500/reset-password.html
   http://127.0.0.1:5500/reset-password.html
   http://localhost:8080/reset-password.html
   ```
   (Add all possible local URLs you might use)

   **For Production:**
   ```
   https://nacos-tau-portal.netlify.app/reset-password.html
   ```

5. **Click Save**

### Step 3: Test the Fix

1. **Wait 1-2 minutes** for changes to propagate
2. **Request a NEW password reset**
   - Go to forgot-password.html
   - Enter your email
   - Submit
3. **Check your email inbox**
4. **Click the NEW reset link**
5. **Should now redirect correctly** to reset-password.html ✅

## Important Notes

### Old Links Won't Update
Password reset links already sent **before** you changed the Supabase config will still use the old redirect URL. Always test with a **fresh reset request**.

### Development vs Production
You'll need **different Site URL** settings for:
- **Local development:** `http://localhost:XXXX`
- **Production:** `https://nacos-tau-portal.netlify.app`

**Best Practice:**
- Use production URL as the main Site URL
- Add all local URLs to Redirect URLs list
- Switch Site URL when actively testing locally

### Wildcard URLs
Supabase **doesn't support wildcards** in redirect URLs. You must explicitly list each URL:
- ❌ `http://localhost:*/reset-password.html`
- ✅ `http://localhost:5500/reset-password.html`
- ✅ `http://localhost:8080/reset-password.html`

## Verification Checklist

After configuration:

- [ ] Site URL is set to your frontend URL (not backend)
- [ ] Redirect URL includes `/reset-password.html` path
- [ ] Protocol matches (`http://` for local, `https://` for production)
- [ ] Port number is correct for local URLs
- [ ] Clicked "Save" in Supabase dashboard
- [ ] Waited 1-2 minutes for changes to apply
- [ ] Requested a NEW password reset (not using old link)
- [ ] Email received with reset link
- [ ] Link redirects to reset-password.html page ✅
- [ ] Token is in URL hash (`#access_token=...`)
- [ ] Reset form loads without errors

## Troubleshooting

### Issue: Still redirects to localhost:3000

**Cause:** Using an old reset link or Site URL not saved

**Fix:**
1. Double-check Supabase Site URL is saved
2. Request a **brand new** password reset
3. Use the **new link** from the new email

### Issue: "Invalid or Expired Link" error

**Cause:** The redirect URL is not in the allowed list

**Fix:**
1. Check Supabase → Authentication → URL Configuration → Redirect URLs
2. Ensure the exact URL is listed (including `/reset-password.html`)
3. Add it if missing, save, wait 1 minute
4. Request new reset link

### Issue: Reset link goes to 404 page

**Cause:** The `reset-password.html` file doesn't exist at that URL

**Fix:**
1. Verify `reset-password.html` exists in your frontend folder
2. Deploy the file if testing on Netlify
3. Ensure the file is accessible at the URL (try visiting directly)

### Issue: Token visible but reset doesn't work

**Cause:** The reset-password.html page isn't processing the token

**Fix:**
1. Open browser DevTools → Console
2. Look for JavaScript errors
3. Verify `supabase-config.js` is loading
4. Check that the import statement works:
   ```javascript
   import { supabase } from './assets/js/supabase-config.js';
   ```

## URL Examples

### Correct Local Development Setup

**Site URL:**
```
http://localhost:5500
```

**Redirect URLs:**
```
http://localhost:5500/reset-password.html
http://127.0.0.1:5500/reset-password.html
```

**Result:** Email link will be:
```
http://localhost:5500/reset-password.html#access_token=...&type=recovery
```

### Correct Production Setup

**Site URL:**
```
https://nacos-tau-portal.netlify.app
```

**Redirect URLs:**
```
https://nacos-tau-portal.netlify.app/reset-password.html
```

**Result:** Email link will be:
```
https://nacos-tau-portal.netlify.app/reset-password.html#access_token=...&type=recovery
```

## Quick Copy-Paste URLs

### For Supabase Redirect URLs Field

**Local Development (add all that apply):**
```
http://localhost:5500/reset-password.html
http://127.0.0.1:5500/reset-password.html
http://localhost:8080/reset-password.html
http://localhost:8000/reset-password.html
http://localhost:3001/reset-password.html
```

**Production:**
```
https://nacos-tau-portal.netlify.app/reset-password.html
```

## Code Changes Made

Updated `frontend/forgot-password.html` to:
- ✅ Explicitly set redirect URL based on current origin
- ✅ Log the redirect URL to console for debugging
- ✅ Works for both localhost and production

The code now uses:
```javascript
redirectTo: `${window.location.origin}/reset-password.html`
```

This ensures the redirect always goes to the same domain as the forgot-password page.

## Testing Workflow

1. ✅ Configure Supabase Site URL
2. ✅ Add redirect URLs to whitelist
3. ✅ Save configuration
4. ✅ Wait 1-2 minutes
5. ✅ Open `forgot-password.html` in browser
6. ✅ Submit password reset request
7. ✅ Check email inbox
8. ✅ Click reset link
9. ✅ Should land on `reset-password.html` with token in URL
10. ✅ Fill out new password form
11. ✅ Submit and verify password reset works

---

**Status:** Configuration required in Supabase Dashboard  
**Time Needed:** 2-3 minutes  
**Files Modified:** `frontend/forgot-password.html` (improved redirect logic)
