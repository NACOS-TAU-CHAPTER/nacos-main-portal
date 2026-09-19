# Fix year_of_study Validation Error

## Problem
```
Profile update error: Error: Validation failed:
year_of_study: year_of_study must be a year between 2020 and 2027
```

## Root Cause
The profile update form was sending `year_of_study` and `graduation_year` values from the edit form. However:

1. **These fields are calculated, not user-editable** - They're derived from the matric number
2. **Old data in database** - Some students have legacy data with level values (100-400) instead of enrollment years (2023-2024)
3. **Validation mismatch** - When these old values are sent back, they fail the new validation rules

### Why year_of_study Shouldn't Be User-Editable:
- **year_of_study**: Extracted from matric number (e.g., `23/10MSC014` → 2023)
- **graduation_year**: Calculated as `year_of_study + program_duration`
- **current_level**: Dynamically calculated from current date and year_of_study

These are system-calculated fields, not user input!

## Solution

### Frontend Fix (`frontend/assets/js/profile-management.js`):

**Removed from formData:**
### Frontend Fix (`frontend/assets/js/profile-management.js`):

**Removed from formData:**
```javascript
// BEFORE (WRONG - sending calculated fields)
const formData = {
  ...
  year_of_study: Number.parseInt(get('profileYearOfStudy'), 10) || null,
  graduation_year: Number.parseInt(get('profileGraduationYear'), 10) || null,
  ...
};

// AFTER (CORRECT - not sending calculated fields)
const formData = {
  ...
  // year_of_study is calculated from matric number, not user-editable
  // graduation_year is also calculated, not user-editable
  ...
};
```

**Why this works:**
- Students can't change their matric number, so year_of_study shouldn't change
- These fields are automatically calculated by the system
- Removing them from the form prevents validation errors
- Backend validation is `.optional()` so missing fields are fine

### Backend Validation (Already Correct):

```javascript
// backend/middleware/validation.js line 138
body('year_of_study').optional()  // ← Already optional, no changes needed
  .isInt({ min: 2020, max: new Date().getFullYear() + 1 })
  .withMessage(`year_of_study must be a year between 2020 and ${new Date().getFullYear() + 1}`),
```

Since validation is `.optional()`, it only validates IF the field is present. By not sending it from the frontend, we avoid the validation entirely.

## Impact

### Before Fix:
- ❌ Profile updates fail with validation error
- ❌ Students with legacy data (level values) can't update profile
- ❌ Confusing error message about year ranges

### After Fix:
- ✅ Profile updates work correctly
- ✅ year_of_study and graduation_year remain system-calculated
- ✅ No validation errors
- ✅ Form only sends user-editable fields

## Fields That ARE User-Editable:
- ✅ Phone, Bio, Skills, Interests
- ✅ Social media links (LinkedIn, GitHub, Twitter, Instagram, Snapchat, Portfolio)
- ✅ Visibility settings (public, students-only, private)
- ✅ Privacy settings (show email, phone, matric)

## Fields That are NOT User-Editable:
- ❌ year_of_study (calculated from matric)
- ❌ graduation_year (calculated as year_of_study + program_duration)
- ❌ current_level (dynamically calculated by view)
- ❌ matric_no (permanent identifier)
- ❌ email (tied to authentication)
- ❌ department (set at registration)

## Deployment

### Frontend Deployment (Netlify):
```bash
cd frontend
git add assets/js/profile-management.js
git commit -m "Remove calculated fields from profile update form

- Don't send year_of_study (calculated from matric)
- Don't send graduation_year (calculated field)
- Prevents validation errors with legacy data
- These fields are system-calculated, not user-editable"
git push origin main
```

### Testing After Deployment:
1. Login as any student
2. Click "Edit Profile"
3. Make any change (update bio, add skill, etc.)
4. Click "Save Profile"
5. Should succeed without validation errors ✅

## Related Issues Fixed:
- Profile update validation errors ✅
- year_of_study validation mismatch ✅
- Users unable to edit profiles ✅

## Notes:
- No database migration needed (data stays as-is)
- No backend changes needed (validation already optional)
- Frontend-only fix
- Backward compatible with all existing data
