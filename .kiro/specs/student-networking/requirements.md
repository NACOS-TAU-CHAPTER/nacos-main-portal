# Student Networking & Directory Feature

## Overview
Transform the NACOS student dashboard into a networking platform where students can showcase their profiles, connect with peers, and discover other students with similar interests or skills.

## Target Users
- **Primary**: Active NACOS students at Thomas Adewumi University
- **Secondary**: Admins (for moderation and management)

## Problem Statement
Currently, students have no way to:
- Discover and connect with other students in their department or with similar interests
- Showcase their skills, projects, and social media profiles
- Build a professional network within the university
- Find peers with specific skills for collaboration

## Goals
1. **Profile Enhancement**: Allow students to create rich profiles with social links, skills, bio, and interests
2. **Student Discovery**: Provide a searchable directory of all active students
3. **Privacy Control**: Give students control over what information they share and with whom
4. **Networking**: Enable students to view each other's profiles and connect via social media
5. **Community Building**: Foster a sense of community within NACOS

## Success Metrics
- 70%+ of active students complete their profiles within 2 weeks
- 50%+ of students browse the directory weekly
- Average profile views per student: 10+ per month
- Student engagement (profile updates, directory searches) increases by 30%

## Requirements

### Must Have (P0)
1. **Profile Management**
   - Students can edit their own profile
   - Add/update: bio, skills, interests, social media links (LinkedIn, GitHub, Twitter, Instagram, Portfolio)
   - Upload profile picture
   - Set profile visibility (Public, Students Only, Private)
   - Control individual field visibility (email, phone, matric number)

2. **Student Directory**
   - View all active students in a grid/card layout
   - Search by name
   - Filter by: department, year of study, skills
   - Pagination (20 students per page)
   - Click to view full profile

3. **Profile View**
   - View another student's full profile
   - Display: name, department, year, bio, skills, interests, social links
   - Respect privacy settings (hide private fields)
   - Social media links are clickable

4. **Privacy & Security**
   - Default to most restrictive settings
   - Students can only view profiles of "active" students
   - Admins can view all profiles
   - Rate limiting on directory API to prevent scraping

### Should Have (P1)
1. Profile completion indicator (e.g., "Your profile is 60% complete")
2. Sort directory by: name, department, recent activity
3. Skills autocomplete/suggestions
4. Profile analytics (how many times your profile was viewed)

### Could Have (P2)
1. Direct messaging between students
2. Connection requests (LinkedIn-style)
3. Student recommendations ("You might know...")
4. Export profile as PDF/resume

### Won't Have (Out of Scope)
1. Public profiles (visible to non-logged-in users)
2. Chat/messaging system (future feature)
3. Groups or communities
4. Profile endorsements/recommendations

## User Stories

### As a Student
1. I want to **add my LinkedIn and GitHub** to my profile so other students can connect with me professionally
2. I want to **add a bio and list my skills** so others know what I'm interested in and good at
3. I want to **browse all students** in the platform to discover peers
4. I want to **search for students** by name or department to find specific people
5. I want to **filter students by skills** (e.g., "React") to find potential project collaborators
6. I want to **view another student's profile** to learn more about them and see their social links
7. I want to **control who sees my email and phone** for privacy reasons
8. I want to **set my profile to private** if I don't want to be discoverable
9. I want to **upload a profile picture** to personalize my profile
10. I want to **see how complete my profile is** so I know what information to add

### As an Admin
1. I want to **view all student profiles** to monitor content and ensure appropriate use
2. I want to **see profile completion statistics** to understand engagement
3. I want to **moderate reported profiles** to maintain community standards

## Technical Constraints
- Must work with existing Supabase database
- Must use existing authentication system
- Must respect current RLS (Row Level Security) policies
- Profile pictures must use existing storage buckets
- Must work on existing student dashboard UI

## Assumptions
- Students will voluntarily complete their profiles
- Students understand basic privacy concepts
- Social media links will be validated but not verified
- All students have verified email addresses

## Dependencies
- Existing student authentication system
- Supabase storage for profile pictures
- Current student dashboard UI framework (Bootstrap)

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low profile completion rate | High | Medium | Add profile completion indicator, gentle nudges |
| Privacy concerns | High | Low | Default to most restrictive, clear privacy controls |
| Inappropriate content in profiles | Medium | Low | Admin moderation tools, reporting system |
| Directory scraping | Medium | Medium | Rate limiting, authentication required |
| Poor search performance | Medium | Medium | Add database indexes, optimize queries |

## Open Questions
1. Should we allow students to hide their profile from the directory entirely?
   - **Proposed**: Yes, via "Private" visibility setting
2. Should we validate social media links (check if they exist)?
   - **Proposed**: No, just validate URL format
3. Should profile pictures be required or optional?
   - **Proposed**: Optional, with default avatar
4. Should we show graduation year or current year of study?
   - **Proposed**: Both
5. Should admins be visible in the student directory?
   - **Proposed**: No, students table only

## Future Enhancements (Post-MVP)
- Direct messaging between students
- Connection/follow system
- Activity feed (who updated their profile, new students)
- Profile badges (e.g., "Early Adopter", "Top Contributor")
- Export profile as resume/CV
- Profile views analytics
- Student recommendations

---

**Status**: Requirements Gathering  
**Created**: 2026-08-03  
**Last Updated**: 2026-08-03  
**Owner**: NACOS Development Team
