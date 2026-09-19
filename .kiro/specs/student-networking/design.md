# Student Networking & Directory - Design Document

## Architecture Overview

This feature extends the existing student dashboard with profile management and directory capabilities. It follows the existing architecture pattern:
- **Frontend**: HTML/CSS/JavaScript (Bootstrap, Supabase client)
- **Backend**: Node.js/Express API
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (for profile pictures)

## Database Design

### Schema Changes

#### 1. Extend `students` Table
Add new columns to the existing `students` table:

```sql
ALTER TABLE students
  ADD COLUMN twitter TEXT,
  ADD COLUMN instagram TEXT,
  ADD COLUMN portfolio_url TEXT,
  ADD COLUMN interests TEXT[],
  ADD COLUMN year_of_study INTEGER,
  ADD COLUMN graduation_year INTEGER,
  ADD COLUMN visibility TEXT DEFAULT 'students-only' 
    CHECK (visibility IN ('public', 'students-only', 'private')),
  ADD COLUMN privacy_settings JSONB DEFAULT 
    '{"show_email": false, "show_phone": false, "show_matric": false}'::jsonb;
```

**New Fields Explanation:**
- `twitter`: Twitter/X handle or profile URL
- `instagram`: Instagram profile URL
- `portfolio_url`: Personal website or portfolio URL
- `interests`: Array of interests (e.g., ['Web Development', 'AI/ML', 'Mobile Dev'])
- `year_of_study`: Current year (100, 200, 300, 400, 500)
- `graduation_year`: Expected graduation year (e.g., 2027)
- `visibility`: Controls who can see the profile
  - `'public'`: Everyone (including non-logged-in users) - Phase 2
  - `'students-only'`: Only logged-in active students (Default)
  - `'private'`: Only admins and self
- `privacy_settings`: JSONB object for field-level privacy
  - `show_email`: boolean
  - `show_phone`: boolean
  - `show_matric`: boolean

#### 2. Add Indexes for Performance
```sql
CREATE INDEX IF NOT EXISTS idx_students_visibility ON students(visibility);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(year_of_study);
CREATE INDEX IF NOT EXISTS idx_students_skills_gin ON students USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_students_interests_gin ON students USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
```

#### 3. Update RLS Policies
Add policy for students to read other active students' profiles:

```sql
-- Allow students to view other active students based on visibility
CREATE POLICY "students_directory_read" ON students
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' AND (
      visibility = 'students-only' OR
      visibility = 'public' OR
      auth.uid() = user_id  -- Can always see own profile
    )
  );
```

### Data Validation

#### URL Validation (Backend)
```javascript
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

function validateSocialUrl(url, platform) {
  if (!url) return true; // Optional field
  if (!urlRegex.test(url)) return false;
  
  // Platform-specific validation
  const patterns = {
    linkedin: /linkedin\.com\/(in|company)\//,
    github: /github\.com\//,
    twitter: /(twitter\.com|x\.com)\//,
    instagram: /instagram\.com\//
  };
  
  return patterns[platform] ? patterns[platform].test(url) : true;
}
```

#### Skills/Interests Validation
```javascript
function validateArray(arr, maxItems = 20, maxLength = 50) {
  if (!Array.isArray(arr)) return false;
  if (arr.length > maxItems) return false;
  return arr.every(item => 
    typeof item === 'string' && 
    item.length <= maxLength &&
    item.trim().length > 0
  );
}
```

## API Design

### Endpoints

#### 1. Get Student Directory
```
GET /api/students/directory
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string): Search in name, bio
- `department` (string): Filter by department
- `skills` (string): Comma-separated skills
- `interests` (string): Comma-separated interests
- `year` (number): Filter by year of study
- `sort` (string): 'name-asc', 'name-desc', 'recent'

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "department": "Computer Science",
        "year_of_study": 300,
        "profile_picture_url": "https://...",
        "bio": "Passionate about web development...",
        "skills": ["JavaScript", "React", "Node.js"],
        "interests": ["Web Dev", "AI/ML"],
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
        "twitter": "https://twitter.com/johndoe",
        "instagram": "https://instagram.com/johndoe",
        "portfolio_url": "https://johndoe.com"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "pages": 8
    }
  },
  "message": "Students retrieved successfully"
}
```

**Notes:**
- Only returns students with `status='active'` and `visibility != 'private'`
- Excludes private fields based on `privacy_settings`
- Applies rate limiting: 60 requests per minute per user

#### 2. Get Student Profile
```
GET /api/students/:id/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@tau.edu.ng",  // If show_email=true
    "phone": "+234...",  // If show_phone=true
    "matric_no": "TAU/CS/20/001",  // If show_matric=true
    "department": "Computer Science",
    "course": "Computer Science",
    "year_of_study": 300,
    "graduation_year": 2026,
    "profile_picture_url": "https://...",
    "bio": "Full bio text here...",
    "skills": ["JavaScript", "React", "Node.js"],
    "interests": ["Web Dev", "AI/ML", "Mobile Dev"],
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "portfolio_url": "https://johndoe.com",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

**Error Cases:**
- 404: Student not found or profile is private
- 403: Not authorized to view this profile

#### 3. Update Own Profile
```
PUT /api/students/me
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+234...",
  "bio": "Updated bio...",
  "skills": ["JavaScript", "React"],
  "interests": ["Web Dev", "AI/ML"],
  "linkedin": "https://linkedin.com/in/johndoe",
  "github": "https://github.com/johndoe",
  "twitter": "https://twitter.com/johndoe",
  "instagram": "https://instagram.com/johndoe",
  "portfolio_url": "https://johndoe.com",
  "year_of_study": 300,
  "graduation_year": 2026,
  "visibility": "students-only",
  "privacy_settings": {
    "show_email": false,
    "show_phone": false,
    "show_matric": false
  }
}
```

**Validation Rules:**
- All fields optional except validation constraints
- `skills`: max 20 items, each max 50 chars
- `interests`: max 10 items, each max 50 chars
- `bio`: max 500 characters
- URLs: must be valid HTTP/HTTPS URLs
- `year_of_study`: 100-500
- `graduation_year`: current year to current year + 10

## Frontend Design

### Component Structure

```
student-dashboard.html
├── Profile Section (existing, enhanced)
│   ├── Profile Edit Form
│   │   ├── Basic Info (name, department, phone)
│   │   ├── Bio Editor (textarea)
│   │   ├── Skills Input (tag-based)
│   │   ├── Interests Input (tag-based)
│   │   ├── Social Media Links
│   │   │   ├── LinkedIn
│   │   │   ├── GitHub
│   │   │   ├── Twitter
│   │   │   ├── Instagram
│   │   │   └── Portfolio
│   │   ├── Academic Info (year, graduation year)
│   │   ├── Profile Picture Upload
│   │   └── Privacy Settings
│   │       ├── Visibility Selector
│   │       └── Field Privacy Toggles
│   └── Profile Preview
│
└── Directory Section (NEW)
    ├── Search & Filters
    │   ├── Search Bar (name search)
    │   ├── Department Filter
    │   ├── Skills Filter (multi-select)
    │   ├── Interests Filter (multi-select)
    │   ├── Year Filter
    │   └── Sort Selector
    ├── Student Grid
    │   └── Student Cards
    │       ├── Profile Picture
    │       ├── Name
    │       ├── Department & Year
    │       ├── Bio Preview (first 100 chars)
    │       ├── Top 3 Skills
    │       └── View Profile Button
    └── Pagination Controls
```

### Student Profile View Modal

```html
<div class="modal" id="profileModal">
  <div class="modal-header">
    <img src="profile_picture" class="profile-pic-large">
    <div>
      <h2>Student Name</h2>
      <p>Department · Year · Matric No</p>
    </div>
  </div>
  <div class="modal-body">
    <section class="about">
      <h3>About</h3>
      <p>Full bio...</p>
    </section>
    <section class="skills">
      <h3>Skills</h3>
      <div class="skill-tags">...</div>
    </section>
    <section class="interests">
      <h3>Interests</h3>
      <div class="interest-tags">...</div>
    </section>
    <section class="social-links">
      <h3>Connect</h3>
      <a href="linkedin"><i class="bi bi-linkedin"></i></a>
      <a href="github"><i class="bi bi-github"></i></a>
      <a href="twitter"><i class="bi bi-twitter"></i></a>
      <a href="instagram"><i class="bi-instagram"></i></a>
      <a href="portfolio"><i class="bi bi-globe"></i></a>
    </section>
    <section class="contact" *ngIf="showEmail">
      <h3>Contact</h3>
      <p><i class="bi bi-envelope"></i> email@tau.edu.ng</p>
      <p *ngIf="showPhone"><i class="bi bi-phone"></i> +234...</p>
    </section>
  </div>
</div>
```

### UI/UX Design Principles

1. **Progressive Disclosure**: Show basic info in cards, full details in modal/page
2. **Privacy First**: Default all privacy settings to most restrictive
3. **Visual Feedback**: Show profile completion percentage
4. **Responsive**: Mobile-first design, works on all screen sizes
5. **Accessibility**: WCAG 2.1 AA compliant (alt text, ARIA labels, keyboard navigation)
6. **Performance**: Lazy load images, paginate results, debounce search

### Student Card Design (CSS)

```css
.student-card {
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.student-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.student-card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.student-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.student-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.student-meta {
  font-size: 13px;
  color: #666;
}

.student-bio {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
  flex-grow: 1;
}

.student-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.skill-tag {
  background: #e8f5e9;
  color: #1b8c0c;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.student-social {
  display: flex;
  gap: 10px;
}

.social-icon {
  color: #666;
  font-size: 18px;
  transition: color 0.2s;
}

.social-icon:hover {
  color: #1b8c0c;
}
```

## Security Considerations

### Authentication & Authorization
- All directory/profile endpoints require authentication
- Students can only edit their own profiles
- Students can only view "active" students' profiles
- Admins can view all profiles including private ones

### Rate Limiting
```javascript
// Directory endpoint: 60 requests/minute
// Profile view endpoint: 120 requests/minute
// Profile update endpoint: 10 requests/minute
```

### Input Sanitization
- Sanitize all HTML input (bio field)
- Validate URL formats for social links
- Escape output to prevent XSS
- Limit array sizes to prevent DoS

### Privacy Protection
- Default privacy settings to most restrictive
- Clear privacy controls in UI
- Respect `privacy_settings` in all API responses
- Audit log all profile views (optional, Phase 2)

## Performance Optimization

### Database
- Add indexes on frequently queried columns (department, skills, interests)
- Use GIN indexes for array columns (skills, interests)
- Limit query results (max 100 per page)

### Frontend
- Lazy load student cards (infinite scroll optional)
- Debounce search input (300ms delay)
- Cache directory results (5 minutes)
- Optimize images (compress, use WebP)
- Virtual scrolling for large lists (optional)

### Caching Strategy
```javascript
// Client-side caching
localStorage.setItem('directory_cache', JSON.stringify({
  data: students,
  timestamp: Date.now(),
  ttl: 5 * 60 * 1000 // 5 minutes
}));

// Server-side caching (Redis, optional)
// Cache directory queries for 2 minutes
```

## Testing Strategy

### Unit Tests
- API endpoint input validation
- Privacy setting application logic
- URL validation functions
- Search/filter logic

### Integration Tests
- Profile update flow (end-to-end)
- Directory search with filters
- Privacy settings enforcement
- RLS policy verification

### UI Tests
- Profile form submission
- Directory search and pagination
- Profile modal opens correctly
- Social links are clickable

### Manual Testing Checklist
- [ ] Profile editing saves correctly
- [ ] Privacy settings are respected
- [ ] Directory filters work accurately
- [ ] Search returns relevant results
- [ ] Profile pictures upload successfully
- [ ] Social links are validated
- [ ] Mobile responsive layout
- [ ] Accessibility (screen reader, keyboard)

## Migration Plan

### Phase 1: Database (Week 1)
1. Create migration file with schema changes
2. Test migration on development database
3. Run migration on production database
4. Verify indexes created successfully

### Phase 2: Backend API (Week 1-2)
1. Add directory endpoint with filters
2. Add profile view endpoint
3. Update profile update endpoint
4. Add validation middleware
5. Add rate limiting
6. Update RLS policies

### Phase 3: Frontend (Week 2-3)
1. Update profile edit form
2. Add privacy settings UI
3. Build directory section
4. Build student card component
5. Build profile view modal
6. Add search and filters
7. Add pagination

### Phase 4: Testing & Launch (Week 3-4)
1. Unit and integration tests
2. Manual QA testing
3. User acceptance testing (UAT)
4. Performance testing
5. Security audit
6. Soft launch to subset of users
7. Full launch

## Rollback Plan

If critical issues arise:
1. **Backend API**: Revert to previous version via git
2. **Database**: Run rollback migration to remove new columns
3. **Frontend**: Hide directory section via feature flag

---

**Status**: Design Complete  
**Created**: 2026-08-03  
**Last Updated**: 2026-08-03  
**Reviewed By**: Pending
