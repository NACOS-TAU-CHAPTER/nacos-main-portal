# Student Networking & Directory Feature Spec

## Quick Links
- [Requirements](./requirements.md) - Feature requirements, user stories, success metrics
- [Design](./design.md) - Technical design, API specs, database schema
- [Tasks](./tasks.md) - Implementation task breakdown

## Feature Overview

Transform the NACOS student dashboard into a networking platform where students can:
- ✨ Create rich profiles with bio, skills, interests, and social media links
- 🔍 Discover and browse other students through a searchable directory
- 🔒 Control privacy settings (what information to share and with whom)
- 🤝 Connect with peers via LinkedIn, GitHub, Twitter, Instagram, and portfolios

## Current Status

**Overall Progress**: 79% (15/19 tasks completed)

### Phase Status
- [x] **Phase 1**: Database Setup (2/2 tasks) ✅ **COMPLETED**
- [x] **Phase 2**: Backend API (4/4 tasks) ✅ **COMPLETED**
- [x] **Phase 3**: Profile Management (3/3 tasks) ✅ **COMPLETED**
- [x] **Phase 4**: Student Directory (4/4 tasks) ✅ **COMPLETED**
- [x] **Phase 5**: Profile View (1/1 tasks) ✅ **COMPLETED**
- [ ] **Phase 6**: Testing & Polish (4/5 tasks) - 1 task remaining

**Total Tasks**: 15 / 19 completed

**Next Task**: Manual Testing (Task 6.4)

## Timeline

**Estimated Duration**: 5-6 working days (1 developer)

**Proposed Schedule**:
- Day 1: Database setup + Backend API
- Day 2-3: Profile Management UI
- Day 3-4: Student Directory UI
- Day 4-5: Profile View + Integration
- Day 5-6: Testing, bug fixes, polish

## Key Features

### Must Have (P0)
1. **Profile Enhancement**
   - Edit bio, skills, interests
   - Add social media links (LinkedIn, GitHub, Twitter, Instagram, Portfolio)
   - Upload profile picture
   - Privacy controls

2. **Student Directory**
   - View all active students
   - Search by name
   - Filter by department, year, skills
   - Paginated results

3. **Profile Viewing**
   - View other students' full profiles
   - Clickable social media links
   - Respect privacy settings

### Should Have (P1)
- Profile completion indicator
- Sort directory (name, recent)
- Skills/interests autocomplete

### Future Enhancements
- Direct messaging
- Connection/follow system
- Profile views analytics
- Student recommendations

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth (existing)

## Database Changes

New columns added to `students` table:
- `twitter` (TEXT)
- `instagram` (TEXT)
- `portfolio_url` (TEXT)
- `interests` (TEXT[])
- `year_of_study` (INTEGER)
- `graduation_year` (INTEGER)
- `visibility` (TEXT) - 'public', 'students-only', 'private'
- `privacy_settings` (JSONB) - field-level privacy controls

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/students/directory` | Get paginated student list | Required |
| GET | `/api/students/:id/profile` | View a student's profile | Required |
| PUT | `/api/students/me` | Update own profile | Required |
| POST | `/api/students/me/profile-picture` | Upload profile picture | Required |

## Security & Privacy

- **Default Privacy**: Most restrictive settings by default
- **Visibility Levels**: Students Only, Private
- **Field-Level Control**: Hide/show email, phone, matric number
- **Rate Limiting**: Prevent directory scraping
- **RLS Policies**: Database-level access control

## Success Metrics

- 70%+ students complete their profiles within 2 weeks
- 50%+ students browse directory weekly
- 10+ profile views per student per month
- 30% increase in student engagement

## Dependencies

- Existing student authentication system ✅
- Supabase database and storage ✅
- Bootstrap UI framework ✅
- Student dashboard base UI ✅

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Low profile completion | Profile completion indicator, gentle nudges |
| Privacy concerns | Clear controls, restrictive defaults |
| Inappropriate content | Admin moderation tools |
| Directory scraping | Rate limiting, authentication |

## Getting Started (For Developers)

### Prerequisites
- Node.js 16+ installed
- Access to Supabase project
- Local development environment set up

### Setup Steps

1. **Run Database Migration**
   ```bash
   cd backend
   npm run migrate
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Open Frontend**
   - Navigate to `frontend/student-dashboard.html`
   - Login with student credentials
   - Access "Student Directory" tab

### Development Workflow

1. Start with Phase 1 (Database)
2. Build Backend APIs (Phase 2)
3. Implement Frontend (Phases 3-5)
4. Test thoroughly (Phase 6)

## Testing

### Manual Testing Checklist
- [ ] Profile editing saves all fields correctly
- [ ] Privacy settings are respected
- [ ] Directory search returns accurate results
- [ ] Filters work individually and in combination
- [ ] Social links open in new tabs
- [ ] Responsive on mobile and desktop
- [ ] Works on all major browsers

### Automated Testing
- Unit tests for validation functions
- Integration tests for API endpoints
- E2E tests for critical user flows (optional)

## Documentation

- [API Documentation](./design.md#api-design)
- [Database Schema](./design.md#database-design)
- [UI Components](./design.md#frontend-design)

## Questions or Issues?

- Review the [Requirements](./requirements.md) for feature clarification
- Check [Design](./design.md) for technical details
- See [Tasks](./tasks.md) for implementation guidance
- Contact: NACOS Development Team

---

**Spec Version**: 1.0  
**Created**: 2026-08-03  
**Last Updated**: 2026-08-03  
**Status**: Ready for Implementation 🚀
