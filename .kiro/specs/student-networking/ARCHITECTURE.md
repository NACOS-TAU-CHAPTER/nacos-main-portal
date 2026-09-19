# Student Networking & Directory - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (HTML/JS)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Student Dashboard (student-dashboard.html)     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Profile    │  │   Student    │  │   Profile    │    │ │
│  │  │  Edit Form   │  │  Directory   │  │  View Modal  │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ - Bio        │  │ - Search     │  │ - Full Info  │    │ │
│  │  │ - Skills     │  │ - Filters    │  │ - Social     │    │ │
│  │  │ - Social     │  │ - Cards      │  │ - Contact    │    │ │
│  │  │ - Privacy    │  │ - Pagination │  │              │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  └─────────┼──────────────────┼──────────────────┼───────────┘ │
└────────────┼──────────────────┼──────────────────┼─────────────┘
             │                  │                  │
             │ PUT /students/me │ GET /students/   │ GET /students/
             │                  │ directory        │ :id/profile
             │                  │                  │
             ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express.js)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  routes/students.js                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Update     │  │   Directory  │  │    View      │    │ │
│  │  │   Profile    │  │   Endpoint   │  │   Profile    │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ - Validate   │  │ - Query      │  │ - Check      │    │ │
│  │  │ - Sanitize   │  │ - Filter     │  │   Privacy    │    │ │
│  │  │ - Save       │  │ - Paginate   │  │ - Return     │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  └─────────┼──────────────────┼──────────────────┼───────────┘ │
│  ┌─────────▼──────────────────▼──────────────────▼───────────┐ │
│  │            middleware/validation.js                         │ │
│  │  - URL validation     - Array validation                   │ │
│  │  - Bio sanitization   - Privacy checks                     │ │
│  └────────────────────────────┬────────────────────────────────┘ │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (Supabase PostgreSQL)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      students table                         │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Existing Columns              New Columns           │  │ │
│  │  │  ---------------               -----------           │  │ │
│  │  │  • id (UUID)                   • twitter (TEXT)      │  │ │
│  │  │  • user_id (UUID)              • instagram (TEXT)    │  │ │
│  │  │  • email                       • portfolio_url       │  │ │
│  │  │  • name                        • interests (TEXT[])  │  │ │
│  │  │  • matric_no                   • year_of_study (INT) │  │ │
│  │  │  • department                  • graduation_year     │  │ │
│  │  │  • phone                       • visibility (TEXT)   │  │ │
│  │  │  • bio                         • privacy_settings    │  │ │
│  │  │  • skills (TEXT[])             │   (JSONB)           │  │ │
│  │  │  • linkedin                    │                     │  │ │
│  │  │  • github                      │                     │  │ │
│  │  │  • profile_picture_url         │                     │  │ │
│  │  │  • status                      │                     │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Indexes:                                                   │ │
│  │  • idx_students_visibility (visibility)                    │ │
│  │  • idx_students_year (year_of_study)                       │ │
│  │  • idx_students_skills_gin (skills) - GIN index            │ │
│  │  • idx_students_interests_gin (interests) - GIN index      │ │
│  │  • idx_students_department (department)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Row Level Security (RLS)                 │ │
│  │  • Students can read active students (visibility check)    │ │
│  │  • Students can update own profile                         │ │
│  │  • Admins can read all profiles                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Profile Update Flow

```
┌─────────┐         ┌──────────┐         ┌────────────┐         ┌──────────┐
│ Student │         │ Frontend │         │  Backend   │         │ Database │
└────┬────┘         └────┬─────┘         └─────┬──────┘         └────┬─────┘
     │                   │                     │                      │
     │ 1. Edit Profile   │                     │                      │
     │──────────────────>│                     │                      │
     │                   │                     │                      │
     │                   │ 2. Validate Client  │                      │
     │                   │    Side             │                      │
     │                   │────────┐            │                      │
     │                   │        │            │                      │
     │                   │<───────┘            │                      │
     │                   │                     │                      │
     │                   │ 3. PUT /students/me │                      │
     │                   │────────────────────>│                      │
     │                   │                     │                      │
     │                   │                     │ 4. Validate Server   │
     │                   │                     │    Side              │
     │                   │                     │────────┐             │
     │                   │                     │        │             │
     │                   │                     │<───────┘             │
     │                   │                     │                      │
     │                   │                     │ 5. UPDATE students   │
     │                   │                     │─────────────────────>│
     │                   │                     │                      │
     │                   │                     │ 6. Return Updated    │
     │                   │                     │<─────────────────────│
     │                   │                     │                      │
     │                   │ 7. Success Response │                      │
     │                   │<────────────────────│                      │
     │                   │                     │                      │
     │ 8. Show Success   │                     │                      │
     │<──────────────────│                     │                      │
     │                   │                     │                      │
```

### 2. Directory Browse Flow

```
┌─────────┐         ┌──────────┐         ┌────────────┐         ┌──────────┐
│ Student │         │ Frontend │         │  Backend   │         │ Database │
└────┬────┘         └────┬─────┘         └─────┬──────┘         └────┬─────┘
     │                   │                     │                      │
     │ 1. Open Directory │                     │                      │
     │──────────────────>│                     │                      │
     │                   │                     │                      │
     │                   │ 2. GET /students/   │                      │
     │                   │    directory        │                      │
     │                   │────────────────────>│                      │
     │                   │                     │                      │
     │                   │                     │ 3. SELECT * FROM     │
     │                   │                     │    students WHERE    │
     │                   │                     │    status='active'   │
     │                   │                     │    AND visibility!=  │
     │                   │                     │    'private'         │
     │                   │                     │─────────────────────>│
     │                   │                     │                      │
     │                   │                     │ 4. Return Students   │
     │                   │                     │<─────────────────────│
     │                   │                     │                      │
     │                   │                     │ 5. Apply Privacy     │
     │                   │                     │    Settings          │
     │                   │                     │────────┐             │
     │                   │                     │        │             │
     │                   │                     │<───────┘             │
     │                   │                     │                      │
     │                   │ 6. Return Paginated │                      │
     │                   │    Results          │                      │
     │                   │<────────────────────│                      │
     │                   │                     │                      │
     │                   │ 7. Render Cards     │                      │
     │                   │────────┐            │                      │
     │                   │        │            │                      │
     │                   │<───────┘            │                      │
     │                   │                     │                      │
     │ 8. View Directory │                     │                      │
     │<──────────────────│                     │                      │
     │                   │                     │                      │
```

### 3. Profile View Flow

```
┌─────────┐         ┌──────────┐         ┌────────────┐         ┌──────────┐
│ Student │         │ Frontend │         │  Backend   │         │ Database │
└────┬────┘         └────┬─────┘         └─────┬──────┘         └────┬─────┘
     │                   │                     │                      │
     │ 1. Click "View    │                     │                      │
     │    Profile"       │                     │                      │
     │──────────────────>│                     │                      │
     │                   │                     │                      │
     │                   │ 2. GET /students/   │                      │
     │                   │    :id/profile      │                      │
     │                   │────────────────────>│                      │
     │                   │                     │                      │
     │                   │                     │ 3. SELECT * FROM     │
     │                   │                     │    students WHERE    │
     │                   │                     │    id=:id            │
     │                   │                     │─────────────────────>│
     │                   │                     │                      │
     │                   │                     │ 4. Return Student    │
     │                   │                     │<─────────────────────│
     │                   │                     │                      │
     │                   │                     │ 5. Check Visibility  │
     │                   │                     │    & Privacy         │
     │                   │                     │────────┐             │
     │                   │                     │        │             │
     │                   │                     │<───────┘             │
     │                   │                     │                      │
     │                   │ 6. Return Profile   │                      │
     │                   │    (filtered)       │                      │
     │                   │<────────────────────│                      │
     │                   │                     │                      │
     │                   │ 7. Render Modal     │                      │
     │                   │────────┐            │                      │
     │                   │        │            │                      │
     │                   │<───────┘            │                      │
     │                   │                     │                      │
     │ 8. View Profile   │                     │                      │
     │<──────────────────│                     │                      │
     │                   │                     │                      │
```

## Privacy Logic Flow

```
┌──────────────────────────────────────────────────────────────┐
│              Privacy Settings Application                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
             ┌──────────────────────────┐
             │   Check Visibility       │
             │   Setting                │
             └──────────┬───────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    ┌─────────┐   ┌──────────┐  ┌─────────┐
    │ Private │   │ Students │  │ Public  │
    │         │   │   Only   │  │         │
    └────┬────┘   └─────┬────┘  └────┬────┘
         │              │             │
         ▼              ▼             ▼
    ┌─────────┐   ┌──────────┐  ┌─────────┐
    │Only Show│   │Show to   │  │Show to  │
    │to Self  │   │Active    │  │Everyone │
    │& Admins │   │Students  │  │(Future) │
    └────┬────┘   └─────┬────┘  └────┬────┘
         │              │             │
         └──────────────┼─────────────┘
                        │
                        ▼
             ┌──────────────────────────┐
             │   Check Field Privacy    │
             │   Settings (JSONB)       │
             └──────────┬───────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    ┌─────────┐   ┌──────────┐  ┌─────────┐
    │Show     │   │Show      │  │Show     │
    │Email?   │   │Phone?    │  │Matric?  │
    └────┬────┘   └─────┬────┘  └────┬────┘
         │              │             │
         └──────────────┼─────────────┘
                        │
                        ▼
             ┌──────────────────────────┐
             │   Return Filtered        │
             │   Profile Data           │
             └──────────────────────────┘
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                     Student Dashboard                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │                │  │                │  │                │   │
│  │   My Profile   │  │   Directory    │  │   Settings     │   │
│  │      Tab       │  │      Tab       │  │      Tab       │   │
│  │                │  │                │  │                │   │
│  └────────┬───────┘  └────────┬───────┘  └───────────────┘   │
│           │                   │                                 │
│  ┌────────▼─────────┐  ┌──────▼────────────┐                  │
│  │                  │  │                   │                  │
│  │  Profile Edit    │  │  Student Grid     │                  │
│  │  Component       │  │  Component        │                  │
│  │                  │  │                   │                  │
│  │  - Form Fields   │  │  - Student Cards  │                  │
│  │  - Validation    │  │  - Search Bar     │                  │
│  │  - Save Button   │  │  - Filters        │                  │
│  │                  │  │                   │                  │
│  └─────────┬────────┘  └──────┬────────────┘                  │
│            │                   │                                │
│  ┌─────────▼────────┐  ┌──────▼─────────────┐                 │
│  │                  │  │                    │                 │
│  │  Privacy Control │  │  Profile View      │                 │
│  │  Component       │  │  Modal Component   │                 │
│  │                  │  │                    │                 │
│  │  - Visibility    │  │  - Full Profile    │                 │
│  │  - Field Toggle  │  │  - Social Links    │                 │
│  │                  │  │  - Contact Info    │                 │
│  │                  │  │                    │                 │
│  └──────────────────┘  └────────────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HTML5 + CSS3 + JavaScript (ES6+)                    │  │
│  │  • Bootstrap 5 (UI Framework)                        │  │
│  │  • SweetAlert2 (Notifications)                       │  │
│  │  • Supabase JS Client (Database queries)            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + Express.js                                │  │
│  │  • express-validator (Input validation)             │  │
│  │  • express-rate-limit (Rate limiting)               │  │
│  │  • Supabase Server Client (Database/Auth)           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase (PostgreSQL 15+)                           │  │
│  │  • Row Level Security (RLS)                          │  │
│  │  • GIN Indexes (Array columns)                       │  │
│  │  • JSONB (Privacy settings)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase Storage                                     │  │
│  │  • profile-pictures bucket                           │  │
│  │  • Public read access                                │  │
│  │  • Max file size: 2MB                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0  
**Created**: 2026-08-03  
**Last Updated**: 2026-08-03
