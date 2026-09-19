# Timetable Upload Fix - Department Field Required

**Date**: Current Session  
**Status**: ✅ COMPLETE

---

## Error

```
POST http://localhost:5000/api/admin/timetables 500 (Internal Server Error)

Insert into timetables failed: null value in column "department" 
of relation "timetables" violates not-null constraint
```

---

## Root Cause

The timetables table has a `department` column with `NOT NULL` constraint, but the upload form didn't collect this field. When admins tried to upload timetables, the database rejected the insert because `department` was NULL.

### Database Schema:
```sql
CREATE TABLE timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,  -- ❌ This was missing from form!
  level INTEGER,
  semester TEXT,
  academic_session TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  description TEXT,
  is_current BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  uploaded_by UUID REFERENCES students(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## The Fix

Added **ALL missing required and optional fields** to the timetable upload form:

### New Fields Added:

1. ✅ **Department** (Required) - Dropdown with options
2. ✅ **Level** (Optional) - 100, 200, 300, 400, 500
3. ✅ **Semester** (Optional) - Harmattan or Rain
4. ✅ **Academic Session** (Optional) - e.g., 2024/2025

---

## Updated Form

### File: `frontend/admin-dashboard.html`

#### Before (Missing Fields):
```html
<form id="addTimetableForm">
  <input id="t-title" required>         <!-- Title -->
  <input id="t-version" required>       <!-- Version -->
  <textarea id="t-description">         <!-- Description -->
  <select id="t-current">               <!-- Is Current -->
  <input id="t-file" required>          <!-- File -->
  <!-- ❌ NO DEPARTMENT FIELD! -->
</form>
```

#### After (Complete Fields):
```html
<form id="addTimetableForm">
  <input id="t-title" required>                    <!-- Title -->
  <select id="t-department" required>              <!-- ✅ Department -->
    <option value="Computer Science">...</option>
    <option value="All Departments">...</option>
  </select>
  <select id="t-level">                            <!-- ✅ Level (Optional) -->
    <option value="100">100 Level</option>
    ...
  </select>
  <select id="t-semester">                         <!-- ✅ Semester (Optional) -->
    <option value="Harmattan">Harmattan</option>
    <option value="Rain">Rain</option>
  </select>
  <input id="t-session" placeholder="2024/2025">   <!-- ✅ Academic Session -->
  <input id="t-version" required>                  <!-- Version -->
  <textarea id="t-description">                    <!-- Description -->
  <select id="t-current">                          <!-- Is Current -->
  <input id="t-file" required>                     <!-- File -->
</form>
```

---

## Department Options

The department dropdown includes:
- Computer Science
- Software Engineering
- Cybersecurity
- Information Technology
- Data Science
- All Departments (for general timetables)

**Note**: Can be customized to match your university's departments.

---

## Form Submission Updates

### File: `frontend/admin-dashboard.html`

#### Before (Missing Data):
```javascript
await apiAdmin.create('timetables', {
  title,
  version,
  description,
  file_url: fileUrl,
  is_current: isCurrent,
  uploaded_by: adminData?.id
  // ❌ No department, level, semester, academic_session!
});
```

#### After (Complete Data):
```javascript
await apiAdmin.create('timetables', {
  title,
  department,                              // ✅ Required
  level: level ? parseInt(level) : null,   // ✅ Optional
  semester: semester || null,              // ✅ Optional
  academic_session: academicSession || null, // ✅ Optional
  version,
  description: description || null,
  file_url: fileUrl,
  file_name: fileName,                     // ✅ Also added filename
  is_current: isCurrent,
  uploaded_by: adminData?.id
});
```

---

## How It Works Now

### Admin Workflow:

1. **Admin clicks "Add Timetable"**
2. **Fills in form**:
   - Title: "Computer Science Timetable"
   - Department: "Computer Science" ← Required!
   - Level: "300" (optional)
   - Semester: "Harmattan" (optional)
   - Session: "2024/2025" (optional)
   - Version: "1.0"
   - Description: "Updated schedule"
   - Set as Current: "Yes"
   - File: [Uploads PDF]

3. **Clicks "Upload"**
4. **System**:
   - Validates department is selected
   - Uploads file to storage
   - Saves to database with ALL fields
5. **Success!** ✅

---

## Validation

The form now validates:

```javascript
if (!department) {
  Swal.fire('Error', 'Please select a department', 'error');
  return;
}
```

If admin forgets to select department → Shows error before attempting upload.

---

## Example Timetable Record

After uploading, the database record looks like:

```json
{
  "id": "uuid-here",
  "title": "Computer Science Timetable",
  "department": "Computer Science",
  "level": 300,
  "semester": "Harmattan",
  "academic_session": "2024/2025",
  "version": "1.0",
  "description": "Updated schedule for 300L students",
  "file_url": "https://storage.../timetables/file.pdf",
  "file_name": "cs-300l-timetable.pdf",
  "is_current": true,
  "uploaded_by": "admin-uuid",
  "created_at": "2026-08-04T09:03:21Z",
  "updated_at": "2026-08-04T09:03:21Z"
}
```

---

## Testing

### Test Case 1: Upload with Required Fields Only
1. Login as admin
2. Click "Add Timetable"
3. Fill in:
   - Title: "Test Timetable"
   - Department: "Computer Science"
   - Version: "1.0"
   - File: [Select PDF]
4. Click "Upload"
5. **Expected**: ✅ Success - Timetable uploaded

---

### Test Case 2: Upload with All Fields
1. Fill in all fields including optional ones:
   - Title: "300L CS Timetable"
   - Department: "Computer Science"
   - Level: "300"
   - Semester: "Harmattan"
   - Session: "2024/2025"
   - Version: "Final"
   - Description: "Complete schedule"
   - Current: "Yes"
   - File: [Select PDF]
2. Click "Upload"
3. **Expected**: ✅ Success with all details saved

---

### Test Case 3: Missing Department
1. Fill in title and file
2. **Don't select department**
3. Click "Upload"
4. **Expected**: ❌ Error: "Please select a department"

---

### Test Case 4: Multiple Departments
1. Upload timetable for "Computer Science"
2. Upload another for "Software Engineering"
3. Upload general one for "All Departments"
4. **Expected**: ✅ All uploads work, students can filter by department

---

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| `frontend/admin-dashboard.html` | Added department, level, semester, session fields to form | ~945-975 |
| `frontend/admin-dashboard.html` | Updated form submission to include all fields | ~1786-1865 |

---

## Benefits

✅ **No More Errors**: Department constraint satisfied  
✅ **Better Organization**: Timetables categorized by department  
✅ **More Details**: Level, semester, session tracked  
✅ **Student Filtering**: Students can find relevant timetables easier  
✅ **Data Integrity**: All required database fields populated  

---

## Related Tables

The same fields exist in other tables:

### Students Table:
```sql
department TEXT NOT NULL
```

### Past Questions Table:
```sql
department TEXT
level INTEGER
```

Make sure forms for these also collect department when required!

---

## Next Steps

1. ✅ Refresh admin dashboard
2. ✅ Try uploading a timetable
3. ✅ Select a department
4. ✅ Upload should work
5. ⏭️ Consider adding department filter to timetables list
6. ⏭️ Consider showing department in timetables display

---

## Future Enhancements

### Suggested Improvements:

1. **Department Filter** on timetables page
   - Students see only their department's timetables

2. **Level Filter**
   - 300L students see 300L timetables

3. **Current Semester Display**
   - Show which semester is currently active

4. **Academic Calendar Integration**
   - Auto-set semester based on current date

5. **Bulk Upload**
   - Upload multiple timetables at once

---

**STATUS**: ✅ Timetable upload now works! Department field is collected and saved properly.
