# Events API - Past Events Endpoint Documentation

**Endpoint**: `GET /api/events/past`  
**Authentication**: Not required (public)  
**Version**: Enhanced v2 (August 4, 2026)

---

## Overview

Retrieves past events with support for search, filtering, and pagination. This endpoint is designed for the Events Archive page.

---

## Request

### Method & URL

```
GET /api/events/past
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-based) |
| `limit` | integer | No | 20 | Results per page (max: 100) |
| `search` | string | No | - | Search term (matches title or description) |
| `year` | integer | No | - | Filter by year (e.g., 2026) |
| `month` | integer | No | - | Filter by month (1-12, requires year) |
| `type` | string | No | - | Filter by event type |

### Example Requests

**Basic Request (Default)**:
```
GET /api/events/past
```

**With Pagination**:
```
GET /api/events/past?page=2&limit=20
```

**Search Events**:
```
GET /api/events/past?search=workshop
```

**Filter by Year**:
```
GET /api/events/past?year=2026
```

**Filter by Month and Year**:
```
GET /api/events/past?year=2026&month=7
```

**Filter by Type**:
```
GET /api/events/past?type=seminar
```

**Combined Filters**:
```
GET /api/events/past?search=tech&year=2026&month=8&type=workshop&page=1&limit=20
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Tech Workshop",
        "description": "Learn about AI and Machine Learning",
        "date": "2026-08-01",
        "time": "14:00:00",
        "location": "Main Auditorium",
        "image_url": "https://example.com/image.jpg",
        "event_type": "workshop",
        "requires_payment": false,
        "payment_amount": 0,
        "max_attendees": 100,
        "is_active": true,
        "created_by": "uuid-of-creator",
        "created_at": "2026-07-15T10:00:00Z",
        "updated_at": "2026-07-15T10:00:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "Coding Seminar",
        "description": "Python programming basics",
        "date": "2026-07-28",
        "time": "10:00:00",
        "location": "Computer Lab 1",
        "image_url": null,
        "event_type": "seminar",
        "requires_payment": true,
        "payment_amount": 500,
        "max_attendees": 50,
        "is_active": true,
        "created_by": "uuid-of-creator",
        "created_at": "2026-07-10T12:00:00Z",
        "updated_at": "2026-07-10T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasMore": true,
      "showing": 20
    }
  },
  "message": "Past events retrieved successfully"
}
```

### Response Fields

#### Events Array

Each event object contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique event identifier |
| `title` | string | Event title |
| `description` | string | Event description (nullable) |
| `date` | date | Event date (YYYY-MM-DD) |
| `time` | time | Event time (HH:MM:SS, nullable) |
| `location` | string | Event location (nullable) |
| `image_url` | string | Event banner image URL (nullable) |
| `event_type` | string | Type of event (nullable) |
| `requires_payment` | boolean | Whether payment is required |
| `payment_amount` | decimal | Payment amount if required |
| `max_attendees` | integer | Maximum attendees (nullable) |
| `is_active` | boolean | Whether event is active |
| `created_by` | UUID | Creator user ID (nullable) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

#### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | Current page number |
| `limit` | integer | Results per page |
| `total` | integer | Total number of events |
| `totalPages` | integer | Total number of pages |
| `hasMore` | boolean | Whether more pages exist |
| `showing` | integer | Number of events in current response |

---

### Empty Result (200 OK)

When no events match the filters:

```json
{
  "success": true,
  "data": {
    "events": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0,
      "hasMore": false,
      "showing": 0
    }
  },
  "message": "Past events retrieved successfully"
}
```

---

### Error Response (500)

```json
{
  "success": false,
  "message": "Failed to fetch past events",
  "error": {
    "message": "Database connection error"
  }
}
```

---

## Filter Behavior

### Search Filter

- **Case-insensitive**
- **Searches in**: `title` and `description` fields
- **Uses**: PostgreSQL `ILIKE` operator
- **Example**: `search=workshop` matches "Workshop", "WORKSHOP", "Tech Workshop"

### Year Filter

- **Format**: Integer (e.g., 2026)
- **Range**: January 1 to December 31 of specified year
- **Example**: `year=2026` returns events from `2026-01-01` to `2026-12-31`

### Month Filter

- **Format**: Integer (1-12)
- **Requires**: `year` parameter must be present
- **Handles**: Variable month lengths (28-31 days)
- **Example**: `year=2026&month=2` returns events from `2026-02-01` to `2026-02-28`

### Type Filter

- **Case-sensitive**
- **Exact match** on `event_type` field
- **Common types**: `seminar`, `workshop`, `competition`, `social`, `conference`
- **Example**: `type=workshop` matches only events with `event_type = 'workshop'`

### Combined Filters

All filters are applied with **AND** logic:

```
GET /api/events/past?search=tech&year=2026&type=workshop

Returns: Events that are:
  - Past (date < today)
  - AND (title LIKE '%tech%' OR description LIKE '%tech%')
  - AND date between 2026-01-01 and 2026-12-31
  - AND event_type = 'workshop'
```

---

## Pagination

### How It Works

- **Page Numbers**: 1-based (first page is 1, not 0)
- **Default Page Size**: 20 events
- **Maximum Page Size**: 100 events (enforced)
- **Offset Calculation**: `offset = (page - 1) * limit`

### Example

With 45 total events and `limit=20`:

**Page 1**:
- Shows events 1-20
- `hasMore: true`

**Page 2**:
- Shows events 21-40
- `hasMore: true`

**Page 3**:
- Shows events 41-45
- `hasMore: false`

---

## Sorting

Events are sorted by **date descending** (newest first):

```sql
ORDER BY date DESC
```

This means:
- August 2026 events appear before July 2026 events
- Events from same month are in descending order

---

## Performance

### Optimization

The endpoint uses database indexes:

```sql
-- Composite index for fast queries
CREATE INDEX idx_events_date_active ON events(date DESC, is_active);

-- Type filter index
CREATE INDEX idx_events_type ON events(event_type);
```

### Expected Response Times

| Dataset Size | Response Time |
|--------------|---------------|
| < 100 events | < 50ms |
| 100-1000 events | 50-150ms |
| > 1000 events | 150-300ms |

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Basic fetch
async function fetchPastEvents(page = 1) {
  const response = await fetch(`/api/events/past?page=${page}&limit=20`);
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message);
}

// With filters
async function searchEvents(filters) {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 20,
    ...(filters.search && { search: filters.search }),
    ...(filters.year && { year: filters.year }),
    ...(filters.month && { month: filters.month }),
    ...(filters.type && { type: filters.type })
  });

  const response = await fetch(`/api/events/past?${params}`);
  const result = await response.json();
  
  return result.data;
}

// Usage
const data = await searchEvents({
  page: 1,
  limit: 20,
  search: 'workshop',
  year: 2026,
  type: 'seminar'
});

console.log(`Found ${data.pagination.total} events`);
console.log(`Showing page ${data.pagination.page} of ${data.pagination.totalPages}`);
data.events.forEach(event => {
  console.log(`${event.title} - ${event.date}`);
});
```

### jQuery (AJAX)

```javascript
$.ajax({
  url: '/api/events/past',
  method: 'GET',
  data: {
    page: 2,
    limit: 20,
    search: 'tech',
    year: 2026
  },
  success: function(result) {
    if (result.success) {
      console.log('Events:', result.data.events);
      console.log('Total:', result.data.pagination.total);
    }
  },
  error: function(xhr) {
    console.error('Error:', xhr.responseJSON.message);
  }
});
```

### cURL

```bash
# Basic request
curl "http://localhost:5000/api/events/past"

# With filters
curl "http://localhost:5000/api/events/past?page=1&limit=20&search=workshop&year=2026&month=8&type=seminar"
```

---

## Rate Limiting

Currently, this endpoint has **no rate limiting**.

For production, consider implementing:
- **General users**: 100 requests/minute
- **Authenticated users**: 300 requests/minute

---

## Caching

Recommended caching strategy:
- **Cache Duration**: 5 minutes
- **Cache Key**: Include all query parameters
- **Invalidation**: When new event is created or updated

Example cache key:
```
events_past_page1_limit20_search_workshop_year2026
```

---

## Edge Cases

### Invalid Page Numbers

**Request**: `?page=0` or `?page=-1`  
**Behavior**: Treated as `page=1`

### Invalid Limit

**Request**: `?limit=999` (exceeds max)  
**Behavior**: Capped at 100

### Month Without Year

**Request**: `?month=8` (no year specified)  
**Behavior**: Month filter ignored, returns all past events

### Future Year

**Request**: `?year=2050` (future year)  
**Behavior**: Returns empty results (no past events in future)

### Special Characters in Search

**Request**: `?search=Tech & AI`  
**Behavior**: URL-encoded automatically, searches for "Tech & AI"

---

## Migration Notes

### Breaking Changes from v1

**v1 Endpoint** (old):
```
GET /api/events/past?limit=10
Response: Array of events
```

**v2 Endpoint** (new):
```
GET /api/events/past?page=1&limit=20
Response: Object with events array and pagination
```

### Backward Compatibility

To maintain compatibility:
1. Frontend should check if response is array or object
2. If object, use `result.data.events`
3. If array, use `result` directly

```javascript
const events = Array.isArray(result) 
  ? result 
  : result.data.events;
```

---

## Testing

### Test Cases

```bash
# Test 1: Basic pagination
curl "http://localhost:5000/api/events/past?page=1&limit=5"

# Test 2: Search
curl "http://localhost:5000/api/events/past?search=workshop"

# Test 3: Year filter
curl "http://localhost:5000/api/events/past?year=2026"

# Test 4: Month filter
curl "http://localhost:5000/api/events/past?year=2026&month=7"

# Test 5: Type filter
curl "http://localhost:5000/api/events/past?type=seminar"

# Test 6: Combined filters
curl "http://localhost:5000/api/events/past?search=tech&year=2026&type=workshop&page=1"

# Test 7: Empty result
curl "http://localhost:5000/api/events/past?year=1990"

# Test 8: Large page number
curl "http://localhost:5000/api/events/past?page=999"
```

### Expected Results

All tests should return:
- ✅ Status 200
- ✅ `success: true`
- ✅ Valid pagination object
- ✅ Events array (may be empty)

---

## Related Endpoints

### Get Single Event
```
GET /api/events/:id
Returns: Single event details
```

### Get Upcoming Events
```
GET /api/events/upcoming
Returns: Next 5 upcoming events
```

### Register for Event
```
POST /api/events/:id/register
Requires: Authentication
```

---

## Changelog

### Version 2.0 (August 4, 2026)
- ✅ Added pagination support
- ✅ Added search functionality
- ✅ Added year/month filters
- ✅ Added type filter
- ✅ Enhanced response structure
- ✅ Added performance indexes

### Version 1.0 (Initial)
- Basic past events list
- Simple limit parameter

---

## Support

For issues or questions:
- **Backend Team**: NACOS Backend Developers
- **Documentation**: See `/documentation/EVENTS_ARCHIVE_PLAN.md`
- **Migration**: See `/backend/migrations/009_add_events_composite_index.sql`

---

**Last Updated**: August 4, 2026  
**Endpoint Version**: 2.0  
**Status**: Production Ready ✅
