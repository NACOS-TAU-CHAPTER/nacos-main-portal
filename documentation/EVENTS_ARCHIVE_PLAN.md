# Events Archive & Dashboard Display - Implementation Plan

**Feature Request**: Separate past events archive page + Dashboard shows only last week's events  
**Date**: August 4, 2026  
**Status**: Planning Phase

---

## Current System Analysis

### How Events Work Now

**Database**: `events` table
- Has `date` field (DATE type)
- Has `is_active` field (BOOLEAN)
- No special "archive" or "status" field

**Backend API**: `backend/routes/events.js`
- `GET /api/events/upcoming` - Returns future events (date >= today), limit 5
- `GET /api/events/past` - Returns past events (date < today), limit 10
- Both endpoints already exist! ✅

**Frontend**: `frontend/student-dashboard.html`
- Currently calls `/api/events/upcoming`
- Shows all upcoming events (no date filtering beyond "future")
- No link to view past events

---

## Problem Statement

### Current Issues:
1. **Dashboard shows ALL upcoming events** - Can be overwhelming if many events scheduled
2. **Past events hidden** - Students can't browse event history or see what they missed
3. **No event archive** - Past events disappear, no historical record visible

### Desired Behavior:
1. **Dashboard**: Show only events from **last 7 days** (recent/current week)
2. **Archive Page**: Dedicated page showing **all past events** with search/filter
3. **Navigation**: Easy access to archive from dashboard

---

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│ STUDENT DASHBOARD                               │
│                                                 │
│ Events Section:                                 │
│ - Show events from last 7 days only            │
│ - "View All Past Events" button → Archive      │
│ - Max 5 events displayed                       │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│ EVENTS ARCHIVE PAGE (new page)                 │
│                                                 │
│ Features:                                       │
│ - All past events in chronological order       │
│ - Search by title/description                  │
│ - Filter by month/year                         │
│ - Filter by event type                         │
│ - Pagination (20 per page)                     │
│ - Click event → Details modal                  │
└─────────────────────────────────────────────────┘
```

---

## Implementation Details

### Phase 1: Update Dashboard to Show Last Week Only

**File**: `frontend/student-dashboard.html`

**Changes**:
1. Modify `loadEvents()` function
2. Calculate date 7 days ago
3. Filter events: `date >= (today - 7 days) AND date <= today`
4. Add "View Past Events" button below events section

**Logic**:
```javascript
async function loadEvents() {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  // Fetch upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('date', lastWeek.toISOString().split('T')[0])
    .lte('date', today.toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(5);
  
  // Render events...
}
```

**Button Addition**:
```html
<div class="text-center mt-4">
  <a href="events-archive.html" class="btn btn-outline-custom">
    <i class="bi bi-archive"></i> View All Past Events
  </a>
</div>
```

**Estimated Time**: 30 minutes

---

### Phase 2: Create Backend API Endpoints

**File**: `backend/routes/events.js`

**Good News**: Endpoints already exist! ✅

Existing endpoints we'll use:
- `GET /api/events/past?limit=20` - Get past events with pagination
- `GET /api/events/:id` - Get single event details

**New Endpoint Needed**: Enhanced past events with filters

```javascript
// GET /api/events/past?page=1&limit=20&search=workshop&month=8&year=2026&type=seminar
router.get('/past', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      month, 
      year, 
      type 
    } = req.query;

    const today = new Date().toISOString().split('T')[0];
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('events')
      .select('*, event_registrations(count)', { count: 'exact' })
      .lt('date', today)
      .order('date', { ascending: false });

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Month filter
    if (month && year) {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = `${year}-${month.padStart(2, '0')}-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    } else if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
    }

    // Event type filter
    if (type) {
      query = query.eq('event_type', type);
    }

    // Pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return successResponse(res, {
      events: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Past events error:', error);
    return errorResponse(res, 'Failed to fetch past events', 500, error);
  }
});
```

**Estimated Time**: 1 hour

---

### Phase 3: Create Events Archive Page

**File**: `frontend/events-archive.html` (NEW)

**Page Structure**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Past Events Archive - NACOS TAU</title>
  <!-- Same styles/scripts as other pages -->
</head>
<body>
  <!-- Navbar (same as dashboard) -->
  
  <main class="container" style="padding-top: 120px;">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="page-title">
          <i class="bi bi-archive"></i> Past Events Archive
        </h1>
        <p class="text-muted">Browse through all previous NACOS events</p>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <!-- Search Input -->
        <input type="text" id="searchInput" class="form-control" 
               placeholder="Search events..." 
               aria-label="Search events">
      </div>
      <div class="col-md-3 mb-3">
        <!-- Year Filter -->
        <select id="yearFilter" class="form-select" aria-label="Filter by year">
          <option value="">All Years</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>
      <div class="col-md-3 mb-3">
        <!-- Month Filter -->
        <select id="monthFilter" class="form-select" aria-label="Filter by month">
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <!-- ... all months ... -->
        </select>
      </div>
      <div class="col-md-2 mb-3">
        <!-- Type Filter -->
        <select id="typeFilter" class="form-select" aria-label="Filter by event type">
          <option value="">All Types</option>
          <option value="seminar">Seminar</option>
          <option value="workshop">Workshop</option>
          <option value="competition">Competition</option>
          <option value="social">Social</option>
        </select>
      </div>
    </div>

    <!-- Events Grid -->
    <div id="eventsGrid" class="row g-4 mb-4">
      <!-- Events will be loaded here -->
    </div>

    <!-- Pagination -->
    <nav aria-label="Past events pagination">
      <ul id="pagination" class="pagination justify-content-center">
        <!-- Pagination buttons here -->
      </ul>
    </nav>

    <!-- Empty State -->
    <div id="emptyState" class="text-center py-5" style="display: none;">
      <i class="bi bi-calendar-x" style="font-size: 4rem; color: #ccc;"></i>
      <p class="text-muted mt-3">No events found matching your filters.</p>
      <button class="btn btn-outline-secondary" onclick="clearFilters()">
        Clear Filters
      </button>
    </div>
  </main>

  <!-- Event Details Modal (reuse from dashboard) -->
  
  <script>
    // Load events with filters
    // Pagination logic
    // Modal logic (same as dashboard)
  </script>
</body>
</html>
```

**JavaScript Logic**:

```javascript
let currentPage = 1;
let filters = {
  search: '',
  year: '',
  month: '',
  type: ''
};

async function loadPastEvents() {
  try {
    showLoading();
    
    const params = new URLSearchParams({
      page: currentPage,
      limit: 20,
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}/api/events/past?${params}`);
    const result = await response.json();

    if (result.success) {
      renderEvents(result.data.events);
      renderPagination(result.data.pagination);
    }
  } catch (error) {
    console.error('Error loading events:', error);
    showError();
  }
}

function renderEvents(events) {
  const grid = document.getElementById('eventsGrid');
  const emptyState = document.getElementById('emptyState');

  if (events.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'block';
  emptyState.style.display = 'none';

  grid.innerHTML = events.map(event => `
    <div class="col-md-6 col-lg-4">
      <div class="event-card" onclick="showEventDetails('${event.id}')" 
           role="button" tabindex="0">
        ${event.image_url ? `
          <img src="${event.image_url}" alt="${event.title}" 
               class="event-image">
        ` : ''}
        <div class="event-content">
          <span class="event-date">
            <i class="bi bi-calendar"></i> ${formatDate(event.date)}
          </span>
          <h5 class="event-title">${event.title}</h5>
          <p class="event-desc">${event.description || 'No description'}</p>
          ${event.location ? `
            <p class="event-location">
              <i class="bi bi-geo-alt"></i> ${event.location}
            </p>
          ` : ''}
          <span class="event-type-badge">${event.event_type || 'General'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination(pagination) {
  const paginationEl = document.getElementById('pagination');
  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  if (page > 1) {
    html += `
      <li class="page-item">
        <button class="page-link" onclick="changePage(${page - 1})">
          Previous
        </button>
      </li>
    `;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      html += `
        <li class="page-item ${i === page ? 'active' : ''}">
          <button class="page-link" onclick="changePage(${i})">${i}</button>
        </li>
      `;
    } else if (i === page - 3 || i === page + 3) {
      html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }

  // Next button
  if (page < totalPages) {
    html += `
      <li class="page-item">
        <button class="page-link" onclick="changePage(${page + 1})">
          Next
        </button>
      </li>
    `;
  }

  paginationEl.innerHTML = html;
}

// Filter change handlers
document.getElementById('searchInput').addEventListener('input', debounce((e) => {
  filters.search = e.target.value;
  currentPage = 1;
  loadPastEvents();
}, 500));

document.getElementById('yearFilter').addEventListener('change', (e) => {
  filters.year = e.target.value;
  currentPage = 1;
  loadPastEvents();
});

document.getElementById('monthFilter').addEventListener('change', (e) => {
  filters.month = e.target.value;
  currentPage = 1;
  loadPastEvents();
});

document.getElementById('typeFilter').addEventListener('change', (e) => {
  filters.type = e.target.value;
  currentPage = 1;
  loadPastEvents();
});

function clearFilters() {
  filters = { search: '', year: '', month: '', type: '' };
  document.getElementById('searchInput').value = '';
  document.getElementById('yearFilter').value = '';
  document.getElementById('monthFilter').value = '';
  document.getElementById('typeFilter').value = '';
  currentPage = 1;
  loadPastEvents();
}

function changePage(page) {
  currentPage = page;
  loadPastEvents();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Load on page load
loadPastEvents();
```

**Estimated Time**: 3 hours

---

### Phase 4: Update Navigation

**Files to Update**:
- `frontend/student-dashboard.html` - Add link in navbar
- `frontend/events-archive.html` - Add same navbar
- All other pages - Add "Past Events" to navigation menu

**Navbar Update**:
```html
<ul class="navbar-nav ms-auto">
  <li class="nav-item">
    <a class="nav-link" href="student-dashboard.html">Dashboard</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="events-archive.html">Past Events</a>
  </li>
  <li class="nav-item">
    <a class="nav-link" href="resources.html">Resources</a>
  </li>
  <!-- ... other links ... -->
</ul>
```

**Estimated Time**: 30 minutes

---

## Design Specifications

### Event Card Design (Archive Page)

```css
.event-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(27,140,12,0.2);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.event-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-date {
  color: #1b8c0c;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: block;
}

.event-title {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.event-desc {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-location {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.event-type-badge {
  display: inline-block;
  background: #e8f5e9;
  color: #1b8c0c;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

/* Filter Section */
.filters-section {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

/* Pagination */
.pagination .page-link {
  color: #1b8c0c;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #1b8c0c;
  border-color: #1b8c0c;
}

.pagination .page-link:hover {
  background-color: #e8f5e9;
  border-color: #1b8c0c;
}
```

---

## Alternative Approaches Considered

### Option 1: Single Events Page (Tabs)
**Pros**: One page for all events, easier navigation  
**Cons**: Can be cluttered, mixing upcoming and past

**Verdict**: ❌ Rejected - Better to separate concerns

---

### Option 2: Infinite Scroll Instead of Pagination
**Pros**: Modern UX, seamless browsing  
**Cons**: Harder to jump to specific events, performance issues with hundreds of events

**Verdict**: ✅ Could implement later as enhancement

---

### Option 3: Keep All Events on Dashboard
**Pros**: No new page needed  
**Cons**: Dashboard becomes cluttered, doesn't solve the problem

**Verdict**: ❌ Rejected - Defeats the purpose

---

## User Experience Flow

### Scenario 1: Student Checks Recent Events
1. Login → Dashboard
2. See "Upcoming Events" section
3. Shows only last week's events (max 5)
4. Click event card → Details modal opens
5. Register for event (if upcoming and not past)

### Scenario 2: Student Browses Past Events
1. Dashboard → Click "View All Past Events" button
2. Navigate to Events Archive page
3. See all past events in grid (20 per page)
4. Use filters to find specific event
5. Click event → Details modal
6. Can see registration count, event details

### Scenario 3: Student Searches for Specific Past Event
1. Events Archive page
2. Type "Workshop" in search box
3. Filter by Year: 2025
4. Filter by Type: Workshop
5. See filtered results
6. Click event to view details

---

## Database Considerations

### No Schema Changes Needed ✅

The `events` table already has everything we need:
- ✅ `date` field - For date filtering
- ✅ `is_active` field - For hiding/showing events
- ✅ `event_type` field - For type filtering
- ✅ All event details - title, description, location, etc.

### Performance Optimization

**Indexes Already Exist**:
```sql
CREATE INDEX idx_events_date ON events(date);
```

**Additional Index Recommended**:
```sql
CREATE INDEX idx_events_date_active ON events(date, is_active);
```

This composite index will speed up queries like:
```sql
WHERE is_active = true AND date < today
```

**Migration File**: `backend/migrations/009_add_events_composite_index.sql`

---

## Testing Checklist

### Dashboard Tests
- [ ] Dashboard shows only events from last 7 days
- [ ] Dashboard shows max 5 events
- [ ] "View Past Events" button appears and works
- [ ] Events are sorted by date (ascending)
- [ ] Event cards are clickable
- [ ] Details modal opens correctly

### Archive Page Tests
- [ ] Page loads all past events
- [ ] Pagination works (20 per page)
- [ ] Search filter works
- [ ] Year filter works
- [ ] Month filter works
- [ ] Type filter works
- [ ] Multiple filters work together
- [ ] Clear filters button works
- [ ] Empty state shows when no results
- [ ] Event cards are clickable
- [ ] Details modal works

### API Tests
- [ ] GET /api/events/past returns correct data
- [ ] Pagination parameters work
- [ ] Search parameter works
- [ ] Year/month filters work
- [ ] Type filter works
- [ ] Response includes correct count

### Performance Tests
- [ ] Page loads in < 2 seconds
- [ ] Filters respond in < 500ms
- [ ] No memory leaks with pagination
- [ ] Mobile responsive

---

## Timeline Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Update dashboard events display | 30 min |
| 2 | Enhance backend API endpoint | 1 hour |
| 3 | Create events archive page | 3 hours |
| 4 | Update navigation | 30 min |
| 5 | Testing & bug fixes | 1 hour |
| 6 | Documentation | 30 min |

**Total Estimated Time**: 6.5 hours

---

## Future Enhancements

### Phase 2 (Later):
1. **Event Statistics** - Show attendee count, registration stats
2. **Event Categories** - Group events by category (academic, social, sports)
3. **Event Calendar View** - Calendar interface for browsing
4. **Export to Calendar** - iCal/Google Calendar export
5. **Event Sharing** - Share event links on social media
6. **Event Comments** - Let students comment on past events
7. **Photo Galleries** - Upload event photos after event ends

---

## Security Considerations

### Access Control
- ✅ Past events are public (visible to all students)
- ✅ Event details modal already implements authentication check
- ✅ Registration requires authentication

### Data Validation
- ✅ Filter parameters sanitized on backend
- ✅ SQL injection prevented by Supabase parameterized queries
- ✅ XSS prevented by HTML escaping

---

## Mobile Responsiveness

### Breakpoints:
- **< 576px**: 1 event card per row
- **576px - 768px**: 2 event cards per row
- **> 768px**: 3 event cards per row

### Filter UI Mobile:
- Stack filters vertically on mobile
- Collapsible filter section
- Fixed "Apply Filters" button at bottom

---

## Accessibility

### WCAG 2.1 Compliance:
- ✅ Keyboard navigation for event cards
- ✅ ARIA labels for filters
- ✅ Focus indicators on interactive elements
- ✅ Screen reader announcements for filter changes
- ✅ Pagination keyboard accessible
- ✅ Modal keyboard trappable

---

## Documentation Deliverables

1. ✅ This planning document
2. Implementation guide for developers
3. User guide for students
4. API documentation update
5. Testing procedures document

---

## Summary

### What We're Building:
- ✅ **Dashboard**: Shows last 7 days of events only
- ✅ **Archive Page**: Dedicated page for browsing all past events
- ✅ **Filters**: Search, year, month, type filters
- ✅ **Pagination**: 20 events per page
- ✅ **Navigation**: Easy access from dashboard

### Why This Approach:
- ✅ **Clean Dashboard**: Not cluttered with old events
- ✅ **Discoverability**: Students can still find past events
- ✅ **Performance**: Pagination prevents loading hundreds of events
- ✅ **Usability**: Filters make it easy to find specific events
- ✅ **Maintainability**: Backend API already mostly implemented

### Key Benefits:
1. Better user experience (focused dashboard)
2. Event history preservation
3. Easy event discovery
4. Scalable (works with thousands of events)
5. Mobile-friendly
6. Fast implementation (backend mostly ready)

---

**Ready for Implementation**: YES ✅

**Approval Needed From**: Product Owner / NACOS Leadership

**Next Step**: Get approval, then start Phase 1 implementation

