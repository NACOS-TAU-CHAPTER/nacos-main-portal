# FEATURE - Edit Event

**Date**: August 3, 2026  
**Status**: ✅ COMPLETE - Edit button added

---

## ✅ What Was Added

### Edit Button in Events Table
Added pencil icon button next to delete button in the events list.

**Location**: admin-dashboard.html (line ~1516)

```html
<button class="btn btn-sm btn-outline-primary me-1" onclick="editEvent('${ev.id}')">
  <i class="bi bi-pencil"></i>
</button>
```

---

## 🎯 How to Use

### Step 1: Go to Events Section
1. Open admin dashboard
2. Click "Events" in sidebar
3. See list of all events

### Step 2: Click Edit Button
1. Find the event you want to edit
2. Click the **blue pencil icon** button
3. Edit modal will open with event details

### Step 3: Make Changes
You can edit:
- ✏️ Event Title
- ✏️ Event Type (General, Workshop, Seminar, Social)
- ✏️ Description
- ✏️ Date (⚠️ **Use future date to show on student dashboard**)
- ✏️ Time
- ✏️ Location
- ✏️ Max Attendees
- ✏️ Requires Payment (Yes/No)
- ✏️ Payment Amount (₦)
- ✏️ Payment Details
- ✏️ Event Status (Active/Inactive)
- ✏️ Image URL

### Step 4: Save
1. Click "Save Changes" button
2. Wait for success message
3. Event table refreshes automatically

---

## 📋 Events Table Layout

```
┌──────────────┬──────────┬────────┬───────────┬────────┬─────────────┐
│ Event        │ Date     │ Fee    │ Attendees │ Status │ Actions     │
├──────────────┼──────────┼────────┼───────────┼────────┼─────────────┤
│ [IMG] Title  │ Aug 5    │ ₦500   │ 10 / 50   │ Active │ [✏️] [🗑️]  │
│ [IMG] Title  │ Aug 10   │ Free   │ 5         │ Active │ [✏️] [🗑️]  │
└──────────────┴──────────┴────────┴───────────┴────────┴─────────────┘
           Edit button ─────────────────────────┘
```

---

## 🔧 Technical Details

### Components Involved

1. **Edit Button** (line ~1516)
   - Calls `editEvent(id)` function
   - Blue outline button with pencil icon

2. **editEvent Function** (line 1522)
   - Loads event data from database
   - Populates modal form fields
   - Shows edit modal

3. **Edit Form Handler** (line 1557)
   - Captures form submission
   - Validates and prepares data
   - Calls `apiAdmin.update('events', id, data)`
   - Logs admin action
   - Refreshes table

4. **Edit Modal** (line 776)
   - Bootstrap modal with form
   - All event fields
   - Save/Cancel buttons

---

## 🎨 Visual Flow

```
User clicks Edit [✏️]
        ↓
editEvent(id) function runs
        ↓
Fetch event from database
        ↓
Populate form fields
        ↓
Show edit modal
        ↓
User makes changes
        ↓
User clicks "Save Changes"
        ↓
Form submit handler runs
        ↓
Validate data
        ↓
Call apiAdmin.update()
        ↓
Log admin action
        ↓
Show success message
        ↓
Close modal
        ↓
Refresh events table
```

---

## 💡 Use Cases

### Use Case 1: Fix Event Date
**Scenario**: Event created with past date, not showing on student dashboard

**Solution**:
1. Click edit on event
2. Change date to future date
3. Save
4. Event now appears on student dashboard

### Use Case 2: Update Event Details
**Scenario**: Event location or time changed

**Solution**:
1. Click edit
2. Update location and/or time
3. Save
4. Students see updated information

### Use Case 3: Change Payment Amount
**Scenario**: Event fee changed

**Solution**:
1. Click edit
2. Change "Amount" field
3. Save
4. New fee is displayed

### Use Case 4: Deactivate Event
**Scenario**: Event cancelled but don't want to delete

**Solution**:
1. Click edit
2. Change "Event Status" to "Inactive"
3. Save
4. Event hidden from student dashboard

### Use Case 5: Update Image
**Scenario**: Better event image available

**Solution**:
1. Click edit
2. Update "Event Image URL"
3. Save
4. New image displays

---

## ⚠️ Important Notes

### Date Filter on Student Dashboard
Remember: Student dashboard **only shows events with future dates** (today or later).

If you edit an event:
- ✅ Set date to today or future → Will show on student dashboard
- ❌ Set date to past → Won't show on student dashboard

### Event Status
- **Active** = Shows on student dashboard (if date is future)
- **Inactive** = Hidden from student dashboard (even if date is future)

### Payment Fields
- If "Requires Payment" = No → Payment amount is ignored
- If "Requires Payment" = Yes → Should set payment amount

---

## 🐛 Troubleshooting

### Edit Button Not Showing
**Issue**: Only delete button visible  
**Cause**: Page needs refresh  
**Fix**: Refresh browser (Ctrl+R or F5)

### Modal Doesn't Open
**Issue**: Click edit but nothing happens  
**Cause**: JavaScript error  
**Fix**: Check browser console (F12) for errors

### Changes Not Saving
**Issue**: Click save but event doesn't update  
**Cause**: Validation error or API error  
**Fix**: Check console for error messages

### Event Still Not Showing on Student Dashboard
**Issue**: Edited event date but still doesn't show  
**Cause**: Date still in past OR event is inactive  
**Fix**: 
1. Verify date is today or future
2. Verify "Event Status" is "Active"
3. Refresh student dashboard

---

## 📊 Comparison: Add vs Edit

| Feature | Add Event | Edit Event |
|---------|-----------|------------|
| **Access** | "Add New" button | Pencil icon on event row |
| **Modal** | addEventModal | editEventModal |
| **Form** | Empty fields | Pre-filled with event data |
| **Submit** | Creates new event | Updates existing event |
| **API** | POST /api/admin/events | PUT /api/admin/events/:id |
| **Result** | New event in table | Same event updated |

---

## 🔄 Backend API Used

### Update Event Endpoint
```
PUT /api/admin/events/:id
```

**Handled by**: `backend/routes/admin.js`  
**Function**: `apiAdmin.update('events', id, data)`

**Request body**:
```javascript
{
  title: "Updated Title",
  description: "Updated description",
  date: "2026-08-10",
  time: "14:00",
  location: "Main Hall",
  // ... other fields
  updated_at: "2026-08-03T12:00:00.000Z"
}
```

**Response**:
```javascript
{
  success: true,
  data: { /* updated event */ }
}
```

---

## ✅ Testing Checklist

- [x] Edit button appears in events table
- [x] Edit button has blue outline
- [x] Clicking edit opens modal
- [x] Modal shows event details
- [x] All fields are editable
- [x] Saving updates event in database
- [x] Event table refreshes after save
- [x] Success message appears
- [x] Modal closes after save
- [x] Admin action is logged

---

## 🎉 Summary

**Feature**: Edit Event  
**Status**: ✅ Fully functional  
**Added**: Edit button (pencil icon) in events table  
**How to use**: Click pencil icon → Edit fields → Save

**Key benefit**: Can now update event details without deleting and recreating

**Most common use**: Fixing event date to make it show on student dashboard
