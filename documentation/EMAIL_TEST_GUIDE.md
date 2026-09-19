# Email Testing Guide

**Test Email**: `olufemi-abiodun.gbolahan@st.tau.edu.ng`  
**Date**: Current Session

---

## Quick Test (Recommended) ⭐

### Option 1: Run Test Script

1. **Open terminal in backend folder**:
   ```bash
   cd backend
   ```

2. **Run the test script**:
   ```bash
   node test-email.js
   ```

3. **Check output** for success/failure messages

4. **Check email inbox** at `olufemi-abiodun.gbolahan@st.tau.edu.ng`
   - Check INBOX
   - Check SPAM/JUNK folder

---

## What the Test Does

The test script sends **3 emails** to verify different parts of the system:

### Test 1: Simple Test Email
- Plain test message
- Verifies basic Resend configuration
- Tests single recipient sending

### Test 2: Event Notification
- Uses the event template
- Tests HTML formatting
- Simulates "New Event" notification

### Test 3: Resource Notification
- Uses the resource template
- Tests different email type
- Simulates "New Resource" notification

---

## Expected Output

```
╔════════════════════════════════════════════════════════╗
║          NACOS EMAIL SYSTEM TEST SUITE                ║
╚════════════════════════════════════════════════════════╝

📋 Configuration:
   RESEND_API_KEY: ✅ Set
   EMAIL_FROM: nacos@tau.edu.ng
   TEST_EMAIL: olufemi-abiodun.gbolahan@st.tau.edu.ng

==========================================
TEST 1: Single Email
==========================================

📧 Sending test email to: olufemi-abiodun.gbolahan@st.tau.edu.ng
✅ SUCCESS! Email sent successfully
📊 Result: {
  "success": true,
  "data": { ... }
}
📬 Check inbox at: olufemi-abiodun.gbolahan@st.tau.edu.ng

==========================================
TEST 2: Event Notification Template
==========================================

📧 Sending event notification to: olufemi-abiodun.gbolahan@st.tau.edu.ng
✅ SUCCESS! Event email sent

==========================================
TEST 3: Resource Notification Template
==========================================

📧 Sending resource notification to: olufemi-abiodun.gbolahan@st.tau.edu.ng
✅ SUCCESS! Resource email sent

╔════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════╝

Test 1 - Single Email:        ✅ PASSED
Test 2 - Event Template:      ✅ PASSED
Test 3 - Resource Template:   ✅ PASSED

📊 Total: 3/3 tests passed

🎉 ALL TESTS PASSED! Email system is working perfectly!
📬 Check your inbox at: olufemi-abiodun.gbolahan@st.tau.edu.ng
```

---

## Alternative: Test via API Endpoint

### Option 2: Use the Admin Dashboard Endpoint

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Get admin authentication token**:
   - Login as admin via the admin dashboard
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for Authorization header in any API request
   - Copy the Bearer token

3. **Send test request**:

   **Using curl**:
   ```bash
   curl -X POST http://localhost:5000/api/admin/test-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
     -d "{\"testEmail\": \"olufemi-abiodun.gbolahan@st.tau.edu.ng\"}"
   ```

   **Using Postman**:
   - Method: POST
   - URL: `http://localhost:5000/api/admin/test-email`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_ADMIN_TOKEN`
   - Body (JSON):
     ```json
     {
       "testEmail": "olufemi-abiodun.gbolahan@st.tau.edu.ng"
     }
     ```

4. **Check response**:
   ```json
   {
     "success": true,
     "message": "Test email sent successfully",
     "result": {
       "success": true,
       "data": { ... }
     }
   }
   ```

---

## Option 3: Test via Real Action

### Create a Test Event

1. **Login to admin dashboard**
2. **Click "Add Event"**
3. Fill in:
   - Title: "Test Event"
   - Date: Any future date
   - Description: "Testing email system"
4. **Click "Create"**
5. **Check backend logs** for:
   ```
   ✅ Event created: [id]
   📧 Sending to X students
   ✅ Event notification sent to X students
   ```
6. **Check email** at `olufemi-abiodun.gbolahan@st.tau.edu.ng`

---

## Troubleshooting

### Issue 1: "RESEND_API_KEY not set"

**Error**:
```
⚠️  RESEND_API_KEY not set in .env file
```

**Solution**:
1. Check `backend/.env` file
2. Verify line exists:
   ```
   RESEND_API_KEY=re_AodBuUok_Nsa3jpEQgow2mHhwW7JFCfcE
   ```
3. Restart server after changing .env

---

### Issue 2: "Resend not initialized"

**Error**:
```
⚠️ Email not sent - Resend not initialized
```

**Solution**:
1. Check server startup logs for:
   ```
   ✅ Resend email provider initialized
   ```
2. If missing, check RESEND_API_KEY in .env
3. Restart server

---

### Issue 3: Email not arriving

**Possible causes**:
1. **In SPAM folder** - Check junk/spam
2. **Domain not verified** - nacos@tau.edu.ng must be verified in Resend
3. **Rate limit** - Wait 1 minute and try again
4. **Invalid recipient** - Check email address is correct

**Solution**:
1. Check SPAM/JUNK folder first
2. Check Resend dashboard:
   - Login to https://resend.com
   - Go to "Emails" tab
   - Check delivery status
3. Verify domain in Resend:
   - Go to "Domains" tab
   - Add and verify tau.edu.ng domain
   - Or use a verified sender email

---

### Issue 4: Domain verification needed

**Error in Resend**:
```
Domain not verified
```

**Solution**:

**Option A: Verify tau.edu.ng domain** (Recommended)
1. Login to Resend dashboard
2. Go to Domains → Add Domain
3. Add: `tau.edu.ng`
4. Add DNS records provided by Resend to your domain
5. Wait for verification (can take 24-48 hours)

**Option B: Use verified sender** (Quick test)
1. Change EMAIL_FROM in .env to a verified email
2. Example: Use your personal verified email temporarily
3. Update:
   ```env
   EMAIL_FROM=your-verified@email.com
   ```
4. Restart server and test again

---

## Checking Email Delivery

### In Resend Dashboard:

1. Login to https://resend.com
2. Go to "Emails" tab
3. You'll see:
   - ✅ **Delivered** - Email successfully sent
   - ⏳ **Pending** - Still processing
   - ❌ **Failed** - Error occurred

4. Click on email to see:
   - Recipient
   - Subject
   - Delivery time
   - Opens/clicks (if tracking enabled)
   - Error details (if failed)

---

## Success Indicators

### ✅ Email sent successfully when you see:

**In Terminal**:
```
✅ SUCCESS! Email sent successfully
📊 Result: { "success": true, ... }
```

**In Backend Logs**:
```
✅ Email sent to 1 recipient(s)
```

**In Resend Dashboard**:
```
Status: Delivered
```

**In Email Inbox**:
- Email appears in inbox or spam
- From: nacos@tau.edu.ng
- Subject matches test
- Email renders properly

---

## Test Email Content

You should receive **3 emails** if running full test:

### Email 1: Simple Test
```
Subject: ✅ NACOS Test Email - Single Recipient
Content: Basic test message with green header
```

### Email 2: Event Notification
```
Subject: 🎉 New Event: Tech Workshop - AI & ML
Content: Professional event announcement with date, time, location
```

### Email 3: Resource Notification
```
Subject: 📚 New Resource: Python Programming Tutorial
Content: Resource announcement with course and type
```

---

## Quick Checklist

Before running test:
- [ ] Backend server running (`npm start`)
- [ ] `.env` file has `RESEND_API_KEY`
- [ ] `.env` file has `EMAIL_FROM=nacos@tau.edu.ng`
- [ ] Terminal open in `backend/` folder

After running test:
- [ ] Check terminal for success messages
- [ ] Check email inbox
- [ ] Check SPAM/JUNK folder
- [ ] Check Resend dashboard for delivery status

---

## Files Involved

- `backend/test-email.js` - Test script
- `backend/services/email.js` - Email service
- `backend/routes/admin.js` - Admin test endpoint
- `backend/.env` - Configuration

---

## Summary

**Fastest Way to Test**:
```bash
cd backend
node test-email.js
```

**Expected Result**:
- 3 emails sent to olufemi-abiodun.gbolahan@st.tau.edu.ng
- All tests pass
- Emails appear in inbox (or spam)

**If It Fails**:
1. Check RESEND_API_KEY in .env
2. Check backend logs for errors
3. Check Resend dashboard
4. Verify domain if needed

---

**Ready to test!** Run the script and let me know if you receive the emails. 📧
