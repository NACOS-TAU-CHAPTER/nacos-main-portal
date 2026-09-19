# DEBUG - Events Not Showing on Student Dashboard

**Date**: August 3, 2026  
**Issue**: Event added in admin dashboard doesn't appear on student dashboard

---

## 🔍 Quick Diagnosis

### Check 1: What Date Did You Use?

**The student dashboard only shows FUTURE events** (today or later).

Run this in Supabase SQL Editor to check your event:
```sql
SELECT 
  id,
  title,
  date,
  is_active,
  CASE 
    WHEN date >= CURRENT_DATE THEN '✅ Will show (future)'
    ELSE '❌ Won''t show (past)'
  END as status
FROM events
ORDER BY created_at DESC
LIMIT 5;
```

**Result interpretation**:
- If `status` = "✅ Will show (future)" → Event should display
- If `status` = "❌ Won't show (past)" → Event won't display (past date)

---

## 🐛 Root Cause

### Student Dashboard Filter (line 567)
```javascript
const { data: events, error } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)        // ✅ Must be active
  .gte('date', today)           // ❌ FILTER: date >= today
  .order('date', { ascending: true })
  .limit(5);
```

### What This Means
The code filters out events where:
- `is_active` = false → Won't show
- `date` < today → Won't show (past events)

### Example
**Today's date**: August 3, 2026

| Event Date | Will Show? | Reason |
|------------|------------|--------|
| August 1, 2026 | ❌ No | Past date |
| August 3, 2026 | ✅ Yes | Today |
| August 10, 2026 | ✅ Yes | Future date |

---

## ✅ Solutions

### Solution 1: Check Event Date (Most Likely)

**If you used a past date**:
1. Go to admin dashboard → Events
2. Click edit on your event
3. Change date to **today or a future date**
4. Save
5. Refresh student dashboard

### Solution 2: Check is_active Status

**Run in Supabase SQL Editor**:
```sql
-- Check if event is active
SELECT id, title, is_active 
FROM events 
WHERE title LIKE '%your event title%';
```

**If `is_active` = false**:
```sql
-- Set to active
UPDATE events 
SET is_active = true 
WHERE id = 'YOUR-EVENT-ID';
```

### Solution 3: Check RLS Policies

**Test if you can read events** (run in browser console on student dashboard):
```javascript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .limit(1);
  
console.log('Data:', data);
console.log('Error:', error);
```

**Expected**: Should return at least one event  
**If error**: RLS policy might be blocking access

---

## 🧪 Complete Diagnostic Steps

### Step 1: Check Event in Database
```sql
SELECT 
  id,
  title,
  date,
  is_active,
  created_at,
  requires_payment,
  payment_amount
FROM events
ORDER BY created_at DESC
LIMIT 1;
```

**Expected output** (your most recent event):
- `date`: Should be today or future
- `is_active`: Should be `true`

### Step 2: Check What Student Dashboard Sees

**In browser console on student dashboard**, run:
```javascript
// This is exactly what loadEvents() does
const today = new Date().toISOString().split('T')[0];
console.log('Today:', today);

const { data: events, error } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .gte('date', today)
  .order('date', { ascending: true })
  .limit(5);

console.log('Events found:', events?.length || 0);
console.log('Events:', events);
console.log('Error:', error);
```

**Expected**:
- `Events found: 1` (or more)
- `Events: [{...}]` (array with your event)
- `Error: null`

**If Events found: 0**:
- Check if event date is in the future
- Check if `is_active` is true

**If Error is not null**:
- RLS policy issue or permission denied

### Step 3: Check Date Format

```sql
-- Check date format in database
SELECT 
  id,
  title,
  date,
  date::text as date_string,
  CURRENT_DATE as today,
  CASE WHEN date >= CURRENT_DATE THEN 'FUTURE' ELSE 'PAST' END as comparison
FROM events
ORDER BY created_at DESC
LIMIT 3;
```

### Step 4: Manually Trigger Reload

**In browser console on student dashboard**:
```javascript
// Force reload events
await loadEvents();
```

Check if events now appear.

---

## 🔧 Quick Fixes

### Fix 1: Update Event Date to Future
```sql
-- Update your event to show tomorrow
UPDATE events 
SET date = CURRENT_DATE + INTERVAL '1 day'
WHERE id = 'YOUR-EVENT-ID';
```

### Fix 2: Remove Date Filter (Show All Events)

**If you want to show ALL active events** (including past), update student-dashboard.html:

```javascript
// CURRENT (line 563-567)
const { data: events, error } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .gte('date', today)           // ❌ Remove this line
  .order('date', { ascending: true })
  .limit(5);

// BETTER (shows all active events)
const { data: events, error } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .order('date', { ascending: false })  // Recent first
  .limit(5);
```

### Fix 3: Show Past Events Separately

```javascript
// Show both upcoming and recent events
const today = new Date().toISOString().split('T')[0];

// Get upcoming events
const { data: upcomingEvents } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .gte('date', today)
  .order('date', { ascending: true })
  .limit(3);

// Get recent past events
const { data: pastEvents } = await supabase
  .from('events')
  .select('*')
  .eq('is_active', true)
  .lt('date', today)
  .order('date', { ascending: false })
  .limit(2);

// Display both sections
```

---

## 📊 Common Scenarios

### Scenario 1: Event Shows in Admin But Not Student
**Cause**: Event date is in the past  
**Solution**: Edit event date to future

### Scenario 2: No Events Show At All
**Cause**: No future events exist  
**Solution**: Create event with future date

### Scenario 3: Events Show Then Disappear
**Cause**: Event date passed (became past)  
**Solution**: Normal behavior - update event date or create new event

### Scenario 4: Wrong Event Showing
**Cause**: Multiple events exist, showing wrong one  
**Solution**: Check filters and limits

---

## 🎯 Recommended Fix

Based on typical use case, I recommend **keeping the date filter** but being aware of it.

### Best Practice
When creating events in admin dashboard:
1. ✅ **Always use future dates** for upcoming events
2. ✅ **Set is_active = true** 
3. ✅ **Add image** for better visibility
4. ✅ **Fill in description** and location

### Testing Checklist
- [ ] Event date is today or future
- [ ] Event is_active = true
- [ ] Event appears in admin dashboard events list
- [ ] Refresh student dashboard (Ctrl+R)
- [ ] Event appears in student dashboard

---

## 💡 Enhancement Ideas

### Show Event Count
Add indicator in student dashboard:
```html
<h3>Upcoming Events (5 found)</h3>
```

### Show "No Upcoming Events" Message Differently
```javascript
if (events && events.length > 0) {
  // Show events
} else {
  eventsContainer.innerHTML = `
    <div class="col-12 text-center">
      <i class="bi bi-calendar-x" style="font-size: 3rem; color: #ccc;"></i>
      <p class="text-muted">No upcoming events at this time.</p>
      <p class="small text-muted">Check back soon for updates!</p>
    </div>
  `;
}
```

### Add "View All Events" Link
```html
<a href="events.html" class="btn btn-primary">View All Events</a>
```

---

## 📝 Summary

**Most likely issue**: Event was created with a **past date**

**Quick fix**: 
1. Edit event in admin dashboard
2. Change date to future (e.g., tomorrow)
3. Save
4. Refresh student dashboard

**Alternative**: Remove date filter to show all active events (past and future)

---

**TEST COMMAND** (run in browser console on student dashboard):
```javascript
const today = new Date().toISOString().split('T')[0];
const { data } = await supabase.from('events').select('*').eq('is_active', true).gte('date', today);
console.log(`Found ${data?.length || 0} upcoming events`);
```
