# Phase 2 Backend API - Testing Guide

## Endpoints to Test

### 1. Student Directory Endpoint
**GET** `/api/students/directory`

#### Test Cases

**Basic Request (no filters)**
```bash
curl -X GET "http://localhost:5000/api/students/directory" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Search**
```bash
curl -X GET "http://localhost:5000/api/students/directory?search=john" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Department Filter**
```bash
curl -X GET "http://localhost:5000/api/students/directory?department=Computer%20Science" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Skills Filter**
```bash
curl -X GET "http://localhost:5000/api/students/directory?skills=JavaScript,React" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Interests Filter**
```bash
curl -X GET "http://localhost:5000/api/students/directory?interests=Web%20Dev,AI" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Year Filter**
```bash
curl -X GET "http://localhost:5000/api/students/directory?year=300" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Sorting**
```bash
# Sort by name ascending (default)
curl -X GET "http://localhost:5000/api/students/directory?sort=name-asc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Sort by name descending
curl -X GET "http://localhost:5000/api/students/directory?sort=name-desc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Sort by recent
curl -X GET "http://localhost:5000/api/students/directory?sort=recent" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With Pagination**
```bash
curl -X GET "http://localhost:5000/api/students/directory?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Combined Filters**
```bash
curl -X GET "http://localhost:5000/api/students/directory?department=Computer%20Science&year=300&skills=JavaScript&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Expected Response
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
        "bio": "Passionate about web development",
        "skills": ["JavaScript", "React", "Node.js"],
        "interests": ["Web Dev", "AI/ML"],
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "https://github.com/johndoe",
        "twitter": "https://twitter.com/johndoe",
        "instagram": null,
        "portfolio_url": "https://johndoe.com"
        // Note: email, phone, matric_no only shown if privacy_settings allows
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  },
  "message": "Directory retrieved successfully"
}
```

---

### 2. View Student Profile Endpoint
**GET** `/api/students/:id/profile`

#### Test Cases

**View Another Student's Profile**
```bash
curl -X GET "http://localhost:5000/api/students/STUDENT_ID_HERE/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**View Own Profile** (should show all fields)
```bash
curl -X GET "http://localhost:5000/api/students/YOUR_STUDENT_ID/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**View Private Profile** (should return 404)
```bash
curl -X GET "http://localhost:5000/api/students/PRIVATE_PROFILE_ID/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Invalid ID Format**
```bash
curl -X GET "http://localhost:5000/api/students/invalid-id/profile" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Expected Response (Success)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@tau.edu.ng",  // Only if show_email=true
    "phone": "+234...",  // Only if show_phone=true
    "matric_no": "23/10MSC014",  // Only if show_matric=true
    "department": "Computer Science",
    "course": "Computer Science",
    "year_of_study": 300,
    "graduation_year": 2026,
    "profile_picture_url": "https://...",
    "bio": "Full bio text...",
    "skills": ["JavaScript", "React", "Node.js"],
    "interests": ["Web Dev", "AI/ML"],
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

#### Expected Response (Private Profile)
```json
{
  "success": false,
  "error": "Profile not found or is private",
  "timestamp": "2026-08-03T..."
}
```

---

### 3. Update Profile Endpoint
**PUT** `/api/students/me`

#### Test Cases

**Update Basic Info**
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe Updated",
    "phone": "+2348012345678"
  }'
```

**Update Bio and Skills**
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Passionate web developer and AI enthusiast",
    "skills": ["JavaScript", "React", "Node.js", "Python", "Machine Learning"]
  }'
```

**Update Social Media Links**
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "portfolio_url": "https://johndoe.com"
  }'
```

**Update Interests and Academic Info**
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "interests": ["Web Development", "AI/ML", "Mobile Dev"],
    "year_of_study": 300,
    "graduation_year": 2026
  }'
```

**Update Privacy Settings**
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "visibility": "students-only",
    "privacy_settings": {
      "show_email": false,
      "show_phone": false,
      "show_matric": true
    }
  }'
```

**Update Everything at Once**
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+2348012345678",
    "bio": "Passionate web developer studying Computer Science at TAU",
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "interests": ["Web Development", "AI/ML"],
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
      "show_matric": true
    }
  }'
```

**Validation Errors (should fail)**

Bio too long:
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "'$(python3 -c "print('a' * 501)")'"
  }'
```

Invalid social URL:
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "linkedin": "not-a-valid-url"
  }'
```

Invalid year:
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "year_of_study": 600
  }'
```

Too many skills:
```bash
curl -X PUT "http://localhost:5000/api/students/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6", "Skill7", "Skill8", "Skill9", "Skill10", "Skill11", "Skill12", "Skill13", "Skill14", "Skill15", "Skill16", "Skill17", "Skill18", "Skill19", "Skill20", "Skill21"]
  }'
```

#### Expected Response (Success)
```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid",
      "user_id": "uuid",
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      // ... all updated fields ...
      "updated_at": "2026-08-03T..."
    }
  },
  "message": "Profile updated successfully"
}
```

#### Expected Response (Validation Error)
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "bio": ["bio max 500 characters"],
    "linkedin": ["linkedin must be a linkedin.com URL"]
  },
  "timestamp": "2026-08-03T..."
}
```

---

## Rate Limiting Tests

### Directory Endpoint (60 req/min)
```bash
# Should succeed
for i in {1..60}; do
  curl -X GET "http://localhost:5000/api/students/directory" \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
done

# 61st request should fail with 429
curl -X GET "http://localhost:5000/api/students/directory" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected after 60 requests:
```json
{
  "error": "Directory access limit exceeded. Please slow down."
}
```

### Profile View Endpoint (120 req/min)
Similar test but with 120 requests.

### Profile Update Endpoint (10 req/min)
Similar test but should fail after 10 requests.

---

## Privacy Settings Tests

1. **Create two test students**:
   - Student A: visibility='students-only', show_email=false
   - Student B: visibility='private'

2. **As Student C**:
   - ✅ Can see Student A in directory
   - ✅ Can view Student A's profile (but NOT email)
   - ❌ Cannot see Student B in directory
   - ❌ Cannot view Student B's profile (404)

3. **As Student A**:
   - ✅ Can see own email when viewing own profile
   - ✅ Can update privacy settings

4. **As Student B**:
   - ✅ Can see own profile
   - ✅ Does not appear in directory results

---

## Postman Collection

Import this into Postman for easier testing:

```json
{
  "info": {
    "name": "NACOS Student Networking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Student Directory",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/students/directory?page=1&limit=20",
          "host": ["{{base_url}}"],
          "path": ["api", "students", "directory"],
          "query": [
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "20"}
          ]
        }
      }
    },
    {
      "name": "View Student Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/students/{{student_id}}/profile",
          "host": ["{{base_url}}"],
          "path": ["api", "students", "{{student_id}}", "profile"]
        }
      }
    },
    {
      "name": "Update Profile",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"bio\": \"Updated bio\",\n  \"skills\": [\"JavaScript\", \"React\"],\n  \"linkedin\": \"https://linkedin.com/in/test\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/students/me",
          "host": ["{{base_url}}"],
          "path": ["api", "students", "me"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN"
    },
    {
      "key": "student_id",
      "value": "STUDENT_UUID"
    }
  ]
}
```

---

## Checklist

### Functionality
- [ ] Directory endpoint returns active students
- [ ] Directory respects visibility settings (excludes private profiles)
- [ ] Directory filters work (search, department, skills, interests, year)
- [ ] Directory pagination works correctly
- [ ] Directory sorting works (name-asc, name-desc, recent)
- [ ] Profile view endpoint returns full profile
- [ ] Profile view respects privacy settings (hides email/phone/matric based on settings)
- [ ] Profile view returns 404 for private profiles
- [ ] Profile view allows viewing own profile with all fields
- [ ] Profile update endpoint saves all new fields correctly
- [ ] Profile update sanitizes bio (removes HTML)
- [ ] Profile update sanitizes arrays (trims, removes empty)

### Validation
- [ ] Bio max 500 characters enforced
- [ ] Skills max 20 items enforced
- [ ] Interests max 10 items enforced
- [ ] Year of study must be 100-500
- [ ] Graduation year must be current to current+10
- [ ] Social URLs must be valid HTTP/HTTPS
- [ ] LinkedIn URL must contain linkedin.com
- [ ] GitHub URL must contain github.com
- [ ] Twitter URL must contain twitter.com or x.com
- [ ] Instagram URL must contain instagram.com
- [ ] Visibility must be one of: public, students-only, private
- [ ] Privacy settings must be object with boolean values

### Rate Limiting
- [ ] Directory limited to 60 req/min per user
- [ ] Profile view limited to 120 req/min per user
- [ ] Profile update limited to 10 req/min per user
- [ ] Rate limit headers returned (X-RateLimit-Limit, X-RateLimit-Remaining)

### Security
- [ ] Directory only shows active students
- [ ] Private profiles never appear in directory
- [ ] Private profiles return 404 when accessed
- [ ] Privacy settings applied correctly (email/phone/matric hidden)
- [ ] Own profile always shows all fields
- [ ] Authentication required for all endpoints
- [ ] Cannot view/update other students' profiles

---

**Testing Status**: Phase 2 implementation complete, ready for testing
**Last Updated**: 2026-08-03
