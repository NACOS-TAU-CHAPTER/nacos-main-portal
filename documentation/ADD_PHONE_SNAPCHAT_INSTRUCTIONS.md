# Instructions: Adding Phone and Snapchat Fields

**Date**: August 3, 2026  
**Status**: Additional fields for Student Networking

---

## Summary

We need to add Phone Number and Snapchat fields to the student profile. Phone already exists in the database, but Snapchat needs to be added.

---

## Step 1: Run Database Migration (Snapchat)

```bash
cd backend
# Run the migration SQL manually in Supabase SQL Editor
```

**Migration SQL** (already created at `backend/migrations/008_add_snapchat_field.sql`):
```sql
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS snapchat TEXT;

COMMENT ON COLUMN students.snapchat IS 'Snapchat username (not URL, just username)';
```

---

## Step 2: Backend Changes Already Done ✅

The following backend files have been updated:

1. **`backend/middleware/validation.js`** - Added snapchat validation
2. **`backend/routes/students.js`** - Added snapchat to profile update
3. **`backend/utils/validators.js`** - Updated sanitization to skip URLs

---

## Step 3: Frontend Changes

### A. HTML Form (Already Added ✅)

The Edit Profile Modal in `frontend/student-dashboard.html` now includes:

- Phone Number field (`profilePhone`)
- Snapchat field (`profileSnapchat`)

Located in the "Contact Information" section before "Social Media & Links"

### B. Add JavaScript File

**File created**: `frontend/assets/js/profile-management.js`

This file contains all the profile management functions:
- `calculateProfileCompletion()` 
- `updateProfileCompletion()`
- `loadProfileIntoForm()` 
- `handleSkillKeypress()`
- `handleInterestKeypress()`
- `removeTag()`
- `setupProfileForm()`

### C. Include the Script

Add this line in `student-dashboard.html` **BEFORE** the main module script:

```html
<!-- Add this line -->
<script src="assets/js/profile-management.js"></script>

<!-- Before this existing line -->
<script type="module">
  import { supabase, checkAuth, signOut, uploadFileToStorage } from './assets/js/supabase-config.js';
  ...
</script>
```

### D. Initialize Profile Management

In the main script module, add after `loadStudentData()`:

```javascript
// Store studentData globally for profile management
window.studentData = studentData;

// Initialize profile form with handlers
window.setupProfileForm(supabase, showSuccess, showError, loadStudentData);

// Update profile completion
window.updateProfileCompletion(studentData);
```

---

## Step 4: Test the Feature

1. Start backend: `cd backend && npm start`
2. Open student-dashboard.html in browser
3. Login as a student
4. Click "Edit Profile"
5. Test adding:
   - Phone number (e.g., `+234 812 345 6789`)
   - Snapchat username (e.g., `johndoe123`)
   - Skills and interests (press Enter after each)
6. Save and verify data persists

---

## Expected Behavior

### Phone Field
- **Input**: Nigerian phone number format
- **Validation**: Backend validates Nigerian numbers (+234...)
- **Privacy**: Toggle "Show my phone number" controls visibility
- **Display**: Shows in profile view if privacy allows

### Snapchat Field
- **Input**: Just the username (not URL)
- **Example**: `johndoe123`
- **Validation**: 3-30 characters, letters/numbers/dots/underscores/hyphens
- **Display**: Shows as "Snapchat: @username" in profile view

---

## Files Modified

### Backend ✅
1. `backend/migrations/008_add_snapchat_field.sql` (created)
2. `backend/middleware/validation.js` (updated)
3. `backend/routes/students.js` (updated)
4. `backend/utils/validators.js` (updated)

### Frontend ✅
1. `frontend/student-dashboard.html` (updated - phone & snapchat fields added)
2. `frontend/assets/js/profile-management.js` (created)

### Frontend ⏳ (Needs Manual Completion)
- Add script tag for `profile-management.js`
- Initialize the profile management functions
- Connect to the main dashboard script

---

## Troubleshooting

### Profile Won't Save
- Check browser console for validation errors
- Verify backend is running on localhost:5000
- Check if migration 008 ran successfully

### Fields Not Showing
- Verify `profilePhone` and `profileSnapchat` IDs exist in HTML
- Check if script tag for `profile-management.js` is added
- Verify functions are initialized in main script

### Snapchat Validation Error
- Only use username (no `@` symbol, no URL)
- Must be 3-30 characters
- Only letters, numbers, dots, underscores, hyphens allowed

---

## Profile Completion Calculation

The profile completion now includes phone in the calculation (9 fields total):
1. Bio
2. Skills (array with items)
3. Interests (array with items)
4. LinkedIn
5. GitHub
6. Profile Picture
7. Year of Study
8. Graduation Year
9. **Phone** ← NEW

Snapchat is optional and doesn't affect completion percentage.

---

## Quick Reference

### Form Field IDs
```javascript
document.getElementById('profilePhone')    // Phone number
document.getElementById('profileSnapchat') // Snapchat username
document.getElementById('profileBio')      // Bio textarea
document.getElementById('skillsInput')     // Skills input
document.getElementById('interestsInput')  // Interests input
```

### API Endpoint
```
PUT /api/students/me
Body: {
  phone: "+234 XXX XXX XXXX",
  snapchat: "username123",
  bio: "...",
  skills: [...],
  interests: [...],
  // ... other fields
}
```

---

## Next Steps

1. ✅ Run migration 008 in Supabase
2. ⏳ Add script tag to student-dashboard.html
3. ⏳ Initialize profile management in main script
4. ⏳ Test the complete flow
5. ⏳ Verify phone and snapchat save correctly
6. ⏳ Check privacy settings work for phone

---

**Created**: August 3, 2026  
**Status**: Backend complete, Frontend needs script integration
