# Audit Logs Feature - Complete Documentation

## Overview
Comprehensive audit logging system that tracks all system activities, user actions, and admin operations with advanced filtering, sorting, and export capabilities.

## Features

### 1. **Comprehensive Logging**
- User authentication (login/logout)
- Student registration and approvals
- Resource management (create/update/delete)
- Payment submissions and verifications
- Timetable operations
- Event management
- Admin actions
- API requests with response times
- Failed operations and errors

### 2. **Advanced Filtering**
- **Search**: Full-text search across action types and user emails
- **Action Type**: Filter by specific action categories
- **Date Range**: Start and end date filters
- **User Email**: Filter by specific user
- **IP Address**: Track actions from specific IPs
- **Results Per Page**: 25, 50, 100, or 200 logs per page

### 3. **Flexible Sorting**
- Sort by Timestamp (newest/oldest)
- Sort by Action Type (A-Z or Z-A)
- Sort by User (alphabetically)
- Toggle between ascending and descending

### 4. **Statistics Dashboard**
- Total Logs count
- Unique Users count
- Today's activity
- This week's activity
- Top 10 most common actions

### 5. **Detailed Log View**
Each log entry contains:
- Unique log ID
- Action performed
- Timestamp (with timezone)
- User ID and email
- IP address
- User agent (browser/device)
- Additional context details (JSON)
- Response time and status code

### 6. **Export Functionality**
- Export filtered logs to CSV
- Up to 1000 logs per export
- Preserves all filters and sorting
- Includes all log details in structured format

## Technical Implementation

### Backend API Endpoints

#### 1. GET `/api/audit-logs`
Fetch audit logs with filtering and pagination.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 50, max: 200) - Results per page
- `action` - Filter by action type
- `user_email` - Filter by user email (partial match)
- `user_id` - Filter by exact user ID
- `ip_address` - Filter by IP address
- `start_date` - Start date (ISO format)
- `end_date` - End date (ISO format)
- `search` - Search across action and email
- `sort` - Sort field and order (e.g., `timestamp-desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "action": "user_login",
        "user_id": "uuid",
        "user_email": "user@tau.edu.ng",
        "timestamp": "2026-08-04T12:00:00Z",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "details": {
          "method": "password",
          "responseTime": 245
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1234,
      "totalPages": 25,
      "hasMore": true
    }
  }
}
```

#### 2. GET `/api/audit-logs/stats`
Get audit log statistics.

**Query Parameters:**
- `start_date` - Optional start date for stats
- `end_date` - Optional end date for stats

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLogs": 5432,
    "uniqueUsers": 234,
    "actionBreakdown": {
      "user_login": 1234,
      "student_registration": 456,
      "resource_created": 123
    },
    "topActions": [
      { "action": "user_login", "count": 1234 },
      { "action": "auto_GET_api_resources", "count": 987 }
    ]
  }
}
```

#### 3. GET `/api/audit-logs/actions`
Get list of unique action types for filter dropdown.

**Response:**
```json
{
  "success": true,
  "data": [
    "admin_login",
    "student_registration",
    "user_login",
    "resource_created"
  ]
}
```

### Database Schema

**Table: `audit_logs`**
```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  user_id UUID REFERENCES students(id),
  admin_id UUID REFERENCES admin_users(id),
  user_email TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  
  -- Indexes for performance
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_admin_id (admin_id),
  INDEX idx_audit_logs_timestamp (timestamp),
  INDEX idx_audit_logs_entity_type (entity_type),
  INDEX idx_audit_logs_entity_id (entity_id)
);
```

### Automatic Logging

The audit middleware (`backend/middleware/audit.js`) automatically logs:

1. **All API requests** with 2xx-4xx status codes
2. **Request details**: method, path, query params, body (with secrets redacted)
3. **Response details**: status code, response time
4. **User context**: user ID, email, IP, user agent

**Automatic logging exclusions:**
- Health checks (`/api/health`)
- Static files (`/assets`, `/vendor`)
- GET requests for non-admin endpoints (to reduce noise)
- Actions explicitly logged elsewhere (to avoid duplicates)

### Manual Logging

For critical actions, use explicit logging:

```javascript
const { auditLog } = require('../middleware/audit');

await auditLog({
  action: 'student_approve',
  userId: adminUser.id,
  userEmail: adminUser.email,
  details: {
    studentId: student.id,
    studentEmail: student.email,
    approvalReason: 'Verified credentials'
  },
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

## Frontend Features

### Page Components

1. **Statistics Cards** - Real-time overview of log metrics
2. **Advanced Filters** - Multi-criteria filtering with reset
3. **Sortable Table** - Click headers to sort columns
4. **Details Modal** - Full log details in popup
5. **Pagination** - Navigate through large result sets
6. **Export Button** - Download filtered logs as CSV

### Responsive Design
- Mobile-friendly responsive layout
- Adjusts table font size on small screens
- Collapsible filter sections
- Touch-friendly buttons and controls

### User Experience
- **Real-time filtering** - Apply filters with one click
- **Keyboard shortcuts** - Press Enter to apply filters
- **Visual feedback** - Loading spinners and empty states
- **Color-coded badges** - Different colors for action types
- **Reset filters** - Quick reset to default view

## Security

### Access Control
- **Admin-only access** - All endpoints require admin authentication
- **JWT validation** - Bearer token required in Authorization header
- **RLS policies** - Database-level security (no anon access)

### Data Protection
- **Secret redaction** - Passwords, tokens, proofs never logged
- **User agent logging** - Track suspicious activity patterns
- **IP logging** - Identify location and anomalies

### Privacy Compliance
- Logs contain only necessary information
- Personal data (passwords, tokens) are redacted
- Configurable retention policies (can be added)

## Usage Guide

### For Administrators

1. **Navigate to Audit Logs**
   - Click "Audit Logs" in admin dashboard navigation

2. **View Recent Activity**
   - Latest logs displayed by default
   - Stats cards show overview metrics

3. **Filter Logs**
   - Use search box for quick lookup
   - Select specific action types
   - Set date ranges for time periods
   - Filter by user email or IP address

4. **Sort Results**
   - Click column headers to sort
   - Toggle between ascending/descending

5. **View Details**
   - Click "View" button for full log details
   - See JSON context in formatted view

6. **Export Data**
   - Click "Export CSV" button
   - Downloads filtered results as CSV file
   - Opens in Excel or Google Sheets

### Common Use Cases

#### 1. Track User Login Activity
- Filter: Action = "user_login"
- Sort: Timestamp descending
- Shows recent logins with IP and device

#### 2. Monitor Admin Actions
- Search: "admin"
- Shows all admin operations
- Useful for accountability and compliance

#### 3. Debug Issues
- Filter: User Email = problematic user
- Date Range: When issue occurred
- Shows complete activity timeline

#### 4. Security Audit
- Filter: IP Address = suspicious IP
- Shows all actions from that IP
- Identify unauthorized access attempts

#### 5. Generate Reports
- Set date range for report period
- Select relevant action types
- Export to CSV for analysis

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Pagination to limit result sets
- Efficient JSONB queries for details field

### Frontend Optimization
- Lazy loading of logs
- Client-side pagination state
- Debounced search inputs (can be added)
- Minimal re-renders

### Best Practices
- Limit results per page (default: 50)
- Use date ranges for large datasets
- Export in batches for very large exports
- Regular cleanup of old logs (can be automated)

## Future Enhancements

### Potential Additions
1. **Real-time updates** - WebSocket for live log streaming
2. **Advanced analytics** - Charts and graphs for trends
3. **Automated alerts** - Email notifications for suspicious activity
4. **Log retention policies** - Auto-delete old logs after X days
5. **Enhanced search** - Full-text search with highlighting
6. **Favorites** - Save common filter combinations
7. **Scheduled exports** - Automated daily/weekly CSV exports
8. **Anomaly detection** - ML-based suspicious activity detection

## Testing

### Manual Testing Checklist
- [ ] Load audit logs page
- [ ] Verify statistics display correctly
- [ ] Apply each filter type individually
- [ ] Test sorting on each column
- [ ] View log details modal
- [ ] Export logs to CSV
- [ ] Test pagination navigation
- [ ] Reset filters functionality
- [ ] Test with different screen sizes

### Test Data Generation
```javascript
// Generate test audit logs
const actions = ['user_login', 'student_registration', 'resource_created'];
for (let i = 0; i < 100; i++) {
  await auditLog({
    action: actions[i % actions.length],
    userId: 'test-user-id',
    userEmail: `test${i}@tau.edu.ng`,
    details: { test: true, iteration: i },
    ip: `192.168.1.${i % 255}`,
    userAgent: 'Test User Agent'
  });
}
```

## Troubleshooting

### Common Issues

**Issue**: Logs not loading
- **Solution**: Check admin authentication token, verify backend is running

**Issue**: Filters not working
- **Solution**: Ensure correct date format (YYYY-MM-DD), check API connectivity

**Issue**: Export fails
- **Solution**: Reduce date range, check browser console for errors

**Issue**: Slow performance
- **Solution**: Reduce results per page, use date filters to narrow results

## Deployment

### Backend Deployment
1. Ensure `audit_logs` table exists in database
2. Run migration 003 if needed to add columns
3. Deploy `backend/routes/auditLogs.js`
4. Update `backend/server.js` to include audit logs route
5. Restart backend server

### Frontend Deployment
1. Upload `admin-audit-logs.html` to frontend
2. Update navigation links in admin dashboard
3. Deploy to Netlify
4. Test with production backend URL

### Environment Variables
No additional environment variables needed. Uses existing:
- `API_URL` - Backend API URL
- JWT authentication (existing setup)

## Conclusion

The audit logs feature provides comprehensive system monitoring and accountability for the NACOS platform. Administrators can track all activities, investigate issues, ensure compliance, and maintain system security with powerful filtering, sorting, and export capabilities.
