# Student Networking Feature - Testing Guide

**Feature**: Student Networking & Directory  
**Status**: Ready for Testing  
**Date**: August 3, 2026

---

## Prerequisites

### 1. Run Database Migration
```bash
cd backend
npm run migrate:007
```

**Expected Output:**
```
✓ Connected to Supabase
✓ Migration 007 completed successfully
✓ All indexes created
✓ RLS policy created
```

**Verify in Supabase:**
- Go to Table Editor → students table
- Check new columns exist: twitter, instagram, portfolio_url, interests, year_of_study, graduation_year, visibility, privacy_settings
- Go to Database → Indexes → verify 6 new indexes

### 2. Start Backend Server
```bash
cd backend
npm run dev
# or
npm start
```

**Expected Output:**
```
Server running on port 5000
Connected to Supabase
```

### 3. Open Frontend
- Navigate to `frontend/student-dashboard.html`
- Login with a student account
- If you don't have a student account, create one via student signup

---

## Quick Test (5 minutes)

### Test 1: Edit Profile
1. Click **"Edit Profile"** button
2. Fill in bio: "I'm a software engineering student passionate about web development"
3. Add 3 skills: "JavaScript", "React", "Node.js" (press Enter after each)
4. Add 2 interests: "Web Development", "AI/ML" (press Enter after each)
5. Add LinkedIn URL: `https://linkedin.com/in/yourname`
6. Select year: 300L
7. Enter graduation year: 2027
8. Click **"Save Profile"**
9. ✅ Should see success message
10. ✅ Profile completion bar should update

### Test 2: View Directory
1. Click **"Student Directory"** in Quick Access
2. ✅ Should see list of students with skeleton loading first
3. Type your name in search box
4. ✅ Should filter results in real-time
5. Click on any student card
6. ✅ Profile modal should open with student details

### Test 3: Privacy Settings
1. Click **"Edit Profile"**
2. Toggle **"Show my email address"** to OFF
3. Toggle **"Show my phone number"** to OFF
4. Save profile
5. Have another student view your profile
6. ✅ Email and phone should NOT be visible

---

## Comprehensive Test (30 minutes)

### A. Profile Management Tests

#### A1: Bio Field
- [ ] Enter text in bio field
- [ ] Verify character counter updates (X/500)
- [ ] Try entering 501+ characters (should be blocked)
- [ ] Save and verify bio persists

#### A2: Skills Management
- [ ] Add a skill "Python" (press Enter)
- [ ] Verify green tag appears
- [ ] Click X on tag to remove
- [ ] Add 20 skills (max allowed)
- [ ] Try adding 21st skill (should show error)
- [ ] Try adding duplicate skill (should show error)
- [ ] Try adding skill longer than 50 chars (should show error)

#### A3: Interests Management
- [ ] Add interest "Machine Learning" (press Enter)
- [ ] Verify blue tag appears
- [ ] Click X on tag to remove
- [ ] Add 10 interests (max allowed)
- [ ] Try adding 11th interest (should show error)
- [ ] Try adding duplicate interest (should show error)

#### A4: Social Media Links
- [ ] Add LinkedIn URL (valid)
- [ ] Add GitHub URL (valid)
- [ ] Add Twitter URL (valid)
- [ ] Add Instagram URL (valid)
- [ ] Add Portfolio URL (valid)
- [ ] Try invalid URL (browser should show error)
- [ ] Leave some fields empty (should work fine)
- [ ] Save and verify all URLs persist

#### A5: Academic Info
- [ ] Select year: 100L, 200L, 300L, 400L, 500L (try each)
- [ ] Enter graduation year: 2027
- [ ] Try invalid year like 2050 (backend will validate)
- [ ] Save and verify data persists

#### A6: Privacy Settings
- [ ] Change visibility to "Students Only"
- [ ] Change visibility to "Private"
- [ ] Toggle "Show email" ON/OFF
- [ ] Toggle "Show phone" ON/OFF
- [ ] Toggle "Show matric" ON/OFF
- [ ] Save and verify settings persist
- [ ] Test with another account to verify privacy works

#### A7: Profile Completion
- [ ] Note current completion percentage
- [ ] Add missing fields one by one
- [ ] Verify percentage increases
- [ ] Complete all fields
- [ ] Verify reaches 100%
- [ ] Check color: Red (<40%), Yellow (40-70%), Green (70%+)

---

### B. Student Directory Tests

#### B1: Initial Load
- [ ] Click "Student Directory"
- [ ] Verify skeleton loading animation appears
- [ ] Verify students load after animation
- [ ] Check student cards display correctly
- [ ] Verify 3 columns on desktop, 2 on tablet, 1 on mobile

#### B2: Search Functionality
- [ ] Type partial name in search (e.g., "John")
- [ ] Verify results filter in real-time (300ms debounce)
- [ ] Clear search
- [ ] Verify all students show again
- [ ] Search for non-existent name
- [ ] Verify "No students found" message

#### B3: Department Filter
- [ ] Select "Computer Science"
- [ ] Verify only CS students show
- [ ] Select "Software Engineering"
- [ ] Verify only SE students show
- [ ] Select "All Departments"
- [ ] Verify all students show

#### B4: Year Filter
- [ ] Select "100 Level"
- [ ] Verify only 100L students show
- [ ] Select "300 Level"
- [ ] Verify only 300L students show
- [ ] Select "All Years"
- [ ] Verify all students show

#### B5: Sort Options
- [ ] Select "Name A-Z"
- [ ] Verify alphabetical order (A to Z)
- [ ] Select "Name Z-A"
- [ ] Verify reverse alphabetical (Z to A)
- [ ] Select "Recently Joined"
- [ ] Verify newest students first

#### B6: Combined Filters
- [ ] Search "John" + Department "Computer Science"
- [ ] Verify both filters apply
- [ ] Add Year "300 Level"
- [ ] Verify all 3 filters apply
- [ ] Click "Clear" button
- [ ] Verify all filters reset

#### B7: Pagination
- [ ] Verify pagination shows if >20 students
- [ ] Click "Next" button
- [ ] Verify page 2 loads
- [ ] Click page number (e.g., "3")
- [ ] Verify that page loads
- [ ] Click "Previous" button
- [ ] Verify previous page loads
- [ ] Check "Previous" disabled on page 1
- [ ] Check "Next" disabled on last page

#### B8: Student Cards
- [ ] Verify profile picture shows (or default)
- [ ] Verify name, department, year display
- [ ] Verify bio preview (max 100 chars)
- [ ] Verify top 3 skills show as tags
- [ ] Verify "+N" indicator if >3 skills
- [ ] Verify social icons show (if student has them)
- [ ] Hover over card (should lift up)
- [ ] Click social icon (should open in new tab, card shouldn't open)

---

### C. Profile View Tests

#### C1: Open Profile
- [ ] Click student card
- [ ] Verify modal opens
- [ ] Verify profile data loads
- [ ] Check large profile picture displays
- [ ] Check name, department, year show

#### C2: Profile Sections
- [ ] Verify "About" section shows (if bio exists)
- [ ] Verify "Skills" section shows (if skills exist)
- [ ] Verify "Interests" section shows (if interests exist)
- [ ] Verify "Connect" section shows (if social links exist)
- [ ] Verify "Contact" section shows (if email/phone public)

#### C3: Social Links
- [ ] Click LinkedIn button
- [ ] Verify opens in new tab
- [ ] Verify LinkedIn page loads
- [ ] Repeat for GitHub, Twitter, Instagram, Portfolio
- [ ] Verify each has correct icon and color

#### C4: Privacy Respect
- [ ] View profile with email hidden
- [ ] Verify email NOT shown in Contact section
- [ ] View profile with phone hidden
- [ ] Verify phone NOT shown
- [ ] View profile with matric hidden
- [ ] Verify matric NOT shown in header
- [ ] Try to view private profile
- [ ] Verify 404 error message

#### C5: Modal Controls
- [ ] Click X button to close
- [ ] Verify modal closes
- [ ] Open profile again
- [ ] Click outside modal
- [ ] Verify modal closes
- [ ] Open profile again
- [ ] Press ESC key
- [ ] Verify modal closes

---

### D. Responsive Design Tests

#### D1: Desktop (≥1200px)
- [ ] Open in desktop browser (full screen)
- [ ] Verify 3-column grid in directory
- [ ] Verify all elements readable
- [ ] Verify modals centered
- [ ] Verify no horizontal scroll

#### D2: Tablet (768px-1199px)
- [ ] Resize browser to tablet width
- [ ] Verify 2-column grid in directory
- [ ] Verify cards resize properly
- [ ] Verify filters stack nicely
- [ ] Verify modal fits screen

#### D3: Mobile (<768px)
- [ ] Resize browser to mobile width (375px)
- [ ] Verify 1-column grid in directory
- [ ] Verify cards full width
- [ ] Verify filters stack vertically
- [ ] Verify modal scrollable
- [ ] Verify buttons large enough to tap
- [ ] Verify text readable (not too small)

---

### E. Browser Compatibility Tests

#### E1: Chrome
- [ ] Open in Google Chrome
- [ ] Test all major features
- [ ] Check console for errors
- [ ] Verify animations smooth

#### E2: Firefox
- [ ] Open in Mozilla Firefox
- [ ] Test all major features
- [ ] Check console for errors
- [ ] Verify styles render correctly

#### E3: Safari (Mac/iOS)
- [ ] Open in Safari
- [ ] Test all major features
- [ ] Check console for errors
- [ ] Verify iOS gestures work

#### E4: Edge
- [ ] Open in Microsoft Edge
- [ ] Test all major features
- [ ] Check console for errors
- [ ] Verify compatibility

---

### F. Performance Tests

#### F1: Load Times
- [ ] Open dashboard (should load in <2 seconds)
- [ ] Click directory (should load in <2 seconds)
- [ ] Search (should respond in <300ms after debounce)
- [ ] Open profile modal (should open instantly)
- [ ] Switch pages (should load in <1 second)

#### F2: Network
- [ ] Open DevTools → Network tab
- [ ] Click directory
- [ ] Verify only necessary API calls made
- [ ] Verify no duplicate requests
- [ ] Verify requests use proper headers
- [ ] Verify authentication token sent

#### F3: Console
- [ ] Open DevTools → Console tab
- [ ] Perform all actions
- [ ] Verify NO errors in console
- [ ] Verify NO warnings (or only minor)
- [ ] Check for memory leaks (watch memory usage)

---

### G. Error Handling Tests

#### G1: Network Errors
- [ ] Disconnect internet
- [ ] Try to save profile
- [ ] Verify error message shows
- [ ] Try to load directory
- [ ] Verify error message shows
- [ ] Reconnect internet
- [ ] Verify features work again

#### G2: Invalid Data
- [ ] Try to add skill >50 characters
- [ ] Verify error message
- [ ] Try to add 21 skills
- [ ] Verify error message
- [ ] Try to add 11 interests
- [ ] Verify error message

#### G3: Authentication
- [ ] Log out
- [ ] Try to access dashboard
- [ ] Verify redirects to login
- [ ] Log in again
- [ ] Verify can access features

---

### H. Accessibility Tests

#### H1: Keyboard Navigation
- [ ] Tab through profile form
- [ ] Verify can reach all inputs
- [ ] Verify focus indicators visible
- [ ] Press Enter on "Save" button
- [ ] Verify form submits
- [ ] Tab through directory filters
- [ ] Press ESC on modal
- [ ] Verify modal closes

#### H2: Screen Reader (Optional)
- [ ] Use NVDA or JAWS
- [ ] Navigate through profile form
- [ ] Verify labels read correctly
- [ ] Navigate through directory
- [ ] Verify card contents read correctly
- [ ] Open profile modal
- [ ] Verify content reads in logical order

#### H3: Visual
- [ ] Verify sufficient color contrast
- [ ] Verify text readable (not too small)
- [ ] Verify click targets large enough
- [ ] Verify icons have text labels
- [ ] Verify error messages visible

---

## Bug Reporting Template

If you find a bug, report it with this format:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Browser/Device**:
[Chrome 120, Windows 11]

**Screenshots**:
[If applicable]

**Console Errors**:
[Copy any errors from browser console]

**Priority**:
[Critical / High / Medium / Low]
```

---

## Test Results Checklist

### Summary
- [ ] All profile management tests passed
- [ ] All directory tests passed
- [ ] All profile view tests passed
- [ ] All responsive tests passed
- [ ] All browser tests passed
- [ ] All performance tests passed
- [ ] All error handling tests passed
- [ ] All accessibility tests passed

### Bugs Found
- [ ] No critical bugs
- [ ] No high priority bugs
- [ ] Minor bugs documented and acceptable

### Sign-Off
- [ ] Feature ready for production
- [ ] Documentation complete
- [ ] Deployment checklist reviewed

---

## Quick Commands

```bash
# Start backend server
cd backend && npm run dev

# Run migration
cd backend && npm run migrate:007

# Check migration status
# (Look in Supabase dashboard → Database → Tables → students)

# View backend logs
# (Terminal where npm run dev is running)

# View frontend logs
# (Browser DevTools → Console)
```

---

## Support

If you encounter issues during testing:

1. Check browser console for errors (F12)
2. Check backend terminal for API errors
3. Verify migration 007 ran successfully
4. Verify API URL is correct (env.js or api-config.js)
5. Try logging out and back in
6. Clear browser cache and reload

---

**Happy Testing! 🚀**
