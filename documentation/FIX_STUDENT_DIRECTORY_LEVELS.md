# Fix Student Directory Level Display

## Issue
The student directory in the student dashboard was showing incorrect level values like "2023L" and "2024L" instead of proper levels like "300 Level" and "400 Level".

## Root Cause
Similar to the admin dashboard issue, the student directory endpoint was querying the base `students` table instead of the `students_with_current_level` view. This caused:
- Raw `year_of_study` values (2023, 2024) being displayed with "L" appended
- No dynamic level calculation based on current date
- Missing graduation status indicators

## Changes Made

### Backend (`backend/routes/students.js`)
**Line 126** - Changed query source:
```javascript
// BEFORE
.from('students')
.select('id, name, first_name, last_name, email, phone, matric_no, department, course, year_of_study, graduation_year, profile_picture_url, bio, skills, interests, linkedin, github, twitter, instagram, snapchat, portfolio_url, visibility, privacy_settings, created_at', { count: 'exact' })

// AFTER
.from('students_with_current_level')
.select('id, name, first_name, last_name, email, phone, matric_no, department, course, year_of_study, graduation_year, current_level, is_graduated, profile_picture_url, bio, skills, interests, linkedin, github, twitter, instagram, snapchat, portfolio_url, visibility, privacy_settings, created_at', { count: 'exact' })
```

**Added fields:**
- `current_level` - Dynamically calculated level (100, 200, 300, 400)
- `is_graduated` - Boolean flag indicating graduation status

**Line 148** - Fixed year filter to use calculated level:
```javascript
// BEFORE
if (year) {
  query = query.eq('year_of_study', parseInt(year));
}

// AFTER
if (year) {
  // 'year' parameter now represents level (100, 200, 300, 400)
  query = query.eq('current_level', parseInt(year));
}
```

**Why this matters:** The frontend dropdown sends level values (100, 200, 300, 400) not enrollment years (2023, 2024). The old code would never match because it was comparing levels to enrollment years.

### Frontend (`frontend/student-dashboard.html`)
**Lines 1676-1677** - Changed level display logic:
```javascript
// BEFORE
const yearText = student.year_of_study ? `${student.year_of_study}L` : '';

// AFTER
const yearText = student.current_level 
  ? `${student.current_level} Level${student.is_graduated ? ' 🎓' : ''}`
  : (student.year_of_study ? `${student.year_of_study}L` : '');
```

**New Features:**
- Displays calculated level (e.g., "300 Level", "400 Level")
- Shows 🎓 graduation badge for graduated students
- Fallback to `year_of_study` if `current_level` is null

## Example Output

### Before
```
Khadijah Anifowoshe
Computer Science · 2024L

Temitayo Bamiro
Computer Science · 2023L
```

### After
```
Khadijah Anifowoshe
Computer Science · 300 Level

Temitayo Bamiro
Computer Science · 400 Level 🎓
```

## How It Works

The `students_with_current_level` view automatically calculates the current level based on:
1. **year_of_study** (enrollment year, e.g., 2023)
2. **graduation_year** (expected graduation, e.g., 2027)
3. **Current date** (2026 in this case)

**Calculation Logic:**
```sql
current_level = (EXTRACT(YEAR FROM CURRENT_DATE) - year_of_study) * 100 + 100
```

**Examples:**
- Enrolled 2024, Current 2026: (2026 - 2024) * 100 + 100 = **300 Level**
- Enrolled 2023, Current 2026: (2026 - 2023) * 100 + 100 = **400 Level**

**Graduation Check:**
```sql
is_graduated = (EXTRACT(YEAR FROM CURRENT_DATE) >= graduation_year)
```

## Deployment Steps

### 1. Backend Deployment (Railway)
```bash
cd backend
git add routes/students.js
git commit -m "Fix student directory to use calculated levels"
git push origin main
```

Railway will auto-deploy the changes.

### 2. Frontend Deployment (Netlify)
```bash
cd frontend
git add student-dashboard.html
git commit -m "Display calculated levels in student directory"
git push origin main
```

Netlify will auto-deploy the changes.

### 3. Verification
After deployment, test:
1. Login as a student
2. Navigate to "Student Directory" tab
3. Verify all students show correct levels:
   - 2024 enrollees → 300 Level
   - 2023 enrollees → 400 Level
   - Graduated students show 🎓 badge
4. Test filtering by year still works
5. Test search functionality

## Related Files
- `backend/routes/students.js` - Directory endpoint
- `frontend/student-dashboard.html` - Student directory UI
- `backend/migrations/012_replace_level_with_year_of_study.sql` - View creation

## Related Issues Fixed
- Admin dashboard level display (TASK 3)
- New student registration level calculation (TASK 7)
- Level showing "2023L" issue (TASK 8)
- Student dashboard profile level display (TASK 9)
- Missing student profile after registration (TASK 11)
- **Student directory level display (TASK 12)** ✅

## Migration Required?
❌ **No** - The `students_with_current_level` view already exists from migration 012. This fix only changes which view the API queries.

## Notes
- **Year filter now works correctly** - filters by calculated `current_level` (100-400) instead of enrollment `year_of_study` (2023-2024)
- Privacy settings are still applied correctly through `applyPrivacySettings`
- Search, pagination, and sorting all work the same way
- The fallback to `year_of_study` ensures backward compatibility if view data is missing
- Graduated students will show in their final level (usually 400) with the 🎓 badge
