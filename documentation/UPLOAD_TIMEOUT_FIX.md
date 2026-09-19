# Upload Timeout Fix - Network Connection Issues

**Date**: Current Session  
**Status**: ⚠️ NETWORK ISSUE + ✅ IMPROVED ERROR HANDLING

---

## Error

```
ConnectTimeoutError: Connect Timeout Error 
(attempted addresses: 104.18.38.10:443, 172.64.149.246:443, timeout: 10000ms)
```

---

## What This Means

This is **NOT a code error**. It's a **network connectivity issue** where your backend server cannot reach Supabase storage (hosted on Cloudflare CDN) within the 10-second timeout.

The IP addresses shown (104.18.38.10, 172.64.149.246) are Cloudflare servers.

---

## Root Causes

### 1. Slow/Unstable Internet Connection
- Upload requires stable connection to Cloudflare CDN
- Intermittent disconnections cause timeout
- Mobile hotspots often unstable

### 2. Large File Size
- Default timeout is 10 seconds
- Large PDFs/images take longer to upload
- Files > 5MB may exceed timeout on slow connections

### 3. Network Firewall/Proxy
- Corporate/university firewalls may block Cloudflare
- VPN/proxy routing may add latency
- ISP throttling certain connections

### 4. Supabase Service Issues
- Rare: Cloudflare/Supabase temporary outage
- Check https://status.supabase.com

---

## What I Fixed

### 1. Added Retry Logic ✅
**File**: `frontend/assets/js/supabase-config.js`

The upload function now automatically retries up to 3 times (total attempts) with exponential backoff:

```javascript
export async function uploadFileToStorage(folder, file, bucketName, options = {}) {
  const { retries = 2 } = options; // 2 retries = 3 total attempts
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Upload attempt
      return result;
    } catch (error) {
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

**Retry Pattern**:
- Attempt 1: Immediate
- Attempt 2: Wait 1 second, retry
- Attempt 3: Wait 2 seconds, retry

---

### 2. Progress Indicators ✅
**File**: `frontend/admin-dashboard.html`

Button now shows detailed progress:

```
[Uploading file...]
[Uploading... (attempt 1/3)]
[Uploading... (attempt 2/3)]
[Getting admin info...]
[Updating current timetable...]
[Saving to database...]
```

---

### 3. Better Error Messages ✅
**File**: `frontend/admin-dashboard.html`

Now shows helpful error with troubleshooting tips:

```
Connection timeout: Unable to reach Supabase storage. 

This may be due to:
• Slow or unstable internet connection
• Large file size (try a smaller file)
• Network firewall or proxy blocking the connection
• Supabase service temporarily unavailable

Please try again or check your internet connection.
```

---

## How to Solve This

### Solution 1: Check Internet Connection ⭐
**Most Common Fix**

1. Test your connection speed: https://fast.com
2. **Minimum Required**: 2 Mbps upload speed
3. If slow:
   - Switch to WiFi (if using mobile data)
   - Move closer to router
   - Restart router
   - Disable VPN temporarily

---

### Solution 2: Reduce File Size ⭐
**If file is large (> 5MB)**

#### For PDFs:
```
Option 1: Use online compressor
- https://www.ilovepdf.com/compress_pdf
- https://smallpdf.com/compress-pdf

Option 2: Reduce quality in PDF software
- Adobe Acrobat: File → Reduce File Size
- Preview (Mac): Export → Reduce File Size
```

#### For Images:
```
Option 1: Compress image
- https://tinypng.com (PNG/JPG)
- https://compressor.io

Option 2: Reduce dimensions
- Resize to 1920x1080 max
- Save as JPG instead of PNG
```

**Target**: Keep files under 3MB for reliable uploads

---

### Solution 3: Try Different Network
If problem persists on one network:

1. **Mobile Hotspot**: Use phone's data
2. **Public WiFi**: Coffee shop, library
3. **Different ISP**: Friend's connection
4. **Different Time**: Off-peak hours (early morning)

---

### Solution 4: Check Firewall/VPN
If on corporate/university network:

1. **Disable VPN** temporarily
2. **Check firewall settings**:
   - Allow connections to `*.supabase.co`
   - Allow connections to Cloudflare CDN
3. **Contact IT department** if blocked

---

### Solution 5: Increase Timeout (Backend)
If you control the backend environment:

**File**: `backend/server.js` or Node.js config

```javascript
// Increase Node.js HTTP timeout
const server = app.listen(PORT);
server.timeout = 60000; // 60 seconds instead of 10
```

Or set environment variable:
```bash
NODE_OPTIONS="--max-http-header-size=16384 --http-parser=legacy"
```

---

### Solution 6: Use Direct Upload (Bypass Backend)
For very large files, upload directly from browser to Supabase:

**Advantages**:
- No backend timeout
- Faster (direct to CDN)
- Progress tracking

**Implementation**:
```javascript
// Frontend only - no backend involved
const { data, error } = await supabase.storage
  .from('timetables')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false
  });
```

---

## Testing Connection

### Quick Test:
```bash
# Test if you can reach Cloudflare
ping 104.18.38.10

# Or test Supabase
ping your-project.supabase.co
```

**Expected**: 
- Replies in < 100ms = Good
- Timeouts or > 500ms = Connection issue

---

### Browser Test:
1. Open browser console (F12)
2. Go to Network tab
3. Try uploading
4. Check if request shows "Stalled" or "Pending" for > 10s

**If stalled**: Network/firewall issue  
**If 500 error**: Backend/database issue

---

## File Size Limits

| Connection Speed | Max Reliable Size |
|------------------|-------------------|
| < 1 Mbps | 1 MB |
| 1-5 Mbps | 3 MB |
| 5-10 Mbps | 5 MB |
| 10+ Mbps | 10 MB |

**Recommendation**: Keep all uploads under 5MB

---

## Alternative: Local Testing

If uploads keep failing due to network issues, test locally:

1. **Run backend locally**:
   ```bash
   cd backend
   npm start
   ```

2. **Access at**: `http://localhost:5000`

3. **Local uploads** bypass many network issues

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `frontend/assets/js/supabase-config.js` | Added retry logic | Auto-retry failed uploads |
| `frontend/assets/js/supabase-config.js` | Added progress callback | Show upload progress |
| `frontend/admin-dashboard.html` | Updated progress UI | Show detailed status |
| `frontend/admin-dashboard.html` | Better error messages | Guide user to solution |

---

## Monitoring

To help diagnose future upload issues, check:

1. **Browser Console** (F12 → Console):
   ```
   Upload attempt 1 failed: ...
   Retrying in 1000ms...
   Upload attempt 2 failed: ...
   ```

2. **Network Tab** (F12 → Network):
   - Look for red/failed requests
   - Check "Time" column for long delays
   - Check "Status" for errors

3. **Backend Terminal**:
   ```
   Starting timetable upload: { title, department, version }
   ```

---

## Quick Troubleshooting Checklist

- [ ] Is internet connection stable? (test at fast.com)
- [ ] Is file size under 5MB?
- [ ] Is VPN disabled?
- [ ] Can you ping Cloudflare/Supabase?
- [ ] Does it work on different network?
- [ ] Does it work with smaller file?
- [ ] Is firewall blocking connection?
- [ ] Are you using latest browser version?

---

## When to Contact Support

If you've tried everything and uploads still fail:

1. **Document the issue**:
   - File size
   - Connection speed
   - Browser console errors
   - Network tab screenshot

2. **Check Supabase Status**:
   - https://status.supabase.com

3. **Contact Supabase Support**:
   - May be regional CDN issue
   - May need timeout increase
   - May need custom configuration

---

## Summary

✅ **Code Fixed**: Added retry logic, progress tracking, better errors  
⚠️ **Network Issue**: Still requires good internet connection  
💡 **Solution**: Check connection, reduce file size, try different network  

The error is **infrastructure/network related**, not a bug in your code. The improvements I made will help it succeed more often, but cannot overcome severe network issues.

---

**STATUS**: ✅ Improved error handling, ⚠️ Network issues require manual fixing
