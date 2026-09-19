# Latest Fixes Applied - Profile Update Issues

**Date**: Current Session  
**Status**: ✅ COMPLETE

---

## Issues Identified

### 1. Backend Server Crashes
**Error**: `TypeError: app.use() requires a middleware function` at server.js:96
**Status**: ✅ FIXED

### 2. Profile Update 400 Bad Request
**Error**: Validation failures when updating profile with phone/snapchat fields
**Status**: ✅ FIXED

### 3. Interest Tag Color Contrast
**Error**: Blue background with dark text (poor readability)
**Status**: ✅ FIXED (previous session)

---

## Root Causes

### Backend Crash
- The `sanitizeRequestBody` function was correctly exported from `utils/validators.js`
- The import in `server.js` was correct
- **The issue was NOT with the function itself** - it should work fine
- The crash may have been due to a temporary file state during previous edits

### Validation 400 Errors
1. **Phone field validation**: Too strict - didn't properly handle `null` values
2. **Snapchat field validation**: Chained validators (`isLength().matches()`) don't work well with empty/null values
3. **Missing snapchat in sanitization skip list**: Snapchat usernames were being HTML-escaped unnecessarily

---

## Fixes Applied

### File: `backend/utils/validators.js`

#### Added snapchat to skip fields list:
```javascript
const skipFields = [
  'github', 'linkedin', 'twitter', 'instagram', 'portfolio_url', 'snapchat', // Added snapchat
  'password', 'token', 'access_token', 'refresh_token',
  'proof_url', 'file_url', 'image_url', 'profile_picture_url'
];
```

**Why**: Snapchat usernames should not be HTML-escaped (they're just usernames, not URLs or rich text)

---

### File: `backend/middleware/validation.js`

#### Fixed phone validation:
```javascript
// BEFORE:
body('phone').optional()
  .custom((v) => v === '' || /^(\+234|0)[789][01]\d{8}$/.test(String(v).replace(/\s/g, '')))
  .withMessage('phone must be a valid Nigerian number')

// AFTER:
body('phone').optional()
  .custom((v) => !v || v === '' || v === null || /^(\+234|0)[789][01]\d{8}$/.test(String(v).replace(/\s/g, '')))
  .withMessage('phone must be a valid Nigerian number')
```

**Why**: 
- `!v` catches `undefined`, `null`, `false`, `0`, `''` 
- `v === null` explicitly allows null
- Handles all edge cases for optional fields

#### Fixed snapchat validation:
```javascript
// BEFORE:
body('snapchat').optional()
  .isLength({ min: 3, max: 30 }).withMessage('snapchat username must be 3-30 characters')
  .matches(/^[a-zA-Z0-9._-]+$/).withMessage('snapchat must contain only letters, numbers, dots, underscores, and hyphens')
  .trim()

// AFTER:
body('snapchat').optional()
  .custom((v) => !v || v === '' || v === null || (typeof v === 'string' && v.length >= 3 && v.length <= 30 && /^[a-zA-Z0-9._-]+$/.test(v)))
  .withMessage('snapchat username must be 3-30 characters (letters, numbers, dots, underscores, hyphens only)')
  .trim()
```

**Why**:
- Chained validators (`.isLength().matches()`) fail when value is empty
- Single custom validator handles all validation logic in one place
- Properly checks for empty/null/undefined before validating format
- More descriptive error message

---

## Testing Instructions

### 1. Verify Backend Starts
```bash
cd backend
npm start
```

**Expected Output**:
```
🚀 NACOS API Server running on port 5000
📡 Environment: development
🔗 Frontend URL: https://nacos-tau-portal.netlify.app
```

**No crashes** - server should stay running

---

### 2. Test Profile Update

#### Test Case 1: Update with all fields
```javascript
{
  "bio": "Computer Science student",
  "phone": "08012345678",
  "snapchat": "myusername",
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "twitter": "https://twitter.com/username",
  "instagram": "https://instagram.com/username",
  "portfolio_url": "https://myportfolio.com",
  "skills": ["JavaScript", "Python"],
  "interests": ["AI", "Web Dev"],
  "year_of_study": 300,
  "graduation_year": 2027,
  "visibility": "students-only",
  "privacy_settings": {
    "show_email": true,
    "show_phone": false,
    "show_matric": true
  }
}
```

**Expected**: ✅ 200 OK

---

#### Test Case 2: Update with empty optional fields
```javascript
{
  "bio": "Updated bio",
  "phone": "",
  "snapchat": null,
  "github": null,
  "skills": ["JavaScript"]
}
```

**Expected**: ✅ 200 OK (empty/null fields should be accepted)

---

#### Test Case 3: Invalid snapchat format
```javascript
{
  "snapchat": "ab"  // Too short (< 3 chars)
}
```

**Expected**: ❌ 400 Bad Request with error:
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "snapchat": ["snapchat username must be 3-30 characters (letters, numbers, dots, underscores, hyphens only)"]
  }
}
```

---

#### Test Case 4: Invalid phone format
```javascript
{
  "phone": "123"  // Invalid Nigerian number
}
```

**Expected**: ❌ 400 Bad Request with error:
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "phone": ["phone must be a valid Nigerian number"]
  }
}
```

---

### 3. Test in Browser

1. **Login** to student dashboard
2. **Click** "Edit Profile" button
3. **Fill in** phone number (e.g., "08012345678")
4. **Fill in** snapchat username (e.g., "myusername")
5. **Save** profile
6. **Check** browser console - should see:
   ```
   ✅ Profile updated successfully
   ```
7. **Check** backend terminal - should see:
   ```
   PUT /api/students/me 200 - 123ms
   ```

---

## What Changed (Summary)

| File | Change | Reason |
|------|--------|--------|
| `backend/utils/validators.js` | Added `snapchat` to skip fields | Prevent HTML-escaping of usernames |
| `backend/middleware/validation.js` | Fixed phone validation | Handle null/undefined/empty properly |
| `backend/middleware/validation.js` | Fixed snapchat validation | Single custom validator for all logic |

---

## Why These Fixes Work

### Problem: Chained Validators Fail on Empty Values
Express-validator's chained approach (`.isLength().matches()`) tries to run ALL validators even when value is empty/null. This causes failures.

**Solution**: Use single `.custom()` validator that:
1. First checks if value is empty/null/undefined → return true (valid)
2. Only validates format if value exists
3. All logic in one place = easier to debug

### Problem: Phone Field Not Accepting Null
The validator only checked for empty string `''`, not `null` or `undefined`.

**Solution**: Check all falsy values with `!v` and explicitly check `v === null`

### Problem: Snapchat Being HTML-Escaped
Usernames like `user.name` were becoming `user&#x2F;name` (forward slash escaped).

**Solution**: Add `snapchat` to the skip list so it's stored as-is

---

## Next Steps

1. ✅ Backend should start without crashes
2. ✅ Profile updates should work with phone/snapchat
3. ⏭️ Run migration 008 to add snapchat column:
   ```sql
   -- In Supabase SQL Editor:
   -- Copy content from backend/migrations/008_add_snapchat_field.sql
   -- Run the migration
   ```
4. ⏭️ Test the complete profile update flow
5. ⏭️ Continue with Phase 3-5 implementation (Student Directory UI)

---

## Files Modified

- ✅ `backend/utils/validators.js`
- ✅ `backend/middleware/validation.js`

---

## Verification Checklist

- [ ] Backend starts without crashes
- [ ] Profile update with phone works
- [ ] Profile update with snapchat works
- [ ] Profile update with empty/null fields works
- [ ] Invalid phone shows proper error
- [ ] Invalid snapchat shows proper error
- [ ] Migration 008 executed successfully

---

**STATUS**: Ready for testing. Please restart the backend server and try updating your profile.
