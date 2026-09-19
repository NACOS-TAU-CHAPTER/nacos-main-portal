# INVESTIGATION - Career Path Feature

**Date**: August 3, 2026  
**Status**: ⚠️ BROKEN - Form handler is missing, field mismatch

---

## Summary

The "Add Career Path" feature in the admin dashboard is **not functional** because:
1. ❌ Form submit handler is **completely missing**
2. ❌ Form fields don't match database schema
3. ✅ Backend API route exists and works
4. ✅ Delete function works

---

## Form vs Database Schema Mismatch

### What the Form Has
Form ID: `addCareerPathForm` (line 1016)

**Fields**:
- `cp-key` - "Path Key" (e.g., "backend") ❌ NOT IN DATABASE
- `cp-title` - "Title" ✅ 
- `cp-overview` - "Overview" ❌ Should be `description`
- `cp-skills` - "Skills (comma-separated)" ✅
- `cp-tools` - "Tools (comma-separated)" ✅
- `cp-resources` - "External Resources (JSON)" ✅

### What the Database Expects
Table: `career_paths`

**Required columns**:
- `title` (TEXT, NOT NULL) ✅ Form has this
- `description` (TEXT, NOT NULL) ❌ Form calls it "overview"
- `category` (TEXT, NOT NULL) ❌ Form doesn't have this!

**Optional columns**:
- `skills` (TEXT[])
- `tools` (TEXT[])
- `roadmap` (JSONB)
- `required_education` (TEXT)
- `salary_range` (TEXT)
- `job_outlook` (TEXT)
- `resources` (TEXT[])
- `is_active` (BOOLEAN)
- `created_by` (UUID)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### Backend API Expects
Route: `POST /api/career` (from routes/career.js:86)

**Required**:
```javascript
{
  title: "Backend Developer",
  description: "Build server-side applications...",
  category: "Development"  // ❌ MISSING FROM FORM!
}
```

**Optional**:
```javascript
{
  skills: ["JavaScript", "Node.js"],
  tools: ["VS Code", "Git"],
  roadmap: {...},
  required_education: "Computer Science Degree",
  salary_range: "$80k-$120k",
  job_outlook: "High demand",
  resources: ["https://..."]
}
```

---

## Issues Found

### Issue 1: Missing Form Handler ⚠️ CRITICAL
**Location**: admin-dashboard.html  
**Problem**: No event listener for `addCareerPathForm` submit

**Search performed**:
```javascript
getElementById('addCareerPathForm')?.addEventListener
```
**Result**: No matches found

**Comparison**: Other forms like `addQuestionForm`, `addTimetableForm`, and `addResourceForm` all have handlers

### Issue 2: Missing Category Field ⚠️ CRITICAL
**Problem**: Form doesn't have a category dropdown/input  
**Impact**: Backend will reject with "category is required" error

**Expected categories** (examples):
- Development
- Data Science
- DevOps
- Security
- Design
- etc.

### Issue 3: Field Name Mismatch
**Problem**: Form uses `cp-overview` but database expects `description`

### Issue 4: Unused Path Key Field
**Problem**: Form collects `cp-key` but it's not in the database schema  
**Note**: There's no `path_key` column in `career_paths` table

---

## What Works

✅ **Load Career Paths** (line 2101):
```javascript
async function loadCareerPaths() {
  const { data, error } = await supabase
    .from('career_paths')
    .select('*')
    .order('created_at', { ascending: false });
  // Display in table
}
```

✅ **Delete Career Path** (line 2125):
```javascript
window.deleteCareerPath = async function(id) {
  await apiAdmin.remove('career_paths', id);
  loadCareerPaths();
}
```

✅ **Backend API** (routes/career.js):
- GET /api/career - List all
- GET /api/career/:id - Get one
- POST /api/career - Create (admin only)
- PUT /api/career/:id - Update (admin only)
- DELETE /api/career/:id - Delete (admin only)
- POST /api/career/:id/save - Save career (students)
- GET /api/career/saved/my - Get saved careers (students)

---

## Fix Required

### Step 1: Update Form Fields

**Add category dropdown** (after cp-title):
```html
<div class="col-md-6">
  <label class="form-label">Category *</label>
  <select class="form-control" id="cp-category" required>
    <option value="">Select Category</option>
    <option value="Development">Development</option>
    <option value="Data Science">Data Science</option>
    <option value="DevOps">DevOps</option>
    <option value="Security">Cybersecurity</option>
    <option value="Design">Design</option>
    <option value="Mobile">Mobile Development</option>
    <option value="AI/ML">AI/Machine Learning</option>
  </select>
</div>
```

**Remove or ignore** `cp-key` field (not needed)

**Rename label** for `cp-overview` to "Description" (keep ID same for now)

### Step 2: Add Form Submit Handler

**Location**: After line ~1715 (after past questions handler)

```javascript
// ============================================
// CAREER PATHS (Add Handler)
// ============================================
document.getElementById('addCareerPathForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const session = await checkAuth();
  if (!session) return;

  const title = document.getElementById('cp-title').value.trim();
  const description = document.getElementById('cp-overview').value.trim();
  const category = document.getElementById('cp-category').value;
  const skillsInput = document.getElementById('cp-skills').value.trim();
  const toolsInput = document.getElementById('cp-tools').value.trim();
  const resourcesInput = document.getElementById('cp-resources').value.trim();

  if (!title || !description || !category) {
    Swal.fire('Error', 'Title, description, and category are required', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';

  try {
    console.log('Adding career path:', { title, category });

    // Parse comma-separated skills and tools
    const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const tools = toolsInput ? toolsInput.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    // Parse JSON resources (if provided)
    let resources = [];
    if (resourcesInput) {
      try {
        resources = JSON.parse(resourcesInput);
      } catch (err) {
        throw new Error('Invalid JSON format for resources');
      }
    }

    // Insert into Database via backend API
    await api.post('/career', {
      title,
      description,
      category,
      skills,
      tools,
      resources,
      required_education: 'Computer Science Degree or equivalent',
      is_active: true
    });

    await logAdminAction('CREATE', 'career_path', null, { title, category });
    
    Swal.fire('Success', 'Career path added successfully!', 'success').then(() => {
      bootstrap.Modal.getInstance(document.getElementById('addCareerPathModal')).hide();
      e.target.reset();
      loadCareerPaths();
      loadDashboardStats();
    });

  } catch (err) {
    console.error('Career path add error:', err);
    Swal.fire('Error', err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Add Career Path';
  }
});
```

### Step 3: Update loadCareerPaths Display

**Current** (line 2116):
```javascript
tbody.innerHTML = data.map(c => `
  <tr>
    <td><strong>${escapeHtml(c.title)}</strong></td>
    <td>${escapeHtml(c.overview?.substring(0, 100) || '')}</td>
    ...
  </tr>
`).join('');
```

**Fix**: Change `c.overview` to `c.description`:
```javascript
tbody.innerHTML = data.map(c => `
  <tr>
    <td><strong>${escapeHtml(c.title)}</strong></td>
    <td><span class="badge-category">${escapeHtml(c.category)}</span></td>
    <td>${escapeHtml(c.description?.substring(0, 80) || '')}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="deleteCareerPath('${c.id}')"><i class="bi bi-trash"></i></button></td>
  </tr>
`).join('');
```

---

## Test Plan

### After Implementing Fixes

1. **Open Admin Dashboard**
2. **Navigate to "Career Paths" section**
3. **Click "Add New"**
4. **Fill in form**:
   - Title: "Backend Developer"
   - Category: "Development"
   - Description: "Build scalable server-side applications"
   - Skills: "JavaScript, Node.js, PostgreSQL"
   - Tools: "VS Code, Git, Docker"
   - Resources: `[{"name":"Node.js Docs","url":"https://nodejs.org/docs"}]`
5. **Click "Add Career Path"**
6. **Expected**: Success message, modal closes, table refreshes
7. **Verify**: New career path appears in table with all fields

---

## Files to Modify

1. **frontend/admin-dashboard.html**
   - Add category dropdown to form (line ~1025)
   - Add form submit handler (line ~1720)
   - Fix loadCareerPaths display (line ~2116)

---

## Related Backend Files (No Changes Needed)

- `backend/routes/career.js` - ✅ Working correctly
- `backend/database/schema.sql` - ✅ Schema is correct
- `backend/server.js` - Career route already mounted

---

**STATUS**: Waiting for fixes to be applied to admin-dashboard.html
