# 🧪 Testing CSRF Fix

## Why It's Still Failing

You're viewing the **production site** (https://your-site.netlify.app), which hasn't been updated yet with the fix!

The fix is saved **locally** but needs to be:
1. Tested locally first
2. Then deployed to production

---

## ✅ Option 1: Test Locally

### Step 1: Open Local File

Open this file directly in your browser:
```
file:///C:/Users/HP/Documents/nacos%20website/frontend/admin-dashboard.html
```

Or:
1. Navigate to `frontend/` folder
2. Right-click `admin-dashboard.html`
3. Open with → Browser

### Step 2: Try Deleting

Try to delete a timetable and check console

**Expected logs:**
```
[apiAdmin] CSRF token obtained for DELETE /timetables/...: ✅ Yes
[apiAdmin] Including CSRF token in DELETE /timetables/... request
[apiAdmin] DELETE /timetables/... headers: Array(3) ["Content-Type", "Authorization", "X-CSRF-Token"]
```

**If you see:**
```
[apiAdmin] CSRF token obtained for DELETE /timetables/...: ❌ No
```

Then `securityManager` isn't initialized properly.

---

## ✅ Option 2: Deploy to Production

### Quick Deploy:

```bash
cd "C:\Users\HP\Documents\nacos website"

git add frontend/admin-dashboard.html
git commit -m "Fix: Add CSRF token to admin API requests with debug logging"
git push origin main
```

Wait 2 minutes for Netlify to deploy, then:

1. **Hard refresh** the page: `Ctrl + Shift + R`
2. **Clear cache**: DevTools → Application → Clear storage
3. Try deleting again

---

## 🔍 Debug: Check Current State

### In Browser Console, run:

```javascript
// Check if securityManager exists
console.log('securityManager:', window.securityManager);

// Check if it's initialized
console.log('isInitialized:', window.securityManager?.isInitialized);

// Try to get CSRF token manually
window.securityManager?.getCsrfToken().then(token => {
  console.log('CSRF Token:', token ? '✅ Present' : '❌ Missing');
  console.log('Token value:', token);
});

// Check if it's the old version (no CSRF in apiAdminRequest)
console.log('apiAdminRequest function:', apiAdminRequest.toString().includes('getCsrfToken') ? '✅ Updated' : '❌ Old version');
```

---

## 🎯 Expected Debug Output

When you click delete, console should show:

```
[apiAdmin] CSRF token obtained for DELETE /timetables/xxx: ✅ Yes
[apiAdmin] Including CSRF token in DELETE /timetables/xxx request
[apiAdmin] DELETE /timetables/xxx headers: (3) ["Content-Type", "Authorization", "X-CSRF-Token"]
```

**If missing any of above:** The fix isn't loaded yet

---

## ⚠️ Common Issues

### Issue 1: Old Cached Version

**Symptom:**
```javascript
apiAdminRequest.toString().includes('getCsrfToken') 
// Returns: false
```

**Solution:**
```bash
# Hard refresh
Ctrl + Shift + R

# Or clear cache
DevTools → Application → Storage → Clear site data
```

### Issue 2: SecurityManager Not Ready

**Symptom:**
```javascript
window.securityManager
// Returns: undefined
```

**Solution:**
Wait a moment for page to load, then check:
```javascript
setTimeout(() => {
  console.log('securityManager:', window.securityManager);
}, 2000);
```

### Issue 3: CSRF Token Empty

**Symptom:**
```
[apiAdmin] CSRF token obtained: ❌ No
```

**Possible causes:**
1. `securityManager.getCsrfToken()` failed
2. Backend `/csrf-token` endpoint not responding
3. CORS/cookies issue

**Check:**
```javascript
// Manually test CSRF endpoint
fetch('https://nacos-tau-frontend.onrender.com/api/csrf-token', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

---

## 📊 Comparison

### ❌ Before (What You're Seeing Now)

```http
DELETE /api/admin/timetables/xxx
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJ...
  (NO X-CSRF-Token!)

Response: 403 Forbidden
```

### ✅ After (What Should Happen)

```http
DELETE /api/admin/timetables/xxx
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJ...
  X-CSRF-Token: abc123...  ← This is added!

Response: 200 OK
```

---

## 🚀 Quick Fix: Deploy Now

If you want to fix it immediately in production:

```bash
# From project root
cd "C:\Users\HP\Documents\nacos website"

# Add and commit
git add frontend/admin-dashboard.html
git commit -m "Fix: Add CSRF token to admin DELETE requests"

# Push to trigger Netlify deploy
git push origin main

# Wait 2 minutes, then hard refresh browser
```

---

## ✅ Verification Script

Paste this in console to verify everything:

```javascript
(async function verifyCSRFFix() {
  console.log('=== CSRF Fix Verification ===');
  
  // 1. Check securityManager
  const sm = window.securityManager;
  console.log('1. securityManager exists:', !!sm);
  console.log('   - isInitialized:', sm?.isInitialized);
  
  // 2. Check CSRF token
  if (sm && sm.getCsrfToken) {
    try {
      const token = await sm.getCsrfToken();
      console.log('2. CSRF token:', token ? '✅ Available' : '❌ Missing');
    } catch (e) {
      console.log('2. CSRF token: ❌ Error:', e.message);
    }
  } else {
    console.log('2. CSRF token: ❌ getCsrfToken not available');
  }
  
  // 3. Check apiAdminRequest
  const hasCSRFCode = apiAdminRequest.toString().includes('getCsrfToken');
  console.log('3. apiAdminRequest updated:', hasCSRFCode ? '✅ Yes' : '❌ No (old version)');
  
  // 4. Summary
  console.log('\n=== Summary ===');
  if (sm && sm.getCsrfToken && hasCSRFCode) {
    console.log('✅ Fix is applied and ready!');
  } else {
    console.log('❌ Fix not applied yet. Hard refresh or deploy needed.');
  }
})();
```

---

## 🎯 Next Steps

1. **Deploy to production** (recommended):
   ```bash
   git push origin main
   ```

2. **Wait 2 minutes** for Netlify

3. **Hard refresh**: `Ctrl + Shift + R`

4. **Try delete again** - should work! ✅

---

**Current Status:** Fix is saved locally but not deployed to production yet.

**Action Required:** Deploy to production OR test locally first.
